import csv
import uuid
from decimal import Decimal

from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import ParentProfile
from accounts.permissions import IsParent, IsStaffAdmin
from fees.models import StudentFee
from payments.models import PaymentItem, PaymentTransaction, WebhookEventLog
from payments.serializers import (
    InitiatePaymentSerializer,
    ManualPaymentSerializer,
    PaymentTransactionSerializer,
)
from payments.services.settlement import settle_transaction
from payments.services.sikinapay import SikinapayClient
from students.models import ParentStudentLink, Student

sikinapay_client = SikinapayClient()


class InitiatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsParent]

    @transaction.atomic
    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student_id = serializer.validated_data["student_id"]
        student_fee_ids = serializer.validated_data["student_fee_ids"]

        parent = ParentProfile.objects.select_related("user").get(user=request.user)
        if not ParentStudentLink.objects.filter(parent=parent, student_id=student_id).exists():
            return Response(
                {"detail": "This student is not linked to your parent account."},
                status=status.HTTP_403_FORBIDDEN,
            )

        student = Student.objects.get(pk=student_id)
        fees = (
            StudentFee.objects.select_for_update()
            .select_related("category")
            .filter(id__in=student_fee_ids, student=student)
        )
        if fees.count() != len(set(student_fee_ids)):
            return Response({"detail": "One or more fee items are invalid."}, status=status.HTTP_400_BAD_REQUEST)

        payable_fees = [fee for fee in fees if fee.outstanding_amount > Decimal("0.00")]
        if not payable_fees:
            return Response({"detail": "Selected fees are already paid."}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = sum((fee.outstanding_amount for fee in payable_fees), Decimal("0.00"))
        tx_ref = f"SFP-{uuid.uuid4().hex[:16].upper()}"
        payment = PaymentTransaction.objects.create(
            tx_ref=tx_ref,
            parent=parent,
            student=student,
            amount=total_amount,
            status=PaymentTransaction.Status.INITIATED,
            provider=PaymentTransaction.Provider.SIKINAPAY,
        )

        for fee in payable_fees:
            PaymentItem.objects.create(
                transaction=payment,
                student_fee=fee,
                amount_applied=fee.outstanding_amount,
            )

        gateway_response = sikinapay_client.initiate_payment(
            tx_ref=payment.tx_ref,
            amount=str(payment.amount),
            customer_email=parent.user.email,
            customer_name=parent.user.full_name,
        )

        payment.checkout_url = gateway_response["checkout_url"]
        payment.gateway_transaction_id = gateway_response["transaction_id"]
        payment.gateway_payload = gateway_response["raw"]
        payment.status = PaymentTransaction.Status.PENDING
        payment.save(
            update_fields=[
                "checkout_url",
                "gateway_transaction_id",
                "gateway_payload",
                "status",
                "updated_at",
            ]
        )

        return Response(
            {
                "transaction": PaymentTransactionSerializer(payment).data,
                "message": "Payment initialized. Redirect the parent to checkout_url.",
            },
            status=status.HTTP_201_CREATED,
        )


class SikinapayWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    @transaction.atomic
    def post(self, request):
        incoming_signature = request.headers.get("X-Sikinapay-Signature", "")
        if not sikinapay_client.is_valid_signature(request.body, incoming_signature):
            return Response({"detail": "Invalid webhook signature."}, status=status.HTTP_400_BAD_REQUEST)

        payload = request.data if isinstance(request.data, dict) else {}
        tx_ref = payload.get("tx_ref") or payload.get("reference")
        event_reference = payload.get("event_id") or tx_ref or uuid.uuid4().hex

        event_log, created = WebhookEventLog.objects.get_or_create(
            provider=PaymentTransaction.Provider.SIKINAPAY,
            event_reference=event_reference,
            defaults={
                "signature": incoming_signature,
                "payload": payload,
            },
        )
        if not created and event_log.processed:
            return Response({"detail": "Webhook already processed."}, status=status.HTTP_200_OK)

        if not tx_ref:
            event_log.processed = True
            event_log.processed_at = timezone.now()
            event_log.save(update_fields=["processed", "processed_at"])
            return Response({"detail": "No tx_ref supplied."}, status=status.HTTP_200_OK)

        payment = (
            PaymentTransaction.objects.select_for_update()
            .filter(tx_ref=tx_ref)
            .first()
        )
        if payment is None:
            return Response({"detail": "Unknown transaction."}, status=status.HTTP_404_NOT_FOUND)

        verification = sikinapay_client.verify_payment(tx_ref)
        payment.gateway_payload = {**payment.gateway_payload, "webhook": payload, "verify": verification["raw"]}
        payment.save(update_fields=["gateway_payload", "updated_at"])

        if verification["status"] == "success":
            settle_transaction(payment, payment_method=verification.get("payment_method", ""))

        event_log.processed = True
        event_log.processed_at = timezone.now()
        event_log.payload = payload
        event_log.signature = incoming_signature
        event_log.save(update_fields=["processed", "processed_at", "payload", "signature"])
        return Response({"detail": "Webhook handled."}, status=status.HTTP_200_OK)


class ParentTransactionListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsParent]

    def get(self, request):
        parent = ParentProfile.objects.get(user=request.user)
        transactions = PaymentTransaction.objects.filter(parent=parent).select_related("student", "parent__user")
        return Response(PaymentTransactionSerializer(transactions, many=True).data)


class StaffTransactionListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStaffAdmin]

    def get(self, request):
        transactions = PaymentTransaction.objects.select_related("student", "parent__user").all()
        status_filter = request.query_params.get("status")
        if status_filter:
            transactions = transactions.filter(status=status_filter)
        return Response(PaymentTransactionSerializer(transactions, many=True).data)


class ManualPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStaffAdmin]

    @transaction.atomic
    def post(self, request):
        serializer = ManualPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student_id = serializer.validated_data["student_id"]
        student_fee_ids = serializer.validated_data["student_fee_ids"]
        note = serializer.validated_data.get("note", "")

        student = Student.objects.get(pk=student_id)
        fees = (
            StudentFee.objects.select_for_update()
            .filter(id__in=student_fee_ids, student=student)
            .select_related("student")
        )
        payable_fees = [fee for fee in fees if fee.outstanding_amount > Decimal("0.00")]
        if not payable_fees:
            return Response({"detail": "No outstanding fees selected."}, status=status.HTTP_400_BAD_REQUEST)

        linked_parent = ParentStudentLink.objects.filter(student=student).select_related("parent__user").first()
        if not linked_parent:
            return Response({"detail": "Student has no linked parent profile."}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = sum((fee.outstanding_amount for fee in payable_fees), Decimal("0.00"))
        payment = PaymentTransaction.objects.create(
            tx_ref=f"MANUAL-{uuid.uuid4().hex[:12].upper()}",
            provider=PaymentTransaction.Provider.MANUAL,
            parent=linked_parent.parent,
            student=student,
            amount=total_amount,
            status=PaymentTransaction.Status.PENDING,
            manual_marked_by=request.user,
            manual_note=note,
        )
        for fee in payable_fees:
            PaymentItem.objects.create(
                transaction=payment,
                student_fee=fee,
                amount_applied=fee.outstanding_amount,
            )

        settled = settle_transaction(payment, payment_method="manual")
        return Response(PaymentTransactionSerializer(settled).data, status=status.HTTP_201_CREATED)


class ExportTransactionsReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStaffAdmin]

    def get(self, request):
        transactions = PaymentTransaction.objects.select_related("student", "parent__user").all()
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="payment_transactions.csv"'

        writer = csv.writer(response)
        writer.writerow(
            [
                "tx_ref",
                "provider",
                "status",
                "amount",
                "currency",
                "parent",
                "student",
                "created_at",
                "paid_at",
            ]
        )

        for payment in transactions:
            writer.writerow(
                [
                    payment.tx_ref,
                    payment.provider,
                    payment.status,
                    payment.amount,
                    payment.currency,
                    payment.parent.user.full_name,
                    payment.student.full_name,
                    payment.created_at.isoformat(),
                    payment.paid_at.isoformat() if payment.paid_at else "",
                ]
            )
        return response

from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import ParentProfile
from fees.models import FeeCategory, StudentFee
from payments.models import PaymentTransaction
from students.models import ParentStudentLink, Student

User = get_user_model()


class PaymentFlowTests(APITestCase):
    def setUp(self):
        self.parent_user = User.objects.create_user(
            email="parent@example.com",
            full_name="Parent User",
            password="StrongPass123!",
            role=User.Role.PARENT,
        )
        self.parent_profile = ParentProfile.objects.create(user=self.parent_user)
        self.student = Student.objects.create(
            admission_number="ADM-101",
            first_name="Kid",
            last_name="One",
            class_name="Grade 5",
        )
        ParentStudentLink.objects.create(parent=self.parent_profile, student=self.student)
        self.category = FeeCategory.objects.create(name="Tuition", code="tuition")
        self.fee = StudentFee.objects.create(
            student=self.student,
            category=self.category,
            academic_year="2026/2027",
            term="Term 1",
            amount_due=Decimal("100.00"),
            amount_paid=Decimal("20.00"),
        )
        self.fee.sync_status()
        self.fee.save(update_fields=["status"])

    @patch("payments.views.sikinapay_client.initiate_payment")
    def test_initiate_payment_uses_server_side_outstanding_amount(self, mocked_init):
        mocked_init.return_value = {
            "checkout_url": "http://checkout.local",
            "transaction_id": "txn-001",
            "raw": {"ok": True},
        }
        self.client.force_authenticate(self.parent_user)
        url = reverse("initiate-payment")
        response = self.client.post(
            url,
            {
                "student_id": self.student.id,
                "student_fee_ids": [self.fee.id],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data["transaction"]["amount"]), Decimal("80.00"))

    @patch("payments.views.sikinapay_client.verify_payment")
    @patch("payments.views.sikinapay_client.is_valid_signature")
    def test_webhook_is_idempotent(self, mocked_sig, mocked_verify):
        mocked_sig.return_value = True
        mocked_verify.return_value = {
            "status": "success",
            "payment_method": "card",
            "raw": {"status": "success"},
        }
        payment = PaymentTransaction.objects.create(
            tx_ref="SFP-TESTTX",
            parent=self.parent_profile,
            student=self.student,
            amount=Decimal("80.00"),
            provider=PaymentTransaction.Provider.SIKINAPAY,
            status=PaymentTransaction.Status.PENDING,
        )
        payment.payment_items.create(student_fee=self.fee, amount_applied=Decimal("80.00"))

        webhook_url = reverse("sikinapay-webhook")
        payload = {"event_id": "evt-001", "tx_ref": payment.tx_ref}
        first = self.client.post(webhook_url, payload, format="json")
        second = self.client.post(webhook_url, payload, format="json")

        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(second.status_code, status.HTTP_200_OK)

        payment.refresh_from_db()
        self.fee.refresh_from_db()
        self.assertEqual(payment.status, PaymentTransaction.Status.SUCCESS)
        self.assertEqual(self.fee.amount_paid, Decimal("100.00"))

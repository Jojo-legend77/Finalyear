from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from fees.models import StudentFee
from payments.models import PaymentTransaction
from payments.services.receipt import generate_receipt_pdf


@transaction.atomic
def settle_transaction(payment: PaymentTransaction, payment_method: str = "") -> PaymentTransaction:
    payment = PaymentTransaction.objects.select_for_update().get(pk=payment.pk)

    if payment.status == PaymentTransaction.Status.SUCCESS:
        return payment

    items = payment.payment_items.select_related("student_fee").all()
    for item in items:
        fee = StudentFee.objects.select_for_update().get(pk=item.student_fee_id)
        outstanding = fee.outstanding_amount
        if outstanding <= Decimal("0.00"):
            continue

        applied = item.amount_applied if item.amount_applied <= outstanding else outstanding
        fee.amount_paid += applied
        fee.sync_status()
        fee.save(update_fields=["amount_paid", "status"])

    payment.status = PaymentTransaction.Status.SUCCESS
    payment.payment_method = payment_method
    payment.paid_at = timezone.now()
    payment.save(update_fields=["status", "payment_method", "paid_at", "updated_at"])
    generate_receipt_pdf(payment)
    return payment

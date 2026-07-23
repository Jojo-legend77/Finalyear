from django.conf import settings
from django.db import models

from accounts.models import ParentProfile
from fees.models import StudentFee
from students.models import Student


class PaymentTransaction(models.Model):
    class Provider(models.TextChoices):
        SIKINAPAY = "sikinapay", "SIKINAPAY"
        MANUAL = "manual", "Manual"

    class Status(models.TextChoices):
        INITIATED = "initiated", "Initiated"
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"

    tx_ref = models.CharField(max_length=100, unique=True)
    provider = models.CharField(max_length=20, choices=Provider.choices, default=Provider.SIKINAPAY)
    parent = models.ForeignKey(ParentProfile, on_delete=models.PROTECT, related_name="transactions")
    student = models.ForeignKey(Student, on_delete=models.PROTECT, related_name="transactions")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default="ETB")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.INITIATED)
    checkout_url = models.URLField(blank=True)
    gateway_transaction_id = models.CharField(max_length=120, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    receipt_file = models.FileField(upload_to="receipts/", blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    manual_marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    manual_note = models.TextField(blank=True)
    gateway_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.tx_ref} - {self.status}"


class PaymentItem(models.Model):
    transaction = models.ForeignKey(
        PaymentTransaction, on_delete=models.CASCADE, related_name="payment_items"
    )
    student_fee = models.ForeignKey(StudentFee, on_delete=models.PROTECT, related_name="payment_items")
    amount_applied = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["transaction", "student_fee"], name="unique_transaction_student_fee"
            )
        ]

    def __str__(self) -> str:
        return f"{self.transaction.tx_ref} -> {self.student_fee_id}"


class WebhookEventLog(models.Model):
    provider = models.CharField(max_length=40)
    event_reference = models.CharField(max_length=120)
    signature = models.CharField(max_length=255, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["provider", "event_reference"],
                name="unique_provider_event_reference",
            )
        ]

    def __str__(self) -> str:
        return f"{self.provider}:{self.event_reference}"

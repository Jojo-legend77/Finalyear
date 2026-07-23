from decimal import Decimal

from django.db import models

from students.models import Student


class FeeCategory(models.Model):
    name = models.CharField(max_length=80, unique=True)
    code = models.SlugField(max_length=40, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class StudentFee(models.Model):
    class Status(models.TextChoices):
        OUTSTANDING = "outstanding", "Outstanding"
        PARTIAL = "partial", "Partial"
        PAID = "paid", "Paid"

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="fees")
    category = models.ForeignKey(FeeCategory, on_delete=models.PROTECT, related_name="student_fees")
    academic_year = models.CharField(max_length=20)
    term = models.CharField(max_length=20)
    due_date = models.DateField(null=True, blank=True)
    amount_due = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OUTSTANDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "category", "academic_year", "term"],
                name="unique_student_fee_cycle",
            )
        ]

    @property
    def outstanding_amount(self) -> Decimal:
        outstanding = self.amount_due - self.amount_paid
        return outstanding if outstanding > Decimal("0.00") else Decimal("0.00")

    def sync_status(self) -> None:
        if self.amount_paid <= 0:
            self.status = self.Status.OUTSTANDING
        elif self.amount_paid >= self.amount_due:
            self.status = self.Status.PAID
        else:
            self.status = self.Status.PARTIAL

    def __str__(self) -> str:
        return f"{self.student.full_name} - {self.category.name} ({self.term}/{self.academic_year})"

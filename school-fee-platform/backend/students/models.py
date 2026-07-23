from django.db import models

from accounts.models import ParentProfile


class Student(models.Model):
    admission_number = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    class_name = models.CharField(max_length=50)
    section = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["first_name", "last_name"]

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __str__(self) -> str:
        return f"{self.full_name} ({self.admission_number})"


class ParentStudentLink(models.Model):
    parent = models.ForeignKey(ParentProfile, on_delete=models.CASCADE, related_name="children_links")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="parent_links")
    relationship = models.CharField(max_length=50, default="Guardian")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["parent", "student"], name="unique_parent_student")
        ]

    def __str__(self) -> str:
        return f"{self.parent.user.full_name} -> {self.student.full_name}"

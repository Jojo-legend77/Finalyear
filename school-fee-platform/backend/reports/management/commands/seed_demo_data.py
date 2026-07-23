from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from accounts.models import ParentProfile
from fees.models import FeeCategory, StudentFee
from students.models import ParentStudentLink, Student

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds demo parent/student/fees data for local testing."

    def handle(self, *args, **options):
        parent_user, _ = User.objects.get_or_create(
            email="parent@demo.com",
            defaults={
                "full_name": "Demo Parent",
                "role": User.Role.PARENT,
            },
        )
        parent_user.set_password("DemoPass123!")
        parent_user.save()
        parent_profile, _ = ParentProfile.objects.get_or_create(user=parent_user)

        staff_user, created = User.objects.get_or_create(
            email="staff@demo.com",
            defaults={
                "full_name": "Finance Staff",
                "role": User.Role.STAFF_ADMIN,
                "is_staff": True,
            },
        )
        if created:
            staff_user.set_password("DemoPass123!")
            staff_user.save()

        tuition, _ = FeeCategory.objects.get_or_create(name="Tuition", code="tuition")
        transport, _ = FeeCategory.objects.get_or_create(name="Transport", code="transport")
        exam, _ = FeeCategory.objects.get_or_create(name="Exam Fees", code="exam-fees")

        student_1, _ = Student.objects.get_or_create(
            admission_number="ADM-001",
            defaults={
                "first_name": "Abel",
                "last_name": "Bekele",
                "class_name": "Grade 6",
                "section": "A",
            },
        )
        student_2, _ = Student.objects.get_or_create(
            admission_number="ADM-002",
            defaults={
                "first_name": "Meklit",
                "last_name": "Bekele",
                "class_name": "Grade 3",
                "section": "B",
            },
        )
        ParentStudentLink.objects.get_or_create(parent=parent_profile, student=student_1)
        ParentStudentLink.objects.get_or_create(parent=parent_profile, student=student_2)

        default_fees = [
            (student_1, tuition, Decimal("12000.00")),
            (student_1, transport, Decimal("3000.00")),
            (student_1, exam, Decimal("1500.00")),
            (student_2, tuition, Decimal("9000.00")),
            (student_2, transport, Decimal("2500.00")),
            (student_2, exam, Decimal("1200.00")),
        ]
        for student, category, amount in default_fees:
            fee, _ = StudentFee.objects.get_or_create(
                student=student,
                category=category,
                academic_year="2026/2027",
                term="Term 1",
                defaults={"amount_due": amount, "amount_paid": Decimal("0.00")},
            )
            fee.sync_status()
            fee.save(update_fields=["status"])

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))

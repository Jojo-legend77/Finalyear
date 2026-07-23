from decimal import Decimal

from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import ParentProfile
from accounts.permissions import IsParent, IsStaffAdmin
from fees.serializers import StudentFeeSerializer
from payments.models import PaymentTransaction
from payments.serializers import PaymentTransactionSerializer
from students.models import ParentStudentLink, Student
from students.serializers import StudentSerializer


class ParentDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsParent]

    def get(self, request):
        parent = ParentProfile.objects.get(user=request.user)
        links = ParentStudentLink.objects.filter(parent=parent).select_related("student")

        children_payload = []
        for link in links:
            student = link.student
            fees = list(student.fees.select_related("category").all())
            total_due = sum((fee.amount_due for fee in fees), Decimal("0.00"))
            total_paid = sum((fee.amount_paid for fee in fees), Decimal("0.00"))
            total_outstanding = sum((fee.outstanding_amount for fee in fees), Decimal("0.00"))
            transactions = PaymentTransaction.objects.filter(parent=parent, student=student).select_related(
                "student", "parent__user"
            )

            children_payload.append(
                {
                    "relationship": link.relationship,
                    "student": StudentSerializer(student).data,
                    "fees": StudentFeeSerializer(fees, many=True).data,
                    "summary": {
                        "total_due": total_due,
                        "total_paid": total_paid,
                        "total_outstanding": total_outstanding,
                    },
                    "transactions": PaymentTransactionSerializer(transactions, many=True).data,
                }
            )

        return Response(
            {
                "parent": {
                    "id": parent.id,
                    "name": parent.user.full_name,
                    "email": parent.user.email,
                },
                "children": children_payload,
            }
        )


class StaffOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStaffAdmin]

    def get(self, request):
        transactions = PaymentTransaction.objects.select_related("student", "parent__user").all()
        students = Student.objects.count()
        paid = transactions.filter(status=PaymentTransaction.Status.SUCCESS).count()
        pending = transactions.filter(status=PaymentTransaction.Status.PENDING).count()
        failed = transactions.filter(status=PaymentTransaction.Status.FAILED).count()

        return Response(
            {
                "students_count": students,
                "transactions_count": transactions.count(),
                "successful_payments": paid,
                "pending_payments": pending,
                "failed_payments": failed,
            }
        )

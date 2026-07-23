from rest_framework import serializers

from fees.models import FeeCategory, StudentFee


class FeeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeCategory
        fields = ("id", "name", "code")


class StudentFeeSerializer(serializers.ModelSerializer):
    category = FeeCategorySerializer(read_only=True)
    outstanding_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = StudentFee
        fields = (
            "id",
            "category",
            "academic_year",
            "term",
            "due_date",
            "amount_due",
            "amount_paid",
            "outstanding_amount",
            "status",
        )

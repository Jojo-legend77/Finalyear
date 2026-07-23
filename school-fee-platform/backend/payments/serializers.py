from rest_framework import serializers

from payments.models import PaymentTransaction


class InitiatePaymentSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_fee_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1), allow_empty=False
    )


class ManualPaymentSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_fee_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1), allow_empty=False
    )
    note = serializers.CharField(required=False, allow_blank=True)


class PaymentTransactionSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source="parent.user.full_name", read_only=True)
    student_name = serializers.CharField(source="student.full_name", read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = (
            "id",
            "tx_ref",
            "provider",
            "status",
            "amount",
            "currency",
            "student_name",
            "parent_name",
            "checkout_url",
            "receipt_file",
            "created_at",
            "paid_at",
        )

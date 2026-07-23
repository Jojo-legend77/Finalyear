from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from accounts.models import ParentProfile

User = get_user_model()


class ParentRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    phone_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    address = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("email", "full_name", "password", "phone_number", "address")

    def create(self, validated_data):
        phone_number = validated_data.pop("phone_number", "")
        address = validated_data.pop("address", "")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            **validated_data,
            password=password,
            role=User.Role.PARENT,
            is_active=True,
        )
        ParentProfile.objects.create(user=user, phone_number=phone_number, address=address)
        return user


class ParentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = ParentProfile
        fields = ("id", "email", "full_name", "phone_number", "address")


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["full_name"] = user.full_name
        return token

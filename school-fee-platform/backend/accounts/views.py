from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from accounts.models import ParentProfile
from accounts.serializers import (
    EmailTokenObtainPairSerializer,
    ParentProfileSerializer,
    ParentRegistrationSerializer,
)


class ParentRegisterView(generics.CreateAPIView):
    serializer_class = ParentRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class MeView(APIView):
    def get(self, request):
        if request.user.role == "parent":
            profile = ParentProfile.objects.select_related("user").get(user=request.user)
            return Response(
                {
                    "role": request.user.role,
                    "profile": ParentProfileSerializer(profile).data,
                }
            )

        return Response(
            {
                "role": request.user.role,
                "profile": {
                    "id": request.user.id,
                    "email": request.user.email,
                    "full_name": request.user.full_name,
                },
            }
        )

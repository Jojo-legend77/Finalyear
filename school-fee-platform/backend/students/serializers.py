from rest_framework import serializers

from students.models import ParentStudentLink, Student


class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Student
        fields = ("id", "admission_number", "full_name", "class_name", "section", "is_active")


class ParentStudentLinkSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)

    class Meta:
        model = ParentStudentLink
        fields = ("id", "relationship", "student")

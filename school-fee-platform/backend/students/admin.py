from django.contrib import admin

from students.models import ParentStudentLink, Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("admission_number", "first_name", "last_name", "class_name", "section", "is_active")
    search_fields = ("admission_number", "first_name", "last_name", "class_name")
    list_filter = ("class_name", "is_active")


@admin.register(ParentStudentLink)
class ParentStudentLinkAdmin(admin.ModelAdmin):
    list_display = ("parent", "student", "relationship", "created_at")
    search_fields = ("parent__user__full_name", "student__first_name", "student__last_name")

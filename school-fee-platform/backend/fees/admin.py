from django.contrib import admin

from fees.models import FeeCategory, StudentFee


@admin.register(FeeCategory)
class FeeCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "is_active")
    search_fields = ("name", "code")
    list_filter = ("is_active",)


@admin.register(StudentFee)
class StudentFeeAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "category",
        "academic_year",
        "term",
        "amount_due",
        "amount_paid",
        "status",
    )
    search_fields = ("student__first_name", "student__last_name", "category__name", "academic_year", "term")
    list_filter = ("status", "academic_year", "term", "category")

from django.contrib import admin

from payments.models import PaymentItem, PaymentTransaction, WebhookEventLog


class PaymentItemInline(admin.TabularInline):
    model = PaymentItem
    extra = 0
    readonly_fields = ("student_fee", "amount_applied")


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ("tx_ref", "provider", "status", "amount", "student", "parent", "created_at", "paid_at")
    search_fields = ("tx_ref", "student__first_name", "student__last_name", "parent__user__full_name")
    list_filter = ("provider", "status", "created_at")
    inlines = [PaymentItemInline]


@admin.register(WebhookEventLog)
class WebhookEventLogAdmin(admin.ModelAdmin):
    list_display = ("provider", "event_reference", "processed", "created_at", "processed_at")
    search_fields = ("provider", "event_reference")
    list_filter = ("provider", "processed")

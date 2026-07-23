from django.urls import path

from payments.views import (
    ExportTransactionsReportView,
    InitiatePaymentView,
    ManualPaymentView,
    ParentTransactionListView,
    SikinapayWebhookView,
    StaffTransactionListView,
)

urlpatterns = [
    path("initiate/", InitiatePaymentView.as_view(), name="initiate-payment"),
    path("history/", ParentTransactionListView.as_view(), name="parent-transactions"),
    path("sikinapay/webhook/", SikinapayWebhookView.as_view(), name="sikinapay-webhook"),
    path("staff/transactions/", StaffTransactionListView.as_view(), name="staff-transactions"),
    path("staff/manual/", ManualPaymentView.as_view(), name="staff-manual-payment"),
    path("staff/export/", ExportTransactionsReportView.as_view(), name="staff-export-payments"),
]

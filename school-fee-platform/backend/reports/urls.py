from django.urls import path

from reports.views import ParentDashboardView, StaffOverviewView

urlpatterns = [
    path("parent/dashboard/", ParentDashboardView.as_view(), name="parent-dashboard"),
    path("staff/overview/", StaffOverviewView.as_view(), name="staff-overview"),
]

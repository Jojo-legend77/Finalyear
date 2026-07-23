from io import BytesIO

from django.core.files.base import ContentFile
from django.utils import timezone
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from payments.models import PaymentTransaction


def generate_receipt_pdf(transaction: PaymentTransaction) -> None:
    if transaction.receipt_file:
        return

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    lines = [
        "School Fee Payment Receipt",
        f"Reference: {transaction.tx_ref}",
        f"Date: {timezone.localtime(transaction.paid_at or timezone.now()).strftime('%Y-%m-%d %H:%M:%S')}",
        f"Parent: {transaction.parent.user.full_name}",
        f"Student: {transaction.student.full_name}",
        f"Amount: {transaction.amount} {transaction.currency}",
        f"Provider: {transaction.provider}",
        f"Status: {transaction.status}",
    ]

    y = height - 72
    for line in lines:
        pdf.drawString(72, y, line)
        y -= 24

    pdf.drawString(72, y - 12, "Thank you for your payment.")
    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    file_name = f"receipt_{transaction.tx_ref}.pdf"
    transaction.receipt_file.save(file_name, ContentFile(buffer.read()), save=True)

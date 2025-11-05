"""
Invoice Service
Generate PDF invoices for subscriptions
"""
from typing import Dict
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import os


class InvoiceService:
    """Service for generating invoices"""
    
    def __init__(self):
        self.invoice_dir = os.getenv("INVOICE_DIR", "/tmp/invoices")
        os.makedirs(self.invoice_dir, exist_ok=True)
    
    def generate_invoice(self, subscription) -> Dict:
        """
        Generate PDF invoice for subscription
        
        Returns invoice URL
        """
        invoice_number = f"INV-{subscription.id[:8].upper()}-{datetime.utcnow().strftime('%Y%m%d')}"
        filename = f"{invoice_number}.pdf"
        filepath = os.path.join(self.invoice_dir, filename)
        
        # Create PDF
        c = canvas.Canvas(filepath, pagesize=letter)
        width, height = letter
        
        # Header
        c.setFont("Helvetica-Bold", 20)
        c.drawString(50, height - 50, "RateTheDoctor")
        c.setFont("Helvetica", 12)
        c.drawString(50, height - 70, "Invoice")
        
        # Invoice details
        y = height - 100
        c.setFont("Helvetica", 10)
        c.drawString(50, y, f"Invoice Number: {invoice_number}")
        y -= 20
        c.drawString(50, y, f"Date: {datetime.utcnow().strftime('%Y-%m-%d')}")
        y -= 20
        c.drawString(50, y, f"Subscription Plan: {subscription.plan.upper()}")
        y -= 20
        c.drawString(50, y, f"Billing Cycle: {subscription.billing_cycle or 'monthly'}")
        
        # Line items
        y -= 40
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, "Description")
        c.drawString(400, y, "Amount")
        y -= 20
        c.line(50, y, 550, y)
        y -= 20
        
        c.setFont("Helvetica", 10)
        c.drawString(50, y, f"{subscription.plan.upper()} Plan - {subscription.billing_cycle}")
        c.drawString(400, y, f"R {subscription.amount:.2f}")
        
        # Total
        y -= 30
        c.line(50, y, 550, y)
        y -= 20
        c.setFont("Helvetica-Bold", 12)
        c.drawString(400, y, f"Total: R {subscription.amount:.2f}")
        
        # Footer
        y = 100
        c.setFont("Helvetica", 8)
        c.drawString(50, y, "Thank you for your subscription!")
        
        c.save()
        
        # Upload to S3 (in production)
        # s3_url = upload_to_s3(filepath, filename)
        
        return {
            "invoice_number": invoice_number,
            "url": f"/invoices/{filename}",  # or S3 URL
            "filepath": filepath
        }


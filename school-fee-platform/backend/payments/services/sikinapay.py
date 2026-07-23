import hashlib
import hmac
from typing import Any

import requests
from django.conf import settings


class SikinapayClient:
    def __init__(self):
        self.base_url = settings.SIKINAPAY_BASE_URL.rstrip("/")
        self.secret_key = settings.SIKINAPAY_SECRET_KEY
        self.callback_url = settings.SIKINAPAY_CALLBACK_URL
        self.return_url = settings.SIKINAPAY_RETURN_URL
        self.mock_mode = settings.SIKINAPAY_MOCK_MODE

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.secret_key:
            headers["Authorization"] = f"Bearer {self.secret_key}"
        return headers

    def initiate_payment(self, tx_ref: str, amount: str, customer_email: str, customer_name: str) -> dict[str, Any]:
        if self.mock_mode:
            return {
                "checkout_url": f"http://localhost:3000/mock-checkout?tx_ref={tx_ref}",
                "transaction_id": f"mock-{tx_ref}",
                "raw": {"mock": True},
            }

        payload = {
            "tx_ref": tx_ref,
            "amount": amount,
            "currency": "ETB",
            "callback_url": self.callback_url,
            "return_url": self.return_url,
            "customer": {"email": customer_email, "name": customer_name},
        }
        response = requests.post(
            f"{self.base_url}/payments/initialize",
            json=payload,
            headers=self._headers(),
            timeout=15,
        )
        response.raise_for_status()
        body = response.json()
        data = body.get("data", body)
        return {
            "checkout_url": data.get("checkout_url") or data.get("payment_url", ""),
            "transaction_id": data.get("id") or data.get("transaction_id", ""),
            "raw": body,
        }

    def verify_payment(self, tx_ref: str) -> dict[str, Any]:
        if self.mock_mode:
            return {"status": "success", "payment_method": "mock", "raw": {"mock": True}}

        response = requests.get(
            f"{self.base_url}/payments/verify/{tx_ref}",
            headers=self._headers(),
            timeout=15,
        )
        response.raise_for_status()
        body = response.json()
        data = body.get("data", body)
        return {
            "status": (data.get("status") or "").lower(),
            "payment_method": data.get("payment_method", ""),
            "raw": body,
        }

    def is_valid_signature(self, raw_body: bytes, incoming_signature: str) -> bool:
        webhook_secret = settings.SIKINAPAY_WEBHOOK_SECRET
        if not webhook_secret:
            return True
        expected_signature = hmac.new(
            webhook_secret.encode("utf-8"),
            msg=raw_body,
            digestmod=hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected_signature, incoming_signature or "")

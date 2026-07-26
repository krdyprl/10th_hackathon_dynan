import os
import requests

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")

def send_alert_email(contact_email: str, contact_name: str, user_name: str, stress_score: int):
    if not RESEND_API_KEY:
        return {"status": "skipped", "reason": "No RESEND_API_KEY configured"}

    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": "InkTrace AI <noreply@inktrace.ai>",
                "to": [contact_email],
                "subject": f"[InkTrace AI] {user_name} mungkin membutuhkan dukungan Anda",
                "html": f"""
                <h2>Halo {contact_name},</h2>
                <p>{user_name} menunjukkan tingkat stres tinggi ({stress_score}/100) setelah menulis jurnal hari ini.</p>
                <p>Berikan sapaan hangat atau hubungi mereka untuk sekadar bertanya kabar.</p>
                <hr/>
                <p style="color:#898989;font-size:12px;">Pesan ini dikirim otomatis oleh InkTrace AI. Isi jurnal pribadi tidak dibagikan.</p>
                """
            },
            timeout=15
        )
        resp.raise_for_status()
        return {"status": "sent", "to": contact_email}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


def notify_trusted_circle(user_name: str, stress_score: int, contacts: list):
    results = []
    for contact in contacts:
        if contact.get("type") == "email":
            result = send_alert_email(
                contact_email=contact["value"],
                contact_name=contact["name"],
                user_name=user_name,
                stress_score=stress_score
            )
            results.append(result)
        elif contact.get("type") == "whatsapp":
            results.append({"status": "simulated", "to": contact["value"], "note": "WA gateway not yet integrated"})
    return results

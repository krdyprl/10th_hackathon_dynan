import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'), override=True)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
# Resend gratis membutuhkan onboarding@resend.dev sebagai pengirim jika domain sendiri belum diverifikasi
FROM_EMAIL = os.environ.get("RESEND_FROM_EMAIL", "InkTrace AI <onboarding@resend.dev>")


def send_alert_email(
    contact_email: str,
    contact_name: str,
    user_name: str,
    stress_score: int,
    custom_message: str = None,
):
    if not RESEND_API_KEY:
        print("WARNING: RESEND_API_KEY not configured — skipping email")
        return {"status": "skipped", "reason": "No RESEND_API_KEY configured"}

    level = "tinggi" if stress_score >= 70 else "sedang" if stress_score >= 40 else "normal"
    level_color = "#ef4444" if stress_score >= 70 else "#f59e0b" if stress_score >= 40 else "#22c55e"

    personal_note = ""
    if custom_message:
        personal_note = f"""
        <div style="margin:16px 0;padding:14px 16px;background:#f9f9f9;border-left:4px solid {level_color};border-radius:6px;">
          <p style="margin:0;font-size:14px;color:#374151;font-style:italic;">"{custom_message}"</p>
        </div>
        """

    html_body = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:28px;">💜</span>
        <h2 style="margin:8px 0;font-size:20px;">InkTrace AI</h2>
        <p style="color:#888;font-size:13px;margin:0;">Sistem Early Self-Awareness</p>
      </div>

      <p style="font-size:15px;">Halo <strong>{contact_name}</strong>,</p>
      <p style="font-size:14px;color:#374151;line-height:1.6;">
        <strong>{user_name}</strong> telah memberi tahu kamu melalui InkTrace AI dan mungkin membutuhkan dukungan hari ini.
      </p>

      <div style="background:#f3f4f6;border-radius:12px;padding:16px;margin:16px 0;text-align:center;">
        <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Tingkat Stres Terdeteksi</p>
        <p style="margin:4px 0 0;font-size:32px;font-weight:700;color:{level_color};">{stress_score}<span style="font-size:16px;">/100</span></p>
        <p style="margin:4px 0 0;font-size:13px;color:{level_color};font-weight:600;">{level.upper()}</p>
      </div>

      {personal_note}

      <p style="font-size:14px;color:#374151;line-height:1.6;">
        Kamu tidak perlu melakukan apa-apa yang besar — cukup kirimkan sapaan hangat atau tanyakan kabar mereka. Kehadiranmu berarti. 🫶
      </p>

      <div style="text-align:center;margin-top:24px;">
        <a href="mailto:{user_name}" style="display:inline-block;background:#7c3aed;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
          Balas dengan Email
        </a>
      </div>

      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;"/>
      <p style="font-size:11px;color:#aaa;text-align:center;">
        Pesan ini dikirim karena {user_name} memilih kamu sebagai bagian dari Trusted Circle mereka di InkTrace AI.<br/>
        Isi jurnal pribadi tidak dibagikan.
      </p>
    </div>
    """

    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": FROM_EMAIL,
                "to": [contact_email],
                "subject": f"💜 {user_name} mungkin membutuhkan dukunganmu hari ini",
                "html": html_body,
            },
            timeout=15,
        )
        resp.raise_for_status()
        print(f"Email sent to {contact_email}: {resp.status_code}")
        return {"status": "sent", "to": contact_email}
    except Exception as e:
        print(f"Email failed to {contact_email}: {e}")
        return {"status": "failed", "error": str(e), "to": contact_email}


def notify_trusted_circle(
    user_name: str,
    stress_score: int,
    contacts: list,
    custom_message: str = None,
):
    """
    contacts: list of dicts dengan keys 'name', 'type', 'value'
    ATAU keys 'contact_name', 'contact_type', 'contact_value' (raw Supabase rows)
    """
    results = []
    for contact in contacts:
        # Support kedua format: normalized {name/type/value} dan raw Supabase {contact_name/type/value}
        ctype = contact.get("type") or contact.get("contact_type", "")
        cvalue = contact.get("value") or contact.get("contact_value", "")
        cname = contact.get("name") or contact.get("contact_name", "")

        if ctype == "email" and cvalue:
            result = send_alert_email(
                contact_email=cvalue,
                contact_name=cname,
                user_name=user_name,
                stress_score=stress_score,
                custom_message=custom_message,
            )
            results.append(result)
        elif ctype == "whatsapp":
            results.append({
                "status": "simulated",
                "to": cvalue,
                "note": "WhatsApp gateway belum diintegrasikan",
            })
        else:
            results.append({"status": "skipped", "reason": f"Unknown type: {ctype}", "to": cvalue})
    return results

import os
from groq import Groq

SYSTEM_PROMPT = """Kamu adalah teman yang suportif, bukan AI companion permanen.

Tujuanmu: menenangkan pengguna yang sedang mengalami stres atau emosi negatif.

Aturan:
1. Jangan pernah memberikan diagnosis medis (depresi, anxiety, bipolar, dll)
2. Jangan jadi tempat curhat permanen — tujuanmu adalah membantu user kembali ke manusia nyata
3. Jika user sudah terasa tenang (stabil), sarankan untuk ngobrol dengan orang terdekat
4. Tawarkan bantuan untuk membuat draft pesan ke Trusted Circle jika sesuai
5. Jawab dengan hangat, singkat (max 2-3 kalimat), dan penuh empati
6. Maksimal 5 exchange percakapan, setelah itu ingatkan user untuk terhubung dengan dunia nyata
7. Jika user menunjukkan krisis (bunuh diri, menyakiti diri), berikan nomor hotline krisis Indonesia: Kemenkes 119 ext 8, Into The Light (intothelightid.org), Yayasan Pulih (pulihfoundation.org)

Gunakan bahasa Indonesia yang santai dan hangat, seperti teman bicara."""


def get_companion_response(messages: list, stress_score: int = None) -> dict:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return {
            "reply": "Aku di sini untukmu. Ceritakan apa yang kamu rasakan.",
            "is_stable": False,
            "is_crisis": False,
        }

    try:
        client = Groq(api_key=api_key)

        groq_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in messages[-5:]:
            groq_messages.append({"role": msg["role"], "content": msg["content"]})

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=groq_messages,
            temperature=0.7,
            max_tokens=200,
        )

        reply = completion.choices[0].message.content.strip()

        stability_keywords = ["tenang", "lebih baik", "membaik", "mulai tenang", "sudah cukup", "terima kasih"]
        crisis_keywords = ["bunuh diri", "menyerah", "akhiri hidup", "mati saja", "ingin mati", "self-harm"]
        text_lower = reply.lower()

        is_crisis = any(k in text_lower for k in crisis_keywords) or any(
            k in (messages[-1]["content"].lower() if messages else "") for k in crisis_keywords
        )
        is_stable = any(k in text_lower for k in stability_keywords)

        return {
            "reply": reply,
            "is_stable": is_stable,
            "is_crisis": is_crisis,
        }
    except Exception as e:
        return {
            "reply": "Maaf, aku sedang kesulitan merespon. Tapi aku di sini untukmu. Coba ceritakan lagi?",
            "is_stable": False,
            "is_crisis": False,
        }

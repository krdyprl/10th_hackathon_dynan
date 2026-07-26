import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()


genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


image_analysis_model = genai.GenerativeModel('gemini-3.1-flash-lite')


def analyze_handwriting(img):

    response = image_analysis_model.generate_content(["Analyze this handwriting image and provide a concise interpretation. Focus on characteristics like line pressure, spacing, and size variations, and explain what they suggest about the writer's emotional or mental state. Return the interpretation as plain text, without any markdown or special formatting.", img])

    return response.text

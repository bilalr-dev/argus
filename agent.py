import os
import re
from google import genai
from google.genai import errors

_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

_PROMPT_TEMPLATE = """
You are an expert code reviewer. Review the following code diff.
Focus strictly on logic bugs, performance, security, style, and missing error handling.

Return the exact format below, substituting N with the total number of issues in each category:
🔴 Critical Issues (N)
[Describe critical issues here]
🟡 Medium Issues (N)
[Describe medium issues here]
✅ Positive Feedback
[Provide positive feedback here]
Summary
[Provide a brief summary here]

Code Diff:
{diff}
"""

def review_code(diff: str) -> str:
    if not diff.strip():
        raise ValueError("Diff is empty")
    prompt = _PROMPT_TEMPLATE.format(diff=diff)
    try:
        response = _client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
    except errors.ClientError as e:
        if "RESOURCE_EXHAUSTED" in str(e):
            raise RuntimeError("Please try again later.") from e
        raise
    if not response.text:
        raise RuntimeError("Gemini returned an empty response")
    return response.text

def count_issues(review_text: str) -> int:
    crit_match = re.search(r"Critical Issues \((\d+)\)", review_text)
    crit_count = int(crit_match.group(1)) if crit_match else 0
    med_match = re.search(r"Medium Issues \((\d+)\)", review_text)
    med_count = int(med_match.group(1)) if med_match else 0
    return crit_count + med_count

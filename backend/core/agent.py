from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")
import os
import re
from google import genai
from google.genai import errors

def _validate_api_key() -> None:
    """Raise RuntimeError if GOOGLE_API_KEY is not set in the environment."""
    if not os.getenv("GOOGLE_API_KEY"):
        raise RuntimeError("GOOGLE_API_KEY environment variable is not set")


_validate_api_key()

_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

_PROMPT_TEMPLATE = """You are a senior software engineer doing a
thorough code review. Your standard: does this change leave the
codebase in a better state than it found it?

Analyze the diff like a combination of SonarQube + a senior engineer.
Review every changed file. Be specific — reference exact file paths,
line numbers, and variable names. Never invent issues not visible
in the diff.

---

## STEP 1 — BROAD VIEW
Before diving into lines, answer briefly:
- Does the change make sense in scope?
- Is the commit focused on one logical change?
- Any obvious architectural problems?

---

## WHAT TO LOOK FOR

### SECURITY (always check first)
- SQL/command/LDAP injection risks
- Hardcoded secrets, API keys, passwords, tokens
- Missing input validation or sanitization
- Authentication and authorization flaws
- Sensitive data in logs or error messages
- Insecure use of cryptography
- OWASP Top 10 patterns

### BUGS & CORRECTNESS
- Logic errors, off-by-one errors
- Null/None dereferences
- Incorrect error handling (swallowed exceptions, wrong types)
- Unreachable or dead code
- Missing edge cases (empty input, zero, negative, None)
- Race conditions or shared mutable state
- Wrong variable used in a computation

### CODE SMELLS
- Functions longer than 25 lines (Single Responsibility violation)
- More than 4 parameters in a function signature
- Deep nesting beyond 3 levels
- Duplicate code that should be extracted
- Magic numbers or magic strings (use named constants)
- Boolean trap parameters (def send(is_urgent=True))
- Misleading names (data, result, temp, x, flag)
- Catching broad exceptions (bare except, catch Exception)
- Mutable default arguments (Python: def f(x=[]))
- Returning None instead of empty collection
- Using exceptions for normal control flow
- Commented-out code left in the diff

### ANTI-PATTERNS
- N+1 query patterns in ORM/database code
- String concatenation in loops (use join)
- Mutating function arguments
- God functions doing more than one thing
- Premature optimization without measurement

### MAINTAINABILITY
- Missing or wrong type hints/annotations
- Cyclomatic complexity above 10 branches
- Deeply nested conditions (cognitive complexity)
- TODO/FIXME/HACK comments without context
- Inconsistent naming conventions within the same file
- Functions returning different types in different branches

### PERFORMANCE
- Unnecessary calls inside loops
- Repeated expensive operations that could be cached
- Inefficient data structure for the use case
- Missing indexes implied by query patterns

### TESTING
- New logic with no corresponding test implied
- Error paths that appear untested
- Edge cases missing from test coverage

---

## OUTPUT FORMAT

Respond EXACTLY in this format. Replace N with actual integers.
Never use the literal letter N.

## 🔴 Critical Issues (N)
- **{{filename}}, Line {{line}}**: [{{CATEGORY}}] {{Issue title}}
  Problem: {{What is wrong and why it matters}}
  Fix: {{Concrete suggestion, with code snippet if helpful}}

## 🟡 Medium Issues (N)
- **{{filename}}, Line {{line}}**: [{{CATEGORY}}] {{Issue title}}
  Problem: {{What is wrong}}
  Fix: {{Suggestion}}

## 🔵 Low / Info (N)
- **{{filename}}, Line {{line}}**: [{{CATEGORY}}] {{Note}}
  Fix: {{Suggestion}}

## ✅ Positive Feedback
- {{Specific thing done well — not generic praise}}

## Summary
{{One paragraph: main concerns, recommended fix priority order,
and overall assessment of the change quality}}

---

## RULES
- Only comment on code visible in the diff
- Skip issues that are clearly intentional or in test fixtures
- If the diff is docs/config only, say so and focus on any
  security or correctness concerns in those files
- Prioritize by actual risk and impact, not line count
- Be direct and specific — a vague comment is useless

Git Diff:
{diff}
"""

def review_code(diff: str) -> str:
    if not diff.strip():
        raise ValueError("Diff is empty")
    prompt = _PROMPT_TEMPLATE.format(diff=diff)
    try:
        response = _client.models.generate_content(
            model="models/gemini-2.5-flash",
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

import re
from pathlib import Path

SECRET_PATTERNS = [
    r"AIzaSy[0-9A-Za-z_-]{33}",   # Google/Gemini API key
    r"sk-[a-zA-Z0-9]{32,}",        # OpenAI API key
    r"AKIA[0-9A-Z]{16}",           # AWS access key
]

SENSITIVE_FILES = [
    Path(__file__).parents[2] / "backend" / ".env.example",
]


def test_no_secrets_in_example_files():
    for path in SENSITIVE_FILES:
        if not path.exists():
            continue
        content = path.read_text()
        for pattern in SECRET_PATTERNS:
            matches = re.findall(pattern, content)
            assert not matches, (
                f"Real secret found in {path.name}: {matches}. "
                "Use a placeholder like 'your_key_here'."
            )

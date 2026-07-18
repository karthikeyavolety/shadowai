"""Regex-based PII / sensitive-entity detection.

This is intentionally rule-based (not ML) for the hackathon timeline —
deterministic, fast, explainable, and good enough for common formats.
Swap in a proper NER model later if precision needs to go up.
"""
import re

PATTERNS = {
    "phone": re.compile(r"(?:\+91[\-\s]?|0)?[6-9]\d{9}\b|\+\d{1,3}[\-\s]?\(?\d{2,4}\)?[\-\s]?\d{3,4}[\-\s]?\d{3,4}"),
    "email": re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"),
    "dob": re.compile(r"\b(0?[1-9]|[12]\d|3[01])[\/\-.](0?[1-9]|1[0-2])[\/\-.](19|20)\d{2}\b"),
    "pan": re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"),
    "aadhaar": re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b"),
    "passport": re.compile(r"\b[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]\b"),
    "linkedin": re.compile(r"(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+\/?", re.IGNORECASE),
    "github": re.compile(r"(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9\-_]+\/?", re.IGNORECASE),
    "address": re.compile(r"\b\d{1,5}[\w\s]{2,40},\s*[\w\s]{2,30},\s*[A-Za-z]{2,30}[\s,]*\d{4,6}\b"),
}

SKILL_KEYWORDS = [
    "python", "javascript", "typescript", "react", "node", "java", "c++", "sql",
    "mongodb", "aws", "docker", "kubernetes", "fastapi", "django", "flask",
    "machine learning", "tensorflow", "pytorch", "git", "linux", "html", "css",
]

SEVERITY = {
    "aadhaar": "critical", "passport": "critical", "pan": "critical",
    "dob": "high", "address": "high", "phone": "medium", "email": "medium",
    "linkedin": "low", "github": "low",
}


def detect_entities(text: str) -> dict:
    entities: dict[str, list[str]] = {}
    for key, pattern in PATTERNS.items():
        raw_matches = pattern.findall(text)
        if raw_matches and isinstance(raw_matches[0], tuple):
            # Pattern has capture groups (e.g. DOB day/month/year) — findall
            # returns tuples of groups, not the full match, so re-run
            # finditer to recover the complete matched substring.
            normalized = sorted(set(m.group(0).strip() for m in pattern.finditer(text)))
        else:
            normalized = sorted(set(m.strip() for m in raw_matches))
        entities[key] = normalized[:10]

    text_lower = text.lower()
    entities["skills"] = [s for s in SKILL_KEYWORDS if s in text_lower]
    entities["certificates"] = _detect_certificates(text)
    return entities


def _detect_certificates(text: str) -> list[str]:
    cert_pattern = re.compile(r"(?im)^.*(certified|certificate|certification).*$")
    found = cert_pattern.findall(text)
    lines = [line.strip() for line in text.splitlines() if cert_pattern.match(line)]
    return lines[:10]


def severity_of(entity_key: str) -> str:
    return SEVERITY.get(entity_key, "low")

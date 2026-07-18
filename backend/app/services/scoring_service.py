"""
Risk scoring rubric.

Each detected entity contributes points to the sub-score(s) it's most
relevant to, weighted by sensitivity. Scores are 0-100, where 100 = maximum
exposure/risk (not "safety" — a high number is bad, matching the dashboard's
"Risk Score" framing).
"""

ENTITY_WEIGHTS = {
    # entity_key: (privacy, identity_theft, social_engineering, credential_exposure)
    "aadhaar": (25, 30, 5, 0),
    "passport": (25, 30, 5, 0),
    "pan": (20, 25, 5, 0),
    "dob": (15, 20, 10, 0),
    "address": (20, 15, 15, 0),
    "phone": (10, 10, 15, 0),
    "email": (8, 8, 15, 0),
    "linkedin": (5, 5, 10, 0),
    "github": (5, 5, 5, 0),
}

SECRET_WEIGHT = 35  # per exposed secret/credential found (github scanner)


def _clamp(v: int) -> int:
    return max(0, min(100, v))


def compute_resume_scores(entities: dict) -> dict:
    privacy = identity_theft = social_engineering = credential_exposure = 0

    for key, weights in ENTITY_WEIGHTS.items():
        count = len(entities.get(key, []))
        if count == 0:
            continue
        multiplier = min(count, 3)  # diminishing returns after 3 instances
        privacy += weights[0] * multiplier
        identity_theft += weights[1] * multiplier
        social_engineering += weights[2] * multiplier
        credential_exposure += weights[3] * multiplier

    privacy, identity_theft, social_engineering, credential_exposure = (
        _clamp(privacy), _clamp(identity_theft), _clamp(social_engineering), _clamp(credential_exposure)
    )
    overall = _clamp(round(privacy * 0.35 + identity_theft * 0.3 + social_engineering * 0.2 + credential_exposure * 0.15))

    return {
        "overall": overall,
        "privacy": privacy,
        "identity_theft": identity_theft,
        "social_engineering": social_engineering,
        "credential_exposure": credential_exposure,
    }


def compute_github_scores(secrets_found: list, public_emails: list) -> dict:
    credential_exposure = _clamp(len(secrets_found) * SECRET_WEIGHT)
    privacy = _clamp(len(public_emails) * 10)
    identity_theft = _clamp(len(secrets_found) * 10 + len(public_emails) * 5)
    social_engineering = _clamp(len(public_emails) * 8)
    overall = _clamp(round(credential_exposure * 0.4 + privacy * 0.2 + identity_theft * 0.25 + social_engineering * 0.15))
    return {
        "overall": overall,
        "privacy": privacy,
        "identity_theft": identity_theft,
        "social_engineering": social_engineering,
        "credential_exposure": credential_exposure,
    }


def generate_recommendations(entities: dict) -> list[str]:
    recs = []
    if entities.get("aadhaar"):
        recs.append("Remove Aadhaar number from your resume immediately — this is a critical identity document that should never appear in a public-facing file.")
    if entities.get("passport"):
        recs.append("Remove passport number — no employer needs this on a resume.")
    if entities.get("pan"):
        recs.append("Remove PAN number from your resume.")
    if entities.get("dob"):
        recs.append("Consider removing your full date of birth — age can be implied without exposing DOB directly, which is often used in identity verification elsewhere.")
    if entities.get("address"):
        recs.append("Replace your full home address with just city and state/region.")
    if entities.get("phone"):
        recs.append("Consider using a dedicated 'application-only' phone number for public resumes/portfolios.")
    if entities.get("email"):
        recs.append("Use a professional alias email for public postings instead of your primary personal email where possible.")
    if not recs:
        recs.append("No high-severity exposures detected — nice work. Review medium/low findings below for further hardening.")
    return recs

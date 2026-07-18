from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field


class ScanType(str, Enum):
    resume = "resume"
    github = "github"
    portfolio = "portfolio"
    linkedin = "linkedin"


class ScanStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class RiskScores(BaseModel):
    overall: int = 0
    privacy: int = 0
    identity_theft: int = 0
    social_engineering: int = 0
    credential_exposure: int = 0


class ExtractedEntities(BaseModel):
    phone: list[str] = Field(default_factory=list)
    email: list[str] = Field(default_factory=list)
    address: list[str] = Field(default_factory=list)
    dob: list[str] = Field(default_factory=list)
    passport: list[str] = Field(default_factory=list)
    pan: list[str] = Field(default_factory=list)
    aadhaar: list[str] = Field(default_factory=list)
    linkedin: list[str] = Field(default_factory=list)
    github: list[str] = Field(default_factory=list)
    certificates: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)


class ScanInDB(BaseModel):
    user_id: str
    scan_type: ScanType
    input_reference: str
    extracted_entities: ExtractedEntities = Field(default_factory=ExtractedEntities)
    raw_findings: dict = Field(default_factory=dict)
    scores: RiskScores = Field(default_factory=RiskScores)
    recommendations: list[str] = Field(default_factory=list)
    status: ScanStatus = ScanStatus.pending
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ScanOut(BaseModel):
    id: str
    scan_type: ScanType
    input_reference: str
    extracted_entities: ExtractedEntities
    raw_findings: dict
    scores: RiskScores
    recommendations: list[str]
    status: ScanStatus
    created_at: datetime

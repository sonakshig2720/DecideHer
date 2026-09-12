"""Shared, validated contract between Engine 1 and Engine 2."""
from typing import Literal
from pydantic import BaseModel, Field


class UseCase(BaseModel):
    id: int
    department: str
    description: str
    value_band: str | None = None
    effort_or_cost_band: str | None = None


class IssueSubmission(BaseModel):
    """One validated response to the intake form, before model enrichment."""
    name: str
    email: str
    department: str
    company: str
    idea: str | None = None
    what_happens_today: str
    why_we_want_this: str
    departments_involved: list[str] = Field(default_factory=list)
    summary_confirmed: Literal["Yes, that's right", "Not quite"] | None = None
    root_cause_stated: str | None = None
    task_type: str | None = None
    frequency: str | None = None
    time_per_occurrence: str | None = None
    roles_involved: list[str] = Field(default_factory=list)
    people_affected: str | None = None
    data_used: list[str] = Field(default_factory=list)
    it_tools_used: list[str] = Field(default_factory=list)
    security_concern: list[str] = Field(default_factory=list)
    blocked_by: str | None = None
    submitter_role: str | None = None


class DerivedIssueFields(BaseModel):
    root_cause_derived: Literal["People", "Process", "Technology", "Data"]
    capability_type: str
    data_object: str
    personal_data_flag: Literal["yes", "no", "unclear"]
    volume_proxy: Literal["low", "medium", "high"] | None = None


class OwnedSystem(BaseModel):
    name: str
    capabilities: list[str] = Field(default_factory=list)


class Engine1Cluster(BaseModel):
    cluster_id: str
    cluster_name: str
    member_use_cases: list[int]
    underlying_need: str
    owned_system_candidates: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)


DecisionVerdict = Literal["BUILD", "BUY", "REDESIGN", "CONSOLIDATE", "INVESTIGATE", "AVOID"]


class RoadmapCluster(Engine1Cluster):
    """Merged shape: Engine 1 output plus Engine 2's decision fields."""
    verdict: DecisionVerdict | None = None
    reasoning: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    interview_required: bool | None = None
    questions: list[str] = Field(default_factory=list)
    next_action: str | None = None

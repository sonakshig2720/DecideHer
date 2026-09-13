"""Rule-based Engine 2 fields defined by data/decision_output_fields.csv."""
from __future__ import annotations

from collections import Counter
from typing import Any

from storage import fetch_issues_for_engine1, list_owned_systems

BANDS = ("Low", "Medium", "High")
BLOCKERS = [
    "Nobody agrees on the fix",
    "No time",
    "No skills in-house",
    "No authority",
    "No budget",
    "Don't know how",
]
DEPARTMENT_COLORS = [
    "#EA580C", "#700E22", "#F59E0B", "#4A0415", "#C2410C",
    "#9F1239", "#FB923C", "#D97706", "#BE123C", "#A16207",
]


def _number(value: object, default: int = 1) -> int:
    if isinstance(value, int):
        return value
    if isinstance(value, str) and value.isdigit():
        return int(value)
    return {"low": 3, "medium": 10, "high": 20}.get(str(value).lower(), default)


def _band(score: int, medium: int, high: int) -> str:
    return "High" if score >= high else "Medium" if score >= medium else "Low"


def _lowest(*bands: str) -> str:
    return min(bands, key=BANDS.index)


def _mode(values: list[str], default: str = "Unknown") -> str:
    populated = [value for value in values if value]
    return Counter(populated).most_common(1)[0][0] if populated else default


def _normal_root(value: str) -> str:
    lowered = value.lower()
    for root in ("people", "process", "technology", "data"):
        if root in lowered:
            return root
    return lowered


def _role_authority(role: str) -> int:
    return 2 if "OWNER" in role else 1 if "MANAGER" in role or "WORKER" in role else 0


def _report_evidence_score(issue: dict[str, Any]) -> int:
    payload = issue["payload"]
    required = [payload.get("what_happens_today"), payload.get("why_we_want_this")]
    required_score = 2 if all(required) else 1 if any(required) else 0
    optional_names = [
        "root_cause_stated", "task_type", "frequency", "time_per_occurrence",
        "people_affected", "data_used", "it_tools_used", "blocked_by",
    ]
    completeness = sum(bool(payload.get(name)) for name in optional_names) / len(optional_names)
    optional_score = 2 if completeness >= 0.8 else 1 if completeness >= 0.5 else 0
    return min(10, required_score + optional_score + _role_authority(payload.get("submitter_role") or ""))


def _owned_system_evidence(cluster: dict[str, Any]) -> tuple[list[str], bool, str | None]:
    """Return strict matches, unused flag, and technology score when the registry supports it."""
    systems = list_owned_systems()

    registry_available = bool(systems) and all(
        "data_objects_held" in system and "adoption" in system for system in systems
    )
    if not registry_available:
        return [], False, None

    capability = str(cluster.get("capability_type") or "").casefold()
    data_object = str(cluster.get("data_object") or "").casefold()

    def capability_values(system: dict[str, Any], field: str) -> set[str]:
        return {str(value).casefold() for value in system.get(field, [])}

    matches = [
        system
        for system in systems
        if capability in (
            capability_values(system, "capabilities_in_use")
            | capability_values(system, "capabilities_available")
        )
        and data_object in {str(value).casefold() for value in system.get("data_objects_held", [])}
    ]
    if matches:
        adoptions = {str(system.get("adoption") or "").casefold() for system in matches}
        unused = any(
            capability in capability_values(system, "capabilities_available")
            and capability not in capability_values(system, "capabilities_in_use")
            for system in matches
        ) or "bought but barely used" in adoptions
        in_use_match = any(
            capability in capability_values(system, "capabilities_in_use")
            for system in matches
        )
        uncertain = any(
            str(system.get("answer_confidence") or "").casefold() == "guessing"
            for system in matches
        )
        technology = "High" if in_use_match and not uncertain else "Medium"
        return [str(system["system_name"]) for system in matches], unused, technology

    partial_match = any(
        capability in (
            capability_values(system, "capabilities_in_use")
            | capability_values(system, "capabilities_available")
        )
        or data_object in {str(value).casefold() for value in system.get("data_objects_held", [])}
        for system in systems
    )
    return [], False, "Medium" if partial_match else "Low"


def _technology_readiness(issues: list[dict[str, Any]]) -> str:
    tools = {tool for issue in issues for tool in (issue["payload"].get("it_tools_used") or [])}
    if tools & {"Spreadsheets", "Email", "Paper"}:
        return "Low"
    return "High" if len(tools) == 1 else "Medium" if len(tools) <= 3 else "Low"


def _people_readiness(issues: list[dict[str, Any]]) -> str:
    roles = [issue["payload"].get("submitter_role") or "" for issue in issues]
    blockers = [issue["payload"].get("blocked_by") or "" for issue in issues]
    if any("OWNER" in role for role in roles) and any(
        blocker in {"No skills in-house", "Don't know how"} for blocker in blockers
    ):
        return "High"
    if any(blocker in {"Nobody agrees on the fix", "No authority"} for blocker in blockers):
        return "Low"
    if any("MANAGER" in role or "WORKER" in role for role in roles):
        return "Medium"
    return "Low"


def _data_readiness(issues: list[dict[str, Any]]) -> str:
    tools = {tool for issue in issues for tool in (issue["payload"].get("it_tools_used") or [])}
    concerns = {
        concern for issue in issues for concern in (issue["payload"].get("security_concern") or [])
    }
    if tools & {"Spreadsheets", "Email", "Paper"} or "Health data" in concerns:
        return "Low"
    if len(tools) == 1 and concerns <= {"Nothing sensitive"}:
        return "High"
    return "Medium"


def _process_readiness(issues: list[dict[str, Any]], department_count: int) -> str:
    roots = [issue["derived"].get("root_cause_derived") for issue in issues]
    if department_count >= 3:
        return "Low"
    if department_count == 2 or "Process" in roots:
        return "Medium"
    return "High"


def _evidence_score(issues: list[dict[str, Any]]) -> int:
    payloads = [issue["payload"] for issue in issues]
    required = 2 if all(
        payload.get("what_happens_today") and payload.get("why_we_want_this")
        for payload in payloads
    ) else 0
    optional_fields = [
        "root_cause_stated", "task_type", "frequency", "time_per_occurrence",
        "people_affected", "data_used", "it_tools_used", "blocked_by",
    ]
    optional_ratio = sum(
        bool(payload.get(field)) for payload in payloads for field in optional_fields
    ) / (len(payloads) * len(optional_fields))
    optional = 2 if optional_ratio >= 0.8 else 1 if optional_ratio >= 0.5 else 0
    authority = min(2, max(_role_authority(payload.get("submitter_role") or "") for payload in payloads))
    report_count = 2 if len(issues) >= 3 else 1 if len(issues) == 2 else 0
    interview = 0
    return required + optional + authority + report_count + interview


def _verdict_confidence(
    issues: list[dict[str, Any]], owned_matches: list[str], registry_available: bool,
) -> tuple[int, str]:
    stated = [issue["payload"].get("root_cause_stated") or "" for issue in issues]
    derived = [issue["derived"].get("root_cause_derived") or "" for issue in issues]
    agreement = 3 if len(set(derived)) == 1 else 2 if len(set(derived)) == 2 else 1
    root_matches = sum(
        derived_value.lower() in stated_value.lower()
        for stated_value, derived_value in zip(stated, derived)
    )
    root_score = round(3 * root_matches / len(issues))
    consistency = 1 if len({_mode(stated), _mode(derived)}) == 1 else 0
    if registry_available:
        system_score = 3 if len(owned_matches) == 1 else 2 if owned_matches else 1
        return min(10, agreement + root_score + system_score + consistency), "4 inputs"
    reduced_score = round((agreement + root_score + consistency) * 10 / 7)
    return min(10, reduced_score), "3 inputs; owned-systems evidence unavailable; rescaled to 10"


def _missing_evidence(issues: list[dict[str, Any]]) -> list[str]:
    payloads = [issue["payload"] for issue in issues]
    missing = []
    if not all(payload.get("what_happens_today") for payload in payloads):
        missing.append("current workflow description")
    if not all(payload.get("why_we_want_this") for payload in payloads):
        missing.append("future-state description")
    if not any(_role_authority(payload.get("submitter_role") or "") == 2 for payload in payloads):
        missing.append("confirmed process owner")
    if len(issues) < 2:
        missing.append("a corroborating report")
    missing.append("stakeholder interview evidence")
    return missing


def _decision(
    *, evidence_sufficient: bool, root_cause: str, capability: str,
    owned_match: str | None, readiness: str,
) -> str:
    if not evidence_sufficient or readiness == "Low" and capability in {"predict or score", "decide or approve"}:
        return "INVESTIGATE"
    if root_cause in {"Process", "People"}:
        return "REDESIGN"
    if owned_match or capability == "transfer or sync":
        return "CONSOLIDATE"
    if capability in {"summarise", "draft or generate", "retrieve or answer"}:
        return "BUY"
    return "BUILD"


def build_decision_portfolio(clusters: list[dict[str, Any]]) -> dict[str, Any]:
    """Apply every displayable rule and return the React dashboard contract."""
    issues = fetch_issues_for_engine1()
    initiatives = []
    for position, cluster in enumerate(clusters, start=1):
        members = [issues[index - 1] for index in cluster["member_use_cases"]]
        departments = sorted({issue["department"] for issue in members})
        blockers = Counter(issue["payload"].get("blocked_by") or "Don't know how" for issue in members)
        primary_blocker, primary_count = blockers.most_common(1)[0]
        owned_matches, owned_system_unused, owned_technology = _owned_system_evidence(cluster)
        registry_available = owned_technology is not None
        owned_match = ", ".join(owned_matches) or None
        impact_score = sum(_number(issue["derived"].get("volume_proxy")) for issue in members) + (
            max(_number(issue["derived"].get("reach_score")) for issue in members) * 2
        )
        impact = _band(impact_score, 12, 22)
        technology = owned_technology or _technology_readiness(members)
        technology_source = "owned_systems" if registry_available else "form_only"
        people = _people_readiness(members)
        data = _data_readiness(members)
        process = _process_readiness(members, len(departments))
        evidence_score = _evidence_score(members)
        evidence = _band(evidence_score, 5, 8)
        readiness_cap_applied = evidence == "Low" and "High" in {
            technology, people, data, process,
        }
        if evidence == "Low":
            technology = "Medium" if technology == "High" else technology
            people = "Medium" if people == "High" else people
            data = "Medium" if data == "High" else data
            process = "Medium" if process == "High" else process
        readiness = _lowest(technology, people, data, process)
        verdict_score, verdict_basis = _verdict_confidence(
            members, owned_matches, registry_available,
        )
        verdict_band = _band(verdict_score, 5, 8)
        evidence_sufficient = evidence_score >= 5
        missing_evidence = _missing_evidence(members) if not evidence_sufficient else []
        root_cause = _mode([issue["derived"].get("root_cause_derived") for issue in members])
        capability = cluster.get("capability_type") or members[0]["derived"].get("capability_type")
        decision = _decision(
            evidence_sufficient=evidence_sufficient,
            root_cause=root_cause,
            capability=capability,
            owned_match=owned_match,
            readiness=readiness,
        )
        finding = (
            f"{len(members)} report{'s' if len(members) != 1 else ''} across "
            f"{len(departments)} department{'s' if len(departments) != 1 else ''} describe "
            f"{capability} for {cluster.get('data_object')}; {primary_count} cite “{primary_blocker}”."
        )
        initiative = {
            "id": position,
            "clusterId": cluster["cluster_id"],
            "name": cluster["cluster_name"],
            "departments": departments,
            "useCasesCount": len(members),
            "decision": decision,
            "impact": impact,
            "impactScore": impact_score,
            "readiness": readiness,
            "evidence": evidence,
            "spans3PlusDepts": len(departments) >= 3,
            "ownedSystemMatch": owned_match,
            "ownedSystemUnusedFlag": "yes" if owned_system_unused else "no",
            "needsMoreEvidence": not evidence_sufficient,
            "findingText": finding,
            "findingDrivers": [
                f"reports_count={len(members)}",
                f"departments_count={len(departments)}",
                f"blocked_by={primary_blocker}",
            ],
            "primaryBlocker": primary_blocker,
            "blockerDistribution": dict(blockers),
            "readinessBreakdown": {
                "technology": technology, "people": people, "data": data, "process": process,
            },
            "readinessSource": {
                "technology": technology_source, "people": "form_only",
                "data": "form_only", "process": "form_only",
            },
            "readinessCapRule": (
                "Applied: Low evidence capped High backup-path dimensions at Medium"
                if readiness_cap_applied
                else "Not applied"
            ),
            "evidenceScore": evidence_score,
            "evidenceConfidenceBand": evidence,
            "verdictConfidenceScore": verdict_score,
            "verdictConfidenceBand": verdict_band,
            "verdictConfidenceBasis": verdict_basis,
            "evidenceSufficient": evidence_sufficient,
            "missingEvidence": missing_evidence,
            "evidenceRefs": [issue["issue_id"] for issue in members],
            "capabilityType": capability,
            "dataObject": cluster.get("data_object"),
            "reports": [
                {
                    "id": f"DH-{issue['issue_id'].split('-')[0].upper()}",
                    "submitterId": f"SUB-{issue['issue_id'].split('-')[0].upper()}",
                    "submitterName": issue["payload"].get("name") or "[PERSON]",
                    "department": issue["department"],
                    "role": issue["payload"].get("submitter_role") or "[ROLE]",
                    "idea": issue["payload"].get("idea") or "",
                    "whatHappensToday": issue["payload"].get("what_happens_today") or "",
                    "whyWeWantThis": issue["payload"].get("why_we_want_this") or "",
                    "departmentsInvolved": issue["payload"].get("departments_involved") or [],
                    "rootCauseStated": issue["payload"].get("root_cause_stated") or "",
                    "rootCauseDerived": issue["derived"].get("root_cause_derived") or "",
                    "taskType": issue["payload"].get("task_type") or "",
                    "frequency": issue["payload"].get("frequency") or "",
                    "timePerOccurrence": issue["payload"].get("time_per_occurrence") or "",
                    "peopleAffected": issue["payload"].get("people_affected") or "",
                    "dataUsed": issue["payload"].get("data_used") or [],
                    "toolsUsed": issue["payload"].get("it_tools_used") or [],
                    "blockedBy": issue["payload"].get("blocked_by") or "Don't know how",
                    "evidenceScore": _report_evidence_score(issue),
                    "capabilityType": issue["derived"].get("capability_type") or capability,
                    "dataObject": issue["derived"].get("data_object") or cluster.get("data_object"),
                    "personalDataFlag": issue["derived"].get("personal_data_flag") or "unclear",
                    "volumeProxy": _number(issue["derived"].get("volume_proxy")),
                    "reachScore": _number(issue["derived"].get("reach_score")),
                    "clusterId": cluster["cluster_id"],
                }
                for issue in members
            ],
        }
        initiatives.append(initiative)

    department_counts = Counter(issue["department"] for issue in issues)
    total = len(issues) or 1
    departments = [
        {
            "name": name,
            "count": count,
            "color": DEPARTMENT_COLORS[index % len(DEPARTMENT_COLORS)],
            "percentage": round(count * 100 / total, 1),
        }
        for index, (name, count) in enumerate(department_counts.most_common())
    ]
    blocker_counts = Counter(issue["payload"].get("blocked_by") or "Don't know how" for issue in issues)
    blockers = [
        {
            "blocker": blocker,
            "count": blocker_counts.get(blocker, 0),
            "percentage": round(blocker_counts.get(blocker, 0) * 100 / total, 1),
            "significance": "Reported constraint requiring evidence before investment.",
        }
        for blocker in BLOCKERS
    ]
    primary = max(blockers, key=lambda item: item["count"])
    root_gap = Counter(
        f"{issue['payload'].get('root_cause_stated')} → {issue['derived'].get('root_cause_derived')}"
        for issue in issues
        if _normal_root(issue["payload"].get("root_cause_stated") or "")
        != _normal_root(issue["derived"].get("root_cause_derived") or "")
    )
    metrics = {
        "reports": len(issues),
        "opportunities": len(initiatives),
        "departments": len(departments),
        "crossFunctional": sum(item["spans3PlusDepts"] for item in initiatives),
        "existingSystems": sum(bool(item["ownedSystemMatch"]) for item in initiatives),
        "needEvidence": sum(item["needsMoreEvidence"] for item in initiatives),
        "primaryBlocker": primary,
        "rootCauseGap": dict(root_gap),
    }
    top = sorted(initiatives, key=lambda item: (BANDS.index(item["impact"]), item["evidenceScore"]), reverse=True)[:3]
    advisor = {
        "top 3": "Top priorities: " + ", ".join(f"{item['name']} ({item['decision']})" for item in top) + ".",
        "existing systems": f"{metrics['existingSystems']} initiatives have a plausible owned-system match.",
        "duplicating effort": f"{metrics['crossFunctional']} initiatives span three or more departments.",
        "need more evidence": f"{metrics['needEvidence']} initiatives fail the evidence-sufficiency gate.",
        "smaller budget": "Prioritize High-impact initiatives with Medium or High readiness and sufficient evidence.",
        "summarize": f"{metrics['reports']} reports produced {metrics['opportunities']} opportunities; the leading blocker is {primary['blocker']} ({primary['count']} reports).",
    }
    return {
        "initiatives": initiatives,
        "departments": departments,
        "blockers": blockers,
        "metrics": metrics,
        "advisorKnowledgeBase": advisor,
    }

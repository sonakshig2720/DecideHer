"""Deterministic comparison of separately collected stakeholder accounts."""
from __future__ import annotations

import re
from difflib import SequenceMatcher

from schemas import Conflict, InterviewAnswer, Reconciliation


def _normalize(text: str) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", text.lower()))


def _similar(left: str, right: str) -> float:
    a, b = _normalize(left), _normalize(right)
    if not a or not b:
        return 0.0
    tokens_a, tokens_b = set(a.split()), set(b.split())
    jaccard = len(tokens_a & tokens_b) / max(1, len(tokens_a | tokens_b))
    sequence = SequenceMatcher(None, a, b).ratio()
    return max(jaccard, sequence)


def reconcile_answers(
    interviews: list[InterviewAnswer], similarity_threshold: float = 0.58
) -> Reconciliation:
    if len(interviews) < 2:
        return Reconciliation(
            evidence={
                question: [f"{interview.stakeholder}: {answer}"]
                for interview in interviews
                for question, answer in interview.answers.items()
                if answer.strip()
            }
        )

    questions = sorted({q for i in interviews for q in i.answers})
    evidence: dict[str, list[str]] = {}
    agreements: list[str] = []
    conflicts: list[Conflict] = []

    for question in questions:
        accounts = {
            i.stakeholder: i.answers.get(question, "").strip()
            for i in interviews
            if i.answers.get(question, "").strip()
        }
        evidence[question] = [f"{name}: {answer}" for name, answer in accounts.items()]
        values = list(accounts.values())
        if len(values) < 2:
            conflicts.append(Conflict(
                topic=question,
                accounts=accounts,
                explanation="Not every stakeholder supplied evidence for this topic.",
            ))
            continue
        scores = [_similar(values[x], values[y]) for x in range(len(values)) for y in range(x + 1, len(values))]
        if scores and min(scores) >= similarity_threshold:
            agreements.append(question)
        else:
            conflicts.append(Conflict(
                topic=question,
                accounts=accounts,
                explanation="Stakeholder accounts differ; preserve this disagreement for review.",
            ))

    return Reconciliation(agreements=agreements, conflicts=conflicts, evidence=evidence)

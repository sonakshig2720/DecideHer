import json
from pathlib import Path

from engine2 import RuleBasedJudge, assemble_recommendation, evidence_gate, generate_questions
from reconcile import reconcile_answers
from schemas import InterviewAnswer, Verdict, parse_cluster

ROOT = Path(__file__).parents[1]


def demo_cluster():
    return parse_cluster(json.loads((ROOT / "data/demo_cluster.json").read_text()))


def test_low_confidence_cluster_is_sent_to_interview():
    cluster = demo_cluster()
    judgment = RuleBasedJudge().judge(cluster)
    missing = evidence_gate(cluster, judgment)
    assert judgment.confidence < 0.75
    assert missing
    assert 2 <= len(generate_questions(missing)) <= 5


def test_disagreements_are_preserved_and_change_decision():
    raw = json.loads((ROOT / "data/demo_interviews.json").read_text())
    reconciliation = reconcile_answers([InterviewAnswer.model_validate(x) for x in raw])
    assert reconciliation.conflicts
    cluster = demo_cluster()
    judgment = RuleBasedJudge().judge(cluster, reconciliation)
    recommendation = assemble_recommendation(cluster, judgment, reconciliation)
    assert judgment.verdict == Verdict.REDESIGN
    assert recommendation.conflicts
    assert len(recommendation.evidence_trace) >= 2


def test_shared_contract_preserves_extra_engine1_fields():
    payload = json.loads((ROOT / "data/demo_cluster.json").read_text())
    payload["engine1_note"] = "preserve me"
    assert parse_cluster(payload).engine1_note == "preserve me"

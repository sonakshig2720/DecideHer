import json

import storage
from schemas import OwnedSystem


def test_owned_system_contract_accepts_registered_inventory_shape():
    record = json.loads(storage.OWNED_SYSTEM_SEED_PATH.read_text(encoding="utf-8"))[0]

    assert record["name"] == record["system_name"]
    assert record["capabilities"]
    rich_only_record = {
        key: value for key, value in record.items() if key not in {"name", "capabilities"}
    }
    system = OwnedSystem.model_validate(rich_only_record)

    assert system.name == "SAP S/4HANA"
    assert "decide or approve" in system.capabilities
    assert "financial" in system.capabilities


def test_owned_system_inventory_is_seeded_and_accepts_new_records(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "DATABASE_PATH", tmp_path / "decideher.db")

    systems = storage.list_owned_systems()
    assert len(systems) == 5
    assert systems[0]["system_id"] == "SYS-001"
    assert isinstance(systems[0]["capabilities_in_use"], list)

    system_id = storage.persist_owned_system(
        {
            "system_name": "Service Desk",
            "category": "ITSM or ticketing",
            "modules_licensed": "Incident management",
            "capabilities_in_use": ["classify or route"],
            "capabilities_available": ["summarise"],
            "data_objects_held": ["internal knowledge"],
            "adoption": "Used by some teams",
            "departments_using": ["IT", "Service"],
            "answer_confidence": "Certain",
            "notes": "",
        }
    )

    assert system_id == "SYS-006"
    assert len(storage.list_owned_systems()) == 6

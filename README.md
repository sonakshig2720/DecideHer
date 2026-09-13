# DecideHer · AI Transformation Roadmap

This Streamlit app implements the complete nine-stage pipeline:

1. Intake use cases and the owned-systems list.
2. Keep identifying information separate before model processing.
3. Cluster requests by derived capability type and data object.
4. Match clusters against systems the organisation already owns.
5. Score each Engine 1 cluster with deterministic Engine 2 rules.
6. Apply the evidence gate and readiness confidence cap.
7. Preserve the interview fields required for targeted follow-up.
8. Surface root-cause and stakeholder disagreements.
9. Publish one traceable portfolio finding per cluster.

The UI has two screens and no sidebar navigation. It opens on the input form; submitting the form runs Engine 1 and then opens the Engine 2 output. Engine 2 cannot run before Engine 1 has produced a cluster.

## Run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

Complete the input form and select **Submit AI improvement idea**. The app anonymises the submission, runs Engine 1 using the owned-systems data from the repository, and opens the output screen automatically.

The repository data lives in `data/sample_submissions.json` and `data/owned_systems.json`. The IT Context page is generated from `data/owned_systems.csv`; registered systems are stored in SQLite and feed owned-system matching and technology-readiness scoring. Engine 1 derives `capability_type` and `data_object`, then clusters on that pair rather than raw text similarity. Engine 2 applies the field definitions and formulas in `data/decision_output_fields.csv`; this is the renamed copy of the supplied `derived_fields 2.csv` reference.

The supplied executive frontend is integrated in `frontend/` and receives anonymised pipeline output through `static/dashboard/dashboard.json`. Rebuild it after changing React code:

```bash
cd frontend
npm install
npm run build
cd ..
```

The portfolio output is deterministic and does not require Gemini. The legacy interview helper can use Gemini structured output when `GEMINI_API_KEY` is present. `GEMINI_MODEL` is optional and defaults to `gemini-3.6-flash`. Never commit `api_key.env`.

To use Anymize, add `ANYMIZE_API_KEY` to `api_key.env`. User submissions are fail-closed: the complete form record must be successfully anonymised before anything is stored or passed to Engine 1. Name, email, company, submitter role, and matching occurrences in free text are locally replaced before the Anymize request. The SQLite database therefore contains only the anonymised form record.

Direct identifiers are stored as category placeholders such as `[PERSON]`, `[EMAIL]`, and `[COMPANY]`; these are intentionally not hashes. The same placeholder can appear in many records and cannot be used to link a person across submissions. Each submission remains distinguishable through its random `issue_id`, while the temporary original-to-placeholder replacement map is discarded without being written to SQLite.

Submissions are stored in the local `decideher.db` SQLite database. SQLite is included with Python, so it needs no account, API key, server, or additional package. The `issues` table contains the complete anonymised intake record, derived fields, and pipeline metadata. The database file is ignored by Git.

The `issues` table schema is generated from the `field_name` column in `data/form_fields.csv`. Every form answer—including name, email, company, generated summary, and issue details—has a directly queryable column. Pipeline metadata and derived Engine 1 values are stored in additional columns.

On startup, the app idempotently seeds 20 representative intake records from `data/sample_submissions.json`. They cover People, Process, Technology, and Data root causes across multiple departments and task types. New user submissions are added after these records without reseeding duplicates.

The output screen shows the imported executive dashboard using current SQLite records. Open an initiative to see its impact formula result, four readiness dimensions and sources, evidence and verdict confidence, evidence gate, finding drivers, and source references. Engine 1 reclusters all database records whenever a new valid submission is added.

## Test

```bash
pytest -q
```

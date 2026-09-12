import streamlit as st
from schemas import Engine1Cluster

st.title("2. Clusters and existing systems")
clusters = st.session_state.get("clusters", [])
if not clusters:
    st.info("Go to Intake, load the demo data, and create clusters first.")
else:
    for raw_cluster in clusters:
        cluster = Engine1Cluster.model_validate(raw_cluster)
        with st.expander(f"{cluster.cluster_id} - {cluster.cluster_name}", expanded=True):
            st.write(f"**Underlying need:** {cluster.underlying_need}")
            st.write(f"**Member use cases:** {', '.join(map(str, cluster.member_use_cases))}")
            st.write(f"**Existing-system candidates:** {', '.join(cluster.owned_system_candidates) or 'None'}")
            st.write(f"**Missing information:** {', '.join(cluster.missing_information) or 'None'}")


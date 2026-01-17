# Implementation Plan - Real-time Backend & Uploads

The user wants a separate backend system that allows for:
1.  **File Uploads**: Dynamic CSV ingestion.
2.  **Key Management**: Setting API keys (OpenAI / Gov Data) via the UI.
3.  **Real-time Tracking**: Using the keys and data to provide live insights.

I will build `backend_v2.py` to be the robust successor to the previous script, and update the Next.js frontend to include an "Admin/Settings" panel for these actions.

## User Review Required
> [!IMPORTANT]
> This# Integration of Demographic Data Visualization

The user has uploaded demographic and biometric datasets and wants them visualized alongside enrolments and updates. This plan outlines the updates to support "Demographic" and "Biometric" metrics.

## Proposed Changes

### Backend (Python/Flask)

#### [MODIFY] [database.py](file:///c:/Users/BIT%20PATNA/UIDAI%20HACK/database.py)
- Update `init_db()` to include columns: `demo_age_5_17`, `demo_age_17_`, `bio_age_5_17`, `bio_age_17_`.
- These columns will store the specific counts found in the `api_data_aadhar_*` CSV files.

#### [MODIFY] [analytics_pipeline.py](file:///c:/Users/BIT%20PATNA/UIDAI%20HACK/analytics_pipeline.py)
- Update `get_state_trends()` to:
    - Aggregate `demo_age_5_17` + `demo_age_17_` into a single `total_demographic` metric.
    - Aggregate `bio_age_5_17` + `bio_age_17_` into a single `total_biometric` metric.
    - Return these as part of the state-wise data objects.

#### [MODIFY] [backend_v2.py](file:///c:/Users/BIT%20PATNA/UIDAI%20HACK/backend_v2.py)
- Update `/api/dashboard/summary` to return aggregate totals for demographics and biometrics.

### Frontend (Next.js)

#### [MODIFY] [IndiaMap.tsx](file:///c:/Users/BIT%20PATNA/UIDAI%20HACK/nextjs-frontend/app/components/IndiaMap.tsx)
- Update tooltip to show:
    - Demographic Updates
    - Biometric Updates
- Support heatmap coloring for `demographic` (Purple) and `biometric` (Teal).

#### [MODIFY] [dashboard/page.tsx](file:///c:/Users/BIT%20PATNA/UIDAI%20HACK/nextjs-frontend/app/(dashboard)/dashboard/page.tsx)
- Expand the metric toggle to include: "Enrolments", "Updates", "Demographic", "Biometric".
- Customize colors and labels for the new metrics.

## Verification Plan

### Manual Verification
1. **Database Check**: Run `init_db()` and verify table schema.
2. **Dashboard Check**: Verify that "Demographic" and "Biometric" appear in the toggle.
3. **Map Check**: Hover over states and confirm the new metrics show up in the tooltip with correct values.
4. **Heatmap Check**: Confirm that switching to "Demographic" changes the map color scheme.
4.  **Test Analysis**: Go to the Chat page and ask a question about the *new* data.
5.  **Test Real-time**: Set the Gov API key and check the live data feed (simulated if key invalid).

# Text-to-Code Analytics Engine Walkthrough

I have implemented the "Text-to-Code" architecture as requested. This system allows users to ask natural language questions about your data, which are then converted into Pandas code by OpenAI and executed to return visual results.

## Architecture Components

1.  **Backend (The Brain)**: `analytics_engine.py` (Flask)
    *   **Text-to-Code**: Uses OpenAI (GPT-3.5/4) to convert user queries into Pandas code.
    *   **Execution**: Safely executes the generated code on your loaded DataFrame.
    *   **Data**: Loads CSVs from `data_uploads/`. A dummy file `dummy_data.csv` has been created for testing.

2.  **Frontend (The Face)**: `nextjs-frontend/` (Next.js 13+ App Router)
    *   **Chat Interface**: A premium, dark-mode chat UI.
    *   **Visualizations**: Dynamic `recharts` that automatically graph the returned data.
    *   **Tech**: React, Tailwind-free (Vanilla CSS/Modules aesthetics), Framer Motion.

## How to Run

### Prerequisite
You need an **OpenAI API Key**. You can enter this directly in the UI for the hackathon (no need to restart the server).

### Step 1: Start the Backend (V4)
Open a terminal in `c:\Users\BIT PATNA\UIDAI HACK` and run:

```bash
python backend_v2.py
```
*You should see "ANALYTICS BACKEND V4 (UIDAI Features) STARTED" on port 5000.*

### Step 2: Start the Frontend
Open a **new** terminal, navigate to the frontend folder, and start the dev server:

```bash
cd nextjs-frontend
npm run dev
```
*It will start on `http://localhost:3000`.*

### Step 3: Explore the Dashboard
1.  **Dashboard Home**: View real-time aggregated stats (Enrolments, Rejections).
2.  **Check Status**: Go to the "Check Status" tab and enter any simulated ID (e.g., ends in 1 for Success, 9 for Reject) to see the stepper UI.
3.  **Analytics Chat**: Go to the "Analytics Chat" tab to use the Text-to-Code feature.
4.  **Admin**: Manage Uploads and Keys.

## Files Created/Modified
- `analytics_engine.py`: Updated with `/api/ask` and OpenAI logic.
- `nextjs-frontend/`: New Next.js application.
- `data_uploads/dummy_data.csv`: Sample data.

![Verification Session](/C:/Users/BIT PATNA/.gemini/antigravity/brain/16930ced-493a-497e-b7fc-ca1b2385bd78/verify_demographic_stats_final_1768639729049.webp)

````carousel
![Dashboard Top View](/C:/Users/BIT PATNA/.gemini/antigravity/brain/16930ced-493a-497e-b7fc-ca1b2385bd78/dashboard_top_view_1768638392524.png)
Dashboard Header & StatCards
<!-- slide -->
![Blue Heatmap (Enrolments)](/C:/Users/BIT PATNA/.gemini/antigravity/brain/16930ced-493a-497e-b7fc-ca1b2385bd78/dashboard_final_1768638487224.png)
India Map with Blue Enrolment Heatmap
<!-- slide -->
![Orange Heatmap (Updates)](/C:/Users/BIT PATNA/.gemini/antigravity/brain/16930ced-493a-497e-b7fc-ca1b2385bd78/dashboard_orange_map_1768638467556.png)
India Map with Orange Update Heatmap
<!-- slide -->
![Demographic Heatmap (Purple)](/C:/Users/BIT PATNA/.gemini/antigravity/brain/16930ced-493a-497e-b7fc-ca1b2385bd78/demographic_heatmap_purple_1768639602625.png)
Purple Heatmap visualizing Demographic Updates across India.
<!-- slide -->
![Biometric Heatmap (Teal)](/C:/Users/BIT PATNA/.gemini/antigravity/brain/16930ced-493a-497e-b7fc-ca1b2385bd78/biometric_heatmap_teal_1768639619750.png)
Teal Heatmap visualizing Biometric Updates across India.
<!-- slide -->
![Detailed Insight Tooltip](/C:/Users/BIT PATNA/.gemini/antigravity/brain/16930ced-493a-497e-b7fc-ca1b2385bd78/dashboard_up_tooltip_1768639835465.png)
Hover insight for Uttar Pradesh showing all 4 metrics at once.
<!-- slide -->
![Bihar Tooltip](/C:/Users/BIT PATNA/.gemini/antigravity/brain/16930ced-493a-497e-b7fc-ca1b2385bd78/dashboard_final_bihar_tooltip_1768639849801.png)
Hover insight for Bihar verify data accuracy.
````

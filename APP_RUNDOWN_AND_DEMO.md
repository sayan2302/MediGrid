# MediGrid App Rundown and AI Demo

## Overview

MediGrid is a modular, scalable hospital supply chain management solution designed to provide real-time inventory visibility, predictive demand forecasting, automated procurement, and batch-level expiry tracking. It tackles the inefficiencies present in many modern hospitals—stock-outs, expiry-related wastage, and reactive procurement. 

The application adheres directly to the goals specified in your dissertation, including:
- **Inventory Management:** Granular, real-time tracking at the batch level.
- **Procurement Workflow:** Automated purchase order triggers when stock goes below defined reorder levels.
- **Vendor Management:** Comprehensive vendor tracking and integration into procurement.
- **Alert System:** Alerts for critical stock levels and expiring batches.
- **Intelligent Forecasting & Insights:** An AI microservice capable of demand forecasting and expiry risk assessment.

---

## Architecture Breakdown

MediGrid utilizes a multi-tiered architecture:
1. **Frontend (React/Vite):** A dynamic, visually rich dashboard offering high-level KPIs, inventory browsing, procurement workflows, and interactive AI dashboards.
2. **Backend (Node/Express/MongoDB):** The central hub that houses the core logic, manages database transactions (`InventoryBatch`, `Item`, `PurchaseOrder`, `UsageHistory`), and serves RESTful APIs to the frontend.
3. **AI Service (FastAPI/Python/Groq):** A dedicated Python microservice that utilizes Llama 3.1 8B via the Groq API. It processes supply chain data and outputs predictive insights and risk evaluations.

---

## Behind the Scenes: The Mathematics & AI

The core logic of MediGrid fuses traditional operations research formulas with modern Large Language Models to deliver actionable insights.

### 1. Reorder Point & Safety Stock
To prevent stock-outs, MediGrid utilizes **Reorder Levels**. The underlying theoretical formula implemented is:
**`RP = (Average Demand × Lead Time) + Safety Stock`**
- **Action:** When inventory for an item drops below its defined `reorderLevel`, the backend `alertService.js` automatically triggers a warning or critical alert (e.g., if stock drops below 25% of the reorder level, it creates a `CRITICAL` alert). This prompts automated workflows in the Procurement module.

### 2. Demand Forecasting
The AI service incorporates a dual-layered approach to demand forecasting:
- **Fallback Heuristic (Moving Average):**
  `Forecast = (D1 + D2 + ... + Dn) / n`
  The AI service actively calculates the average daily consumption from the `usageHistory`. If the AI model fails or usage data is sparse, it defaults to `heuristic = avg_daily * horizonDays`.
- **LLM-Driven Inference (Llama 3.1):**
  The AI service injects the usage history and item data into a prompt. The LLM processes this contextual sequence and returns a strict JSON object containing a `predictedDemand` value, a `confidence` score (HIGH, MEDIUM, LOW), and an analytical `reasoning` string.

### 3. Expiry Risk Evaluation
The system prevents wastage by intelligently evaluating batch expiry:
- **Coverage Calculation:** `coverage_days = currentStock / dailyUsageRate`
- **AI Assessment:** The LLM is provided the `currentStock`, `dailyUsageRate`, and `daysToExpiry`. The LLM considers these variables to output a JSON object with a `riskLevel` (HIGH, MEDIUM, LOW) and the `reasoning` behind its assessment. For instance, if `coverage_days` significantly exceeds `daysToExpiry`, the AI flags this as `HIGH` risk because stock will inevitably expire before consumption.

---

## In-Depth Demos & Workflows

### Demo 1: AI Demand Forecasting

**Scenario:** A hospital administrator wants to project the demand for "Paracetamol 500mg" over the next 14 days to ensure sufficient stock for an upcoming cold wave.

**Step-by-step Workflow:**
1. User navigates to the **AI Insights Page**.
2. Selects "Paracetamol 500mg" from the dropdown and sets the horizon to `14` days.
3. Clicks **Generate Forecast**.
4. The React frontend dispatches an API call to the Node.js backend (`/api/ai/forecast-demand`).
5. The Node.js backend retrieves the `usageHistory` for the item and forwards the payload to the Python AI service.
6. The Python service queries the Llama 3.1 model via Groq.

**Behind the Scenes Input (Prompt context to LLM):**
```json
{
  "itemId": "64c92a9f9...",
  "horizonDays": 14,
  "usageHistory": [
    {"date": "2026-04-20", "consumedQuantity": 45.5},
    {"date": "2026-04-21", "consumedQuantity": 50.0},
    {"date": "2026-04-22", "consumedQuantity": 48.0}
  ],
  "instruction": "Return strict JSON with predictedDemand(number), confidence(string), reasoning(string)."
}
```

**Behind the Scenes Output (LLM JSON Response):**
```json
{
  "predictedDemand": 670.0,
  "confidence": "HIGH",
  "reasoning": "Based on the recent steady average consumption of ~47.8 units/day, multiplying by the 14-day horizon yields an expected demand of 670 units. Trend indicates stable ongoing usage with no severe fluctuations."
}
```

**UI Rendering:** 
The dashboard displays vibrant KPI cards showing `670` predicted demand, calculating a peak estimate, and rendering a beautifully styled trend chart that visualizes the projected day-by-day consumption. An AI Verdict card renders the LLM's reasoning string, complete with dynamic confidence tags.

---

### Demo 2: Expiry Risk Evaluation

**Scenario:** The inventory holds a large batch of "Amoxicillin" expiring soon, and the procurement manager needs to know if the current consumption rate is high enough to clear the stock before it expires.

**Step-by-step Workflow:**
1. On the **AI Insights Page**, the user selects "Amoxicillin" from the dropdown.
2. The UI automatically populates the `Current Stock` (e.g., 500) and `Days to Expiry` (e.g., 30) from the database batches.
3. The user inputs their expected `Daily Usage Rate` (e.g., 10 units/day).
4. The user clicks **Assess Risk**.

**Behind the Scenes Input (Prompt context to LLM):**
```json
{
  "itemName": "Amoxicillin",
  "currentStock": 500.0,
  "dailyUsageRate": 10.0,
  "daysToExpiry": 30,
  "instruction": "Return strict JSON with riskLevel(HIGH|MEDIUM|LOW) and reasoning(string)."
}
```

**Behind the Scenes Output (LLM JSON Response):**
```json
{
  "riskLevel": "HIGH",
  "reasoning": "At a daily usage rate of 10 units, it will take 50 days to consume the current stock of 500 units. Since the earliest batch expires in only 30 days, approximately 200 units are at a high risk of expiring before use."
}
```

**UI Rendering:** 
The UI displays a vibrant red **HIGH RISK** gauge with a risk score of 90%. A burndown area chart shows the projected stock depletion crossing the expiry date before hitting zero. The AI Verdict explicitly warns the manager that 200 units will likely be wasted unless consumption increases or the stock is redistributed.

---

### Demo 3: Automated Procurement & Alert Flow

**Scenario:** An ICU nurse pulls 10 units of Surgical Masks, causing the total inventory to drop to 35 units.

**Step-by-step Workflow:**
1. The transaction triggers a stock update in the backend `InventoryBatch`.
2. The `inventoryService` checks the item's `reorderLevel` (set to 40).
3. Because `35 <= 40`, the `alertService` generates a `WARNING` alert.
4. The KPI dashboard reflects this as a low-stock alert.
5. In the **Procurement Page**, the manager sees the item flagged as needing reorder. They can instantly generate a `PurchaseOrder` to the primary mapped `Vendor`, reducing procurement cycle time significantly.

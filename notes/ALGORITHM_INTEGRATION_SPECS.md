# 🧠 Algorithm Integration & Data Bundling Specs

This document outlines the business logic and data payload requirements for the **Bells University Timetable Generation Engine**.

---

## 🏗️ 1. The Anchor: Multi-ID Triple-Lock

To ensure 100% precision, the frontend passes the specific IDs for every critical configuration table currently loaded in the user's view.

- **Trigger Endpoint**: `POST http://localhost:8080/algorithm/trigger`
- **Required Parameters**:
  - `generalSettingsId`: {long} The ID of the primary institutional config.
  - `constraintId`: {int} (Optional) The ID of the constraint ledger.
  - `exclusionSnapshotId`: {long} (Optional) The ID of the period exclusion snapshot.
- **Precision**: This triple-lock prevents the backend from guessing which "Latest" record to use, especially in environments where multiple admins might be saving settings simultaneously.

---

## 📦 2. Context Retrieval & Data Assembly

When the engine initializes, the `SchedulerService` assembles the data bundle by pulling the **Exact Records** requested:

### A. Record Pulling Logic

| Component             | Logic                                                                |
| :-------------------- | :------------------------------------------------------------------- |
| **General Settings**  | Fetches `GeneralSettings` by provided `generalSettingsId`.           |
| **Constraint Matrix** | Fetches `Constrainttable` by provided `constraintId`.                |
| **Exclusion Vector**  | Fetches `PeriodExclusionSnapshot` by provided `exclusionSnapshotId`. |

### B. Logical Context Extraction

Once the exact records are loaded, the system extracts the academic context:

- **Session Chain**: extracted from `GeneralSettings.session` (e.g., `"2025/2026"`).
- **Student Roll**: Queries `registration` where `session == root.session`.
  |

---

## 🔄 3. Integration Workflow (The Solver Bundle)

```mermaid
sequenceDiagram
    participant FE as Frontend (TimetablePage)
    participant API as AlgorithmController
    participant SCH as SchedulerService
    participant DB as MySQL (examtt2)
    participant ALG as Solver Engine

    FE->>API: POST /trigger?generalSettingsId=88
    API->>SCH: triggerAlgorithm(88)
    SCH->>DB: Get GeneralSettings(88) -> {Session: 2025/26, Sem: 1}
    SCH->>DB: Get Active Exclusions where settings_id=88
    SCH->>DB: Get Registrations where session=2025/26 & sem=1
    SCH->>ALG: Solve(Settings, Exclusions, Registrations, Constraints)
    ALG-->>DB: Stream progress to logs/optimization_settings
    ALG-->>DB: Commit results to output_tab
```

---

## ✅ 4. Pre-Flight Readiness Validation

The "Initiate" button is gated by a multi-pillar business check:

1.  **Session/Semester**: Validated in the Root Config.
2.  **Grid Topology**: Dimensions must be defined (Periods > 0).
3.  **Constraint Ledger**: At least one hard constraint must be present.
4.  **Exclusion Matrix**: An active snapshot must be present (System verifies review has occurred).

---

## 🛠️ 5. Implementation for Solver Cycle

The solver interprets the `excludedPeriods` from the Snapshot as an **Input Mask**:

```java
// Logic inside Algorithm Solve Loop
for (int slotIndex = 0; slotIndex < totalSlots; slotIndex++) {
    if (activeExclusions.contains(slotIndex)) {
        matrix[slotIndex].isAvailable = false; // Block slot from allocation
    }
}
```

**Status:** Implementation Ready  
**Architecture:** Zero-Trust Relational Mapping v4.0

---

## 🌐 6. Distributed Engine Orchestration

The Bells University generation logic is designed for **Edge Execution**. This means the generation engine can reside on an external high-compute machine while the main application server handles the orchestration.

### A. The Remote Handshake

1.  **Orchestrator Role**: The main server (Localhost:8080) receives the **Triple-Lock IDs** from the frontend.
2.  **Edge Trigger**: The server proxies this request (or makes a secondary call) to the **External Node IP**.
3.  **Autonomous Pulling**: Because the IDs are for a shared Database (`examtt2`), the External Node uses the IDs to pull its own "Respective Bundle" directly from the database, eliminating the need to transmit large data blobs over HTTP.

### B. Scalability Specs

- **Engine Multi-Tenancy**: Multiple external nodes can be spun up during peak registration cycles.
- **Callback Mechanism**: External nodes report progress to the `optimization_settings` table via the shared DB, which the frontend continues to poll locally.

**Status:** Implementation Ready  
**Architecture:** Distributed Zero-Trust Mapping v4.1 (External Compatible)

---

## 📅 7. Temporal Matrix & Exclusion Masking (Conceptual Model)

To ensure the UI aligns perfectly with the User's mental model while maintaining database efficiency, the following architectural decisions have been made:

### A. The "Exclusion Mask" Strategy

- **Observation**: Admins often exclude dates (e.g., Ash Wednesday) in the Exclusion Tab.
- **Architectural Logic**:
  - The `PeriodSlotSelector` in the Constraints Section will fetch the **Active Exclusion Snapshot**.
  - Slots that are marked as "Excluded" will be visually masked (greyed out/disabled) in the Constraint Selector.
  - **Outcome**: Prevents the user from requesting a constraint (e.g., "Schedule CHM101 on Slot 4") when Slot 4 has already been mathematically blocked by an Exclusion.

### B. Mental Mapping vs. Database Storage

- **The DB Storage**: Continues to store **Raw Indices** (0, 1, 2...). This is the "Mental Anchor" for the solver.
- **The UI Mapping**: Resolves raw indices into human-readable labels: `[Day] [Date] | [PX]` (e.g., `Tue 24th | P2`).
- **Clock Times**: Are **omitted** from the mapping UI to maintain a clean "Academic Slot" focus (P1, P2 are sufficient).
- **No DB Transformation Required**: No changes to the schema are needed; the `PeriodCalculationService` remains the single source of truth for resolving indices into these labels.

---

## 🏗️ 8. Sector-Based Constraint Mapping (UI Logic)

To ensure the generator receives a valid "Constraint Matrix," the UI must enforce the institutional sector hierarchy during data entry.

### A. The Primary/Secondary Relationship

| Constraint Type         | Primary Identifier (Search) | Secondary Dependency (Selector) | Conceptual Flow       |
| :---------------------- | :-------------------------- | :------------------------------ | :-------------------- |
| **Exam Slots (Period)** | **Course** (e.g., CHM102)   | **Calendar Grid** (Slots)       | "When is this done?"  |
| **Venue Assignments**   | **Venue** (e.g., Rm1)       | **Course List** (Search + Tick) | "Who uses this room?" |
| **Academic Sequences**  | **Course** (e.g., CHM102)   | **Course List** (Search + Tick) | "What follows what?"  |
| **Staff Availability**  | **Staff** (e.g., BUT/023)   | **Immediate / Grid**            | "Who is unavailable?" |

### B. Selection Persistence (The Backend Key)

When saving to the `constraint_table`, the primary identifier becomes the **Key** in the `ID(DEPS)` format:

- **Correct**: `Rm1(PHY102,CSC202)` (Venue as Key for Venue Tabs)
- **Correct**: `CHM102(0,1,2)` (Course as Key for Period Tabs)
- **Correct**: `CHM101(PHY102)` (Course as Key for Sequence/Coincident Tabs)

### C. Registry Syncing (Staff Population)

The **Invigilator** tab must explicitly fetch the Staff Registry (`/staff/get`) to populate the filter-search selector. The `staffAbsId` is used as the primary serial identifier for these constraints.

**Status:** Implementation Synchronized  
**Architecture:** Institutional Sector Mapping v1.0

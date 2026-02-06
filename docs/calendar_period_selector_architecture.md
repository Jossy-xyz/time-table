# Calendar Period Selector - High-Level Architecture

## Overview

The Calendar Period Selector (Calendar Projection Surface) is a visual interface that maps examination periods to actual calendar dates, allowing administrators to exclude specific time slots from the timetable generation process.

---

## UI Design Specification

### Component Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Calendar Period Selector - Exclude Unavailable Periods                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Mon 20th   Tue 21st   Wed 22nd   Thu 23rd   Fri 24th               │ │
│  │  ─────────  ─────────  ─────────  ─────────  ─────────               │ │
│  │  Week 1                                                               │ │
│  │    [L]1       [L]4       ○7        ○10        ○13                    │ │
│  │    [L]2       [L]5       ○8        ○11        ○14                    │ │
│  │    [L]3       [L]6       ○9        ○12        ○15                    │ │
│  │    (Locked)   (Locked)   (Exam Start)                                 │ │
│  │                                                                       │ │
│  │  Mon 27th   Tue 28th   Wed 29th   Thu 30th   Fri 31st               │ │
│  │  Week 2                                                               │ │
│  │   ○16        ○19        ○22        ○25        ○28                    │ │
│  │   ○17        ○20        ○23        ○26        ○29                    │ │
│  │   ○18        ○21        ○24        ○27        ○30                    │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  [Clear All]  [Select All]  [Save Configuration]                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Visual Elements

1. **Date Headers:** "Mon 20th", "Tue 21st", etc. - Actual calendar dates (not just day names)
2. **Week Labels:** "Week 1", "Week 2", etc. - Left-aligned row labels
3. **Day Columns:** Dynamically shown based on `days_per_week` (5 for Mon-Fri, 7 for Mon-Sun)
4. **Period Circles:**
   - Numbered circles representing each period slot
   - Numbers are **1-indexed** for user display (backend stores 0-indexed)
   - **Global continuous numbering** across all weeks (1, 2, 3... 28, 29, 30)
   - Checkbox behavior: **Selected = Excluded from scheduling**
   - Visual states:
     - Unchecked (white/outlined) = Available for scheduling
     - Checked (filled/colored) = Excluded from scheduling
   - Tooltip on hover: "Wed 22nd Jan - Period 2 (Slot 8)"
5. **Action Buttons:**
   - Clear All: Uncheck all periods
   - Select All: Check all periods
   - Save Configuration: Persist to backend

### Concrete Example (from your scenario)

**Configuration:**

- Exam Duration: Wed Jan 22 - Feb 3
- Anchor Date: Mon Jan 20 (Automatically identified)
- Days per week: 5 (Mon-Fri)
- Periods per day: 3

**System Behavior (Auto-Locking):**

1. **Monday 20th & Tuesday 21st:** These occur before the `start_date`.
2. **Indices affected:** 0, 1, 2 (Monday) and 3, 4, 5 (Tuesday).
3. **Internal State:** These 6 slots are marked `isSystemLocked: true`.
4. **UI Visuals:** Slots 1 through 6 are greyed out with a lock icon.
5. **Payload:** These indices are automatically included in any save/generation request as forbidden slots.

**User Action:**
User clicks on "Wed 22nd - Period 2" (the circle labeled "8")

**Backend Calculation:**

```
Anchor: Mon 20th
Day offset: Wed 22nd - Mon 20th = 2 days
Period within day: 2 (second period)
Global index (0-based): 2 days × 3 periods/day + (2-1) = 7
Display number (1-based): 8
```

**Stored in DB:** `excluded_periods: "7"` (or appended to existing: "0,5,7,12")

**Visual Feedback:** Circle #8 becomes filled/checked

---

## Data Flow Architecture

### Input Data (from GeneralSettings)

```typescript
interface GeneralSettings {
  start_date: Date; // e.g., "2024-01-20"
  end_date: Date; // e.g., "2024-02-03"
  days_per_week: number; // e.g., 5 (Mon-Fri) or 7 (Mon-Sun)
  periods_per_day: number; // e.g., 2 or 3
  current_session: string; // e.g., "2024/2025"
  current_semester: number; // e.g., 1 or 2
}
```

### Calculation Logic

```typescript
// Calculate total examination weeks
const totalDays = daysBetween(start_date, end_date);
const totalWeeks = Math.ceil(totalDays / days_per_week);

// Calculate total period slots
const totalPeriods = totalDays * periods_per_day;

// Calculate anchor date (Preceding Monday)
function getAnchorDate(startDate: Date): Date {
  const date = new Date(startDate);
  const day = date.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to get Monday
  return new Date(date.setDate(diff));
}

// Generate period-to-date mapping
interface PeriodMapping {
  periodIndex: number; // 0-based backend index (starts from Anchor Date)
  displayIndex: number; // 1-based frontend display
  date: Date; // Actual calendar date
  dayOfWeek: string; // "Mon", "Tue", etc.
  weekNumber: number; // 1, 2, 3, etc.
  periodOfDay: number; // 1, 2, 3 (within that day)
  isSystemLocked: boolean; // True if date < startDate OR date > endDate
}
```

### Output Data (to Constraint Table)

```typescript
interface PeriodExclusionConstraint {
  id: number;
  constraint_type: "period_exclusive";
  excluded_periods: string; // Comma-separated 0-based indices
  // e.g., "0,5,12,18"
  created_at: Date;
  session: string; // Links to GeneralSettings session
  semester: number; // Links to GeneralSettings semester
}
```

---

## Component Architecture

### Frontend Components

```
CalendarPeriodSelector/
├── CalendarPeriodSelector.tsx       (Main container)
├── WeekRow.tsx                      (Single week display)
├── PeriodCell.tsx                   (Individual period checkbox)
├── CalendarHeader.tsx               (Day name headers)
└── hooks/
    ├── usePeriodCalculation.ts      (Period index calculations)
    └── usePeriodSelection.ts        (Selection state management)
```

### Key Frontend Logic

**Period Index Calculation:**

```typescript
// Convert date + period to global index
function calculatePeriodIndex(
  date: Date,
  periodOfDay: number,
  anchorDate: Date,
  periodsPerDay: number,
): number {
  const dayOffset = daysBetween(anchorDate, date);
  return dayOffset * periodsPerDay + (periodOfDay - 1); // -1 for 0-based
}

// Convert global index to date + period
function indexToPeriod(
  index: number,
  anchorDate: Date,
  periodsPerDay: number,
): PeriodMapping {
  const dayOffset = Math.floor(index / periodsPerDay);
  const periodOfDay = (index % periodsPerDay) + 1;
  const date = addDays(anchorDate, dayOffset);

  return {
    periodIndex: index,
    displayIndex: index + 1,
    date,
    dayOfWeek: getDayName(date),
    weekNumber: Math.floor(dayOffset / 7) + 1,
    periodOfDay,
    isSystemLocked: date < startDate || date > endDate,
  };
}
```

---

## Backend Architecture

### Database Schema Extension

**Option A: Store in existing `constraint_table`**

```sql
ALTER TABLE constraint_table
ADD COLUMN period_exclusions TEXT;  -- Comma-separated indices: "0,5,12,18"
```

**Option B: Create dedicated table (Recommended for versioning)**

```sql
CREATE TABLE period_exclusion_snapshots (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  session VARCHAR(20) NOT NULL,
  semester INT NOT NULL,
  excluded_periods TEXT,           -- "0,5,12,18"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  name VARCHAR(255),                -- Optional: "Sem 1 Final", "Draft 1"
  is_active BOOLEAN DEFAULT FALSE,  -- Only one active per session/semester
  UNIQUE(session, semester, is_active)
);
```

### API Endpoints

```typescript
// Get period mapping for current session
GET /api/periods/mapping
Response: {
  totalPeriods: number;
  periods: PeriodMapping[];
  generalSettings: GeneralSettings;
}

// Get active exclusions
GET /api/periods/exclusions/active
Response: {
  excludedPeriods: number[];  // [0, 5, 12, 18]
  session: string;
  semester: number;
}

// Save period exclusions
POST /api/periods/exclusions
Body: {
  excludedPeriods: number[];
  name?: string;  // Optional snapshot name
}

// Get exclusion history
GET /api/periods/exclusions/history
Response: PeriodExclusionSnapshot[]
```

---

## Integration Points

### 1. GeneralSettings Integration

- Calendar grid **dynamically generates** based on `start_date`, `end_date`, `days_per_week`, `periods_per_day`
- Must fetch GeneralSettings before rendering calendar
- If settings change, calendar must regenerate

### 2. Constraint Settings Integration

- Period exclusions are a **type of constraint**
- Integrate into existing `SettingsPage.tsx` as a new tab or section
- Coordinate with other constraint types (Period Inclusive, Venue Exclusive, etc.)

### 3. Timetable Generation Integration

- Excluded periods are passed to the algorithm as **hard constraints**
- Algorithm must skip these slots during scheduling
- Backend solver receives: `excludedPeriods: [0, 5, 12, 18]`

---

## Implementation Phases

### Phase 1: Backend Foundation

- [ ] Create `period_exclusion_snapshots` table
- [ ] Create `PeriodExclusion` entity and repository
- [ ] Implement period mapping calculation endpoint
- [ ] Implement CRUD endpoints for exclusions

### Phase 2: Frontend Core

- [ ] Create `CalendarPeriodSelector` component
- [ ] Implement period index calculation hooks
- [ ] Implement selection state management
- [ ] Connect to backend APIs

### Phase 3: UI Polish

- [ ] Add date display (e.g., "Mon 20th")
- [ ] Implement tooltips for period cells
- [ ] Add bulk selection actions (Clear All, Select All)
- [ ] Add visual feedback for saved states

### Phase 4: Integration

- [ ] Integrate into SettingsPage
- [ ] Add snapshot/history dropdown
- [ ] Connect to timetable generation trigger
- [ ] Add validation (warn if too many periods excluded)

---

## Edge Cases & Validation

### Validation Rules

1. **Minimum Available Periods:** Warn if >80% of periods are excluded
2. **Session Mismatch:** Prevent loading exclusions from different session/semester
3. **Date Range Changes:** If GeneralSettings dates change, invalidate old exclusions
4. **Concurrent Edits:** Use optimistic locking or last-write-wins strategy

### Error Handling

- **No GeneralSettings:** Display message "Configure General Settings first"
- **Invalid Date Range:** Show error if `start_date > end_date`
- **Backend Failure:** Show cached/last saved state with warning banner

---

## Future Enhancements

1. **Visual Calendar View:** Month-style calendar instead of grid
2. **Drag-to-Select:** Click and drag to select multiple periods
3. **Recurring Patterns:** "Exclude all Fridays" or "Exclude Period 1 every day"
4. **Import/Export:** Export exclusions as CSV/JSON for backup
5. **Conflict Detection:** Highlight periods that conflict with other constraints
6. **Tooltips:** Hover over period to see:
   - Full date and time
   - Number of exams potentially affected
   - Related constraints

---

## Technical Considerations

### Performance

- For large date ranges (e.g., 4 weeks × 7 days × 3 periods = 84 cells), use virtualization
- Cache period mapping calculations
- Debounce selection changes before saving

### Accessibility

- Use proper ARIA labels for checkboxes
- Keyboard navigation (arrow keys to move between periods)
- Screen reader support for date/period announcements

### Responsive Design

- Mobile: Stack weeks vertically, show fewer days per row
- Tablet: Show 2-3 weeks at a time
- Desktop: Show full calendar grid

---

## Summary

The Calendar Period Selector transforms abstract period indices into a visual, date-based interface that:

1. **Improves UX:** Users see actual dates instead of numbers
2. **Reduces Errors:** Visual feedback prevents over-exclusion
3. **Enables Versioning:** Snapshot system preserves history
4. **Integrates Seamlessly:** Works with existing constraint system

This architecture provides a solid foundation for implementing the feature while maintaining flexibility for future enhancements.

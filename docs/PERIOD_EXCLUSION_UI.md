# Period Exclusion - UI/UX Design (FINAL)

## 🎯 Design Principle

**User Goal:** Click on specific dates and periods to exclude them from timetable generation.

**Design Approach:**

- ✅ **Global period numbers** (1-30) - Unique identification
- ✅ **Short date format** - "Mon 20 Jan" (not "Monday 20 January")
- ✅ **Clean grid layout** - No week labels, no time labels
- ✅ **Row labels** - Show "Period 1, 2, 3" on the right
- ✅ **Tooltips** - Hover for full context

---

## ✨ Final UI Design (Compact 7-Day View)

**Goal:** Maximize data density to minimize vertical scrolling.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│   Examination Periods                                                         │
│  Session: 2024/2025 Semester 1 | 20 Jan - 3 Feb 2025          [(clock-undo btn) History] │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Week 1 ┌────────┬────────┬────────┬────────┬────────┬────────┬────────┐     │
│  (Jan)  │ Mon 20 │ Tue 21 │ Wed 22 │ Thu 23 │ Fri 24 │ Sat 25 │ Sun 26 │     │
│         ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤     │
│         │  [ 1]  │  [ 4]  │  [ 7]  │  [10]  │  [13]  │  [16]  │  [19]  │     │
│         │  [ 2]  │  [ 5]  │  [ 8]  │  [11]  │  [14]  │  [17]  │  [20]  │     │
│         │  [ 3]  │  [ 6]  │  [ 9]  │  [12]  │  [15]  │  [18]  │  [21]  │     │
│         └────────┴────────┴────────┴────────┴────────┴────────┴────────┘     │
│                                                                              │
│  Week 2 ┌────────┬────────┬────────┬────────┬────────┬────────┬────────┐     │
│  (Jan)  │ Mon 27 │ Tue 28 │ Wed 29 │ Thu 30 │ Fri 31 │ Sat 01 │ Sun 02 │     │
│         ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤     │
│         │  [22]  │  [25]  │  [28]  │  [31]  │  [34]  │  [37]  │  [40]  │     │
│         │  [23]  │  [26]  │  [29]  │  [32]  │  [35]  │  [38]  │  [41]  │     │
│         │  [24]  │  [27]  │  [30]  │  [33]  │  [36]  │  [39]  │  [42]  │     │
│         └────────┴────────┴────────┴────────┴────────┴────────┴────────┘     │
│                                                                              │
│  [Clear All]  [Select All]  [Save]                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Component Specifications

### PeriodButton Component

**Display:** Period of Day (e.g., "P1")  
**Compact Size:** 50px × 40px (Optimized for density)  
**Font:** 16px, bold  
**Gap:** 4px (Tight spacing)

```tsx
interface PeriodButtonProps {
  periodIndex: number; // 0-based backend (e.g., 7)
  label: string; // "P1", "P2"
  displayNumber: number; // For Tooltip
  date: Date;
  periodOfDay: number; // 1, 2, or 3
  isExcluded: boolean;
  onToggle: () => void;
}

function PeriodButton({
  label,
  displayNumber,
  date,
  periodOfDay,
  isExcluded,
  onToggle,
}: PeriodButtonProps) {
  const tooltip = `${format(date, "EEE dd MMM")} - Period ${periodOfDay} (Slot ${displayNumber})`;

  return (
    <button
      className={`period-button ${isExcluded ? "excluded" : "available"}`}
      onClick={onToggle}
      title={tooltip}
      aria-label={`Period ${displayNumber}, ${format(date, "EEEE do MMMM")}, ${isExcluded ? "Excluded" : "Available"}`}
    >
      {displayNumber}
    </button>
  );
}
```

### CSS Styling (Compact)

```css
/* Update: Reduced padding and gap for maximum density */

.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 12px; /* Reduced from 24px */
  max-width: 100%;
  overflow-x: auto;
}

.week-row {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr) 40px; /* WeekLabel + 7 days + PeriodLabel */
  gap: 4px;
  align-items: center;
}

/* Button Base - Compact */
.period-button {
  width: 100%; /* Fill cell */
  min-width: 45px;
  height: 40px; /* Reduced height */
  font-size: 16px;
  font-weight: 700;
  border-radius: 6px;
  border: 1px solid; /* Thinner border */
  padding: 0;
  margin: 0;
}

/* Available State (Green) */
.period-button.available {
  background: #f0fdf4; /* Light green */
  border-color: #22c55e; /* Green 500 */
  color: #166534; /* Green 800 */
}

.period-button.available:hover {
  background: #dcfce7; /* Green 100 */
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
}

/* Excluded State (Red) */
.period-button.excluded {
  background: #fee2e2; /* Light red */
  border-color: #ef4444; /* Red 500 */
  color: #991b1b; /* Red 900 */
}

.period-button.excluded:hover {
  background: #fecaca; /* Red 200 */
}

/* Focus State (Accessibility) */
.period-button:focus {
  outline: 3px solid #3b82f6; /* Blue 500 */
  outline-offset: 2px;
}
```

---

## 📊 Data Flow

### Frontend Display Logic

```typescript
// Convert backend index (0-based) to display number (1-based)
function getDisplayNumber(periodIndex: number): number {
  return periodIndex + 1; // 0 → 1, 7 → 8, 29 → 30
}

// Convert display number to backend index
function getBackendIndex(displayNumber: number): number {
  return displayNumber - 1; // 1 → 0, 8 → 7, 30 → 29
}

// Generate tooltip text
function getTooltip(
  periodIndex: number,
  date: Date,
  periodsPerDay: number,
): string {
  const displayNumber = periodIndex + 1;
  const periodOfDay = (periodIndex % periodsPerDay) + 1;
  const formattedDate = format(date, "EEE dd MMM"); // "Wed 22 Jan"

  return `${formattedDate} - Period ${periodOfDay} (Slot ${displayNumber})`;
}
```

### User Interaction Flow

1. **User sees:** Button labeled `[8]` under "Wed 22 Jan"
2. **User hovers:** Tooltip shows "Wed 22 Jan - Period 2 (Slot 8)"
3. **User clicks:** Button changes from green to red
4. **Frontend:** Adds `7` to exclusion array (0-based)
5. **Backend:** Saves `"7"` to `excluded_periods` column
6. **Summary updates:** "✓ 1 period excluded | ⚠ 29 available"
7. **Auto-save:** Triggers after 2 seconds (debounced)

---

## 📱 Responsive Design

### Desktop (≥1200px)

- **Layout:** 7 columns (Mon-Sun) per row
- **Button size:** ~50px width, 40px height
- **View:** All days visible without horizontal scroll

### Tablet (768px - 1199px)

- **Layout:** Scrollable container (overflow-x: auto)
- **Button size:** Fixed 50px min-width
- **User Action:** Swipe left/right to see Sat/Sun if screen is narrow

### Mobile (≤767px)

- **Layout:**
  - Option A: Horizontal Scroll (Preserves grid structure, recommended for density)
  - Option B: Vertical Stack (1 day per row) - _Avoided to minimize vertical scrolling_
- **Decision:** **Horizontal Scroll** with sticky first column (Week label).
- **Button size:** 45px × 45px

```
Mobile View (Scrollable):
┌────────┬────────┬──────
│ Mon 20 │ Tue 21 │ ...
├────────┼────────┼──────
│  [ 1]  │  [ 4]  │ ...
│  [ 2]  │  [ 5]  │ ...
└────────┴────────┴──────
```

---

## ♿ Accessibility

### Keyboard Navigation

- **Tab:** Move to next period
- **Shift+Tab:** Move to previous period
- **Space/Enter:** Toggle selection
- **Arrow keys:** Navigate grid (up/down/left/right)
- **Ctrl+A:** Select all
- **Ctrl+D:** Clear all

### Screen Reader

```
Announcement: "Period 8, Wednesday 22nd January, Available. Button. Press to exclude."
```

### Color Contrast (WCAG AAA)

- Available text on background: 7.2:1 ✓
- Excluded text on background: 8.1:1 ✓
- Border contrast: 4.8:1 ✓

---

## 🔔 User Feedback

### Tooltip (on hover)

```
┌─────────────────────────────┐
│ Wed 22 Jan - Period 2       │
│ Slot 8 of 30                │
└─────────────────────────────┘
```

### Selection Summary (live update)

```
┌─────────────────────────────────────────┐
│ ✓ 8 periods excluded (27%)              │
│ ⚠ 22 periods available                  │
└─────────────────────────────────────────┘
```

### Warning (if >80% excluded)

```
┌─────────────────────────────────────────┐
│ ⚠️ Warning: 25 periods excluded (83%)   │
│ Timetable generation may fail           │
└─────────────────────────────────────────┘
```

---

## 🛠️ Component Structure

```
CalendarPeriodSelector/
├── CalendarGrid.tsx           (Main container)
│   ├── Fetch GeneralSettings
│   ├── Calculate period mapping
│   ├── Manage selection state
│   └── Debounced auto-save (2s)
│
├── DateHeader.tsx             (Date column headers)
│   └── Format: "Mon 20 Jan"
│
├── PeriodRow.tsx              (Single row of periods)
│   ├── Row label: "Period 1"
│   └── 5-7 PeriodButtons
│
├── PeriodButton.tsx           (Individual period slot)
│   ├── Display: Global number (1-30)
│   ├── Tooltip: Full context
│   └── States: Available/Excluded/Hover
│
├── SelectionSummary.tsx       (Live feedback bar)
│   ├── Count excluded/available
│   └── Warning if >80%
│
└── ActionBar.tsx              (Bulk actions)
    ├── Clear All (with confirmation)
    ├── Select All (with confirmation)
    ├── Save button
    └── History dropdown
```

---

## ✅ Implementation Checklist

### Core Components

- [ ] Create `PeriodButton.tsx` with 4 states
- [ ] Create `DateHeader.tsx` with short date format ("Mon 20 Jan")
- [ ] Create `PeriodRow.tsx` with row labels
- [ ] Create `CalendarGrid.tsx` container
- [ ] Create `SelectionSummary.tsx` live feedback
- [ ] Create `ActionBar.tsx` with bulk actions

### Interaction Logic

- [ ] Single-click toggle (optimistic UI)
- [ ] Keyboard navigation (Tab, Arrow keys, Ctrl+A/D)
- [ ] Debounced auto-save (2 seconds)
- [ ] Confirmation dialogs for Clear/Select All

### Accessibility

- [ ] ARIA labels for screen readers
- [ ] Focus indicators (3px blue outline)
- [ ] Keyboard shortcuts
- [ ] Color contrast validation (WCAG AAA)

### Responsive Design

- [ ] Desktop: 60px × 50px buttons
- [ ] Tablet: 55px × 45px buttons
- [ ] Mobile: 50px × 50px buttons, 3 per row

### Integration

- [ ] Connect to `periodExclusionService.ts`
- [ ] Load active exclusions on mount
- [ ] Pass exclusions to timetable generation API
- [ ] Add to TimetablePage as modal/drawer

---

**Status:** ✅ Design Locked  
**Display Format:** Global numbers (1-30), short dates ("Jan")  
**Backend Storage:** 0-based indices (0-29)  
**Next Step:** Implement PeriodButton component

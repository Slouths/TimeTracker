# TradeTimer - Part 3 Implementation TODO

## Overview
This document outlines the remaining features from Part 2 specification that should be completed in Part 3.

---

## HIGH PRIORITY FEATURES

### 1. Profile Page Settings UI
**Files to Create:**
- `components/settings/display-preferences.tsx`
- `components/settings/timer-preferences.tsx`

**Files to Update:**
- `app/profile/page.tsx`

**Requirements:**
- Load user settings from Supabase using `getUserSettingsWithDefaults()`
- Display sections:
  - **Display Preferences:** Timezone, Date Format, Time Format, Currency
  - **Timer Preferences:** Time Rounding, Idle Timeout, Auto-start Timer
- Use dropdowns from `lib/user-settings.ts` constants:
  - `TIMEZONE_OPTIONS`
  - `DATE_FORMAT_OPTIONS`
  - `TIME_FORMAT_OPTIONS`
  - `CURRENCY_OPTIONS`
  - `TIME_ROUNDING_OPTIONS`
  - `IDLE_TIMEOUT_OPTIONS`
- Save button calls `upsertUserSettings()`
- Toast notifications on success/error
- Form validation

**Design:**
- Follow slate color scheme
- 4px border radius
- Professional forms
- Clear section headers

---

### 2. Timer Integration with User Settings

**Files to Update:**
- `components/timer.tsx`

**Requirements:**

**A. Time Rounding on Stop:**
```typescript
import { roundTime, getRoundingDescription } from '@/lib/time-utils'
import { getUserSettingsWithDefaults } from '@/lib/user-settings'

// On handleStop:
const settings = await getUserSettingsWithDefaults(supabase, userId)
const roundedMinutes = roundTime(durationMinutes, settings.time_rounding)

// Show in UI if rounded:
const roundingDesc = getRoundingDescription(durationMinutes, roundedMinutes, settings.time_rounding)
if (roundingDesc) {
  toast.success('Time entry saved!', roundingDesc)
}
```

**B. Idle Detection Integration:**
```typescript
import { useIdleDetection } from '@/hooks/use-idle-detection'
import { IdleDetectionDialog } from './idle-detection-dialog'

// In Timer component:
const [settings, setSettings] = useState(null)
const [showIdleDialog, setShowIdleDialog] = useState(false)

// Load settings
useEffect(() => {
  async function loadSettings() {
    const userSettings = await getUserSettingsWithDefaults(supabase, userId)
    setSettings(userSettings)
  }
  loadSettings()
}, [userId])

// Use idle detection
const { isIdle, idleTime, resetIdle } = useIdleDetection({
  idleThreshold: (settings?.idle_timeout || 300) * 1000,
  enabled: isRunning && !isPaused && settings?.idle_timeout > 0,
})

// Show dialog when idle
useEffect(() => {
  if (isIdle && isRunning) {
    setShowIdleDialog(true)
    handlePause() // Auto-pause when idle detected
  }
}, [isIdle, isRunning])

// Handle idle actions:
const handleKeepAllTime = () => {
  setShowIdleDialog(false)
  resetIdle()
  handleResume()
}

const handleRemoveIdleTime = () => {
  const idleSeconds = Math.floor(idleTime)
  setTotalPausedTime(prev => prev + idleSeconds)
  setShowIdleDialog(false)
  resetIdle()
  handleResume()
}

const handleStopFromIdle = async () => {
  const idleSeconds = Math.floor(idleTime)
  setTotalPausedTime(prev => prev + idleSeconds)
  setShowIdleDialog(false)
  await handleStop()
}
```

---

### 3. View All Entries Page

**Files to Create:**
- `app/time-entries/page.tsx`
- `components/time-entries-table.tsx`

**Requirements:**

**Features:**
- Show all time entries with pagination (20 per page)
- Filters:
  - Client (dropdown)
  - Date range (start date, end date)
  - Amount range (min, max)
- Sort by: Date, Client, Duration, Amount (ascending/descending)
- Search by notes (text input)
- Bulk select checkboxes (for future bulk operations)
- Total hours and earnings summary at bottom
- Edit and Delete buttons per row
- Mobile responsive (cards on mobile, table on desktop)

**Layout:**
```
┌─────────────────────────────────────────┐
│ Time Entries                            │
│                                         │
│ [Filters: Client v] [Date: _ to _]     │
│ [Amount: $ _ to $ _] [Search: ___]     │
│                                         │
│ [ ] Date      Client   Duration  Amount │
│ [ ] 11/2/25   ABC Co   2h 30m   $125   │
│ [ ] 11/1/25   XYZ Inc  1h 15m   $75    │
│                                         │
│ Total: 3h 45m | $200                   │
└─────────────────────────────────────────┘
```

**Update `components/time-entries-list.tsx`:**
- Add at bottom: "View All Entries →" link
- Links to `/time-entries`

---

## MEDIUM PRIORITY FEATURES

### 4. Projects Feature (MAJOR)

**Database Migration:**
Create `supabase/migrations/create_projects.sql`:
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Add project_id to time_entries
ALTER TABLE time_entries ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
```

**Files to Create:**
- `app/projects/page.tsx` - Projects management page
- `components/projects-list.tsx` - List all projects
- `components/add-project-form.tsx` - Create/edit projects
- `lib/projects.ts` - CRUD functions

**Files to Update:**
- `components/timer.tsx` - Add project selector after client selected
- `components/add-time-entry-modal.tsx` - Add project dropdown
- Navigation - Add "Projects" link

**Features:**
- Projects belong to clients
- Optional budget tracking
- Status: Active, Completed, Archived
- Time entries can be tagged with projects
- Filter projects by client
- Filter projects by status

**Project Selector Logic:**
```typescript
// In Timer component:
const [selectedProjectId, setSelectedProjectId] = useState('')
const [projects, setProjects] = useState([])

// Load projects when client selected:
useEffect(() => {
  if (selectedClientId) {
    async function loadProjects() {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', selectedClientId)
        .eq('status', 'active')
        .order('name')

      if (data) {
        setProjects(data)
      }
    }
    loadProjects()
  }
}, [selectedClientId])

// Show project dropdown after client selected:
{selectedClientId && projects.length > 0 && (
  <select
    value={selectedProjectId}
    onChange={(e) => setSelectedProjectId(e.target.value)}
  >
    <option value="">No project</option>
    {projects.map(project => (
      <option key={project.id} value={project.id}>
        {project.name}
      </option>
    ))}
  </select>
)}
```

---

### 5. Project-Based Reporting

**Files to Update:**
- `components/reports-content.tsx`

**Requirements:**
- Add new section: "Project Breakdown"
- Similar layout to client breakdown
- Columns: Project Name, Client, Hours, Earnings, Budget Used %
- Filter by client to see their projects
- Visual budget vs actual comparison (progress bars)
- Over/under budget indicator (green/red)

**Calculations:**
```typescript
interface ProjectStats {
  projectId: string
  projectName: string
  clientName: string
  budget: number | null
  totalHours: number
  totalEarnings: number
  entryCount: number
  budgetUsedPercent: number
}

// Calculate stats:
const projectStats: ProjectStats[] = []
entries.forEach(entry => {
  if (entry.project_id) {
    // Aggregate by project
  }
})
```

**UI:**
```
┌─────────────────────────────────────────────┐
│ Project Breakdown                           │
│                                             │
│ Project A (Client ABC)                      │
│ Budget: $5,000 | Used: $4,200 (84%)        │
│ [████████████████░░░░] ← Progress bar       │
│                                             │
│ 42h | 15 entries | $100/hr avg             │
└─────────────────────────────────────────────┘
```

---

### 6. Bulk Operations

**Files to Update:**
- `components/time-entries-table.tsx` (in View All page)

**Requirements:**
- Checkbox in each row
- "Select All" checkbox in header
- Show bulk action toolbar when items selected
- Toolbar shows: "3 entries selected" + Clear + Actions
- Actions:
  1. **Bulk Delete** - Confirm dialog → Delete selected
  2. **Bulk Edit** - Modal to change client, project, or apply rate adjustment
  3. **Bulk Export CSV** - Export selected entries only

**Implementation:**
```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    setSelectedIds(new Set(entries.map(e => e.id)))
  } else {
    setSelectedIds(new Set())
  }
}

const handleSelectOne = (id: string, checked: boolean) => {
  const newSet = new Set(selectedIds)
  if (checked) {
    newSet.add(id)
  } else {
    newSet.delete(id)
  }
  setSelectedIds(newSet)
}

const handleBulkDelete = async () => {
  confirm(`Delete ${selectedIds.size} entries?`, async () => {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .in('id', Array.from(selectedIds))

    if (!error) {
      toast.success(`Deleted ${selectedIds.size} entries`)
      setSelectedIds(new Set())
      loadEntries()
    }
  })
}
```

**Toolbar UI:**
```typescript
{selectedIds.size > 0 && (
  <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-4 z-50">
    <span>{selectedIds.size} selected</span>
    <button onClick={() => setSelectedIds(new Set())}>Clear</button>
    <button onClick={handleBulkDelete}>Delete</button>
    <button onClick={handleBulkEdit}>Edit</button>
    <button onClick={handleBulkExport}>Export CSV</button>
  </div>
)}
```

---

## LOW PRIORITY ENHANCEMENTS

### 7. Better Empty States with Inline Actions

**Clients List Enhancement:**
Instead of:
```
┌─────────────────────┐
│ No clients yet      │
│ Add your first...   │
└─────────────────────┘
```

Show:
```
┌─────────────────────┐
│ Quick Add Client    │
│ Name: [_________]   │
│ Rate: [$______/hr]  │
│ [Add Client]        │
└─────────────────────┘
```

**Implementation:**
- Show inline form when empty
- After first client added, show normal list + "Add" button
- Reduces clicks for new users

---

## TESTING CHECKLIST

After implementing Part 3:

**Settings:**
- [ ] Load settings from database
- [ ] Save settings successfully
- [ ] Settings persist after page reload
- [ ] All dropdowns work correctly
- [ ] Validation prevents invalid values

**Time Rounding:**
- [ ] 15min rounding rounds up correctly
- [ ] 30min rounding rounds up correctly
- [ ] 1hour rounding rounds up correctly
- [ ] Toast shows rounding description
- [ ] Works with both timer and manual entries

**Idle Detection:**
- [ ] Idle dialog appears after threshold
- [ ] "Keep All Time" works correctly
- [ ] "Remove Idle Time" subtracts correctly
- [ ] "Stop Timer" stops and saves
- [ ] Can be disabled in settings
- [ ] Works with custom timeouts

**View All Entries:**
- [ ] Pagination works (20 per page)
- [ ] Client filter works
- [ ] Date range filter works
- [ ] Amount range filter works
- [ ] Search by notes works
- [ ] Sort by each column works
- [ ] Total calculations correct
- [ ] Mobile responsive

**Projects:**
- [ ] Create project
- [ ] Edit project
- [ ] Delete project
- [ ] Projects filtered by client
- [ ] Timer shows project selector
- [ ] Manual entry shows project selector
- [ ] Time entries save with project_id
- [ ] Can filter entries by project

**Project Reports:**
- [ ] Project breakdown shows
- [ ] Budget calculations correct
- [ ] Progress bars accurate
- [ ] Over/under budget indicators work
- [ ] Filter by client works

**Bulk Operations:**
- [ ] Select all works
- [ ] Select individual works
- [ ] Bulk delete works
- [ ] Bulk edit works
- [ ] Bulk export works
- [ ] Toolbar appears/disappears correctly

---

## ESTIMATED TIME

- Settings UI: 2 hours
- Timer Integration (rounding + idle): 2 hours
- View All Entries Page: 2-3 hours
- Projects Feature: 4-5 hours
- Project Reports: 1-2 hours
- Bulk Operations: 2 hours
- Testing & Polish: 1-2 hours

**Total: 14-18 hours**

---

## NOTES

- Prioritize Settings UI and Timer Integration first (most impactful)
- Projects feature is large - break into sub-tasks
- View All Entries can be simplified if needed (remove some filters)
- Bulk operations nice-to-have, can be saved for later
- Keep mobile responsiveness in mind for all new features
- Follow existing design patterns (slate colors, 4px radius)
- Use existing toast, confirm, and button components
- Maintain TypeScript type safety

---

## SUCCESS CRITERIA

Part 3 is complete when:
1. ✅ User can save and load settings from profile page
2. ✅ Timer applies time rounding based on user setting
3. ✅ Idle detection works and integrates with timer
4. ✅ View All Entries page functional with filters
5. ✅ Projects can be created and assigned to time entries
6. ✅ Project reports show budget tracking
7. ✅ Bulk operations work on time entries
8. ✅ All TypeScript compiles without errors
9. ✅ All ESLint rules pass
10. ✅ Mobile responsive across all new features

---

*Ready to begin Part 3 implementation.*

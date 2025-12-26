# ClickUp Dashboard - Client Requirements (Alex - Horizons ABA)

**Transcript Date:** December 25, 2024
**Client:** Alexander Apfel (Alex)
**Project:** Etherwise ClickUp Dashboard for Project Tracking

---

## Overview

Alex needs a comprehensive project tracking dashboard that pulls data from ClickUp to monitor project hours, completion timelines, and team workload across all active projects in the "Projects" folder within the "Horizons ABA" space.

---

## Core Dashboard Features Requested

### 1. **Primary Metrics Display**

Alex explicitly requested the following top-level metrics:

- ✅ **Total Hours Spent** - Sum of all time tracked across all projects
- ✅ **Total Hours Estimated** - Sum of all time estimates across all projects
- ✅ **Total Hours Remaining** - Calculated remaining hours for incomplete tasks
- ✅ **Weeks to Completion** - Timeline projection based on team capacity

**Status:** ✅ Currently implemented in basic form

---

### 2. **Weekly/Time-Based Tracking**

> **Alex (10:05):** "And then will this be included, so then you'll also, on this dashboard, are you also going to track on a weekly basis, like how many hours were spent on every given project, on any given time frame, and then also how much time is spent on debugging, you know, fixes and things like that?"

**Requirements:**
- Track hours spent **per project on a weekly basis**
- Filter by **any given time frame** (custom date ranges)
- Separate tracking for:
  - **Development hours** (new features)
  - **Debugging/fixing hours** (tagged differently in ClickUp)
  - **Error fixing** (separate category)

**Implementation Notes:**
- Use ClickUp tags to differentiate between development vs debugging work
- Need time-series data visualization
- Weekly breakdown view for each project

**Status:** ⚠️ **NOT YET IMPLEMENTED** - This is a new requirement

---

### 3. **Project Status Management**

> **Alex (11:55):** "The next step of this project is I would want to do it for any of the big projects we've already done, like add them in as completed, you know, like there should be a status of like in progress, not started, completed, and then it would move it out of the dashboard or maybe it would have a different view..."

**Requirements:**
- **Project statuses:**
  - Not Started
  - In Progress
  - Completed

- **Completed projects handling:**
  - Option to either:
    - **Move out of main dashboard** (separate view), OR
    - **Keep in dashboard** with different visual treatment

- **Historical view:**
  - Ability to filter by time frame (e.g., "whole year")
  - View completed projects with their metrics
  - Answer: "What projects did we complete and how many hours did they take?"

**Status:** ⚠️ **NOT YET IMPLEMENTED** - Critical feature

---

### 4. **Estimated Due Dates**

> **Alex (8:40):** "No, this is great, this is great, our remaining, and then like there should be an estimated due date for each task also."

**Requirements:**
- Show **estimated due date for each task**
- Pull from ClickUp due date fields
- Display at task level, not just project level

**Status:** ⚠️ **PARTIALLY IMPLEMENTED** - Need to verify task-level due dates are shown

---

### 5. **Dashboard for Review Team (Secondary Request)**

> **Alex (52:36):** "So that would be for the review team, but I also want that in the dashboard, we'll give access to the dashboard to the review team, and there will be a section that kind of looks like that table, right? Like, client, BCBA, status, link, so they can just go into the dashboard every day in the morning..."

**Context:** This relates to treatment plans/progress reports, NOT the project tracker

**Requirements:**
- Separate section in a dashboard (not necessarily THIS dashboard)
- Shows treatment plans with:
  - Client name
  - BCBA assigned
  - Status (Draft, Submitted for Review, Feedback Submitted, etc.)
  - Link to Google Doc
  - Responsible party (whose court it's in)
  - Due date for next step

**Status:** ⚠️ **OUT OF SCOPE** - This is for a different workflow (treatment plans), not the ClickUp project tracker

---

## Data Requirements

### From ClickUp API

1. **Tasks in each List (Project):**
   - Task name
   - Time estimate (milliseconds)
   - Time spent/tracked (milliseconds)
   - Status (open/closed/custom)
   - Due date
   - Tags (for categorization: development vs debugging)
   - Creation date / completion date

2. **Lists (Projects) in Folder:**
   - List ID
   - List name
   - Status (if applicable)

3. **Time tracking entries:**
   - Task ID
   - Duration
   - Start/end timestamps
   - User who tracked time
   - **Weekly aggregation needed**

---

## Priority Features Summary

### Phase 1 - ✅ COMPLETE
- [x] Basic dashboard with total hours (spent, estimated, remaining)
- [x] Weeks to completion calculation
- [x] Project cards showing individual project metrics
- [x] Progress bars and percentages
- [x] Pull data from ClickUp API
- [x] Auto-refresh every 5 minutes

### Phase 2 - 🚧 IN PROGRESS (What Alex is asking for)
- [ ] **Weekly time tracking breakdown**
  - Hours per project per week
  - Custom time frame filtering
  - Development vs Debugging hour separation (via tags)

- [ ] **Project status management**
  - Add status field: Not Started, In Progress, Completed
  - Completed projects view (separate or filtered)
  - Historical project view with time frame selector

- [ ] **Task-level due dates display**
  - Show estimated due dates for each task
  - Highlight overdue tasks

- [ ] **Enhanced filtering & views**
  - Filter by date range
  - Filter by project status
  - Filter by tag (debugging vs development)

### Phase 3 - Future Enhancements
- [ ] User assignment tracking (who worked on what)
- [ ] Budget tracking (hours over/under budget alerts)
- [ ] Export functionality (reports)
- [ ] Gantt chart integration (mentioned in transcript)
- [ ] Treatment plan dashboard (separate workflow)

---

## Technical Implementation Notes

### Tags for Work Type Categorization

Alex mentioned using **tags** to differentiate:
- **Development** - New features, enhancements
- **Debugging** - Bug fixes, error resolution
- **Maintenance** - Ongoing support

**Action:** Need to establish tag naming convention in ClickUp

### Time Frame Filtering

Need to implement:
- **Date range selector** (from date - to date)
- **Preset filters:**
  - This week
  - Last week
  - This month
  - Last month
  - This quarter
  - This year
  - All time
  - Custom range

### Project Status Tracking

**Options:**
1. Use ClickUp List status if available
2. Use custom field in ClickUp
3. Infer from task completion (if all tasks closed = completed)

**Recommendation:** Use custom dropdown field in ClickUp for explicit control

### Completed Projects Handling

**Option A:** Two separate views
- Active Projects view (default)
- Completed Projects view (archive)

**Option B:** Toggle/filter on single view
- Show All / Show Active / Show Completed

**Recommendation:** Start with Option A, add Option B later if needed

---

## Data Visualization Requirements

### Weekly Breakdown View (NEW)

```
Project: Onboarding E2E
├── Week of Dec 18-24:
│   ├── Development: 12h
│   ├── Debugging: 3h
│   └── Total: 15h
├── Week of Dec 11-17:
│   ├── Development: 8h
│   ├── Debugging: 5h
│   └── Total: 13h
└── Total: 28h
```

**Visualization:** Could be:
- Bar chart (hours per week)
- Stacked bar chart (dev vs debug)
- Table with drill-down

### Historical Projects View (NEW)

```
Completed Projects (2024)
┌──────────────────┬────────────┬─────────────┬──────────────┐
│ Project          │ Completed  │ Hours Spent │ Hours Est.   │
├──────────────────┼────────────┼─────────────┼──────────────┤
│ Interview E2E    │ Dec 2024   │ 45h         │ 40h (+5h)    │
│ Gmail Labeling   │ Nov 2024   │ 32h         │ 35h (-3h)    │
└──────────────────┴────────────┴─────────────┴──────────────┘
```

---

## Questions for Alex

### 1. **Weekly Tracking Granularity**
- Do you want to see hours broken down by:
  - [ ] Week only?
  - [ ] Week + Day?
  - [ ] Week + User (who worked when)?

### 2. **Tag Structure in ClickUp**
- What tags are you currently using or planning to use for categorizing work?
  - Development / Feature / Enhancement?
  - Bug / Debug / Fix?
  - Maintenance / Support?
- Should we create a standard tag naming convention?

### 3. **Project Status Management**
- How do you want to mark projects as "Completed" or "Not Started"?
  - [ ] Add a custom field in ClickUp Lists?
  - [ ] Manually update in dashboard?
  - [ ] Auto-detect (all tasks closed = completed)?

### 4. **Completed Projects Display**
- When a project is marked "Completed", should it:
  - [ ] Move to a separate "Archive" view?
  - [ ] Stay on main dashboard but grayed out/collapsed?
  - [ ] Completely hidden with a toggle to show?

### 5. **Time Frame Filtering**
- What time periods are most important to you?
  - [ ] Current week/month (default view)?
  - [ ] Quarterly reviews?
  - [ ] Year-end summaries?
  - [ ] Custom date range selector?

### 6. **Historical Data**
- How far back do you want to import past project data?
  - [ ] Just 2024?
  - [ ] Last 6 months?
  - [ ] All available data?
- Do you have historical time tracking data in ClickUp already, or will this be prospective only?

### 7. **Debugging vs Development Hours**
- How strict do you need the separation between development and debugging hours?
  - [ ] Critical for billing/analysis?
  - [ ] Nice to have but not essential?
- Should debugging hours count toward project "budget" differently?

### 8. **Team Size Configuration**
- You mentioned team size affects the "weeks to completion" calculation
- Currently set to 1 person @ 40h/week
- What's your actual team composition?
  - How many developers?
  - What's their weekly capacity?
  - Does this change per project or is it global?

### 9. **Due Date Tracking**
- For task due dates, do you want:
  - [ ] Just display the date?
  - [ ] Color coding (red if overdue, yellow if soon)?
  - [ ] Notifications/alerts for overdue tasks?

### 10. **Budget/Variance Alerts**
- Do you want visual alerts when projects are over budget?
  - [ ] Red highlight if hours spent > hours estimated?
  - [ ] Percentage over budget indicator?
  - [ ] Email notifications when threshold exceeded?

### 11. **Gantt Chart Integration**
- You mentioned using Gantt charts in ClickUp
- Do you want Gantt view embedded in this dashboard, or is ClickUp sufficient?

### 12. **Export/Reporting**
- Do you need to export this data for reports?
  - [ ] CSV export?
  - [ ] PDF report generation?
  - [ ] Email scheduled reports (weekly summary)?

---

## Timeline & Priorities

Based on transcript, Alex mentioned:
- **Basic dashboard:** "Tomorrow" (Dec 26) ✅ DONE
- **Correct hours added to ClickUp:** "By end of week" (Dec 27)
- **These new features:** NOT DISCUSSED - Need clarification

**Suggested Priority Order:**
1. **Project Status Management** (High) - Alex specifically asked for this
2. **Weekly/Time-based Tracking** (High) - Explicitly requested for analysis
3. **Task Due Dates Display** (Medium) - Nice to have
4. **Historical Completed Projects View** (Medium) - For yearly review
5. **Enhanced Filtering** (Low) - Can add iteratively

---

## Notes

- Alex is satisfied with the current basic implementation
- The main goal is to understand "how many hours remaining" to prioritize which projects to push to completion
- Working on "so many projects" makes it hard to get any to completion - needs visibility
- Dashboard should help with resource allocation decisions
- Alex expanding team in India (credentialing, billing, auth) - may need multi-team tracking later

---

## Next Steps

1. Get answers to clarifying questions above
2. Prioritize Phase 2 features with Alex
3. Design UI mockups for:
   - Weekly breakdown view
   - Project status selector
   - Completed projects view
   - Time frame filter controls
4. Estimate development time for each feature
5. Get approval before implementation

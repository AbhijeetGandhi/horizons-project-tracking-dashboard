# Etherwise ClickUp Dashboard

A real-time project tracking dashboard for ClickUp, built with Next.js 15, designed to monitor project hours, timelines, and team capacity.

![Dashboard Preview](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)

## Features

### 📊 Project Tracking
- **Real-time Metrics**: Hours spent, estimated, and remaining for each project
- **Project Status**: Automatic detection of Not Started, In Progress, and Completed
- **Progress Tracking**: Visual progress bars and completion percentages
- **Task Overview**: Task count and completion tracking with subtasks support

### 📅 Time Tracking
- **Weekly Breakdown**: Interactive charts and tables showing hours per week
- **Time Period Filters**: View by Week, Month, Quarter, or Year
- **Project Breakdown**: See which projects consumed time each week
- **Due Date Tracking**: Next due date display with overdue highlighting

### 🎯 Team Capacity Planning
- **Weeks to Completion**: Automatic calculation based on team size and capacity
- **Team Configuration**: Customizable team size and hours per week
- **Active vs Completed**: Separate views for active and archived projects
- **Budget Tracking**: Visual indicators when projects exceed estimates

### 🔄 Real-Time Updates
- **Manual Refresh**: Refresh button to pull latest data
- **Server-Side Caching**: 30-second revalidation for optimal performance
- **Auto-Detection**: Automatic completion detection via "launch" tasks

## Tech Stack

- **Framework**: Next.js 15.5.9 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **API**: ClickUp API v2
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- ClickUp account with API access
- ClickUp workspace with a "Projects" folder structure

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd etherwise-clickup-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

4. Edit `.env.local` with your ClickUp credentials:

```env
CLICKUP_API_TOKEN=your_api_token_here
CLICKUP_TEAM_ID=your_team_id
CLICKUP_SPACE_ID=your_space_id
CLICKUP_PROJECTS_FOLDER_ID=your_folder_id
TEAM_SIZE=4
HOURS_PER_WEEK=75
```

5. Find your ClickUp IDs (if you don't know them):
```bash
npm run find-ids
```

6. Run the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run find-ids` - Find your ClickUp IDs
- `npm run test-data` - Test data fetching and display summary
- `npm run debug-time` - Debug raw time tracking data
- `npm run debug-full` - Debug full task objects

## Project Structure

```
etherwise-clickup-dashboard/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Main dashboard
│   ├── completed/           # Completed projects page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ProjectCard.tsx      # Individual project card
│   ├── ProjectsTable.tsx    # Projects data table
│   ├── SummaryCards.tsx     # Summary metrics cards
│   ├── WeeklyChart.tsx      # Weekly hours bar chart
│   ├── WeeklyTable.tsx      # Weekly breakdown table
│   ├── TimePeriodFilter.tsx # Time range selector
│   └── RefreshButton.tsx    # Manual refresh control
├── lib/                     # Core logic
│   ├── clickup-client.ts    # ClickUp API client
│   ├── project-service.ts   # Project data aggregation
│   └── weekly-service.ts    # Weekly tracking logic
├── scripts/                 # Utility scripts
│   ├── find-ids.ts         # Find ClickUp IDs
│   └── test-data.ts        # Test data fetching
└── public/                  # Static assets
```

## API Rate Limits

ClickUp API rate limits vary by plan:
- **Free/Unlimited/Business**: 100 requests/minute
- **Business Plus**: 1,000 requests/minute
- **Enterprise**: 10,000 requests/minute

The dashboard caches data for 5 minutes to stay well within limits.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add your environment variables in Vercel project settings
4. Deploy

### Other Platforms

Build the production version:

```bash
npm run build
npm run start
```

Ensure all environment variables are set in your hosting platform.

## Customization

### Adjust Refresh Rate

In `app/page.tsx`, modify the `revalidate` value (in seconds):

```typescript
export const revalidate = 300; // 5 minutes
```

### Change Team Configuration

Update `TEAM_SIZE` and `HOURS_PER_WEEK` in `.env.local`:

```env
TEAM_SIZE=5
HOURS_PER_WEEK=35
```

### Modify Project Sorting

In `lib/project-service.ts`, change the sort logic in `getDashboardSummary`:

```typescript
// Sort by name
projects.sort((a, b) => a.name.localeCompare(b.name))

// Sort by completion percentage
projects.sort((a, b) => b.percentComplete - a.percentComplete)
```

## Troubleshooting

### "Configuration Error" Message

- Verify all required environment variables are set
- Check that your API token is valid (starts with `pk_`)
- Ensure IDs are correct (no extra characters)

### No Projects Showing

- Verify the folder ID is correct
- Check that the folder contains lists (projects)
- Ensure your API token has access to the folder

### Rate Limit Errors

- Reduce the revalidate frequency
- Upgrade your ClickUp plan for higher limits
- Implement additional caching if needed

## License

MIT

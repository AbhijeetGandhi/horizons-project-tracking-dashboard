# Deploying to Vercel

This guide will help you deploy the ClickUp Dashboard to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your ClickUp API credentials

## Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Configure your project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. Add Environment Variables in the Vercel dashboard:
   - `CLICKUP_API_TOKEN` - Your ClickUp API token
   - `CLICKUP_TEAM_ID` - Your ClickUp team/workspace ID
   - `CLICKUP_SPACE_ID` - Your space ID
   - `CLICKUP_PROJECTS_FOLDER_ID` - Your projects folder ID
   - `TEAM_SIZE` - Number of people on your team (e.g., `4`)
   - `HOURS_PER_WEEK` - Hours per week per person (e.g., `75`)

6. Click "Deploy"

### Option B: Deploy via CLI

1. Login to Vercel:
```bash
vercel login
```

2. Deploy from your project directory:
```bash
vercel
```

3. Follow the prompts to configure your project

4. Add environment variables:
```bash
vercel env add CLICKUP_API_TOKEN
vercel env add CLICKUP_TEAM_ID
vercel env add CLICKUP_SPACE_ID
vercel env add CLICKUP_PROJECTS_FOLDER_ID
vercel env add TEAM_SIZE
vercel env add HOURS_PER_WEEK
```

5. Redeploy with environment variables:
```bash
vercel --prod
```

## Step 3: Finding Your ClickUp IDs

If you don't know your ClickUp IDs, run this locally:

```bash
npm run find-ids
```

This will display:
- Team ID
- All your spaces with their IDs
- All folders in each space with their IDs

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `CLICKUP_API_TOKEN` | Your ClickUp API token from Settings > Apps | `pk_123456_ABC...` |
| `CLICKUP_TEAM_ID` | Your workspace/team ID | `9016735299` |
| `CLICKUP_SPACE_ID` | The space containing your Projects folder | `90164727594` |
| `CLICKUP_PROJECTS_FOLDER_ID` | The "Projects" folder ID | `90167853057` |
| `TEAM_SIZE` | Number of people on your team | `4` |
| `HOURS_PER_WEEK` | Average hours per person per week | `75` |

## Post-Deployment

1. Visit your deployed URL (e.g., `your-project.vercel.app`)
2. Verify the dashboard loads correctly
3. Check that all projects are displayed
4. Test the refresh functionality

## Troubleshooting

### Build Fails

- Check that all environment variables are set correctly
- Ensure your ClickUp API token is valid
- Review build logs in the Vercel dashboard

### Data Not Loading

- Verify your ClickUp IDs are correct
- Check your API token has the necessary permissions
- Look at Function Logs in Vercel dashboard for errors

### Slow Loading

- The dashboard fetches data on each request
- Consider adjusting the `revalidate` setting in `app/page.tsx` (currently 30 seconds)
- Vercel caches responses based on the revalidate setting

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Automatic Deployments

Vercel automatically deploys when you push to your Git repository:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment

## Security Notes

- Never commit `.env.local` or `.env` files
- Environment variables in Vercel are encrypted
- Limit ClickUp API token permissions to read-only if possible
- Consider adding authentication to your dashboard if deploying publicly

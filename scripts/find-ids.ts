/**
 * Helper script to find your ClickUp IDs
 * Run with: npx tsx scripts/find-ids.ts
 */

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';

async function findClickUpIds() {
  // Get API token from command line or environment
  const apiToken = process.env.CLICKUP_API_TOKEN || process.argv[2];

  if (!apiToken) {
    console.error('❌ Error: No API token provided');
    console.log('\nUsage:');
    console.log('  CLICKUP_API_TOKEN=your_token npx tsx scripts/find-ids.ts');
    console.log('  OR');
    console.log('  npx tsx scripts/find-ids.ts your_token');
    console.log('\nGet your API token from: https://app.clickup.com/settings/apps');
    process.exit(1);
  }

  console.log('🔍 Fetching your ClickUp workspace structure...\n');

  try {
    // 1. Get Teams/Workspaces
    console.log('📁 STEP 1: Finding your workspaces (teams)...');
    const teamsResponse = await fetch(`${CLICKUP_API_BASE}/team`, {
      headers: { 'Authorization': apiToken }
    });

    if (!teamsResponse.ok) {
      throw new Error(`API Error: ${teamsResponse.status} - ${await teamsResponse.text()}`);
    }

    const teamsData = await teamsResponse.json();
    const teams = teamsData.teams;

    if (!teams || teams.length === 0) {
      console.log('❌ No workspaces found');
      return;
    }

    console.log(`✅ Found ${teams.length} workspace(s):\n`);
    teams.forEach((team: any, idx: number) => {
      console.log(`${idx + 1}. ${team.name}`);
      console.log(`   CLICKUP_TEAM_ID=${team.id}\n`);
    });

    // Use the first team
    const teamId = teams[0].id;
    console.log(`📌 Using workspace: ${teams[0].name} (ID: ${teamId})\n`);

    // 2. Get Spaces
    console.log('📁 STEP 2: Finding spaces in this workspace...');
    const spacesResponse = await fetch(`${CLICKUP_API_BASE}/team/${teamId}/space`, {
      headers: { 'Authorization': apiToken }
    });

    if (!spacesResponse.ok) {
      throw new Error(`API Error: ${spacesResponse.status} - ${await spacesResponse.text()}`);
    }

    const spacesData = await spacesResponse.json();
    const spaces = spacesData.spaces;

    if (!spaces || spaces.length === 0) {
      console.log('❌ No spaces found in this workspace');
      return;
    }

    console.log(`✅ Found ${spaces.length} space(s):\n`);
    spaces.forEach((space: any, idx: number) => {
      console.log(`${idx + 1}. ${space.name}`);
      console.log(`   CLICKUP_SPACE_ID=${space.id}\n`);
    });

    // 3. Get Folders for each space
    console.log('📁 STEP 3: Finding folders in each space...\n');

    for (const space of spaces) {
      console.log(`Space: ${space.name} (ID: ${space.id})`);

      const foldersResponse = await fetch(`${CLICKUP_API_BASE}/space/${space.id}/folder`, {
        headers: { 'Authorization': apiToken }
      });

      if (!foldersResponse.ok) {
        console.log(`   ⚠️  Could not fetch folders: ${foldersResponse.status}`);
        continue;
      }

      const foldersData = await foldersResponse.json();
      const folders = foldersData.folders;

      if (!folders || folders.length === 0) {
        console.log(`   📋 No folders (using folderless lists)\n`);

        // Get folderless lists
        const listsResponse = await fetch(`${CLICKUP_API_BASE}/space/${space.id}/list`, {
          headers: { 'Authorization': apiToken }
        });

        if (listsResponse.ok) {
          const listsData = await listsResponse.json();
          const lists = listsData.lists;

          if (lists && lists.length > 0) {
            console.log(`   📄 Folderless Lists:`);
            lists.forEach((list: any) => {
              console.log(`      - ${list.name} (ID: ${list.id})`);
            });
          }
        }
        console.log();
        continue;
      }

      console.log(`   ✅ Found ${folders.length} folder(s):\n`);

      for (const folder of folders) {
        console.log(`   📂 ${folder.name}`);
        console.log(`      CLICKUP_PROJECTS_FOLDER_ID=${folder.id}`);

        // Get lists in this folder
        const listsResponse = await fetch(`${CLICKUP_API_BASE}/folder/${folder.id}/list`, {
          headers: { 'Authorization': apiToken }
        });

        if (listsResponse.ok) {
          const listsData = await listsResponse.json();
          const lists = listsData.lists;

          if (lists && lists.length > 0) {
            console.log(`      📋 Contains ${lists.length} list(s):`);
            lists.forEach((list: any) => {
              console.log(`         - ${list.name} (ID: ${list.id})`);
            });
          }
        }
        console.log();
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📝 SUMMARY - Copy these to your .env.local file:');
    console.log('='.repeat(60) + '\n');

    console.log(`CLICKUP_API_TOKEN=${apiToken}`);
    console.log(`CLICKUP_TEAM_ID=${teamId}`);

    if (spaces.length > 0) {
      console.log(`CLICKUP_SPACE_ID=${spaces[0].id}  # ${spaces[0].name}`);
    }

    console.log(`CLICKUP_PROJECTS_FOLDER_ID=  # ⚠️  SET THIS to your "Projects" folder ID from above`);
    console.log('\n# Optional: Team configuration');
    console.log('TEAM_SIZE=1');
    console.log('HOURS_PER_WEEK=40');

    console.log('\n' + '='.repeat(60));
    console.log('✅ Done! Look for your "Projects" folder above and copy its ID.');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    console.log('\nTroubleshooting:');
    console.log('1. Verify your API token is correct');
    console.log('2. Get a new token from: https://app.clickup.com/settings/apps');
    console.log('3. Ensure the token has access to your workspace');
    process.exit(1);
  }
}

findClickUpIds();

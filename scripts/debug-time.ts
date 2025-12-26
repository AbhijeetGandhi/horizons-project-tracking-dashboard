import { createClickUpClient } from '../lib/clickup-client';

async function debugTime() {
  const client = createClickUpClient();
  const folderId = process.env.CLICKUP_PROJECTS_FOLDER_ID || '90167853057';

  console.log('Fetching lists in folder...\n');
  const lists = await client.getListsInFolder(folderId);

  const techList = lists.find(l =>
    l.name.toLowerCase().includes('technician') ||
    l.name.toLowerCase().includes('check-in')
  );

  if (!techList) {
    console.log('Technician Check-in list not found');
    return;
  }

  console.log(`Found list: ${techList.name} (ID: ${techList.id})\n`);

  const tasks = await client.getAllTasksInList(techList.id);

  console.log('=== Raw Task Data ===\n');
  tasks.forEach(task => {
    console.log(`Task: ${task.name}`);
    console.log(`  Status: ${task.status.status} (type: ${task.status.type})`);
    console.log(`  time_estimate: ${task.time_estimate} ms`);
    console.log(`  time_spent: ${task.time_spent} ms`);

    if (task.time_estimate) {
      const hours = task.time_estimate / 1000 / 60 / 60;
      console.log(`  Estimated hours: ${hours}h`);
    }
    if (task.time_spent) {
      const hours = task.time_spent / 1000 / 60 / 60;
      console.log(`  Spent hours: ${hours}h`);
    }
    console.log('');
  });

  const totalEstimateMs = tasks.reduce((sum, t) => sum + (t.time_estimate || 0), 0);
  const totalSpentMs = tasks.reduce((sum, t) => sum + (t.time_spent || 0), 0);

  console.log('=== Totals ===');
  console.log(`Total Estimated: ${totalEstimateMs / 1000 / 60 / 60}h (${totalEstimateMs} ms)`);
  console.log(`Total Spent: ${totalSpentMs / 1000 / 60 / 60}h (${totalSpentMs} ms)`);
}

debugTime().catch(console.error);

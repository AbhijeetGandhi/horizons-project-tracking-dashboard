import { createClickUpClient } from '../lib/clickup-client';

async function debugFullTask() {
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

  console.log('=== Full Task Object (First Task) ===\n');
  if (tasks.length > 0) {
    console.log(JSON.stringify(tasks[0], null, 2));
  }

  console.log('\n\n=== All Tasks Summary ===\n');
  tasks.forEach(task => {
    console.log(`\nTask: ${task.name}`);
    console.log(`Raw task object keys:`, Object.keys(task));

    // Check for any time-related fields
    Object.keys(task).forEach(key => {
      if (key.toLowerCase().includes('time') || key.toLowerCase().includes('track')) {
        console.log(`  ${key}:`, (task as any)[key]);
      }
    });
  });
}

debugFullTask().catch(console.error);

import { createClickUpClient } from '../lib/clickup-client';
import { getDashboardSummary } from '../lib/project-service';

async function testData() {
  const client = createClickUpClient();
  const folderId = process.env.CLICKUP_PROJECTS_FOLDER_ID || '90167853057';

  console.log('Fetching latest data...\n');
  const summary = await getDashboardSummary(client, folderId);

  // Find technician check-in project
  const techCheckin = summary.projects.find(p =>
    p.name.toLowerCase().includes('technician') ||
    p.name.toLowerCase().includes('check-in')
  );

  if (techCheckin) {
    console.log('=== Technician Check-in Project ===');
    console.log('Name:', techCheckin.name);
    console.log('Status:', techCheckin.status);
    console.log('Hours Spent:', techCheckin.hoursSpent);
    console.log('Hours Estimated:', techCheckin.hoursEstimated);
    console.log('Hours Remaining:', techCheckin.hoursRemaining);
    console.log('Completed Tasks:', techCheckin.completedTaskCount, '/', techCheckin.taskCount);
    console.log('Is Launched:', techCheckin.isLaunched);
    console.log('\nTasks:');
    techCheckin.tasks.forEach(task => {
      console.log(`  - ${task.name}`);
      console.log(`    Status: ${task.status} (${task.statusType})`);
      console.log(`    Completed: ${task.isCompleted}`);
      console.log(`    Hours: ${task.hoursSpent}h spent / ${task.hoursEstimated}h estimated`);
    });
  } else {
    console.log('Technician Check-in project not found');
  }

  console.log('\n=== All Projects Summary ===');
  summary.projects.forEach(p => {
    console.log(`${p.name}: ${p.hoursSpent}h spent, ${p.status}, ${p.completedTaskCount}/${p.taskCount} tasks`);
  });
}

testData().catch(console.error);

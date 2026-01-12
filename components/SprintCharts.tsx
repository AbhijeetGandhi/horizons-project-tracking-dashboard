'use client';

import { SprintSummary } from '@/lib/sprint-service';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface SprintChartsProps {
  sprintSummary: SprintSummary;
}

const COLORS = {
  development: '#3B82F6', // blue-500
  maintenance: '#F97316', // orange-500
};

const PROJECT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#8B5CF6', // violet
  '#F59E0B', // amber
  '#EF4444', // red
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#F97316', // orange
];

export function SprintCharts({ sprintSummary }: SprintChartsProps) {
  // Prepare data for weekly stacked bar chart
  const weeklyData = sprintSummary.sprints.map((sprint) => {
    // Extract sprint number for shorter label
    const sprintNum = sprint.name.match(/\d+/)?.[0] || sprint.name;
    return {
      name: `S${sprintNum}`,
      fullName: sprint.name,
      dateRange: sprint.dateRange,
      Development: sprint.developmentHours,
      Maintenance: sprint.maintenanceHours,
      total: sprint.totalHours,
    };
  });

  // Prepare data for pie chart (overall breakdown)
  const pieData = [
    { name: 'Development', value: sprintSummary.totalDevelopmentHours, color: COLORS.development },
    { name: 'Maintenance', value: sprintSummary.totalMaintenanceHours, color: COLORS.maintenance },
  ];

  // Prepare data for project breakdown chart
  const projectData = sprintSummary.projectBreakdown.slice(0, 10).map((project, idx) => ({
    name: project.projectName.length > 15
      ? project.projectName.substring(0, 15) + '...'
      : project.projectName,
    fullName: project.projectName,
    Development: project.developmentHours,
    Maintenance: project.maintenanceHours,
    total: project.totalHours,
    color: PROJECT_COLORS[idx % PROJECT_COLORS.length],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{data.fullName || label}</p>
          {data.dateRange && (
            <p className="text-xs text-gray-500 mb-2">{data.dateRange}</p>
          )}
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}h
            </p>
          ))}
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
            Total: {data.total}h
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Weekly Dev vs Maintenance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weekly Development vs Maintenance
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={{ stroke: '#6B7280' }}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={{ stroke: '#6B7280' }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Development" stackId="a" fill={COLORS.development} />
              <Bar dataKey="Maintenance" stackId="a" fill={COLORS.maintenance} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two column layout for pie chart and project breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overall Breakdown Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Overall Time Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}h`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.development }} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Development ({sprintSummary.totalDevelopmentHours}h)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.maintenance }} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Maintenance ({sprintSummary.totalMaintenanceHours}h)
              </span>
            </div>
          </div>
        </div>

        {/* Project Breakdown Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Time by Project (Top 10)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={projectData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                <XAxis
                  type="number"
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  tickLine={{ stroke: '#6B7280' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  tickLine={{ stroke: '#6B7280' }}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Development" stackId="a" fill={COLORS.development} />
                <Bar dataKey="Maintenance" stackId="a" fill={COLORS.maintenance} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Project Breakdown Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Project Time Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Development
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Maintenance
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Maintenance %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sprintSummary.projectBreakdown.map((project) => (
                <tr key={project.projectName} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {project.projectName}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-blue-600 dark:text-blue-400">
                    {project.developmentHours}h
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-orange-600 dark:text-orange-400">
                    {project.maintenanceHours}h
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">
                    {project.totalHours}h
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                    {project.totalHours > 0
                      ? ((project.maintenanceHours / project.totalHours) * 100).toFixed(1)
                      : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

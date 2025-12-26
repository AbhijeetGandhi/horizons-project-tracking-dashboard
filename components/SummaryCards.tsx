import { DashboardSummary } from '@/lib/project-service';

interface SummaryCardsProps {
  summary: DashboardSummary;
  teamSize?: number;
  hoursPerWeek?: number;
}

export function SummaryCards({
  summary,
  teamSize = 1,
  hoursPerWeek = 40
}: SummaryCardsProps) {
  // Calculate weeks to completion
  const weeksToCompletion = summary.totalHoursRemaining > 0
    ? Math.ceil(summary.totalHoursRemaining / (teamSize * hoursPerWeek))
    : 0;

  const stats = [
    {
      label: 'Total Hours Spent',
      value: `${summary.totalHoursSpent}h`,
      color: 'blue',
    },
    {
      label: 'Total Hours Estimated',
      value: `${summary.totalHoursEstimated}h`,
      color: 'gray',
    },
    {
      label: 'Total Hours Remaining',
      value: `${summary.totalHoursRemaining}h`,
      color: 'orange',
    },
    {
      label: 'Weeks to Completion',
      value: weeksToCompletion > 0 ? `~${weeksToCompletion} weeks` : 'Complete',
      color: 'green',
      subtitle: `Based on ${teamSize} person(s) @ ${hoursPerWeek}h/week`,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
      gray: { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
      green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const colors = getColorClasses(stat.color);
        return (
          <div
            key={stat.label}
            className={`${colors.bg} rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700`}
          >
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {stat.label}
            </div>
            <div className={`text-3xl font-bold ${colors.text}`}>
              {stat.value}
            </div>
            {stat.subtitle && (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {stat.subtitle}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

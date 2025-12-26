'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AutoRefreshProps {
  interval?: number; // in seconds
}

export function AutoRefresh({ interval = 30 }: AutoRefreshProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(interval);

  useEffect(() => {
    // Refresh the page data
    const refreshInterval = setInterval(() => {
      router.refresh();
      setCountdown(interval);
    }, interval * 1000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return interval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [router, interval]);

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Auto-refresh in {countdown}s</span>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface TimeAgoProps {
  date: string | Date;
  updateInterval?: number;
}

export function TimeAgo({ date, updateInterval = 60000 }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTimeAgo(formatDistanceToNow(new Date(date), { addSuffix: true }));
    };

    updateTime();
    const interval = setInterval(updateTime, updateInterval);

    return () => clearInterval(interval);
  }, [date, updateInterval]);

  return <span>{timeAgo}</span>;
}
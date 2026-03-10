import { useState, useEffect } from 'react';
import { Match } from '@/types/tournament';

export default function LiveTimer({ match }: { match: Match }) {
    const [, setTicks] = useState(0);

    useEffect(() => {
        if (match.status !== 'live' && match.status !== 'extra_time') {
            return;
        }

        const interval = setInterval(() => {
            setTicks(t => t + 1); // trigger re-render
        }, 1000);

        return () => clearInterval(interval);
    }, [match.status]);

    let totalSeconds = 0;
    if (match.timerStartedAt) {
        const activeSeconds = match.status === 'live' || match.status === 'extra_time'
            ? Math.floor((Date.now() - match.timerStartedAt) / 1000)
            : 0;

        totalSeconds = activeSeconds + (match.timerPausedAt || 0);

        // Add durations based on current half
        if (match.currentHalf === 2 && match.duration) {
            totalSeconds += match.duration * 60;
        } else if (match.currentHalf === 'et1' && match.duration) {
            totalSeconds += match.duration * 2 * 60;
        } else if (match.currentHalf === 'et2' && match.duration) {
            totalSeconds += (match.duration * 2) * 60 + (match.extraTimeDuration || 15) * 60;
        }
    } else {
        totalSeconds = (match.minute || 0) * 60;
    }

    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return (
        <span className="font-mono tabular-nums text-xs font-bold text-destructive">
            {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </span>
    );
}

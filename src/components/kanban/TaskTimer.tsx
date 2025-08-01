import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskTimerProps {
  taskId: string;
  initialTime: number; // seconds
  onTimeUpdate: (newTime: number) => void;
}

export const TaskTimer = ({ taskId, initialTime, onTimeUpdate }: TaskTimerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsRunning(true);
    startTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        return newTime;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Save the updated time
    onTimeUpdate(currentTime);
  };

  const toggleTimer = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Save time when component unmounts
      if (currentTime !== initialTime) {
        onTimeUpdate(currentTime);
      }
    };
  }, [currentTime, initialTime, onTimeUpdate]);

  // Save time when component is about to be destroyed or task changes
  useEffect(() => {
    if (currentTime !== initialTime) {
      onTimeUpdate(currentTime);
    }
  }, [currentTime]);

  return (
    <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
      <div className="flex items-center space-x-2">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <span className={cn(
          "text-sm font-mono",
          isRunning && "text-warning font-medium"
        )}>
          {formatTime(currentTime)}
        </span>
      </div>
      
      <Button
        variant={isRunning ? "default" : "outline"}
        size="sm"
        className="h-7 px-2"
        onClick={(e) => {
          e.stopPropagation();
          toggleTimer();
        }}
      >
        {isRunning ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </Button>
    </div>
  );
};

import { useEffect, useState } from "react";

interface RecordingTimerProps {
  timeMs: number;
  isRecording: boolean;
  isPaused: boolean;
}

export function RecordingTimer({ timeMs, isRecording, isPaused }: RecordingTimerProps) {
  const [formattedTime, setFormattedTime] = useState("00:00:00");
  
  useEffect(() => {
    // Convert milliseconds to HH:MM:SS format
    const formatTime = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      const pad = (num: number) => num.toString().padStart(2, '0');
      
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };
    
    setFormattedTime(formatTime(timeMs));
  }, [timeMs]);
  
  if (!isRecording) {
    return null;
  }
  
  return (
    <div className="flex items-center space-x-2 bg-secondary/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-secondary/80">
      <div className={`h-2.5 w-2.5 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse-recording'}`} />
      <span className="text-sm font-medium">{formattedTime}</span>
    </div>
  );
}

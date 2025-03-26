
import { useState, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface RecordingOptions {
  audio: boolean;
  microphone: boolean;
  microphoneDeviceId?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
}

export function useScreenRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  
  // Function to start recording
  const startRecording = useCallback(async (options: RecordingOptions) => {
    try {
      // Reset recording state
      setRecordedChunks([]);
      setRecordingUrl(null);
      setRecordingTime(0);
      
      // Set up display media capture
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          cursor: 'always' 
        },
        audio: options.audio
      });
      
      let combinedStream = displayStream;
      
      // If microphone is enabled, get microphone stream and combine with display stream
      if (options.microphone) {
        const constraints: MediaStreamConstraints = { 
          audio: options.microphoneDeviceId 
            ? { deviceId: { exact: options.microphoneDeviceId } } 
            : true 
        };
        
        const microphoneStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Create a new stream that includes all tracks from both streams
        const tracks = [
          ...displayStream.getVideoTracks(),
          ...microphoneStream.getAudioTracks(),
        ];
        
        // If display audio is included, add those tracks too
        if (options.audio) {
          tracks.push(...displayStream.getAudioTracks());
        }
        
        combinedStream = new MediaStream(tracks);
      }
      
      // Store the combined stream
      streamRef.current = combinedStream;
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: options.videoBitsPerSecond || 2500000,
        audioBitsPerSecond: options.audioBitsPerSecond || 128000
      });
      
      // Set up data handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Clean up timer
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Create recording blob and URL
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        setIsRecording(false);
        setIsPaused(false);
        toast({
          title: "Recording Complete",
          description: "Your screen recording has been saved",
        });
      };
      
      // Start recording
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      startTimeRef.current = Date.now();
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        if (!isPaused) {
          const currentTime = pausedTimeRef.current + (Date.now() - startTimeRef.current);
          setRecordingTime(currentTime);
        }
      }, 100);
      
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Your screen is now being recorded",
      });
      
      // Add event listener for when user stops sharing screen
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Failed",
        description: "Failed to start recording. Please try again.",
        variant: "destructive",
      });
    }
  }, [isPaused, recordedChunks]);
  
  // Function to stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);
  
  // Function to pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      pausedTimeRef.current = recordingTime;
      setIsPaused(true);
      toast({
        title: "Recording Paused",
        description: "Your recording has been paused",
      });
    }
  }, [isRecording, isPaused, recordingTime]);
  
  // Function to resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now();
      setIsPaused(false);
      toast({
        title: "Recording Resumed",
        description: "Your recording has been resumed",
      });
    }
  }, [isRecording, isPaused]);
  
  // Function to save recording
  const saveRecording = useCallback(() => {
    if (recordedChunks.length === 0) {
      toast({
        title: "No Recording",
        description: "There is no recording to save",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `screen-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Recording Saved",
        description: "Your recording has been saved to your device",
      });
    } catch (error) {
      console.error('Error saving recording:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save the recording. Please try again.",
        variant: "destructive",
      });
    }
  }, [recordedChunks]);
  
  return {
    isRecording,
    isPaused,
    recordingTime,
    recordingUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    saveRecording
  };
}

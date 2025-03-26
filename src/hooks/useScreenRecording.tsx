import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { MouseClickEffect, ExportFormat } from '@/components/SettingsPanel';

interface RecordingOptions {
  audio: boolean;
  microphone: boolean;
  microphoneDeviceId?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
  showMouseClicks?: boolean;
  mouseClickEffect?: MouseClickEffect;
  autoStopAfter?: number; // in minutes
  captureArea?: 'full-screen' | 'window' | 'custom-area';
  displayId?: string;
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
  const autoStopTimerRef = useRef<number | null>(null);
  const clickListenerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const clickElementsRef = useRef<HTMLElement[]>([]);
  
  // Clean up function for mouse click indicators
  const cleanupClickIndicators = useCallback(() => {
    clickElementsRef.current.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    clickElementsRef.current = [];
  }, []);
  
  // Set up mouse click visualization with enhanced effects
  const setupMouseClickVisualization = useCallback((showMouseClicks: boolean, effectStyle: MouseClickEffect = 'circle') => {
    if (showMouseClicks) {
      const clickHandler = (e: MouseEvent) => {
        if (effectStyle === 'none') return;
        
        const clickElement = document.createElement('div');
        clickElement.style.position = 'fixed';
        clickElement.style.width = '20px';
        clickElement.style.height = '20px';
        clickElement.style.pointerEvents = 'none';
        clickElement.style.zIndex = '10000';
        clickElement.style.left = `${e.clientX}px`;
        clickElement.style.top = `${e.clientY}px`;
        
        // Apply different styles based on effect type
        switch (effectStyle) {
          case 'circle':
            clickElement.style.borderRadius = '50%';
            clickElement.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            clickElement.style.transform = 'translate(-50%, -50%)';
            clickElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            break;
            
          case 'ripple':
            clickElement.style.borderRadius = '50%';
            clickElement.style.border = '2px solid rgba(255, 0, 0, 0.8)';
            clickElement.style.backgroundColor = 'transparent';
            clickElement.style.transform = 'translate(-50%, -50%) scale(0.5)';
            clickElement.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            break;
            
          case 'highlight':
            clickElement.style.width = '30px';
            clickElement.style.height = '30px';
            clickElement.style.borderRadius = '50%';
            clickElement.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
            clickElement.style.boxShadow = '0 0 10px rgba(255, 255, 0, 0.6)';
            clickElement.style.transform = 'translate(-50%, -50%)';
            clickElement.style.transition = 'opacity 0.4s ease, box-shadow 0.4s ease';
            break;
        }
        
        document.body.appendChild(clickElement);
        clickElementsRef.current.push(clickElement);
        
        // Animate and remove the click indicator
        setTimeout(() => {
          if (effectStyle === 'circle') {
            clickElement.style.opacity = '0';
            clickElement.style.transform = 'translate(-50%, -50%) scale(1.5)';
          } else if (effectStyle === 'ripple') {
            clickElement.style.opacity = '0';
            clickElement.style.transform = 'translate(-50%, -50%) scale(2)';
          } else if (effectStyle === 'highlight') {
            clickElement.style.opacity = '0';
            clickElement.style.boxShadow = '0 0 20px rgba(255, 255, 0, 0)';
          }
          
          setTimeout(() => {
            if (clickElement.parentNode) {
              clickElement.parentNode.removeChild(clickElement);
              clickElementsRef.current = clickElementsRef.current.filter(el => el !== clickElement);
            }
          }, 600);
        }, 400);
      };
      
      clickListenerRef.current = clickHandler;
      window.addEventListener('click', clickHandler);
    }
  }, []);
  
  // Function to start recording with enhanced options
  const startRecording = useCallback(async (options: RecordingOptions) => {
    try {
      // Reset recording state
      setRecordedChunks([]);
      setRecordingUrl(null);
      setRecordingTime(0);
      
      // Configure display capture based on selected area
      let displaySurface: DisplayCaptureSurfaceType = 'monitor';
      
      if (options.captureArea === 'window') {
        displaySurface = 'window';
      } else if (options.captureArea === 'custom-area') {
        displaySurface = 'browser'; // In Electron this would be more specific
      }
      
      // Set up display media capture with proper TypeScript types
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: {
          displaySurface,
          cursor: 'always' as DisplayCaptureSurfaceType,
        },
        audio: options.audio
      };
      
      const displayStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      
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
        
        // Clean up auto-stop timer
        if (autoStopTimerRef.current) {
          window.clearTimeout(autoStopTimerRef.current);
          autoStopTimerRef.current = null;
        }
        
        // Clean up click visualization
        if (clickListenerRef.current) {
          window.removeEventListener('click', clickListenerRef.current);
          clickListenerRef.current = null;
        }
        
        cleanupClickIndicators();
        
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
      
      // Set up auto-stop if enabled
      if (options.autoStopAfter && options.autoStopAfter > 0) {
        const timeInMs = options.autoStopAfter * 60 * 1000; // Convert minutes to ms
        autoStopTimerRef.current = window.setTimeout(() => {
          if (mediaRecorderRef.current && isRecording) {
            stopRecording();
            toast({
              title: "Auto-stop Triggered",
              description: `Recording automatically stopped after ${options.autoStopAfter} minutes`,
            });
          }
        }, timeInMs);
      }
      
      // Set up mouse click visualization if enabled
      if (options.showMouseClicks) {
        setupMouseClickVisualization(true, options.mouseClickEffect);
      }
      
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
  }, [isPaused, recordedChunks, setupMouseClickVisualization, cleanupClickIndicators]);
  
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
  const saveRecording = useCallback((format: ExportFormat = 'webm') => {
    if (recordedChunks.length === 0) {
      toast({
        title: "No Recording",
        description: "There is no recording to save",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Determine the correct mime type based on format
      let mimeType = 'video/webm';
      let fileExtension = 'webm';
      
      switch (format) {
        case 'mp4':
          mimeType = 'video/mp4';
          fileExtension = 'mp4';
          break;
        case 'avi':
          mimeType = 'video/x-msvideo';
          fileExtension = 'avi';
          break;
        case 'gif':
          mimeType = 'image/gif';
          fileExtension = 'gif';
          break;
        case 'mp3':
          mimeType = 'audio/mpeg';
          fileExtension = 'mp3';
          break;
        case 'wav':
          mimeType = 'audio/wav';
          fileExtension = 'wav';
          break;
        case 'ogg':
          mimeType = 'audio/ogg';
          fileExtension = 'ogg';
          break;
        case 'aac':
          mimeType = 'audio/aac';
          fileExtension = 'aac';
          break;
        default:
          mimeType = 'video/webm';
          fileExtension = 'webm';
      }
      
      const blob = new Blob(recordedChunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `screen-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Recording Saved",
        description: `Your recording has been saved as a ${fileExtension.toUpperCase()} file`,
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
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      if (autoStopTimerRef.current) {
        window.clearTimeout(autoStopTimerRef.current);
      }
      
      if (clickListenerRef.current) {
        window.removeEventListener('click', clickListenerRef.current);
      }
      
      cleanupClickIndicators();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [cleanupClickIndicators]);
  
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

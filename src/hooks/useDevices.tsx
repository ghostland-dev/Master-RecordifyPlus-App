
import { useState, useEffect } from 'react';

export interface Device {
  deviceId: string;
  kind: string;
  label: string;
}

export function useDevices() {
  const [audioInputs, setAudioInputs] = useState<Device[]>([]);
  const [videoInputs, setVideoInputs] = useState<Device[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getDevices() {
      try {
        // Request permission to access media devices
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
          .catch(() => {
            // If full permissions aren't given, try just audio
            return navigator.mediaDevices.getUserMedia({ audio: true });
          })
          .catch(() => {
            // If audio fails, try just video
            return navigator.mediaDevices.getUserMedia({ video: true });
          })
          .catch(() => {
            // If all permissions fail
            console.log('No permissions granted');
          });

        // Get all media devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        // Filter devices by kind
        const audioIn = devices.filter(device => device.kind === 'audioinput');
        const videoIn = devices.filter(device => device.kind === 'videoinput');
        const audioOut = devices.filter(device => device.kind === 'audiooutput');
        
        setAudioInputs(audioIn);
        setVideoInputs(videoIn);
        setAudioOutputs(audioOut);
        setLoading(false);
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError('Failed to access media devices');
        setLoading(false);
      }
    }

    getDevices();

    // Set up event listener for device changes
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, []);

  return { audioInputs, videoInputs, audioOutputs, loading, error };
}

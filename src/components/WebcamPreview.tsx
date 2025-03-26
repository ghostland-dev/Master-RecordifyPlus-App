
import { useState, useRef, useEffect } from "react";
import { Camera, CameraOff, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDevices } from "@/hooks/useDevices";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WebcamPreviewProps {
  isRecording: boolean;
}

export function WebcamPreview({ isRecording }: WebcamPreviewProps) {
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { videoInputs, loading } = useDevices();
  
  // Start webcam feed
  useEffect(() => {
    async function startWebcam() {
      try {
        if (isWebcamEnabled) {
          // Stop any existing stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
          
          // Start new stream with selected device
          const constraints: MediaStreamConstraints = {
            video: selectedCamera 
              ? { deviceId: { exact: selectedCamera } } 
              : true
          };
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          
          streamRef.current = stream;
        } else if (streamRef.current) {
          // Stop stream when webcam is disabled
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
          
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    }
    
    startWebcam();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isWebcamEnabled, selectedCamera]);
  
  // Set first camera as default when devices load
  useEffect(() => {
    if (videoInputs.length > 0 && !selectedCamera) {
      setSelectedCamera(videoInputs[0].deviceId);
    }
  }, [videoInputs, selectedCamera]);
  
  return (
    <div className={`glass-panel p-4 flex flex-col ${isExpanded ? 'h-80' : 'h-60'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Camera className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Webcam</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 button-transition" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            variant={isWebcamEnabled ? "default" : "outline"} 
            size="sm" 
            className="button-transition"
            onClick={() => setIsWebcamEnabled(!isWebcamEnabled)}
          >
            {isWebcamEnabled ? (
              <>
                <CameraOff className="h-4 w-4 mr-2" />
                Disable
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Enable
              </>
            )}
          </Button>
        </div>
      </div>
      
      {isWebcamEnabled ? (
        <div className="relative flex-grow bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="h-full w-full object-cover rounded-lg"
          />
          
          {isRecording && (
            <div className="absolute bottom-2 right-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse-recording mr-1.5" />
              Live
            </div>
          )}
        </div>
      ) : (
        <div className="flex-grow bg-black/20 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Camera className="h-10 w-10 mb-2 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Webcam is disabled</p>
          </div>
        </div>
      )}
      
      {isWebcamEnabled && videoInputs.length > 1 && (
        <div className="mt-3">
          <Select value={selectedCamera} onValueChange={setSelectedCamera}>
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Select camera" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading">Loading cameras...</SelectItem>
              ) : (
                videoInputs.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${videoInputs.indexOf(device) + 1}`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

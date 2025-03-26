
import { Button } from "@/components/ui/button";
import { RecordingTimer } from "@/components/RecordingTimer";
import { Play, Pause, Square, Save, Cpu, Mic, Settings, Monitor } from "lucide-react";
import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDevices } from "@/hooks/useDevices";
import { Badge } from "@/components/ui/badge";

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  onStart: (options: any) => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onSave: () => void;
}

export function RecordingControls({
  isRecording,
  isPaused,
  recordingTime,
  onStart,
  onStop,
  onPause,
  onResume,
  onSave
}: RecordingControlsProps) {
  const [recordSystemAudio, setRecordSystemAudio] = useState(true);
  const [recordMicrophone, setRecordMicrophone] = useState(true);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string>("");
  const [videoQuality, setVideoQuality] = useState(2500000); // 2.5 Mbps default
  
  const { audioInputs, loading } = useDevices();
  
  const handleStartRecording = useCallback(() => {
    onStart({
      audio: recordSystemAudio,
      microphone: recordMicrophone,
      microphoneDeviceId: selectedMicrophoneId,
      videoBitsPerSecond: videoQuality
    });
  }, [onStart, recordSystemAudio, recordMicrophone, selectedMicrophoneId, videoQuality]);
  
  return (
    <div className="glass-panel p-4 sm:p-6 flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Monitor className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Screen Recorder</h3>
        </div>
        <RecordingTimer 
          timeMs={recordingTime} 
          isRecording={isRecording} 
          isPaused={isPaused} 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:justify-center sm:space-x-4">
        {!isRecording ? (
          <>
            <Button 
              onClick={handleStartRecording} 
              variant="default" 
              size="lg"
              className="h-14 w-full sm:w-auto button-transition bg-primary hover:bg-primary/90 flex space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>Start Recording</span>
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="h-14 w-full sm:w-auto button-transition flex space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Recording Settings</DialogTitle>
                  <DialogDescription>
                    Configure your recording preferences
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      <span>Video Quality</span>
                    </h3>
                    <div className="px-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Standard</span>
                        <span className="text-xs text-muted-foreground">High</span>
                      </div>
                      <Slider 
                        defaultValue={[videoQuality]} 
                        max={6000000}
                        min={1000000}
                        step={500000}
                        onValueChange={(value) => setVideoQuality(value[0])}
                      />
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {(videoQuality / 1000000).toFixed(1)} Mbps
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Mic className="h-4 w-4" />
                      <span>Audio Sources</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="system-audio" className="flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          <span>System Audio</span>
                        </Label>
                        <Switch 
                          id="system-audio" 
                          checked={recordSystemAudio}
                          onCheckedChange={setRecordSystemAudio}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="microphone" className="flex items-center gap-2">
                          <Mic className="h-4 w-4" />
                          <span>Microphone</span>
                        </Label>
                        <Switch 
                          id="microphone" 
                          checked={recordMicrophone}
                          onCheckedChange={setRecordMicrophone}
                        />
                      </div>
                      
                      {recordMicrophone && (
                        <div className="mt-2">
                          <Label htmlFor="microphone-select" className="text-xs text-muted-foreground mb-1 block">
                            Select Microphone
                          </Label>
                          <Select 
                            value={selectedMicrophoneId} 
                            onValueChange={setSelectedMicrophoneId}
                          >
                            <SelectTrigger id="microphone-select" className="w-full">
                              <SelectValue placeholder="Select microphone" />
                            </SelectTrigger>
                            <SelectContent>
                              {loading ? (
                                <SelectItem value="loading">Loading devices...</SelectItem>
                              ) : (
                                audioInputs.map((device) => (
                                  <SelectItem key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Microphone ${audioInputs.indexOf(device) + 1}`}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            {isPaused ? (
              <Button 
                onClick={onResume} 
                variant="default" 
                size="lg"
                className="h-14 w-full sm:w-auto button-transition flex space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>Resume</span>
              </Button>
            ) : (
              <Button 
                onClick={onPause} 
                variant="outline" 
                size="lg"
                className="h-14 w-full sm:w-auto button-transition flex space-x-2"
              >
                <Pause className="h-5 w-5" />
                <span>Pause</span>
              </Button>
            )}
            
            <Button 
              onClick={onStop} 
              variant="destructive" 
              size="lg"
              className="h-14 w-full sm:w-auto button-transition flex space-x-2"
            >
              <Square className="h-5 w-5" />
              <span>Stop</span>
            </Button>
          </>
        )}
      </div>
      
      {isRecording && (
        <div className="text-center text-sm text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">ESC</kbd> to cancel screen selection
        </div>
      )}
      
      {!isRecording && recordingTime > 0 && (
        <Button 
          onClick={onSave} 
          variant="outline" 
          size="sm"
          className="mx-auto button-transition flex space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Save Last Recording</span>
        </Button>
      )}
    </div>
  );
}

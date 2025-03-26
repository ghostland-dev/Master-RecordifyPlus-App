
import { Button } from "@/components/ui/button";
import { RecordingTimer } from "@/components/RecordingTimer";
import { Play, Pause, Square, Save, Cpu, Mic, Settings, Monitor, Film, MousePointer, Layout } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
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
import { RecordingSettings, MouseClickEffect, CaptureArea, ExportFormat } from "@/components/SettingsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  onStart: (options: any) => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onSave: () => void;
  settings?: RecordingSettings;
}

export function RecordingControls({
  isRecording,
  isPaused,
  recordingTime,
  onStart,
  onStop,
  onPause,
  onResume,
  onSave,
  settings
}: RecordingControlsProps) {
  const [recordSystemAudio, setRecordSystemAudio] = useState(true);
  const [recordMicrophone, setRecordMicrophone] = useState(true);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string>("");
  const [videoQuality, setVideoQuality] = useState(2500000); // 2.5 Mbps default
  const [captureArea, setCaptureArea] = useState<CaptureArea>('full-screen');
  const [mouseClickEffect, setMouseClickEffect] = useState<MouseClickEffect>('circle');
  
  const { audioInputs, loading } = useDevices();
  
  // Load saved settings
  useEffect(() => {
    try {
      if (settings) {
        setCaptureArea(settings.captureArea || 'full-screen');
        setMouseClickEffect(settings.mouseClickEffect || 'circle');
      }
      
      const savedSettings = localStorage.getItem('recordingSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Loaded saved settings:', parsedSettings);
      }
    } catch (error) {
      console.error('Error loading saved settings:', error);
    }
  }, [settings]);
  
  const handleStartRecording = useCallback(() => {
    onStart({
      audio: recordSystemAudio,
      microphone: recordMicrophone,
      microphoneDeviceId: selectedMicrophoneId,
      videoBitsPerSecond: videoQuality,
      showMouseClicks: settings?.showMouseClicks ?? false,
      mouseClickEffect: settings?.mouseClickEffect ?? 'circle',
      autoStopAfter: settings?.enableAutoStop ? settings.autoStopAfter : undefined,
      captureArea: settings?.captureArea ?? 'full-screen'
    });
  }, [onStart, recordSystemAudio, recordMicrophone, selectedMicrophoneId, videoQuality, settings]);
  
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
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Recording Settings</DialogTitle>
                  <DialogDescription>
                    Configure your recording preferences
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="audio" className="mt-4">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="audio">Audio</TabsTrigger>
                    <TabsTrigger value="video">Video</TabsTrigger>
                    <TabsTrigger value="capture">Capture</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="audio" className="space-y-4 py-4">
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
                  </TabsContent>
                  
                  <TabsContent value="video" className="space-y-4 py-4">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Film className="h-4 w-4" />
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
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                        <MousePointer className="h-4 w-4" />
                        <span>Mouse Click Effect</span>
                      </h3>
                      
                      <Select
                        value={mouseClickEffect}
                        onValueChange={(value: MouseClickEffect) => setMouseClickEffect(value)}
                      >
                        <SelectTrigger id="click-effect" className="w-full">
                          <SelectValue placeholder="Select effect style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="circle">Circle</SelectItem>
                          <SelectItem value="ripple">Ripple</SelectItem>
                          <SelectItem value="highlight">Highlight</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="capture" className="space-y-4 py-4">
                    <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Layout className="h-4 w-4" />
                      <span>Capture Area</span>
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="capture-area" className="text-sm">Default Capture Type</Label>
                        <Select
                          value={captureArea}
                          onValueChange={(value: CaptureArea) => setCaptureArea(value)}
                        >
                          <SelectTrigger id="capture-area" className="w-36">
                            <SelectValue placeholder="Select area" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-screen">Full Screen</SelectItem>
                            <SelectItem value="window">Window</SelectItem>
                            <SelectItem value="custom-area">Custom Area</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="rounded-md bg-secondary/20 p-3 mt-4">
                        <p className="text-xs text-muted-foreground">
                          In the desktop version, you'll be able to select and save specific regions or windows for recording.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
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
          {settings?.enableShortcuts && (
            <div className="mb-2">
              Shortcuts: <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs mx-1">F9</kbd> to stop, 
              <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs mx-1">F10</kbd> to pause/resume
            </div>
          )}
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
          <span>Export Last Recording</span>
        </Button>
      )}
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { Settings, Clock, MousePointer, Keyboard, Save, Paintbrush, Film, Maximize2, FileAudio } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SettingsPanelProps {
  isRecording: boolean;
  onSettingsChange?: (settings: RecordingSettings) => void;
}

export interface RecordingSettings {
  showMouseClicks: boolean;
  enableAutoStop: boolean;
  autoStopAfter: number; // minutes
  enableShortcuts: boolean;
  mouseClickEffect: MouseClickEffect;
  enableAnnotations: boolean;
  exportFormat: ExportFormat;
  captureArea: CaptureArea;
}

export type MouseClickEffect = 'circle' | 'ripple' | 'highlight' | 'none';
export type ExportFormat = 'mp4' | 'webm' | 'avi' | 'gif' | 'mp3' | 'wav' | 'ogg' | 'aac';
export type CaptureArea = 'full-screen' | 'window' | 'custom-area';

export function SettingsPanel({ isRecording, onSettingsChange }: SettingsPanelProps) {
  const [showMouseClicks, setShowMouseClicks] = useState(true);
  const [autoStopAfter, setAutoStopAfter] = useState(60); // minutes
  const [enableAutoStop, setEnableAutoStop] = useState(false);
  const [enableShortcuts, setEnableShortcuts] = useState(true);
  const [mouseClickEffect, setMouseClickEffect] = useState<MouseClickEffect>('circle');
  const [enableAnnotations, setEnableAnnotations] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('webm');
  const [captureArea, setCaptureArea] = useState<CaptureArea>('full-screen');
  
  // Load settings from localStorage on initial render
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('recordingSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setShowMouseClicks(parsed.showMouseClicks ?? true);
        setEnableAutoStop(parsed.enableAutoStop ?? false);
        setAutoStopAfter(parsed.autoStopAfter ?? 60);
        setEnableShortcuts(parsed.enableShortcuts ?? true);
        setMouseClickEffect(parsed.mouseClickEffect ?? 'circle');
        setEnableAnnotations(parsed.enableAnnotations ?? false);
        setExportFormat(parsed.exportFormat ?? 'webm');
        setCaptureArea(parsed.captureArea ?? 'full-screen');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);
  
  const handleSaveSettings = () => {
    const settings: RecordingSettings = {
      showMouseClicks,
      enableAutoStop,
      autoStopAfter,
      enableShortcuts,
      mouseClickEffect,
      enableAnnotations,
      exportFormat,
      captureArea
    };
    
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
    
    // Save to localStorage for persistence
    localStorage.setItem('recordingSettings', JSON.stringify(settings));
    
    toast({
      title: "Settings Saved",
      description: "Your recording preferences have been saved.",
    });
  };
  
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Settings</h3>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="mouse-clicks" className="flex items-center gap-2 text-sm">
              <MousePointer className="h-4 w-4" />
              <span>Show Mouse Clicks</span>
            </Label>
            <Switch 
              id="mouse-clicks" 
              checked={showMouseClicks} 
              onCheckedChange={setShowMouseClicks}
              disabled={isRecording}
            />
          </div>
          
          {showMouseClicks && (
            <div className="mt-2 pl-6">
              <Label htmlFor="click-effect" className="text-xs text-muted-foreground mb-1 block">
                Click Effect Style
              </Label>
              <Select
                value={mouseClickEffect}
                onValueChange={(value: MouseClickEffect) => setMouseClickEffect(value)}
                disabled={isRecording}
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
          )}
          
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-annotations" className="flex items-center gap-2 text-sm">
              <Paintbrush className="h-4 w-4" />
              <span>Enable Annotations</span>
            </Label>
            <Switch 
              id="enable-annotations" 
              checked={enableAnnotations} 
              onCheckedChange={setEnableAnnotations}
              disabled={isRecording}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="keyboard-shortcuts" className="flex items-center gap-2 text-sm">
              <Keyboard className="h-4 w-4" />
              <span>Keyboard Shortcuts</span>
            </Label>
            <Switch 
              id="keyboard-shortcuts" 
              checked={enableShortcuts} 
              onCheckedChange={setEnableShortcuts}
              disabled={isRecording}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-stop" className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>Auto-stop Recording</span>
            </Label>
            <Switch 
              id="auto-stop" 
              checked={enableAutoStop} 
              onCheckedChange={setEnableAutoStop}
              disabled={isRecording}
            />
          </div>
          
          {enableAutoStop && (
            <div className="mt-2 pl-6">
              <Label htmlFor="auto-stop-time" className="text-xs text-muted-foreground mb-1 block">
                Stop after (minutes)
              </Label>
              <div className="flex items-center space-x-2">
                <Slider 
                  id="auto-stop-time"
                  min={1}
                  max={120}
                  step={1}
                  value={[autoStopAfter]}
                  onValueChange={(value) => setAutoStopAfter(value[0])}
                  disabled={isRecording}
                  className="flex-grow"
                />
                <Input 
                  type="number" 
                  value={autoStopAfter}
                  onChange={(e) => setAutoStopAfter(parseInt(e.target.value) || 1)}
                  className="w-16 h-8"
                  min={1}
                  max={120}
                  disabled={isRecording}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Label htmlFor="capture-area" className="flex items-center gap-2 text-sm">
              <Maximize2 className="h-4 w-4" />
              <span>Default Capture Area</span>
            </Label>
            <Select
              value={captureArea}
              onValueChange={(value: CaptureArea) => setCaptureArea(value)}
              disabled={isRecording}
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
          
          <div className="flex items-center justify-between">
            <Label htmlFor="export-format" className="flex items-center gap-2 text-sm">
              <Film className="h-4 w-4" />
              <span>Export Format</span>
            </Label>
            <Select
              value={exportFormat}
              onValueChange={(value: ExportFormat) => setExportFormat(value)}
              disabled={isRecording}
            >
              <SelectTrigger id="export-format" className="w-28">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4</SelectItem>
                <SelectItem value="webm">WebM</SelectItem>
                <SelectItem value="avi">AVI</SelectItem>
                <SelectItem value="gif">GIF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="pt-2 border-t border-border/50">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full button-transition"
            disabled={isRecording}
            onClick={handleSaveSettings}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

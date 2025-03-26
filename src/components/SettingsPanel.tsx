
import { Button } from "@/components/ui/button";
import { Settings, Clock, MousePointer, Keyboard, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface SettingsPanelProps {
  isRecording: boolean;
}

export function SettingsPanel({ isRecording }: SettingsPanelProps) {
  const [showMouseClicks, setShowMouseClicks] = useState(true);
  const [autoStopAfter, setAutoStopAfter] = useState(60); // minutes
  const [enableAutoStop, setEnableAutoStop] = useState(false);
  const [enableShortcuts, setEnableShortcuts] = useState(true);
  
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
        </div>
        
        <div className="pt-2 border-t border-border/50">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full button-transition"
            disabled={isRecording}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { Monitor, LayoutPanelTop, Maximize2, CropIcon, Image, ScreenShare } from "lucide-react";
import { useState, useEffect } from "react";
import { CaptureArea } from "@/components/SettingsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SourceSelectorProps {
  isRecording: boolean;
  onSourceChange?: (source: CaptureSource) => void;
}

export interface CaptureSource {
  type: CaptureArea;
  displayId?: string;
  customArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export function SourceSelector({ isRecording, onSourceChange }: SourceSelectorProps) {
  const [selectedSource, setSelectedSource] = useState<CaptureArea>('full-screen');
  const [selectedDisplay, setSelectedDisplay] = useState<string>('primary');
  const [availableDisplays, setAvailableDisplays] = useState<{ id: string; name: string }[]>([
    { id: 'primary', name: 'Primary Display' },
    { id: 'secondary', name: 'Secondary Display' }
  ]);

  // This would be implemented with actual display detection in Electron
  useEffect(() => {
    // Simulate getting available displays
    // In a real Electron app, this would use screen.getAllDisplays()
    const mockGetDisplays = () => {
      // Return mock display data
      return [
        { id: 'primary', name: 'Primary Display' },
        { id: 'secondary', name: 'Secondary Display' }
      ];
    };
    
    setAvailableDisplays(mockGetDisplays());
  }, []);
  
  // Load default settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('recordingSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.captureArea) {
          setSelectedSource(parsed.captureArea);
        }
      }
    } catch (error) {
      console.error('Error loading source settings:', error);
    }
  }, []);
  
  const handleSourceChange = (source: CaptureArea) => {
    setSelectedSource(source);
    
    if (onSourceChange) {
      onSourceChange({
        type: source,
        displayId: selectedDisplay
      });
    }
  };
  
  const handleDisplayChange = (displayId: string) => {
    setSelectedDisplay(displayId);
    
    if (onSourceChange) {
      onSourceChange({
        type: selectedSource,
        displayId
      });
    }
  };
  
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center space-x-2 mb-4">
        <ScreenShare className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Capture Source</h3>
      </div>
      
      <Tabs defaultValue="source" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="source">Source Type</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
        </TabsList>
        
        <TabsContent value="source" className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={selectedSource === 'full-screen' ? "default" : "outline"}
              className={`justify-start button-transition h-12 ${selectedSource === 'full-screen' ? 'bg-primary text-white' : ''}`}
              disabled={isRecording}
              onClick={() => handleSourceChange('full-screen')}
            >
              <Monitor className="h-5 w-5 mr-2" />
              <span>Entire Screen</span>
            </Button>
            
            <Button
              variant={selectedSource === 'window' ? "default" : "outline"}
              className={`justify-start button-transition h-12 ${selectedSource === 'window' ? 'bg-primary text-white' : ''}`}
              disabled={isRecording}
              onClick={() => handleSourceChange('window')}
            >
              <LayoutPanelTop className="h-5 w-5 mr-2" />
              <span>Application Window</span>
            </Button>
            
            <Button
              variant={selectedSource === 'custom-area' ? "default" : "outline"}
              className={`justify-start button-transition h-12 ${selectedSource === 'custom-area' ? 'bg-primary text-white' : ''}`}
              disabled={isRecording}
              onClick={() => handleSourceChange('custom-area')}
            >
              <CropIcon className="h-5 w-5 mr-2" />
              <span>Select Area</span>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="display">
          <div className="grid grid-cols-1 gap-2">
            {availableDisplays.map((display) => (
              <Button
                key={display.id}
                variant={selectedDisplay === display.id ? "default" : "outline"}
                className={`justify-start button-transition h-12 ${selectedDisplay === display.id ? 'bg-primary text-white' : ''}`}
                disabled={isRecording}
                onClick={() => handleDisplayChange(display.id)}
              >
                <Monitor className="h-5 w-5 mr-2" />
                <span>{display.name}</span>
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>The source selection will be prompted when you start recording.</p>
      </div>
    </div>
  );
}

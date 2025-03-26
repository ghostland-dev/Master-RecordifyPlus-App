
import { Button } from "@/components/ui/button";
import { Monitor, LayoutPanelTop, Maximize2, Image } from "lucide-react";
import { useState } from "react";

interface SourceSelectorProps {
  isRecording: boolean;
}

export function SourceSelector({ isRecording }: SourceSelectorProps) {
  const [selectedSource, setSelectedSource] = useState<'screen' | 'window' | 'area'>('screen');
  
  // This is just for UI demonstration, actual source selection happens at recording time
  const sources = [
    { id: 'screen', label: 'Entire Screen', icon: Monitor },
    { id: 'window', label: 'Application Window', icon: LayoutPanelTop },
    { id: 'area', label: 'Select Area', icon: Maximize2 },
  ] as const;
  
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Image className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Capture Source</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {sources.map((source) => (
          <Button
            key={source.id}
            variant={selectedSource === source.id ? "default" : "outline"}
            className={`justify-start button-transition h-12 ${selectedSource === source.id ? 'bg-primary text-white' : ''}`}
            disabled={isRecording}
            onClick={() => setSelectedSource(source.id)}
          >
            <source.icon className="h-5 w-5 mr-2" />
            <span>{source.label}</span>
          </Button>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>The source selection will be prompted when you start recording.</p>
      </div>
    </div>
  );
}

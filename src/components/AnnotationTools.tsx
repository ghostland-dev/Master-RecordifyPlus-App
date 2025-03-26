
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pen, Highlighter, Square, Circle, Text, Eraser, Undo, Redo } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnnotationToolsProps {
  isRecording: boolean;
  isEnabled: boolean;
  onToolSelect?: (tool: AnnotationTool) => void;
}

export type AnnotationTool = {
  type: 'pen' | 'highlighter' | 'square' | 'circle' | 'text' | 'eraser' | 'undo' | 'redo';
  color?: string;
  size?: number;
};

const colors = [
  "#ff0000", // red
  "#00ff00", // green
  "#0000ff", // blue
  "#ffff00", // yellow
  "#ff00ff", // magenta
  "#00ffff", // cyan
  "#ffffff", // white
  "#000000", // black
];

export function AnnotationTools({ isRecording, isEnabled, onToolSelect }: AnnotationToolsProps) {
  const [selectedTool, setSelectedTool] = useState<AnnotationTool>({ type: 'pen', color: colors[0], size: 3 });
  const [toolSize, setToolSize] = useState(3);
  const [toolColor, setToolColor] = useState(colors[0]);
  
  if (!isEnabled) {
    return null;
  }
  
  const handleToolSelect = (type: AnnotationTool['type']) => {
    const newTool = { 
      ...selectedTool,
      type,
    };
    
    setSelectedTool(newTool);
    
    if (onToolSelect) {
      onToolSelect(newTool);
    }
  };
  
  const handleColorSelect = (color: string) => {
    setToolColor(color);
    setSelectedTool({ ...selectedTool, color });
    
    if (onToolSelect) {
      onToolSelect({ ...selectedTool, color });
    }
  };
  
  const handleSizeChange = (value: number[]) => {
    const newSize = value[0];
    setToolSize(newSize);
    setSelectedTool({ ...selectedTool, size: newSize });
    
    if (onToolSelect) {
      onToolSelect({ ...selectedTool, size: newSize });
    }
  };
  
  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 glass-panel p-2 rounded-full shadow-lg ${!isRecording ? 'hidden' : ''}`}>
      <div className="flex items-center space-x-1">
        <Button
          variant={selectedTool.type === 'pen' ? "default" : "ghost"}
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => handleToolSelect('pen')}
        >
          <Pen className="h-5 w-5" />
        </Button>
        
        <Button
          variant={selectedTool.type === 'highlighter' ? "default" : "ghost"}
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => handleToolSelect('highlighter')}
        >
          <Highlighter className="h-5 w-5" />
        </Button>
        
        <Button
          variant={selectedTool.type === 'square' ? "default" : "ghost"}
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => handleToolSelect('square')}
        >
          <Square className="h-5 w-5" />
        </Button>
        
        <Button
          variant={selectedTool.type === 'circle' ? "default" : "ghost"}
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => handleToolSelect('circle')}
        >
          <Circle className="h-5 w-5" />
        </Button>
        
        <Button
          variant={selectedTool.type === 'text' ? "default" : "ghost"}
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => handleToolSelect('text')}
        >
          <Text className="h-5 w-5" />
        </Button>
        
        <div className="h-6 w-px bg-border mx-1"></div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              style={{ backgroundColor: toolColor, color: toolColor === '#ffffff' || toolColor === '#ffff00' ? 'black' : 'white' }}
            >
              <span className="sr-only">Select color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <Button
                  key={color}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
            
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Brush Size</p>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[toolSize]}
                onValueChange={handleSizeChange}
              />
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="h-6 w-px bg-border mx-1"></div>
        
        <Button
          variant={selectedTool.type === 'eraser' ? "default" : "ghost"}
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => handleToolSelect('eraser')}
        >
          <Eraser className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => handleToolSelect('undo')}
        >
          <Undo className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => handleToolSelect('redo')}
        >
          <Redo className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

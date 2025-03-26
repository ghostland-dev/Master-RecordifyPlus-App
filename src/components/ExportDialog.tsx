
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Save, Video, Settings, Download, Share } from "lucide-react";
import { ExportFormat } from "@/components/SettingsPanel";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  videoUrl: string | null;
}

export interface ExportOptions {
  filename: string;
  format: ExportFormat;
  quality: number; // 0-100
  compression: number; // 0-100
}

export function ExportDialog({ isOpen, onClose, onExport, videoUrl }: ExportDialogProps) {
  const [filename, setFilename] = useState(`screen-recording-${new Date().toISOString().slice(0, 10)}`);
  const [format, setFormat] = useState<ExportFormat>('webm');
  const [quality, setQuality] = useState(80);
  const [compression, setCompression] = useState(50);
  
  // Load default settings from localStorage
  React.useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('recordingSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.exportFormat) {
          setFormat(parsed.exportFormat);
        }
      }
    } catch (error) {
      console.error('Error loading export settings:', error);
    }
  }, []);
  
  const handleExport = () => {
    onExport({
      filename,
      format,
      quality,
      compression
    });
    onClose();
  };
  
  // Calculate estimated file size based on quality and compression
  // This is just a rough estimate for display purposes
  const calculateEstimatedSize = () => {
    // Base size in MB for a 1-minute recording at different qualities
    const baseSizes = {
      mp4: 15,
      webm: 10,
      avi: 20,
      gif: 30
    };
    
    const baseSize = baseSizes[format];
    // Higher quality means larger file
    const qualityFactor = quality / 50;
    // Higher compression means smaller file
    const compressionFactor = 1 - (compression / 100);
    
    return (baseSize * qualityFactor * compressionFactor).toFixed(1);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            <span>Export Recording</span>
          </DialogTitle>
          <DialogDescription>
            Configure export settings for your screen recording
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {videoUrl && (
            <div className="aspect-video bg-secondary/20 rounded-md overflow-hidden">
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-4 gap-4 items-end">
                <div className="col-span-3">
                  <Label htmlFor="filename">Filename</Label>
                  <Input
                    id="filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label htmlFor="format">Format</Label>
                  <Select value={format} onValueChange={(value: ExportFormat) => setFormat(value)}>
                    <SelectTrigger id="format">
                      <SelectValue placeholder="Format" />
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
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="quality">Quality</Label>
                  <span className="text-sm text-muted-foreground">{quality}%</span>
                </div>
                <Slider
                  id="quality"
                  min={10}
                  max={100}
                  step={5}
                  value={[quality]}
                  onValueChange={(value) => setQuality(value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="compression">Compression</Label>
                  <span className="text-sm text-muted-foreground">{compression}%</span>
                </div>
                <Slider
                  id="compression"
                  min={0}
                  max={100}
                  step={5}
                  value={[compression]}
                  onValueChange={(value) => setCompression(value[0])}
                />
              </div>
              
              <div className="rounded-md bg-secondary/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estimated File Size:</span>
                  <span className="text-sm">{calculateEstimatedSize()} MB</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-1.5" />
              Share
            </Button>
            <Button size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1.5" />
              Export
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

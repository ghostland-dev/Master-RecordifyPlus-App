
import { Header } from "@/components/Header";
import { RecordingControls } from "@/components/RecordingControls";
import { WebcamPreview } from "@/components/WebcamPreview";
import { SourceSelector, CaptureSource } from "@/components/SourceSelector";
import { SettingsPanel, RecordingSettings } from "@/components/SettingsPanel";
import { AnnotationTools, AnnotationTool } from "@/components/AnnotationTools";
import { ExportDialog, ExportOptions } from "@/components/ExportDialog";
import { useScreenRecording } from "@/hooks/useScreenRecording";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Github } from "lucide-react";

const Index = () => {
  const {
    isRecording,
    isPaused,
    recordingTime,
    recordingUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    saveRecording
  } = useScreenRecording();
  
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState<RecordingSettings>({
    showMouseClicks: true,
    enableAutoStop: false,
    autoStopAfter: 60,
    enableShortcuts: true,
    mouseClickEffect: 'circle',
    enableAnnotations: false,
    exportFormat: 'webm',
    captureArea: 'full-screen'
  });
  const [selectedSource, setSelectedSource] = useState<CaptureSource>({ 
    type: 'full-screen',
    displayId: 'primary'
  });
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Load saved settings on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('recordingSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Settings Error",
        description: "Could not load your saved settings",
        variant: "destructive"
      });
    }
  }, []);
  
  // Show recording preview when a recording is available
  useEffect(() => {
    if (recordingUrl && !isRecording) {
      setShowPreview(true);
      setShowExportDialog(true);
    }
  }, [recordingUrl, isRecording]);
  
  const handleSettingsChange = (newSettings: RecordingSettings) => {
    setSettings(newSettings);
  };
  
  const handleSourceChange = (source: CaptureSource) => {
    setSelectedSource(source);
  };
  
  const handleAnnotationToolSelect = (tool: AnnotationTool) => {
    console.log('Selected annotation tool:', tool);
    // Would be implemented with annotation overlay in Electron
  };
  
  const handleExport = (options: ExportOptions) => {
    console.log('Export options:', options);
    
    // Pass the format to the saveRecording method
    saveRecording(options.format);
    
    toast({
      title: "Recording Exported",
      description: `Your recording has been saved as ${options.filename}.${options.format}`,
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Header />
      
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="animate-slide-up mb-8">
            <h1 className="text-4xl font-display font-bold text-center">
              Renix Screen Recorder
            </h1>
            <p className="text-center text-muted-foreground mt-2 max-w-md mx-auto">
              Capture your screen with professional quality and intuitive controls.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="lg:col-span-2 space-y-6">
              {/* Preview Area */}
              <div 
                className="aspect-video rounded-xl overflow-hidden relative glass-panel flex items-center justify-center"
              >
                {showPreview && recordingUrl ? (
                  <div className="relative w-full h-full">
                    <video 
                      src={recordingUrl} 
                      controls 
                      className="w-full h-full object-contain"
                    />
                    <button 
                      className="absolute top-2 right-2 bg-background/80 p-1 rounded-full text-xs border border-border/50"
                      onClick={() => setShowPreview(false)}
                    >
                      Close Preview
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-accent/30 flex items-center justify-center mx-auto mb-4">
                      <svg 
                        className="w-10 h-10 text-muted-foreground" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          stroke="currentColor" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="1.5" 
                          d="M15.25 8v8m-10-4h14.5m-10-8h5.5c2.76 0 5 2.24 5 5v10c0 2.76-2.24 5-5 5h-5.5c-2.76 0-5-2.24-5-5V5c0-2.76 2.24-5 5-5z"
                        ></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium mb-2">Ready to Record</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Click the Start Recording button to begin capturing your screen, 
                      microphone, or system audio.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Recording Controls */}
              <RecordingControls 
                isRecording={isRecording}
                isPaused={isPaused}
                recordingTime={recordingTime}
                onStart={startRecording}
                onStop={stopRecording}
                onPause={pauseRecording}
                onResume={resumeRecording}
                onSave={() => setShowExportDialog(true)}
                settings={settings}
              />
            </div>
            
            <div className="space-y-6">
              <WebcamPreview isRecording={isRecording} />
              <SourceSelector 
                isRecording={isRecording} 
                onSourceChange={handleSourceChange}
              />
              <SettingsPanel 
                isRecording={isRecording} 
                onSettingsChange={handleSettingsChange}
              />
            </div>
          </div>
          
          <div className="mt-12 text-center text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: '200ms' }}>
            <p>
              This is a web version of the application. To use the desktop version with 
              advanced features, compile the app locally with Electron.
            </p>
            <div className="mt-4 flex flex-col items-center">
              <p className="font-semibold mb-1">Created by Ismail MOUYAHADA</p>
              <div className="flex items-center gap-2">
                <span>Open Source Project</span>
                <a href="https://github.com/ismailmouyahada" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Annotation Tools (only shown during recording) */}
      <AnnotationTools 
        isRecording={isRecording} 
        isEnabled={settings.enableAnnotations}
        onToolSelect={handleAnnotationToolSelect}
      />
      
      {/* Export Dialog */}
      <ExportDialog 
        isOpen={showExportDialog} 
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        videoUrl={recordingUrl}
      />
    </div>
  );
};

export default Index;

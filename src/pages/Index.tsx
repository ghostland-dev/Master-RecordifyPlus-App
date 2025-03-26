
import { Header } from "@/components/Header";
import { RecordingControls } from "@/components/RecordingControls";
import { WebcamPreview } from "@/components/WebcamPreview";
import { SourceSelector } from "@/components/SourceSelector";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useScreenRecording } from "@/hooks/useScreenRecording";
import { useState, useEffect } from "react";

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
  
  // Show recording preview when a recording is available
  useEffect(() => {
    if (recordingUrl && !isRecording) {
      setShowPreview(true);
    }
  }, [recordingUrl, isRecording]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Header />
      
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="animate-slide-up mb-8">
            <h1 className="text-4xl font-display font-bold text-center">
              Screen Recording Studio
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
                onSave={saveRecording}
              />
            </div>
            
            <div className="space-y-6">
              <WebcamPreview isRecording={isRecording} />
              <SourceSelector isRecording={isRecording} />
              <SettingsPanel isRecording={isRecording} />
            </div>
          </div>
          
          <div className="mt-12 text-center text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: '200ms' }}>
            <p>
              This is a web version of the application. To use the desktop version with 
              advanced features, compile the app locally with Electron.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

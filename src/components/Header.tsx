
import { Button } from "@/components/ui/button";
import { Settings, Download, Info } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border/50' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg animate-scale-in">
            R
          </div>
          <h1 className="text-xl font-display font-medium">Recordify</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="button-transition">
            <Info className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="button-transition">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="outline" className="button-transition gap-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

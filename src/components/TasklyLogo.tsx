import { Check } from "lucide-react";

export function TasklyLogo({ size = 32 }: { size?: number }) {
  const clipboardWidth = size;
  const clipboardHeight = size * 1.2;
  const clipWidth = size * 0.4;
  const clipHeight = size * 0.15;
  
  return (
    <div className="relative" style={{ width: clipboardWidth, height: clipboardHeight }}>
      {/* Clipboard Base */}
      <div 
        className="absolute bg-gradient-to-br from-card to-card/90 border-2 border-border rounded-lg shadow-sm"
        style={{
          width: clipboardWidth,
          height: clipboardHeight,
          top: clipHeight * 0.5
        }}
      />
      
      {/* Clipboard Clip */}
      <div 
        className="absolute bg-gradient-to-br from-primary to-primary-dark rounded-sm shadow-md"
        style={{
          width: clipWidth,
          height: clipHeight,
          left: (clipboardWidth - clipWidth) / 2,
          top: 0
        }}
      />
      
      {/* Todo List Items with Checkmarks */}
      <div className="absolute inset-0 flex flex-col justify-center items-start pl-2" style={{ paddingTop: clipHeight }}>
        {/* First checkmark */}
        <div className="flex items-center gap-1 mb-0.5">
          <div className="w-2 h-2 rounded-sm bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <Check className="w-1 h-1 text-primary-foreground" strokeWidth={3} />
          </div>
          <div className="w-3 h-0.5 bg-muted-foreground/60 rounded-full" />
        </div>
        
        {/* Second checkmark */}
        <div className="flex items-center gap-1 mb-0.5">
          <div className="w-2 h-2 rounded-sm bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <Check className="w-1 h-1 text-primary-foreground" strokeWidth={3} />
          </div>
          <div className="w-4 h-0.5 bg-muted-foreground/60 rounded-full" />
        </div>
        
        {/* Third checkmark */}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <Check className="w-1 h-1 text-primary-foreground" strokeWidth={3} />
          </div>
          <div className="w-2.5 h-0.5 bg-muted-foreground/60 rounded-full" />
        </div>
      </div>
    </div>
  );
}
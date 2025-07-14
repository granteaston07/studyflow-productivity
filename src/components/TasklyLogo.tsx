import { Check } from "lucide-react";

export function TasklyLogo({ size = 32 }: { size?: number }) {
  return (
    <div 
      className="relative bg-gradient-to-br from-card to-card/90 border-2 border-border rounded-lg shadow-sm flex flex-col overflow-hidden"
      style={{ width: size, height: size }}
    >
      {/* Clipboard Clip */}
      <div 
        className="absolute bg-gradient-to-br from-primary to-primary-dark rounded-sm shadow-md"
        style={{
          width: size * 0.35,
          height: size * 0.12,
          left: size * 0.325,
          top: -size * 0.06
        }}
      />
      
      {/* Todo List Items with Checkmarks */}
      <div className="flex-1 flex flex-col justify-center px-1.5 py-1" style={{ paddingTop: size * 0.15 }}>
        {/* First checkmark */}
        <div className="flex items-center gap-1 mb-0.5">
          <div 
            className="rounded-sm bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0"
            style={{ width: size * 0.15, height: size * 0.15 }}
          >
            <Check className="text-primary-foreground" style={{ width: size * 0.08, height: size * 0.08 }} strokeWidth={3} />
          </div>
          <div 
            className="bg-muted-foreground/60 rounded-full flex-shrink-0"
            style={{ width: size * 0.3, height: size * 0.04 }}
          />
        </div>
        
        {/* Second checkmark */}
        <div className="flex items-center gap-1 mb-0.5">
          <div 
            className="rounded-sm bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0"
            style={{ width: size * 0.15, height: size * 0.15 }}
          >
            <Check className="text-primary-foreground" style={{ width: size * 0.08, height: size * 0.08 }} strokeWidth={3} />
          </div>
          <div 
            className="bg-muted-foreground/60 rounded-full flex-shrink-0"
            style={{ width: size * 0.35, height: size * 0.04 }}
          />
        </div>
        
        {/* Third checkmark */}
        <div className="flex items-center gap-1">
          <div 
            className="rounded-sm bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0"
            style={{ width: size * 0.15, height: size * 0.15 }}
          >
            <Check className="text-primary-foreground" style={{ width: size * 0.08, height: size * 0.08 }} strokeWidth={3} />
          </div>
          <div 
            className="bg-muted-foreground/60 rounded-full flex-shrink-0"
            style={{ width: size * 0.25, height: size * 0.04 }}
          />
        </div>
      </div>
    </div>
  );
}
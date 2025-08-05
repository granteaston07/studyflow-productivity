import { useEffect, useState } from "react";

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  value?: string;
  color?: string;
  animationDelay?: number;
  showOnHover?: boolean;
}

export function ProgressCircle({ 
  percentage, 
  size = 120, 
  strokeWidth = 8, 
  label = "Progress", 
  value, 
  color = "hsl(var(--primary))",
  animationDelay = 0,
  showOnHover = false
}: ProgressCircleProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [percentage, animationDelay]);

  return (
    <div className={`relative inline-flex items-center justify-center transition-all duration-500 ease-out ${
      showOnHover 
        ? 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100' 
        : 'opacity-100 scale-100'
    }`}>
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 0 8px currentColor)',
          }}
        />
        
        {/* Glow effect */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth / 2}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out opacity-30"
          style={{
            filter: 'blur(2px)',
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-primary animate-scale-in">
          {value || `${Math.round(animatedPercentage)}%`}
        </span>
        <span className="text-xs text-muted-foreground mt-1 animate-fade-in">
          {label}
        </span>
      </div>
    </div>
  );
}
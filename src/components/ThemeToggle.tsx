import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function ThemeToggle() {
  const { user, themePreference, updateThemePreference } = useAuth();
  const [isDark, setIsDark] = useState(true);

  // Initialize dark mode immediately
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    // Set theme based on user preference or default to dark
    const shouldBeDark = themePreference ? themePreference === 'dark' : true;
    setIsDark(shouldBeDark);
    
    const root = document.documentElement;
    if (shouldBeDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themePreference]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const handleToggle = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    
    // Save to database if user is logged in
    if (user) {
      await updateThemePreference(newTheme);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary transition-transform hover-scale"
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
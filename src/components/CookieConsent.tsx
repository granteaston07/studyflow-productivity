import { useState, useEffect } from 'react';
import { Cookie, Settings, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';

interface CookiePreferences {
  essential: boolean;
  preferences: boolean;
  analytics: boolean;
}

const COOKIE_CONSENT_KEY = 'studyflow_cookie_consent';

export function CookieConsent() {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    preferences: true,
    analytics: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => setShowBanner(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...prefs,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
    setShowCustomize(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ essential: true, preferences: true, analytics: true });
  };

  const handleRejectNonEssential = () => {
    saveConsent({ essential: true, preferences: false, analytics: false });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slide-up">
      <div className="max-w-4xl mx-auto">
        <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
          {!showCustomize ? (
            // Main banner
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    We value your privacy 🍪
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We use cookies to enhance your experience, remember your preferences, and analyze our traffic. 
                    You can customize your preferences or accept all cookies.{' '}
                    <button 
                      onClick={() => navigate('/cookies')}
                      className="text-primary hover:underline"
                    >
                      Learn more
                    </button>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handleAcceptAll}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Accept All
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCustomize(true)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Customize
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleRejectNonEssential}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject Non-Essential
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Customize panel
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowCustomize(false)}
                  className="text-muted-foreground"
                >
                  ← Back
                </Button>
                <h3 className="text-base font-semibold text-foreground">
                  Cookie Preferences
                </h3>
              </div>

              <div className="space-y-4 mb-6">
                {/* Essential Cookies */}
                <div className="flex items-start justify-between gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground text-sm">Essential Cookies</h4>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Required</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Required for authentication and core functionality. Cannot be disabled.
                    </p>
                  </div>
                  <Switch checked={true} disabled className="opacity-50" />
                </div>

                {/* Preference Cookies */}
                <div className="flex items-start justify-between gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm">Preference Cookies</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Remember your settings like dark/light mode and UI preferences.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.preferences}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, preferences: checked }))
                    }
                  />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm">Analytics Cookies</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Help us understand how visitors use StudyFlow to improve the experience.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, analytics: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSavePreferences}>
                  <Check className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
                <Button variant="outline" onClick={handleAcceptAll}>
                  Accept All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

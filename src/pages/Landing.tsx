import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Timer, CheckSquare, GraduationCap, Download, Smartphone, Monitor, TrendingUp, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StudyFlowLogo } from '@/components/StudyFlowLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (user) {
      navigate('/app');
      return;
    }
    
    setIsVisible(true);
  }, [user]);

  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <StudyFlowLogo size={40} />
              <div>
                <h1 className="text-xl font-bold text-foreground">StudyFlow</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered Student Productivity</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth?tab=signup')}
                className="bg-gradient-to-r from-primary to-ai-primary text-primary-foreground hover:from-primary/90 hover:to-ai-primary/90 shadow-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-slide-up">
            <Badge variant="secondary" className="mb-4 bg-ai-primary/10 text-ai-primary border-ai-primary/20">
              <Brain className="w-3 h-3 mr-1" />
              AI-Powered Study Assistant
            </Badge>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-4">
              Master Your{' '}
              <span className="bg-gradient-to-r from-primary to-ai-primary bg-clip-text text-transparent">
                Study Flow
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
              The ultimate productivity app for students. Organize tasks, track progress, set study goals, focus with AI-powered timers, 
              and get intelligent study recommendations. Built specifically for academic success.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={() => navigate('/auth?tab=signup')}
                className="bg-gradient-to-r from-primary to-ai-primary text-primary-foreground hover:from-primary/90 hover:to-ai-primary/90 shadow-lg text-lg px-8 py-3"
              >
                Start Studying Smarter
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/app')}
                className="text-lg px-8 py-3 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              >
                Try Guest Mode
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for student productivity and academic success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Task Prioritization */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 animate-slide-up">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-ai-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-ai-primary/20 transition-colors">
                    <Brain className="h-6 w-6 text-ai-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">AI Task Intelligence</h3>
                </div>
                <p className="text-muted-foreground">
                  Get smart recommendations on which tasks to tackle first based on deadlines, priority, and workload.
                </p>
              </CardContent>
            </Card>

            {/* Focus Timer */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Timer className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Focus Sessions</h3>
                </div>
                <p className="text-muted-foreground">
                  Proven Pomodoro technique with customizable timers to maximize concentration and productivity.
                </p>
              </CardContent>
            </Card>

            {/* Task Management */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                    <CheckSquare className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Smart Task Management</h3>
                </div>
                <p className="text-muted-foreground">
                  Organize assignments by subject, priority, and due date. Never miss a deadline again. Set goals and keep track of activities with study calender.
                </p>
              </CardContent>
            </Card>

            {/* Study Mode */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-warning/20 transition-colors">
                    <GraduationCap className="h-6 w-6 text-warning" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Distraction-Free Study Mode</h3>
                </div>
                <p className="text-muted-foreground">
                  Immersive study environment that blocks distractions and keeps you focused on what matters.
                </p>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-info/20 transition-colors">
                    <TrendingUp className="h-6 w-6 text-info" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Progress Analytics</h3>
                </div>
                <p className="text-muted-foreground">
                  Track your productivity trends and see how you're improving over time with detailed insights.
                </p>
              </CardContent>
            </Card>

            {/* Quick Notes */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                    <StickyNote className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Quick Notes & Links</h3>
                </div>
                <p className="text-muted-foreground">
                  Capture ideas instantly and save important study resources in one convenient place.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Installation Guide Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Install StudyFlow as an App
            </h2>
            <p className="text-xl text-muted-foreground mb-4">
              Get quick access by installing StudyFlow directly on your device for the best experience.
            </p>
            <p className="text-lg text-primary font-medium">
              Visit <span className="font-bold">studyflow.us</span> on your device and follow the steps below:
            </p>
          </div>

          {/* Mobile: iPhone only */}
          <div className="block md:hidden">
            <Card className="border-border/50 hover:border-primary/30 transition-colors max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <Smartphone className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-3">iPhone (Safari)</h3>
                <ol className="text-sm text-muted-foreground text-left space-y-2">
                  <li>1. Open Safari and visit <span className="font-medium text-primary">studyflow.us</span></li>
                  <li>2. Tap the "Share" button</li>
                  <li>3. Scroll and tap "Add to Home Screen"</li>
                  <li>4. Tap "Add" to confirm</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Desktop: All options */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Desktop Installation */}
            <Card className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <Monitor className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-3">Desktop (Chrome/Edge)</h3>
                <ol className="text-sm text-muted-foreground text-left space-y-2">
                  <li>1. Go to <span className="font-medium text-primary">studyflow.us</span> in your browser</li>
                  <li>2. Click the <Download className="inline w-3 h-3 mx-1" /> install icon in the address bar</li>
                  <li>3. Click "Install" in the popup</li>
                  <li>4. StudyFlow will open as a desktop app</li>
                  <li>5. Pin to taskbar for quick access</li>
                </ol>
              </CardContent>
            </Card>

            {/* Mac Safari */}
            <Card className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <Monitor className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-3">Mac (Safari)</h3>
                <ol className="text-sm text-muted-foreground text-left space-y-2">
                  <li>1. Open Safari and visit <span className="font-medium text-primary">studyflow.us</span></li>
                  <li>2. Click "Share" button in the toolbar</li>
                  <li>3. Select "Add to Dock"</li>
                  <li>4. StudyFlow will appear in your Dock</li>
                </ol>
              </CardContent>
            </Card>

            {/* iPhone Installation */}
            <Card className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <Smartphone className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-3">iPhone (Safari)</h3>
                <ol className="text-sm text-muted-foreground text-left space-y-2">
                  <li>1. Open Safari and visit <span className="font-medium text-primary">studyflow.us</span></li>
                  <li>2. Tap the "Share" button</li>
                  <li>3. Scroll and tap "Add to Home Screen"</li>
                  <li>4. Tap "Add" to confirm</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Tip:</strong> Installing StudyFlow from <span className="font-medium text-primary">studyflow.us</span> as an app gives you faster access, push notifications, and a distraction-free experience without browser tabs.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 to-ai-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Study Habits?
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Join thousands of students who have improved their productivity with StudyFlow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth?tab=signup')}
              className="bg-gradient-to-r from-primary to-ai-primary text-primary-foreground hover:from-primary/90 hover:to-ai-primary/90 shadow-lg text-lg px-8 py-3"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/app')}
              className="text-lg px-8 py-3 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              Try Without Signing Up
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <StudyFlowLogo size={24} />
            <span className="text-sm font-medium text-foreground">StudyFlow</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Created by Grant Easton • Built for Students • Made in 2025
          </p>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <button className="hover:text-foreground transition-colors">Privacy Policy</button>
            <span>•</span>
            <button className="hover:text-foreground transition-colors">Terms of Service</button>
            <span>•</span>
            <button 
              onClick={() => navigate('/auth')}
              className="hover:text-foreground transition-colors"
            >
              Sign In to StudyFlow
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
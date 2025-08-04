import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Brain, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    await signIn(email, password);
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('displayName') as string;
    
    await signUp(email, password, displayName);
    setIsSubmitting(false);
  };

  const handleGuestMode = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-ai-primary bg-clip-text text-transparent">
              StudyFlow
            </span>
          </div>
          <CardTitle className="text-foreground">Welcome to StudyFlow</CardTitle>
          <CardDescription className="text-muted-foreground">AI-Powered Student Productivity</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="signin" className="text-foreground data-[state=active]:bg-background">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-foreground data-[state=active]:bg-background">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-foreground">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="student@university.edu"
                    required
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      name="password"
                      type={showSignInPassword ? "text" : "password"}
                      required
                      className="bg-background border-border text-foreground pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute inset-y-0 right-0 px-3 py-0 h-full hover:bg-transparent"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                    >
                      {showSignInPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-foreground">Display Name</Label>
                  <Input
                    id="signup-name"
                    name="displayName"
                    type="text"
                    placeholder="Your Name"
                    required
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="student@university.edu"
                    required
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showSignUpPassword ? "text" : "password"}
                      minLength={6}
                      required
                      className="bg-background border-border text-foreground pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute inset-y-0 right-0 px-3 py-0 h-full hover:bg-transparent"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    >
                      {showSignUpPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {/* Guest Mode Section */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Continue without signing in</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You can use StudyFlow without creating an account, but your tasks, notes, and progress won't be saved. 
                Everything will be lost when you close the browser or refresh the page.
              </p>
              <Button 
                variant="outline" 
                className="w-full hover:bg-muted/50"
                onClick={handleGuestMode}
              >
                Continue as Guest
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
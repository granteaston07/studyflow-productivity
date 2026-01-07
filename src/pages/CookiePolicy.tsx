import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StudyFlowLogo } from '@/components/StudyFlowLogo';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function CookiePolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <StudyFlowLogo size={32} />
              <span className="font-semibold text-foreground">StudyFlow</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 7, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are placed on your device when you visit a website. They help websites 
              remember information about your visit, making your next visit easier and the site more useful to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">StudyFlow uses cookies for the following purposes:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Authentication:</strong> To keep you signed in and secure your session</li>
              <li><strong>Preferences:</strong> To remember your theme preference (light/dark mode)</li>
              <li><strong>Local Storage:</strong> To store guest mode data on your device</li>
              <li><strong>Analytics:</strong> To understand how users interact with our application</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Types of Cookies We Use</h2>
            
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Essential Cookies</h3>
                <p className="text-muted-foreground text-sm">
                  Required for the application to function. These include authentication tokens and session management. 
                  Without these, you cannot use StudyFlow.
                </p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Preference Cookies</h3>
                <p className="text-muted-foreground text-sm">
                  Remember your settings like dark/light mode preference. These improve your experience but are not 
                  strictly necessary.
                </p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Analytics Cookies</h3>
                <p className="text-muted-foreground text-sm">
                  Help us understand how visitors use StudyFlow. We use Vercel Analytics which collects anonymous 
                  usage data to improve our service. No personally identifiable information is collected.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Third-Party Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We may use cookies from the following third parties:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Supabase:</strong> For authentication and session management</li>
              <li><strong>Vercel Analytics:</strong> For anonymous usage statistics</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We do not use advertising cookies or sell your data to advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              In addition to cookies, we use browser local storage to save data for guest mode users. This data 
              remains on your device and includes tasks, notes, and preferences. You can clear this data by clearing 
              your browser's local storage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You can control and delete cookies through your browser settings. Here's how:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Edge:</strong> Settings → Privacy, Search, and Services → Cookies</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Note: Blocking essential cookies may prevent you from using certain features of StudyFlow.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Cookie Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              Session cookies are deleted when you close your browser. Persistent cookies (like theme preferences) 
              may remain for up to 1 year unless you delete them manually.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an 
              updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@studyflow.us" className="text-primary hover:underline">privacy@studyflow.us</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
}

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StudyFlowLogo } from '@/components/StudyFlowLogo';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DataProtection() {
  const navigate = useNavigate();

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
        <h1 className="text-3xl font-bold text-foreground mb-2">Data Protection</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 7, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Our Commitment to Your Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              At StudyFlow, we take the protection of your personal data seriously. This page outlines the technical 
              and organizational measures we implement to safeguard your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Encryption</h2>
            <div className="space-y-3">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">In Transit</h3>
                <p className="text-muted-foreground text-sm">
                  All data transmitted between your device and our servers is encrypted using TLS 1.3 (Transport Layer Security). 
                  This ensures that your data cannot be intercepted or read by unauthorized parties.
                </p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">At Rest</h3>
                <p className="text-muted-foreground text-sm">
                  Your data stored in our databases is encrypted using AES-256 encryption. Even if someone gained 
                  unauthorized access to our storage systems, they could not read your data without the encryption keys.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Access Control</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We implement strict access controls:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Row Level Security (RLS):</strong> Database policies ensure you can only access your own data</li>
              <li><strong>Authentication:</strong> Secure authentication via Supabase with password hashing (bcrypt)</li>
              <li><strong>Session Management:</strong> Secure session tokens with automatic expiration</li>
              <li><strong>API Security:</strong> All API endpoints require proper authentication</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Infrastructure Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              StudyFlow is built on Supabase, which provides enterprise-grade security infrastructure:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-3">
              <li>SOC 2 Type II certified infrastructure</li>
              <li>Regular security audits and penetration testing</li>
              <li>DDoS protection and WAF (Web Application Firewall)</li>
              <li>Automatic security patches and updates</li>
              <li>Geographic data redundancy for disaster recovery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Minimization</h2>
            <p className="text-muted-foreground leading-relaxed">
              We only collect data that is necessary for providing our service. We do not collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-3">
              <li>Location data or GPS coordinates</li>
              <li>Contact lists or address books</li>
              <li>Photos or media from your device</li>
              <li>Social media profiles (unless you choose to link them)</li>
              <li>Financial or payment information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your data only as long as necessary:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-3">
              <li><strong>Active accounts:</strong> Data is retained while your account is active</li>
              <li><strong>Deleted accounts:</strong> Data is permanently deleted within 30 days of account deletion</li>
              <li><strong>Completed tasks:</strong> Automatically cleaned up after 30 days (configurable)</li>
              <li><strong>Session logs:</strong> Retained for 90 days for security purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Data Rights (GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              If you are located in the European Union or European Economic Area, you have the following rights:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Right to Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. CCPA Rights (California Residents)</h2>
            <p className="text-muted-foreground leading-relaxed">
              California residents have additional rights under the California Consumer Privacy Act:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-3">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to say no to the sale of personal information (we do not sell data)</li>
              <li>Right to equal service and price</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Incident Response</h2>
            <p className="text-muted-foreground leading-relaxed">
              In the unlikely event of a data breach, we will:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-3">
              <li>Notify affected users within 72 hours</li>
              <li>Report to relevant authorities as required by law</li>
              <li>Take immediate steps to contain and remediate the breach</li>
              <li>Provide guidance on protective measures you can take</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact Our Data Protection Team</h2>
            <p className="text-muted-foreground leading-relaxed">
              For data protection inquiries, requests to exercise your rights, or to report a security concern:
            </p>
            <div className="bg-muted/30 p-4 rounded-lg mt-3">
              <p className="text-muted-foreground text-sm">
                <strong>Email:</strong>{' '}
                <a href="mailto:dpo@studyflow.us" className="text-primary hover:underline">dpo@studyflow.us</a>
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                We aim to respond to all requests within 30 days.
              </p>
            </div>
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

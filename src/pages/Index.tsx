import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  BookOpen, 
  Brain, 
  Target, 
  Upload, 
  MessageSquare,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Upload,
      title: 'Upload Documents',
      description: 'PDFs, web URLs, or Google Docs - we extract and process your learning materials automatically.',
    },
    {
      icon: Brain,
      title: 'AI-Powered Q&A',
      description: 'Ask questions and get accurate answers grounded in your documents with clear citations.',
    },
    {
      icon: Target,
      title: 'Study Smarter',
      description: 'Focus on understanding with AI that references exactly where information comes from.',
    },
  ];

  const benefits = [
    'No hallucinations - answers grounded in your documents',
    'Clear citations with page numbers',
    'Works with any PDF or web content',
    'Secure and private - your data stays yours',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">Learn Mate</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Learning Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
            Master Any Subject<br />
            <span className="gradient-text">With Your Own Documents</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Upload your learning materials and let AI help you understand them deeply.
            Get answers grounded in your content, with clear citations.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2 h-12 px-8 text-base">
                Start Learning Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="gap-2 h-12 px-8 text-base">
                <BookOpen className="w-5 h-5" />
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything You Need to Learn Effectively
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              A complete learning companion powered by AI, designed to help you understand and retain information.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl bg-card border border-border hover:shadow-card transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Why Learn Mate?
              </h2>
              <p className="text-lg text-muted-foreground">
                Built with a focus on accuracy and trust.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-muted/50"
                >
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            Join thousands of students and professionals who study smarter with AI.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="gap-2 h-12 px-8 text-base">
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-display font-semibold">Learn Mate</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Learn Mate. Built with AI, for learners.
          </p>
        </div>
      </footer>
    </div>
  );
}

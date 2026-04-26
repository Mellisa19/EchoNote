import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  PlayIcon, 
  CheckCircleIcon,
  SparklesIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  StarIcon,
  FolderIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const features = [
  {
    name: 'AI Summaries',
    description: 'Automatically generate concise summaries and key insights from any content.',
    icon: SparklesIcon,
    color: 'primary'
  },
  {
    name: 'Voice-to-Notes',
    description: 'Transform spoken words into organized, searchable notes instantly.',
    icon: MicrophoneIcon,
    color: 'accent'
  },
  {
    name: 'Chat with Notes',
    description: 'Ask questions about your content and get intelligent answers.',
    icon: ChatBubbleLeftRightIcon,
    color: 'primary'
  },
  {
    name: 'Auto Organization',
    description: 'Smart categorization and tagging keep everything perfectly organized.',
    icon: FolderIcon,
    color: 'accent'
  }
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Manager',
    company: 'TechCorp',
    content: 'EchoNote has revolutionized how we handle meetings. The AI summaries save us hours every week.',
    rating: 5
  },
  {
    name: 'Michael Rodriguez',
    role: 'CEO',
    company: 'StartupHub',
    content: 'The transcription accuracy is incredible. We can focus on the conversation instead of taking notes.',
    rating: 5
  },
  {
    name: 'Emily Watson',
    role: 'Design Lead',
    company: 'Creative Agency',
    content: 'Best meeting tool we\'ve ever used. The action item extraction is a game-changer.',
    rating: 5
  }
]

const pricingPlans = [
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    description: 'Perfect for individuals and small teams',
    features: [
      '5 hours of transcription per month',
      'Basic AI summaries',
      'Up to 3 team members',
      'Email support'
    ],
    cta: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'Best for growing teams and businesses',
    features: [
      '25 hours of transcription per month',
      'Advanced AI insights',
      'Up to 10 team members',
      'Priority support',
      'Custom integrations'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with custom needs',
    features: [
      'Unlimited transcription',
      'Custom AI models',
      'Unlimited team members',
      'Dedicated support',
      'On-premise option'
    ],
    cta: 'Contact Sales',
    popular: false
  }
]

export default function LandingPage() {
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-brand-dark text-white overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-purple/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-brand-blue/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand-purple">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">EchoNote</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Features</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Pricing</a>
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Sign In</Link>
              <Link to="/signup">
                <button className="btn-brand-purple px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/20">
                  Get Started Free
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 sm:pt-32 sm:pb-48 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-purple text-xs font-bold uppercase tracking-widest mb-8">
                <SparklesIcon className="h-4 w-4" />
                New: AI Meeting Intelligence 2.0
              </div>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight leading-[1.1]">
                Never take meeting <br className="hidden lg:block" />
                <span className="bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">notes again</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                EchoNote transcribes, summarizes, and extracts action items from your calls automatically. Focus on the conversation, we'll handle the rest.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto"
            >
              <div className="relative flex-1 w-full">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all"
                />
              </div>
              <Link to="/signup" className="w-full sm:w-auto">
                <button className="btn-brand-purple w-full px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2">
                  Start for free
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-20 relative max-w-5xl mx-auto"
            >
              <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10">
                <img 
                  src="/meeting_team_collaboration_1777115210420.png" 
                  alt="AI Meeting Collaboration" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent" />
                
                {/* Floating AI Elements */}
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="absolute top-1/4 right-[-5%] md:right-[-10%] glass p-6 rounded-3xl border-white/10 shadow-2xl max-w-xs hidden sm:block"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center">
                      <SparklesIcon className="h-6 w-6 text-brand-purple" />
                    </div>
                    <div className="font-bold text-white">AI Summary</div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[80%] bg-brand-purple rounded-full" />
                    </div>
                    <div className="h-2 w-[90%] bg-white/10 rounded-full" />
                    <div className="h-2 w-[70%] bg-white/10 rounded-full" />
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="absolute bottom-1/4 left-[-5%] md:left-[-10%] glass p-6 rounded-3xl border-white/10 shadow-2xl max-w-xs hidden sm:block"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center">
                      <ClockIcon className="h-6 w-6 text-brand-blue" />
                    </div>
                    <div className="font-bold text-white">Action Items</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-brand-blue" />
                      <div className="h-2 w-32 bg-white/10 rounded-full" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-brand-blue" />
                      <div className="h-2 w-24 bg-white/10 rounded-full" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">10M+</div>
              <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Meetings Recorded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">99.9%</div>
              <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">500k+</div>
              <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">150+</div>
              <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Languages</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
              Everything your team needs
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful AI features designed to make every meeting more productive and documented.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="glass" className="p-8 h-full border-white/5 hover:border-brand-purple/30 transition-all group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                    feature.color === 'primary' ? 'bg-brand-purple/10' : 'bg-brand-blue/10'
                  }`}>
                    <feature.icon className={`h-8 w-8 ${
                      feature.color === 'primary' ? 'text-brand-purple' : 'text-brand-blue'
                    }`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{feature.name}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-32 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-16 tracking-tight">Seamlessly Integrates with</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Mock logos using text/icons for now as per Figma style */}
            <div className="flex items-center gap-3 text-white text-2xl font-bold">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-brand-dark text-xs">G</span>
              </div>
              Google Calendar
            </div>
            <div className="flex items-center gap-3 text-white text-2xl font-bold">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">M</span>
              </div>
              Outlook
            </div>
            <div className="flex items-center gap-3 text-white text-2xl font-bold">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">S</span>
              </div>
              Slack
            </div>
            <div className="flex items-center gap-3 text-white text-2xl font-bold">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-white/10">
                <span className="text-white text-xs">N</span>
              </div>
              Notion
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative z-10 px-6">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-brand-purple to-brand-pink p-12 sm:p-20 text-center relative overflow-hidden shadow-2xl shadow-purple-500/20">
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-8 tracking-tight">Ready to master your meetings?</h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto">Join thousands of teams who are already saving time and capturing every detail with EchoNote.</p>
            <Link to="/signup">
              <button className="bg-white text-brand-purple px-10 py-5 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all shadow-xl">
                Get Started Free
              </button>
            </Link>
          </div>
          <SparklesIcon className="absolute -right-10 -bottom-10 w-64 h-64 text-white/10" />
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-32 pb-16 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-24">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-8">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand-purple">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">EchoNote</span>
              </div>
              <p className="text-gray-500 text-lg max-w-xs leading-relaxed">Making meetings productive and actionable with industry-leading AI intelligence.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-gray-600 text-sm font-medium">
            <p>© 2026 EchoNote Inc. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

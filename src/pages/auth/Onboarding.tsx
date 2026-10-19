import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, MapPin, Target, Sparkles, ArrowRight, ArrowLeft,
  ShoppingBag, Scissors, Coffee, Briefcase, Heart, Monitor, BookOpen, Wrench,
  TrendingUp, Clock, Globe, Megaphone, Bot, PenTool, BarChart3, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getService } from '@/core';

// Constants
const GOVERNORATES = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba', 
  'Kairouan', 'Kasserine', 'Kebili', 'Kef', 'Mahdia', 'Manouba', 'Medenine', 
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine', 
  'Tozeur', 'Tunis', 'Zaghouan'
];

const INDUSTRIES = [
  { id: 'retail', label: 'Retail', icon: ShoppingBag },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'food', label: 'Food & Bev', icon: Coffee },
  { id: 'fashion', label: 'Fashion', icon: Scissors },
  { id: 'beauty', label: 'Beauty', icon: Heart },
  { id: 'tech', label: 'Tech', icon: Monitor },
  { id: 'education', label: 'Education', icon: BookOpen },
  { id: 'other', label: 'Other', icon: Briefcase },
];

const GOALS = [
  { id: 'sales', label: 'Increase sales & revenue', icon: TrendingUp, color: 'text-emerald-500' },
  { id: 'time', label: 'Save time with automation', icon: Clock, color: 'text-blue-500' },
  { id: 'presence', label: 'Build online presence', icon: Globe, color: 'text-indigo-500' },
  { id: 'marketing', label: 'Improve my marketing', icon: Megaphone, color: 'text-orange-500' },
  { id: 'support', label: 'Automate customer support', icon: Bot, color: 'text-purple-500' },
  { id: 'content', label: 'Create better content', icon: PenTool, color: 'text-pink-500' },
  { id: 'market', label: 'Understand my market better', icon: BarChart3, color: 'text-cyan-500' },
  { id: 'operations', label: 'Streamline operations', icon: Settings, color: 'text-slate-500' },
];

const STAGES = [
  { id: 'idea', emoji: '💡', title: 'Just an idea', desc: 'Exploring possibilities' },
  { id: 'startup', emoji: '🌱', title: 'Just started', desc: '< 6 months in operation' },
  { id: 'growing', emoji: '📈', title: 'Growing', desc: '6 months - 2 years' },
  { id: 'established', emoji: '🏢', title: 'Established', desc: '2+ years in business' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const stepParam = parseInt(searchParams.get('step') || '1', 10);
  const currentStep = isNaN(stepParam) || stepParam < 1 || stepParam > 3 ? 1 : stepParam;

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    location: '',
    stage: '',
    description: '',
    goals: [] as string[]
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleGoal = (id: string) => {
    setFormData(prev => {
      const isSelected = prev.goals.includes(id);
      if (isSelected) {
        return { ...prev, goals: prev.goals.filter(g => g !== id) };
      } else {
        return { ...prev, goals: [...prev.goals, id] };
      }
    });
  };

  const goToStep = (stepNumber: number) => {
    setSearchParams({ step: stepNumber.toString() });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      goToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      const workspaceService = getService<any>('workspace');
      const businessName = formData.businessName || 'My Business';
      
      // Create the initial workspace for the user
      const { data: workspace, error } = await workspaceService.createWorkspace(businessName);
      
      if (error) {
        toast.error('Failed to create your workspace: ' + error.message);
        return;
      }

      console.log('Profile and workspace created successfully', { formData, workspace });
      navigate('/dashboard');
    } catch (e: any) {
      toast.error('An unexpected error occurred during onboarding');
      console.error(e);
    }
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  // Store direction of navigation for animation
  const [direction, setDirection] = useState(1);
  const handleStepChange = (newStep: number) => {
    setDirection(newStep > currentStep ? 1 : -1);
    goToStep(newStep);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      
      {/* Top Progress Bar & Header */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">A</div>
          <span className="font-bold text-lg tracking-tight hidden sm:block">Ayech AI</span>
        </div>
        
        <div className="flex-1 max-w-md mx-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Step {currentStep} of 3</span>
            <span className="text-xs font-medium text-zinc-500">
              {currentStep === 1 ? 'Business Profile' : currentStep === 2 ? 'Goals' : 'Toolkit'}
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: '33%' }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          </div>
        </div>

        <button 
          onClick={async () => {
            try {
              const workspaceService = getService<any>('workspace');
              await workspaceService.createWorkspace('My Business');
              navigate('/dashboard');
            } catch (e) {
              console.error('Failed to create default workspace on skip', e);
              navigate('/dashboard');
            }
          }}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Skip for now
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-3xl mx-auto p-6 sm:p-10 flex flex-col relative overflow-hidden">
        
        <AnimatePresence custom={direction} mode="wait">
          
          {/* STEP 1: BUSINESS PROFILE */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Let's personalize your experience 🎯</h1>
                <p className="text-zinc-500 mt-2 text-lg">Tell us a bit about your business so we can tailor Ayech AI to your needs.</p>
              </div>

              <div className="space-y-6 flex-1">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-zinc-400" /> Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., My Awesome Store"
                    value={formData.businessName}
                    onChange={(e) => updateForm('businessName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-colors outline-none text-zinc-900 text-lg shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">Industry</label>
                    <div className="relative">
                      <select
                        value={formData.industry}
                        onChange={(e) => updateForm('industry', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-colors outline-none text-zinc-900 appearance-none shadow-sm cursor-pointer"
                      >
                        <option value="" disabled>Select an industry...</option>
                        {INDUSTRIES.map(ind => (
                          <option key={ind.id} value={ind.id}>{ind.label}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-zinc-400">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-zinc-400" /> Location
                    </label>
                    <div className="relative">
                      <select
                        value={formData.location}
                        onChange={(e) => updateForm('location', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-colors outline-none text-zinc-900 appearance-none shadow-sm cursor-pointer"
                      >
                        <option value="" disabled>Select governorate...</option>
                        {GOVERNORATES.map(gov => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-zinc-400">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-700">Business Stage</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {STAGES.map((stage) => (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => updateForm('stage', stage.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group",
                          formData.stage === stage.id 
                            ? "border-emerald-500 bg-emerald-50/50 shadow-md transform scale-[1.02]" 
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        <div className="text-2xl mb-2">{stage.emoji}</div>
                        <h3 className="font-semibold text-zinc-900">{stage.title}</h3>
                        <p className="text-xs text-zinc-500 mt-1">{stage.desc}</p>
                        
                        {formData.stage === stage.id && (
                          <div className="absolute top-3 right-3 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 14 10" fill="none">
                              <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pb-20">
                  <label className="text-sm font-medium text-zinc-700">Brief Description (Optional)</label>
                  <textarea
                    placeholder="What does your business do?"
                    value={formData.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-colors outline-none text-zinc-900 resize-none shadow-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: GOALS */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
                  What are your goals? <Target className="w-8 h-8 text-emerald-500" />
                </h1>
                <p className="text-zinc-500 mt-2 text-lg">Select all that apply. This helps Ayech suggest the right tools for you.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
                {GOALS.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = formData.goals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 transition-all w-full text-left bg-white",
                        isSelected 
                          ? "border-emerald-500 shadow-md transform scale-[1.01] bg-emerald-50/20" 
                          : "border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors",
                        isSelected ? "bg-emerald-100" : "bg-zinc-100"
                      )}>
                        <Icon className={cn("w-6 h-6", isSelected ? "text-emerald-600" : goal.color)} />
                      </div>
                      <div className="flex-1 font-semibold text-zinc-900 text-lg">
                        {goal.label}
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                        isSelected ? "border-emerald-500 bg-emerald-500" : "border-zinc-300"
                      )}>
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 14 10" fill="none">
                            <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </button>
                    );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: RECOMMENDATIONS */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
                  Here's what we recommend ✨
                </h1>
                <p className="text-zinc-500 mt-2 text-lg">Based on your profile, these tools will give you the biggest impact.</p>
              </div>

              {/* AI Message */}
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl mb-8 flex gap-4 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-200 blur-3xl rounded-full opacity-50" />
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 font-bold text-xl text-emerald-600 border border-emerald-100 z-10">
                  A
                </div>
                <div className="z-10">
                  <h3 className="font-bold text-zinc-900 mb-1">Ayech's Strategy Plan</h3>
                  <p className="text-sm text-zinc-700 leading-relaxed mb-3">
                    Hi {formData.businessName || 'there'}! Because you're in {formData.industry || 'business'} and looking to {formData.goals.length > 0 ? 'achieve your goals' : 'grow'}, I recommend starting with these 3 actions:
                  </p>
                  <ul className="space-y-2 text-sm text-zinc-800 font-medium">
                    <li className="flex gap-2 items-start"><span className="text-emerald-600">•</span> Create an automated WhatsApp welcome message for new inquiries.</li>
                    <li className="flex gap-2 items-start"><span className="text-emerald-600">•</span> Generate a pricing strategy adapted to {formData.location || 'Tunisia'}.</li>
                    <li className="flex gap-2 items-start"><span className="text-emerald-600">•</span> Plan a 7-day social media content calendar.</li>
                  </ul>
                </div>
              </div>

              {/* Recommended Tools Grid */}
              <h3 className="font-semibold text-zinc-900 mb-4 px-1">Your Personalized Toolkit</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-24">
                <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-zinc-900 mb-1">WhatsApp Templates</h4>
                  <p className="text-xs text-zinc-500 mb-4 line-clamp-2">Convert leads faster with professional, pre-written responses.</p>
                  <div className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                    Explore Tool <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-zinc-900 mb-1">Content Calendar</h4>
                  <p className="text-xs text-zinc-500 mb-4 line-clamp-2">AI generates a full week of social media posts specific to your niche.</p>
                  <div className="text-sm font-semibold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1">
                    Explore Tool <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-zinc-900 mb-1">Pricing Strategy</h4>
                  <p className="text-xs text-zinc-500 mb-4 line-clamp-2">Find the perfect price point based on your costs and market.</p>
                  <div className="text-sm font-semibold text-purple-600 group-hover:text-purple-700 flex items-center gap-1">
                    Explore Tool <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-zinc-900 mb-1">Lead Gen Planner</h4>
                  <p className="text-xs text-zinc-500 mb-4 line-clamp-2">Create a step-by-step strategy to attract new paying customers.</p>
                  <div className="text-sm font-semibold text-orange-600 group-hover:text-orange-700 flex items-center gap-1">
                    Explore Tool <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 sm:p-6 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => handleStepChange(currentStep - 1)}
            disabled={currentStep === 1}
            className={cn(
              "flex items-center gap-2 font-medium px-4 py-2.5 rounded-xl transition-colors",
              currentStep === 1 ? "opacity-0 cursor-default pointer-events-none" : "text-zinc-600 hover:bg-zinc-100"
            )}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {currentStep < 3 ? (
            <button
              onClick={() => handleStepChange(currentStep + 1)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-8 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              <span className="text-lg leading-none mb-1">🎉</span> Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Globe, Facebook, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function Register() {
  const navigate = useNavigate();
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+216 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [agreeTos, setAgreeTos] = useState(false);
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'fr' | 'ar'>('en');

  // Business Types
  const businessTypes = [
    'Retail', 'Services', 'Food & Beverage', 'Fashion', 
    'Beauty', 'Tech', 'Education', 'Other'
  ];

  // Logic: Phone Number Formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+216 ')) {
      val = '+216 ' + val.replace(/^\+216\s*/, '');
    }
    // Only allow numbers and spaces after the prefix
    const prefix = '+216 ';
    const remainder = val.slice(prefix.length).replace(/[^0-9\s]/g, '');
    
    // Format as: XX XXX XXX
    const cleaned = remainder.replace(/\s/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + ' ' + cleaned.slice(2);
    }
    if (cleaned.length > 5) {
      formatted = cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 5) + ' ' + cleaned.slice(5, 8);
    }
    
    setPhone(prefix + formatted);
  };

  // Logic: Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-zinc-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score < 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim()) return setError('Full name is required');
    if (!validateEmail(email)) return setError('Please enter a valid email address');
    
    const phoneDigits = phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length !== 11) return setError('Please enter a valid 8-digit Tunisian phone number');
    
    if (password.length < 8) return setError('Password must be at least 8 characters long');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (!agreeTos) return setError('You must agree to the Terms of Service and Privacy Policy');

    setIsSubmitting(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            business_type: businessType,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    console.log(`Registering with ${provider}`);
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col py-10 sm:justify-center items-center relative overflow-hidden font-sans">
      
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />

      {/* Top Navigation / Language Selector */}
      <div className="absolute top-6 right-8 flex items-center gap-2">
        <Globe className="w-4 h-4 text-zinc-500" />
        <select 
          className="bg-transparent text-sm text-zinc-600 font-medium focus:outline-none cursor-pointer hover:text-zinc-900 transition-colors"
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'en' | 'fr' | 'ar')}
        >
          <option value="en">🇬🇧 English</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="ar">🇹🇳 عربي</option>
        </select>
      </div>

      <div className="w-full max-w-[520px] px-4 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-600/20 mb-4">
            A
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Create an account</h1>
          <p className="text-sm text-zinc-500 mt-1">Join Ayech AI and empower your business</p>
        </div>

        {/* Register Card */}
        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 relative">
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 block" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-colors duration-200 outline-none text-zinc-900"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 block" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-colors duration-200 outline-none text-zinc-900"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 block" htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-colors duration-200 outline-none text-zinc-900 font-mono text-sm"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 block" htmlFor="businessType">Business Type (Optional)</label>
                <select
                  id="businessType"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-colors duration-200 outline-none text-zinc-900 appearance-none"
                  disabled={isSubmitting}
                >
                  <option value="" disabled>Select industry</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 block" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-colors duration-200 outline-none text-zinc-900"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                <div className="h-1.5 w-full bg-zinc-100 rounded-full mt-2 overflow-hidden flex gap-1">
                  <div className={cn("h-full transition-all duration-300 rounded-full", password.length > 0 ? strength.color : 'bg-transparent', strength.score > 0 ? 'w-1/3' : 'w-0')} />
                  <div className={cn("h-full transition-all duration-300 rounded-full", strength.score > 1 ? strength.color : 'bg-transparent', strength.score > 1 ? 'w-1/3' : 'w-0')} />
                  <div className={cn("h-full transition-all duration-300 rounded-full", strength.score > 2 ? strength.color : 'bg-transparent', strength.score > 2 ? 'w-1/3' : 'w-0')} />
                </div>
                <div className="text-[10px] text-zinc-500 text-right h-3 font-medium">
                  {password.length > 0 && strength.label}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 block" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl border bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-colors duration-200 outline-none text-zinc-900",
                      confirmPassword && password !== confirmPassword ? "border-red-300 focus:border-red-500" : "border-zinc-200"
                    )}
                    disabled={isSubmitting}
                  />
                  {confirmPassword && password === confirmPassword && (
                    <CheckCircle2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                  )}
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 mt-4 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={agreeTos}
                  onChange={(e) => setAgreeTos(e.target.checked)}
                  className="peer appearance-none w-4 h-4 border border-zinc-300 rounded checked:bg-emerald-600 checked:border-emerald-600 transition-colors cursor-pointer"
                />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm text-zinc-600 leading-snug">
                I agree to the <button type="button" className="text-emerald-600 font-medium hover:underline">Terms of Service</button> and <button type="button" className="text-emerald-600 font-medium hover:underline">Privacy Policy</button>
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span className="mr-1">🚀</span> Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-zinc-500 uppercase font-semibold tracking-wider">
                Or sign up with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleSocialRegister('Google')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all text-sm font-medium text-zinc-700 shadow-sm"
              type="button"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button 
              onClick={() => handleSocialRegister('Facebook')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all text-sm font-medium text-zinc-700 shadow-sm"
              type="button"
            >
              <Facebook className="w-4 h-4 text-[#1877F2]" fill="currentColor" />
              Facebook
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-sm text-zinc-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
            Login →
          </Link>
        </p>
      </div>

      <div className="absolute bottom-6 text-xs text-zinc-400 font-medium">
        © {new Date().getFullYear()} Ayech AI. All rights reserved.
      </div>
    </div>
  );
}

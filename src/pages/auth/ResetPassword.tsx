import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, Globe, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [language, setLanguage] = useState<'en' | 'fr' | 'ar'>('en');

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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API Call - Replace with actual password reset using \`token\`
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      
      // Auto redirect after 2s
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError('Failed to reset password. The link might be expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token && process.env.NODE_ENV !== 'development') {
    // Ideally redirect if no token, but allowing in dev for testing
    // return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col pt-10 sm:pt-0 sm:justify-center items-center relative overflow-hidden font-sans">
      
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

      <div className="w-full max-w-md px-4 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-600/20 mb-4">
             <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Create new password</h1>
          <p className="text-sm text-zinc-500 mt-1 text-center">
            Your new password must be different from previously used passwords.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Error Banner */}
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

                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700 block" htmlFor="password">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={cn(
                          "w-full px-4 py-2.5 rounded-xl border bg-zinc-50 focus:bg-white transition-colors duration-200 outline-none text-zinc-900",
                          error && password.length > 0 && password.length < 8 ? "border-red-300 focus:border-red-500" : "border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        )}
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
                    <label className="text-sm font-medium text-zinc-700 block" htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={cn(
                          "w-full px-4 py-2.5 rounded-xl border bg-zinc-50 focus:bg-white transition-colors duration-200 outline-none text-zinc-900",
                          confirmPassword && password !== confirmPassword ? "border-red-300 focus:border-red-500" : "border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        )}
                        disabled={isSubmitting}
                      />
                      {confirmPassword && password === confirmPassword && (
                        <CheckCircle2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Password Reset</h3>
                <p className="text-sm text-zinc-500 mb-6">
                  Your password has been successfully reset. Redirecting to login...
                </p>
                <Link
                  to="/login"
                  className="text-sm font-medium px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-colors"
                >
                  Go to Login Now
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

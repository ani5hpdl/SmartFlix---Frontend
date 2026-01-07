import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Play, Check, X } from 'lucide-react';

export default function Test() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (pass.match(/[a-z]+/)) strength += 25;
    if (pass.match(/[A-Z]+/)) strength += 25;
    if (pass.match(/[0-9]+/)) strength += 25;
    return strength;
  };

  const strength = calculatePasswordStrength(password);
  
  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-yellow-500';
    if (strength <= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = password && confirmPassword && password !== confirmPassword;

  const handleSubmit = () => {
    if (!fullName || !email || !password || !confirmPassword || !agreeToTerms) {
      alert('Please fill in all fields and agree to terms');
      return;
    }
    if (passwordsDontMatch) {
      alert('Passwords do not match');
      return;
    }
    console.log('Account created successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced background with movie theater theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/90 via-slate-950 to-blue-950/90"></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-fuchsia-600/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      
      {/* Cinematic light rays */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent opacity-50"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      {/* Noise texture overlay for depth */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]"></div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
            <Play className="w-6 h-6 text-white fill-white relative z-10" />
          </div>
          <span className="text-white text-2xl font-bold tracking-tight">MovieStream</span>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
          Need help?
        </button>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-slate-800/80 relative z-10">
        {/* Card shine effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>
        
        <div className="text-center mb-8 relative">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            Start Your Watchlist
          </h1>
          <p className="text-gray-400 text-sm">Get personalized movie recommendations today.</p>
        </div>

        <div className="space-y-4 relative">
          {/* Full Name Input */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all hover:border-slate-600"
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all hover:border-slate-600"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-11 pr-11 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all hover:border-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Strength</span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    strength <= 25 ? 'text-red-400' :
                    strength <= 50 ? 'text-yellow-400' :
                    strength <= 75 ? 'text-orange-400' :
                    'text-green-400'
                  }`}>
                    {getStrengthLabel()}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${getStrengthColor()} shadow-lg`}
                    style={{ width: `${strength}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-slate-800/60 border rounded-xl pl-11 pr-11 py-3.5 text-white placeholder-gray-500 focus:outline-none transition-all hover:border-slate-600 ${
                  passwordsMatch ? 'border-green-500/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/30' :
                  passwordsDontMatch ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/30' :
                  'border-slate-700/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {passwordsMatch && (
                <Check className="absolute right-11 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
              )}
              {passwordsDontMatch && (
                <X className="absolute right-11 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
              )}
            </div>
            {passwordsDontMatch && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <X className="w-3 h-3" />
                Passwords do not match
              </p>
            )}
            {passwordsMatch && (
              <p className="text-green-400 text-xs mt-1.5 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Passwords match
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-5 h-5 rounded-md border-slate-600 bg-slate-800/60 text-purple-600 focus:ring-2 focus:ring-purple-500/30 focus:ring-offset-0 cursor-pointer transition-all hover:border-purple-500"
              />
            </div>
            <label htmlFor="terms" className="text-sm text-gray-400 leading-snug cursor-pointer select-none">
              I agree to the{' '}
              <button className="text-purple-400 hover:text-purple-300 transition-colors font-medium underline decoration-purple-500/30 hover:decoration-purple-300/50">
                Terms of Service
              </button>
              {' '}and{' '}
              <button className="text-purple-400 hover:text-purple-300 transition-colors font-medium underline decoration-purple-500/30 hover:decoration-purple-300/50">
                Privacy Policy
              </button>
              .
            </label>
          </div>

          {/* Create Account Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 hover:from-purple-500 hover:via-purple-400 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-[1.02] active:scale-[0.98] mt-2 relative overflow-hidden group"
          >
            <span className="relative z-10">Create Account</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900/70 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-white py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-semibold">Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-white py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span className="text-sm font-semibold">Apple</span>
            </button>
          </div>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-gray-400 text-sm mt-6 relative">
          Already a member?{' '}
          <button className="text-white hover:text-purple-300 font-semibold transition-colors underline decoration-purple-500/30 hover:decoration-purple-300/50">
            Sign In
          </button>
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-20">
        <p className="text-gray-500 text-xs font-medium">© 2024 MovieStream. All rights reserved.</p>
      </div>
    </div>
  );
}
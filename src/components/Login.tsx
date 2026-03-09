import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import { Language, translations } from '../lib/translations';

interface LoginProps {
  language: Language;
}

export const Login: React.FC<LoginProps> = ({ language }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (!success) {
        setError(language === 'pl' ? 'Nieprawidłowy e-mail lub hasło' : 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-deep-black p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-pro-blue/20 flex items-center justify-center border border-pro-blue/30 shadow-[0_0_20px_rgba(0,83,160,0.3)]">
              <ShieldCheck className="w-8 h-8 text-pro-blue" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase">GUSCHALL Vision Pro</h1>
          <p className="text-white/40 text-sm uppercase tracking-widest">v2.0 Secure Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-pro-blue/50 transition-colors"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-pro-blue/50 transition-colors"
                required
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-red-500 text-xs text-center font-bold uppercase tracking-wider"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full gold-button flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>LOGIN SECURE</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">
            Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
};

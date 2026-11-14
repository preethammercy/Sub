import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShieldCheck, X } from 'lucide-react';
import { api, setStoredToken } from '../lib/api';
import { signInWithGooglePopup } from '../lib/firebase';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: User) => void;
  initialPrompt?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  initialPrompt,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const { idToken } = await signInWithGooglePopup();
      const res = await api.firebaseLogin({ idToken });
      setStoredToken(res.token);
      onAuthenticated(res.user);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      if (msg.includes('popup-closed-by-user')) {
        setError('Sign-in popup was closed. Please click Continue with Google to try again.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-[#121216] border border-white/10 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#E50914] via-[#F40612] to-red-900" />

            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div>
                <h2 id="auth-modal-title" className="font-display text-lg font-bold text-white">
                  Sign in to ottsub
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {initialPrompt || 'Authenticate securely with your Google account'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sign in dialog"
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div
                  className="p-3 text-xs text-red-200 bg-red-950/70 border border-red-500/40 rounded-lg"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <motion.button
                type="button"
                disabled={loading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 text-sm font-semibold text-zinc-950 bg-white hover:bg-zinc-100 disabled:opacity-60 rounded-xl transition-colors cursor-pointer shadow-lg"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                <span>{loading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
              </motion.button>

              <div className="pt-4 border-t border-white/10 flex items-start gap-2.5 text-xs text-zinc-400 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Protected by Firebase Authentication. Your verified Google email receives your ottsub order status and 3-part credentials vault.
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

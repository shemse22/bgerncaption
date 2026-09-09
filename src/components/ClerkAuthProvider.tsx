import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClerkProvider, useUser, useClerk, useAuth } from '@clerk/clerk-react';
import { KeyRound, ExternalLink, X } from 'lucide-react';
import { User } from '../types';

export interface AuthServiceType {
  isClerkConfigured: boolean;
  isSignedIn: boolean;
  isLoaded: boolean;
  clerkAppUser: User | null;
  openSignIn: () => void;
  openSignUp: () => void;
  signOut: () => Promise<void>;
  openKeyModal: () => void;
  publishableKey: string;
  setCustomKey: (key: string) => void;
  /** Returns the real, signed Clerk session token so the backend can verify it. */
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthServiceType>({
  isClerkConfigured: false,
  isSignedIn: false,
  isLoaded: true,
  clerkAppUser: null,
  openSignIn: () => {},
  openSignUp: () => {},
  signOut: async () => {},
  openKeyModal: () => {},
  publishableKey: '',
  setCustomKey: () => {},
  getToken: async () => null,
});

export const useAuthService = () => useContext(AuthContext);

// Inside ClerkProvider: uses real Clerk hooks
const ClerkBridge: React.FC<{
  children: React.ReactNode;
  publishableKey: string;
  setCustomKey: (key: string) => void;
  openKeyModal: () => void;
}> = ({ children, publishableKey, setCustomKey, openKeyModal }) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const clerk = useClerk();

  let clerkAppUser: User | null = null;
  if (isSignedIn && user) {
    const email = user.primaryEmailAddress?.emailAddress || '';
    const name = user.fullName || user.firstName || email.split('@')[0] || 'Creator';
    const avatar = user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=256&bold=true`;

    clerkAppUser = {
      id: user.id,
      clerkId: user.id,
      name,
      email,
      avatar,
      googleOriginalAvatar: user.imageUrl,
      // This is just an optimistic local placeholder for the UI while the real
      // login request is in flight -- the server verifies the Clerk session
      // itself and decides the real role. It never trusts this client value.
      role: 'user',
      availableMinutes: 180, // 3 free minutes = 180 seconds initial
      plan: 'free',
      status: 'active',
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      provider: 'clerk',
      preferredLanguage: 'Amharic',
      autoGenerateThumbnails: true,
    };
  }

  const value: AuthServiceType = {
    isClerkConfigured: true,
    isSignedIn: Boolean(isSignedIn),
    isLoaded,
    clerkAppUser,
    openSignIn: () => clerk.openSignIn(),
    openSignUp: () => clerk.openSignUp(),
    signOut: async () => {
      await clerk.signOut();
    },
    openKeyModal,
    publishableKey,
    setCustomKey,
    getToken: async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Fallback when Clerk key is not configured
const ClerkFallbackBridge: React.FC<{
  children: React.ReactNode;
  publishableKey: string;
  setCustomKey: (key: string) => void;
  openKeyModal: () => void;
}> = ({ children, publishableKey, setCustomKey, openKeyModal }) => {
  const value: AuthServiceType = {
    isClerkConfigured: false,
    isSignedIn: false,
    isLoaded: true,
    clerkAppUser: null,
    openSignIn: () => openKeyModal(),
    openSignUp: () => openKeyModal(),
    signOut: async () => {},
    openKeyModal,
    publishableKey,
    setCustomKey,
    getToken: async () => null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

export const ClerkAuthProvider: React.FC<ClerkAuthProviderProps> = ({ children }) => {
  const envKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined)?.trim() || '';
  const [publishableKey, setPublishableKey] = useState<string>(() => {
    return envKey || localStorage.getItem('clerk_publishable_key') || '';
  });
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [inputKey, setInputKey] = useState<string>('');

  useEffect(() => {
    if (envKey) {
      setPublishableKey(envKey);
    }
  }, [envKey]);

  const handleSaveKey = (keyToSave: string) => {
    const trimmed = keyToSave.trim();
    if (trimmed) {
      localStorage.setItem('clerk_publishable_key', trimmed);
      setPublishableKey(trimmed);
      setShowKeyModal(false);
    }
  };

  const isConfigured = Boolean(
    publishableKey &&
      (publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_') || publishableKey.length > 20)
  );

  return (
    <>
      {isConfigured ? (
        <ClerkProvider
          publishableKey={publishableKey}
          afterSignInUrl="https://bgern.com"
          afterSignUpUrl="https://bgern.com"
          signInFallbackRedirectUrl="https://bgern.com"
          signUpFallbackRedirectUrl="https://bgern.com"
          appearance={{
            variables: {
              colorPrimary: '#9333ea',
              colorBackground: '#131b2e',
              colorText: '#ffffff',
              colorInputBackground: '#0c1220',
              colorInputText: '#ffffff',
            },
            elements: {
              card: 'bg-[#131B2E] border border-slate-700 text-white rounded-3xl shadow-2xl',
              headerTitle: 'text-white font-extrabold',
              headerSubtitle: 'text-slate-400',
              socialButtonsBlockButton: 'bg-[#1e293b] border-slate-700 text-white hover:bg-slate-750',
              formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold',
              footerActionLink: 'text-purple-400 hover:text-purple-300 font-bold',
            },
          }}
        >
          <ClerkBridge
            publishableKey={publishableKey}
            setCustomKey={handleSaveKey}
            openKeyModal={() => setShowKeyModal(true)}
          >
            {children}
          </ClerkBridge>
        </ClerkProvider>
      ) : (
        <ClerkFallbackBridge
          publishableKey={publishableKey}
          setCustomKey={handleSaveKey}
          openKeyModal={() => setShowKeyModal(true)}
        >
          {children}
        </ClerkFallbackBridge>
      )}

      {/* Floating Clerk Setup helper button if key is not yet provided */}
      {!isConfigured && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowKeyModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 active:scale-95 transition"
            title="Configure Clerk Publishable Key"
          >
            <KeyRound className="w-4 h-4" />
            <span>Connect Clerk Key</span>
          </button>
        </div>
      )}

      {/* Clerk Key Setup Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#131B2E] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Clerk Authentication</h3>
                  <p className="text-[11px] text-slate-400">Connect your Clerk publishable key</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              To enable real sign-in (Google, email, password) with Clerk, enter your <strong>Publishable Key</strong> from your Clerk dashboard:
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-400">
                Clerk Publishable Key (<code className="text-purple-300">pk_test_...</code> or <code className="text-purple-300">pk_live_...</code>)
              </label>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="pk_test_..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C1220] border border-slate-700 focus:border-purple-500 text-xs font-mono text-white placeholder:text-slate-600 outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>Get key on Clerk Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowKeyModal(false);
                  window.dispatchEvent(new CustomEvent('open-mock-auth'));
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 underline cursor-pointer"
              >
                Or test with Demo Account
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveKey(inputKey)}
                  disabled={!inputKey.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition"
                >
                  Save & Activate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


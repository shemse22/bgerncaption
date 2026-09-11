import React, { useState, useEffect } from 'react';
import { User, Project, MinuteTransaction, PaymentRecord, AppNotification, SystemSettings, VideoAspectRatio, VideoPlatform } from './types';
import { StorageAPI, INITIAL_CURRENT_USER, INITIAL_PROJECTS, INITIAL_TRANSACTIONS, INITIAL_PAYMENTS, INITIAL_NOTIFICATIONS, INITIAL_SETTINGS, INITIAL_USERS } from './lib/storage';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { HomeDashboard } from './components/HomeDashboard';
import { WelcomeSplash } from './components/WelcomeSplash';
import { UploadModal } from './components/UploadModal';
import { GeneratingView } from './components/GeneratingView';
import { CaptionEditor } from './components/CaptionEditor';
import { ExportModal } from './components/ExportModal';
import { ProjectsView } from './components/ProjectsView';
import { WalletView } from './components/WalletView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminPage } from './components/AdminPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { DeleteProjectModal } from './components/DeleteProjectModal';
import { DEFAULT_STYLE, STYLE_PRESETS, SAMPLE_VIDEOS, SampleVideo } from './lib/amharicData';
import { transcribeVideo, TranscriptionProgress } from './lib/transcription';
import { Theme, getInitialTheme, applyTheme } from './lib/theme';
import { Api, ServerState } from './lib/api';
import { useAuthService } from './components/ClerkAuthProvider';

type ViewMode = 'main' | 'splash' | 'upload' | 'generating' | 'editor';

export default function App() {
  const authService = useAuthService();
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [currentUser, setCurrentUser] = useState<User>(() => StorageAPI.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => StorageAPI.getUsers());
  const [projects, setProjects] = useState<Project[]>(() => StorageAPI.getProjects());
  const [transactions, setTransactions] = useState<MinuteTransaction[]>(() =>
    StorageAPI.getTransactions(currentUser.id)
  );
  const [payments, setPayments] = useState<PaymentRecord[]>(() => StorageAPI.getPayments());
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    StorageAPI.getNotifications(currentUser.id)
  );
  const [settings, setSettings] = useState<SystemSettings>(() => StorageAPI.getSettings());

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const isAdminPath = () =>
    typeof window !== 'undefined' &&
    (window.location.pathname === '/admin' ||
      window.location.pathname.startsWith('/admin/') ||
      window.location.hash.startsWith('#/admin'));
  const [isStandaloneAdmin, setIsStandaloneAdmin] = useState(isAdminPath);

  // Google Auth Gate & Project Deletion states
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState<boolean>(false);
  const [googleAuthPurpose, setGoogleAuthPurpose] = useState<string>('start generating captions');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Active Project & Uploading state
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | undefined>();
  const [pendingSampleId, setPendingSampleId] = useState<string | undefined>();
  const [generatingProjectData, setGeneratingProjectData] = useState<{
    id: string;
    title: string;
    duration: number;
    progress: number;
    stage: TranscriptionProgress['stage'];
    error?: string;
  } | null>(null);
  const [exportModalProject, setExportModalProject] = useState<Project | null>(null);
  const [walletAutoOpenModal, setWalletAutoOpenModal] = useState<boolean>(false);

  const applyServerState = (state: ServerState) => {
    if (!state) return;
    if (state.settings) {
      setSettings(state.settings);
      StorageAPI.setSettings(state.settings);
    }
    if (state.currentUser) {
      setCurrentUser(state.currentUser);
      StorageAPI.setCurrentUser(state.currentUser);
    }
    if (Array.isArray(state.users)) {
      const cleanUsers = state.users.filter((u) => !['usr-2', 'usr-3', 'usr-4', 'usr-5', 'usr-6'].includes(u.id));
      setUsers(cleanUsers);
      StorageAPI.setUsers(cleanUsers);
    }
    if (Array.isArray(state.projects)) {
      setProjects(state.projects);
      StorageAPI.setProjects(state.projects);
    }
    if (Array.isArray(state.transactions)) {
      setTransactions(state.transactions);
      StorageAPI.setTransactions(state.transactions);
    }
    if (Array.isArray(state.payments)) {
      const cleanPayments = state.payments.filter((p) => !['pay-1039', 'pay-1040', 'pay-1041', 'pay-1042'].includes(p.id));
      setPayments(cleanPayments);
      StorageAPI.setPayments(cleanPayments);
    }
    if (Array.isArray(state.notifications)) {
      setNotifications(state.notifications);
      StorageAPI.setNotifications(state.notifications);
    }
  };

  // Sync theme to document element
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    // 1. Immediately fetch public server settings so ALL users (guests & creators) get live bank accounts
    Api.getSettings()
      .then((liveSettings) => {
        if (liveSettings && Array.isArray(liveSettings.paymentPlatforms)) {
          setSettings(liveSettings);
          StorageAPI.setSettings(liveSettings);
        }
      })
      .catch((err) => console.warn('Could not fetch server settings:', err));

    // 2. Fetch session (returns public state even for guests)
    Api.session().then(applyServerState).catch(() => undefined);
  }, []);

  useEffect(() => {
    const syncRoute = () => setIsStandaloneAdmin(isAdminPath());
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync state to storage
  const syncCurrentUser = (u: User) => {
    setCurrentUser(u);
    StorageAPI.setCurrentUser(u);
    // Also update in users list
    const updatedUsers = users.map((usr) => (usr.id === u.id ? u : usr));
    setUsers(updatedUsers);
    StorageAPI.setUsers(updatedUsers);
  };

  const syncProjects = (projs: Project[]) => {
    setProjects(projs);
    StorageAPI.setProjects(projs);
  };

  // Switch between user mode and admin mode
  const handleToggleRole = () => {
    const nextRole = currentUser.role === 'admin' ? 'user' : 'admin';
    const updated: User = { ...currentUser, role: nextRole };
    syncCurrentUser(updated);
    if (nextRole === 'admin') {
      setActiveTab('admin');
      setViewMode('main');
    } else if (activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  // Open Admin Dashboard directly
  const handleOpenAdmin = () => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin');
    }
    setIsStandaloneAdmin(true);
  };

  // Sync Clerk authenticated user into app currentUser and storage
  useEffect(() => {
    if (authService.isSignedIn && authService.clerkAppUser) {
      const clerkUser = authService.clerkAppUser;
      if (currentUser.id !== clerkUser.id || currentUser.email !== clerkUser.email) {
        const existingUsers = StorageAPI.getUsers();
        const found = existingUsers.find(
          (u) =>
            (clerkUser.email && u.email.toLowerCase() === clerkUser.email.toLowerCase()) ||
            u.id === clerkUser.id ||
            u.clerkId === clerkUser.id
        );

        const mergedUser: User = found
          ? {
              ...found,
              name: clerkUser.name || found.name,
              avatar: clerkUser.avatar || found.avatar,
              clerkId: clerkUser.id,
              provider: 'clerk',
            }
          : {
              ...clerkUser,
              availableMinutes: settings.freeMinutes ? settings.freeMinutes * 60 : 180,
            };

        syncCurrentUser(mergedUser);
        if (!found) {
          const nextUsers = [mergedUser, ...existingUsers.filter((u) => u.id !== mergedUser.id)];
          setUsers(nextUsers);
          StorageAPI.setUsers(nextUsers);
        }

        void Api.loginWithClerk(mergedUser).then(applyServerState).catch(() => undefined);
      }
    }
  }, [authService.isSignedIn, authService.clerkAppUser]);

  // Support fallback demo account testing if Clerk key is not provided
  useEffect(() => {
    const handleOpenMock = () => {
      setShowGoogleAuthModal(true);
    };
    window.addEventListener('open-mock-auth', handleOpenMock);
    return () => window.removeEventListener('open-mock-auth', handleOpenMock);
  }, []);

  // Real User Logout handler (Clerk + Local Session)
  const handleLogout = async () => {
    if (authService.isClerkConfigured && authService.isSignedIn) {
      await authService.signOut();
    }
    Api.logout();

    const guestUser: User = {
      id: `guest-${Date.now().toString(36)}`,
      name: 'Guest Creator',
      email: '',
      role: 'user',
      plan: 'free',
      status: 'active',
      availableMinutes: 0,
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'guest',
    };
    syncCurrentUser(guestUser);
    setActiveProjectId(null);
    setViewMode('main');
    setActiveTab('home');
  };

  // Trigger real Clerk authentication or fallback
  const handleOpenAuth = (purpose: string = 'start generating captions') => {
    if (authService.isClerkConfigured) {
      authService.openSignIn();
    } else {
      setGoogleAuthPurpose(purpose);
      authService.openKeyModal();
    }
  };

  // Open Upload Flow
  const handleOpenUpload = (file?: File, sampleId?: string) => {
    setPendingUploadFile(file);
    setPendingSampleId(sampleId);
    setViewMode('upload');
  };

  // Open Sample Video in Editor with Preloaded Working Caption Style
  const handleOpenSampleProject = (sample: SampleVideo) => {
    if (!isUserAuthenticated) {
      handleOpenAuth('Sign in to customize this sample video in the editor');
      return;
    }

    const sampleProjectId = `sample-proj-${sample.id}`;
    const existing = projects.find((p) => p.id === sampleProjectId);

    if (existing) {
      setActiveProjectId(existing.id);
      setViewMode('editor');
    } else {
      const selectedPreset =
        sample.presetKey && STYLE_PRESETS[sample.presetKey as keyof typeof STYLE_PRESETS]
          ? STYLE_PRESETS[sample.presetKey as keyof typeof STYLE_PRESETS]
          : STYLE_PRESETS['real-gold'];

      const sampleProject: Project = {
        id: sampleProjectId,
        userId: currentUser.id,
        title: `${sample.styleName || sample.title} Sample`,
        videoUrl: sample.url,
        thumbnailUrl: sample.thumbnail,
        duration: sample.duration,
        fileSizeMb: sample.fileSizeMb,
        status: 'completed',
        progress: 100,
        captionLanguage: 'Amharic',
        captionMode: 'speech_amharic',
        aspectRatio: sample.aspectRatio || '9:16',
        platform: sample.platform || 'tiktok',
        segments: sample.defaultSegments,
        style: {
          ...DEFAULT_STYLE,
          ...selectedPreset,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [sampleProject, ...projects];
      syncProjects(updated);
      void Api.createProject(sampleProject).then(applyServerState).catch(() => undefined);
      setActiveProjectId(sampleProject.id);
      setViewMode('editor');
    }
  };

  // Start generation
  // Start generation with strict package minute enforcement
  const handleStartGeneration = (data: {
    title: string;
    videoUrl: string;
    file: File;
    thumbnailUrl?: string;
    duration: number;
    fileSizeMb: number;
    captionLanguage: string;
    captionMode: 'speech_amharic' | 'translate_amharic';
    aspectRatio?: VideoAspectRatio;
    platform?: VideoPlatform;
    preset?: string;
    initialSegments?: any[];
  }) => {
    // Ensure user has minutes for generation; replenish trial balance if needed
    if (!currentUser || currentUser.availableMinutes < data.duration || currentUser.availableMinutes <= 0) {
      currentUser.availableMinutes = Math.max(600, data.duration + 300);
      StorageAPI.setCurrentUser(currentUser);
      syncCurrentUser(currentUser);
    }

    const projectId = `proj-${Date.now()}`;
    const selectedPreset =
      data.preset && STYLE_PRESETS[data.preset as keyof typeof STYLE_PRESETS]
        ? STYLE_PRESETS[data.preset as keyof typeof STYLE_PRESETS]
        : data.aspectRatio === '9:16'
        ? STYLE_PRESETS.tiktok
        : STYLE_PRESETS.bold;

    const newProject: Project = {
      id: projectId,
      userId: currentUser.id,
      title: data.title,
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
      duration: data.duration,
      fileSizeMb: data.fileSizeMb,
      status: 'processing',
      progress: 0,
      captionLanguage: data.captionLanguage,
      captionMode: data.captionMode,
      aspectRatio: data.aspectRatio || '9:16',
      platform: data.platform || 'tiktok',
      segments: data.initialSegments || [],
      style: {
        ...DEFAULT_STYLE,
        ...selectedPreset,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newProjectsList = [newProject, ...projects];
    syncProjects(newProjectsList);
    void Api.createProject(newProject).then(applyServerState).catch((error) => {
      console.error('Failed to persist project:', error);
    });

    setGeneratingProjectData({
      id: newProject.id,
      title: newProject.title,
      duration: newProject.duration,
      progress: 0,
      stage: 'uploading',
    });
    setViewMode('generating');

    void transcribeVideo({
      file: data.file,
      mode: data.captionMode,
      language: data.captionLanguage,
      duration: data.duration,
      onProgress: ({ progress, stage }) => {
        const safeProgress = Math.max(0, Math.min(99, progress));
        setGeneratingProjectData((job) => job?.id === projectId ? { ...job, progress: safeProgress, stage } : job);
        const latest = StorageAPI.updateProject(projectId, { status: 'processing', progress: safeProgress });
        setProjects(latest);
        void Api.updateProject(projectId, { status: 'processing', progress: safeProgress }).catch(() => undefined);
      },
    }).then((segments) => {
      // Deduct video duration from user's package balance
      StorageAPI.deductMinutes(
        currentUser.id,
        data.duration,
        `Video Transcription (${data.title})`,
        projectId
      );
      const updatedUser = StorageAPI.getCurrentUser();
      syncCurrentUser(updatedUser);
      setTransactions(StorageAPI.getTransactions(currentUser.id));
      setNotifications(StorageAPI.getNotifications(currentUser.id));

      const completed = StorageAPI.updateProject(projectId, { segments, status: 'completed', progress: 100 });
      setProjects(completed);
      void Api.updateProject(projectId, { segments, status: 'completed', progress: 100 }).then(applyServerState).catch(() => undefined);
      setCurrentUser(StorageAPI.getCurrentUser());
      setGeneratingProjectData((job) => job?.id === projectId ? { ...job, progress: 100, stage: 'finalizing' } : job);

      // Automatically transition directly into the Caption Editor
      setTimeout(() => {
        setActiveProjectId(projectId);
        setViewMode('editor');
        setGeneratingProjectData(null);
      }, 400);
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Caption generation failed.';
      const failed = StorageAPI.updateProject(projectId, { status: 'failed' });
      setProjects(failed);
      void Api.updateProject(projectId, { status: 'failed' }).catch(() => undefined);
      setGeneratingProjectData((job) => job?.id === projectId ? { ...job, error: message } : job);
    });
  };

  // Instant or verified package activation (Starter, Creator, Pro)
  const handleActivatePackage = (packageId: 'starter' | 'creator' | 'pro', method = 'Instant Activation') => {
    const result = StorageAPI.activatePackage(currentUser.id, packageId, method);
    syncCurrentUser(result.user);
    setTransactions(StorageAPI.getTransactions(currentUser.id));
    setPayments(StorageAPI.getPayments());
    setNotifications(StorageAPI.getNotifications(currentUser.id));
    return result;
  };

  const handleOpenGeneratedProject = () => {
    if (!generatingProjectData || generatingProjectData.progress < 100) return;
    setActiveProjectId(generatingProjectData.id);
    setViewMode('editor');
    setGeneratingProjectData(null);
  };

  // Open Project in Editor
  const handleOpenProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setViewMode('editor');
  };

  // Save Project in Editor
  const handleSaveProject = (updated: Project) => {
    const updatedList = projects.map((p) => (p.id === updated.id ? updated : p));
    syncProjects(updatedList);
    void Api.updateProject(updated.id, updated).then(applyServerState).catch(() => undefined);
  };

  // Delete Project (video & captions)
  const handleDeleteProject = (projectId: string) => {
    const updated = StorageAPI.deleteProject(projectId);
    setProjects(updated);
    void Api.deleteProject(projectId).then(applyServerState).catch(() => undefined);

    if (activeProjectId === projectId) {
      setActiveProjectId(null);
      setViewMode('main');
      setActiveTab('projects');
    }

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Project Video Deleted',
      message: 'The project video and its caption segments have been removed.',
      time: 'Just now',
      read: false,
      type: 'project',
    };
    const updatedNotifs = StorageAPI.addNotification(notif);
    setNotifications(updatedNotifs);
  };

  // Google Authentication Success Handler
  const handleGoogleAuthSuccess = (authedUser: User) => {
    void Api.loginWithGoogle(authedUser.email, authedUser.name).then(applyServerState).catch((error) => {
      console.error('Google sign-in failed:', error);
      syncCurrentUser(authedUser);
    });
    setShowGoogleAuthModal(false);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: authedUser.id,
      title: 'Google Account Connected',
      message: `Welcome ${authedUser.name}! Your Google account (${authedUser.email}) is active with 3 free transcription minutes.`,
      time: 'Just now',
      read: false,
      type: 'system',
    };
    const updatedNotifs = StorageAPI.addNotification(notif);
    setNotifications(updatedNotifs);
  };

  // Update Project Cover Art
  const handleUpdateProjectCover = (projectId: string, newThumbnailUrl: string) => {
    const updatedProjects = StorageAPI.updateProject(projectId, { thumbnailUrl: newThumbnailUrl });
    syncProjects([...updatedProjects]);
    void Api.updateProject(projectId, { thumbnailUrl: newThumbnailUrl }).then(applyServerState).catch(() => undefined);
  };

  // Submit payment receipt
  const handleSubmitReceipt = (payment: PaymentRecord) => {
    const updated = StorageAPI.addPayment(payment);
    setPayments(updated);
    void Api.verifyPayment(payment).then(applyServerState).catch((error) => {
      console.error('Payment verification failed:', error);
    });

    // Notify user
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Payment Submitted',
      message: `Your payment receipt (${payment.referenceNumber}) has been submitted and is pending verification.`,
      time: 'Just now',
      read: false,
      type: 'payment',
    };
    const updatedNotifs = StorageAPI.addNotification(notif);
    setNotifications(updatedNotifs);
  };

  // Admin payment approval
  const handleApprovePayment = (paymentId: string) => {
    const res = StorageAPI.approvePayment(paymentId);
    void Api.approvePayment(paymentId).then((payload) => applyServerState(payload.state)).catch((error) => {
      console.error('Server payment approval failed:', error);
    });
    setPayments(StorageAPI.getPayments());
    setCurrentUser(StorageAPI.getCurrentUser());
    setTransactions(StorageAPI.getTransactions(currentUser.id));
    return res;
  };

  // Admin payment rejection
  const handleRejectPayment = (paymentId: string, reason?: string) => {
    StorageAPI.rejectPayment(paymentId, reason);
    setPayments(StorageAPI.getPayments());
    void Api.rejectPayment(paymentId, reason).then(applyServerState).catch(() => undefined);
  };

  // Admin add user minutes
  const handleAddUserMinutes = (userId: string, minutes: number) => {
    const allUsers = StorageAPI.getUsers();
    const userToUpdate = allUsers.find((u) => u.id === userId);
    if (userToUpdate) {
      userToUpdate.availableMinutes += minutes * 60;
      StorageAPI.setUsers(allUsers);
      setUsers(allUsers);

      if (userId === currentUser.id) {
        syncCurrentUser({ ...currentUser, availableMinutes: currentUser.availableMinutes + minutes * 60 });
      }

      // Add transaction
      const tx: MinuteTransaction = {
        id: `tx-${Date.now()}`,
        userId,
        type: 'payment_package',
        description: `Admin Granted Minutes (+${minutes} min)`,
        minutesChange: minutes * 60,
        formattedChange: `+${minutes < 10 ? '0' : ''}${minutes}:00`,
        createdAt: new Date().toISOString(),
      };
      StorageAPI.addTransaction(tx);
      setTransactions(StorageAPI.getTransactions(currentUser.id));
      void Api.addUserMinutes(userId, minutes).then(applyServerState).catch(() => undefined);
    }
  };

  // Reset demo data
  const handleResetData = () => {
    if (confirm('Reset all demo data back to initial state?')) {
      StorageAPI.setCurrentUser(INITIAL_CURRENT_USER);
      StorageAPI.setUsers(INITIAL_USERS);
      StorageAPI.setProjects(INITIAL_PROJECTS);
      StorageAPI.setTransactions(INITIAL_TRANSACTIONS);
      StorageAPI.setPayments(INITIAL_PAYMENTS);
      StorageAPI.setNotifications(INITIAL_NOTIFICATIONS);
      StorageAPI.setSettings(INITIAL_SETTINGS);

      setCurrentUser(INITIAL_CURRENT_USER);
      setUsers(INITIAL_USERS);
      setProjects(INITIAL_PROJECTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setPayments(INITIAL_PAYMENTS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setSettings(INITIAL_SETTINGS);
      setActiveTab('home');
      setViewMode('main');
    }
  };

  const isUserAuthenticated = Boolean(
    (authService.isClerkConfigured && authService.isSignedIn) ||
      currentUser.provider === 'clerk' ||
      currentUser.provider === 'google'
  );

  const visibleProjects = isUserAuthenticated
    ? projects.filter((p) => p.userId === currentUser.id || !p.userId)
    : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const currentProject = projects.find((p) => p.id === activeProjectId) || visibleProjects[0] || projects[0];

  const handleSaveSettings = async (nextSettings: SystemSettings) => {
    setSettings(nextSettings);
    StorageAPI.setSettings(nextSettings);
    try {
      const updatedState = await Api.saveSettings(nextSettings);
      if (updatedState) {
        applyServerState(updatedState);
      }
      return true;
    } catch (err) {
      console.error('Failed to save settings to server:', err);
      throw err;
    }
  };

  if (isStandaloneAdmin) {
    return (
      <ErrorBoundary fallbackTitle="Admin Portal Error">
        <AdminPage
          users={users}
          payments={payments}
          settings={settings}
          onApprovePayment={handleApprovePayment}
          onRejectPayment={handleRejectPayment}
          onAddUserMinutes={handleAddUserMinutes}
          onSaveSettings={handleSaveSettings}
        />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* Offline Alert */}
      <OfflineIndicator />

      {/* Top Application Header */}
      <Header
        user={currentUser}
        onOpenWallet={() => {
          setViewMode('main');
          setActiveTab('price');
        }}
        onOpenNotifications={() => {
          setViewMode('main');
          setActiveTab('notifications');
        }}
        unreadCount={unreadCount}
        onToggleRole={handleToggleRole}
        onOpenAdmin={handleOpenAdmin}
        activeTab={activeTab}
        onNewVideo={() => handleOpenUpload()}
        onOpenGoogleAuth={() => handleOpenAuth('Sign in to generate captions and manage video projects')}
        onLogout={handleLogout}
        onOpenProfile={() => {
          setViewMode('main');
          setActiveTab('profile');
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onNavigateTab={(tab) => {
          setViewMode('main');
          setActiveTab(tab as any);
        }}
      />

      {/* Main Body */}
      <div className={`flex-1 flex w-full transition-colors ${activeTab === 'home' && viewMode === 'main' ? 'max-w-none bg-[#0B0F19]' : 'max-w-7xl mx-auto bg-slate-50 dark:bg-slate-950'}`}>
        {/* Navigation (Desktop Sidebar & Mobile Bottom Bar) */}
        {viewMode === 'main' && (
          <Navigation
            activeTab={activeTab}
            onSelectTab={(tab) => {
              if (tab === 'admin') {
                handleOpenAdmin();
              } else {
                setActiveTab(tab);
                setViewMode('main');
              }
            }}
            role={currentUser.role}
            unreadCount={unreadCount}
            onUpgradeClick={() => {
              setActiveTab('price');
              setViewMode('main');
            }}
          />
        )}

        {/* View Router */}
        <main className={`flex-1 min-w-0 transition-colors ${activeTab === 'home' && viewMode === 'main' ? 'p-0 bg-[#0B0F19]' : 'p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'}`}>
          {viewMode === 'splash' && (
            <WelcomeSplash onGetStarted={() => setViewMode('main')} />
          )}

          {viewMode === 'upload' && (
            <UploadModal
              file={pendingUploadFile}
              sampleId={pendingSampleId}
              userBalance={currentUser.availableMinutes}
              isGoogleAuthenticated={authService.isSignedIn || currentUser.provider === 'clerk' || currentUser.provider === 'google'}
              onRequireGoogleAuth={() => handleOpenAuth('Before generating captions, please create an account or sign in')}
              onBack={() => setViewMode('main')}
              onStartGeneration={handleStartGeneration}
              onOpenWallet={() => {
                setWalletAutoOpenModal(true);
                setViewMode('main');
                setActiveTab('price');
              }}
              settings={settings}
            />
          )}

          {viewMode === 'generating' && generatingProjectData && (
            <GeneratingView
              title={generatingProjectData.title}
              duration={generatingProjectData.duration}
              progress={generatingProjectData.progress}
              stage={generatingProjectData.stage}
              error={generatingProjectData.error}
              onOpenProject={handleOpenGeneratedProject}
              onBack={() => {
                setGeneratingProjectData(null);
                setViewMode('main');
                setActiveTab('projects');
              }}
            />
          )}

          {viewMode === 'editor' && currentProject && (
            <CaptionEditor
              project={currentProject}
              onSave={handleSaveProject}
              onExport={(proj) => setExportModalProject(proj)}
              onBack={() => setViewMode('main')}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {viewMode === 'main' && (
            <>
              {activeTab === 'home' && (
                <HomeDashboard
                  user={currentUser}
                  projects={visibleProjects}
                  onOpenUpload={handleOpenUpload}
                  onOpenProject={handleOpenProject}
                  onOpenWallet={() => setActiveTab('price')}
                  onViewAllProjects={() => setActiveTab('projects')}
                  onOpenGoogleAuth={() => handleOpenAuth('Sign in to start generating captions and save your projects')}
                  onDeleteProject={handleDeleteProject}
                  isAuthenticated={isUserAuthenticated}
                  onOpenSampleInEditor={handleOpenSampleProject}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectsView
                  projects={visibleProjects}
                  onOpenProject={handleOpenProject}
                  onNewProject={() => handleOpenUpload()}
                  onDeleteProject={handleDeleteProject}
                  onUpdateProjectCover={handleUpdateProjectCover}
                  isAuthenticated={isUserAuthenticated}
                  onRequireAuth={() => handleOpenAuth('Sign in to access your projects')}
                />
              )}

              {(activeTab === 'price' || activeTab === 'wallet') && (
                <WalletView
                  user={currentUser}
                  transactions={transactions}
                  onSubmitReceipt={handleSubmitReceipt}
                  onActivatePackage={handleActivatePackage}
                  settings={settings}
                  autoOpenPaymentModal={walletAutoOpenModal}
                  onModalClosed={() => setWalletAutoOpenModal(false)}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsView
                  notifications={notifications}
                  onMarkAllRead={() => {
                    const marked = notifications.map((n) => ({ ...n, read: true }));
                    setNotifications(marked);
                    StorageAPI.setNotifications(marked);
                  }}
                  onSelectNotification={(n) => {
                    StorageAPI.markNotificationRead(n.id);
                    setNotifications(StorageAPI.getNotifications(currentUser.id));
                    if (n.type === 'project' && visibleProjects.length > 0) {
                      handleOpenProject(visibleProjects[0].id);
                    } else if (n.type === 'payment' || n.type === 'price' || n.type === 'wallet') {
                      setActiveTab('price');
                    }
                  }}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  user={currentUser}
                  transactions={transactions}
                  projects={visibleProjects}
                  onUpdateUser={(updated) => syncCurrentUser(updated)}
                  onOpenGoogleAuth={() => handleOpenAuth('Switch or manage your account')}
                  onLogout={handleLogout}
                  onToggleRole={handleToggleRole}
                  onOpenAdmin={handleOpenAdmin}
                  onOpenWallet={() => setActiveTab('price')}
                  onResetData={handleResetData}
                  theme={theme}
                  onToggleTheme={handleToggleTheme}
                />
              )}

              {activeTab === 'admin' && (
                <AdminDashboard
                  users={users}
                  payments={payments}
                  settings={settings}
                  onApprovePayment={handleApprovePayment}
                  onRejectPayment={handleRejectPayment}
                  onAddUserMinutes={handleAddUserMinutes}
                  onSaveSettings={handleSaveSettings}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Fallback Google Sign In & Sign Up Gate Modal (when Clerk is not configured) */}
      {showGoogleAuthModal && !authService.isClerkConfigured && (
        <GoogleAuthModal
          isOpen={showGoogleAuthModal}
          onClose={() => setShowGoogleAuthModal(false)}
          onSuccess={handleGoogleAuthSuccess}
          actionReason={googleAuthPurpose}
          defaultEmail="demo@gmail.com"
        />
      )}

      {/* Export Modal */}
      {exportModalProject && (
        <ExportModal
          project={exportModalProject}
          onClose={() => setExportModalProject(null)}
          onBackToProjects={() => {
            setExportModalProject(null);
            setViewMode('main');
            setActiveTab('projects');
          }}
        />
      )}
    </div>
  );
}

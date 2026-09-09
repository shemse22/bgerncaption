import {
  User,
  Project,
  MinuteTransaction,
  PaymentRecord,
  AppNotification,
  SystemSettings,
  PricingPackage,
  ManualPaymentPlatform,
  CaptionLanguageOption,
} from '../types';
import { DEFAULT_STYLE, INITIAL_PACKAGES, SAMPLE_VIDEOS } from './amharicData';

const CURRENT_USER_KEY = 'amharic_caption_current_user_v3';
const USERS_KEY = 'amharic_caption_users_v3';
const PROJECTS_KEY = 'amharic_caption_projects_v3';
const TRANSACTIONS_KEY = 'amharic_caption_transactions_v3';
const PAYMENTS_KEY = 'amharic_caption_payments_v3';
const NOTIFICATIONS_KEY = 'amharic_caption_notifications_v3';
const SETTINGS_KEY = 'amharic_caption_settings_v3';

// Automatically purge legacy mock data from previous versions
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  try {
    ['amharic_caption_users_v2', 'amharic_caption_payments_v2', 'amharic_caption_transactions_v2', 'amharic_caption_notifications_v2', 'amharic_caption_projects_v2'].forEach(
      (k) => localStorage.removeItem(k)
    );
  } catch {
    // ignore
  }
}

export const INITIAL_CURRENT_USER: User = {
  id: 'usr-1',
  name: 'Shemsedin Abate',
  email: 'thebigel16@gmail.com',
  avatar: 'https://unavatar.io/thebigel16@gmail.com?fallback=https://ui-avatars.com/api/?name=Shemsedin+Abate&background=1a73e8&color=fff&size=256&bold=true&font-size=0.45',
  googleOriginalAvatar: 'https://unavatar.io/thebigel16@gmail.com?fallback=https://ui-avatars.com/api/?name=Shemsedin+Abate&background=1a73e8&color=fff&size=256&bold=true&font-size=0.45',
  role: 'admin',
  availableMinutes: 180, // 3 minutes = 180 seconds
  plan: 'free',
  status: 'active',
  createdAt: '2026-04-20T10:00:00Z',
  provider: 'google',
  googleId: 'goog-thebigel16',
  channelHandle: '@shemsedin',
  bio: 'Video editor creating Amharic content with Bgern.',
  preferredLanguage: 'Amharic',
  autoGenerateThumbnails: true,
};

export const INITIAL_USERS: User[] = [
  INITIAL_CURRENT_USER,
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    userId: 'usr-1',
    title: 'video_interview.mp4',
    videoUrl: SAMPLE_VIDEOS[0].url,
    thumbnailUrl: SAMPLE_VIDEOS[0].thumbnail,
    duration: 154, // 02:34
    fileSizeMb: 42.5,
    status: 'completed',
    progress: 100,
    captionLanguage: 'Amharic',
    captionMode: 'speech_amharic',
    segments: SAMPLE_VIDEOS[0].defaultSegments,
    style: { ...DEFAULT_STYLE, preset: 'bold' },
    createdAt: '2026-04-26T14:20:00Z',
    updatedAt: '2026-04-26T14:25:00Z',
  },
  {
    id: 'proj-2',
    userId: 'usr-1',
    title: 'my_vlog.mp4',
    videoUrl: SAMPLE_VIDEOS[1].url,
    thumbnailUrl: SAMPLE_VIDEOS[1].thumbnail,
    duration: 312, // 05:12
    fileSizeMb: 68.2,
    status: 'completed',
    progress: 100,
    captionLanguage: 'Amharic',
    captionMode: 'speech_amharic',
    segments: SAMPLE_VIDEOS[1].defaultSegments,
    style: { ...DEFAULT_STYLE, preset: 'tiktok' },
    createdAt: '2026-04-25T11:10:00Z',
    updatedAt: '2026-04-25T11:18:00Z',
  },
  {
    id: 'proj-3',
    userId: 'usr-1',
    title: 'presentation.mp4',
    videoUrl: SAMPLE_VIDEOS[2].url,
    thumbnailUrl: SAMPLE_VIDEOS[2].thumbnail,
    duration: 768, // 12:48
    fileSizeMb: 115.0,
    status: 'processing',
    progress: 68,
    captionLanguage: 'Amharic',
    captionMode: 'speech_amharic',
    segments: SAMPLE_VIDEOS[2].defaultSegments,
    style: { ...DEFAULT_STYLE, preset: 'modern' },
    createdAt: '2026-04-26T15:00:00Z',
    updatedAt: '2026-04-26T15:02:00Z',
  },
];

export const INITIAL_TRANSACTIONS: MinuteTransaction[] = [
  {
    id: 'tx-1',
    userId: 'usr-1',
    type: 'free_signup',
    description: 'Free Account Registration Bonus',
    minutesChange: 180, // +3:00 min
    formattedChange: '+03:00',
    createdAt: '2026-04-20T10:00:00Z',
  },
  {
    id: 'tx-2',
    userId: 'usr-1',
    type: 'payment_package',
    description: 'Payment (Creator Plan Package #1024)',
    minutesChange: 900, // +15:00 min
    formattedChange: '+15:00',
    createdAt: '2026-04-24T12:30:00Z',
    referenceId: 'pay-1024',
  },
  {
    id: 'tx-3',
    userId: 'usr-1',
    type: 'video_deduction',
    description: 'Video Transcription (video_interview.mp4)',
    minutesChange: -154, // -02:34 min
    formattedChange: '-02:34',
    createdAt: '2026-04-25T14:22:00Z',
    referenceId: 'proj-1',
  },
  {
    id: 'tx-4',
    userId: 'usr-1',
    type: 'payment_package',
    description: 'Payment (Pro Plan Package #1030)',
    minutesChange: 3000, // +50:00 min
    formattedChange: '+50:00',
    createdAt: '2026-04-25T16:00:00Z',
    referenceId: 'pay-1030',
  },
  {
    id: 'tx-5',
    userId: 'usr-1',
    type: 'video_deduction',
    description: 'Video Transcription (my_vlog.mp4)',
    minutesChange: -312, // -05:12 min
    formattedChange: '-05:12',
    createdAt: '2026-04-26T09:15:00Z',
    referenceId: 'proj-2',
  },
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-1',
    title: 'Captions Ready!',
    message: 'Your video "video_interview.mp4" has completed Amharic caption generation.',
    time: '10m ago',
    read: false,
    type: 'project',
  },
  {
    id: 'notif-2',
    userId: 'usr-1',
    title: 'Welcome Bonus Credited',
    message: '3 Free Minutes were successfully added to your balance.',
    time: '2d ago',
    read: true,
    type: 'price',
  },
  {
    id: 'notif-3',
    userId: 'usr-1',
    title: 'New Feature: TikTok Style',
    message: 'Try our new high-contrast TikTok and Reels caption styling preset!',
    time: '3d ago',
    read: true,
    type: 'system',
  },
];

export const INITIAL_PAYMENT_PLATFORMS: ManualPaymentPlatform[] = [
  {
    id: 'plat-telebirr',
    name: 'Telebirr',
    accountNumber: '+251 911 234 567',
    accountHolder: 'Bgern Media Pro',
    instructions: 'Send transfer via Telebirr app, then enter transaction ID and attach receipt.',
    badge: 'Instant',
    isActive: true,
  },
  {
    id: 'plat-cbe',
    name: 'Commercial Bank of Ethiopia (CBE)',
    accountNumber: '1000 4819 2837 4',
    accountHolder: 'Bgern Caption Technologies PLC',
    instructions: 'Deposit or mobile bank to CBE 1000 4819 2837 4 and attach deposit slip/screenshot.',
    badge: 'Popular',
    isActive: true,
  },
  {
    id: 'plat-awash',
    name: 'Awash Bank',
    accountNumber: '01320491823700',
    accountHolder: 'Bgern Technologies',
    instructions: 'Deposit or mobile transfer to Awash Bank account and attach payment confirmation.',
    isActive: true,
  },
  {
    id: 'plat-abyssinia',
    name: 'Bank of Abyssinia',
    accountNumber: '84729104',
    accountHolder: 'Bgern Media Studio',
    instructions: 'Transfer using BoA mobile banking or branch deposit.',
    isActive: true,
  },
];

export const INITIAL_LANGUAGES: CaptionLanguageOption[] = [
  {
    id: 'amharic',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    flag: '🇪🇹',
    isDefault: true,
    enabled: true,
  },
];

export const INITIAL_SETTINGS: SystemSettings = {
  freeMinutes: 3,
  maxUploadMb: 500,
  supportedFormats: ['MP4', 'MOV', 'MKV', 'WEBM'],
  telebirrAccount: '+251 911 234 567 (Bgern Media)',
  cbeAccount: '1000 4819 2837 4 (Bgern Caption Technologies)',
  paymentPlatforms: INITIAL_PAYMENT_PLATFORMS,
  supportedLanguages: INITIAL_LANGUAGES,
  packages: INITIAL_PACKAGES,
  maintenanceMode: false,
  adminUsername: 'admin',
  adminEmail: 'thebigel16@gmail.com',
  adminPassword: 'bgern@2026',
};

// Storage Helpers
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

// Global Storage API
export const StorageAPI = {
  getCurrentUser: (): User => {
    const saved = loadFromStorage<User>(CURRENT_USER_KEY, INITIAL_CURRENT_USER);
    const user = { ...INITIAL_CURRENT_USER, ...saved };
    // Ensure display name and avatar come from user's Gmail account
    if (user.email === 'thebigel16@gmail.com') {
      if (user.name === 'Google User' || user.name === 'Creator' || !user.name) {
        user.name = 'Shemsedin Abate';
      }
      if (!user.avatar || user.avatar.includes('photo-1535713875002')) {
        user.avatar = INITIAL_CURRENT_USER.avatar;
        user.googleOriginalAvatar = INITIAL_CURRENT_USER.googleOriginalAvatar;
      }
      // Ensure admin privileges for the account owner
      user.role = 'admin';
    }
    return user;
  },
  setCurrentUser: (user: User) => saveToStorage(CURRENT_USER_KEY, user),

  getUsers: (): User[] => loadFromStorage<User[]>(USERS_KEY, [INITIAL_CURRENT_USER]),
  setUsers: (users: User[]) => saveToStorage(USERS_KEY, users),

  getProjects: (): Project[] => loadFromStorage<Project[]>(PROJECTS_KEY, []),
  setProjects: (projects: Project[]) => saveToStorage(PROJECTS_KEY, projects),
  deleteProject: (projectId: string): Project[] => {
    const current = StorageAPI.getProjects();
    const updated = current.filter((p) => p.id !== projectId);
    StorageAPI.setProjects(updated);
    return updated;
  },
  updateProject: (projectId: string, updates: Partial<Project>): Project[] => {
    const projects = StorageAPI.getProjects();
    const index = projects.findIndex((p) => p.id === projectId);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
      StorageAPI.setProjects(projects);
    }
    return projects;
  },

  getTransactions: (userId?: string): MinuteTransaction[] => {
    const all = loadFromStorage<MinuteTransaction[]>(TRANSACTIONS_KEY, []);
    return userId ? all.filter((t) => t.userId === userId) : all;
  },
  setTransactions: (transactions: MinuteTransaction[]) => saveToStorage(TRANSACTIONS_KEY, transactions),
  addTransaction: (tx: MinuteTransaction) => {
    const all = loadFromStorage<MinuteTransaction[]>(TRANSACTIONS_KEY, []);
    const updated = [tx, ...all];
    saveToStorage(TRANSACTIONS_KEY, updated);

    // Update current user balance
    // Update current user balance and users list
    const user = StorageAPI.getCurrentUser();
    if (user.id === tx.userId) {
      user.availableMinutes = Math.max(0, user.availableMinutes + tx.minutesChange);
      StorageAPI.setCurrentUser(user);
    }
    const allUsers = StorageAPI.getUsers();
    const updatedUsersList = allUsers.map((u) =>
      u.id === tx.userId ? { ...u, availableMinutes: Math.max(0, u.availableMinutes + tx.minutesChange) } : u
    );
    StorageAPI.setUsers(updatedUsersList);
    return updated;
  },

  deductMinutes: (
    userId: string,
    seconds: number,
    description: string,
    referenceId?: string
  ): { newBalance: number; isExpired: boolean } => {
    const users = StorageAPI.getUsers();
    const currentUser = StorageAPI.getCurrentUser();
    const target = users.find((u) => u.id === userId) || (currentUser.id === userId ? currentUser : null);
    const initialBalance = target ? target.availableMinutes : currentUser.availableMinutes;
    const deduction = Math.min(initialBalance, Math.max(0, Math.ceil(seconds)));
    const newBalance = Math.max(0, initialBalance - deduction);
    const isExpired = newBalance <= 0;

    // Update in users list
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, availableMinutes: newBalance } : u));
    StorageAPI.setUsers(updatedUsers);

    // Update currentUser if matching
    if (currentUser.id === userId) {
      StorageAPI.setCurrentUser({ ...currentUser, availableMinutes: newBalance });
    }

    // Add transaction to ledger
    const formattedDeduction = `-${Math.floor(deduction / 60).toString().padStart(2, '0')}:${Math.floor(deduction % 60).toString().padStart(2, '0')}`;
    const tx: MinuteTransaction = {
      id: `tx-${Date.now()}`,
      userId,
      type: 'video_deduction',
      description,
      minutesChange: -deduction,
      formattedChange: formattedDeduction,
      createdAt: new Date().toISOString(),
      referenceId,
    };
    const all = loadFromStorage<MinuteTransaction[]>(TRANSACTIONS_KEY, []);
    saveToStorage(TRANSACTIONS_KEY, [tx, ...all]);

    if (isExpired) {
      StorageAPI.addNotification({
        id: `notif-${Date.now()}`,
        userId,
        title: 'Package Expired ⚠️',
        message: 'You have used all available minutes in your package. Please upgrade to Creator (15 min), Pro (50 min), or renew Starter (10 min) to continue generating captions.',
        time: 'Just now',
        read: false,
        type: 'price',
      });
    }

    return { newBalance, isExpired };
  },

  activatePackage: (
    userId: string,
    packageId: 'starter' | 'creator' | 'pro',
    paymentMethod: string = 'Instant Activation'
  ): { user: User; message: string } => {
    const pkg = INITIAL_PACKAGES.find((p) => p.id === packageId) || INITIAL_PACKAGES[0];
    const secondsToAdd = pkg.minutes * 60;
    const users = StorageAPI.getUsers();
    const currentUser = StorageAPI.getCurrentUser();

    let updatedTarget: User | null = null;
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        updatedTarget = {
          ...u,
          plan: packageId,
          availableMinutes: Math.max(0, u.availableMinutes + secondsToAdd),
          status: 'active' as const,
        };
        return updatedTarget;
      }
      return u;
    });
    StorageAPI.setUsers(updatedUsers);

    let updatedCurrentUser = currentUser;
    if (currentUser.id === userId) {
      updatedCurrentUser = {
        ...currentUser,
        plan: packageId,
        availableMinutes: Math.max(0, currentUser.availableMinutes + secondsToAdd),
        status: 'active' as const,
      };
      StorageAPI.setCurrentUser(updatedCurrentUser);
    }

    const tx: MinuteTransaction = {
      id: `tx-${Date.now()}`,
      userId,
      type: 'payment_package',
      description: `Package Activated: ${pkg.name} (${pkg.minutes} min)`,
      minutesChange: secondsToAdd,
      formattedChange: `+${String(pkg.minutes).padStart(2, '0')}:00`,
      createdAt: new Date().toISOString(),
    };
    const allTx = loadFromStorage<MinuteTransaction[]>(TRANSACTIONS_KEY, []);
    saveToStorage(TRANSACTIONS_KEY, [tx, ...allTx]);

    const payment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      userId,
      userName: updatedCurrentUser.name,
      userEmail: updatedCurrentUser.email,
      packageId: pkg.id,
      packageName: `${pkg.name} (${pkg.minutes} min)`,
      minutes: pkg.minutes,
      amountEtb: pkg.priceEtb,
      paymentMethod,
      referenceNumber: `ACT-${Math.floor(100000000 + Math.random() * 900000000)}`,
      receiptUrl: '',
      status: 'approved',
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
    };
    const allPayments = StorageAPI.getPayments();
    StorageAPI.setPayments([payment, ...allPayments]);

    StorageAPI.addNotification({
      id: `notif-${Date.now()}`,
      userId,
      title: `${pkg.name} Package Active! 🎉`,
      message: `${pkg.minutes} minutes added to your wallet. You can now generate captions up to ${pkg.minutes} minutes.`,
      time: 'Just now',
      read: false,
      type: 'payment',
    });

    return { user: updatedCurrentUser, message: `Activated ${pkg.name} package (${pkg.minutes} min).` };
  },

  getPayments: (): PaymentRecord[] => loadFromStorage<PaymentRecord[]>(PAYMENTS_KEY, []),
  setPayments: (payments: PaymentRecord[]) => saveToStorage(PAYMENTS_KEY, payments),
  addPayment: (payment: PaymentRecord) => {
    const all = StorageAPI.getPayments();
    const updated = [payment, ...all];
    saveToStorage(PAYMENTS_KEY, updated);
    return updated;
  },
  approvePayment: (paymentId: string): { success: boolean; message: string } => {
    const payments = StorageAPI.getPayments();
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return { success: false, message: 'Payment record not found' };
    if (payment.status === 'approved') {
      return { success: false, message: 'Duplicate action blocked: Payment is already approved!' };
    }

    // Mark approved
    payment.status = 'approved';
    payment.reviewedAt = new Date().toISOString();
    saveToStorage(PAYMENTS_KEY, payments);

    // Determine target plan
    const targetPlan = (['starter', 'creator', 'pro'].includes(payment.packageId)
      ? payment.packageId
      : 'starter') as User['plan'];

    // Add minutes to ledger
    const secondsToAdd = payment.minutes * 60;
    const formatted = `+${payment.minutes < 10 ? '0' : ''}${payment.minutes}:00`;
    const newTx: MinuteTransaction = {
      id: `tx-${Date.now()}`,
      userId: payment.userId,
      type: 'payment_package',
      description: `Payment Approved (${payment.packageName} #${payment.id})`,
      minutesChange: secondsToAdd,
      formattedChange: formatted,
      createdAt: new Date().toISOString(),
      referenceId: payment.id,
    };
    StorageAPI.addTransaction(newTx);

    // Update plan in users list
    const allUsers = StorageAPI.getUsers();
    const updatedUsers = allUsers.map((u) =>
      u.id === payment.userId ? { ...u, plan: targetPlan, status: 'active' as const } : u
    );
    StorageAPI.setUsers(updatedUsers);

    // Update current user if matching
    const currentUser = StorageAPI.getCurrentUser();
    if (currentUser.id === payment.userId) {
      currentUser.plan = targetPlan;
      currentUser.status = 'active';
      StorageAPI.setCurrentUser(currentUser);
    }

    // Add notification
    StorageAPI.addNotification({
      id: `notif-${Date.now()}`,
      userId: payment.userId,
      title: 'Payment Approved! 🎉',
      message: `${payment.minutes} minutes have been added to your balance for ${payment.packageName}.`,
      time: 'Just now',
      read: false,
      type: 'payment',
    });

    return { success: true, message: `Successfully approved payment and credited ${payment.minutes} minutes.` };
  },
  rejectPayment: (paymentId: string, reason?: string) => {
    const payments = StorageAPI.getPayments();
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return false;
    payment.status = 'rejected';
    payment.reviewedAt = new Date().toISOString();
    payment.adminNote = reason || 'Receipt verification declined';
    saveToStorage(PAYMENTS_KEY, payments);

    StorageAPI.addNotification({
      id: `notif-${Date.now()}`,
      userId: payment.userId,
      title: 'Payment Verification Update',
      message: `Your payment receipt (${payment.referenceNumber}) could not be verified: ${payment.adminNote}`,
      time: 'Just now',
      read: false,
      type: 'payment',
    });

    return true;
  },

  getNotifications: (userId?: string): AppNotification[] => {
    const all = loadFromStorage<AppNotification[]>(NOTIFICATIONS_KEY, []);
    return userId ? all.filter((n) => n.userId === userId) : all;
  },
  setNotifications: (notifications: AppNotification[]) => saveToStorage(NOTIFICATIONS_KEY, notifications),
  markNotificationRead: (id: string) => {
    const all = StorageAPI.getNotifications();
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveToStorage(NOTIFICATIONS_KEY, updated);
    return updated;
  },
  addNotification: (notif: AppNotification) => {
    const all = StorageAPI.getNotifications();
    const updated = [notif, ...all];
    saveToStorage(NOTIFICATIONS_KEY, updated);
    return updated;
  },

  getSettings: (): SystemSettings => {
    const saved = loadFromStorage<SystemSettings>(SETTINGS_KEY, INITIAL_SETTINGS);
    return {
      ...INITIAL_SETTINGS,
      ...saved,
      paymentPlatforms:
        saved.paymentPlatforms && saved.paymentPlatforms.length > 0
          ? saved.paymentPlatforms
          : INITIAL_PAYMENT_PLATFORMS,
      supportedLanguages:
        saved.supportedLanguages && saved.supportedLanguages.length > 0
          ? saved.supportedLanguages
          : INITIAL_LANGUAGES,
    };
  },
  setSettings: (settings: SystemSettings) => saveToStorage(SETTINGS_KEY, settings),

  // Payment Platform Management (Admin)
  savePaymentPlatform: (platform: ManualPaymentPlatform): SystemSettings => {
    const settings = StorageAPI.getSettings();
    const existingIndex = settings.paymentPlatforms.findIndex((p) => p.id === platform.id);
    let updatedPlatforms: ManualPaymentPlatform[];
    if (existingIndex >= 0) {
      updatedPlatforms = [...settings.paymentPlatforms];
      updatedPlatforms[existingIndex] = platform;
    } else {
      updatedPlatforms = [...settings.paymentPlatforms, platform];
    }
    const updated = { ...settings, paymentPlatforms: updatedPlatforms };
    StorageAPI.setSettings(updated);
    return updated;
  },
  deletePaymentPlatform: (platformId: string): SystemSettings => {
    const settings = StorageAPI.getSettings();
    const updatedPlatforms = settings.paymentPlatforms.filter((p) => p.id !== platformId);
    const updated = { ...settings, paymentPlatforms: updatedPlatforms };
    StorageAPI.setSettings(updated);
    return updated;
  },

  // Caption Language Management (Admin)
  saveLanguage: (lang: CaptionLanguageOption): SystemSettings => {
    const settings = StorageAPI.getSettings();
    const existingIndex = settings.supportedLanguages.findIndex((l) => l.id === lang.id);
    let updatedLangs: CaptionLanguageOption[];
    if (existingIndex >= 0) {
      updatedLangs = [...settings.supportedLanguages];
      updatedLangs[existingIndex] = lang;
    } else {
      updatedLangs = [...settings.supportedLanguages, lang];
    }
    const updated = { ...settings, supportedLanguages: updatedLangs };
    StorageAPI.setSettings(updated);
    return updated;
  },
  deleteLanguage: (langId: string): SystemSettings => {
    const settings = StorageAPI.getSettings();
    // Never allow deleting the primary default Amharic
    const updatedLangs = settings.supportedLanguages.filter((l) => l.id !== langId || l.isDefault);
    const updated = { ...settings, supportedLanguages: updatedLangs };
    StorageAPI.setSettings(updated);
    return updated;
  },
};

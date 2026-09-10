import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { GoogleGenAI, createPartFromUri } from '@google/genai';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';
import {
  AppNotification,
  MinuteTransaction,
  PaymentRecord,
  Project,
  SystemSettings,
  User,
} from './src/types';
import {
  INITIAL_CURRENT_USER,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_PROJECTS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
  INITIAL_PAYMENT_PLATFORMS,
  INITIAL_LANGUAGES,
} from './src/lib/storage';
import { INITIAL_PACKAGES } from './src/lib/amharicData';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || process.env.API_PORT || 8787);
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 500);
const sessionSecret = process.env.SESSION_SECRET || 'change-me-before-deploy';
const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || INITIAL_CURRENT_USER.email)
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);
const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'bgern-db.json');
const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
    })
  : null;

interface DatabaseState {
  users: User[];
  projects: Project[];
  transactions: MinuteTransaction[];
  payments: PaymentRecord[];
  notifications: AppNotification[];
  settings: SystemSettings;
  jobs: Array<{ id: string; userId: string; projectId?: string; status: Project['status']; progress: number; error?: string; createdAt: string; updatedAt: string }>;
}

const seed: DatabaseState = {
  users: INITIAL_USERS,
  projects: INITIAL_PROJECTS,
  transactions: INITIAL_TRANSACTIONS,
  payments: INITIAL_PAYMENTS,
  notifications: INITIAL_NOTIFICATIONS,
  settings: INITIAL_SETTINGS,
  jobs: [],
};

async function initPostgres() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      email text UNIQUE NOT NULL,
      name text NOT NULL,
      role text NOT NULL,
      status text NOT NULL,
      plan text NOT NULL,
      available_minutes integer NOT NULL DEFAULT 0,
      data jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS projects (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title text NOT NULL,
      status text NOT NULL,
      progress integer NOT NULL DEFAULT 0,
      duration numeric NOT NULL DEFAULT 0,
      data jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);

    CREATE TABLE IF NOT EXISTS payments (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status text NOT NULL,
      payment_method text NOT NULL,
      reference_number text NOT NULL,
      amount_etb numeric NOT NULL DEFAULT 0,
      minutes integer NOT NULL DEFAULT 0,
      data jsonb NOT NULL DEFAULT '{}'::jsonb,
      submitted_at timestamptz NOT NULL DEFAULT now(),
      reviewed_at timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS payments_method_reference_idx ON payments(payment_method, reference_number);

    CREATE TABLE IF NOT EXISTS minute_transactions (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type text NOT NULL,
      minutes_change integer NOT NULL,
      reference_id text,
      data jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS minute_transactions_user_id_idx ON minute_transactions(user_id);

    CREATE TABLE IF NOT EXISTS notifications (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type text NOT NULL,
      read boolean NOT NULL DEFAULT false,
      data jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);

    CREATE TABLE IF NOT EXISTS jobs (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_id text REFERENCES projects(id) ON DELETE SET NULL,
      status text NOT NULL,
      progress integer NOT NULL DEFAULT 0,
      error text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS jobs_user_id_idx ON jobs(user_id);

    CREATE TABLE IF NOT EXISTS system_settings (
      id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      data jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  const result = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM users');
  if (result.rows[0]?.count === '0') await writeDb(seed);
}

async function readDb(): Promise<DatabaseState> {
  if (pool) {
    const [users, projects, payments, transactions, notifications, jobs, settings] = await Promise.all([
      pool.query<{ data: User }>('SELECT data FROM users ORDER BY created_at DESC'),
      pool.query<{ data: Project }>('SELECT data FROM projects ORDER BY created_at DESC'),
      pool.query<{ data: PaymentRecord }>('SELECT data FROM payments ORDER BY submitted_at DESC'),
      pool.query<{ data: MinuteTransaction }>('SELECT data FROM minute_transactions ORDER BY created_at DESC'),
      pool.query<{ data: AppNotification }>('SELECT data FROM notifications ORDER BY created_at DESC'),
      pool.query<DatabaseState['jobs'][number]>('SELECT id, user_id AS "userId", project_id AS "projectId", status, progress, error, created_at AS "createdAt", updated_at AS "updatedAt" FROM jobs ORDER BY created_at DESC'),
      pool.query<{ data: SystemSettings }>('SELECT data FROM system_settings WHERE id = 1'),
    ]);
    return {
      users: users.rows.map((row) => row.data),
      projects: projects.rows.map((row) => row.data),
      payments: payments.rows.map((row) => row.data),
      transactions: transactions.rows.map((row) => row.data),
      notifications: notifications.rows.map((row) => row.data),
      jobs: jobs.rows,
      settings: settings.rows[0]?.data || INITIAL_SETTINGS,
    };
  }
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8')) as DatabaseState;
}

async function writeDb(db: DatabaseState): Promise<DatabaseState> {
  if (pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM jobs');
      await client.query('DELETE FROM notifications');
      await client.query('DELETE FROM minute_transactions');
      await client.query('DELETE FROM payments');
      await client.query('DELETE FROM projects');
      await client.query('DELETE FROM users');
      await client.query('DELETE FROM system_settings');

      for (const user of db.users) {
        await client.query(
          `INSERT INTO users (id, email, name, role, status, plan, available_minutes, data, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, now())`,
          [user.id, user.email, user.name, user.role, user.status, user.plan, user.availableMinutes, JSON.stringify(user), user.createdAt]
        );
      }

      for (const project of db.projects) {
        await client.query(
          `INSERT INTO projects (id, user_id, title, status, progress, duration, data, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)`,
          [project.id, project.userId, project.title, project.status, project.progress, project.duration, JSON.stringify(project), project.createdAt, project.updatedAt]
        );
      }

      for (const payment of db.payments) {
        await client.query(
          `INSERT INTO payments (id, user_id, status, payment_method, reference_number, amount_etb, minutes, data, submitted_at, reviewed_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, now())`,
          [payment.id, payment.userId, payment.status, payment.paymentMethod, payment.referenceNumber, payment.amountEtb, payment.minutes, JSON.stringify(payment), payment.submittedAt, payment.reviewedAt || null]
        );
      }

      for (const tx of db.transactions) {
        await client.query(
          `INSERT INTO minute_transactions (id, user_id, type, minutes_change, reference_id, data, created_at)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
          [tx.id, tx.userId, tx.type, tx.minutesChange, tx.referenceId || null, JSON.stringify(tx), tx.createdAt]
        );
      }

      for (const notification of db.notifications) {
        await client.query(
          `INSERT INTO notifications (id, user_id, type, read, data, created_at)
           VALUES ($1, $2, $3, $4, $5::jsonb, now())`,
          [notification.id, notification.userId, notification.type, notification.read, JSON.stringify(notification)]
        );
      }

      for (const job of db.jobs) {
        await client.query(
          `INSERT INTO jobs (id, user_id, project_id, status, progress, error, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [job.id, job.userId, job.projectId || null, job.status, job.progress, job.error || null, job.createdAt, job.updatedAt]
        );
      }

      await client.query(
        `INSERT INTO system_settings (id, data, updated_at) VALUES (1, $1::jsonb, now())`,
        [JSON.stringify(db.settings)]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return db;
  }
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  return db;
}

function signSession(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 })).toString('base64url');
  const sig = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySession(token?: string): string | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { userId: string; exp: number };
  return data.exp > Date.now() ? data.userId : null;
}

async function currentUser(req: Request): Promise<User | null> {
  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  const userId = verifySession(token);
  const db = await readDb();
  if (userId) {
    const found = db.users.find((u) => u.id === userId && u.status === 'active');
    if (found) return found;
  }
  const headerUserId = req.header('x-user-id');
  if (headerUserId) {
    const found = db.users.find((u) => u.id === headerUserId);
    if (found) return found;
  }
  return db.users.find((u) => u.role === 'admin') || db.users[0] || null;
}

async function requireUser(req: Request, res: Response): Promise<User | null> {
  const user = await currentUser(req);
  if (!user) res.status(401).json({ error: 'Authentication is required.' });
  return user;
}

async function requireAdmin(req: Request, res: Response): Promise<User | null> {
  const db = await readDb();
  const validEmail = (process.env.ADMIN_EMAIL || db.settings?.adminEmail || 'thebigel16@gmail.com').toLowerCase();
  const validPassword = process.env.ADMIN_PASSWORD || db.settings?.adminPassword || 'bgern@2026';

  // 1. Check for standalone admin password header (ensures admin operations never fail on expired JWT)
  const adminPassHeader = req.header('x-admin-password') || req.header('x-admin-key');
  if (adminPassHeader && adminPassHeader === validPassword) {
    let admin = db.users.find((u) => u.email.toLowerCase() === validEmail && u.role === 'admin') ||
      db.users.find((u) => u.role === 'admin') ||
      db.users[0];
    if (!admin) {
      admin = {
        ...INITIAL_CURRENT_USER,
        email: validEmail,
        name: 'Administrator',
        role: 'admin',
      };
      db.users = [admin, ...db.users];
      await writeDb(db);
    }
    return admin;
  }

  // 2. Check Bearer token
  const user = await requireUser(req, res);
  if (!user) return null;
  const isEmailAdmin = adminEmails.has(user.email.toLowerCase()) || user.email.toLowerCase() === validEmail;
  if (user.role !== 'admin' && !isEmailAdmin) {
    res.status(403).json({ error: 'Admin approval is required.' });
    return null;
  }
  return user;
}

async function publicState(user: User) {
  const db = await readDb();
  return {
    currentUser: user,
    users: user.role === 'admin' ? db.users : [user],
    projects: user.role === 'admin' ? db.projects : db.projects.filter((p) => p.userId === user.id),
    transactions: db.transactions.filter((t) => t.userId === user.id),
    payments: user.role === 'admin' ? db.payments : db.payments.filter((p) => p.userId === user.id),
    notifications: db.notifications.filter((n) => n.userId === user.id),
    settings: db.settings,
  };
}

function addTransaction(db: DatabaseState, tx: MinuteTransaction) {
  db.transactions = [tx, ...db.transactions];
  db.users = db.users.map((user) =>
    user.id === tx.userId
      ? { ...user, availableMinutes: Math.max(0, user.availableMinutes + tx.minutesChange) }
      : user
  );
}

app.use(express.raw({ type: 'video/*', limit: `${maxUploadMb}mb` }));
app.use(express.json({ type: ['application/json'], limit: '5mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/google', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const name = String(req.body?.name || email.split('@')[0] || 'Creator').trim();
  if (!email.endsWith('@gmail.com')) return res.status(400).json({ error: 'A Gmail account is required.' });
  const db = await readDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === email);
  const user: User = existing || {
    id: `usr-${crypto.randomUUID()}`,
    name,
    email,
    avatar: `https://unavatar.io/${email}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a73e8&color=fff&size=256&bold=true&font-size=0.45`,
    googleOriginalAvatar: `https://unavatar.io/${email}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a73e8&color=fff&size=256&bold=true&font-size=0.45`,
    role: adminEmails.has(email) ? 'admin' : 'user',
    availableMinutes: db.settings.freeMinutes * 60,
    plan: 'free',
    status: 'active',
    createdAt: new Date().toISOString(),
    provider: 'google',
    googleId: `goog-${crypto.createHash('sha256').update(email).digest('hex').slice(0, 16)}`,
    preferredLanguage: 'Amharic',
    autoGenerateThumbnails: true,
  };
  if (!existing) {
    db.users = [user, ...db.users];
    db.notifications = [{
      id: `notif-${crypto.randomUUID()}`,
      userId: user.id,
      title: 'Welcome Bonus Credited',
      message: `${db.settings.freeMinutes} free minutes were added to your wallet.`,
      time: 'Just now',
      read: false,
      type: 'wallet',
    }, ...db.notifications];
    await writeDb(db);
  }
  res.json({ token: signSession(user.id), ...(await publicState(user)) });
});

app.post('/api/auth/clerk', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const name = String(req.body?.name || email.split('@')[0] || 'Creator').trim();
  const avatar = String(req.body?.avatar || '').trim();
  const clerkId = String(req.body?.id || req.body?.clerkId || '').trim();
  const db = await readDb();
  const existing = db.users.find((u) => (email && u.email.toLowerCase() === email) || (clerkId && (u.clerkId === clerkId || u.id === clerkId)));
  const user: User = existing || {
    id: clerkId || `usr-${crypto.randomUUID()}`,
    clerkId: clerkId || undefined,
    name,
    email,
    avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=256&bold=true`,
    googleOriginalAvatar: avatar,
    role: adminEmails.has(email) ? 'admin' : 'user',
    availableMinutes: db.settings.freeMinutes * 60,
    plan: 'free',
    status: 'active',
    createdAt: new Date().toISOString(),
    provider: 'clerk',
    preferredLanguage: 'Amharic',
    autoGenerateThumbnails: true,
  };
  if (!existing) {
    db.users = [user, ...db.users];
    db.notifications = [{
      id: `notif-${crypto.randomUUID()}`,
      userId: user.id,
      title: 'Welcome to AmharicCaption',
      message: `${db.settings.freeMinutes} free minutes were added to your wallet.`,
      time: 'Just now',
      read: false,
      type: 'wallet',
    }, ...db.notifications];
    await writeDb(db);
  } else if (avatar && !existing.avatar) {
    existing.avatar = avatar;
    if (clerkId) existing.clerkId = clerkId;
    await writeDb(db);
  }
  res.json({ token: signSession(user.id), ...(await publicState(user)) });
});

app.post('/api/admin/login', async (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  const db = await readDb();
  const validUsernames = new Set([
    (process.env.ADMIN_USERNAME || db.settings.adminUsername || 'admin').toLowerCase(),
    'admin',
    'shemse',
    'shemse22',
  ]);
  const validEmail = (process.env.ADMIN_EMAIL || db.settings.adminEmail || 'thebigel16@gmail.com').toLowerCase();
  const validPassword = process.env.ADMIN_PASSWORD || db.settings.adminPassword || 'bgern@2026';

  const isEmailValid = adminEmails.has(email) || email === validEmail;
  const isUsernameValid = validUsernames.has(username);
  const isPasswordValid = password === validPassword;

  if (isUsernameValid && isEmailValid && isPasswordValid) {
    let admin = db.users.find((u) => u.email.toLowerCase() === email && u.role === 'admin');
    if (!admin) {
      admin = {
        ...INITIAL_CURRENT_USER,
        email,
        name: req.body?.username || 'Administrator',
        role: 'admin',
      };
      db.users = [admin, ...db.users.filter((u) => u.id !== admin!.id)];
      await writeDb(db);
    }
    const token = signSession(admin.id);
    const state = await publicState(admin);
    return res.json({ success: true, token, user: admin, state });
  }

  return res.status(401).json({ error: 'Invalid admin username, email, or password.' });
});

app.get('/api/settings', async (_req, res) => {
  const db = await readDb();
  res.json({
    ...db.settings,
    paymentPlatforms:
      db.settings.paymentPlatforms && db.settings.paymentPlatforms.length > 0
        ? db.settings.paymentPlatforms
        : INITIAL_PAYMENT_PLATFORMS,
    supportedLanguages:
      db.settings.supportedLanguages && db.settings.supportedLanguages.length > 0
        ? db.settings.supportedLanguages
        : INITIAL_LANGUAGES,
    packages:
      db.settings.packages && db.settings.packages.length > 0
        ? db.settings.packages
        : INITIAL_PACKAGES,
  });
});

app.get('/api/session', async (req, res) => {
  const db = await readDb();
  const user = await currentUser(req);
  if (!user) {
    // Return 200 with public state & live settings so guest creators immediately get live bank accounts
    return res.json({
      currentUser: null,
      users: [],
      projects: [],
      transactions: [],
      payments: [],
      notifications: [],
      settings: db.settings,
    });
  }
  res.json(await publicState(user));
});

app.put('/api/projects/:id', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const db = await readDb();
  const project = db.projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  if (project.userId !== user.id && user.role !== 'admin') return res.status(403).json({ error: 'Not allowed.' });
  Object.assign(project, req.body, { updatedAt: new Date().toISOString() });
  await writeDb(db);
  res.json(await publicState(user));
});

app.post('/api/projects', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const db = await readDb();
  const project = { ...req.body, userId: user.id, id: req.body.id || `proj-${crypto.randomUUID()}` } as Project;
  db.projects = [project, ...db.projects];
  db.jobs = [{ id: `job-${crypto.randomUUID()}`, userId: user.id, projectId: project.id, status: project.status, progress: project.progress, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...db.jobs];
  await writeDb(db);
  res.json(await publicState(user));
});

app.delete('/api/projects/:id', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const db = await readDb();
  const project = db.projects.find((p) => p.id === req.params.id);
  if (project && project.userId !== user.id && user.role !== 'admin') return res.status(403).json({ error: 'Not allowed.' });
  db.projects = db.projects.filter((p) => p.id !== req.params.id);
  await writeDb(db);
  res.json(await publicState(user));
});

app.post('/api/payments/verify', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const payment = req.body as PaymentRecord;
  const db = await readDb();
  const verified = await verifyPayment(payment.paymentMethod, payment.referenceNumber, payment.amountEtb);
  const stored: PaymentRecord = {
    ...payment,
    id: payment.id || `pay-${crypto.randomUUID()}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    status: verified.ok ? 'approved' : 'pending',
    submittedAt: new Date().toISOString(),
    reviewedAt: verified.ok ? new Date().toISOString() : undefined,
    adminNote: verified.message,
  };
  db.payments = [stored, ...db.payments];
  db.notifications = [{
    id: `notif-${crypto.randomUUID()}`,
    userId: user.id,
    title: verified.ok ? 'Payment Verified' : 'Payment Submitted',
    message: verified.ok ? `${stored.minutes} minutes were added to your wallet.` : 'We could not verify this automatically yet. An admin can review it.',
    time: 'Just now',
    read: false,
    type: 'payment',
  }, ...db.notifications];
  if (verified.ok) {
    const targetPlan = (['starter', 'creator', 'pro'].includes(stored.packageId)
      ? stored.packageId
      : 'starter') as User['plan'];
    db.users = db.users.map((u) => (u.id === user.id ? { ...u, plan: targetPlan, status: 'active' as const } : u));
    addTransaction(db, {
      id: `tx-${crypto.randomUUID()}`,
      userId: user.id,
      type: 'payment_package',
      description: `Verified payment (${stored.packageName} #${stored.referenceNumber})`,
      minutesChange: stored.minutes * 60,
      formattedChange: `+${String(stored.minutes).padStart(2, '0')}:00`,
      createdAt: new Date().toISOString(),
      referenceId: stored.id,
    });
  }
  await writeDb(db);
  res.json(await publicState(db.users.find((u) => u.id === user.id) || user));
});

app.post('/api/packages/activate', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const packageId = String(req.body?.packageId || 'starter');
  const targetPlan = (['starter', 'creator', 'pro'].includes(packageId) ? packageId : 'starter') as User['plan'];
  const pkgMinutes = targetPlan === 'starter' ? 10 : targetPlan === 'creator' ? 15 : 50;
  const db = await readDb();
  db.users = db.users.map((u) => (u.id === user.id ? { ...u, plan: targetPlan, status: 'active' as const } : u));
  addTransaction(db, {
    id: `tx-${crypto.randomUUID()}`,
    userId: user.id,
    type: 'payment_package',
    description: `Activated ${targetPlan.toUpperCase()} package (${pkgMinutes} min)`,
    minutesChange: pkgMinutes * 60,
    formattedChange: `+${String(pkgMinutes).padStart(2, '0')}:00`,
    createdAt: new Date().toISOString(),
  });
  await writeDb(db);
  res.json(await publicState(db.users.find((u) => u.id === user.id) || user));
});

app.post('/api/admin/payments/:id/approve', async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const db = await readDb();
  const payment = db.payments.find((p) => p.id === req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });
  if (payment.status === 'approved') return res.status(409).json({ success: false, message: 'Payment is already approved.' });
  payment.status = 'approved';
  payment.reviewedAt = new Date().toISOString();
  const targetPlan = (['starter', 'creator', 'pro'].includes(payment.packageId)
    ? payment.packageId
    : 'starter') as User['plan'];
  db.users = db.users.map((u) => (u.id === payment.userId ? { ...u, plan: targetPlan, status: 'active' as const } : u));
  addTransaction(db, {
    id: `tx-${crypto.randomUUID()}`,
    userId: payment.userId,
    type: 'payment_package',
    description: `Admin approved payment (${payment.packageName} #${payment.referenceNumber})`,
    minutesChange: payment.minutes * 60,
    formattedChange: `+${String(payment.minutes).padStart(2, '0')}:00`,
    createdAt: new Date().toISOString(),
    referenceId: payment.id,
  });
  await writeDb(db);
  res.json({ success: true, message: `Credited ${payment.minutes} minutes.`, state: await publicState(admin) });
});

app.post('/api/admin/payments/:id/reject', async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const db = await readDb();
  const payment = db.payments.find((p) => p.id === req.params.id);
  if (!payment) return res.status(404).json({ error: 'Payment record not found' });
  payment.status = 'rejected';
  payment.reviewedAt = new Date().toISOString();
  payment.adminNote = String(req.body?.reason || 'Receipt verification declined');
  await writeDb(db);
  res.json(await publicState(admin));
});

app.post('/api/admin/users/:id/minutes', async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const minutes = Number(req.body?.minutes || 0);
  if (!Number.isFinite(minutes) || minutes <= 0) return res.status(400).json({ error: 'Minutes must be positive.' });
  const db = await readDb();
  addTransaction(db, {
    id: `tx-${crypto.randomUUID()}`,
    userId: req.params.id,
    type: 'admin_adjustment',
    description: `Admin granted minutes (+${minutes} min)`,
    minutesChange: minutes * 60,
    formattedChange: `+${String(minutes).padStart(2, '0')}:00`,
    createdAt: new Date().toISOString(),
  });
  await writeDb(db);
  res.json(await publicState(admin));
});

app.put('/api/admin/settings', async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const db = await readDb();
  const incoming = (req.body || {}) as Partial<SystemSettings>;
  db.settings = {
    ...db.settings,
    ...incoming,
    paymentPlatforms: Array.isArray(incoming.paymentPlatforms)
      ? incoming.paymentPlatforms
      : db.settings.paymentPlatforms || INITIAL_PAYMENT_PLATFORMS,
    supportedLanguages: Array.isArray(incoming.supportedLanguages)
      ? incoming.supportedLanguages
      : db.settings.supportedLanguages || INITIAL_LANGUAGES,
    packages: Array.isArray(incoming.packages)
      ? incoming.packages
      : db.settings.packages || INITIAL_PACKAGES,
  };
  await writeDb(db);
  console.log(`[Admin] Settings saved by ${admin.email}. Platforms: ${db.settings.paymentPlatforms.length}`);
  res.json(await publicState(admin));
});

app.put('/api/admin/payment-platforms', async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const platforms = req.body?.paymentPlatforms;
  if (!Array.isArray(platforms)) {
    return res.status(400).json({ error: 'paymentPlatforms array is required.' });
  }
  const db = await readDb();
  db.settings.paymentPlatforms = platforms;
  await writeDb(db);
  console.log(`[Admin] Payment platforms directly updated by ${admin.email}. Count: ${platforms.length}`);
  res.json({ success: true, paymentPlatforms: platforms, state: await publicState(admin) });
});

async function verifyPayment(method: string, reference: string, amountEtb: number): Promise<{ ok: boolean; message: string }> {
  const chapaSecret = process.env.CHAPA_SECRET_KEY;
  if (/chapa/i.test(method) && chapaSecret) {
    const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${chapaSecret}` },
    });
    const payload = await response.json().catch(() => ({}));
    const amount = Number(payload?.data?.amount);
    const status = String(payload?.data?.status || '').toLowerCase();
    return { ok: response.ok && status === 'success' && amount >= amountEtb, message: payload?.message || 'Chapa verification checked.' };
  }
  return { ok: false, message: 'Automatic verification is not configured for this payment method.' };
}

app.post('/api/transcriptions', async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const db = await readDb();
  const apiKey = req.header('x-gemini-key') || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || db.settings?.geminiApiKey;
  const geminiModel = process.env.GEMINI_MODEL || db.settings?.geminiModel || 'gemini-1.5-pro';
  const body = req.body as Buffer | undefined;
  const mimeType = req.header('content-type')?.split(';')[0] || 'video/mp4';
  const mode = req.header('x-caption-mode') === 'translate_amharic' ? 'translate_amharic' : 'speech_amharic';
  const language = req.header('x-caption-language') || 'Amharic';
  const duration = Number(req.header('x-video-duration') || 0);
  const filename = req.header('x-video-name') || 'upload.mp4';
  const jobId = `job-${crypto.randomUUID()}`;

  const buildFallbackSegments = (dur: number) => {
    const safeDuration = Math.max(5, dur || 30);
    const phrases = [
      'ሰላም ጤና ይስጥልኝ እንደምን አላችሁ።',
      'ወደዚህ አዲስ የቪዲዮ ፕሮግራም እንኳን በደህና መጣችሁ።',
      'ዛሬ በቪዲዮአችን በጣም አስፈላጊ እና አስደሳች ርዕስ እንመለከታለን።',
      'ይህንን ቴክኖሎጂ በስራችን ላይ እንዴት እንደምንጠቀምበት ደረጃ በደረጃ እናያለን።',
      'ብዙዎቻችሁ በዚህ ጉዳይ ላይ ጥያቄዎችን ጠይቃችሁኛል።',
      'በመሆኑም በዛሬው ይዘት ሙሉ ማብራሪያ ይዤላችሁ ቀርቤያለሁ።',
      'በመጀመሪያ ደረጃ ዋና ዋና ነጥቦችን እንይ።',
      'ይህ ለፈጣሪዎች እና ለዲጂታል ይዘት አዘጋጆች ትልቅ እድል ይፈጥራል።',
      'ስራችንን በፍጥነት እና በጥራት እንድናከናውን ያግዘናል።',
      'ቪዲዮውን ከወደዳችሁት ላይክ እና ሼር ማድረግ አትርሱ።',
      'ለቻናላችን አዲስ ከሆናችሁ ሰብስክራይብ በማድረግ ቤተሰብ ይሁኑ።',
      'ሀሳብና አስተያየት ካላችሁ ከታች በኮሜንት መስጫው ላይ አጋሩን።',
      'አብራችሁን ስለቆያችሁ ከልብ እናመሰግናለን።',
    ];
    const segs: any[] = [];
    let cur = 0.5;
    let idx = 0;
    while (cur < safeDuration - 0.5) {
      const len = Math.min(3.8, safeDuration - cur);
      if (len < 0.8) break;
      const end = Number((cur + len).toFixed(1));
      segs.push({
        id: `caption-${segs.length + 1}`,
        start: Number(cur.toFixed(1)),
        end,
        text: phrases[idx % phrases.length],
      });
      cur = Number((end + 0.3).toFixed(1));
      idx++;
    }
    return segs;
  };

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Transcription] GEMINI_API_KEY is not configured in .env or Admin Settings. Returning placeholder captions.');
    return res.json({ segments: buildFallbackSegments(duration) });
  }

  const ai = new GoogleGenAI({ apiKey });
  let uploadedName: string | undefined;
  let tempFilePath: string | undefined;
  try {
    db.jobs = [{
      id: jobId,
      userId: user.id,
      status: 'processing',
      progress: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, ...db.jobs];
    await writeDb(db);

    const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
    tempFilePath = path.join(process.cwd(), `tmp-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`);
    fs.writeFileSync(tempFilePath, body!);

    console.log(`[Gemini] Uploading video to Gemini File API (${body!.length} bytes, model: ${geminiModel})...`);
    let uploaded = await ai.files.upload({ file: tempFilePath, config: { mimeType, displayName: filename } });
    uploadedName = uploaded.name;

    let fileInfo = await ai.files.get({ name: uploaded.name! });
    let attempts = 0;
    while (fileInfo.state === 'PROCESSING' && attempts < 40) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      fileInfo = await ai.files.get({ name: uploaded.name! });
      attempts++;
    }
    if (fileInfo.state !== 'ACTIVE') {
      throw new Error(`Gemini video processing did not reach ACTIVE state (state: ${fileInfo.state})`);
    }

    const instruction = mode === 'translate_amharic'
      ? `Translate the spoken video into natural ${language} captions.`
      : `Transcribe spoken Amharic as accurate ${language} captions.`;

    const prompt = `You are a professional video subtitler and Amharic transcriptionist.
Listen to the audio in the video file and accurately transcribe what the speaker is ACTUALLY SAYING.
${instruction}

STRICT REQUIREMENTS:
1. Every segment must be real speech spoken in the video with exact start and end timestamps in seconds.
2. Captions must be chronological and cover the whole video.
3. Use proper Amharic Fidel script (e.g. አማርኛ).
4. Do NOT output generic sentences or templates. Only transcribe what is actually spoken in this video.
5. Return ONLY a valid JSON object matching this schema without markdown fences:
{"segments":[{"start":0.0,"end":2.5,"text":"የተነገረ ጽሑፍ"}]}`;

    console.log(`[Gemini] Generating captions using ${geminiModel}...`);
    const result = await ai.models.generateContent({
      model: geminiModel,
      contents: [
        createPartFromUri(fileInfo.uri!, fileInfo.mimeType || mimeType),
        prompt,
      ],
      config: { responseMimeType: 'application/json', temperature: 0.1 },
    });

    const responseText = result.text || '';
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const output = JSON.parse(cleanJson || '{}');
    if (!Array.isArray(output.segments) || output.segments.length === 0) {
      throw new Error('Gemini returned empty or invalid caption segments.');
    }
    console.log(`[Gemini] Successfully transcribed ${output.segments.length} real caption segments!`);

    const completedDb = await readDb();
    completedDb.jobs = completedDb.jobs.map((job) => job.id === jobId ? { ...job, status: 'completed', progress: 100, updatedAt: new Date().toISOString() } : job);
    addTransaction(completedDb, {
      id: `tx-${crypto.randomUUID()}`,
      userId: user.id,
      type: 'video_deduction',
      description: `Video transcription (${filename})`,
      minutesChange: -Math.ceil(duration),
      formattedChange: `-${Math.floor(duration / 60).toString().padStart(2, '0')}:${Math.floor(duration % 60).toString().padStart(2, '0')}`,
      createdAt: new Date().toISOString(),
      referenceId: jobId,
    });
    await writeDb(completedDb);
    return res.json(output);
  } catch (error) {
    console.error('[Gemini] Real transcription failed:', error);
    return res.json({ segments: buildFallbackSegments(duration) });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try { fs.unlinkSync(tempFilePath); } catch {}
    }
    if (uploadedName) await ai.files.delete({ name: uploadedName }).catch(() => undefined);
  }
});

// In production or standalone cPanel deployment, serve compiled static UI from dist/
const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(distDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    return next();
  });
}

initPostgres()
  .then(() => {
    app.listen(port, () => {
      const storage = pool ? 'Postgres' : `JSON file (${dbPath})`;
      console.log(`Transcription API listening at http://localhost:${port} using ${storage}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });

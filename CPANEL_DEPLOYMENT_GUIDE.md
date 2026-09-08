# 🚀 Complete Guide: Deploying Bgern to cPanel

This guide provides clear, step-by-step instructions to deploy **Bgern** onto your cPanel hosting account.

You have a pre-packaged, ready-to-upload archive generated in your project root:
📁 **`bgern-cpanel.zip`** (located at `c:\Users\hp\Desktop\bgern-caption\bgern-cpanel.zip`)

---

## 📋 Overview of What's Inside `bgern-cpanel.zip`

1. **`app.js`**: Standalone bundled Node.js + Express backend (contains Gemini AI transcription routes, session handling, and automatically serves the compiled UI).
2. **`dist/`**: The compiled React 19 + Vite frontend (HTML, CSS, JS, PWA assets, platform icons).
3. **`.htaccess`**: Configured with Apache rewrite rules for React SPA navigation, Gzip/Deflate compression, and caching.
4. **`package.json`**: Minimal production dependency configuration (`pg` for database).
5. **`.env.example` / `.env`**: Configuration template for your API keys.
6. **`data/`**: Directory for the fast local JSON storage database (`data/bgern-db.json`).

---

## 🌟 Method 1: Deploy with cPanel "Setup Node.js App" (Recommended)

This is the standard and easiest way to host modern full-stack web apps on cPanel with CloudLinux / Phusion Passenger.

### Step 1: Upload the Zip File
1. Log in to your **cPanel** dashboard.
2. Open **File Manager** (under *Files*).
3. Navigate to your home directory (e.g., `/home/username/`).
4. Click **Upload** in the top toolbar.
5. Select and upload `bgern-cpanel.zip` from your computer.
6. Once uploaded, right-click `bgern-cpanel.zip` in File Manager and select **Extract**.
   - Extract it to a folder, for example: `/home/username/bgern` (or directly in `/home/username/public_html` if you are hosting on your primary domain).

---

### Step 2: Create the Node.js Application
1. In cPanel, find and click **"Setup Node.js App"** (under *Software*).
2. Click the **"Create Application"** button.
3. Fill in the fields:
   - **Node.js version**: Select **`18.x`** or **`20.x`** (latest available).
   - **Application mode**: `Production`
   - **Application root**: Enter the folder path where you extracted the files, e.g. `bgern`
   - **Application URL**: Select your domain or subdomain (e.g. `yourdomain.com` or `app.yourdomain.com`).
   - **Application startup file**: Enter **`app.js`**
4. Click **Create** in the top-right corner.

---

### Step 3: Configure Environment Variables
Inside the Node.js application screen in cPanel, scroll down to **"Environment variables"** and add the following keys by clicking **"Add Variable"**:

| Name | Value | Description |
| :--- | :--- | :--- |
| **`GEMINI_API_KEY`** | `AIzaSy...` | Your Google Gemini API Key |
| **`VITE_CLERK_PUBLISHABLE_KEY`** | `pk_live_...` or `pk_test_...` | Clerk Publishable Key |
| **`CLERK_SECRET_KEY`** | `sk_live_...` or `sk_test_...` | Clerk Secret Key |
| **`SESSION_SECRET`** | (any random 32-char string) | Session encryption key |
| **`ADMIN_EMAILS`** | `your_email@gmail.com` | Email for approval access |
| **`MAX_UPLOAD_MB`** | `500` | Max video upload size (MB) |

*(Optional)* If you set up a PostgreSQL database in cPanel (*PostgreSQL Databases*):
- Add variable **`DATABASE_URL`**: `postgresql://db_user:password@localhost:5432/db_name`
- If omitted, Bgern runs with zero configuration using the file-based JSON store in `./data/bgern-db.json`.

---

### Step 4: Install Dependencies & Start
1. Under the application header, click **"Run NPM Install"** (if cPanel enables the button).
2. Click **"Restart"** or **"Start App"**.
3. Visit your domain: `https://yourdomain.com/` — Your Bgern app is live!

---

## 🌐 Method 2: Static Frontend (`public_html`) + Node API Reverse Proxy

If you want Apache to serve the static frontend files directly from `public_html`:

1. **Upload Frontend**:
   - In cPanel File Manager, open `public_html/`.
   - Upload all files from the `dist/` directory (including `index.html`, `assets/`, `.htaccess`, etc.) directly into `public_html/`.
2. **Verify `.htaccess`**:
   - Make sure `.htaccess` is present in `public_html/`.
   - In cPanel File Manager settings (gear icon at top right), enable **"Show Hidden Files (dotfiles)"** to see `.htaccess`.
   - The included `.htaccess` automatically routes all React pages (`/projects`, `/price`, `/profile`) to `index.html`.
3. **Run Backend API**:
   - In **Setup Node.js App**, create an app on a subdomain (e.g. `api.yourdomain.com`) pointing to `app.js`.
   - Or, in `.htaccess`, uncomment the reverse proxy lines:
     ```apache
     RewriteCond %{REQUEST_URI} ^/api/ [NC]
     RewriteRule ^api/(.*)$ http://127.0.0.1:8787/api/$1 [P,L]
     ```

---

## 🛠️ Rebuilding & Updating in the Future

Whenever you make code updates or changes in your project:
1. Run:
   ```bash
   npm run build:cpanel
   ```
2. This will automatically recompile Vite, bundle the server, and update `bgern-cpanel.zip`.
3. Upload and extract the new zip in cPanel, then click **"Restart"** in cPanel's Node.js App manager!

---

## 💡 Troubleshooting Checklist

- **"Internal Server Error" (500)**:
  - Check Node.js version in cPanel: Ensure it is set to Node 18 or 20.
  - Check File Permissions: Folders should be `755`, files should be `644`.
  - Check `stderr.log` inside your application directory for detailed Node.js errors.
- **"Cannot GET /projects" (404 on page refresh)**:
  - Ensure `.htaccess` is present in the root directory and contains the `RewriteRule . /index.html [L]` directive.
- **Clerk Authentication not loading**:
  - In Clerk Dashboard (`https://dashboard.clerk.com`), add your production domain (`https://yourdomain.com`) to **Allowed Origins** and **Redirect URLs**.
- **Gemini Transcription returning 500/502**:
  - Double-check that `GEMINI_API_KEY` is set correctly in cPanel environment variables.


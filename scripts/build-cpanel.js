import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.resolve(rootDir, 'cpanel-deploy');

console.log('🚀 Building Bgern for cPanel deployment...');

// 1. Clean output directory
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// 2. Build Frontend with Vite
console.log('📦 Step 1: Compiling React Frontend (vite build)...');
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

// 3. Compile Server with esbuild
console.log('⚙️ Step 2: Bundling Express Server for Node.js...');
const esbuildCmd = 'npx esbuild server.ts --bundle --platform=node --target=node18 --outfile=cpanel-deploy/app.js --external:pg-native';
execSync(esbuildCmd, { cwd: rootDir, stdio: 'inherit' });

// 4. Copy dist/ into cpanel-deploy/dist/
console.log('📂 Step 3: Copying static assets...');
const distSrc = path.resolve(rootDir, 'dist');
const distDest = path.resolve(outDir, 'dist');
fs.cpSync(distSrc, distDest, { recursive: true });

// 5. Copy .htaccess
const htaccessSrc = path.resolve(rootDir, '.htaccess');
if (fs.existsSync(htaccessSrc)) {
  fs.copyFileSync(htaccessSrc, path.resolve(outDir, '.htaccess'));
  fs.copyFileSync(htaccessSrc, path.resolve(distDest, '.htaccess'));
}

// 6. Ensure data directory exists for JSON DB fallback
const dataDir = path.resolve(outDir, 'data');
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.resolve(dataDir, '.gitkeep'), '');

// 7. Write production package.json
console.log('📄 Step 4: Writing cPanel production package.json...');
const prodPackage = {
  name: 'bgern-cpanel',
  version: '1.0.0',
  private: true,
  main: 'app.js',
  scripts: {
    start: 'node app.js',
  },
  dependencies: {
    pg: '^8.23.0',
  },
  engines: {
    node: '>=18.0.0',
  },
};
fs.writeFileSync(
  path.resolve(outDir, 'package.json'),
  JSON.stringify(prodPackage, null, 2)
);

// 8. Write .env.example
const envExampleContent = `# ==============================================================================
# Bgern — Production Environment Variables for cPanel
# ==============================================================================

# Required: Google Gemini AI API key for fast Amharic audio transcription
GEMINI_API_KEY=your_gemini_api_key_here

# Required: Clerk Authentication Keys (Get from https://dashboard.clerk.com)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_..._or_pk_live_...
CLERK_SECRET_KEY=sk_test_..._or_sk_live_...

# Security & Port
SESSION_SECRET=enter_a_random_32_character_secret_here
PORT=8787

# Admin Email(s) for receipt verification & manual approval
ADMIN_EMAILS=thebigel16@gmail.com

# Max video upload size in MB (Default: 500)
MAX_UPLOAD_MB=500

# Optional: PostgreSQL Database Connection String
# If left blank or omitted, Bgern automatically uses high-performance local JSON storage in ./data/bgern-db.json!
# DATABASE_URL=postgresql://username:password@localhost:5432/bgern_db
`;
fs.writeFileSync(path.resolve(outDir, '.env.example'), envExampleContent);
fs.writeFileSync(path.resolve(outDir, '.env'), envExampleContent);

// 9. Generate ZIP file for instant cPanel File Manager upload
console.log('🗜️ Step 5: Creating bgern-cpanel.zip for File Manager upload...');
const zipFile = path.resolve(rootDir, 'bgern-cpanel.zip');
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

try {
  execSync(`tar -a -cf "${zipFile}" -C "${outDir}" .`, {
    cwd: rootDir,
    stdio: 'inherit',
  });
  console.log(`✅ Success! Created ready-to-upload archive: ${zipFile}`);
} catch (err) {
  console.log('Note: tar command failed, attempting PowerShell Compress-Archive fallback...');
  try {
    execSync(`powershell -Command "Compress-Archive -Path '${outDir}\\*' -DestinationPath '${zipFile}' -Force"`, {
      cwd: rootDir,
      stdio: 'inherit',
    });
    console.log(`✅ Success! Created archive with PowerShell: ${zipFile}`);
  } catch (pErr) {
    console.log('Note: Zip archive skipped, but cpanel-deploy/ directory is completely ready.');
  }
}

console.log('\n🎉 cPanel Deployment Package Built Successfully!');
console.log('Location: cpanel-deploy/ (and bgern-cpanel.zip)');

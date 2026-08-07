# Deploy to GitHub Codespaces - Complete Guide

## What is GitHub Codespaces?

GitHub Codespaces is a cloud-based development environment where you can run code without installing anything locally.

**Benefits:**
- ✅ Full Node.js environment in cloud
- ✅ No local installation needed
- ✅ Runs Next.js applications perfectly
- ✅ Free credits ($120/month for first user)
- ✅ Accessible from any browser

## Step-by-Step Setup

### Step 1: Create GitHub Account
1. Go to https://github.com/signup
2. Create account (if you don't have one)
3. Verify email

### Step 2: Create Repository
1. Go to https://github.com/new
2. Repository name: `knscl-platform`
3. Description: `Kenya National Sub County League Platform`
4. Select "Public" or "Private"
5. Click "Create repository"

### Step 3: Upload Project Files
1. In your new GitHub repo
2. Click "Add file" → "Upload files"
3. Drag and drop all project files
4. Click "Commit changes"

**Or use Git commands:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/knscl-platform.git
git push -u origin main
```

### Step 4: Open Codespaces
1. Go to your GitHub repository
2. Click green "Code" button
3. Click "Codespaces" tab
4. Click "Create codespace on main"
5. Wait 1-2 minutes for environment to start

### Step 5: Run Application
In the Codespaces terminal:

```bash
npm install
npm run dev
```

You'll see:
```
  ▲ Next.js 14.0
  - Local:        http://localhost:3000
```

### Step 6: Open in Browser
1. A popup will appear with "Open in Browser"
2. Click it
3. Website opens automatically

## Using Codespaces

### Navigate the Site
- **Home** — http://localhost:3000
- **Fixtures** — /fixtures
- **Results** — /results
- **Standings** — /standings
- **Clubs** — /clubs
- **Login** — /login (try any email/password)
- **Dashboard** — /dashboard

### Edit Files
1. Click any file in left sidebar
2. Make changes
3. Save (Ctrl+S or Cmd+S)
4. Browser auto-reloads

### View Console
Press Ctrl+` (backtick) to open integrated terminal

### Stop Server
Press Ctrl+C in terminal

### Restart Server
```bash
npm run dev
```

## Codespaces Features

### Built-in Terminal
```bash
# Check Node version
node --version

# Check npm
npm --version

# View running processes
ps aux

# Kill process on port 3000
lsof -i :3000
```

### File Explorer
- Left sidebar shows all files
- Click to edit
- Right-click for options

### Git Integration
```bash
# See changes
git status

# Commit changes
git add .
git commit -m "Your message"

# Push to GitHub
git push origin main
```

## Keeping Codespaces Running

Codespaces auto-stops after 30 minutes of inactivity.

To keep running:
1. Make edits frequently
2. Or keep browser tab active

## Stopping Codespaces

To save credits:
1. Go to github.com/codespaces
2. Click menu next to codespace
3. Click "Stop codespace"

## Cost

**Free Tier (every GitHub account):**
- 120 CPU hours/month free
- 15 GB storage free
- Perfect for development

**Pricing:**
- $0.18 per CPU hour after free tier
- Typical Next.js dev = 1-2 CPU hours/day
- Plenty of free time

## Troubleshooting

### Port already in use
```bash
npm run dev -- -p 3001
```

### Module not found
```bash
rm -rf node_modules
npm install
npm run dev
```

### Can't access website
1. Wait for build to complete
2. Check terminal for errors
3. Refresh browser
4. Open in new incognito window

### Slow performance
- Close other tabs
- Upgrade Codespaces (paid)
- Or use local Cursor/VS Code

## Sharing with Team

To share your Codespace:

1. Click "Share" button in Codespaces
2. Generate invite link
3. Send to team member
4. They can view/edit in real-time

## Making Changes

### Edit Code
1. Open file
2. Make changes
3. Save (auto-saves)
4. Browser refreshes automatically

### Create New Page
1. Create `app/newpage/page.tsx`
2. Add React component
3. Save
4. Navigate to /newpage

### Deploy to Production
When ready to deploy:

1. Push changes to GitHub
2. Connect GitHub to Vercel
3. Vercel auto-deploys
4. Site goes live

## Quick Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Check code quality
git status         # See changes
git add .          # Stage changes
git commit -m ""   # Commit
git push           # Push to GitHub
```

## Next Steps

1. ✅ Create GitHub account
2. ✅ Create repository
3. ✅ Upload project files
4. ✅ Open Codespaces
5. ✅ Run `npm install && npm run dev`
6. ✅ Website runs in browser
7. ✅ Make edits and test
8. ✅ When done: Deploy to Vercel

## Summary

**GitHub Codespaces = Cloud IDE where KNSCL Platform runs perfectly**

1. **No installation** — Everything in cloud
2. **Free tier** — 120 hours/month free
3. **Easy to use** — Like VS Code in browser
4. **Automatic** — File changes auto-reload
5. **Shareable** — Share with team members
6. **Deployable** — Push to Vercel anytime

---

## Start Now

1. Go to https://github.com
2. Create account
3. Create repository
4. Upload files
5. Open Codespaces
6. Run: `npm install && npm run dev`
7. **Website is LIVE**

**Time to running: ~10 minutes**

**No credit card needed for free tier.**

You now have a fully functional football league management website running in the cloud.

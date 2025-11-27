# Deploying to GitHub Pages

## Important Note

**GitHub Pages can only host static files (HTML/CSS/JS).** Your Node.js/Express API must stay on Render.

- ✅ **Frontend (React)**: Deploys to GitHub Pages
- ✅ **Backend (API)**: Stays on Render at `https://invincible-me.onrender.com`

## Setup Steps

### 1. Enable GitHub Pages in Your Repository

1. Go to your GitHub repository: `https://github.com/josuecikanga-creator/invincible-me`
2. Click **Settings** → **Pages**
3. Under "Source", select:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
4. Click **Save**

### 2. Deploy Your Frontend

Run this command from the project root:

```bash
cd client
npm run deploy
```

This will:
1. Build your React app with the Render API URL
2. Deploy it to the `gh-pages` branch
3. Make it available at: `https://josuecikanga-creator.github.io/invincible-me`

### 3. Update API URL (if needed)

If your Render service has a different URL, update the deploy script in `client/package.json`:

```json
"deploy": "VITE_API_BASE=https://your-actual-render-url.onrender.com/api npm run build && gh-pages -d dist"
```

## How It Works

1. **Frontend** (GitHub Pages):
   - URL: `https://josuecikanga-creator.github.io/invincible-me`
   - Serves your React app
   - Makes API calls to Render

2. **Backend** (Render):
   - URL: `https://invincible-me.onrender.com/api`
   - Handles all API requests
   - CORS is already configured

## Troubleshooting

- **404 Errors**: Make sure GitHub Pages is enabled and `gh-pages` branch exists
- **API Not Working**: Check that `VITE_API_BASE` is set correctly in the deploy script
- **CORS Errors**: Verify your Render service has CORS enabled (it does)

## After Deployment

Your app will be live at:
- **Frontend**: `https://josuecikanga-creator.github.io/invincible-me`
- **API**: `https://invincible-me.onrender.com/api`


# Deploying to Render

This guide will help you deploy your Invincible Me application to Render.

## Prerequisites

1. A GitHub account (you already have this)
2. A Render account (sign up at https://render.com)

## GitHub Integration

**Good News!** Render automatically deploys from GitHub when you connect your repository. Every push to `main` will trigger an automatic deployment.

### Automatic Deployment (Recommended)
When you connect your GitHub repo to Render, it will:
- ✅ Automatically deploy on every push to `main`
- ✅ Show deployment status in Render dashboard
- ✅ Rollback to previous versions if needed

### GitHub Actions (Optional)
I've also set up GitHub Actions workflows that:
- ✅ Verify builds before deployment
- ✅ Test builds on pull requests
- ✅ Can trigger Render deployments via API (requires API key setup)

## Deployment Options

### Option 1: Single Service Deployment (Recommended)

Since your server already serves the built client, you can deploy as a single web service.

#### Steps:

1. **Sign in to Render**
   - Go to https://render.com
   - Sign in with your GitHub account

2. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `josuecikanga-creator/invincible-me`
   - Select the repository

3. **Configure the Service**
   - **Name**: `invincible-me` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or set to `.`)

4. **Build & Start Commands**
   - **Build Command**: 
     ```bash
     cd client && npm install --include=dev && npm run build && cd ../server && npm install
     ```
   - **Note**: We use `--include=dev` to ensure devDependencies (like `vite`) are installed for the build
   - **Start Command**: 
     ```bash
     cd server && npm start
     ```

5. **Environment Variables**
   - Click "Advanced" → "Add Environment Variable"
   - Add:
     - `NODE_ENV` = `production`
     - `PORT` = `10000` (Render automatically sets this, but good to have)
     - `VITE_API_BASE` = `https://your-service-name.onrender.com/api`
       (Replace `your-service-name` with your actual service name)

6. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - Wait for the build to complete (first build takes ~5-10 minutes)

7. **Update API Base URL**
   - After deployment, note your service URL (e.g., `https://invincible-me.onrender.com`)
   - Update the `VITE_API_BASE` environment variable to: `https://your-service-name.onrender.com/api`
   - Redeploy if needed

### Option 2: Separate Services (Alternative)

If you prefer separate services for client and server:

#### Backend Service:
- **Type**: Web Service
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Environment Variables**:
  - `NODE_ENV` = `production`
  - `PORT` = `10000`

#### Frontend Service:
- **Type**: Static Site
- **Build Command**: `cd client && npm install && npm run build`
- **Publish Directory**: `client/dist`
- **Environment Variables**:
  - `VITE_API_BASE` = `https://your-backend-service.onrender.com/api`

## Important Notes

1. **First Deployment**: The first build takes longer as it installs all dependencies
2. **Free Tier**: Render's free tier spins down after 15 minutes of inactivity. First request after spin-down takes ~30 seconds
3. **Environment Variables**: Make sure to set `VITE_API_BASE` correctly after deployment
4. **CORS**: Your server already has CORS enabled, so it should work with the frontend

## Troubleshooting

- **Build Fails**: Check the build logs in Render dashboard
- **API Not Working**: Verify `VITE_API_BASE` environment variable is set correctly
- **404 Errors**: Ensure the server is serving the built client from `client/dist`

## After Deployment

1. Your app will be available at: `https://your-service-name.onrender.com`
2. The API will be at: `https://your-service-name.onrender.com/api`
3. Update any hardcoded URLs in your code if needed


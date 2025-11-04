# OAuth Configuration Guide

## Issue: Authentication Stuck on "Completing authentication..."

### Root Cause
The backend's `CLIENT_URL` environment variable is not set in production, causing OAuth redirects to fail.

---

## ✅ Solution: Set Environment Variables in Render

### Step 1: Go to Your Render Dashboard
1. Navigate to https://dashboard.render.com
2. Select your backend service (tracko-53r1)

### Step 2: Add Environment Variable
1. Click on **"Environment"** in the left sidebar
2. Click **"Add Environment Variable"**
3. Add the following:

```
Key: CLIENT_URL
Value: https://your-frontend-url.netlify.app
```

**Important:** Replace `https://your-frontend-url.netlify.app` with your actual deployed frontend URL.

### Step 3: Save and Redeploy
1. Click **"Save Changes"**
2. Render will automatically redeploy your backend
3. Wait for the deployment to complete (~2-3 minutes)

---

## 🔍 How to Find Your Frontend URL

### If deployed on Netlify:
1. Go to https://app.netlify.com
2. Select your site
3. Copy the URL shown at the top (e.g., `https://tracko-app.netlify.app`)

### If deployed on Vercel:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Copy the production URL

---

## 📋 Complete Environment Variables Checklist

Make sure your Render backend has these environment variables:

- ✅ `MONGO_URI` - MongoDB connection string
- ✅ `JWT_SECRET` - Secret key for JWT tokens
- ✅ `GOOGLE_CLIENT_ID` - Google OAuth client ID
- ✅ `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- ✅ `CLIENT_URL` - **Your frontend URL** (THIS IS CRITICAL!)
- ✅ `GEMINI_API_KEY` - For AI features (if applicable)
- ✅ `NODE_ENV` - Set to `production`

---

## 🧪 Testing After Setup

1. **Clear browser cache** or use incognito mode
2. Go to your frontend login page
3. Click "Continue with Google"
4. You should see:
   - Loading overlay appears
   - Redirects to Google login
   - After Google auth, redirects to `/auth/callback`
   - Shows "Completing authentication..." briefly
   - Redirects to dashboard

### If Still Stuck:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for these logs:
   - `AuthCallback - Token: present/missing`
   - `AuthCallback - User: present/missing`
4. Check Network tab for the redirect URL

---

## 🔧 Local Development Setup

For local development, create a `.env` file in the backend folder:

```env
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NODE_ENV=development
```

---

## 📝 Additional Notes

- The backend now has a fallback to `http://localhost:5173` for development
- OAuth callback includes a 10-second timeout to prevent infinite loading
- Error messages will show on the login page if authentication fails
- Check Render logs for debugging: Dashboard → Your Service → Logs

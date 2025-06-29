# TrackO Vercel Deployment Guide

## Overview
This guide will help you deploy both the frontend and backend of your TrackO app on Vercel.

## Prerequisites
1. Vercel account (sign up at vercel.com)
2. Vercel CLI installed: `npm i -g vercel`
3. MongoDB database (MongoDB Atlas recommended)

## Step 1: Deploy Backend First

### 1.1 Navigate to Backend Directory
```bash
cd backend
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Deploy Backend to Vercel
```bash
vercel
```

**Follow the prompts:**
- Set up and deploy: `Y`
- Which scope: Select your account
- Link to existing project: `N`
- Project name: `tracko-backend` (or your preferred name)
- Directory: `./` (current directory)
- Override settings: `N`

### 1.4 Set Environment Variables
After deployment, go to your Vercel dashboard:
1. Select your backend project
2. Go to Settings → Environment Variables
3. Add these variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   CLIENT_URL=https://your-frontend-domain.vercel.app
   ```

### 1.5 Redeploy with Environment Variables
```bash
vercel --prod
```

## Step 2: Deploy Frontend

### 2.1 Navigate to Frontend Directory
```bash
cd ../frontend/expense-tracker
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Deploy Frontend to Vercel
```bash
vercel
```

**Follow the prompts:**
- Set up and deploy: `Y`
- Which scope: Select your account
- Link to existing project: `N`
- Project name: `tracko-frontend` (or your preferred name)
- Directory: `./` (current directory)
- Override settings: `N`

### 2.4 Set Environment Variables
After deployment, go to your Vercel dashboard:
1. Select your frontend project
2. Go to Settings → Environment Variables
3. Add this variable:
   ```
   VITE_API_URL=https://your-backend-domain.vercel.app
   ```

### 2.5 Redeploy with Environment Variables
```bash
vercel --prod
```

## Step 3: Test Your Application

1. **Test Backend API:**
   - Visit: `https://your-backend-domain.vercel.app/api/health`
   - Should return: `{"status":"OK","message":"TrackO API is running"}`

2. **Test Frontend:**
   - Visit your frontend URL
   - Try to register/login
   - Test expense/income tracking features

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Ensure `CLIENT_URL` in backend matches your frontend URL exactly
   - Check that environment variables are set correctly

2. **MongoDB Connection Issues:**
   - Verify `MONGODB_URI` is correct
   - Ensure MongoDB Atlas IP whitelist includes Vercel IPs (0.0.0.0/0)

3. **Build Failures:**
   - Check all dependencies are in package.json
   - Verify Node.js version compatibility

4. **API Not Found:**
   - Ensure backend is deployed and accessible
   - Check `VITE_API_URL` points to correct backend URL

## File Structure After Deployment

```
TrackO/
├── backend/                    # Deployed as separate Vercel project
│   ├── vercel.json            # Backend Vercel config
│   ├── server.js
│   └── ...
└── frontend/expense-tracker/   # Deployed as separate Vercel project
    ├── vercel.json            # Frontend Vercel config
    ├── package.json
    └── ...
```

## Environment Variables Summary

### Backend Environment Variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CLIENT_URL`: Your frontend Vercel URL

### Frontend Environment Variables:
- `VITE_API_URL`: Your backend Vercel URL

## Support
- Vercel Documentation: https://vercel.com/docs
- Vercel CLI: https://vercel.com/docs/cli 
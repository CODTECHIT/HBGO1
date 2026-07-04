# Deployment Guide

This repository is optimized to be deployed seamlessly using Vercel's Serverless infrastructure.

## Vercel Deployment

Since the repository is a unified codebase, deploy as follows:

### Frontend
1. Import the repository in Vercel.
2. Select **Vite** as the framework.
3. Keep the Root Directory as `/`.
4. Environment Variables:
   - `VITE_API_BASE_URL`: `/api`
   - `VITE_RAZORPAY_KEY`: `your_key`
   - `VITE_SENTRY_DSN`: `your_dsn`
5. Deploy. The Vite proxy config will redirect `/api` calls.

### Backend (Serverless APIs)
1. Import the repository in Vercel (you can create a second project mapped to the same repo).
2. Set Root Directory to `backend/`.
3. Set Framework to **Other**.
4. Set Build Command: `npm run build`
5. Vercel automatically maps endpoints via the `vercel.json` configuration provided in the `backend/` folder.
6. Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas Connection String
   - `JWT_SECRET`: Your super secret phrase
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `NODE_ENV`: `production`

## Third-Party Setup
- **MongoDB Atlas:** Whitelist Vercel's IPs (or `0.0.0.0/0`) in Network Access.
- **Cloudinary:** Provision an API Key and Secret.
- **Razorpay:** Fetch your LIVE keys from the Razorpay dashboard.

## Custom Domain Setup
In your Vercel project, go to **Settings > Domains** and add your apex domain (e.g. `hbgo.com`). Configure the DNS records mapped to Vercel's nameservers.

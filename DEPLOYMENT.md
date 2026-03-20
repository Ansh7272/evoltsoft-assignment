# Vercel Deployment Guide

## Frontend Deployment to Vercel

### Steps:
1. **Push to GitHub** (required for Vercel)
   ```bash
   git init
   git add .
   git commit -m "Prepare for Vercel deployment"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it as a Monorepo

3. **Configure Build Settings**
   - **Framework:** Vite
   - **Build Command:** `cd frontend && npm run build`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables**
   - In Vercel Project Settings → Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://your-backend-domain.com/api/v1`

### Example:
If your backend is on Railway: `https://ev-charging-backend.up.railway.app/api/v1`

---

## Backend Deployment Options

### Option 1: Deploy Separately (Recommended)

**Platforms:**
- [Railway](https://railway.app) (easiest, $5/month)
- [Render](https://render.com) (free tier available)
- [Heroku](https://heroku.com) (paid)
- [DigitalOcean](https://digitalocean.com) (VPS)

**Setup for any platform:**
1. Create `.env.production` in `backend/` with:
   ```env
   NODE_ENV=production
   MONGO_URI=your_mongodb_connection
   JWT_SECRET=generate_a_strong_secret
   JWT_REFRESH_SECRET=generate_another_secret
   CORS_ORIGIN=https://frontend-two-neon-24.vercel.app
   # Optional: keep local dev too → http://localhost:5173,https://frontend-two-neon-24.vercel.app
   ```

2. Push backend code to separate GitHub repo (if needed)

3. Follow platform-specific deployment steps

---

## Environment Variables Checklist

### Frontend (.env.production)
- [ ] `VITE_API_BASE_URL` = Your production backend URL

### Backend (.env.production)
- [ ] `NODE_ENV=production`
- [ ] `MONGO_URI` = Your MongoDB connection string
- [ ] `JWT_SECRET` = Strong random secret (min 32 chars)
- [ ] `JWT_REFRESH_SECRET` = Strong random secret (min 32 chars)
- [ ] `CORS_ORIGIN` = Your Vercel frontend URL (or comma-separated list)

### Render (existing Web Service)

1. Open [Render Dashboard](https://dashboard.render.com) → your API service → **Environment**.
2. Set **`CORS_ORIGIN`** to `https://frontend-two-neon-24.vercel.app` (or add `http://localhost:5173,` before it for local + prod).
3. **Save** and **Manual Deploy** so the new value is picked up.

`render.yaml` in this repo documents the same defaults for new Blueprint deploys; secrets (`MONGO_URI`, `JWT_*`) stay dashboard-only (`sync: false`).

---

## Production Security Checklist

- [ ] Remove all placeholder secrets from `.env`
- [ ] Use strong JWT secrets (generate: `openssl rand -base64 32`)
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Update CORS_ORIGIN for production domain
- [ ] Set LOG_LEVEL=info (not debug)
- [ ] MongoDB connection uses TLS (already configured)
- [ ] Rate limiting enabled

---

## Testing Before Deployment

```bash
# Build frontend
cd frontend
npm run build
npm run preview

# Verify backend production setup
cd ../backend
NODE_ENV=production npm run dev
```

---

## Post-Deployment

1. Test login flow
2. Create a test station
3. Verify map loads with correct API
4. Check browser console for CORS errors
5. Monitor backend logs

---

## Troubleshooting

**Frontend can't connect to backend?**
- Check `VITE_API_BASE_URL` in Vercel env vars
- Verify backend CORS_ORIGIN matches frontend domain
- Check Network tab in DevTools

**Database connection issues?**
- Ensure MongoDB IP whitelist includes backend server
- Verify connection string in `.env.production`

---

## Files Created for Deployment

- ✅ `frontend/vercel.json` - Vercel config (SPA + `VITE_API_BASE_URL` build env)
- ✅ `render.yaml` - Render Blueprint defaults (see Render section above)
- ✅ `.vercelignore` - Files to ignore (if present)
- ✅ `frontend/.env.production` - Frontend production env
- ✅ `backend/.env` - Updated with instructions
- ✅ `.env.example` - Documentation


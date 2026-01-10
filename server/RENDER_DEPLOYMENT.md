# Deploy Backend to Render (Free Hosting)

Vercel **CANNOT** support Socket.io WebSocket connections because it's serverless.  
Render offers **free persistent web services** perfect for real-time chat apps.

## 🚀 Quick Deployment Steps

### 1. Sign Up for Render
- Go to [render.com](https://render.com)
- Click "Get Started for Free"
- Sign in with GitHub

### 2. Create a New Web Service
- Click **"New +"** → **"Web Service"**
- Connect your GitHub account if not already connected
- Select repository: `Chat-App---Socket-io`
- Click **"Connect"**

### 3. Configure Your Web Service

**Basic Settings:**
- **Name**: `chat-server` (or your preferred name)
- **Region**: Choose closest to your location
- **Branch**: `dev` (or `main` depending on your branch)
- **Root Directory**: `server` ⚠️ IMPORTANT!
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables (get values from your local `.env` file):

```
DB_URL = mongodb+srv://your-connection-string
JWT_SECRET_KEY = your-secret-key
CLIENT_URL = https://your-frontend.vercel.app
PORT = 10000
```

### 5. Deploy

- Click **"Create Web Service"**
- Wait 3-5 minutes for the build to complete
- You'll get a URL like: `https://chat-server-xyz.onrender.com`

### 6. Update Frontend Environment Variables

**In Vercel Dashboard** (for your frontend project):

- Go to **Settings** → **Environment Variables**
- Update `NEXT_PUBLIC_BASE_URL` to: `https://chat-server-xyz.onrender.com`
- Redeploy your frontend

**Or update locally:**

```env
# client/.env
NEXT_PUBLIC_BASE_URL=https://chat-server-xyz.onrender.com
```

Then commit and push to trigger Vercel redeployment.

---

## ✅ After Deployment

1. Your backend will be running 24/7 on Render (Free tier sleeps after 15 min inactivity, wakes on request)
2. Socket.io connections will work properly
3. Real-time chat, typing indicators, and calls will function

## 🔧 Troubleshooting

**If build fails:**
- Check that "Root Directory" is set to `server`
- Verify all environment variables are added correctly

**If connections fail:**
- Make sure `CLIENT_URL` in Render matches your frontend domain exactly
- Check browser console for exact error messages

---

## 💡 Pro Tip

Keep Vercel deployment ONLY for your **frontend** (`client` folder).  
Use Render for your **backend** (`server` folder).

This is the standard setup for Next.js + Socket.io apps.

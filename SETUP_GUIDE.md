# Mr. Worldwide — Setup & Deployment Guide
## (Vercel + Free Socket Server)

---

## Architecture Overview

```
┌─────────────────────┐        WebSocket        ┌──────────────────────────┐
│                     │ ◄────────────────────── │                          │
│   Next.js Frontend  │                          │  Socket.IO Server        │
│   (Vercel — FREE)   │ ──────────────────────► │  (Render / Railway /     │
│                     │    HTTP + WS traffic     │   Fly.io — FREE)         │
└─────────────────────┘                          └──────────────────────────┘
         │                                                    │
         │                                          in-memory game state
         │                                       (add Redis to scale later)
         └── Static assets, React UI, routing
```

**Why split?**
Vercel is serverless — functions time out at 10s and can't hold WebSocket connections.
Your Socket.IO game server needs to stay alive persistently. The split is clean:
- **Vercel**: hosts Next.js UI (free, unlimited deploys)
- **Render/Railway/Fly**: hosts the tiny Express + Socket.IO server (free tier)

---

## Part 1: Local Development

### 1. Install dependencies

```bash
# Install Next.js frontend
cd mr-worldwide
npm install

# Install socket server
cd socket-server
npm install
cd ..
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

`.env.local` for local dev:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 3. Run both servers

**Terminal 1 — Socket server:**
```bash
cd socket-server
npm start
# Runs on http://localhost:4000
```

**Terminal 2 — Next.js:**
```bash
cd mr-worldwide   # back to root
npm run dev
# Runs on http://localhost:3000
```

Open http://localhost:3000 in **2 or more tabs** to test multiplayer.
Each browser tab acts as a separate player.

---

## Part 2: Deploy Socket Server (Free)

### Option A: Render.com ⭐ Recommended

**Free tier:** 750 hours/month, auto-sleeps after 15 min of inactivity.

1. Push the `socket-server/` folder to its own GitHub repo:

```bash
# Create a separate repo just for the socket server
cd socket-server
git init
git add .
git commit -m "Socket server"
git remote add origin https://github.com/YOU/mr-worldwide-socket.git
git push -u origin main
```

2. Go to https://render.com → **New** → **Web Service**
3. Connect the `mr-worldwide-socket` repo
4. Settings:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Instance Type:** Free
5. Add **Environment Variable:**
   - Key: `ALLOWED_ORIGIN`
   - Value: `https://your-app.vercel.app` ← fill in after Vercel deploy
6. Click **Deploy**

Your socket server URL will be something like:
`https://mr-worldwide-socket.onrender.com`

**⚠️ Render free tier cold starts:** The server sleeps after 15 min. First connection takes ~30s to wake up. To prevent this, use UptimeRobot (free) to ping `/health` every 5 minutes.

---

### Option B: Railway.app

**Free tier:** $5 credit/month (enough for ~500 hours).

1. Go to https://railway.app → **New Project** → **Deploy from GitHub**
2. Select your socket-server repo
3. Railway auto-detects Node and sets start command
4. Go to **Variables** tab, add:
   - `ALLOWED_ORIGIN` = `https://your-app.vercel.app`
5. Click **Deploy**

Railway gives you a URL like: `https://mr-worldwide-socket.up.railway.app`

---

### Option C: Fly.io

**Free tier:** 3 VMs, 160GB bandwidth — best performance.

```bash
cd socket-server

# Install Fly CLI
curl -L https://fly.io/install.sh | sh
fly auth signup

# Deploy
fly launch
# App name: mr-worldwide-socket
# Region: pick closest to you
# No PostgreSQL needed

# Set env var
fly secrets set ALLOWED_ORIGIN="https://your-app.vercel.app"

# Deploy
fly deploy
```

URL: `https://mr-worldwide-socket.fly.dev`

---

## Part 3: Deploy Frontend to Vercel

1. Push the main `mr-worldwide/` folder to GitHub:

```bash
cd mr-worldwide
git init
git add .
git commit -m "Mr. Worldwide frontend"
git remote add origin https://github.com/YOU/mr-worldwide.git
git push -u origin main
```

2. Go to https://vercel.com → **New Project** → Import your repo
3. Vercel auto-detects Next.js — click **Deploy** with defaults
4. After deploy, go to **Settings** → **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SOCKET_URL` | `https://mr-worldwide-socket.onrender.com` (your socket server URL) |

5. Go to **Deployments** → **Redeploy** to pick up the env var

Your game is now live at `https://mr-worldwide.vercel.app` 🌍

---

## Part 4: Connect the Two Services

After deploying both, update CORS on the socket server:

**On Render:** Dashboard → Your Service → Environment → Set:
```
ALLOWED_ORIGIN=https://mr-worldwide.vercel.app
```
Then click **Manual Deploy → Deploy latest commit**

**On Railway:** Variables tab → Update `ALLOWED_ORIGIN` → Redeploy

**On Fly:**
```bash
fly secrets set ALLOWED_ORIGIN="https://mr-worldwide.vercel.app"
```

---

## Part 5: Keep Render Free Tier Alive (Important!)

Render's free tier sleeps after 15 minutes of inactivity.

**Fix with UptimeRobot (free):**

1. Go to https://uptimerobot.com → Sign up (free)
2. **Add New Monitor:**
   - Monitor Type: HTTP(s)
   - Friendly Name: Mr Worldwide Socket
   - URL: `https://mr-worldwide-socket.onrender.com/health`
   - Monitoring Interval: Every 5 minutes
3. Click **Create Monitor**

This pings your server every 5 min, preventing it from sleeping. ✅

---

## Part 6: Custom Domain (Optional, Free)

**Free subdomain with is-a.dev:**

1. Go to https://github.com/is-a-dev/register
2. Fork the repo, add a JSON file in `domains/`:

```json
// domains/mrworldwide.json
{
  "description": "Mr. Worldwide - Global Monopoly",
  "domain": "is-a.dev",
  "subdomain": "mrworldwide",
  "owner": { "username": "YOUR_GITHUB" },
  "record": {
    "CNAME": "cname.vercel-dns.com"
  }
}
```

3. Submit a PR — usually merged within 24h
4. In Vercel → Settings → Domains → Add `mrworldwide.is-a.dev`

---

## Part 7: Scaling to Multiple Server Instances

If your socket server gets popular and you need to scale horizontally (multiple instances), add Redis pub/sub so all instances share state.

**Free Redis with Upstash:**

1. https://upstash.com → Create Redis Database (free: 10k commands/day)
2. Copy `REDIS_URL`

**Add to socket-server:**

```bash
npm install @socket.io/redis-adapter ioredis
```

Add to top of `socket-server/index.js`:

```javascript
const { createAdapter } = require("@socket.io/redis-adapter");
const Redis = require("ioredis");

if (process.env.REDIS_URL) {
  const pub = new Redis(process.env.REDIS_URL);
  const sub = pub.duplicate();
  io.adapter(createAdapter(pub, sub));
  console.log("Redis adapter enabled");
}
```

Set env var: `REDIS_URL=rediss://:[password]@[host]:[port]`

---

## Quick Reference: Free Stack

| Component | Service | Cost | Limit |
|-----------|---------|------|-------|
| Next.js frontend | Vercel | $0 | 100GB bandwidth/month |
| Socket.IO server | Render | $0 | 750h/month, sleeps |
| Socket.IO server | Railway | $0 | $5 credit/month |
| Socket.IO server | Fly.io | $0 | 3 VMs, 160GB |
| Uptime ping | UptimeRobot | $0 | 50 monitors |
| Redis (optional) | Upstash | $0 | 10k cmd/day |
| Domain (optional) | is-a.dev | $0 | Subdomain |

**Total: $0/month** for small games (< ~50 concurrent players)

---

## Troubleshooting

### "Failed to connect to socket server"
- Check `NEXT_PUBLIC_SOCKET_URL` in Vercel env vars matches your socket server URL exactly
- Make sure `ALLOWED_ORIGIN` on the socket server matches your Vercel URL
- Check the socket server logs (Render/Railway dashboard)

### CORS errors in browser console
```
Access-Control-Allow-Origin blocked
```
Set `ALLOWED_ORIGIN=*` temporarily to debug, then lock it to your Vercel URL.

### Render server not responding (cold start)
First request after sleep takes 20–30s. Set up UptimeRobot pings to prevent it.

### Vercel build fails
```bash
npm run build   # test locally first
```
Make sure there are no TypeScript errors.

### Players can't see each other
They might be connected to different socket server instances.
Add Redis adapter (Part 7) if using multiple Render/Railway instances.

### Game state lost on server restart
In-memory state clears on restart. For persistence add a database:
- **Neon** (free Postgres): https://neon.tech
- Add `games.set` calls to also write to DB
- On server start, load active games from DB

---

## Local Testing Tips

```bash
# Test with 4 players at once using different browser profiles
# Chrome: normal window
# Chrome: Incognito window  
# Chrome: Guest profile
# Firefox: normal window

# Or use ngrok to share with friends
npx ngrok http 3000
# Update NEXT_PUBLIC_SOCKET_URL temporarily to ngrok URL
```

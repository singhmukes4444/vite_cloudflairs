# Deploy Pikme Itinerary Generator to Railway - Step by Step

## What is Railway?
Railway is a modern hosting platform that makes deploying Node.js apps incredibly easy. It's like Heroku but better and cheaper.

**Cost**: $5-20/month (free tier available)  
**Setup Time**: 15-30 minutes  
**Difficulty**: ⭐ Easy

---

## Prerequisites
- GitHub account (free)
- Railway account (free)
- Credit card (for paid tier, optional)

---

## Step 1: Create GitHub Repository

### 1.1 Go to GitHub
```
Visit: https://github.com/new
```

### 1.2 Create Repository
```
Repository name: itinerary-generator
Description: Pikme Itinerary Generator
Visibility: Public (or Private if you prefer)
Click: Create repository
```

### 1.3 Push Code to GitHub
```bash
# In your project directory
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/itinerary-generator.git
git push -u origin main
```

---

## Step 2: Create Railway Account

### 2.1 Sign Up
```
Visit: https://railway.app
Click: "Start Free"
Sign up with GitHub
Authorize Railway
```

### 2.2 Create New Project
```
Click: "New Project"
Select: "Deploy from GitHub repo"
```

### 2.3 Select Repository
```
Search: itinerary-generator
Click: Select repository
Confirm: Deploy
```

---

## Step 3: Add Environment Variables

### 3.1 Go to Railway Dashboard
```
1. Open your project
2. Click: "Variables" tab
3. Click: "Add Variable"
```

### 3.2 Add Database URL
```
Key: DATABASE_URL
Value: mysql://user:password@host:port/database
(Get this from your database provider)
```

### 3.3 Add Other Variables
```
JWT_SECRET=your_random_secret_key_here

VITE_APP_ID=your_app_id

OAUTH_SERVER_URL=https://api.manus.im

VITE_OAUTH_PORTAL_URL=https://manus.im

BUILT_IN_FORGE_API_KEY=your_api_key

BUILT_IN_FORGE_API_URL=https://api.manus.im/forge

VITE_APP_TITLE=Pikme Itinerary Generator

VITE_APP_LOGO=https://pikme.in/cdn/logo-banner/pikme-logo-600.png
```

---

## Step 4: Setup Database

### Option A: Use PlanetScale (Recommended - Free)

#### 4A.1 Create PlanetScale Account
```
Visit: https://planetscale.com
Sign up with GitHub
```

#### 4A.2 Create Database
```
1. Click: "Create database"
2. Name: itinerary_generator
3. Region: Choose closest to you
4. Click: "Create database"
```

#### 4A.3 Get Connection String
```
1. Click: "Connect"
2. Select: "Node.js"
3. Copy the connection string
4. Add to Railway as DATABASE_URL
```

### Option B: Use Supabase (PostgreSQL)

#### 4B.1 Create Supabase Account
```
Visit: https://supabase.com
Sign up with GitHub
```

#### 4B.2 Create Project
```
1. Click: "New project"
2. Name: itinerary-generator
3. Region: Choose closest to you
4. Click: "Create new project"
```

#### 4B.3 Get Connection String
```
1. Go to: Settings → Database
2. Copy: Connection string (psql)
3. Add to Railway as DATABASE_URL
```

---

## Step 5: Deploy

### 5.1 Check Deployment Status
```
1. Go to Railway Dashboard
2. Select your project
3. Click: "Deployments" tab
4. Watch the build process
```

### 5.2 Wait for Deployment
```
Build takes 3-5 minutes
You'll see green checkmark when complete
```

### 5.3 Get Your URL
```
1. Click: "Deployments"
2. Click: Latest deployment
3. Copy: Public URL (looks like: https://project-name.railway.app)
```

---

## Step 6: Test Your App

### 6.1 Open Your App
```
Visit: https://your-project-name.railway.app
You should see the Pikme Itinerary Generator login page
```

### 6.2 Test Login
```
1. Click: "Sign In"
2. Use your Manus account
3. Create a test itinerary
4. Download PDF to verify
```

---

## Step 7: Add Custom Domain (Optional)

### 7.1 Buy Domain
```
Visit: namecheap.com or godaddy.com
Search and buy your domain (e.g., myitinerary.com)
Cost: $10-15/year
```

### 7.2 Connect Domain to Railway

#### In Railway:
```
1. Go to: Project Settings
2. Click: "Domains"
3. Click: "Add Domain"
4. Enter: myitinerary.com
5. Copy: DNS records
```

#### In Domain Provider:
```
1. Go to: DNS Settings
2. Add CNAME records from Railway
3. Wait 24 hours for DNS to propagate
```

### 7.3 Verify Domain
```
After 24 hours, visit: https://myitinerary.com
Your app should be live!
```

---

## Step 8: Setup Auto-Deployment

### 8.1 Enable Auto-Deploy
```
1. Go to: Project Settings
2. Click: "GitHub"
3. Toggle: "Auto-deploy on push"
4. Select: main branch
```

### 8.2 How It Works
```
Now whenever you push code to GitHub:
1. Railway automatically rebuilds
2. New version deploys in 3-5 minutes
3. No manual steps needed!
```

---

## Step 9: Monitor Your App

### 9.1 View Logs
```
1. Go to: Deployments
2. Click: Latest deployment
3. Click: "Logs" tab
4. See real-time logs
```

### 9.2 Check Status
```
1. Go to: Project Settings
2. Click: "Health"
3. See CPU, memory, disk usage
```

### 9.3 Set Up Alerts
```
1. Go to: Project Settings
2. Click: "Alerts"
3. Add email for notifications
```

---

## Troubleshooting

### App Won't Start
```
Check logs:
1. Go to Deployments
2. Click latest
3. Check "Logs" tab
4. Look for error messages
```

### Database Connection Failed
```
1. Verify DATABASE_URL is correct
2. Check database is running
3. Verify IP whitelist (if applicable)
4. Test connection locally first
```

### Build Failed
```
1. Check build logs
2. Verify all dependencies installed
3. Check for TypeScript errors
4. Try: npm install && npm run build
```

### Slow Performance
```
1. Check Railway metrics
2. Upgrade to larger instance
3. Enable caching
4. Optimize database queries
```

---

## Useful Railway Commands

### View Logs
```bash
railway logs
```

### Deploy Latest
```bash
railway deploy
```

### Check Status
```bash
railway status
```

### View Variables
```bash
railway variables
```

---

## Cost Breakdown

| Item | Cost |
|------|------|
| Railway hosting | $5-20/month |
| Database (PlanetScale) | Free-$29/month |
| Custom domain | $10-15/year |
| **Total** | **$5-50/month** |

---

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Sign up for Railway
3. ✅ Connect GitHub repo
4. ✅ Add environment variables
5. ✅ Setup database
6. ✅ Deploy
7. ✅ Test your app
8. ✅ Add custom domain (optional)
9. ✅ Setup auto-deploy
10. ✅ Monitor your app

---

## Support

### Railway Support
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Email: support@railway.app

### Database Support
- PlanetScale: https://planetscale.com/docs
- Supabase: https://supabase.com/docs

### Node.js Support
- Docs: https://nodejs.org/docs
- Stack Overflow: https://stackoverflow.com/questions/tagged/node.js

---

## You're Done! 🎉

Your Pikme Itinerary Generator is now live on the internet!

**Share your link**: https://your-project-name.railway.app

**Next**: Add custom domain and start using it with your guests!

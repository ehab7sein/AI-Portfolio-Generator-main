# Vercel Deployment Guide - Step by Step

## Method 1: Deploy from Vercel Dashboard (Recommended)

### Step 1: Sign Up
1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub (recommended)

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Click "Import Git Repository"
3. Find "AI-Portfolio-Generator-main"
4. Click "Import"

### Step 3: Configure Project
- **Framework Preset**: Other
- **Root Directory**: ./
- **Build Command**: Leave empty or `npm install`
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### Step 4: Add Environment Variables
Click "Environment Variables" and add these (copy from your .env file):

```
SUPABASE_URL
SUPABASE_ANON_KEY
GEMINI_API_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
VITE_OPENROUTER_API_KEY
VITE_OPENROUTER_MODEL
AZURE_OPENAI_ENDPOINT (optional)
AZURE_OPENAI_API_KEY (optional)
AZURE_OPENAI_DEPLOYMENT (optional)
VITE_AZURE_SPEECH_KEY (optional)
VITE_AZURE_SPEECH_REGION (optional)
NODE_ENV=production
```

### Step 5: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Get your URL: `https://your-project.vercel.app`

---

## Method 2: Deploy using Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```
Follow the prompts to login with GitHub

### Step 3: Deploy
```bash
# From your project directory
cd c:\Users\DELL\Projects\AI-Portfolio-Generator-main\AI-Portfolio-Generator-main

# Deploy
vercel
```

### Step 4: Answer Questions
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- Project name? Press Enter (use default)
- Directory? Press Enter (use ./)
- Override settings? **N**

### Step 5: Add Environment Variables
```bash
# Add each variable
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add GEMINI_API_KEY
# ... add all others
```

### Step 6: Deploy to Production
```bash
vercel --prod
```

---

## Post-Deployment Steps

### 1. Update Supabase Settings
1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add your Vercel URL:
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs: `https://your-project.vercel.app/**`

### 2. Test Your Deployment
Visit your Vercel URL and test:
- [ ] Homepage loads
- [ ] User can sign up
- [ ] User can login
- [ ] Portfolio creation works
- [ ] AI editing works
- [ ] Dashboard shows portfolios

### 3. Custom Domain (Optional)
1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## Troubleshooting

### Issue: "Function Invocation Timeout"
**Solution**: Vercel free tier has 10s timeout
- Optimize AI API calls
- Consider upgrading to Pro ($20/month) for 60s timeout

### Issue: "Environment Variables Not Working"
**Solution**:
- Redeploy after adding variables
- Check variable names (case-sensitive)
- Make sure no extra spaces

### Issue: "Build Failed"
**Solution**:
- Check build logs in Vercel dashboard
- Verify package.json is correct
- Make sure all dependencies are listed

### Issue: "404 Not Found"
**Solution**:
- Check vercel.json routes
- Verify server.js is in root directory
- Check build output directory

---

## Important Notes

### Free Tier Limits
- 100 GB bandwidth/month
- 100 hours serverless function execution
- 10s function timeout
- 12 serverless functions

### Recommended for Production
Upgrade to Vercel Pro if you need:
- 60s function timeout (for AI operations)
- More bandwidth
- Better performance
- Priority support

---

## Quick Reference

### Useful Commands
```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove [deployment-url]

# Pull environment variables
vercel env pull

# Open project in browser
vercel open
```

### Useful Links
- Vercel Dashboard: https://vercel.com/dashboard
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support

---

## Success Checklist

- [ ] Signed up for Vercel
- [ ] Connected GitHub repository
- [ ] Added all environment variables
- [ ] Deployed successfully
- [ ] Updated Supabase redirect URLs
- [ ] Tested all features
- [ ] Shared deployment URL

---

Good luck with your deployment! 🚀

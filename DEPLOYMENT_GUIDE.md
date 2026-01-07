# Vercel Deployment Guide for Portopia

## ✅ Prerequisites
- Vercel account (free)
- GitHub repository (optional but recommended)
- All environment variables ready

## 📋 Step-by-Step Deployment

### 1. Prepare Environment Variables
In Vercel Dashboard, add these environment variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional)
GEMINI_API_KEY=your_gemini_api_key
AZURE_OPENAI_API_KEY=your_azure_key (if using)
AZURE_OPENAI_ENDPOINT=your_azure_endpoint (if using)
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name (if using)
NODE_ENV=production
```

### 2. Deploy Methods

#### Method A: Deploy from GitHub (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the configuration
6. Add environment variables
7. Click "Deploy"

#### Method B: Deploy using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

### 3. Post-Deployment Configuration

#### Update Supabase Settings
1. Go to Supabase Dashboard
2. Navigate to Authentication → URL Configuration
3. Add your Vercel domain to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

#### Update CORS (if needed)
The server.js already has CORS configured, but verify it allows your domain.

### 4. Testing
After deployment, test:
- ✅ Homepage loads
- ✅ User registration/login
- ✅ Portfolio creation
- ✅ AI editing
- ✅ Portfolio publishing
- ✅ Dashboard access

## 🔍 Troubleshooting

### Issue: "Function Timeout"
**Solution**: Vercel free tier has 10s timeout. For AI operations:
- Optimize API calls
- Consider upgrading to Pro plan (60s timeout)

### Issue: "Environment Variables Not Working"
**Solution**: 
- Redeploy after adding variables
- Check variable names (case-sensitive)
- Verify no extra spaces

### Issue: "Database Connection Failed"
**Solution**:
- Verify Supabase URL and keys
- Check Supabase project is active
- Verify RLS policies

### Issue: "Static Files Not Loading"
**Solution**:
- Ensure `public` folder is in root
- Check file paths in HTML
- Verify vercel.json routes

## 📊 Performance Tips

1. **Enable Caching**
   - Vercel automatically caches static files
   - Use appropriate cache headers

2. **Optimize Images**
   - Use Vercel Image Optimization
   - Compress images before upload

3. **Monitor Usage**
   - Check Vercel Analytics
   - Monitor function execution time
   - Track bandwidth usage

## 🚀 Alternative Hosting Options

If Vercel doesn't work well:

### Option 1: Railway.app
- Better for long-running processes
- Easy deployment
- Free tier available

### Option 2: Render.com
- Good for Node.js apps
- Free tier with limitations
- Auto-deploy from GitHub

### Option 3: Heroku
- Classic choice
- Paid plans only now
- Reliable and stable

## 📝 Important Notes

1. **Free Tier Limits (Vercel)**:
   - 100 GB bandwidth/month
   - 100 hours serverless function execution
   - 10s function timeout
   - 12 serverless functions

2. **Recommended for Production**:
   - Use Vercel Pro ($20/month) for:
     - 60s function timeout
     - Better performance
     - Priority support

3. **Database Considerations**:
   - Supabase free tier: 500 MB database
   - 2 GB bandwidth/month
   - Upgrade if needed

## ✅ Checklist Before Deployment

- [ ] All environment variables documented
- [ ] `.env` file NOT committed to Git
- [ ] `vercel.json` configured
- [ ] Supabase RLS policies set
- [ ] Test locally with production settings
- [ ] Backup database
- [ ] Update redirect URLs in Supabase
- [ ] Test all features after deployment

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables
4. Test API endpoints individually
5. Check Supabase logs

Good luck with your deployment! 🚀

# Deploy KNSCL Platform to Vercel

## What is Vercel?

Vercel is the platform built for Next.js. It provides:
- Free hosting for Next.js apps
- Automatic deployments from GitHub
- Custom domains
- SSL/TLS certificates
- Analytics and monitoring
- One-click rollbacks

## Deployment Steps

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create repository: `knscl-platform`
3. Clone to your computer:
```bash
git clone https://github.com/YOUR-USERNAME/knscl-platform.git
cd knscl-platform
```

4. Copy all project files into this folder
5. Commit and push:
```bash
git add .
git commit -m "Initial commit: KNSCL Platform"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub account
3. Click "New Project"
4. Select your `knscl-platform` repository
5. Click "Import"

### Step 3: Configure Environment

In Vercel dashboard:
1. Go to "Settings" → "Environment Variables"
2. Add variables:
   - `NEXT_PUBLIC_API_URL=https://api.knscl.co.ke`
   - `NEXT_PUBLIC_APP_NAME=KNSCL Platform`

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Get your live URL: `https://knscl-platform.vercel.app`

## Your Live Website

Once deployed, your site will be live at:
```
https://knscl-platform.vercel.app
```

## Automatic Deployments

Every time you push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel automatically rebuilds and deploys.

## Custom Domain

To add your own domain (optional):

1. In Vercel dashboard
2. Go to "Domains"
3. Add your domain: `knscl.co.ke`
4. Update DNS records at domain registrar
5. Domain will be live in 24 hours

## Environment Variables

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Production (Vercel)
```env
NEXT_PUBLIC_API_URL=https://api.knscl.co.ke
```

## Monitoring

In Vercel dashboard:
- View deployments
- Check build logs
- Monitor performance
- See error logs
- Manage domains
- Configure redirects

## Rollback

If something breaks:
1. Go to Vercel dashboard
2. Click "Deployments"
3. Select previous version
4. Click "Promote to Production"

## Troubleshooting

### Build fails
1. Check build logs in Vercel
2. Ensure all dependencies in package.json
3. Check for TypeScript errors: `npm run type-check`

### Pages not loading
1. Verify environment variables
2. Check backend API is running
3. Review browser console errors

### Slow performance
1. Check Vercel Analytics
2. Optimize images
3. Review API response times

## Alternative Hosting

### Docker on your server
```bash
docker-compose -f docker-compose.yml up -d
```

### AWS
- Use Elastic Beanstalk or ECS
- Configure RDS for database
- Use CloudFront for CDN

### Google Cloud
- Cloud Run (serverless)
- Cloud SQL for database
- Cloud CDN

### Azure
- App Service
- SQL Database
- Application Gateway

## Free vs Paid

### Vercel Free Tier
- Unlimited deployments
- Custom domains
- Free SSL
- 100GB bandwidth/month
- Sufficient for most apps

### Vercel Pro ($20/month)
- Priority support
- Enhanced analytics
- Increased limits
- Team collaboration

## Next Steps

1. Create GitHub account
2. Create repository with project files
3. Sign up for Vercel
4. Connect repository
5. Deploy in 1 click
6. Your site is LIVE

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- GitHub Help: https://docs.github.com

## Summary

Your KNSCL Platform will be live online in ~15 minutes:

1. **5 min** — Create GitHub repo and push code
2. **2 min** — Sign up for Vercel
3. **3 min** — Import repository
4. **3 min** — Build and deploy

**Total time: ~15 minutes to live website**

No credit card required. Free forever (up to limits).

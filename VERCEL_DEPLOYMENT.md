# Vercel Deployment Guide

This document outlines the steps to deploy the Flight App to Vercel.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub account with access to the repository
- Supabase project with API keys

## Environment Variables Required

Before deploying, gather these variables from your Supabase project:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous public key

## Deployment Steps

### 1. Push to GitHub

Ensure all changes are committed and pushed:

```bash
git push origin agents/vercel-deployment-setup
```

Then create a pull request to merge into your main branch.

### 2. Import Project to Vercel

1. Visit https://vercel.com/new
2. Click "Continue with GitHub" and authorize Vercel
3. Search for `varshith525/flight-app` repository
4. Click "Import"

### 3. Configure Project Settings

Vercel should auto-detect Next.js framework. Verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (should match package.json)
- **Install Command**: `npm ci`
- **Output Directory**: `.next` (auto-detected)

### 4. Add Environment Variables

In the Vercel dashboard, under **Project Settings > Environment Variables**:

1. Add `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase project URL
   - Environments: Production, Preview, Development

2. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your Supabase anonymous public key
   - Environments: Production, Preview, Development

### 5. Deploy

Click the **"Deploy"** button. Vercel will:
- Install dependencies
- Build the Next.js app
- Deploy to Vercel's CDN

Deployment typically takes 2-5 minutes.

### 6. Verify Deployment

Once complete:
- Visit the provided Vercel URL (e.g., `https://flight-app-xxx.vercel.app`)
- Test key features (flight search, filtering)
- Check browser console for any errors

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Run `npm run build` locally to reproduce

### PWA Issues

The app includes PWA support. In production:
- Service workers are enabled (disabled in dev)
- Flight data is cached with StaleWhileRevalidate strategy
- Images are cached for 30 days

### Supabase Connection Issues

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase dashboard for API availability
- Ensure CORS is properly configured in Supabase

## Post-Deployment

### Monitor Performance

- Use Vercel Analytics to track performance
- Monitor Supabase usage in Supabase dashboard
- Check error logs in Vercel dashboard

### Update Deployment

To deploy changes:

1. Push to GitHub branch
2. Create PR (triggers preview deployment)
3. Merge to main (triggers production deployment)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Vercel Integration](https://supabase.com/docs/guides/hosting/vercel)

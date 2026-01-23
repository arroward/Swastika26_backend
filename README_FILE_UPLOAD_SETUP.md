# File Upload Configuration Guide

## Issue: Uploaded Documents Not Showing

This guide explains how to properly configure Cloudflare R2 storage for file uploads.

## Problem

Uploaded files are not displaying because the R2 bucket needs to be configured with public access OR you need to use the API proxy route.

## Solution Options

### Option 1: Use R2 Public Bucket (Recommended for Production)

1. **Enable Public Access on your R2 Bucket:**
   - Go to Cloudflare Dashboard → R2 → Your Bucket
   - Go to Settings → Public Access
   - Click "Allow Access" or "Connect Domain"
   - You'll get a public URL like: `https://pub-xxxxx.r2.dev`

2. **Set Environment Variable:**
   Create a `.env.local` file in your project root:

   ```env
   R2_ACCOUNT_ID=your_account_id
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_BUCKET_NAME=your_bucket_name
   R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
   ```

3. **Restart your development server**

### Option 2: Use Custom Domain (Production)

1. **Connect a custom domain to your R2 bucket:**
   - Go to R2 bucket settings
   - Add a custom domain (e.g., `files.yourdomain.com`)
2. **Update environment variable:**
   ```env
   R2_PUBLIC_URL=https://files.yourdomain.com
   ```

### Option 3: Keep Bucket Private (Current Setup)

If you want to keep your bucket private, the current implementation already supports this:

1. **Files are uploaded to R2** (private)
2. **Files are accessed via API route:** `/api/admin/download-file?url=...`
3. **The RegistrationsTable component** has been updated to use separate View and Download buttons

## Testing the Configuration

1. **Check R2 Configuration:**

   ```bash
   curl http://localhost:3000/api/admin/check-config
   ```

2. **Test File Upload:**
   - Register for an online event
   - Upload a file
   - Check the registration table in admin panel
   - Click "View" or "Download" button

## Current Implementation Status

✅ **Fixed Issues:**

- Separated View and Download buttons in RegistrationsTable
- Added better error handling in download-file route
- Added logging for debugging upload and download issues
- Added configuration check endpoint

✅ **What's Working:**

- File upload to R2 storage
- File URL stored in database
- API proxy route for file downloads

⚠️ **What Needs Configuration:**

- R2_PUBLIC_URL environment variable (if using public bucket)
- R2 bucket public access settings (optional)

## Debugging

If files still don't show:

1. **Check browser console** for any JavaScript errors
2. **Check server logs** when uploading files
3. **Verify the URL** stored in database matches expected format
4. **Test the download API directly:**
   ```
   http://localhost:3000/api/admin/download-file?url=YOUR_FILE_URL
   ```

## Environment Variables Required

```env
# Required
R2_ACCOUNT_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=your-bucket-name

# Optional (for public access)
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

## Files Modified

- `/components/RegistrationsTable.tsx` - Updated file viewing logic
- `/app/api/admin/download-file/route.ts` - Enhanced error handling
- `/app/api/admin/check-config/route.ts` - New config check endpoint
- `/lib/r2-storage.ts` - Added logging
- `/app/api/register/route.ts` - Added logging

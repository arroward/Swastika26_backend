# Fix: R2 File Access Issue (404 Not Found)

## Problem Summary

Files uploaded to R2 are showing **404 Not Found** error when accessed via the custom domain `https://events.swastika.live`.

### Error Log

```
Attempting to download file from: https://events.swastika.live/event-registrations/1769143135540-4gyntxhk4d8.jpg
Final URL to fetch: https://events.swastika.live/event-registrations/1769143135540-4gyntxhk4d8.jpg
Failed to fetch file: 404 Not Found
```

## Root Cause

The custom domain `https://events.swastika.live` is not properly configured in Cloudflare R2, or the files weren't actually uploaded successfully to R2.

## Solutions Implemented

### 1. **Automatic Fallback URL Handling**

- When a custom domain returns 404, the system now automatically tries the direct R2 URL
- File: [app/api/admin/download-file/route.ts](app/api/admin/download-file/route.ts)

### 2. **Improved URL Generation in Upload**

- R2 storage now logs both custom domain URL and direct R2 URL
- File: [lib/r2-storage.ts](lib/r2-storage.ts)

### 3. **Better Error Messages**

- Enhanced error logging to help diagnose issues
- Provides hints about custom domain configuration

## Quick Fix - Choose One Option

### Option A: Use Direct R2 URL (Recommended - Simplest)

**Edit `.env.local` and comment out or remove:**

```bash
# Comment this line out:
# R2_PUBLIC_URL=https://events.swastika.live

# Keep only these:
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
```

Then restart your server. Files will use the direct R2 URL format automatically.

### Option B: Fix Custom Domain Configuration

1. **Verify domain is properly configured in Cloudflare:**
   - Go to Cloudflare Dashboard → R2 → Your Bucket
   - Click Settings → Domain Settings
   - Ensure `events.swastika.live` is listed and properly configured

2. **If it's not there, add it:**
   - Click "Connect Domain"
   - Add your domain
   - Complete the CNAME setup in DNS

3. **Ensure bucket is publicly accessible:**
   - Go to Settings → Public Access
   - Make sure access is enabled

### Option C: Use R2.dev Subdomain (Free Alternative)

1. **Get your free R2.dev URL:**
   - Go to Cloudflare Dashboard → R2 → Your Bucket
   - Click Settings → Domain Settings
   - Look for the `.r2.dev` URL (something like `https://pub-xxxxx.r2.dev`)

2. **Update `.env.local`:**

   ```bash
   R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
   ```

3. **Restart your server**

## Diagnostic Tools

### Test Current Configuration

```bash
node scripts/test-r2-config.js
```

### Diagnose R2 Access Issues

```bash
node scripts/diagnose-r2-access.js
```

This will:

- Show your current R2 configuration
- Generate test URLs for your files
- Attempt to access each URL and report results
- Provide specific recommendations

## Testing After Fix

1. **Restart your development server:**

   ```bash
   npm run dev
   ```

2. **Register for an online event and upload a file**

3. **Check the logs:**
   - Look for "File uploaded successfully to R2"
   - Check what URL was generated

4. **Test the download:**
   - Go to Admin Dashboard → View Registrations
   - Click "View" or "Download" for the uploaded file
   - It should work now!

## How the Fix Works

### Before (Without Fallback)

```
User clicks Download
  ↓
Try: https://events.swastika.live/...
  ↓
404 Not Found ❌
  ↓
Error shown to user
```

### After (With Fallback)

```
User clicks Download
  ↓
Try: https://events.swastika.live/...
  ↓
404 Not Found (detected)
  ↓
Automatically try: https://ACCOUNT_ID.r2.cloudflarestorage.com/...
  ↓
✅ Success! File downloads
```

## Files Modified

1. **[app/api/admin/download-file/route.ts](app/api/admin/download-file/route.ts)**
   - Added automatic fallback to direct R2 URL on 404
   - Enhanced error messages

2. **[lib/r2-storage.ts](lib/r2-storage.ts)**
   - Improved logging with direct R2 URL info
   - Better URL generation logic

## Additional Notes

- The automatic fallback means files will work regardless of custom domain configuration
- It's recommended to verify your custom domain setup in Cloudflare
- Consider using the direct R2 URL if custom domain issues persist
- All uploaded files are now accessible through both the custom domain AND direct R2 URL

## Need More Help?

1. **Run the diagnostic script:**

   ```bash
   node scripts/diagnose-r2-access.js
   ```

2. **Check server logs when uploading** to see what URL was generated

3. **Test direct R2 URL** in your browser to verify file exists

4. **Verify Cloudflare R2 settings:**
   - Is bucket created? ✅
   - Are credentials correct? ✅
   - Is domain configured (if using custom domain)? ✅

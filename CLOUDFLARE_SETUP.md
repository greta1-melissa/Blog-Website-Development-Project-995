# Cloudflare Pages Setup Guide

For your blog posts to be saved and visible to everyone, you must configure the environment variables in Cloudflare.

## 1. Get Your Secrets
Ensure you have these values ready:
- `VITE_NCB_URL`: (Usually `https://openapi.nocodebackend.com`)
- `VITE_NCB_INSTANCE`: Your specific Instance ID
- `VITE_NCB_API_KEY`: Your private API Key
- `DROPBOX_ACCESS_TOKEN`: (Optional) If using Dropbox for images

## 2. Go to Cloudflare Dashboard
1. Log in to Cloudflare.
2. Go to **Pages & Workers**.
3. Click on your project (`bangtan-mom-blog`).
4. Click **Settings** (top tabs).
5. Click **Environment variables** (left sidebar).

## 3. Add Variables for Production
Click **Add variable** for each of the following. Ensure they are added to the **Production** environment (and Preview if you want them there too).

| Variable Name | Value |
|---------------|-------|
| `VITE_NCB_URL` | `https://openapi.nocodebackend.com` |
| `VITE_NCB_INSTANCE` | *Your Instance ID* |
| `VITE_NCB_API_KEY` | *Your API Key* |
| `DROPBOX_ACCESS_TOKEN` | *Your Dropbox Token* (Optional) |

## 4. Redeploy
**Crucial Step:** After adding the variables, you must trigger a **new deployment** for them to take effect.
1. Go to the **Deployments** tab.
2. Click the three dots `...` next to your latest deployment.
3. Select **Retry deployment**.

Once redeployed, the application will be able to connect to NoCodeBackend and your posts will be visible to everyone!
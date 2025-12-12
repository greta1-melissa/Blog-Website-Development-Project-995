# Cloudflare Pages Setup Guide

## 1. Environment Variables (Critical for Proxy)

Since we switched to a secure server-side proxy, the API Key is no longer exposed to the browser.
You must configure these variables in the **Cloudflare Dashboard** under **Settings > Environment variables**.

| Variable Name | Value | Required? |
|---------------|-------|-----------|
| `NCB_URL` | `https://api.nocodebackend.com` | **YES** |
| `NCB_API_KEY` | *Your Secret API Key* | **YES** |
| `VITE_NCB_INSTANCE` | *Your Instance ID* | **YES** (Used by client) |
| `DROPBOX_ACCESS_TOKEN` | *Your Dropbox Token* | Optional |

> **Note:** `VITE_NCB_API_KEY` is deprecated but supported as a fallback for `NCB_API_KEY` if already set.

## 2. Redeploy
After adding `NCB_API_KEY` and `NCB_URL`, you **must trigger a new deployment** (Retry deployment) for the Functions to pick up the new variables.

## 3. Verify
Go to `/admin` -> **System Status** and click **Run Test** under Proxy Read/Write to confirm the connection works.
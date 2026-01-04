# Cloudflare Pages Setup Guide

## 1. Environment Variables (Critical for Data Persistence)
Since we use a secure server-side proxy for NCB and Dropbox, these variables must be configured in the **Cloudflare Dashboard** under **Settings > Environment variables**.

### NoCodeBackend (NCB) Settings
| Variable Name | Value | Required? |
|---------------|-------|-----------|
| `NCB_URL` | `https://api.nocodebackend.com` | **YES** |
| `NCB_API_KEY` | *Your Secret API Key* | **YES** |
| `NCB_INSTANCE` | `54230_bangtan_mom_blog_site` | **YES** (Server Fail-safe) |
| `VITE_NCB_INSTANCE` | `54230_bangtan_mom_blog_site` | **YES** (Frontend Client) |

**Difference between the two Instance variables:**
- **`VITE_NCB_INSTANCE`**: Exported to the browser. Used by the frontend client to build standard URLs.
- **`NCB_INSTANCE`**: Private to the server. Used by the proxy as a fail-safe if the browser fails to send an ID (common in incognito or direct API calls).

### Dropbox Settings
| Variable Name | Value | Required? |
|---------------|-------|-----------|
| `DROPBOX_APP_KEY` | *Your App Key* | **YES** |
| `DROPBOX_APP_SECRET` | *Your App Secret* | **YES** |
| `DROPBOX_REFRESH_TOKEN` | *Your Refresh Token* | **YES** |

## 2. Admin Credentials (Security)
To override the default admin credentials without changing the code:
| Variable Name | Value | Description |
|---------------|-------|-------------|
| `VITE_ADMIN_USERNAME` | *your_username* | Custom admin username |
| `VITE_ADMIN_PASSWORD` | *your_secure_password* | Custom admin password |
| `VITE_ADMIN_EMAIL` | *your_email@domain.com* | Custom admin email |

## 3. Redeploy
After adding or changing these variables, you **must trigger a new deployment** (Retry deployment) for the Functions to pick up the new environment state.

## 4. Verification
1. Go to `/admin` -> **System Status**.
2. Click **Run Test** under NCB Schema Validator.
3. Ensure the `Instance` reported in the result matches `54230_bangtan_mom_blog_site`.
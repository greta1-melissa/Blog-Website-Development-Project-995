import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if (typeof window !== "undefined") {
  window.migratePostsToNewNCB = async ({ dryRun = true, sourceInstance = "54230_bangtan_mom_blog_site" } = {}) => {
    const confirmText = prompt(`Type MIGRATE to copy posts from ${sourceInstance} into CURRENT NCB (dryRun=${dryRun})`);
    if (confirmText !== "MIGRATE") return { ok: false, cancelled: true };

    const res = await fetch("/api/migrate/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dryRun, sourceInstance }),
    });

    const json = await res.json().catch(() => ({}));
    console.log("Migration result:", json);
    return json;
  };
}
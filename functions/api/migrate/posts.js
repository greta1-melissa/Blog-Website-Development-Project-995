export async function onRequest(context) {
  const { request, env } = context;

  // CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const body = await request.json().catch(() => ({}));
  const dryRun = body.dryRun !== false; // default true
  const sourceInstance = (body.sourceInstance || "54230_bangtan_mom_blog_site").trim();

  // Target instance = your CURRENT (new) instance from env (do not hardcode)
  const targetInstance =
    env.VITE_NCB_INSTANCE || env.VITE_NCB_INSTANCE_ID || env.NCB_INSTANCE;

  const ncbBase = env.NCB_URL || env.NCB_BASE_URL || "https://api.nocodebackend.com";
  const apiKey = env.NCB_API_KEY || env.VITE_NCB_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ ok: false, error: "Missing NCB_API_KEY in env" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
  if (!targetInstance) {
    return new Response(JSON.stringify({ ok: false, error: "Missing target NCB instance in env" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const toJson = async (res) => {
    const text = await res.text();
    let json = {};
    try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

    // Some proxies/upstreams return HTTP 200 with an error body
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
    if (json && json.ok === false) {
      throw new Error(json.error || json.message || json.upstreamPreview || "ok:false");
    }
    if (json && String(json.status || "").toLowerCase() === "failed") {
      throw new Error(json.error || json.message || "status:failed");
    }
    return json;
  };

  const rowsFrom = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    if (payload && payload.status === "success" && Array.isArray(payload.data)) return payload.data;
    return [];
  };

  const slugify = (s) =>
    String(s || "")
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Conservative allowlist to avoid inserting fields that don't exist in your NEW table
  const ALLOW = [
    "title", "slug", "excerpt", "content",
    "author", "category", "status",
    "date", "published_date", "published_at",
    "tags",
    "image", "image_url", "featured_image_url", "featured_image_dropbox_url"
  ];

  const buildPayload = (row) => {
    const title = row.title || row.post_title || row.name || "";
    const slug = row.slug || row.post_slug || slugify(title);

    const mapped = {
      title,
      slug,
      excerpt: row.excerpt || row.summary || "",
      content: row.content || row.body || row.html || "",
      author: row.author || "BangtanMom",
      category: row.category || row.category_name || "",
      status: (row.status || "published").toString().toLowerCase(),
      date: row.date || row.published_date || row.published_at || "",
      published_date: row.published_date || "",
      published_at: row.published_at || "",
      tags: row.tags || "",
      image: row.image || "",
      image_url: row.image_url || "",
      featured_image_url: row.featured_image_url || row.image_url || row.image || "",
      featured_image_dropbox_url: row.featured_image_dropbox_url || "",
    };

    const out = {};
    for (const k of ALLOW) {
      const v = mapped[k];
      if (v === undefined || v === null) continue;
      // keep empty excerpt allowed; skip other empty strings
      if (typeof v === "string" && v.trim() === "" && k !== "excerpt") continue;
      out[k] = v;
    }

    // NEVER send IDs (avoid collisions)
    delete out.id;
    delete out.ID;
    delete out._id;
    return out;
  };

  try {
    // Read source posts
    const srcUrl = new URL(`${ncbBase}/read/posts`);
    srcUrl.searchParams.set("Instance", sourceInstance);
    srcUrl.searchParams.set("limit", "2000");

    const srcRes = await fetch(srcUrl.toString(), { method: "GET", headers });
    const srcJson = await toJson(srcRes);
    const sourcePosts = rowsFrom(srcJson);

    // Read target posts (for dedupe)
    const tgtUrl = new URL(`${ncbBase}/read/posts`);
    tgtUrl.searchParams.set("Instance", targetInstance);
    tgtUrl.searchParams.set("limit", "2000");

    const tgtRes = await fetch(tgtUrl.toString(), { method: "GET", headers });
    const tgtJson = await toJson(tgtRes);
    const targetPosts = rowsFrom(tgtJson);

    const existingSlugs = new Set(
      targetPosts.map((p) => String(p.slug || "").toLowerCase()).filter(Boolean)
    );

    let wouldCreate = 0;
    let created = 0;
    let skipped = 0;
    const errors = [];

    for (const row of sourcePosts) {
      const payload = buildPayload(row);
      const slugKey = String(payload.slug || "").toLowerCase();

      if (!payload.title || !payload.slug) {
        errors.push({ error: "Missing title/slug", payload });
        continue;
      }

      if (existingSlugs.has(slugKey)) {
        skipped++;
        continue;
      }

      if (dryRun) {
        wouldCreate++;
        existingSlugs.add(slugKey);
        continue;
      }

      const createUrl = new URL(`${ncbBase}/create/posts`);
      createUrl.searchParams.set("Instance", targetInstance);

      const createRes = await fetch(createUrl.toString(), {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      await toJson(createRes);

      created++;
      existingSlugs.add(slugKey);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        dryRun,
        sourceInstance,
        targetInstance,
        sourceCount: sourcePosts.length,
        created: dryRun ? wouldCreate : created,
        skipped,
        errors,
      }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}
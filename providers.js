// প্রতিটি টুল: e=ENV key তালিকা, b=base URL, t=টেস্ট পাথ, m=method, d=body, h=হেডার
// {ENV_NAME} টেমপ্লেট আপনা-আপনি .env থেকে বসে যায়।
const B = v => e => ({ Authorization: "Bearer " + e[v] });
const BA = (a, b) => e => ({ Authorization: "Basic " + Buffer.from(e[a] + ":" + e[b]).toString("base64") });
const X = (n, v) => e => ({ [n]: e[v] });
const GG = B("GOOGLE_ACCESS_TOKEN");
const G = "https://graph.facebook.com/v21.0", META = B("META_ACCESS_TOKEN");
const PP = process.env.PAYPAL_BASE || "https://api-m.paypal.com";
const BK = process.env.BKASH_BASE || "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
const CF = { e: ["CLOUDFLARE_API_TOKEN"], b: "https://api.cloudflare.com/client/v4", t: "/user/tokens/verify", h: B("CLOUDFLARE_API_TOKEN") };
const GH = { e: ["GITHUB_TOKEN"], b: "https://api.github.com", t: "/rate_limit", h: e => ({ Authorization: "Bearer " + e.GITHUB_TOKEN, "User-Agent": "aqua-hub", Accept: "application/vnd.github+json" }) };

module.exports = {
  // ---- Source Code
  "GitHub": { ...GH, t: "/user" },
  "GitLab": { e: ["GITLAB_TOKEN"], b: "https://gitlab.com/api/v4", t: "/user", h: X("PRIVATE-TOKEN", "GITLAB_TOKEN") },
  "Bitbucket": { e: ["BITBUCKET_USER", "BITBUCKET_APP_PASSWORD"], b: "https://api.bitbucket.org/2.0", t: "/user", h: BA("BITBUCKET_USER", "BITBUCKET_APP_PASSWORD") },
  "Azure Repos": { e: ["AZURE_DEVOPS_ORG", "AZURE_DEVOPS_PAT"], b: "https://dev.azure.com/{AZURE_DEVOPS_ORG}", t: "/_apis/projects?api-version=7.1", h: e => ({ Authorization: "Basic " + Buffer.from(":" + e.AZURE_DEVOPS_PAT).toString("base64") }) },
  "Gitea": { e: ["GITEA_URL", "GITEA_TOKEN"], b: "{GITEA_URL}/api/v1", t: "/user", h: e => ({ Authorization: "token " + e.GITEA_TOKEN }) },
  // ---- Deploy
  "Vercel": { e: ["VERCEL_TOKEN"], b: "https://api.vercel.com", t: "/v2/user", h: B("VERCEL_TOKEN") },
  "Netlify": { e: ["NETLIFY_TOKEN"], b: "https://api.netlify.com/api/v1", t: "/user", h: B("NETLIFY_TOKEN") },
  "Cloudflare Pages": CF,
  "Firebase Hosting": { e: ["GOOGLE_ACCESS_TOKEN", "FIREBASE_PROJECT_ID"], b: "https://firebasehosting.googleapis.com/v1beta1", t: "/projects/{FIREBASE_PROJECT_ID}/sites", h: GG },
  "Render": { e: ["RENDER_API_KEY"], b: "https://api.render.com/v1", t: "/services?limit=1", h: B("RENDER_API_KEY") },
  "Railway": { e: ["RAILWAY_TOKEN"], b: "https://backboard.railway.app/graphql/v2", t: "", m: "POST", d: { query: "{me{name}}" }, h: B("RAILWAY_TOKEN") },
  "Fly.io": { e: ["FLY_API_TOKEN"], b: "https://api.fly.io/graphql", t: "", m: "POST", d: { query: "{viewer{id}}" }, h: B("FLY_API_TOKEN") },
  // ---- Database
  "Supabase": { e: ["SUPABASE_ACCESS_TOKEN"], b: "https://api.supabase.com/v1", t: "/projects", h: B("SUPABASE_ACCESS_TOKEN") },
  "MongoDB Atlas": { e: ["ATLAS_PUBLIC_KEY", "ATLAS_PRIVATE_KEY"] }, // Digest auth: নিচে TODO দেখুন
  "PlanetScale": { e: ["PLANETSCALE_SERVICE_TOKEN_ID", "PLANETSCALE_SERVICE_TOKEN"], b: "https://api.planetscale.com/v1", t: "/organizations", h: e => ({ Authorization: e.PLANETSCALE_SERVICE_TOKEN_ID + ":" + e.PLANETSCALE_SERVICE_TOKEN }) },
  "Firebase DB": { e: ["GOOGLE_ACCESS_TOKEN", "FIREBASE_DB_URL"], b: "{FIREBASE_DB_URL}", t: "/.json?shallow=true", h: GG },
  "Neon": { e: ["NEON_API_KEY"], b: "https://console.neon.tech/api/v2", t: "/projects?limit=1", h: B("NEON_API_KEY") },
  "Redis Cloud": { e: ["REDIS_CLOUD_API_KEY", "REDIS_CLOUD_SECRET"], b: "https://api.redislabs.com/v1", t: "/subscriptions", h: e => ({ "x-api-key": e.REDIS_CLOUD_API_KEY, "x-api-secret": e.REDIS_CLOUD_SECRET }) },
  "Turso": { e: ["TURSO_API_TOKEN"], b: "https://api.turso.tech/v1", t: "/organizations", h: B("TURSO_API_TOKEN") },
  // ---- Backend & API
  "Firebase": { e: ["GOOGLE_ACCESS_TOKEN", "FIREBASE_PROJECT_ID"], b: "https://firebase.googleapis.com/v1beta1", t: "/projects/{FIREBASE_PROJECT_ID}", h: GG },
  "Appwrite": { e: ["APPWRITE_ENDPOINT", "APPWRITE_PROJECT_ID", "APPWRITE_API_KEY"], b: "{APPWRITE_ENDPOINT}", t: "/users?limit=1", h: e => ({ "X-Appwrite-Project": e.APPWRITE_PROJECT_ID, "X-Appwrite-Key": e.APPWRITE_API_KEY }) },
  "AWS Lambda": { e: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"], aws: true },
  "Hasura": { e: ["HASURA_URL", "HASURA_ADMIN_SECRET"], b: "{HASURA_URL}", t: "/v1/version", h: X("x-hasura-admin-secret", "HASURA_ADMIN_SECRET") },
  "Postman": { e: ["POSTMAN_API_KEY"], b: "https://api.getpostman.com", t: "/me", h: X("X-API-Key", "POSTMAN_API_KEY") },
  "Zapier": { e: ["ZAPIER_API_KEY"] },
  "n8n": { e: ["N8N_URL", "N8N_API_KEY"], b: "{N8N_URL}/api/v1", t: "/workflows?limit=1", h: X("X-N8N-API-KEY", "N8N_API_KEY") },
  // ---- Server & Cloud
  "AWS": { e: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"], aws: true },
  "Google Cloud": { e: ["GOOGLE_ACCESS_TOKEN"], b: "https://cloudresourcemanager.googleapis.com/v1", t: "/projects?pageSize=1", h: GG },
  "Azure": { e: ["AZURE_ACCESS_TOKEN"], b: "https://management.azure.com", t: "/subscriptions?api-version=2022-12-01", h: B("AZURE_ACCESS_TOKEN") },
  "DigitalOcean": { e: ["DIGITALOCEAN_TOKEN"], b: "https://api.digitalocean.com/v2", t: "/account", h: B("DIGITALOCEAN_TOKEN") },
  "Hetzner": { e: ["HETZNER_TOKEN"], b: "https://api.hetzner.cloud/v1", t: "/servers?per_page=1", h: B("HETZNER_TOKEN") },
  "Linode": { e: ["LINODE_TOKEN"], b: "https://api.linode.com/v4", t: "/profile", h: B("LINODE_TOKEN") },
  "Server SSH": { e: ["SSH_HOST", "SSH_USER", "SSH_PRIVATE_KEY"], ssh: true },
  // ---- Payments
  "Stripe": { e: ["STRIPE_SECRET_KEY"], b: "https://api.stripe.com/v1", t: "/balance", h: B("STRIPE_SECRET_KEY") },
  "PayPal": { e: ["PAYPAL_CLIENT_ID", "PAYPAL_SECRET"], b: PP, t: "/v1/identity/openidconnect/userinfo?schema=openid",
    h: async e => { const r = await fetch(PP + "/v1/oauth2/token", { method: "POST", headers: { Authorization: "Basic " + Buffer.from(e.PAYPAL_CLIENT_ID + ":" + e.PAYPAL_SECRET).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" }); return { Authorization: "Bearer " + (await r.json()).access_token }; } },
  "bKash": { e: ["BKASH_USERNAME", "BKASH_PASSWORD", "BKASH_APP_KEY", "BKASH_APP_SECRET"], b: BK, t: "/tokenized/checkout/token/grant", m: "POST",
    d: { app_key: process.env.BKASH_APP_KEY, app_secret: process.env.BKASH_APP_SECRET }, h: e => ({ username: e.BKASH_USERNAME, password: e.BKASH_PASSWORD }) },
  "Nagad": { e: ["NAGAD_MERCHANT_ID", "NAGAD_PUBLIC_KEY", "NAGAD_PRIVATE_KEY"] },       // RSA সাইন লাগে: TODO
  "SSLCommerz": { e: ["SSLCOMMERZ_STORE_ID", "SSLCOMMERZ_STORE_PASSWORD"] },           // প্রতি-ট্রান্সজাকশন API: TODO
  "Razorpay": { e: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"], b: "https://api.razorpay.com/v1", t: "/payments?count=1", h: BA("RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET") },
  "Paddle": { e: ["PADDLE_API_KEY"], b: "https://api.paddle.com", t: "/event-types", h: B("PADDLE_API_KEY") },
  // ---- Meta
  "Meta Ads": { e: ["META_ACCESS_TOKEN"], b: G, t: "/me/adaccounts?limit=1", h: META },
  "Business Suite": { e: ["META_ACCESS_TOKEN"], b: G, t: "/me/businesses?limit=1", h: META },
  "Facebook Pages": { e: ["META_ACCESS_TOKEN"], b: G, t: "/me/accounts?limit=1", h: META },
  "Instagram API": { e: ["META_ACCESS_TOKEN", "INSTAGRAM_USER_ID"], b: G, t: "/{INSTAGRAM_USER_ID}?fields=username", h: META },
  "WhatsApp Cloud": { e: ["META_ACCESS_TOKEN", "WHATSAPP_PHONE_ID"], b: G, t: "/{WHATSAPP_PHONE_ID}", h: META },
  "Messenger": { e: ["META_ACCESS_TOKEN"], b: G, t: "/me/accounts?limit=1", h: META },
  "Pixel & CAPI": { e: ["META_ACCESS_TOKEN", "META_PIXEL_ID"], b: G, t: "/{META_PIXEL_ID}?fields=name", h: META },
  "Threads": { e: ["THREADS_ACCESS_TOKEN"], b: "https://graph.threads.net/v1.0", t: "/me", h: B("THREADS_ACCESS_TOKEN") },
  // ---- Domain & DNS
  "Cloudflare": CF,
  "Namecheap": { e: ["NAMECHEAP_API_USER", "NAMECHEAP_API_KEY"] },                     // XML API: TODO
  "GoDaddy": { e: ["GODADDY_KEY", "GODADDY_SECRET"], b: "https://api.godaddy.com/v1", t: "/domains?limit=1", h: e => ({ Authorization: `sso-key ${e.GODADDY_KEY}:${e.GODADDY_SECRET}` }) },
  "Google Domains": { e: ["GOOGLE_ACCESS_TOKEN"], b: "https://domains.googleapis.com/v1", t: "/projects/{FIREBASE_PROJECT_ID}/locations/global/registrations", h: GG },
  // ---- Auth & Security
  "Auth0": { e: ["AUTH0_DOMAIN", "AUTH0_MGMT_TOKEN"], b: "https://{AUTH0_DOMAIN}/api/v2", t: "/clients?per_page=1", h: B("AUTH0_MGMT_TOKEN") },
  "Clerk": { e: ["CLERK_SECRET_KEY"], b: "https://api.clerk.com/v1", t: "/users?limit=1", h: B("CLERK_SECRET_KEY") },
  "Firebase Auth": { e: ["GOOGLE_ACCESS_TOKEN", "FIREBASE_PROJECT_ID"], b: "https://identitytoolkit.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}", t: "/accounts:query", m: "POST", d: { limit: "1" }, h: GG },
  "reCAPTCHA": { e: ["RECAPTCHA_SECRET"] },
  // ---- Storage & Media
  "AWS S3": { e: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"], aws: true },
  "Cloudinary": { e: ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"], b: "https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}", t: "/usage", h: BA("CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET") },
  "Backblaze B2": { e: ["B2_KEY_ID", "B2_APP_KEY"], b: "https://api.backblazeb2.com", t: "/b2api/v3/b2_authorize_account", h: BA("B2_KEY_ID", "B2_APP_KEY") },
  "Uploadthing": { e: ["UPLOADTHING_SECRET"], b: "https://api.uploadthing.com/v6", t: "/listFiles", m: "POST", d: { limit: 1 }, h: X("x-uploadthing-api-key", "UPLOADTHING_SECRET") },
  // ---- Messaging
  "Twilio": { e: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"], b: "https://api.twilio.com/2010-04-01", t: "/Accounts/{TWILIO_ACCOUNT_SID}.json", h: BA("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN") },
  "SendGrid": { e: ["SENDGRID_API_KEY"], b: "https://api.sendgrid.com/v3", t: "/user/profile", h: B("SENDGRID_API_KEY") },
  "Resend": { e: ["RESEND_API_KEY"], b: "https://api.resend.com", t: "/domains", h: B("RESEND_API_KEY") },
  "OneSignal": { e: ["ONESIGNAL_USER_KEY"], b: "https://api.onesignal.com", t: "/apps", h: e => ({ Authorization: "Key " + e.ONESIGNAL_USER_KEY }) },
  "Telegram Bot": { e: ["TELEGRAM_BOT_TOKEN"], b: "https://api.telegram.org", t: "/bot{TELEGRAM_BOT_TOKEN}/getMe" },
  // ---- AI
  "Claude API": { e: ["ANTHROPIC_API_KEY"], b: "https://api.anthropic.com/v1", t: "/models", h: e => ({ "x-api-key": e.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" }) },
  "OpenAI": { e: ["OPENAI_API_KEY"], b: "https://api.openai.com/v1", t: "/models", h: B("OPENAI_API_KEY") },
  "Gemini": { e: ["GEMINI_API_KEY"], b: "https://generativelanguage.googleapis.com/v1beta", t: "/models?key={GEMINI_API_KEY}" },
  "Hugging Face": { e: ["HF_TOKEN"], b: "https://huggingface.co/api", t: "/whoami-v2", h: B("HF_TOKEN") },
  // ---- DevOps
  "GitHub Actions": GH,
  "Docker Hub": { e: ["DOCKERHUB_USER", "DOCKERHUB_TOKEN"] },                          // login→JWT ফ্লো: TODO
  "Sentry": { e: ["SENTRY_AUTH_TOKEN"], b: "https://sentry.io/api/0", t: "/organizations/", h: B("SENTRY_AUTH_TOKEN") },
  "Datadog": { e: ["DD_API_KEY"], b: "https://api.datadoghq.com/api/v1", t: "/validate", h: X("DD-API-KEY", "DD_API_KEY") },
  "Grafana": { e: ["GRAFANA_URL", "GRAFANA_TOKEN"], b: "{GRAFANA_URL}/api", t: "/org", h: B("GRAFANA_TOKEN") },
  // ---- Analytics & SEO
  "Google Analytics": { e: ["GOOGLE_ACCESS_TOKEN"], b: "https://analyticsadmin.googleapis.com/v1beta", t: "/accountSummaries?pageSize=1", h: GG },
  "Search Console": { e: ["GOOGLE_ACCESS_TOKEN"], b: "https://searchconsole.googleapis.com/webmasters/v3", t: "/sites", h: GG },
  "Google Ads": { e: ["GOOGLE_ACCESS_TOKEN", "GOOGLE_ADS_DEV_TOKEN"], b: "https://googleads.googleapis.com/v17", t: "/customers:listAccessibleCustomers", h: e => ({ Authorization: "Bearer " + e.GOOGLE_ACCESS_TOKEN, "developer-token": e.GOOGLE_ADS_DEV_TOKEN }) },
  "TikTok Ads": { e: ["TIKTOK_ACCESS_TOKEN"], b: "https://business-api.tiktok.com/open_api/v1.3", t: "/user/info/", h: X("Access-Token", "TIKTOK_ACCESS_TOKEN") },
  "Mixpanel": { e: ["MIXPANEL_SA_USER", "MIXPANEL_SA_SECRET"], b: "https://mixpanel.com/api/app", t: "/me", h: BA("MIXPANEL_SA_USER", "MIXPANEL_SA_SECRET") }
};

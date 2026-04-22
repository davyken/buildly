# 🏗️ Buildly API

Production-grade NestJS backend for the **Buildly** no-code website builder.
Handles auth, site storage, publishing, forms, assets, custom domains and templates.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 (Node.js) |
| Database | MongoDB Atlas |
| Cache | Redis (Upstash in production) |
| Job Queue | BullMQ (runs on Redis) |
| Auth | JWT — 15 min access + 30 day refresh |
| Email | Resend |
| Asset Storage | Cloudinary |
| Rate Limiting | @nestjs/throttler |

---

## 🚀 Quick Start

### 1. Install
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in MONGODB_URI and JWT secrets at minimum
```

**Minimum for local dev (everything else has fallbacks):**
```env
MONGODB_URI=mongodb://localhost:27017/buildly
JWT_ACCESS_SECRET=any_long_random_string
JWT_REFRESH_SECRET=another_long_random_string
```

### 3. Run
```bash
# Development (hot reload)
npm run start:dev

# Production build
npm run build && npm run start:prod
```

API available at: `http://localhost:3000/api/v1`

---

## ⚡ First Request

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"password123","name":"Your Name"}'

# → { "data": { "accessToken": "...", "refreshToken": "...", "user": {...} } }

# Create a site
curl -X POST http://localhost:3000/api/v1/sites \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My First Site"}'
```

---

## 📋 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Create account |
| POST | `/auth/login` | ❌ | Login → tokens |
| POST | `/auth/refresh` | 🔄 | New access token |
| POST | `/auth/logout` | ✅ | Invalidate session |
| GET | `/auth/me` | ✅ | Current user profile |

### Sites
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/sites` | ✅ | List your sites |
| POST | `/sites` | ✅ | Create new site |
| GET | `/sites/:id` | ✅ | Get full site data |
| PATCH | `/sites/:id` | ✅ | Auto-save draft |
| DELETE | `/sites/:id` | ✅ | Delete site |
| POST | `/sites/:id/duplicate` | ✅ | Clone site |
| GET | `/sites/public/:slug` | ❌ | Renderer reads this |
| GET | `/sites/domain/:hostname` | ❌ | Domain → site lookup |

### Pages
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/sites/:id/pages` | ✅ | Add page |
| DELETE | `/sites/:id/pages/:pageId` | ✅ | Delete page |

### History
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/sites/:id/versions` | ✅ | List saved versions |
| POST | `/sites/:id/versions/save` | ✅ | Save snapshot |
| POST | `/sites/:id/versions/:vId/restore` | ✅ | Restore version |

### Publish
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/sites/:id/publish` | ✅ | Queue publish job |
| POST | `/sites/:id/unpublish` | ✅ | Take offline |
| GET | `/sites/:id/publish-info` | ✅ | Status + public URL |
| GET | `/publish/jobs/:jobId` | ✅ | Poll job progress |

### Forms
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/forms/submit/:slug/:formId` | ❌ | Visitor submits form |
| GET | `/sites/:id/submissions` | ✅ | View inbox |
| PATCH | `/submissions/:id/read` | ✅ | Mark read |
| DELETE | `/submissions/:id` | ✅ | Delete |

### Assets
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/assets/upload` | ✅ | Upload image (multipart) |
| GET | `/assets` | ✅ | List images |
| DELETE | `/assets/:publicId` | ✅ | Delete image |

### Domains
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/sites/:id/domain` | ✅ | Connect custom domain |
| GET | `/sites/:id/domain` | ✅ | Domain status |
| GET | `/sites/:id/domain/verify` | ✅ | Check DNS propagation |
| DELETE | `/sites/:id/domain` | ✅ | Disconnect domain |
| GET | `/domains/tls-verify?domain=x` | ❌ | Caddy TLS hook |

### Templates
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/templates` | ❌ | List templates |
| POST | `/templates/:id/use` | ✅ | Clone as new site |

### Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | ❌ | Server + DB status |

---

## 🔐 Auth Flow

```
POST /auth/register  →  { accessToken (15min), refreshToken (30d), user }

All protected requests:  Authorization: Bearer <accessToken>

When access token expires:
POST /auth/refresh   →  body: { refreshToken }  →  new tokens

POST /auth/logout    →  invalidates refresh token in DB
```

---

## 📊 Response Format

Every response is wrapped:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```
Errors:
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Site not found",
  "path": "/api/v1/sites/abc",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## 🏗️ Site JSON Structure

A site is a single MongoDB document — one JSON object = one whole website:

```json
{
  "_id": "...",
  "userId": "...",
  "name": "My Portfolio",
  "slug": "my-portfolio",
  "status": "draft | published",
  "customDomain": "mysite.com",
  "globalBackground": "#ffffff",
  "meta": {
    "title": "My Portfolio",
    "description": "...",
    "favicon": "...",
    "language": "en"
  },
  "pages": [
    {
      "id": "uuid",
      "name": "Home",
      "path": "/",
      "background": "#ffffff",
      "meta": { "title": "Home" },
      "elements": [
        {
          "id": "uuid",
          "type": "heading | text | image | button | box | divider | form | whatsapp-button | navbar",
          "x": 100, "y": 200,
          "width": 400, "height": 80,
          "zIndex": 1,
          "content": "Hello World",
          "styles": { "fontSize": "36px", "color": "#111111", "backgroundColor": "transparent" },
          "link": { "type": "internal | external | whatsapp | email", "value": "about", "openInNewTab": false },
          "formConfig": {
            "fields": [{ "id": "name", "label": "Full Name", "inputType": "text", "required": true }],
            "submitLabel": "Send",
            "recipientEmail": "owner@example.com",
            "successMessage": "Thanks!",
            "enableEmailConfirmation": true
          },
          "whatsappConfig": {
            "phone": "237600000000",
            "prefilledMessage": "Hello!",
            "floating": true
          },
          "visible": true,
          "locked": false
        }
      ]
    }
  ]
}
```

---

## 🌍 Deployment

### Railway (API)
```bash
npm install -g @railway/cli
railway login && railway init && railway up
# Set env vars in Railway dashboard
```

### Render (API alternative)
- Add `npm run build` as build command
- Add `npm run start:prod` as start command
- **Important**: Move `@types/node` to `dependencies` if Render fails on build

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/buildly
REDIS_URL=rediss://:password@host:port
JWT_ACCESS_SECRET=<64+ char random string — use: openssl rand -hex 32>
JWT_REFRESH_SECRET=<64+ char random string — use: openssl rand -hex 32>
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://app.yourdomain.com
RENDERER_URL=https://sites.yourdomain.com
APP_URL=https://api.yourdomain.com
```

---

## 📁 Project Structure

```
src/
├── auth/                   JWT auth — register, login, refresh, logout
│   ├── strategies/         jwt.strategy.ts, jwt-refresh.strategy.ts
│   ├── dto/                auth.dto.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── auth.module.ts
│
├── users/                  User schema, service, plan limits
│   ├── schemas/user.schema.ts
│   ├── users.service.ts
│   └── users.module.ts
│
├── sites/                  Full site CRUD, pages, versions, cache
│   ├── schemas/            site.schema.ts, version.schema.ts
│   ├── dto/site.dto.ts
│   ├── sites.service.ts    ← core logic + Redis cache
│   ├── sites.controller.ts
│   └── sites.module.ts
│
├── publish/                Async publish/unpublish via BullMQ
│   ├── processors/publish.processor.ts
│   ├── publish.service.ts
│   ├── publish.controller.ts
│   └── publish.module.ts
│
├── forms/                  Contact form submissions + Resend email
│   ├── schemas/submission.schema.ts
│   ├── forms.service.ts    ← spam protection, honeypot, email
│   ├── forms.controller.ts
│   └── forms.module.ts
│
├── assets/                 Cloudinary image upload/delete
│   ├── assets.service.ts
│   ├── assets.controller.ts
│   └── assets.module.ts
│
├── domains/                Custom domain CNAME verification + Caddy hook
│   ├── domains.service.ts
│   ├── domains.controller.ts
│   └── domains.module.ts
│
├── templates/              Starter templates + clone as site
│   ├── data/templates.data.ts   ← 3 built-in templates (Portfolio, Business, Blank)
│   ├── templates.service.ts
│   ├── templates.controller.ts
│   └── templates.module.ts
│
├── health/                 GET /health — MongoDB + uptime status
│   └── health.module.ts
│
├── config/                 configuration.ts — typed env config factory
│
├── common/
│   ├── decorators/         @CurrentUser(), @Public()
│   ├── filters/            AllExceptionsFilter — consistent error shape
│   ├── guards/             JwtAuthGuard — global, opt-out with @Public()
│   └── interceptors/       ResponseInterceptor — wraps all responses
│
├── app.module.ts           Root module — wires everything together
└── main.ts                 Bootstrap — CORS, validation, security headers
```

---

## 🛡️ Security Built In

- JWT access tokens expire in **15 minutes**
- Refresh tokens hashed in DB — stolen token = useless
- **Rate limiting** on every endpoint (configurable per route)
- **Honeypot field** on all form submissions (silent bot rejection)
- **IP-based spam protection** on forms (max 3/hour/IP/form)
- `whitelist: true` on ValidationPipe — strips unknown fields from all requests
- Security headers on every response (`X-Content-Type-Options`, `X-Frame-Options`, etc.)
- File uploads: type + size validated before touching Cloudinary
- All DB queries scoped to `userId` — no cross-user data leaks

---

## 🔄 How Auto-Save Works

The frontend debounces saves by 2 seconds:
```
User stops dragging/typing
  → 2 seconds pass
  → PATCH /sites/:id  { pages: [...] }
  → API updates MongoDB
  → Invalidates Redis cache
  → Returns updated site
```

This means 50 users editing simultaneously = ~25 DB writes/minute, not 2500.

---

## 📮 How Form Submissions Work

```
Visitor fills contact form on published site
  → POST /forms/submit/:siteSlug/:formId
  → Spam check (IP rate limit + honeypot)
  → Validate required fields
  → Save to FormSubmissions collection
  → Send email to site owner (Resend, non-blocking)
  → Send confirmation to visitor (if enabled)
  → Return success message instantly
```

The email send is fire-and-forget — form submission succeeds even if email fails.

---

## 📜 License

MIT — Part of the Buildly no-code website builder project.

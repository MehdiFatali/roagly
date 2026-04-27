import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import multer from "multer";
import { put } from "@vercel/blob";
import { fileURLToPath } from "url";
import { dirname } from "path";
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startServer() {
  const app = express();
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}`);
    next();
  });
  app.use(express.json());
  const PORT = 3000;

  // --- Email Service Setup ---
  let transporter: nodemailer.Transporter | null = null;

  function getTransporter() {
    if (!transporter && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return transporter;
  }

  // --- API Routes ---

  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working", time: new Date().toISOString() });
  });

  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  });

  // Vercel Blob Upload
  app.get("/api/upload-status", (req, res) => {
    const hasToken = !!(process.env.ROAGLY_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN);
    const token = (process.env.ROAGLY_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN || "").replace(/"/g, '');
    
    res.json({ 
      status: "ready", 
      hasToken: hasToken,
      tokenPrefix: token ? token.substring(0, 10) : "none",
      env: process.env.NODE_ENV
    });
  });

  app.post("/api/upload", (req, res) => {
    console.log(`[Blob] POST /api/upload request received. Content-Type: ${req.headers['content-type']}`);
    
    upload.single('file')(req, res, async (err) => {
      if (err) {
        console.error("[Blob] Multer/Upload error:", err);
        return res.status(err instanceof multer.MulterError ? 400 : 500).json({ 
          error: `Upload error: ${err.message}` 
        });
      }

      try {
        if (!req.file) {
          console.error("[Blob] No file in request after multer processing");
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const token = (process.env.ROAGLY_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN || "").replace(/"/g, '');
        if (!token) {
          console.error("[Blob] Missing ROAGLY_READ_WRITE_TOKEN in process.env");
          return res.status(500).json({ error: 'Storage token is not configured' });
        }

        console.log(`[Blob] Starting Vercel Put: ${req.file.originalname} (${req.file.size} bytes)`);
        console.log(`[Blob] Using Token (first 15 chars): ${token.substring(0, 15)}`);
        
        const blob = await put(req.file.originalname, req.file.buffer, {
          access: 'public',
          token: token,
        });

        console.log("[Blob] Vercel Put Success:", blob.url);
        return res.json(blob);
      } catch (error: any) {
        console.error("[Blob] Vercel Put Error Details:");
        console.error(" - Message:", error.message);
        console.error(" - Name:", error.name);
        console.error(" - Code:", error.code);
        if (error.response) {
          console.error(" - Status:", error.response.status);
          console.error(" - Data:", error.response.data);
        }

        const errorMessage = error.message.includes('store does not exist') 
          ? "Vercel Blob: Mağaza tapılmadı (Store does not exist). Zəhmət olmasa Vercel dashboard-da yeni token yaradın və tətbiqə əlavə edin."
          : (error.message || 'Unknown error occurred during blob upload');

        return res.status(500).json({ 
          error: errorMessage,
          details: error.name,
          raw: error.message
        });
      }
    });
  });

  // Catch-all for missing API routes to prevent 404 HTML fallout
  app.all("/api/*", (req, res) => {
    console.warn(`[API] 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Order Notification
  app.post("/api/notify-order", async (req, res) => {
    const { items, total, customerEmail } = req.body;
    console.log(`[Order] New order received. Total: ${total}`);

    const mailOptions = {
        from: '"ROAGLY Shop" <roalgyfit@gmail.com>',
        to: 'roalgyfit@gmail.com', // Admin notification
        subject: `Yeni Sifariş! | AZN ${total}`,
        text: `Yeni bir sifariş daxil oldu.\n\nMəbləğ: ${total} AZN\nMüştəri: ${customerEmail || 'Naməlum'}\n\nMəhsullar:\n${JSON.stringify(items, null, 2)}`
    };

    const mailer = getTransporter();
    if (mailer) {
        try {
            await mailer.sendMail(mailOptions);
        } catch (error) {
            console.error("[Order] Failed to send admin notification:", error);
        }
    }

    res.json({ success: true });
  });

  // --- Vite & SPA Handling ---

  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
  }

  // Fallback for SPA routing and SEO injection
  app.get('*', async (req, res, next) => {
    const url = req.originalUrl;
    
    // Skip API routes
    if (url.startsWith('/api/')) return next();

    try {
      let template: string;
      const indexFile = process.env.NODE_ENV !== "production" 
        ? path.resolve(__dirname, "index.html")
        : path.resolve(__dirname, "dist/index.html");

      if (!fs.existsSync(indexFile)) {
          return res.status(404).send("index.html not found");
      }

      template = fs.readFileSync(indexFile, "utf-8");

      if (process.env.NODE_ENV !== "production") {
        template = await vite.transformIndexHtml(url, template);
      }

      // Default SEO tags - Can be translated or based on path
      let title = "ROAGLY | Premium Fitness Gear & Supplements";
      let description = "Premium fitness apparel and supplements designed for those who demand more. No clutter. No excuses.";
      let image = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop";

      // Simple heuristic for dynamic titles (in a real app, parse /product/:id from DB)
      if (url.includes('/shop')) {
          title = "Shop | ROAGLY";
      } else if (url.includes('/about')) {
          title = "About Us | ROAGLY";
      }

      const html = template
        .replace(`<title>My Google AI Studio App</title>`, `<title>${title}</title>`)
        .replace('</head>', `
    <meta name="description" content="${description}" />
    <!-- OpenGraph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://roagly.fit${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://roagly.fit${url}" />
    <meta property="twitter:title" content="${title}" />
    <meta property="twitter:description" content="${description}" />
    <meta property="twitter:image" content="${image}" />
  </head>`);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      if (process.env.NODE_ENV !== "production" && vite) {
        vite.ssrFixStacktrace(e as Error);
      }
      next(e);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    const hasToken = !!(process.env.ROAGLY_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN);
    console.log(`[Startup] STORAGE TOKEN LOADED: ${hasToken ? 'YES' : 'NO'}`);
  });
}

startServer();

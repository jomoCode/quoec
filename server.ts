import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import type { Development, Enquiry } from './src/types/property.ts';

const PORT = 3000;
const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DATA_FILE = path.join(DATA_DIR, 'portfolio.json');
const UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'uploads');

interface StoreData {
  developments: Development[];
  enquiries: Enquiry[];
}

const DEFAULT_DEVELOPMENTS: Development[] = [
  {
    id: 'the-citadel',
    name: 'The Citadel',
    location: 'Abuja, Nigeria',
    description:
      'Our flagship boutique development featuring only eight private residences, a secured lobby, an on-site security post, and signature craftsmanship designed for lasting calm.',
    status: 'Ongoing',
    featured: true,
    displayOrder: 1,
    isComingSoon: false,
    externalUrl: 'https://quoec.com/',
    featuredImage: '/src/assets/images/property_the_citadel_1795186677818.jpg',
    galleryImages: [
      '/src/assets/images/property_the_citadel_1795186677818.jpg',
      '/src/assets/images/hero_citadel_twilight_1795186677229.jpg',
    ],
    residenceSummary: '8 Boutique Residences · Secured Lobby · On-Site Security',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pavillion-villas',
    name: 'Pavillion Villas',
    location: 'Abuja, Nigeria',
    description:
      'Contemporary detached residences conceived around double-height living pavilions, natural limestone facades, private courtyard pools, and serene botanical privacy.',
    status: 'Upcoming',
    featured: true,
    displayOrder: 2,
    isComingSoon: true,
    externalUrl: '',
    featuredImage: '/src/assets/images/property_pavillion_villas_1795186677184.jpg',
    galleryImages: ['/src/assets/images/property_pavillion_villas_1795186677184.jpg'],
    residenceSummary: 'Private Courtyard Villas · Botanical Enclave',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'aurora-gardens',
    name: 'Aurora Gardens',
    location: 'Abuja, Nigeria',
    description:
      'A tranquil gated residential enclave blending warm sandstone architecture, shaded landscaped walkways, and generous family living spaces built to endure.',
    status: 'Upcoming',
    featured: true,
    displayOrder: 3,
    isComingSoon: true,
    externalUrl: '',
    featuredImage: '/src/assets/images/property_aurora_gardens_1795186677556.jpg',
    galleryImages: ['/src/assets/images/property_aurora_gardens_1795186677556.jpg'],
    residenceSummary: 'Gated Garden Residences · Landscaped Courtyards',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'the-urbane',
    name: 'The Urbane',
    location: 'Guzape, Abuja',
    description:
      'Elevated hillside residences in Guzape featuring panoramic city views, expansive glass terraces, bespoke contemporary finishes, and discreet round-the-clock security.',
    status: 'Upcoming',
    featured: false,
    displayOrder: 4,
    isComingSoon: true,
    externalUrl: '',
    featuredImage: '/src/assets/images/property_the_urbane_1795186677600.jpg',
    galleryImages: ['/src/assets/images/property_the_urbane_1795186677600.jpg'],
    residenceSummary: 'Guzape Hillside Residences · Panoramic Terraces',
    updatedAt: new Date().toISOString(),
  },
];

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function readStore(): StoreData {
  ensureDirectories();
  if (!fs.existsSync(DATA_FILE)) {
    const initial: StoreData = {
      developments: DEFAULT_DEVELOPMENTS,
      enquiries: [],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as StoreData;
    return {
      developments: Array.isArray(parsed.developments) ? parsed.developments : DEFAULT_DEVELOPMENTS,
      enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
    };
  } catch {
    return {
      developments: DEFAULT_DEVELOPMENTS,
      enquiries: [],
    };
  }
}

function writeStore(data: StoreData) {
  ensureDirectories();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `property-${Date.now()}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Serve uploaded property images directly
  ensureDirectories();
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Get all developments sorted by displayOrder
  app.get('/api/developments', (_req, res) => {
    const store = readStore();
    const sorted = [...store.developments].sort((a, b) => a.displayOrder - b.displayOrder);
    res.json(sorted);
  });

  // Create a new development
  app.post('/api/developments', (req, res) => {
    const body = req.body as Partial<Development>;
    if (!body.name || !body.location || !body.description) {
      res.status(400).json({ error: 'Name, location, and description are required.' });
      return;
    }

    const store = readStore();
    const baseId = slugify(body.name);
    let uniqueId = baseId;
    let suffix = 2;
    while (store.developments.some((d) => d.id === uniqueId)) {
      uniqueId = `${baseId}-${suffix++}`;
    }

    const maxOrder = store.developments.reduce((max, d) => Math.max(max, d.displayOrder), 0);
    const featuredImage =
      body.featuredImage || '/src/assets/images/property_the_citadel_1795186677818.jpg';
    const galleryImages =
      Array.isArray(body.galleryImages) && body.galleryImages.length > 0
        ? body.galleryImages
        : [featuredImage];

    const newDev: Development = {
      id: uniqueId,
      name: body.name.trim(),
      location: body.location.trim(),
      description: body.description.trim(),
      status: body.status || 'Upcoming',
      featured: Boolean(body.featured),
      displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : maxOrder + 1,
      isComingSoon: body.isComingSoon !== undefined ? Boolean(body.isComingSoon) : !body.externalUrl,
      externalUrl: (body.externalUrl || '').trim(),
      featuredImage,
      galleryImages,
      residenceSummary: (body.residenceSummary || '').trim(),
      updatedAt: new Date().toISOString(),
    };

    store.developments.push(newDev);
    store.developments.sort((a, b) => a.displayOrder - b.displayOrder);
    writeStore(store);
    res.status(201).json(newDev);
  });

  // Update an existing development
  app.put('/api/developments/:id', (req, res) => {
    const { id } = req.params;
    const body = req.body as Partial<Development>;
    const store = readStore();
    const index = store.developments.findIndex((d) => d.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Development not found.' });
      return;
    }

    const existing = store.developments[index];
    const updatedFeaturedImage =
      body.featuredImage !== undefined ? body.featuredImage : existing.featuredImage;
    let updatedGallery =
      body.galleryImages !== undefined ? body.galleryImages : existing.galleryImages;

    if (updatedFeaturedImage && !updatedGallery.includes(updatedFeaturedImage)) {
      updatedGallery = [updatedFeaturedImage, ...updatedGallery];
    }

    const updated: Development = {
      ...existing,
      name: body.name !== undefined ? body.name.trim() : existing.name,
      location: body.location !== undefined ? body.location.trim() : existing.location,
      description: body.description !== undefined ? body.description.trim() : existing.description,
      status: body.status !== undefined ? body.status : existing.status,
      featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
      displayOrder:
        typeof body.displayOrder === 'number' ? body.displayOrder : existing.displayOrder,
      isComingSoon:
        body.isComingSoon !== undefined ? Boolean(body.isComingSoon) : existing.isComingSoon,
      externalUrl:
        body.externalUrl !== undefined ? body.externalUrl.trim() : existing.externalUrl,
      featuredImage: updatedFeaturedImage,
      galleryImages: updatedGallery,
      residenceSummary:
        body.residenceSummary !== undefined
          ? body.residenceSummary.trim()
          : existing.residenceSummary,
      updatedAt: new Date().toISOString(),
    };

    store.developments[index] = updated;
    store.developments.sort((a, b) => a.displayOrder - b.displayOrder);
    writeStore(store);
    res.json(updated);
  });

  // Reorder developments cleanly
  app.post('/api/developments/reorder', (req, res) => {
    const { orderedIds } = req.body as { orderedIds?: string[] };
    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ error: 'orderedIds array is required.' });
      return;
    }

    const store = readStore();
    const orderMap = new Map<string, number>();
    orderedIds.forEach((id, idx) => orderMap.set(id, idx + 1));

    store.developments = store.developments
      .map((dev) => ({
        ...dev,
        displayOrder: orderMap.get(dev.id) ?? dev.displayOrder + orderedIds.length,
        updatedAt: new Date().toISOString(),
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    writeStore(store);
    res.json(store.developments);
  });

  // Delete a development
  app.delete('/api/developments/:id', (req, res) => {
    const { id } = req.params;
    const store = readStore();
    const next = store.developments.filter((d) => d.id !== id);
    if (next.length === store.developments.length) {
      res.status(404).json({ error: 'Development not found.' });
      return;
    }
    store.developments = next
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((d, idx) => ({ ...d, displayOrder: idx + 1 }));
    writeStore(store);
    res.json({ success: true });
  });

  // Upload image (accepts base64 data URL and stores safely in public/uploads)
  app.post('/api/upload', (req, res) => {
    const { fileName, dataUrl } = req.body as { fileName?: string; dataUrl?: string };
    if (!dataUrl || typeof dataUrl !== 'string') {
      res.status(400).json({ error: 'Image dataUrl is required.' });
      return;
    }

    const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
    if (!match) {
      res.status(400).json({ error: 'Only PNG, JPG, or WEBP images are supported.' });
      return;
    }

    const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'Image must be smaller than 10MB.' });
      return;
    }

    ensureDirectories();
    const safeName = slugify(path.parse(fileName || 'property').name).slice(0, 40);
    const finalName = `${safeName}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, finalName);
    fs.writeFileSync(filePath, buffer);

    res.status(201).json({ url: `/uploads/${finalName}` });
  });

  // Enquiries endpoints
  app.get('/api/enquiries', (_req, res) => {
    const store = readStore();
    const sorted = [...store.enquiries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(sorted);
  });

  app.post('/api/enquiries', (req, res) => {
    const { fullName, email, phone, propertyInterest, message } = req.body as Partial<Enquiry>;
    if (!fullName?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400).json({ error: 'Full name, email, and message are required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    const store = readStore();
    const newEnquiry: Enquiry = {
      id: `enq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: (phone || '').trim(),
      propertyInterest: (propertyInterest || 'General Portfolio Enquiry').trim(),
      message: message.trim(),
      status: 'New',
      createdAt: new Date().toISOString(),
    };

    store.enquiries.unshift(newEnquiry);
    writeStore(store);
    res.status(201).json(newEnquiry);
  });

  app.patch('/api/enquiries/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body as { status?: Enquiry['status'] };
    const store = readStore();
    const index = store.enquiries.findIndex((e) => e.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Enquiry not found.' });
      return;
    }
    if (status && ['New', 'Contacted', 'Archived'].includes(status)) {
      store.enquiries[index].status = status;
      writeStore(store);
    }
    res.json(store.enquiries[index]);
  });

  app.delete('/api/enquiries/:id', (req, res) => {
    const { id } = req.params;
    const store = readStore();
    store.enquiries = store.enquiries.filter((e) => e.id !== id);
    writeStore(store);
    res.json({ success: true });
  });

  // Vite middleware in dev, static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Quo Developments server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

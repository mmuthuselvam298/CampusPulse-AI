import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api';
import { SQLiteService } from './db/SQLiteService';
import { SyncManager } from './services/google/SyncManager';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize SQLite database
SQLiteService.getInstance();
console.log('💾 SQLite database initialized');

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Safe structured logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url } = req;

  _res.on('finish', () => {
    const duration = Date.now() - start;
    // Skip noisy polling endpoints in logs
    if (!url.includes('/api/sync/status') && !url.includes('/api/google/status')) {
      console.log(`[${new Date().toISOString()}] ${method} ${url} ${_res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CampusPulse AI API'
  });
});

// Mount API routes
app.use('/api', apiRouter);

// Serve client static build if available
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      status: 'online',
      service: 'CampusPulse AI API — SRM University-AP Edition',
      docs: '/api/dashboard'
    });
  });
}

// Centralized safe error handling middleware (Never leak stack traces)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

// Start Server locally (skip when running as Vercel serverless function)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 CampusPulse AI Server running on port ${PORT}`);
    console.log(`📡 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`💾 SQLite persistent database active`);
    console.log(`🎓 University Information Intelligence Engine Ready`);
    console.log(`====================================================`);

    // Start background sync manager
    SyncManager.getInstance().startBackgroundSync();
  });
}

export default app;

import dotenv from 'dotenv';
import express from 'express';
import { Request, Response } from 'express';
import path from 'path';
import basicRoutes from './routes/index.js';
import authRoutes from './routes/authRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import formRoutes from './routes/formRoutes.js';
import { supabase } from './config/supabase.js';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Check for Supabase configuration
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env");
  process.exit(-1);
}

console.log('✅ Supabase configuration loaded');
console.log(`📊 Supabase URL: ${process.env.SUPABASE_URL}`);

const app = express();
const port = process.env.PORT || 3000;

// Pretty-print JSON responses
app.enable('json spaces');
// We want to be consistent with URL paths, so we enable strict routing
app.enable('strict routing');

app.use(cors({}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Supabase connection on startup
(async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.error('⚠️  Supabase connection test failed:', error.message);
    } else {
      console.log('✅ Supabase database connected');
    }
  } catch (err) {
    console.error('⚠️  Supabase connection error:', err);
  }
})();

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Basic Routes
app.use(basicRoutes);
// Authentication Routes
app.use('/api/auth', authRoutes);
// Media Routes
app.use('/api/media', mediaRoutes);
// Admin Routes
app.use('/api/admin', adminRoutes);
// User Management Routes
app.use('/api/users', userRoutes);
// Form Routes
app.use('/api/forms', formRoutes);

// If no routes handled the request, it's a 404
app.use((req: Request, res: Response) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err: Error, req: Request, res: Response) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

server.on("error", (error: Error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});
# FlowPortal - Unified Architecture 🚀

> A modern, serverless content management system with direct Supabase integration

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Architecture](https://img.shields.io/badge/architecture-unified%20SPA-blue)]()
[![Deployment](https://img.shields.io/badge/deployment-frontend--only-success)]()

## ✨ Features

- 🔐 **Direct Supabase Authentication** - No backend server needed
- 📊 **Admin Dashboard** - Manage content, users, and settings
- 📝 **Pages & Posts Management** - Full CMS capabilities
- 🖼️ **Media Management** - Direct uploads to Supabase Storage
- 📧 **Form Management** - Handle submissions and configurations
- ⚙️ **Site Settings** - Configure branding, colors, and more
- 🔒 **Row Level Security** - Database-level security with RLS policies
- 🎨 **Modern UI** - Built with React, TypeScript, and Tailwind CSS

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓
@supabase/supabase-js
    ↓
Supabase
  ├── Authentication
  ├── PostgreSQL Database
  └── Storage
```

**No backend server required!** All operations happen directly from the frontend using Supabase's client library.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Netlify or Vercel account (free tier works)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/tfarzalo/FlowPortal.git
   cd FlowPortal
   ```

2. **Set up Supabase** (15 minutes)
   - Follow the detailed steps in [`QUICK_SETUP.md`](QUICK_SETUP.md)
   - Run the database migration SQL scripts
   - Create storage bucket for media
   - Set up RLS policies
   - Create admin user

3. **Configure environment variables**
   ```bash
   cd client
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Install dependencies and run**
   ```bash
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: `http://localhost:5173`
   - Admin Panel: `http://localhost:5173/admin`

## 📦 Deployment

### Netlify (Recommended)

1. **Build Settings**:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`

2. **Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Deploy**: Push to GitHub and connect to Netlify

See [`QUICK_SETUP.md`](QUICK_SETUP.md) for detailed deployment instructions.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [`MIGRATION_COMPLETE.md`](MIGRATION_COMPLETE.md) | ✅ Migration status and what was delivered |
| [`UNIFIED_ARCHITECTURE.md`](UNIFIED_ARCHITECTURE.md) | Complete architecture overview with diagrams |
| [`QUICK_SETUP.md`](QUICK_SETUP.md) | Step-by-step setup guide with SQL scripts |
| [`MIGRATION_TO_UNIFIED_ARCHITECTURE.md`](MIGRATION_TO_UNIFIED_ARCHITECTURE.md) | Migration details and benefits |

## 🗂️ Project Structure

```
FlowPortal/
├── client/                          # Frontend application
│   ├── src/
│   │   ├── services/                # Supabase service layer
│   │   │   ├── supabaseAdmin.ts     # Admin operations
│   │   │   ├── supabaseForms.ts     # Form operations
│   │   │   └── supabaseMedia.ts     # Media operations
│   │   ├── contexts/
│   │   │   └── SupabaseAuthContext.tsx  # Auth state management
│   │   ├── lib/
│   │   │   └── supabase.ts          # Supabase client
│   │   ├── pages/                   # Page components
│   │   │   └── admin/               # Admin panel pages
│   │   └── components/              # Reusable components
│   └── .env.example                 # Environment variables template
├── server/                          # Legacy backend (not used)
└── Documentation files
```

## 🔒 Security

### Row Level Security (RLS)

All database tables use Supabase RLS policies:
- ✅ Public can only read published content
- ✅ Only authenticated admins can create/update/delete
- ✅ Form submissions are admin-only

### Storage Security

- ✅ Public read access for media files
- ✅ Only authenticated users can upload
- ✅ Only admins can delete files

### Environment Variables

- `VITE_SUPABASE_ANON_KEY` is safe to expose (it's the "anon" key)
- All security is enforced by RLS policies at the database level

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **React Router** - Routing

### Backend (Serverless)
- **Supabase** - Authentication, database, and storage
- **PostgreSQL** - Database
- **Row Level Security** - Access control

## 🎯 Admin Features

### Dashboard
- View statistics (pages, posts, users, forms)
- Quick actions for content creation
- Site overview with drafts and submissions

### Content Management
- **Pages**: Create, edit, delete static pages
- **Posts**: Full blog post management
- **Media**: Upload and organize files
- **Forms**: View submissions and configure fields

### Settings
- Site name, tagline, and branding
- Colors and button styles
- Business hours and contact info
- Social media links
- Landing page configuration

### Users
- View all users
- Manage roles (admin/user)
- Access control

## 🧪 Testing

```bash
cd client
npm run build  # Check for TypeScript errors
npm run dev    # Run development server
```

## 📈 Benefits

1. **Simplified Architecture** - No backend server to maintain
2. **Cost Reduction** - Free hosting on Netlify/Vercel
3. **Performance** - Direct database queries, CDN distribution
4. **Developer Experience** - Type-safe Supabase client, automatic JWT handling
5. **Scalability** - Supabase handles all scaling automatically

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Issues**: Check the [troubleshooting section](QUICK_SETUP.md#-common-issues) in the setup guide
- **Documentation**: See the docs listed above
- **Browser Console**: Check for errors and logs (F12)

## 🎉 What's New

### Version 2.0 - Unified Architecture (January 2026)

- ✅ Migrated to direct Supabase integration
- ✅ Removed backend server dependency
- ✅ Implemented frontend-only deployment
- ✅ Added comprehensive documentation
- ✅ Updated all admin features
- ✅ Build optimizations and error fixes

### Previous Versions
- **v1.x** - Dual architecture with Express backend and MongoDB

## 🔮 Future Enhancements

- [ ] Supabase Edge Functions for email notifications
- [ ] Supabase Realtime for live updates
- [ ] Additional auth providers (Google, GitHub)
- [ ] More granular RLS policies
- [ ] Advanced media management features

---

**Built with ❤️ using React, TypeScript, and Supabase**

*Last Updated: January 14, 2026*

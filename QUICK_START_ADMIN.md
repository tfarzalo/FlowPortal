# 🚀 Quick Start Guide - Admin Login

## Server URLs
- **Frontend**: http://localhost:5174
- **Backend**: http://localhost:3000

## Admin Credentials
```
Email: design@thunderlightmedia.com
Password: SquireBoy40!
```

## Login Flow
1. Go to http://localhost:5174/login
2. Enter admin credentials
3. Click "Sign In"
4. ✅ Automatically redirected to http://localhost:5174/admin

## What Was Fixed
✅ Authentication system updated for Supabase
✅ Admin user created with proper password hashing
✅ Login redirect logic implemented
✅ Admin dashboard protection added
✅ Role-based access control working

## Admin Panel Features
- 📊 Dashboard
- 📄 Pages Management
- 📰 Posts Management
- 🖼️ Media Management
- 📬 Form Entries
- ⚙️ Form Configuration
- 👥 Users Management
- 🔧 Site Settings

## Restart Servers (if needed)
```bash
# Backend
cd server
npm run dev

# Frontend (in new terminal)
cd client
npm run dev
```

## Create/Update Admin User (if needed)
```bash
cd server
npx tsx scripts/setupAdmin.ts
```

---
**Everything is ready to go! Just login and start managing your site.**

# Quick Deployment Guide

## Repository Information
- **GitHub:** https://github.com/tfarzalo/FlowPortal
- **Branch:** `feature-branch-1762324316584`
- **Status:** ✅ All code pushed successfully

## Prerequisites
- Node.js 18+ installed
- Supabase account with project created
- PostgreSQL database set up in Supabase

## Environment Variables

Create a `.env` file in the `server` directory:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_random_secret_key_here

# Server
PORT=5000
NODE_ENV=production
```

Create a `.env` file in the `client` directory:

```bash
VITE_API_URL=http://localhost:5000
```

## Deployment Steps

### 1. Clone Repository
```bash
git clone https://github.com/tfarzalo/FlowPortal.git
cd FlowPortal
git checkout feature-branch-1762324316584
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Set Up Database
```bash
cd server

# Create admin user (follow prompts)
npm run create-admin

# Or use the script directly
node -r ts-node/register scripts/createAdminUser.ts
```

### 4. Build Application
```bash
# Build server
cd server
npm run build

# Build client
cd ../client
npm run build
```

### 5. Run Application

#### Development Mode
```bash
# Terminal 1 - Run server
cd server
npm run dev

# Terminal 2 - Run client
cd client
npm run dev
```

#### Production Mode
```bash
# Run server
cd server
npm start

# Serve client (use a static file server or hosting service)
# The built files are in client/dist/
```

## Hosting Options

### Option 1: Vercel (Recommended for Frontend)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd client && npm install && npm run build`
3. Set output directory: `client/dist`
4. Add environment variable: `VITE_API_URL`

### Option 2: Railway (Recommended for Backend)
1. Connect your GitHub repository to Railway
2. Set root directory: `server`
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add all environment variables from above

### Option 3: Docker
```bash
# Build backend container
docker build -t flowportal-server ./server

# Build frontend container
docker build -t flowportal-client ./client

# Run with docker-compose
docker-compose up -d
```

## Post-Deployment Checklist

### Backend Health Check
- [ ] Server starts without errors
- [ ] Can connect to Supabase database
- [ ] API endpoints respond correctly
- [ ] JWT authentication works

### Frontend Health Check
- [ ] Application loads in browser
- [ ] Can navigate between pages
- [ ] API calls succeed
- [ ] Assets load correctly

### Admin Panel Check
- [ ] Can log in with admin credentials
- [ ] Dashboard displays statistics
- [ ] Can create/edit pages
- [ ] Media upload works
- [ ] Settings save correctly
- [ ] Form submissions work

## Common Issues and Solutions

### Issue: "Cannot connect to database"
**Solution:** Check your Supabase credentials in `.env` file

### Issue: "JWT authentication failed"
**Solution:** Ensure JWT_SECRET is set and matches between environments

### Issue: "CORS errors"
**Solution:** Update VITE_API_URL in client .env to match your backend URL

### Issue: "Media uploads fail"
**Solution:** Ensure uploads directory exists and has write permissions

### Issue: "Settings won't save"
**Solution:** Check that _id to id transformation is working (should be fixed in this deployment)

## Monitoring and Logs

### Server Logs
```bash
# Development
cd server && npm run dev

# Production - check your hosting platform logs
# Railway: View in Railway dashboard
# Custom server: check PM2 logs or systemd logs
```

### Database Monitoring
- Log into Supabase dashboard
- Check Table Editor for data
- Monitor API usage in Settings
- Review RLS policies

## Maintenance

### Update Application
```bash
git pull origin feature-branch-1762324316584
npm install
cd server && npm install && npm run build
cd ../client && npm install && npm run build
# Restart server
```

### Backup Database
Use Supabase's built-in backup features or run:
```bash
cd server
npm run export-data
```

### Create New Admin User
```bash
cd server
npm run create-admin
```

## Support

### Documentation
- See all `*.md` files in the root directory
- Key files:
  - `SUPABASE_MIGRATION_GUIDE.md` - Migration details
  - `MEDIA_AND_SETTINGS_FIX.md` - Recent fixes
  - `FORM_SUBMISSION_FIX.md` - Form fixes
  - `QUICK_START_ADMIN.md` - Admin guide

### Getting Help
- Check GitHub Issues: https://github.com/tfarzalo/FlowPortal/issues
- Review error logs in browser console and server logs
- Verify environment variables are set correctly

## Success! 🎉
Your FlowPortal application should now be running with:
- ✅ Complete Supabase backend
- ✅ Working admin panel
- ✅ Form submissions
- ✅ Media management
- ✅ Settings persistence

Happy deploying!

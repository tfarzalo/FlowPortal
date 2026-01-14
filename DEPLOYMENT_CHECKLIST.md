# 🚀 Deployment Checklist - FlowPortal Unified Architecture

## ✅ Pre-Deployment Verification

### Code Quality
- [x] All TypeScript errors resolved
- [x] Production build successful (`npm run build`)
- [x] No console errors in development mode
- [x] All imports resolved correctly
- [x] Git repository up to date

### Documentation
- [x] `UNIFIED_ARCHITECTURE.md` - Complete architecture guide
- [x] `QUICK_SETUP.md` - Step-by-step setup instructions
- [x] `MIGRATION_COMPLETE.md` - Migration summary
- [x] `README_NEW.md` - Updated README
- [x] `client/.env.example` - Environment variables template

---

## 📋 Deployment Steps

### 1. Supabase Setup (15-20 minutes)

#### 1.1 Create Supabase Project
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Create new project
- [ ] Save project URL
- [ ] Save anon key (from Settings > API)

#### 1.2 Database Setup
- [ ] Go to SQL Editor in Supabase dashboard
- [ ] Copy SQL from `QUICK_SETUP.md` (lines 35-150)
- [ ] Run all CREATE TABLE statements
- [ ] Run all RLS ENABLE statements
- [ ] Run all CREATE POLICY statements
- [ ] Verify tables exist in Table Editor

#### 1.3 Storage Setup
- [ ] Go to Storage in Supabase dashboard
- [ ] Click "New Bucket"
- [ ] Name it `media`
- [ ] Set to **Public**
- [ ] Click "Create Bucket"
- [ ] Go to Policies tab
- [ ] Add upload policy (authenticated users)
- [ ] Add read policy (public)
- [ ] Add delete policy (admins only)

#### 1.4 Create Admin User
- [ ] Go to Authentication > Users
- [ ] Click "Add User"
- [ ] Enter email: `____________________`
- [ ] Enter password: `____________________`
- [ ] Click "Create User"
- [ ] Copy the user's UUID: `____________________`
- [ ] Go to SQL Editor
- [ ] Run: `INSERT INTO users (id, email, role) VALUES ('paste-uuid', 'your-email', 'admin');`
- [ ] Verify entry exists in users table

#### 1.5 Insert Default Site Settings
- [ ] Go to SQL Editor
- [ ] Run: Insert statement from `QUICK_SETUP.md` (line 150)
- [ ] Verify entry exists in site_settings table

---

### 2. Netlify Deployment (10 minutes)

#### 2.1 Prepare Repository
- [ ] Code pushed to GitHub: ✅ Done (branch: `feature-branch-1762324316584`)
- [ ] Latest commit: `6e9e511`
- [ ] Branch up to date: ✅ Yes

#### 2.2 Create Netlify Site
- [ ] Go to [netlify.com](https://netlify.com)
- [ ] Click "Add new site" > "Import an existing project"
- [ ] Choose GitHub
- [ ] Select repository: `tfarzalo/FlowPortal`
- [ ] Select branch: `feature-branch-1762324316584` (or `main` after merge)

#### 2.3 Configure Build Settings
- [ ] Base directory: `client`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `client/dist`
- [ ] Click "Show advanced"
- [ ] Node version: 18 or higher

#### 2.4 Environment Variables
Add these in Site settings > Environment variables:

| Variable | Value | Status |
|----------|-------|--------|
| `VITE_SUPABASE_URL` | https://your-project.supabase.co | [ ] Added |
| `VITE_SUPABASE_ANON_KEY` | your-anon-key | [ ] Added |

#### 2.5 Deploy
- [ ] Click "Deploy site"
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Check build logs for errors
- [ ] Note your Netlify URL: `____________________`

---

### 3. Post-Deployment Testing (15 minutes)

#### 3.1 Public Site
- [ ] Visit Netlify URL
- [ ] Landing page loads correctly
- [ ] No console errors (F12)
- [ ] Site settings display correctly
- [ ] Public pages accessible

#### 3.2 Admin Login
- [ ] Go to `/login`
- [ ] Enter admin email and password
- [ ] Click "Login"
- [ ] Redirected to `/admin` ✅
- [ ] No console errors

#### 3.3 Admin Dashboard
- [ ] Dashboard displays stats
- [ ] All stat cards show numbers (not zero if you have data)
- [ ] Quick actions links work
- [ ] No console errors

#### 3.4 Pages Management
- [ ] Go to `/admin/pages`
- [ ] Pages list loads
- [ ] Click "Create New Page"
- [ ] Fill in form and save
- [ ] New page appears in list
- [ ] Edit page works
- [ ] Delete page works (try with test page)
- [ ] Publish/unpublish works

#### 3.5 Posts Management
- [ ] Go to `/admin/posts`
- [ ] Similar tests as pages
- [ ] Create, edit, delete, publish work

#### 3.6 Media Management
- [ ] Go to `/admin/media`
- [ ] Click "Upload"
- [ ] Select an image file
- [ ] File uploads successfully ✅
- [ ] Image appears in gallery
- [ ] Image URL is accessible
- [ ] Delete works

#### 3.7 Form Management
- [ ] Go to `/admin/form-entries`
- [ ] List loads (may be empty)
- [ ] Submit a test form from public site
- [ ] Entry appears in admin
- [ ] Update status works

#### 3.8 Form Configuration
- [ ] Go to `/admin/form-configuration`
- [ ] Configuration loads or shows empty state
- [ ] Edit configuration works
- [ ] Save works

#### 3.9 Users Management
- [ ] Go to `/admin/users`
- [ ] Users list loads
- [ ] Your admin user appears
- [ ] Role display correct

#### 3.10 Site Settings
- [ ] Go to `/admin/settings`
- [ ] Settings form loads
- [ ] Make a small change (e.g., site name)
- [ ] Click "Save Changes"
- [ ] Success message appears
- [ ] Refresh page
- [ ] Change persists ✅

---

### 4. Custom Domain (Optional - 5 minutes)

#### 4.1 Add Domain in Netlify
- [ ] Go to Site settings > Domain management
- [ ] Click "Add custom domain"
- [ ] Enter your domain: `____________________`
- [ ] Follow DNS configuration instructions

#### 4.2 DNS Configuration
- [ ] Add A record or CNAME to your DNS provider
- [ ] Wait for propagation (can take up to 24 hours)
- [ ] Verify domain works

#### 4.3 SSL Certificate
- [ ] Netlify automatically provisions SSL
- [ ] Wait for certificate (usually instant)
- [ ] Verify HTTPS works

---

## 🐛 Troubleshooting

### Build Fails
**Symptom**: Netlify build fails with errors

**Solutions**:
- [ ] Check Node version (should be 18+)
- [ ] Verify environment variables are set
- [ ] Check build logs for specific error
- [ ] Try building locally: `cd client && npm run build`

### Can't Login
**Symptom**: "Invalid credentials" error

**Solutions**:
- [ ] Verify admin user exists in Supabase Auth
- [ ] Verify entry in `users` table with `role = 'admin'`
- [ ] Check email/password are correct
- [ ] Check browser console for errors
- [ ] Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct

### Media Upload Fails
**Symptom**: Upload button doesn't work or errors

**Solutions**:
- [ ] Verify `media` bucket exists in Supabase Storage
- [ ] Verify bucket is set to **Public**
- [ ] Check storage policies allow authenticated uploads
- [ ] Verify user is logged in
- [ ] Check browser console for errors
- [ ] Check Supabase logs

### Dashboard Shows Zero Stats
**Symptom**: All dashboard cards show 0

**Solutions**:
- [ ] Add some test data (create pages, posts)
- [ ] Check RLS policies allow admin to read
- [ ] Check browser console for errors
- [ ] Verify admin user has correct role

### Pages/Posts Don't Save
**Symptom**: Save button doesn't work or errors

**Solutions**:
- [ ] Check browser console for errors
- [ ] Verify RLS policies allow admin to write
- [ ] Check Supabase logs
- [ ] Try with simpler content first

---

## 📊 Success Metrics

After deployment, verify these metrics:

- [ ] ✅ Site loads in < 3 seconds
- [ ] ✅ Admin login works
- [ ] ✅ All admin features functional
- [ ] ✅ No console errors
- [ ] ✅ Media uploads work
- [ ] ✅ Settings save correctly
- [ ] ✅ Mobile responsive
- [ ] ✅ HTTPS enabled

---

## 📝 Final Checklist

### Pre-Launch
- [ ] All tests passed
- [ ] Documentation reviewed
- [ ] Admin user credentials saved securely
- [ ] Supabase project URL and keys saved
- [ ] Netlify site URL noted
- [ ] Custom domain configured (if applicable)

### Post-Launch
- [ ] Monitor Netlify deploy logs
- [ ] Check Supabase logs for errors
- [ ] Test from different devices
- [ ] Test from different browsers
- [ ] Share site URL with team
- [ ] Update main README if needed

---

## 🎉 Deployment Complete!

Once all items are checked, your FlowPortal unified architecture is live!

### Next Steps
1. Create your actual content (pages, posts)
2. Configure site settings with your branding
3. Upload your media files
4. Test form submissions
5. Invite additional admin users if needed

### Support Resources
- `UNIFIED_ARCHITECTURE.md` - Architecture details
- `QUICK_SETUP.md` - Setup guide
- `MIGRATION_COMPLETE.md` - What was built
- Supabase Docs: https://supabase.com/docs
- Netlify Docs: https://docs.netlify.com

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Netlify URL**: _______________
**Custom Domain**: _______________
**Status**: ⬜ In Progress | ⬜ Complete | ⬜ Issues

---

*Template version: 1.0 - January 14, 2026*

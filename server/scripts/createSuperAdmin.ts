import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import User from '../models/User';
import { generatePasswordHash } from '../utils/password';

// Load environment variables
dotenv.config();

const SUPER_ADMIN_EMAIL = 'design@thunderlightmedia.com';
const SUPER_ADMIN_PASSWORD = 'SquireBoy40!';
const SUPER_ADMIN_NAME = 'Super Admin';

async function createSuperAdmin() {
  try {
    console.log('[CreateSuperAdmin] Connecting to database...');
    await connectDB();

    console.log(`[CreateSuperAdmin] Checking for existing user: ${SUPER_ADMIN_EMAIL}`);
    const existingUser = await User.findOne({ email: SUPER_ADMIN_EMAIL });

    if (existingUser) {
      console.log('[CreateSuperAdmin] Super admin user already exists. Updating password...');
      const hashedPassword = await generatePasswordHash(SUPER_ADMIN_PASSWORD);
      existingUser.password = hashedPassword;
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('[CreateSuperAdmin] Super admin user updated successfully');
      console.log(`[CreateSuperAdmin] Email: ${SUPER_ADMIN_EMAIL}`);
      console.log(`[CreateSuperAdmin] Password: ${SUPER_ADMIN_PASSWORD}`);
    } else {
      console.log('[CreateSuperAdmin] Creating new super admin user...');
      const hashedPassword = await generatePasswordHash(SUPER_ADMIN_PASSWORD);

      const superAdmin = new User({
        email: SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin'
      });

      await superAdmin.save();
      console.log('[CreateSuperAdmin] Super admin user created successfully');
      console.log(`[CreateSuperAdmin] Email: ${SUPER_ADMIN_EMAIL}`);
      console.log(`[CreateSuperAdmin] Password: ${SUPER_ADMIN_PASSWORD}`);
    }

    console.log('[CreateSuperAdmin] ✅ Setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('[CreateSuperAdmin] ❌ Error creating super admin:', error);
    process.exit(1);
  }
}

// Run the script
createSuperAdmin();

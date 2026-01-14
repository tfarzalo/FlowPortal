import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';
import { generatePasswordHash } from '../utils/password';
import { ROLES } from 'shared';

// Load environment variables
dotenv.config();

async function resetAdminPassword() {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/flowportal');
    console.log('Database connected');

    // Find the admin user
    let adminUser = await User.findOne({ email: 'admin@flowportal.com' });

    if (!adminUser) {
      console.log('Admin user not found. Creating new admin user...');
      // Create admin user
      const adminPassword = 'admin123';
      const hashedPassword = await generatePasswordHash(adminPassword);

      adminUser = new User({
        email: 'admin@flowportal.com',
        password: hashedPassword,
        role: ROLES.ADMIN,
        isActive: true,
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('Admin user found. Resetting password...');
      // Reset password
      const adminPassword = 'admin123';
      const hashedPassword = await generatePasswordHash(adminPassword);

      adminUser.password = hashedPassword;
      await adminUser.save();
      console.log('✅ Admin password reset successfully!');
    }

    console.log('-----------------------------------');
    console.log('Email: admin@flowportal.com');
    console.log('Password: admin123');
    console.log('Role:', adminUser.role);
    console.log('Active:', adminUser.isActive);
    console.log('-----------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('Error resetting admin password:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

resetAdminPassword();

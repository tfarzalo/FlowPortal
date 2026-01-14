import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';
import { generatePasswordHash } from '../utils/password';
import { ROLES } from 'shared';

// Load environment variables
dotenv.config();

async function createAdminUser() {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/flowportal');
    console.log('Database connected');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@flowportal.com' });

    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@flowportal.com');
      console.log('If you need to reset the password, please delete the user first');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin user
    const adminPassword = 'admin123'; // Default password - should be changed after first login
    const hashedPassword = await generatePasswordHash(adminPassword);

    const adminUser = new User({
      email: 'admin@flowportal.com',
      password: hashedPassword,
      role: ROLES.ADMIN,
      isActive: true,
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log('Email: admin@flowportal.com');
    console.log('Password: admin123');
    console.log('-----------------------------------');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('Error creating admin user:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdminUser();

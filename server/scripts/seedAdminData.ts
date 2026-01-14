import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Page from '../models/Page';
import Post from '../models/Post';
import User from '../models/User';
import SiteSettings from '../models/SiteSettings';

// Load environment variables
dotenv.config();

async function seedAdminData() {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/flowportal');
    console.log('Database connected');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@flowportal.com' });
    if (!adminUser) {
      console.error('Admin user not found. Please run "npm run create:admin" first.');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('Admin user found:', adminUser.email);

    // Seed Site Settings
    console.log('\nSeeding site settings...');
    const existingSettings = await SiteSettings.findOne();
    if (!existingSettings) {
      const settings = new SiteSettings({
        siteName: 'FlowPortal Plumbing',
        tagline: 'Your Trusted Plumbing Partner',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        contactEmail: 'contact@flowportal.com',
        contactPhone: '(555) 123-4567',
        address: '123 Main Street, Anytown, ST 12345',
        businessHours: {
          monday: '8:00 AM - 6:00 PM',
          tuesday: '8:00 AM - 6:00 PM',
          wednesday: '8:00 AM - 6:00 PM',
          thursday: '8:00 AM - 6:00 PM',
          friday: '8:00 AM - 6:00 PM',
          saturday: '9:00 AM - 4:00 PM',
          sunday: 'Closed'
        },
        socialMedia: {
          facebook: 'https://facebook.com/flowportal',
          twitter: 'https://twitter.com/flowportal',
          instagram: 'https://instagram.com/flowportal'
        },
        metaDescription: 'Professional plumbing services for residential and commercial properties',
        metaKeywords: 'plumbing, plumber, water heater, pipe repair, emergency plumbing',
        comingSoonMode: false,
        defaultTheme: 'dark'
      });
      await settings.save();
      console.log('✓ Site settings created');
    } else {
      console.log('✓ Site settings already exist');
    }

    // Seed Pages
    console.log('\nSeeding pages...');
    const pageCount = await Page.countDocuments();
    if (pageCount === 0) {
      const pages = [
        {
          title: 'About Us',
          slug: 'about',
          content: '<h1>About FlowPortal Plumbing</h1><p>We are a family-owned plumbing business serving the community for over 20 years. Our team of licensed professionals is dedicated to providing high-quality plumbing services with a focus on customer satisfaction.</p>',
          metaDescription: 'Learn about FlowPortal Plumbing - your trusted local plumbing experts',
          isPublished: true,
          createdBy: adminUser._id
        },
        {
          title: 'Services',
          slug: 'services',
          content: '<h1>Our Services</h1><p>We offer a comprehensive range of plumbing services including repairs, installations, maintenance, and emergency services. Contact us today for all your plumbing needs.</p>',
          metaDescription: 'Professional plumbing services including repairs, installations, and emergency services',
          isPublished: true,
          createdBy: adminUser._id
        },
        {
          title: 'Contact',
          slug: 'contact',
          content: '<h1>Contact Us</h1><p>Get in touch with our team for any plumbing needs. We are available 24/7 for emergency services.</p>',
          metaDescription: 'Contact FlowPortal Plumbing for professional plumbing services',
          isPublished: true,
          createdBy: adminUser._id
        }
      ];

      for (const pageData of pages) {
        const page = new Page(pageData);
        await page.save();
        console.log(`✓ Created page: ${page.title}`);
      }
    } else {
      console.log(`✓ ${pageCount} pages already exist`);
    }

    // Seed Posts
    console.log('\nSeeding posts...');
    const postCount = await Post.countDocuments();
    if (postCount === 0) {
      const posts = [
        {
          title: 'Common Plumbing Problems and How to Fix Them',
          slug: 'common-plumbing-problems',
          content: '<h1>Common Plumbing Problems</h1><p>Learn about the most common plumbing issues homeowners face and when to call a professional.</p>',
          excerpt: 'A guide to understanding and addressing common plumbing issues in your home.',
          category: 'Tips & Advice',
          tags: ['plumbing', 'maintenance', 'DIY'],
          metaDescription: 'Learn about common plumbing problems and how to address them',
          isPublished: true,
          publishedAt: new Date(),
          createdBy: adminUser._id
        },
        {
          title: 'Signs You Need a Water Heater Replacement',
          slug: 'water-heater-replacement-signs',
          content: '<h1>Water Heater Replacement</h1><p>Discover the warning signs that indicate it\'s time to replace your water heater.</p>',
          excerpt: 'Know when it\'s time to replace your water heater with these warning signs.',
          category: 'Water Heaters',
          tags: ['water heater', 'replacement', 'maintenance'],
          metaDescription: 'Signs that indicate you need a water heater replacement',
          isPublished: true,
          publishedAt: new Date(),
          createdBy: adminUser._id
        },
        {
          title: 'Winterizing Your Plumbing System',
          slug: 'winterizing-plumbing',
          content: '<h1>Winterizing Your Plumbing</h1><p>Protect your home from frozen pipes and winter plumbing emergencies.</p>',
          excerpt: 'Essential tips for preparing your plumbing system for winter.',
          category: 'Seasonal Tips',
          tags: ['winter', 'prevention', 'maintenance'],
          metaDescription: 'Tips for winterizing your plumbing system to prevent frozen pipes',
          isPublished: false,
          createdBy: adminUser._id
        }
      ];

      for (const postData of posts) {
        const post = new Post(postData);
        await post.save();
        console.log(`✓ Created post: ${post.title} (${post.isPublished ? 'published' : 'draft'})`);
      }
    } else {
      console.log(`✓ ${postCount} posts already exist`);
    }

    console.log('\n✅ Admin data seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('Error seeding admin data:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdminData();

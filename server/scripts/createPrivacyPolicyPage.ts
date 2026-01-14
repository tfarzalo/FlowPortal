import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Page from '../models/Page';
import User from '../models/User';

// Load environment variables
dotenv.config();

const privacyPolicyContent = `
<div style="max-width: 900px; margin: 0 auto; padding: 2rem;">
  <p style="color: #888; font-size: 0.9rem; margin-bottom: 2rem;">Last Edited: January 1, 2026</p>

  <h2 style="font-size: 1.8rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem;">Introduction</h2>
  <p style="margin-bottom: 1.5rem; line-height: 1.8;">Newport Plumbing ("we," "our," or "us") respects your privacy and is committed to protecting the personal information you provide to us. This Privacy Policy explains how we collect, use, store, and protect your information when you visit our website <a href="https://newportplumbing.com/" style="color: #3b82f6; text-decoration: underline;">https://newportplumbing.com/</a>, contact us, or use our services.</p>

  <h2 style="font-size: 1.8rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem;">Information We Collect</h2>
  <p style="margin-bottom: 1rem; line-height: 1.8;">We may collect the following types of information:</p>
  <ul style="margin-left: 2rem; margin-bottom: 1.5rem; line-height: 1.8; list-style-type: disc;">
    <li>Name</li>
    <li>Phone number</li>
    <li>Email address</li>
    <li>Service address</li>
    <li>Information related to plumbing services requested</li>
    <li>Communication preferences, including SMS opt-in status</li>
  </ul>
  <p style="margin-bottom: 1.5rem; line-height: 1.8;">Information may be collected through our website forms, phone calls, in-person interactions, or other direct communications with Newport Plumbing.</p>

  <h2 style="font-size: 1.8rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem;">SMS Messaging & Verbal Opt-In Policy</h2>
  <p style="margin-bottom: 1.5rem; line-height: 1.8;">Newport Plumbing collects SMS opt-in consent verbally and/or through online forms.</p>
  <p style="margin-bottom: 1rem; line-height: 1.8;">Customers may opt in to receive SMS messages in the following ways:</p>
  <ul style="margin-left: 2rem; margin-bottom: 1.5rem; line-height: 1.8; list-style-type: disc;">
    <li>In person at a physical service location</li>
    <li>Over the phone when the customer initiates contact</li>
    <li>By submitting a form on our website and agreeing to receive text messages</li>
  </ul>
  <p style="margin-bottom: 1rem; line-height: 1.8;">When a customer is registered for the first time, they may be asked to provide a phone number. Newport Plumbing staff is trained to ask whether the customer would like to opt in to receive SMS-based communications, including:</p>
  <ul style="margin-left: 2rem; margin-bottom: 1.5rem; line-height: 1.8; list-style-type: disc;">
    <li>Appointment reminders</li>
    <li>Dispatch notifications</li>
    <li>Billing notifications</li>
    <li>Job completion or service satisfaction surveys</li>
  </ul>
  <p style="margin-bottom: 1rem; line-height: 1.8;">Customers are informed that:</p>
  <ul style="margin-left: 2rem; margin-bottom: 1.5rem; line-height: 1.8; list-style-type: disc;">
    <li>Message and data rates may apply</li>
    <li>Message frequency may vary</li>
    <li>They may text HELP for support or additional information</li>
    <li>They may text STOP at any time to unsubscribe, and no further messages will be sent</li>
  </ul>

  <h2 style="font-size: 1.8rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem;">Use of Phone Numbers</h2>
  <p style="margin-bottom: 1.5rem; line-height: 1.8;">Phone numbers collected by Newport Plumbing are used solely for operational and service-related communications. We do not sell, rent, share, or disclose phone numbers to third parties for marketing or promotional purposes.</p>

  <h2 style="font-size: 1.8rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem;">How We Use Your Information</h2>
  <p style="margin-bottom: 1rem; line-height: 1.8;">We use the information collected to:</p>
  <ul style="margin-left: 2rem; margin-bottom: 1.5rem; line-height: 1.8; list-style-type: disc;">
    <li>Schedule and manage service appointments</li>
    <li>Communicate service updates and reminders</li>
    <li>Provide customer support</li>
    <li>Improve our services and customer experience</li>
    <li>Comply with legal and regulatory requirements</li>
  </ul>

  <h2 style="font-size: 1.8rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem;">Data Security</h2>
  <p style="margin-bottom: 1.5rem; line-height: 1.8;">We implement reasonable administrative, technical, and physical safeguards to protect your personal information from unauthorized access, misuse, or disclosure.</p>

  <h2 style="font-size: 1.8rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem;">Third-Party Services</h2>
  <p style="margin-bottom: 1.5rem; line-height: 1.8;">We may use trusted third-party service providers to assist with business operations (such as scheduling or messaging platforms). These providers are contractually obligated to protect your information and use it only for authorized purposes.</p>

  <h2 style="font-size: 1.8rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem;">Your Rights & Choices</h2>
  <p style="margin-bottom: 1rem; line-height: 1.8;">You may:</p>
  <ul style="margin-left: 2rem; margin-bottom: 1.5rem; line-height: 1.8; list-style-type: disc;">
    <li>Request access to or correction of your personal information</li>
    <li>Opt out of SMS communications at any time by replying STOP</li>
    <li>Contact us to ask questions about this Privacy Policy</li>
  </ul>

  <h2 style="font-size: 1.8rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem;">Changes to This Privacy Policy</h2>
  <p style="margin-bottom: 1.5rem; line-height: 1.8;">Newport Plumbing may update this Privacy Policy from time to time. Any changes will be reflected on this page by updating the Last Edited date above.</p>

  <h2 style="font-size: 1.8rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem;">Contact Information</h2>
  <p style="margin-bottom: 1rem; line-height: 1.8;">If you have questions about this Privacy Policy or how your information is handled, please contact:</p>
  <div style="margin-left: 2rem; margin-bottom: 2rem; line-height: 1.8;">
    <p style="margin-bottom: 0.5rem;"><strong>Newport Plumbing</strong></p>
    <p style="margin-bottom: 0.5rem;">Phone: <a href="tel:+15412657030" style="color: #3b82f6;">(541) 265-7030</a></p>
    <p style="margin-bottom: 0.5rem;">Email: <a href="mailto:newportplumbinginc@gmail.com" style="color: #3b82f6;">newportplumbinginc@gmail.com</a></p>
    <p>Website: <a href="https://newportplumbing.com/" style="color: #3b82f6;">https://newportplumbing.com/</a></p>
  </div>
</div>
`;

async function createPrivacyPolicyPage() {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/flowportal');
    console.log('Database connected');

    // Find the admin user (or use the first available admin/superadmin)
    const adminUser = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
    if (!adminUser) {
      console.error('Admin user not found. Please create an admin user first.');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('Admin user found:', adminUser.email);

    // Check if privacy-policy page already exists
    const existingPage = await Page.findOne({ slug: 'privacy-policy' });
    if (existingPage) {
      console.log('Privacy Policy page already exists. Updating content...');
      existingPage.title = 'Privacy Policy';
      existingPage.content = privacyPolicyContent;
      existingPage.metaDescription = 'Newport Plumbing Privacy Policy - Learn how we collect, use, and protect your personal information, including our SMS messaging and data security practices.';
      existingPage.metaKeywords = 'privacy policy, data protection, SMS consent, personal information, Newport Plumbing';
      existingPage.isPublished = true;
      await existingPage.save();
      console.log('✓ Privacy Policy page updated successfully');
    } else {
      console.log('Creating new Privacy Policy page...');
      const privacyPolicyPage = new Page({
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: privacyPolicyContent,
        metaDescription: 'Newport Plumbing Privacy Policy - Learn how we collect, use, and protect your personal information, including our SMS messaging and data security practices.',
        metaKeywords: 'privacy policy, data protection, SMS consent, personal information, Newport Plumbing',
        isPublished: true,
        createdBy: adminUser._id
      });

      await privacyPolicyPage.save();
      console.log('✓ Privacy Policy page created successfully');
    }

    console.log('\n✅ Privacy Policy page setup completed!');
    console.log('The page will be accessible at: /privacy-policy/');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('Error creating Privacy Policy page:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createPrivacyPolicyPage();

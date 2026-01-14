import { supabase } from '../config/supabase.js';
import { generatePasswordHash } from '../utils/password.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTestAdmin() {
  console.log('🔧 Creating test admin user for Supabase...\n');
  
  const email = 'admin@flowportal.com';
  const password = 'admin123'; // Change this!
  
  try {
    // Check if admin already exists
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existing) {
      console.log('✅ Admin user already exists!');
      console.log(`   Email: ${existing.email}`);
      console.log(`   Role: ${existing.role}`);
      console.log(`   ID: ${existing.id}\n`);
      
      // Update password if needed
      console.log('🔄 Updating password to: admin123');
      const hash = await generatePasswordHash(password);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password: hash,
          is_active: true,
          role: 'super_admin'
        })
        .eq('id', existing.id);
      
      if (updateError) throw updateError;
      
      console.log('✅ Password updated successfully!\n');
      console.log('═'.repeat(60));
      console.log('🎉 You can now login with:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log('═'.repeat(60));
      
      return;
    }
    
    // Create new admin user
    console.log('Creating new admin user...');
    const hash = await generatePasswordHash(password);
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password: hash,
        role: 'super_admin',
        is_active: true
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    console.log('✅ Admin user created successfully!\n');
    console.log('═'.repeat(60));
    console.log('🎉 Login with these credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${newUser.role}`);
    console.log(`   ID: ${newUser.id}`);
    console.log('═'.repeat(60));
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestAdmin();

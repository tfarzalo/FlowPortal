import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generatePasswordHash } from '../utils/password';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdmin() {
  try {
    const email = 'design@thunderlightmedia.com';
    const password = 'SquireBoy40!';

    console.log('Setting up admin user...');
    console.log('Email:', email);

    // Hash the password
    const hashedPassword = await generatePasswordHash(password);

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('User exists, updating password and role...');
      
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          role: 'admin'
        })
        .eq('email', email);

      if (updateError) {
        console.error('Error updating user:', updateError);
        process.exit(1);
      }

      console.log('✓ Admin user updated successfully!');
    } else {
      console.log('Creating new admin user...');
      
      // Create new user
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          email: email,
          password: hashedPassword,
          role: 'admin',
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating user:', insertError);
        process.exit(1);
      }

      console.log('✓ Admin user created successfully!');
    }

    console.log('\nAdmin credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();

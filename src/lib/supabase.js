import { createClient } from '@supabase/supabase-js'

// Project ID will be auto-injected during deployment
const SUPABASE_URL = 'https://idimgmujkuzuuxcmsqhc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaW1nbXVqa3V6dXV4Y21zcWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODM4NDgsImV4cCI6MjA2NzM1OTg0OH0.hXQO17aMF6-Kz6P0HcKkCBH7y406XWIhFhlXxucmLj0'

if(SUPABASE_URL == 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY == '<ANON_KEY>' ){
  throw new Error('Missing Supabase variables');
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})
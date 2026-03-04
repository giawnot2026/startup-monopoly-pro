import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://izkenspnhcuwhthgeskl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6a2Vuc3BuaGN1d2h0aGdlc2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTc0MTMsImV4cCI6MjA4NzQzMzQxM30.xiodu_oY-MafCcFmT18lYNC77_tRfUjj-GL2K-DnL9I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

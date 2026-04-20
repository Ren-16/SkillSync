import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mjuxapypijbuoinwlfnh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdXhhcHlwaWpidW9pbndsZm5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMzgzMDUsImV4cCI6MjA3OTYxNDMwNX0.fw4NsxGcRK9Ibu08hgkXr_FQj1nBRT7HljBIuWVmBnY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

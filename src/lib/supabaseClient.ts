import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lngotpvkceumejywfdoo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZ290cHZrY2V1bWVqeXdmZG9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1OTcxNDUsImV4cCI6MjA3NDE3MzE0NX0.HGVMSg8w8mgHdoxoJwQp9PW_uSZCd1AEDiFY9xAGOzs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
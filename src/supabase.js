import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wnntwnrxiknhxkpepqkr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubnR3bnJ4aWtuaHhrcGVwcWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxOTM1OTcsImV4cCI6MjA4Nzc2OTU5N30.Lk5P6bgtiZsHv-t5zs_jTGkkoVPE2nrIMNQA2cvRip4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
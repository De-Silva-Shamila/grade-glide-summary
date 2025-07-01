
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://zxudqqifqnurecnffdra.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4dWRxcWlmcW51cmVjbmZmZHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTcxNDcsImV4cCI6MjA2Njc5MzE0N30.UHAuCNx_iTDLPmXik22DcwZnJ2wEBM1nSXVrAsEJufI"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

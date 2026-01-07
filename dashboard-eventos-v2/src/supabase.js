import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = 'https://ykirofgvxwqnicrhrlxe.supabase.co'
   const supabaseKey = 'sb_publishable_u_FywpyJGVeiTwRL0-1d-A_ajcDugGy'

   export const supabase = createClient(supabaseUrl, supabaseKey)

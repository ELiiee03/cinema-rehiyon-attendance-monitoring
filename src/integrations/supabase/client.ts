import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pjbkrxxjwgnlvurfbcsn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYmtyeHhqd2dubHZ1cmZiY3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Njk4NzUsImV4cCI6MjA2MjI0NTg3NX0.FG4NpdlI6yZLpNE5j1G3ZOrpWVnhQi9sn98j13MmP5s";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

let supabaseClient: any;

try {
  supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  console.log("Supabase client initialized successfully");
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
  // Create a fallback client that will show errors more clearly
  supabaseClient = {
    from: () => {
      const error = new Error("Supabase client failed to initialize");
      console.error(error);
      return {
        select: () => ({ data: null, error }),
        insert: () => ({ data: null, error }),
        update: () => ({ data: null, error }),
        delete: () => ({ data: null, error }),
        eq: () => ({ data: null, error }),
        order: () => ({ data: null, error }),
        single: () => ({ data: null, error }),
      };
    },
  };
}

export const supabase = supabaseClient;
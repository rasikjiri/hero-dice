import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://wuaqzpaxkvnscswbrryr.supabase.com";

const supabaseAnonKey =
  "sb_publishable_0CGIPrb0obFhbpGoAokN9w_sov2KFRf";

export const supabase =
  createClient(
    supabaseUrl,
    supabaseAnonKey
  );
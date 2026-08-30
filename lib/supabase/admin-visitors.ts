import { createClient } from "./client";

export interface AdminVisitor {
  visitor_id: string;
  name: string;
  id_type:
    | "government_id"
    | "school_id"
    | "company_id"
    | "passport"
    | "drivers_license"
    | "other"
    | null;
  id_number: string | null;
  image_path: string | null;
  created_at: string;
  is_inside: boolean;
  active_log_id: string | null;
  logged_in: string | null;
  purpose: string | null;
  gate_id: string | null;
}

export async function getVisitors(): Promise<
  AdminVisitor[]
> {
  const supabase = createClient();

  const { data, error } =
    await supabase.rpc("get_visitors");

  if (error) {
    console.error(
      "get_visitors error:",
      error,
    );

    throw error;
  }

  return (data ?? []) as AdminVisitor[];
}
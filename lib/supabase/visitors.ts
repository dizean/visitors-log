import { createClient } from "./client";
export interface Visitor {
  id: string;
  name: string;
  id_type:
    | "government_id"
    | "school_id"
    | "company_id"
    | "passport"
    | "drivers_license"
    | "other"
    | null;
  contact_number: string | null;
  image_path: string | null;
  created_at: string;
  is_inside: boolean;
  last_visit: string | null;
}

export async function getVisitors() {
  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "get_visitors",
  );

  if (error) {
    console.error(
      "get_visitors error:",
      error,
    );

    throw error;
  }

  return (data ?? []) as Visitor[];
}
export interface IdentifiedVisitor {
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
  contact_number: string | null;
  image_path: string | null;
  distance: number;
  is_inside: boolean;
  active_log_id: string | null;
}

export async function identifyVisitor(
  descriptor: number[],
) {
  if (descriptor.length !== 128) {
    throw new Error(
      "Invalid face descriptor. Expected 128 values.",
    );
  }

  const supabase = createClient();

  const vector = `[${descriptor.join(",")}]`;

  const { data, error } = await supabase.rpc(
  "identify_visitor",
  {
    p_descriptor: vector,
  },
);

console.log("FACE MATCHES:", data);

  if (error) {
    console.error(
      "identify_visitor error:",
      error,
    );

    throw error;
  }

  console.log(
    "FACE MATCH RESULT:",
    data,
  );

  if (!data || data.length === 0) {
    return null;
  }

  return data[0] as IdentifiedVisitor;
}

export interface CreateVisitorInput {
  name: string;

  id_type:
    | "government_id"
    | "school_id"
    | "company_id"
    | "passport"
    | "drivers_license"
    | "other";

  contact_number?: string;
  image_path?: string;
  descriptor: number[];
  purpose: string;
  gate_id: string;
}

export async function createNewVisitor(
  input: CreateVisitorInput,
) {
  if (input.descriptor.length !== 128) {
    throw new Error(
      "Invalid face descriptor.",
    );
  }

  const supabase = createClient();

  const vector = `[${input.descriptor.join(",")}]`;

  const { data, error } =
    await supabase.rpc(
      "create_new_visitor",
      {
        p_name: input.name,
        p_id_type: input.id_type,
        p_contact_number: input.contact_number || null,
        p_image_path:
          input.image_path || null,
        p_descriptor: vector,
        p_purpose: input.purpose,
        p_gate_id: input.gate_id,
      },
    );

  if (error) {
    console.error(
      "create_new_visitor error:",
      error,
    );

    throw error;
  }

  return data as string;
}

export async function checkInVisitor(
  visitorId: string,
  purpose: string,
  gateId: string,
) {
  const supabase = createClient();

  const { data, error } =
    await supabase.rpc(
      "check_in_visitor",
      {
        p_visitor_id: visitorId,
        p_purpose: purpose,
        p_gate_id: gateId,
      },
    );

  if (error) {
    console.error(
      "check_in_visitor error:",
      error,
    );

    throw error;
  }

  return data;
}

export async function checkOutVisitor(
  visitorId: string,
) {
  const supabase = createClient();

  const { data, error } =
    await supabase.rpc(
      "check_out_visitor",
      {
        p_visitor_id: visitorId,
      },
    );

  if (error) {
    console.error(
      "check_out_visitor error:",
      error,
    );

    throw error;
  }

  return data;
}

export interface VisitorLog {
  id: string;
  visitor_id: string;
  name: string;
  visit_date: string | null;
  purpose: string | null;
  gate: string | null;
  id_type:
    | "government_id"
    | "school_id"
    | "company_id"
    | "passport"
    | "drivers_license"
    | "other"
    | null;
  logged_in: string;
  logged_out: string | null;
  status:
    | "CHECKED_IN"
    | "CHECKED_OUT";
}

export async function getVisitorLogs(
  startDate: string,
  endDate: string,
) {
  const supabase = createClient();

  const { data, error } =
    await supabase.rpc(
      "get_visitor_logs",
      {
        p_start_date: startDate,
        p_end_date: endDate,
      },
    );

  if (error) {
    console.error(
      "get_visitor_logs error:",
      error,
    );

    throw error;
  }

  return (data ?? []) as VisitorLog[];
}
export async function getTodayVisitorLogsKiosk() {
  const supabase = createClient();

  const { data, error } =
    await supabase.rpc(
      "get_today_visitor_logs_kiosk",
    );

  if (error) {
    console.error(
      "getTodayVisitorLogs error:",
      error,
    );

    throw error;
  }

  return (data ?? []) as VisitorLog[];
}
export async function getTodayVisitorLogs() {
  const supabase = createClient();

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const { data, error } =
    await supabase.rpc(
      "get_visitor_logs",
      {
        p_start_date: today,
        p_end_date: today,
      },
    );

  if (error) {
    console.error(
      "getTodayVisitorLogs error:",
      error,
    );

    throw error;
  }

  return (data ?? []) as VisitorLog[];
}

export async function getVisitorLogsByDateRange(
  startDate: string,
  endDate: string,
) {
  if (!startDate || !endDate) {
    throw new Error(
      "Start and end dates are required.",
    );
  }

  if (startDate > endDate) {
    throw new Error(
      "Invalid date range.",
    );
  }

  const supabase = createClient();

  const { data, error } =
    await supabase.rpc(
      "get_visitor_logs",
      {
        p_start_date: startDate,
        p_end_date: endDate,
      },
    );

  if (error) {
    console.error(
      "getVisitorLogsByDateRange error:",
      error,
    );

    throw error;
  }

  return (data ?? []) as VisitorLog[];
}
export interface Gate {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getActiveGates() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("gates")
    .select(
      "id, name, description, is_active, created_at",
    )
    .eq("is_active", true)
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "getActiveGates error:",
      error,
    );

    throw error;
  }

  return (data ?? []) as Gate[];
}
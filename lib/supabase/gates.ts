import { createClient } from "./client";

export interface Gate {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getGates() {
  const supabase = createClient();

  const { data, error } =
    await supabase.rpc("get_gates");

  if (error) {
    console.error(
      "get_gates error:",
      error,
    );

    throw error;
  }

  return (data ?? []) as Gate[];
}

export async function createGate(
  name: string,
  description?: string,
) {
  const supabase = createClient();

  const { data, error } =
    await supabase.rpc("create_gate", {
      p_name: name,
      p_description:
        description || null,
    });

  if (error) {
    console.error(
      "create_gate error:",
      error,
    );

    throw error;
  }

  return data as Gate;
}

export async function updateGate(
  gateId: string,
  name: string,
  description?: string,
) {
  const supabase = createClient();

  const { data, error } =
    await supabase.rpc("update_gate", {
      p_gate_id: gateId,
      p_name: name,
      p_description:
        description || null,
    });

  if (error) {
    console.error(
      "update_gate error:",
      error,
    );

    throw error;
  }

  return data as Gate;
}

export async function toggleGate(
  gateId: string,
  isActive: boolean,
) {
  const supabase = createClient();

  const { data, error } =
    await supabase.rpc("toggle_gate", {
      p_gate_id: gateId,
      p_is_active: isActive,
    });

  if (error) {
    console.error(
      "toggle_gate error:",
      error,
    );

    throw error;
  }

  return data as Gate;
}

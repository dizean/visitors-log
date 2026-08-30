import { createClient } from "@/lib/supabase/client";

export type UserRole = "admin" | "staff";

export type SystemUser = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
};

export async function getUsers(): Promise<SystemUser[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, full_name, email, role, is_active, created_at",
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createUser({
  full_name,
  email,
  password,
  role,
}: {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const supabase = createClient();

  const { data, error } =
    await supabase.functions.invoke(
      "create-admin-user",
      {
        body: {
          full_name,
          email,
          password,
          role,
        },
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error(
      data?.error ?? "Unable to create user.",
    );
  }

  return data.user;
}

export async function updateUserStatus(
  id: string,
  isActive: boolean,
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("users")
    .update({
      is_active: isActive,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
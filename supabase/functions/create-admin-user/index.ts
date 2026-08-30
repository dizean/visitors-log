import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "Method not allowed",
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabaseUrl = Deno.env.get(
      "SUPABASE_URL",
    );

    const serviceRoleKey = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          error:
            "Missing Supabase environment variables.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    const {
      email,
      password,
      full_name,
      role = "staff",
    } = await req.json();

    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({
          error:
            "Email, password, and full name are required.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (
      role !== "admin" &&
      role !== "staff"
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid user role.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const {
      data: userData,
      error: userError,
    } =
      await supabase.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: true,
      });

    if (userError) {
      return new Response(
        JSON.stringify({
          error: userError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({
          error:
            "Supabase did not return the created user.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const userId = userData.user.id;

    const { error: profileError } =
      await supabase
        .from("users")
        .insert({
          id: userId,
          full_name: full_name.trim(),
          email: email.trim(),
          role,
          is_active: true,
        });

    if (profileError) {
      await supabase.auth.admin.deleteUser(
        userId,
      );

      return new Response(
        JSON.stringify({
          error: profileError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: email.trim(),
          full_name: full_name.trim(),
          role,
        },
      }),
      {
        status: 201,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error(
      "create-admin-user error:",
      error,
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
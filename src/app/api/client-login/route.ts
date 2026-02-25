import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "https://your-project.supabase.co") return null;
  return createClient(url, key);
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Service unavailable." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Look up software_keys with status "used" and signup_type "client"
    const { data: keys, error: keysErr } = await supabase
      .from("software_keys")
      .select("*")
      .eq("status", "used");

    if (keysErr || !keys) {
      return NextResponse.json(
        { error: "Unable to verify credentials." },
        { status: 500 }
      );
    }

    // Find matching client credentials
    const matchingKey = keys.find((k: Record<string, unknown>) => {
      const meta = k.metadata as Record<string, string> | null;
      if (!meta) return false;
      if (meta.signup_type !== "client") return false;
      return (
        meta.signup_email?.toLowerCase() === normalizedEmail &&
        meta.signup_password === password
      );
    });

    if (!matchingKey) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const meta = matchingKey.metadata as Record<string, string>;

    // Get agency name if linked
    let agencyName = "";
    if (matchingKey.agency_id) {
      const { data: agency } = await supabase
        .from("agencies")
        .select("name")
        .eq("id", matchingKey.agency_id)
        .single();
      if (agency) agencyName = agency.name;
    }

    // Find the existing client record
    // software_keys.client_id stores the UUID (clients.id), not the display ID
    let clientDisplayId: string | null = null;

    if (matchingKey.client_id) {
      // Try to find existing client by UUID first (admin invite stores clients.id)
      const { data: existingByUUID } = await supabase
        .from("clients")
        .select("id, client_id")
        .eq("id", matchingKey.client_id)
        .single();

      if (existingByUUID) {
        clientDisplayId = existingByUUID.client_id;
      } else {
        // Fallback: maybe client_id is stored as the display ID (CL-XXXX)
        const { data: existingByDisplayId } = await supabase
          .from("clients")
          .select("id, client_id")
          .eq("client_id", matchingKey.client_id)
          .single();

        if (existingByDisplayId) {
          clientDisplayId = existingByDisplayId.client_id;
        }
      }
    }

    // If still no client found, try matching by email as last resort
    if (!clientDisplayId) {
      const { data: existingByEmail } = await supabase
        .from("clients")
        .select("id, client_id")
        .eq("email", normalizedEmail)
        .single();

      if (existingByEmail) {
        clientDisplayId = existingByEmail.client_id;
        // Fix the software_keys link so future logins are faster
        await supabase
          .from("software_keys")
          .update({ client_id: existingByEmail.id })
          .eq("id", matchingKey.id);
      }
    }

    // Only create a new client if absolutely none exists
    if (!clientDisplayId) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      clientDisplayId = `CL-${randomNum}`;

      const { data: newClient, error: clientErr } = await supabase
        .from("clients")
        .insert([
          {
            client_id: clientDisplayId,
            name: meta.signup_name || "",
            email: meta.signup_email || normalizedEmail,
            agency_id: matchingKey.agency_id || null,
            status: "active",
          },
        ])
        .select("id, client_id")
        .single();

      if (!clientErr && newClient) {
        await supabase
          .from("software_keys")
          .update({ client_id: newClient.id })
          .eq("id", matchingKey.id);
        clientDisplayId = newClient.client_id;
      }
    }

    return NextResponse.json({
      success: true,
      client: {
        name: meta.signup_name || "",
        email: meta.signup_email || "",
        agency_name: agencyName,
        client_id: clientDisplayId,
      },
    });
  } catch (err) {
    console.error("Client login error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

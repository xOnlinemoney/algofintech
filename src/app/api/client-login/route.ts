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

    // Ensure a record exists in the clients table so accounts work
    let clientDisplayId = matchingKey.client_id || null;

    if (!clientDisplayId) {
      // Generate a display ID like "CL-1234"
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      clientDisplayId = `CL-${randomNum}`;

      // Create the clients record
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
        // Link the software key to this new client record
        await supabase
          .from("software_keys")
          .update({ client_id: newClient.client_id })
          .eq("id", matchingKey.id);
        clientDisplayId = newClient.client_id;
      }
    } else {
      // Verify the client_id actually exists in the clients table
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("client_id", clientDisplayId)
        .single();

      if (!existingClient) {
        // Create the missing clients record
        const { data: newClient } = await supabase
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

        if (newClient) {
          clientDisplayId = newClient.client_id;
        }
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

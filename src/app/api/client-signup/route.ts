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
    const { first_name, last_name, email, password, license_key } = body;

    if (!first_name || !last_name || !email || !password || !license_key) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const normalizedKey = license_key.trim().toUpperCase();

    // 1. Look up the license key
    const { data: keyRecord, error: keyErr } = await supabase
      .from("software_keys")
      .select("*")
      .eq("license_key", normalizedKey)
      .single();

    if (keyErr || !keyRecord) {
      return NextResponse.json(
        { error: "Invalid license key." },
        { status: 400 }
      );
    }

    if (keyRecord.status === "used") {
      return NextResponse.json(
        { error: "This license key has already been used." },
        { status: 400 }
      );
    }
    if (keyRecord.status !== "active") {
      return NextResponse.json(
        { error: "This license key is not valid." },
        { status: 400 }
      );
    }

    // 2. Mark the key as used and store signup info
    const existingMetadata = keyRecord.metadata || {};
    await supabase
      .from("software_keys")
      .update({
        status: "used",
        metadata: {
          ...existingMetadata,
          signup_name: `${first_name} ${last_name}`,
          signup_email: email,
          signup_password: password,
          signup_type: "client",
          signed_up_at: new Date().toISOString(),
        },
      })
      .eq("id", keyRecord.id);

    // Get agency info if the key is linked to one
    let agencyName = "";
    if (keyRecord.agency_id) {
      const { data: agency } = await supabase
        .from("agencies")
        .select("name")
        .eq("id", keyRecord.agency_id)
        .single();
      if (agency) agencyName = agency.name;
    }

    // 3. Find the existing client record (created when admin invited them)
    //    software_keys.client_id stores the UUID (clients.id), not the display ID
    const signupName = `${first_name} ${last_name}`;
    let clientDisplayId: string | null = null;

    console.log("[client-signup] keyRecord.client_id:", keyRecord.client_id);
    console.log("[client-signup] keyRecord full:", JSON.stringify(keyRecord));

    if (keyRecord.client_id) {
      // Try to find the existing client by UUID first (admin invite stores clients.id)
      const { data: existingByUUID, error: uuidErr } = await supabase
        .from("clients")
        .select("id, client_id")
        .eq("id", keyRecord.client_id)
        .single();

      console.log("[client-signup] UUID lookup result:", existingByUUID, "error:", uuidErr);

      if (existingByUUID) {
        // Found the invited client — update their name/email with signup info
        clientDisplayId = existingByUUID.client_id;
        console.log("[client-signup] MATCHED by UUID — updating existing client:", existingByUUID.client_id);
        await supabase
          .from("clients")
          .update({ name: signupName, email: email, status: "active" })
          .eq("id", existingByUUID.id);
      } else {
        console.log("[client-signup] UUID lookup failed, trying display ID fallback...");
        // Fallback: maybe client_id is stored as the display ID (CL-XXXX)
        const { data: existingByDisplayId } = await supabase
          .from("clients")
          .select("id, client_id")
          .eq("client_id", keyRecord.client_id)
          .single();

        if (existingByDisplayId) {
          clientDisplayId = existingByDisplayId.client_id;
          await supabase
            .from("clients")
            .update({ name: signupName, email: email, status: "active" })
            .eq("id", existingByDisplayId.id);
        }
      }
    }

    // If still no client found, try matching by email as last resort
    if (!clientDisplayId) {
      const { data: existingByEmail } = await supabase
        .from("clients")
        .select("id, client_id")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (existingByEmail) {
        clientDisplayId = existingByEmail.client_id;
        console.log("[client-signup] MATCHED by email fallback:", clientDisplayId);
        await supabase
          .from("clients")
          .update({ name: signupName, status: "active" })
          .eq("id", existingByEmail.id);
        // Fix the software_keys link
        await supabase
          .from("software_keys")
          .update({ client_id: existingByEmail.id })
          .eq("id", keyRecord.id);
      }
    }

    // If absolutely no existing client was found, create a new one
    console.log("[client-signup] clientDisplayId after all lookups:", clientDisplayId);
    if (!clientDisplayId) {
      console.log("[client-signup] NO existing client found — creating NEW client record");
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      clientDisplayId = `CL-${randomNum}`;

      const { data: newClient, error: clientErr } = await supabase
        .from("clients")
        .insert([
          {
            client_id: clientDisplayId,
            name: signupName,
            email: email,
            agency_id: keyRecord.agency_id || null,
            status: "active",
          },
        ])
        .select("id, client_id")
        .single();

      if (!clientErr && newClient) {
        // Link the software key to this new client record
        await supabase
          .from("software_keys")
          .update({ client_id: newClient.id })
          .eq("id", keyRecord.id);
        clientDisplayId = newClient.client_id;
      }
    }

    return NextResponse.json({
      success: true,
      client: {
        name: `${first_name} ${last_name}`,
        email: email,
        agency_name: agencyName,
        client_id: clientDisplayId,
      },
      message: "Client signup successful!",
    });
  } catch (err) {
    console.error("Client signup error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

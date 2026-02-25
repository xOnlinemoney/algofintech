import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xahsdbdtfjxstnkehmke.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhaHNkYmR0Zmp4c3Rua2VobWtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY5NDE0NSwiZXhwIjoyMDg3MjcwMTQ1fQ.BEPF-YoFXaQt-GCgVA4c1WDYyvfL6GZyL1LjQ_kUvD0";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function querySMTPSettings() {
  try {
    console.log("Connecting to Supabase...");
    console.log(`URL: ${supabaseUrl}`);

    // Query the agencies table
    const { data: agencies, error } = await supabase
      .from("agencies")
      .select("id, name, settings");

    if (error) {
      console.error("Error querying agencies:", error);
      return;
    }

    console.log("\n=== AGENCIES SMTP SETTINGS ===\n");
    console.log(`Total agencies found: ${agencies.length}\n`);

    agencies.forEach((agency, index) => {
      console.log(`\n--- Agency ${index + 1} ---`);
      console.log(`ID: ${agency.id}`);
      console.log(`Name: ${agency.name}`);
      console.log(`Settings:`, JSON.stringify(agency.settings, null, 2));

      if (agency.settings) {
        console.log("\nSMTP Fields:");
        console.log(`  smtp_provider: ${agency.settings.smtp_provider || "NOT SET"}`);
        console.log(`  smtp_host: ${agency.settings.smtp_host || "NOT SET"}`);
        console.log(`  smtp_user: ${agency.settings.smtp_user || "NOT SET"}`);
        console.log(`  smtp_pass: ${agency.settings.smtp_pass ? "***HIDDEN***" : "NOT SET"}`);
        console.log(`  smtp_from_email: ${agency.settings.smtp_from_email || "NOT SET"}`);
        console.log(`  email_templates: ${agency.settings.email_templates ? "EXISTS" : "NOT SET"}`);
      }
    });

    console.log("\n=== END OF REPORT ===\n");
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

querySMTPSettings();

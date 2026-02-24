import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { smtp_host, smtp_port, smtp_user, smtp_pass } = body;

    if (!smtp_host || !smtp_user || !smtp_pass) {
      return NextResponse.json(
        { error: "SMTP host, user, and password are required." },
        { status: 400 }
      );
    }

    const port = Number(smtp_port) || 587;
    // Strip spaces from password (Gmail app passwords are often copied with spaces)
    const cleanPass = (smtp_pass || "").replace(/\s/g, "");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transportConfig: any = {
      host: smtp_host,
      port,
      secure: port === 465,
      auth: {
        user: (smtp_user || "").trim(),
        pass: cleanPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    };

    if (port === 587) {
      transportConfig.requireTLS = true;
    }

    console.log("Testing SMTP connection:", {
      host: smtp_host,
      port,
      user: smtp_user,
      passLength: cleanPass.length,
    });

    const transporter = nodemailer.createTransport(transportConfig);

    // verify() checks the connection + auth
    await transporter.verify();

    console.log("SMTP test passed for", smtp_user);

    return NextResponse.json({
      success: true,
      message: "SMTP connection successful! Your email credentials are working.",
    });
  } catch (err) {
    const errMsg = (err as Error).message || String(err);
    console.error("SMTP test failed:", errMsg);

    // Provide user-friendly error messages
    let friendlyMsg = errMsg;
    if (errMsg.includes("535") || errMsg.includes("Username and Password not accepted")) {
      friendlyMsg =
        "Gmail rejected the credentials. Please make sure: (1) You're using an App Password (not your regular Gmail password), (2) 2-Step Verification is enabled on your Google account, (3) The App Password was copied correctly with no extra characters.";
    } else if (errMsg.includes("ECONNREFUSED")) {
      friendlyMsg = "Could not connect to the SMTP server. Please check the host and port.";
    } else if (errMsg.includes("ETIMEDOUT") || errMsg.includes("timeout")) {
      friendlyMsg = "Connection timed out. The SMTP server may be unreachable or the port may be blocked.";
    } else if (errMsg.includes("certificate")) {
      friendlyMsg = "SSL/TLS certificate error. Try a different port (587 for STARTTLS, 465 for SSL).";
    }

    return NextResponse.json(
      { error: friendlyMsg },
      { status: 400 }
    );
  }
}

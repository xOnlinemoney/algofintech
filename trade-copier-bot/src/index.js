require("dotenv").config();

const { App } = require("@slack/bolt");
const { parseAccountMessage } = require("./parser");
const { addSlaveAccount, closeBrowser, ensureLoggedIn } = require("./browser");

// ─── Slack App (Socket Mode) ───
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// Track processed messages to avoid duplicates
const processedMessages = new Set();

// Queue for sequential processing (one account at a time)
const queue = [];
let processing = false;

/**
 * Listen for all messages in the configured channel
 */
app.message(async ({ message, client }) => {
  try {
    // Skip edits, deletions, etc. — but ALLOW bot_message (webhook notifications)
    const skipSubtypes = ["message_changed", "message_deleted", "channel_join", "channel_leave"];
    if (message.subtype && skipSubtypes.includes(message.subtype)) return;
    if (processedMessages.has(message.ts)) return;

    // Only listen to the configured channel
    if (process.env.SLACK_CHANNEL_ID && message.channel !== process.env.SLACK_CHANNEL_ID) {
      return;
    }

    // Parse the message
    const accountData = parseAccountMessage(message);
    if (!accountData) return; // Not an account notification

    console.log(`\n${"=".repeat(60)}`);
    console.log(`[Slack] New account notification detected!`);
    console.log(`  Agency: ${accountData.agency}`);
    console.log(`  Client: ${accountData.client}`);
    console.log(`  Broker: ${accountData.broker}`);
    console.log(`  Account: ${accountData.accountNumber}`);
    console.log(`${"=".repeat(60)}\n`);

    // Mark as processing
    processedMessages.add(message.ts);

    // Add to queue
    queue.push({
      accountData,
      messageTs: message.ts,
      channel: message.channel,
      client,
    });

    // Process queue
    processQueue();
  } catch (err) {
    console.error("[Slack] Error handling message:", err);
  }
});

/**
 * Process the automation queue one at a time
 */
async function processQueue() {
  if (processing || queue.length === 0) return;

  processing = true;

  while (queue.length > 0) {
    const { accountData, messageTs, channel, client } = queue.shift();

    try {
      // React with 👀 to show we're working on it
      await client.reactions.add({
        channel,
        timestamp: messageTs,
        name: "eyes",
      });

      console.log(`[Queue] Processing account: ${accountData.accountNumber}`);

      // Run browser automation
      const result = await addSlaveAccount(accountData);

      if (result.success) {
        // React with ✅ green checkmark
        await client.reactions.add({
          channel,
          timestamp: messageTs,
          name: "white_check_mark",
        });

        // Remove 👀 reaction
        try {
          await client.reactions.remove({
            channel,
            timestamp: messageTs,
            name: "eyes",
          });
        } catch {
          // ignore if already removed
        }

        console.log(
          `[Queue] ✅ Account ${accountData.accountNumber} added successfully!`
        );

        // Post a thread reply with details
        await client.chat.postMessage({
          channel,
          thread_ts: messageTs,
          text: `✅ Account connected on Trade-Copier!\n• Template: ${result.template || "N/A"}\n• Status: ${result.connected ? "Connected" : "Pending connection"}\n• Account: ${result.accountNumber}`,
        });
      } else {
        // React with ❌ if failed
        await client.reactions.add({
          channel,
          timestamp: messageTs,
          name: "x",
        });

        try {
          await client.reactions.remove({
            channel,
            timestamp: messageTs,
            name: "eyes",
          });
        } catch {
          // ignore
        }

        console.log(
          `[Queue] ❌ Failed for account ${accountData.accountNumber}: ${result.reason}`
        );

        await client.chat.postMessage({
          channel,
          thread_ts: messageTs,
          text: `❌ Failed to add account on Trade-Copier.\nReason: ${result.reason}\nPlease add manually.`,
        });
      }
    } catch (err) {
      console.error(
        `[Queue] Error processing ${accountData.accountNumber}:`,
        err
      );

      // React with warning
      try {
        await client.reactions.add({
          channel,
          timestamp: messageTs,
          name: "warning",
        });
        await client.reactions.remove({
          channel,
          timestamp: messageTs,
          name: "eyes",
        });
      } catch {
        // ignore
      }

      await client.chat.postMessage({
        channel,
        timestamp: messageTs,
        thread_ts: messageTs,
        text: `⚠️ Error during automation: ${err.message}\nPlease add account manually.`,
      });
    }

    // Small delay between accounts
    await new Promise((r) => setTimeout(r, 2000));
  }

  processing = false;
}

/**
 * Startup
 */
async function start() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   Trade-Copier Onboarding Bot v1.0      ║");
  console.log("╚══════════════════════════════════════════╝");

  // Start Slack app
  await app.start();
  console.log("[Slack] ⚡ Bot connected via Socket Mode");

  // Pre-warm browser and verify login
  try {
    console.log("[Browser] Pre-warming browser session...");
    await ensureLoggedIn();
    console.log("[Browser] ✅ Logged into trade-copier.com");
  } catch (err) {
    console.error("[Browser] ⚠️ Could not pre-warm browser:", err.message);
    console.log("[Browser] Will attempt login when first account arrives");
  }

  console.log("\n[Bot] 🎯 Listening for new account notifications...\n");
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n[Bot] Shutting down...");
  await closeBrowser();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n[Bot] Shutting down...");
  await closeBrowser();
  process.exit(0);
});

// Prevent unhandled rejections from crashing
process.on("unhandledRejection", (err) => {
  console.error("[Bot] Unhandled rejection:", err);
});

start().catch((err) => {
  console.error("[Bot] Fatal error:", err);
  process.exit(1);
});

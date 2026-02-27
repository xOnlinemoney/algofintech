const puppeteer = require("puppeteer");
const path = require("path");
const { findTemplateForAgency } = require("./parser");

const COCKPIT_URL = "https://www.trade-copier.com/cockpit";
const LOGIN_URL = "https://www.trade-copier.com/login";

let browser = null;
let page = null;

/**
 * Launch or reuse the browser instance with persistent profile
 */
async function getBrowser() {
  if (browser && browser.connected) {
    return browser;
  }

  const userDataDir = process.env.CHROME_USER_DATA_DIR || "./chrome-data";

  browser = await puppeteer.launch({
    headless: false, // Run visible Chrome — needed for Tradovate OAuth popup
    userDataDir: path.resolve(userDataDir),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1920,1080",
    ],
    defaultViewport: { width: 1920, height: 1080 },
  });

  console.log("[Browser] Launched with persistent profile");
  return browser;
}

/**
 * Get or create the main page
 */
async function getPage() {
  const b = await getBrowser();

  if (page && !page.isClosed()) {
    return page;
  }

  const pages = await b.pages();
  page = pages[0] || (await b.newPage());

  // Set a realistic user agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  );

  return page;
}

/**
 * Check if we're logged in, and login if not
 */
async function ensureLoggedIn() {
  const p = await getPage();

  await p.goto(COCKPIT_URL, { waitUntil: "networkidle2", timeout: 30000 });

  // Check if we got redirected to login
  const currentUrl = p.url();
  if (currentUrl.includes("/login") || currentUrl.includes("/signin")) {
    console.log("[Browser] Not logged in, attempting login...");

    const email = process.env.TC_EMAIL;
    const password = process.env.TC_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "Not logged into trade-copier.com and no TC_EMAIL/TC_PASSWORD provided"
      );
    }

    // Fill login form — Duplikium uses input#login-username (type="text") and input#login-password
    await p.waitForSelector('#login-username, input[name="login-username"]', {
      timeout: 10000,
    });
    await p.type('#login-username, input[name="login-username"]', email, {
      delay: 50,
    });
    await p.type('#login-password, input[name="login-password"]', password, {
      delay: 50,
    });

    // Click login button
    const loginBtn = await p.$(
      'button[type="submit"], input[type="submit"]'
    );
    if (loginBtn) {
      await loginBtn.click();
    }

    // Wait for navigation to cockpit
    await p.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 });

    if (p.url().includes("/login")) {
      throw new Error("Login failed — still on login page");
    }

    console.log("[Browser] Login successful");
  } else {
    console.log("[Browser] Already logged in");
  }

  return p;
}

/**
 * Navigate to Slaves section by scrolling down or clicking the tab
 */
async function navigateToSlaves(p) {
  // Make sure we're on the cockpit page
  if (!p.url().includes("/cockpit")) {
    await p.goto(COCKPIT_URL, { waitUntil: "networkidle2", timeout: 30000 });
  }

  // Wait for the page to fully load
  await sleep(2000);

  // The Slaves section should be visible - scroll to it
  const slavesHeader = await p.evaluate(() => {
    const elements = document.querySelectorAll("h3, h4, .card-header, span");
    for (const el of elements) {
      if (el.textContent.includes("SLAVES")) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return true;
      }
    }
    return false;
  });

  if (!slavesHeader) {
    console.log("[Browser] Could not find SLAVES section, scrolling down...");
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  await sleep(1000);
}

/**
 * Main automation: Add a slave account on trade-copier.com
 * Uses exact Duplikium form IDs discovered from the cockpit page.
 *
 * Form: #add-slave-form
 * Selects: #add-slave-broker-tech, #add-slave-demo-real, #add-slave-subscription, #add-slave-copy-settings-template
 * Inputs: #add-slave-login-id (MT4), #add-slave-account-number (Tradovate), #add-slave-password (MT4)
 * Submit: button[type="submit"] inside #add-slave-form
 */
async function addSlaveAccount(accountData) {
  const { agency, broker, accountNumber, username, password } = accountData;

  console.log(`[Automation] Starting for account ${accountNumber}`);
  console.log(`  Agency: ${agency}`);
  console.log(`  Broker: ${broker}`);
  console.log(`  Account: ${accountNumber}`);

  const p = await ensureLoggedIn();

  // Navigate to cockpit and find Slaves section
  await navigateToSlaves(p);

  // ─── Step 1: Click "+ Add Slave" button ───
  console.log("[Automation] Clicking + Add Slave...");

  const addSlaveClicked = await p.evaluate(() => {
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
      const text = btn.textContent.trim();
      if (text.includes("Add") && text.includes("Slave")) {
        btn.click();
        return true;
      }
    }
    return false;
  });

  if (!addSlaveClicked) {
    throw new Error("Could not find + Add Slave button");
  }

  // Wait for the Add Slave form to be present
  await p.waitForSelector("#add-slave-form", { timeout: 10000 });
  await sleep(1000);
  console.log("[Automation] Add Slave dialog opened");

  // ─── Step 2: Select Trading Platform ───
  // Use page.select() then dispatch change event for jQuery/framework
  const platformValue = mapBrokerToSelectValue(broker);
  console.log(`[Automation] Selecting platform: ${platformValue}`);

  await p.select("#add-slave-broker-tech", platformValue);
  // Dispatch change event so Duplikium's JS updates the form dynamically
  await p.evaluate(() => {
    const sel = document.getElementById("add-slave-broker-tech");
    if (sel) {
      sel.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  await sleep(2000); // Wait for form to update after platform change

  // ─── Step 3: Select Demo/Real ───
  console.log("[Automation] Setting Demo/Real to Demo");
  await p.select("#add-slave-demo-real", "Demo");
  await p.evaluate(() => {
    const sel = document.getElementById("add-slave-demo-real");
    if (sel) sel.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await sleep(1000);

  // ─── Step 4: Enter Account Number / Login ───
  const isTradovate = platformValue === "tradovate";

  if (isTradovate) {
    // Tradovate uses #add-slave-account-number (text input)
    // Strip dashes from account number — Tradovate format is e.g. APEX414499224
    const cleanAccountNumber = accountNumber.replace(/-/g, "");
    console.log(`[Automation] Entering Tradovate account number: ${cleanAccountNumber} (original: ${accountNumber})`);

    // Wait for the field to be visible (it appears after platform selection)
    await p.waitForSelector("#add-slave-account-number", { visible: true, timeout: 10000 });
    await sleep(500);

    // Focus, clear, and type into the field
    await p.evaluate(() => {
      const input = document.getElementById("add-slave-account-number");
      if (input) {
        input.focus();
        input.value = "";
      }
    });
    await p.type("#add-slave-account-number", cleanAccountNumber, { delay: 50 });
    // Trigger input/change events
    await p.evaluate((val) => {
      const input = document.getElementById("add-slave-account-number");
      if (input) {
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, cleanAccountNumber);
    console.log(`[Automation] Account number field filled`);
  } else {
    // MT4/MT5 uses #add-slave-login-id (number) and #add-slave-password
    console.log(`[Automation] Entering login: ${accountNumber}`);
    await p.click("#add-slave-login-id", { clickCount: 3 });
    await p.type("#add-slave-login-id", accountNumber, { delay: 30 });

    if (password) {
      await p.click("#add-slave-password", { clickCount: 3 });
      await p.type("#add-slave-password", password, { delay: 30 });
    }
  }

  await sleep(500);

  // ─── Step 5: Select Template matching agency name ───
  console.log(`[Automation] Looking for template matching: ${agency}`);

  const templateValue = await p.evaluate((agencyName) => {
    const sel = document.getElementById("add-slave-copy-settings-template");
    if (!sel) return null;
    const normalizedAgency = agencyName.toLowerCase().trim();

    for (const opt of sel.options) {
      const optText = opt.text.toLowerCase().trim();
      if (optText === "select a template (optional)") continue;
      // Check if template name contains agency name
      if (optText.includes(normalizedAgency)) {
        return { value: opt.value, text: opt.text };
      }
      // Check if agency name contains template base name (strip suffixes like AI, 1:1)
      const templateBase = optText.replace(/\s*(ai|1:1|copy|trading)\s*/gi, "").trim();
      if (templateBase.length > 3 && normalizedAgency.includes(templateBase)) {
        return { value: opt.value, text: opt.text };
      }
    }
    return null;
  }, agency);

  if (templateValue) {
    await p.select("#add-slave-copy-settings-template", templateValue.value);
    await p.evaluate(() => {
      const sel = document.getElementById("add-slave-copy-settings-template");
      if (sel) sel.dispatchEvent(new Event("change", { bubbles: true }));
    });
    console.log(`[Automation] Selected template: ${templateValue.text}`);
  } else {
    console.log(`[Automation] WARNING: No template found for agency "${agency}"`);
  }

  await sleep(1000);

  // ─── Step 6: Click "Add" button ───
  // The Add button is NOT inside #add-slave-form — it's inside #modal-slave-add
  // Exact selector: #modal-slave-add > div > div > div > div.block-content.block-content-full.text-end.border-top > button
  // Class: .add-account-button-slave
  const ADD_BTN_SELECTOR = "button.add-account-button-slave";
  console.log("[Automation] Clicking Add button (button.add-account-button-slave)...");

  if (isTradovate && username && password) {
    // For Tradovate: Set up popup listener BEFORE clicking Add
    console.log("[Automation] Setting up Tradovate popup listener...");

    const popupPromise = new Promise((resolve) => {
      browser.once("targetcreated", async (target) => {
        if (target.type() === "page") {
          const newPage = await target.page();
          resolve(newPage);
        }
      });
      // Timeout after 15 seconds
      setTimeout(() => resolve(null), 15000);
    });

    // Click the actual Add button using its correct selector
    await p.waitForSelector(ADD_BTN_SELECTOR, { visible: true, timeout: 5000 });
    await p.click(ADD_BTN_SELECTOR);
    console.log("[Automation] Add button clicked!");

    console.log("[Automation] Waiting for Tradovate OAuth popup...");
    const tradovatePage = await popupPromise;

    if (tradovatePage) {
      console.log(`[Automation] Tradovate popup opened: ${tradovatePage.url()}`);

      // Wait for the login form to load (MUI React app)
      await tradovatePage.waitForSelector("#name-input", { timeout: 15000 });
      await sleep(1000);

      // Clear any pre-filled values and type username
      // Tradovate uses MUI: #name-input (Username), #password-input (Password)
      console.log(`[Automation] Filling Tradovate credentials for: ${username}`);

      await tradovatePage.click("#name-input", { clickCount: 3 });
      await tradovatePage.type("#name-input", username, { delay: 50 });

      await tradovatePage.click("#password-input", { clickCount: 3 });
      await tradovatePage.type("#password-input", password, { delay: 50 });

      await sleep(500);

      // Click the Login button — Tradovate is a React SPA, so we try multiple methods
      console.log("[Automation] Clicking Tradovate Login button...");

      // Log all buttons found on the page for debugging
      const allBtns = await tradovatePage.evaluate(() => {
        const btns = document.querySelectorAll("button");
        return Array.from(btns).map(b => ({
          text: b.textContent.trim(),
          type: b.type,
          classes: b.className,
          tag: b.tagName,
        }));
      });
      console.log(`[Automation] Buttons found on Tradovate page: ${JSON.stringify(allBtns)}`);

      // Method 1: Tab from password field to Login button, then Enter
      console.log("[Automation] Method 1: Tab + Enter from password field...");
      await tradovatePage.keyboard.press("Tab");
      await sleep(300);
      await tradovatePage.keyboard.press("Enter");
      await sleep(1000);

      // Method 2: Find button by coordinates and mouse click
      const loginBtnBox = await tradovatePage.evaluate(() => {
        const buttons = document.querySelectorAll("button");
        for (const btn of buttons) {
          const txt = btn.textContent.trim().toLowerCase();
          if (txt === "login" || txt === "log in" || txt === "sign in") {
            const rect = btn.getBoundingClientRect();
            return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, text: btn.textContent.trim() };
          }
        }
        return null;
      });

      if (loginBtnBox) {
        console.log(`[Automation] Method 2: Mouse click at (${loginBtnBox.x}, ${loginBtnBox.y}) on "${loginBtnBox.text}"`);
        await tradovatePage.mouse.click(loginBtnBox.x, loginBtnBox.y);
        await sleep(500);
        // Double-click as extra measure
        await tradovatePage.mouse.click(loginBtnBox.x, loginBtnBox.y);
      } else {
        console.log("[Automation] No Login button found by text, trying form submit...");
        // Method 3: Submit any form on the page
        await tradovatePage.evaluate(() => {
          const forms = document.querySelectorAll("form");
          if (forms.length > 0) forms[0].submit();
        });
      }

      console.log("[Automation] Tradovate credentials submitted, waiting for redirect...");

      // Wait for the popup to redirect back to trade-copier.com or close
      try {
        await tradovatePage.waitForNavigation({ timeout: 20000, waitUntil: "networkidle2" });
        console.log(`[Automation] Tradovate redirected to: ${tradovatePage.url()}`);
      } catch (err) {
        console.log("[Automation] Tradovate popup navigation timeout — may have closed");
      }

      // Close the popup if it's still open
      try {
        if (!tradovatePage.isClosed()) {
          await tradovatePage.close();
        }
      } catch { /* ignore */ }
    } else {
      console.log("[Automation] No Tradovate popup detected — may already be authorized");
    }

    // Wait and reload cockpit
    await sleep(3000);
    if (!p.url().includes("/cockpit")) {
      await p.goto(COCKPIT_URL, { waitUntil: "networkidle2", timeout: 30000 });
    }
  } else {
    // Non-Tradovate: click Add button with correct selector
    await p.waitForSelector(ADD_BTN_SELECTOR, { visible: true, timeout: 5000 });
    await p.click(ADD_BTN_SELECTOR);
    console.log("[Automation] Add button clicked (non-Tradovate)");
    await sleep(3000);
  }

  await sleep(2000);

  // ─── Step 9: Verify account was added ───
  console.log("[Automation] Verifying account was added...");

  // Reload cockpit to get fresh state
  await p.goto(COCKPIT_URL, { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(2000);

  // Scroll down to SLAVES section
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1000);

  // Check all page content for the account number (use clean number for Tradovate)
  const searchAccount = isTradovate ? accountNumber.replace(/-/g, "") : accountNumber;
  const pageContent = await p.evaluate(() => document.body.textContent);
  const accountInPage = pageContent.includes(searchAccount) || pageContent.includes(accountNumber);

  if (accountInPage) {
    console.log(`[Automation] Account ${searchAccount} found on cockpit page`);

    // ─── Step 10: Ensure toggle is ON ───
    // Toggle is in #table-slaves-accounts > tbody > tr > td:nth-child(9) > div
    // It's a div.form-switch containing input.account-status-slave checkbox
    // We need to find the row that contains our account number, then click the toggle div
    console.log("[Automation] Checking account toggle status...");

    const toggleStatus = await p.evaluate((accNum) => {
      const table = document.getElementById("table-slaves-accounts");
      if (!table) return { found: false, error: "table not found" };
      const rows = table.querySelectorAll("tbody tr");
      for (const row of rows) {
        if (row.textContent.includes(accNum)) {
          const toggleInput = row.querySelector("input.account-status-slave");
          const toggleDiv = row.querySelector("td:nth-child(9) div.form-switch");
          if (toggleInput) {
            return {
              found: true,
              checked: toggleInput.checked,
              id: toggleInput.id,
              hasDiv: !!toggleDiv,
              rowText: row.textContent.trim().substring(0, 200),
            };
          }
        }
      }
      return { found: false, error: `account ${accNum} not found in ${rows.length} rows` };
    }, searchAccount);

    console.log(`[Automation] Toggle check result: ${JSON.stringify(toggleStatus)}`);

    if (toggleStatus.found) {
      if (!toggleStatus.checked) {
        // Toggle is OFF — click the parent div.form-switch (more reliable than input)
        console.log("[Automation] Toggle is OFF — clicking to turn ON...");

        // Click using the toggle's parent div via coordinates (same pattern that works)
        const toggleBox = await p.evaluate((accNum) => {
          const table = document.getElementById("table-slaves-accounts");
          const rows = table.querySelectorAll("tbody tr");
          for (const row of rows) {
            if (row.textContent.includes(accNum)) {
              // Click the div.form-switch container or the input itself
              const toggleDiv = row.querySelector("td:nth-child(9) div.form-switch");
              const toggleInput = row.querySelector("input.account-status-slave");
              const el = toggleDiv || toggleInput;
              if (el) {
                const rect = el.getBoundingClientRect();
                return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
              }
            }
          }
          return null;
        }, searchAccount);

        if (toggleBox) {
          console.log(`[Automation] Clicking toggle at (${toggleBox.x}, ${toggleBox.y})`);
          await p.mouse.click(toggleBox.x, toggleBox.y);
        }

        // Backup: also try clicking by ID
        if (toggleStatus.id) {
          try {
            await p.click(`#${toggleStatus.id}`);
            console.log(`[Automation] Also clicked toggle by ID: #${toggleStatus.id}`);
          } catch (e) {
            console.log(`[Automation] ID click failed: ${e.message}`);
          }
        }

        console.log("[Automation] Toggle clicked — waiting 4 seconds for connection...");
        await sleep(4000);
      } else {
        console.log("[Automation] Toggle already ON");
      }
    } else {
      console.log(`[Automation] WARNING: Could not find toggle — ${toggleStatus.error}`);
    }

    // ─── Step 11: Check for "Connected" status ───
    // Reload to get fresh status
    await p.reload({ waitUntil: "networkidle2", timeout: 30000 });
    await sleep(2000);
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1000);

    const statusInfo = await p.evaluate((accNum) => {
      const bodyText = document.body.textContent;
      const bodyHtml = document.body.innerHTML;
      // Look for status near the account number
      const rows = document.querySelectorAll("tr, .slave-row, [class*='slave']");
      for (const row of rows) {
        if (row.textContent.includes(accNum)) {
          const rowText = row.textContent.toLowerCase();
          return {
            connected: rowText.includes("connected"),
            wrongAccount: rowText.includes("wrong account"),
            rowText: row.textContent.trim().substring(0, 200),
          };
        }
      }
      // Fallback: check whole page
      return {
        connected: bodyText.toLowerCase().includes("connected"),
        wrongAccount: bodyText.toLowerCase().includes("wrong account"),
        rowText: null,
      };
    }, searchAccount);

    const isConnected = statusInfo.connected && !statusInfo.wrongAccount;
    console.log(`[Automation] Final status: ${isConnected ? "CONNECTED" : "NOT YET CONNECTED"}`);
    if (statusInfo.rowText) {
      console.log(`[Automation] Row content: ${statusInfo.rowText}`);
    }

    return {
      success: true,
      connected: isConnected,
      accountNumber: searchAccount,
      template: templateValue ? templateValue.text : null,
    };
  } else {
    console.log(`[Automation] WARNING: Account ${searchAccount} not found on page after adding`);
    return {
      success: true,
      connected: false,
      accountNumber: searchAccount,
      template: templateValue ? templateValue.text : null,
      note: "Account not visible yet — may need Tradovate OAuth authorization",
    };
  }
}

function mapBrokerToSelectValue(broker) {
  const mapping = {
    tradovate: "tradovate",
    ninjatrader: "tradovate",
    "metatrader 4": "mt4",
    mt4: "mt4",
    "metatrader 5": "mt5",
    mt5: "mt5",
    ctrader: "ctrader",
    fxcm: "fxcm_fc",
    lmax: "lmax",
    dxtrade: "dxtrade",
    fortex: "fortex",
  };
  return mapping[broker.toLowerCase().trim()] || broker.toLowerCase();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cleanup browser on shutdown
 */
async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
  }
}

module.exports = {
  addSlaveAccount,
  closeBrowser,
  ensureLoggedIn,
};

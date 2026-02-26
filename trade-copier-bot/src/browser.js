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
    headless: "new",
    userDataDir: path.resolve(userDataDir),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
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

    // Fill login form
    await p.waitForSelector('input[type="email"], input[name="email"]', {
      timeout: 10000,
    });
    await p.type('input[type="email"], input[name="email"]', email, {
      delay: 50,
    });
    await p.type('input[type="password"], input[name="password"]', password, {
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
    // Find buttons that contain "Add" and "Slave"
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
      const text = btn.textContent.trim();
      if (text.includes("Add") && text.includes("Slave")) {
        // Make sure this is in the SLAVES section, not MASTERS
        const parent = btn.closest(".card, .panel, [class*=slave]") || btn.parentElement;
        btn.click();
        return true;
      }
    }
    return false;
  });

  if (!addSlaveClicked) {
    // Fallback: find by the second "Add" button (first is for Masters)
    const addButtons = await p.$$('button:has(span)');
    let foundSlaveAdd = false;
    for (const btn of addButtons) {
      const text = await p.evaluate((el) => el.textContent.trim(), btn);
      if (text.includes("Add") && text.includes("Slave")) {
        await btn.click();
        foundSlaveAdd = true;
        break;
      }
    }
    if (!foundSlaveAdd) {
      throw new Error("Could not find + Add Slave button");
    }
  }

  // Wait for the Add Slave dialog to appear
  await p.waitForSelector("dialog, .modal, [role=dialog]", { timeout: 10000 });
  await sleep(1000);
  console.log("[Automation] Add Slave dialog opened");

  // ─── Step 2: Select Trading Platform ───
  const platformValue = mapBrokerToSelectValue(broker);
  console.log(`[Automation] Selecting platform: ${platformValue}`);

  await p.evaluate((val) => {
    const selects = document.querySelectorAll("dialog select, .modal select");
    for (const sel of selects) {
      const options = Array.from(sel.options);
      for (const opt of options) {
        if (opt.value === val || opt.text.toLowerCase().includes(val)) {
          sel.value = opt.value;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        }
      }
    }
    return false;
  }, platformValue);

  await sleep(1500); // Wait for form to update after platform change

  // ─── Step 3: Keep Demo/Real on "Demo" ───
  // (It defaults to Demo, but let's make sure)
  await p.evaluate(() => {
    const selects = document.querySelectorAll("dialog select, .modal select");
    for (const sel of selects) {
      const options = Array.from(sel.options);
      const hasDemo = options.some(
        (o) => o.text === "Demo" || o.value === "Demo"
      );
      if (hasDemo && options.length <= 3) {
        for (const opt of options) {
          if (opt.text === "Demo") {
            sel.value = opt.value;
            sel.dispatchEvent(new Event("change", { bubbles: true }));
            break;
          }
        }
      }
    }
  });

  await sleep(500);

  // ─── Step 4: Enter Account Number ───
  console.log(`[Automation] Entering account number: ${accountNumber}`);

  const isTradovate = platformValue === "tradovate";

  if (isTradovate) {
    // For Tradovate, the account field is a text input with placeholder containing "Account Number"
    await p.evaluate((accNum) => {
      const inputs = document.querySelectorAll(
        "dialog input[type=text], .modal input[type=text]"
      );
      for (const input of inputs) {
        if (
          input.placeholder &&
          input.placeholder.toLowerCase().includes("account")
        ) {
          input.value = "";
          input.focus();
          // Use native input setter to trigger React/Vue change detection
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value"
          ).set;
          nativeInputValueSetter.call(input, accNum);
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        }
      }
      return false;
    }, accountNumber);
  } else {
    // For MT4/MT5 etc, the Login field is a number input
    await p.evaluate((accNum) => {
      const inputs = document.querySelectorAll(
        'dialog input[type="number"], .modal input[type="number"]'
      );
      for (const input of inputs) {
        if (input.placeholder && input.placeholder.toLowerCase().includes("login")) {
          input.focus();
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value"
          ).set;
          nativeInputValueSetter.call(input, accNum);
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        }
      }
      return false;
    }, accountNumber);
  }

  await sleep(500);

  // ─── Step 5: Keep IP attribution on "Default" ───
  // Already default, but click it to be safe
  await p.evaluate(() => {
    const radios = document.querySelectorAll(
      'dialog input[type="radio"], .modal input[type="radio"]'
    );
    for (const radio of radios) {
      const label =
        radio.nextElementSibling?.textContent ||
        radio.parentElement?.textContent ||
        "";
      if (label.includes("Default")) {
        radio.click();
        break;
      }
    }
  });

  // ─── Step 6: Select Template matching agency name ───
  console.log(`[Automation] Looking for template matching: ${agency}`);

  const templateSelected = await p.evaluate((agencyName) => {
    const selects = document.querySelectorAll("dialog select, .modal select");
    const normalizedAgency = agencyName.toLowerCase().trim();

    for (const sel of selects) {
      const options = Array.from(sel.options);
      // Check if this is the template dropdown
      const isTemplateDropdown = options.some(
        (o) =>
          o.text.includes("template") ||
          o.text.includes("Template") ||
          o.value.length === 8 // template IDs are 8 chars like "frftmKKq"
      );

      if (isTemplateDropdown) {
        // Find best match
        let bestMatch = null;

        for (const opt of options) {
          const optText = opt.text.toLowerCase().trim();
          if (optText === "select a template (optional)") continue;

          // Check if template name contains agency name
          if (optText.includes(normalizedAgency)) {
            bestMatch = opt;
            break;
          }
          // Check if agency name contains template base name
          const templateBase = optText
            .replace(/\s*(ai|1:1|copy|trading)\s*/gi, "")
            .trim();
          if (
            templateBase.length > 3 &&
            normalizedAgency.includes(templateBase)
          ) {
            bestMatch = opt;
          }
        }

        if (bestMatch) {
          sel.value = bestMatch.value;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          return bestMatch.text;
        }
      }
    }
    return null;
  }, agency);

  if (templateSelected) {
    console.log(`[Automation] Selected template: ${templateSelected}`);
  } else {
    console.log(
      `[Automation] WARNING: No template found for agency "${agency}"`
    );
  }

  await sleep(500);

  // ─── Step 7: Click "Add" submit button ───
  console.log("[Automation] Clicking Add...");

  await p.evaluate(() => {
    const buttons = document.querySelectorAll(
      'dialog button[type="submit"], .modal button[type="submit"]'
    );
    for (const btn of buttons) {
      if (btn.textContent.trim() === "Add") {
        btn.click();
        return true;
      }
    }
    // Fallback
    const allBtns = document.querySelectorAll("dialog button, .modal button");
    for (const btn of allBtns) {
      if (
        btn.textContent.trim() === "Add" &&
        !btn.textContent.includes("Slave")
      ) {
        btn.click();
        return true;
      }
    }
    return false;
  });

  await sleep(3000);

  // ─── Step 8: Handle Tradovate login popup (if applicable) ───
  if (isTradovate && username && password) {
    console.log("[Automation] Handling Tradovate login popup...");

    // Wait for the Tradovate auth popup/iframe
    await sleep(2000);

    // Check for a new popup window or iframe
    const pages = await browser.pages();
    let tradovatePage = null;

    // Check if there's a new page (popup window)
    for (const pg of pages) {
      const url = pg.url();
      if (
        url.includes("tradovate") ||
        url.includes("auth") ||
        url.includes("oauth")
      ) {
        tradovatePage = pg;
        break;
      }
    }

    if (tradovatePage) {
      // Handle popup window
      console.log("[Automation] Found Tradovate popup window");
      await handleTradovateLogin(tradovatePage, username, password);
    } else {
      // Check for iframe or inline form on the same page
      const hasLoginForm = await p.evaluate(() => {
        // Look for username/email + password fields that appeared after clicking Add
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
        let hasUser = false;
        let hasPass = false;
        for (const input of inputs) {
          const placeholder = (input.placeholder || "").toLowerCase();
          const name = (input.name || "").toLowerCase();
          const id = (input.id || "").toLowerCase();
          const label = placeholder + name + id;
          if (label.includes("user") || label.includes("email") || label.includes("login")) hasUser = true;
          if (input.type === "password") hasPass = true;
        }
        return hasUser && hasPass;
      });

      if (hasLoginForm) {
        console.log("[Automation] Found inline Tradovate login form");
        await handleTradovateLogin(p, username, password);
      } else {
        // Try waiting for an iframe
        try {
          await p.waitForSelector("iframe", { timeout: 5000 });
          const frames = p.frames();
          for (const frame of frames) {
            const url = frame.url();
            if (url.includes("tradovate") || url.includes("auth")) {
              console.log("[Automation] Found Tradovate iframe");
              await handleTradovateLoginInFrame(frame, username, password);
              break;
            }
          }
        } catch {
          console.log(
            "[Automation] No Tradovate login popup detected — may already be authorized"
          );
        }
      }
    }

    // Wait for redirect back to cockpit
    await sleep(3000);
    if (!p.url().includes("/cockpit")) {
      await p.goto(COCKPIT_URL, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });
    }
  }

  await sleep(2000);

  // ─── Step 9: Verify account was added and toggle ON ───
  console.log("[Automation] Verifying account was added...");

  // Navigate to cockpit and scroll to slaves
  await navigateToSlaves(p);
  await sleep(1000);

  // Search for the account
  const accountFound = await p.evaluate((accNum) => {
    // Find the search box in the Slaves section
    const searchBoxes = document.querySelectorAll(
      'input[placeholder*="Search Account"]'
    );
    // The second search box is for Slaves (first is Masters)
    const slaveSearch = searchBoxes.length > 1 ? searchBoxes[1] : searchBoxes[0];
    if (slaveSearch) {
      slaveSearch.value = "";
      slaveSearch.focus();
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      nativeInputValueSetter.call(slaveSearch, accNum);
      slaveSearch.dispatchEvent(new Event("input", { bubbles: true }));
      slaveSearch.dispatchEvent(new Event("keyup", { bubbles: true }));
      return true;
    }
    return false;
  }, accountNumber);

  await sleep(2000);

  // Check if account row exists and get its status
  const accountStatus = await p.evaluate((accNum) => {
    const rows = document.querySelectorAll("table tbody tr, tr");
    for (const row of rows) {
      const text = row.textContent || "";
      if (text.includes(accNum)) {
        // Check for toggle switch
        const toggle = row.querySelector(
          'input[type="checkbox"], .toggle, .switch'
        );
        const statusCell = row.querySelector(
          'td:last-child, .status, [class*="status"]'
        );
        const statusText = statusCell ? statusCell.textContent.trim() : "";

        return {
          found: true,
          status: statusText,
          toggleState: toggle ? toggle.checked : null,
        };
      }
    }
    return { found: false };
  }, accountNumber);

  if (!accountStatus.found) {
    console.log(
      `[Automation] WARNING: Account ${accountNumber} not found in slaves list after adding`
    );
    return { success: false, reason: "Account not found after adding" };
  }

  console.log(
    `[Automation] Account found! Status: ${accountStatus.status}, Toggle: ${accountStatus.toggleState}`
  );

  // Toggle ON if it's off
  if (accountStatus.toggleState === false) {
    console.log("[Automation] Toggling account ON...");

    await p.evaluate((accNum) => {
      const rows = document.querySelectorAll("table tbody tr, tr");
      for (const row of rows) {
        if (row.textContent.includes(accNum)) {
          const toggle = row.querySelector(
            'input[type="checkbox"], .toggle, .switch'
          );
          if (toggle) {
            toggle.click();
            return true;
          }
          // Try clicking the toggle's parent/label
          const toggleLabel = row.querySelector(
            ".custom-control-label, label[for], .slider"
          );
          if (toggleLabel) {
            toggleLabel.click();
            return true;
          }
        }
      }
      return false;
    }, accountNumber);

    await sleep(2000);
    console.log("[Automation] Toggle clicked");
  }

  // Final status check
  const finalStatus = await p.evaluate((accNum) => {
    const rows = document.querySelectorAll("table tbody tr, tr");
    for (const row of rows) {
      if (row.textContent.includes(accNum)) {
        return row.textContent;
      }
    }
    return null;
  }, accountNumber);

  const isConnected =
    finalStatus &&
    finalStatus.toLowerCase().includes("connected") &&
    !finalStatus.toLowerCase().includes("wrong");

  console.log(
    `[Automation] Final status: ${isConnected ? "CONNECTED" : "NOT YET CONNECTED"}`
  );

  return {
    success: true,
    connected: isConnected,
    accountNumber,
    template: templateSelected,
  };
}

/**
 * Handle Tradovate login on a page or popup
 */
async function handleTradovateLogin(targetPage, username, password) {
  try {
    // Wait for login form fields
    await targetPage.waitForSelector(
      'input[type="text"], input[type="email"], input[name="username"]',
      { timeout: 10000 }
    );

    // Find and fill username
    await targetPage.evaluate((user) => {
      const inputs = document.querySelectorAll(
        'input[type="text"], input[type="email"]'
      );
      for (const input of inputs) {
        const placeholder = (input.placeholder || "").toLowerCase();
        const name = (input.name || "").toLowerCase();
        const id = (input.id || "").toLowerCase();
        if (
          placeholder.includes("user") ||
          placeholder.includes("email") ||
          placeholder.includes("login") ||
          name.includes("user") ||
          name.includes("email") ||
          id.includes("user") ||
          id.includes("email")
        ) {
          input.focus();
          const setter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value"
          ).set;
          setter.call(input, user);
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
          return;
        }
      }
      // Fallback: just use the first text input
      if (inputs.length > 0) {
        inputs[0].focus();
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        ).set;
        setter.call(inputs[0], user);
        inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
        inputs[0].dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, username);

    await sleep(300);

    // Fill password
    await targetPage.evaluate((pass) => {
      const input = document.querySelector('input[type="password"]');
      if (input) {
        input.focus();
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        ).set;
        setter.call(input, pass);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, password);

    await sleep(300);

    // Click login button
    await targetPage.evaluate(() => {
      const buttons = document.querySelectorAll(
        'button[type="submit"], button, input[type="submit"]'
      );
      for (const btn of buttons) {
        const text = (btn.textContent || btn.value || "").toLowerCase();
        if (
          text.includes("login") ||
          text.includes("sign in") ||
          text.includes("submit") ||
          text.includes("connect")
        ) {
          btn.click();
          return true;
        }
      }
      // Fallback: click the first submit button
      const submit = document.querySelector('button[type="submit"]');
      if (submit) submit.click();
      return false;
    });

    console.log("[Automation] Tradovate credentials submitted");
    await sleep(3000);
  } catch (err) {
    console.error("[Automation] Error during Tradovate login:", err.message);
  }
}

/**
 * Handle Tradovate login in an iframe
 */
async function handleTradovateLoginInFrame(frame, username, password) {
  try {
    await frame.waitForSelector(
      'input[type="text"], input[type="email"]',
      { timeout: 10000 }
    );

    const usernameInput = await frame.$(
      'input[type="text"], input[type="email"]'
    );
    const passwordInput = await frame.$('input[type="password"]');

    if (usernameInput) {
      await usernameInput.click({ clickCount: 3 });
      await usernameInput.type(username, { delay: 50 });
    }

    if (passwordInput) {
      await passwordInput.click({ clickCount: 3 });
      await passwordInput.type(password, { delay: 50 });
    }

    const loginBtn = await frame.$(
      'button[type="submit"], button:has-text("Login"), button:has-text("Sign")'
    );
    if (loginBtn) await loginBtn.click();

    console.log("[Automation] Tradovate credentials submitted via iframe");
    await sleep(3000);
  } catch (err) {
    console.error(
      "[Automation] Error during Tradovate iframe login:",
      err.message
    );
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

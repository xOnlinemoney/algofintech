/**
 * Parse Slack "New Account Added" messages into structured data.
 * Handles both Block Kit formatted messages and plain text fallback.
 */

function parseAccountMessage(message) {
  // Try Block Kit format first (our webhook sends blocks)
  if (message.blocks && message.blocks.length > 0) {
    return parseBlockKit(message.blocks);
  }

  // Fallback: parse plain text
  if (message.text) {
    return parsePlainText(message.text);
  }

  return null;
}

function parseBlockKit(blocks) {
  const data = {};

  for (const block of blocks) {
    if (block.type === "header") {
      // Verify this is a "New Account Added" notification
      const headerText = block.text?.text || "";
      if (!headerText.includes("New Account Added")) {
        return null;
      }
    }

    if (block.type === "section" && block.fields) {
      for (const field of block.fields) {
        const text = field.text || "";
        const lines = text.split("\n");

        if (lines.length >= 2) {
          const label = lines[0].replace(/\*/g, "").replace(":", "").trim();
          const value = lines.slice(1).join("\n").trim();

          switch (label) {
            case "Agency":
              data.agency = value;
              break;
            case "Client":
              data.client = value;
              break;
            case "Broker":
              data.broker = value;
              break;
            case "Account #":
              data.accountNumber = value;
              break;
            case "Username":
              data.username = value;
              break;
            case "Password":
              data.password = value;
              break;
          }
        }
      }
    }
  }

  // Validate we have all required fields
  if (data.agency && data.broker && data.accountNumber) {
    return data;
  }

  return null;
}

function parsePlainText(text) {
  const data = {};

  const patterns = {
    agency: /Agency:\s*(.+)/i,
    client: /Client:\s*(.+)/i,
    broker: /Broker:\s*(.+)/i,
    accountNumber: /Account\s*#?:\s*(.+)/i,
    username: /Username:\s*(.+)/i,
    password: /Password:\s*(.+)/i,
  };

  for (const [key, regex] of Object.entries(patterns)) {
    const match = text.match(regex);
    if (match) {
      data[key] = match[1].trim();
    }
  }

  if (data.agency && data.broker && data.accountNumber) {
    return data;
  }

  return null;
}

/**
 * Map broker name from our system to trade-copier.com platform value
 */
function mapBrokerToPlatform(broker) {
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

  const normalized = broker.toLowerCase().trim();
  return mapping[normalized] || null;
}

/**
 * Find the best matching template for an agency name.
 * Templates on trade-copier.com may have suffixes like "AI", "1:1", etc.
 * We do a fuzzy match: if the agency name appears within a template name, it's a match.
 */
function findTemplateForAgency(agencyName, templates) {
  const normalizedAgency = agencyName.toLowerCase().trim();

  // First try exact match
  for (const t of templates) {
    if (t.text.toLowerCase().trim() === normalizedAgency) {
      return t;
    }
  }

  // Then try: template contains agency name
  for (const t of templates) {
    if (t.text.toLowerCase().includes(normalizedAgency)) {
      return t;
    }
  }

  // Then try: agency name contains template name
  for (const t of templates) {
    const templateName = t.text.toLowerCase().trim();
    if (templateName !== "select a template (optional)" && normalizedAgency.includes(templateName)) {
      return t;
    }
  }

  return null;
}

module.exports = {
  parseAccountMessage,
  mapBrokerToPlatform,
  findTemplateForAgency,
};

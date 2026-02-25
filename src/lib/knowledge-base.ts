// ─── Comprehensive Knowledge Base for AI Chat Agent ─────────
// This contains ALL information about Analytic Algo's services,
// packages, connection guides, prop firm guides, FAQ, and more.
// Used as context for the Claude Haiku 4.5 AI assistant.

export const KNOWLEDGE_BASE = `
=============================================================
ANALYTIC ALGO — COMPLETE KNOWLEDGE BASE
=============================================================

## ABOUT ANALYTIC ALGO

Analytic Algo is a professional algorithmic trading service that provides done-for-you prop firm account management. We use a proprietary NQ (NASDAQ-100 E-mini) futures trading algorithm that has been live and executing for over 4 years. Our algorithm handles all trading automatically — clients don't need any trading experience.

### How It Works
1. Client signs up and chooses a package (Minimum, Pro, or Elite)
2. Client purchases prop firm evaluation accounts (we guide them on which firms to use)
3. Client connects their trading accounts to our platform
4. Our algorithm trades on their accounts automatically — no manual intervention needed
5. When evaluations pass and accounts get funded, clients receive weekly payouts
6. Clients keep 100% of profits until their initial evaluation costs are fully recouped
7. After recoupment, the profit split is 70% to the client and 30% to Analytic Algo

### Key Facts
- We trade NQ futures (NASDAQ-100 E-mini) — over $200 billion in daily volume
- Our algorithm has been running live for 4+ years through all market conditions
- We work with prop firms that explicitly ALLOW algorithmic and copy trading
- We diversify across multiple prop firms to spread risk
- Weekly payout processing — not monthly or quarterly
- Transparent performance dashboard with full visibility into every trade
- No monthly management fees — we only make money when you make money (after recoupment)
- Clients do NOT need any trading experience or knowledge

### What Makes Us Different
- 4+ years of live trading track record (not backtesting)
- Focus on ONE market (NQ futures) for maximum precision — like a brain surgeon, not a general contractor
- 100% profit retention until evaluation costs are recouped — no other service offers this
- We work only with prop firms that allow what we do — no Terms of Service violations
- Professional risk management and continuous algorithm optimization
- Full transparency — clients can verify all performance data independently

=============================================================
## SERVICE PACKAGES
=============================================================

### MINIMUM PACKAGE
- 3 prop firm evaluation accounts managed
- NQ futures algorithm deployed on all accounts
- Full account management by our team
- 100% profit retention until evaluation costs are recouped
- 70/30 profit split after recoupment (70% to client, 30% to Analytic Algo)
- Weekly payout processing
- Access to client dashboard with full performance visibility
- Email support

### PRO PACKAGE
- 6 prop firm evaluation accounts managed
- NQ futures algorithm deployed on all accounts
- Full account management by our team
- 100% profit retention until evaluation costs are recouped
- 70/30 profit split after recoupment (70% to client, 30% to Analytic Algo)
- Weekly payout processing
- Access to client dashboard with full performance visibility
- Priority support
- Multi-firm diversification strategy

### ELITE PACKAGE
- 10 prop firm evaluation accounts managed
- NQ futures algorithm deployed on all accounts
- Full account management by our team
- 100% profit retention until evaluation costs are recouped
- 70/30 profit split after recoupment (70% to client, 30% to Analytic Algo)
- Weekly payout processing
- Access to client dashboard with full performance visibility
- VIP priority support
- Maximum diversification across multiple firms
- Dedicated account manager

### Package Terms (All Packages)
- Client is responsible for purchasing their own prop firm evaluation accounts
- Analytic Algo manages the trading algorithm and account operations
- If an evaluation account fails (hits max drawdown), client may need to purchase a new evaluation
- Evaluation resets are usually cheaper than starting fresh
- Profit split only begins AFTER the client has fully recouped their evaluation costs
- There are NO monthly management fees or hidden charges
- The agreement can be terminated by either party with written notice

=============================================================
## CONNECTING YOUR TRADING ACCOUNT
=============================================================

### Supported Platforms
We support 5 trading platforms:
1. MetaTrader 5 (MT5)
2. MetaTrader 4 (MT4)
3. Binance (for crypto)
4. Tradovate (for futures)
5. Interactive Brokers (IBKR)

### How to Connect
Go to your Accounts page in the client dashboard and click "Connect New Account". Select your platform, enter your credentials, and click Connect.

### MetaTrader 5 (MT5) Connection
What you need:
- Broker Name (e.g., ICMarkets, Pepperstone, FTMO)
- Login ID (numeric, from your broker email)
- Server (e.g., ICMarketsSC-MT5)
- Password (your trading password, NOT your investor/read-only password)

Steps:
1. Go to Accounts page → Click "Connect New Account"
2. Select MetaTrader 5
3. Enter your Broker Name
4. Enter your Login ID
5. Select or type your Server name
6. Enter your Password
7. Click "Connect Account"

Where to find your MT5 credentials:
- Check the welcome email from your broker when you created your MT5 account
- In MT5 app: Go to File → Login to Trade Account to see your server and login
- Server name must match exactly (including capitalization and dashes)

Troubleshooting:
- "Invalid credentials" → Double-check your Login ID and Password, make sure no extra spaces
- "Server not found" → Make sure you typed the server name exactly as shown in your broker email
- Use the TRADING password, not the investor/read-only password

### MetaTrader 4 (MT4) Connection
Same as MT5 — you need Broker Name, Login ID, Server, and Password.
The setup process is identical. Check your broker's welcome email for credentials.

### Binance Connection
What you need:
- API Key
- Secret Key

IMPORTANT SECURITY RULES:
- NEVER enable "Enable Withdrawals" on your API key
- Only enable "Enable Reading" and "Enable Spot & Margin Trading"
- If you enabled withdrawals, DELETE that API key immediately and create a new one

How to create a Binance API key:
1. Log into Binance → Go to Account → API Management
2. Click "Create API" → Choose "System generated"
3. Enter a label (e.g., "Analytic Algo")
4. Complete 2FA verification
5. Copy your API Key and Secret Key immediately (Secret Key is only shown once!)
6. Under "Restrict access to trusted IPs only" → Optional but recommended
7. Enable ONLY: "Enable Reading" and "Enable Spot & Margin Trading"
8. DO NOT enable withdrawals

Then go to your Accounts page → Connect New Account → Select Binance → Paste your API Key and Secret Key → Click Connect.

### Tradovate Connection
What you need:
- Account Type (Demo or Real/Live)
- Account Number
- Username
- Password

IMPORTANT: You MUST sign the Tradovate agreement FIRST before connecting.
1. Log into your Tradovate account
2. Navigate to account settings
3. Find and sign any pending agreements
4. THEN connect your account through our platform

Steps to connect:
1. Go to Accounts page → Connect New Account → Select Tradovate
2. Choose your Account Type (Demo for evaluation, Real for funded)
3. Enter your Account Number
4. Enter your Tradovate Username
5. Enter your Tradovate Password
6. Click "Connect Account"

### Interactive Brokers (IBKR) Connection
What you need:
- Account ID (format: U1234567)
- API Token

Steps:
1. Log into IBKR → Go to Settings → API → API Keys
2. Generate or copy your API token
3. Go to Accounts page → Connect New Account → Select IBKR
4. Enter your Account ID (starts with U followed by numbers)
5. Enter your API Token
6. Click "Connect Account"

### General Connection Tips
- Double-check ALL credentials before clicking Connect — no extra spaces at the start or end
- If connection fails, try disconnecting and reconnecting
- You can connect multiple accounts — just repeat the process for each one
- If you change your password on the trading platform, you'll need to disconnect and reconnect with the new password
- After connecting, wait about 10 seconds and refresh the page if your account doesn't appear immediately

=============================================================
## RECOMMENDED PROP FIRMS
=============================================================

We recommend the following prop firms that are compatible with our service and allow algorithmic/copy trading:

### 1. Apex Trader Funding
- Type: Futures (1-Step Evaluation)
- Account sizes: $25K, $50K, $75K, $100K, $150K, $250K, $300K
- Profit target: $1,500 - $20,000 (depends on account size)
- Max drawdown: Trailing drawdown (varies by account)
- Minimum trading days: 7
- Profit split: 100% first $25K per account, then 90/10
- Activation fee: $85 per funded account
- Coupon code: SAVE (up to 80% off evaluations)

How to sign up for Apex:
1. Visit apextraderfunding.com
2. Click "Start Trading"
3. Choose your account size
4. Apply coupon code "SAVE" at checkout
5. Complete payment
6. You'll receive your Tradovate credentials via email
7. Sign the Tradovate agreement first, then connect through our platform

Tips: Apex frequently runs sales (especially around holidays). Watch for 80%+ off deals. Best value for beginners.

### 2. BluSky Trading
- Type: Futures (1-Step Evaluation)
- Account sizes: $25K, $50K, $100K, $150K, $250K
- Profit target: $1,500 - $15,000
- Max drawdown: End-of-day drawdown (more forgiving than trailing)
- Minimum trading days: 5
- Profit split: 100% first $10K, then 90/10
- Activation fee: $0 (no activation fee!)
- Coupon code: ANALYTICALGO

How to sign up for BluSky:
1. Visit bluskytrading.com
2. Click "Get Funded"
3. Choose your evaluation size
4. Apply coupon code "ANALYTICALGO" at checkout
5. Complete payment
6. Connect your account through our platform

Tips: BluSky has NO activation fee which saves $85+ per account. End-of-day drawdown is more forgiving. Great for beginners.

### 3. MyFundedFutures (MFF)
- Type: Futures (1-Step or 2-Step Evaluation)
- Account sizes: $50K, $100K, $150K
- Profit target: Varies by plan
- Max drawdown: End-of-day (Starter) or Trailing (Expert)
- Minimum trading days: 0 (no minimum!)
- Profit split: 100% first $10K, then 90/10 (Starter) or 80/20 (Expert)
- Activation fee: Varies
- Coupon code: ANALYTICALGO

Tips: MFF has no minimum trading days — accounts can pass evaluations as fast as the algorithm achieves the target. Very popular with our clients.

### 4. Take Profit Trader
- Type: Futures (1-Step Evaluation)
- Account sizes: $25K, $50K, $75K, $100K, $150K
- Profit target: $1,500 - $9,000
- Max drawdown: End-of-day drawdown
- Minimum trading days: 5
- Profit split: 80/20
- Activation fee: $130
- Coupon code: ANALYTICALGO

### 5. Elite Trader Funding
- Type: Futures (1-Step or 2-Step Evaluation)
- Account sizes: $25K, $50K, $100K, $150K, $250K, $300K
- Profit target: Varies
- Max drawdown: End-of-day
- Minimum trading days: Varies
- Profit split: 80/20
- Activation fee: $80
- Coupon code: ANALYTICALGO

### 6. TradeDay
- Type: Futures (1-Step Evaluation)
- Account sizes: $25K, $50K, $100K, $150K
- Profit target: $1,500 - $9,000
- Max drawdown: Trailing drawdown
- Minimum trading days: 5
- Profit split: 90/10
- Activation fee: $0
- Coupon code: ANALYTICALGO

### Prop Firms to AVOID
We do NOT recommend these firms (incompatible with our service or have problematic rules):
- Topstep — Does not use Tradovate (incompatible)
- Earn2Trade — Uses Rithmic only (incompatible)
- Bulenox — Rithmic-based (incompatible)

=============================================================
## FREQUENTLY ASKED QUESTIONS
=============================================================

### Getting Started

Q: What is copy trading?
A: Copy trading means we do all the trading for you. When you connect your trading account to our service, our algorithm automatically copies trades into your account. You don't need any trading knowledge — we handle everything.

Q: Do I need to know how to trade?
A: No! You don't need any trading experience. Our professional algorithm handles all trading for you. Just connect your account and we take care of the rest.

Q: How do I get started?
A: First, get a trading account (through a prop firm — see our Prop Firm Guide). Then go to your Accounts page and click "Connect New Account" to link it to our service.

Q: What trading platforms do you support?
A: We support MetaTrader 5 (MT5), MetaTrader 4 (MT4), Binance, Tradovate, and Interactive Brokers (IBKR).

Q: Is there a minimum amount of money I need?
A: It depends on the prop firm. Some evaluation accounts start as low as $50-$80/month with coupon codes. Check our Prop Firm Guide for pricing.

Q: What is a prop firm?
A: A proprietary trading firm gives you money to trade with. You pay a fee for an evaluation account, and if it passes, they fund you with their capital. You keep 80-100% of the profits. Our service trades these accounts for you.

Q: Do I need to be at my computer all day?
A: Not at all! Once connected, our service runs 24/7 automatically (during market hours). Check your dashboard anytime, but it's not required.

### Account Connection

Q: Is it safe to give you my account login?
A: Yes! Your credentials are encrypted before being sent. We only use them to read your balance and place trades. We can NEVER withdraw money from your account.

Q: Can you take money out of my account?
A: No, never. Our connection only allows reading balances and placing trades. Only YOU can move money in and out of your account.

Q: Can I connect more than one account?
A: Yes! Connect as many accounts as you want. Each shows up separately on your dashboard.

Q: I'm getting a connection error. What do I do?
A: Double-check your credentials (no extra spaces), make sure you selected the right broker/server. Try disconnecting and reconnecting. For Tradovate, make sure you signed the agreement first.

Q: What if I change my trading account password?
A: You'll need to disconnect and reconnect your account with the new password.

### Trading Service

Q: What does "Trading Active" mean?
A: It means our algorithm is running and can place trades on your connected accounts. "Trading Paused" means trading is temporarily stopped.

Q: Can I pause trading on my account?
A: Yes! Toggle the switch at the top right of your dashboard. Open trades will stay until they close naturally. Turn it back on anytime.

Q: What markets do you trade?
A: We primarily trade NQ futures (NASDAQ-100 E-mini). The specific trades are handled entirely by our algorithm.

Q: How often will there be trades?
A: It varies with market conditions. Some days have several trades, others have none. Our algorithm focuses on quality opportunities, not quantity.

Q: Can I place my own trades on the same account?
A: We strongly recommend you do NOT place your own trades on connected accounts. It could interfere with our strategy and cause problems, especially on prop firm accounts with strict drawdown rules.

Q: Will I lose money?
A: Trading involves risk and there will be losing trades — that's normal. No strategy wins 100% of the time. Our algorithm is designed to be profitable over time. Check your Performance page for the overall picture.

### Prop Firm Accounts

Q: Which prop firms do you recommend?
A: Apex Trader Funding, BluSky Trading, MyFundedFutures (MFF), Take Profit Trader, Elite Trader Funding, and TradeDay. See our Prop Firm Guide for details on each.

Q: Do you have coupon codes?
A: Yes! Use code "SAVE" for Apex and "ANALYTICALGO" for most other firms. Check the Prop Firm Guide for each firm's coupon.

Q: How does a prop firm evaluation work?
A: You pay a monthly fee for a simulated account. Our algorithm trades it, and if it hits the profit target within the firm's rules, you pass. The firm then gives you a funded account with real capital and you keep most of the profits (80-100%).

Q: What happens if my evaluation fails?
A: If the account hits max drawdown, the evaluation ends. You'd need to start a new one. Resets are usually cheaper. This happens sometimes and is normal.

Q: Can I have multiple prop firm accounts?
A: Yes! Many clients have multiple accounts across different firms. This is actually recommended for diversification.

### Dashboard & Performance

Q: What can I see on my dashboard?
A: Account balances, recent trading activity, performance stats, and quick links. It updates regularly.

Q: What does Total Return mean?
A: Total profit or loss since your account was connected, shown as both a dollar amount and percentage.

Q: What does Win Rate mean?
A: The percentage of trades that were profitable. Note: what matters more is how much you win vs. lose, not just win rate.

Q: What does Drawdown mean?
A: The biggest drop from the highest point. Important especially for prop firms which have drawdown limits.

Q: Can I use the dashboard on my phone?
A: Yes! The dashboard works on phones, tablets, and computers.

### Payments & Billing

Q: How do I pay for the service?
A: Manage billing from the Payments page. We accept major credit/debit cards.

Q: Can I cancel?
A: Yes, cancel anytime from the Payments page. Trading stops at the end of your billing period.

Q: Is the service fee separate from prop firm fees?
A: Yes. Prop firm fees go to the prop firm company. Our service fee is separate. After recoupment, we take our share only from profits.

### Security

Q: Is my trading account safe?
A: Yes. All credentials are encrypted. We only place trades and read balances. We can never withdraw your funds.

Q: Can anyone else see my account information?
A: No. Your information is private and only visible to you on your dashboard.

Q: Should I enable withdrawals on my Binance API key?
A: NEVER enable withdrawals. Only enable "Enable Reading" and "Enable Spot & Margin Trading." We don't need withdrawal access.

### Troubleshooting

Q: The page is loading slowly.
A: Try refreshing or clearing your browser cache. Use Chrome, Firefox, Safari, or Edge for best results.

Q: I can't log in.
A: Check your email and password. Use "Forgot Password" if needed. Contact support if issues persist.

Q: My account shows $0 balance but I have money.
A: Try disconnecting and reconnecting. Make sure credentials are correct. The platform might be doing maintenance — try again in a few minutes.

Q: I don't see any trades happening.
A: Make sure trading is set to "Active" (check the toggle). If active, the algorithm might be waiting for the right market conditions. Not every day has trades — that's normal.

Q: Where do I find my Login ID, Server, or API Key?
A: Check the email from your broker when you created your account. You can also find credentials in your trading platform's settings. See our Connection Guide for detailed instructions.

=============================================================
## IMPORTANT POLICIES
=============================================================

- We NEVER withdraw money from client accounts — only trade and read balances
- Clients own 100% of their trading accounts and funds at all times
- 100% profit retention until evaluation costs are recouped
- 70/30 profit split after recoupment (70% to client)
- No monthly management fees
- Clients can cancel anytime
- We only work with prop firms that allow algorithmic/copy trading
- All performance data is transparent and verifiable
- Client data is encrypted and private

=============================================================
END OF KNOWLEDGE BASE
=============================================================
`;

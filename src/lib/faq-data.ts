// ─── Shared FAQ Knowledge Base ─────────────────────────────
// Used by both the FAQ page and the AI chat search endpoint

export interface FAQItem {
  q: string;
  a: string;
  category: string;
  link?: { label: string; href: string };
}

export interface FAQCategory {
  id: string;
  title: string;
  items: { q: string; a: string; link?: { label: string; href: string } }[];
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      {
        q: "What is copy trading?",
        a: "Copy trading means we do all the trading for you! When you connect your trading account to our service, our system automatically copies trades into your account. You don't need to know anything about trading — we handle everything. All you have to do is sit back, check your dashboard, and watch how your account is doing.",
      },
      {
        q: "Do I need to know how to trade?",
        a: "Nope! You don't need any trading experience at all. That's the whole point of our service. We have professional traders and algorithms that handle all of the trading for you. You just need to connect your account and we take care of the rest.",
      },
      {
        q: "How do I get started?",
        a: "Getting started is simple! First, you need a trading account (like MetaTrader 5, Binance, Tradovate, etc.). If you don't have one yet, check out our Prop Firm Guide to learn how to get one. Once you have a trading account, go to your Accounts page and click \"Connect New Account\" to link it to our service. That's it!",
        link: { label: "Go to Accounts", href: "/client-dashboard/accounts" },
      },
      {
        q: "What trading platforms do you support?",
        a: "We support 5 platforms right now: MetaTrader 5 (MT5), MetaTrader 4 (MT4), Binance, Tradovate, and Interactive Brokers (IBKR). Each one works a little differently, so we have a step-by-step guide for connecting each one.",
        link: { label: "See Connection Guide", href: "/client-dashboard/connect-guide" },
      },
      {
        q: "Is there a minimum amount of money I need to start?",
        a: "That depends on the trading account or prop firm you use. Each platform and firm has different requirements. Some prop firm evaluation accounts start as low as $50-$80 per month. Check out our Prop Firm Guide to compare your options and find one that fits your budget.",
        link: { label: "View Prop Firm Guide", href: "/client-dashboard/prop-firm-guide" },
      },
      {
        q: "What is a prop firm?",
        a: "A prop firm (short for proprietary trading firm) is a company that gives you money to trade with. You pay a small monthly fee to take an evaluation, and if the account passes, they give you a funded account with their money in it. The best part? You keep a big percentage of the profits — usually 80% to 100%. Our service can trade on prop firm accounts for you too!",
        link: { label: "Learn About Prop Firms", href: "/client-dashboard/prop-firm-guide" },
      },
      {
        q: "Do I need to be at my computer all day?",
        a: "Not at all! Once your account is connected, our service runs automatically 24/7 (depending on market hours for your account type). You don't need to watch anything. You can check in on your dashboard whenever you want to see how things are going, but it's not required.",
      },
    ],
  },
  {
    id: "connecting",
    title: "Connecting Your Account",
    items: [
      {
        q: "How do I connect my trading account?",
        a: "Go to your Accounts page and click the \"Connect New Account\" button. A popup will show you all the trading platforms we support. Pick the one you use, fill in your login details, and click \"Connect Account\". That's it! We have a full step-by-step guide if you need more help.",
        link: { label: "View Connection Guide", href: "/client-dashboard/connect-guide" },
      },
      {
        q: "Is it safe to give you my account login?",
        a: "Yes, absolutely! Your login information is encrypted (which means it's scrambled into a secret code) before it's sent to us. We only use your login to read your account balance and place trades for you. We can NEVER withdraw money from your account. Your money stays safe in your own account at all times.",
      },
      {
        q: "Can you take money out of my account?",
        a: "No, never. We do not have the ability to withdraw, transfer, or move any money from your trading account. The connection we use only allows us to see your balance and place trades. Only YOU can move money in and out of your own account.",
      },
      {
        q: "What information do I need to connect my account?",
        a: "It depends on which platform you use. For MetaTrader (MT4/MT5), you'll need your Login ID, Server name, and Password. For Binance, you need your API Key and Secret Key. For Tradovate, you need your account number, username, and password. For Interactive Brokers, you need your Account ID and API Token. Our connection guide has all the details for each platform.",
        link: { label: "See What You Need", href: "/client-dashboard/connect-guide" },
      },
      {
        q: "I'm getting an error when trying to connect. What do I do?",
        a: "First, double-check that you typed everything correctly — make sure there are no extra spaces at the beginning or end of your Login ID, password, or API key. Also make sure you picked the right broker and server. If it still doesn't work, try disconnecting and reconnecting. If the problem continues, contact us for help.",
      },
      {
        q: "Can I connect more than one account?",
        a: "Yes! You can connect as many trading accounts as you want. Just go to your Accounts page and click \"Connect New Account\" for each one. Each account will show up separately on your dashboard so you can track them all.",
        link: { label: "Connect Another Account", href: "/client-dashboard/accounts?connect=1" },
      },
      {
        q: "How do I disconnect an account?",
        a: "Go to your Accounts page, find the account you want to remove, click the three-dot menu on the right side of the account card, and click \"Disconnect\". The account will stop receiving trades and will be removed from your dashboard.",
        link: { label: "Go to Accounts", href: "/client-dashboard/accounts" },
      },
      {
        q: "I have a Tradovate account. Is there anything special I need to do?",
        a: "Yes! Before you connect your Tradovate account, you MUST log into your Tradovate account and sign the agreement first. If you don't sign the agreement, the connection to our service will not work. After you've signed it, you can connect your account normally through our connection guide.",
        link: { label: "Tradovate Connection Steps", href: "/client-dashboard/connect-guide" },
      },
      {
        q: "What if I change my trading account password?",
        a: "If you change your password on your trading platform, you'll need to update it on our side too. Go to your Accounts page, disconnect the account, and then reconnect it with your new password. This makes sure we can still place trades for you.",
        link: { label: "Go to Accounts", href: "/client-dashboard/accounts" },
      },
      {
        q: "My account isn't showing up after I connected it. What happened?",
        a: "Wait about 10 seconds and then refresh the page. Sometimes it takes a moment for everything to sync up. If it still doesn't show up after refreshing, try disconnecting and reconnecting the account from your Accounts page.",
        link: { label: "Go to Accounts", href: "/client-dashboard/accounts" },
      },
    ],
  },
  {
    id: "prop-firms",
    title: "Prop Firm Accounts",
    items: [
      {
        q: "Which prop firms do you recommend?",
        a: "We have a full guide with our top recommended prop firms. Right now, we recommend: Apex Trader Funding, BluSky Trading, MyFundedFutures (MFF), Take Profit Trader, Elite Trader Funding, and TradeDay. Each one is a little different, so check out our guide to see which one is the best fit for you.",
        link: { label: "View Prop Firm Guide", href: "/client-dashboard/prop-firm-guide" },
      },
      {
        q: "Are there any prop firms I should avoid?",
        a: "Yes. We do NOT recommend Topstep, Earn2Trade, or Bulenox. These firms either have very strict rules that make it hard to succeed, high fees, or they are not compatible with our service. Stick with the firms in our recommended list for the best experience.",
        link: { label: "See Recommended Firms", href: "/client-dashboard/prop-firm-guide" },
      },
      {
        q: "Do you have any coupon codes or discounts for prop firms?",
        a: "Yes! We have special coupon codes for most of the prop firms we recommend. You can find all the coupon codes on our Prop Firm Guide page — just look for the coupon code section under each firm. Click on the code to copy it, then paste it when you sign up.",
        link: { label: "Get Coupon Codes", href: "/client-dashboard/prop-firm-guide" },
      },
      {
        q: "How does a prop firm evaluation work?",
        a: "A prop firm evaluation is basically a test. You pay a monthly fee for an evaluation account (which has simulated money in it). Our service trades on that account, and if it reaches the profit target while staying within the firm's guidelines, you \"pass\" the evaluation. Once you pass, the prop firm gives you a real funded account with their money, and you get to keep most of the profits (usually 80-100%).",
        link: { label: "Learn More About Evaluations", href: "/client-dashboard/prop-firm-guide" },
      },
      {
        q: "How much does a prop firm account cost?",
        a: "Prices vary depending on the firm and the account size. Smaller accounts (like $25K or $50K) usually cost between $50-$200 per month. Larger accounts (like $150K or $300K) cost more. Many firms also run sales and offer coupon codes that can save you 50-90% off! Check our Prop Firm Guide for current pricing.",
        link: { label: "Compare Pricing", href: "/client-dashboard/prop-firm-guide" },
      },
      {
        q: "What happens if my prop firm account fails the evaluation?",
        a: "If the account doesn't pass the evaluation (for example, if it hits the maximum drawdown limit), the evaluation ends and you would need to start a new one. This is normal and happens sometimes. The good news is that evaluation resets are usually much cheaper than starting fresh, and many firms offer discounts on resets.",
      },
      {
        q: "Can I have multiple prop firm accounts at the same time?",
        a: "Yes! Many of our clients have multiple prop firm accounts connected at the same time. You can connect as many as you want. Some prop firms even let you have multiple accounts with them. Check each firm's rules on our Prop Firm Guide page.",
        link: { label: "View Prop Firm Guide", href: "/client-dashboard/prop-firm-guide" },
      },
      {
        q: "How do I sign up for a prop firm?",
        a: "Go to our Prop Firm Guide, pick the firm you want, and follow the step-by-step signup instructions we've written for each one. Don't forget to use our coupon code when you check out to save money! After you sign up and get your account details, come back here and connect the account to our service.",
        link: { label: "Signup Guides", href: "/client-dashboard/prop-firm-guide" },
      },
    ],
  },
  {
    id: "trading-service",
    title: "How the Trading Service Works",
    items: [
      {
        q: "Do I need to do anything after connecting my account?",
        a: "Nope! Once your account is connected, our service starts working automatically. You don't need to press any buttons, make any decisions, or even watch the screen. We handle all the trading for you. Just check your dashboard whenever you're curious about how things are going.",
      },
      {
        q: "What does \"Trading Active\" mean on my dashboard?",
        a: "When you see \"Trading Active\" with a green light at the top of your dashboard, that means our service is currently running and can place trades on your connected accounts. If it says \"Trading Paused\", it means trading has been temporarily stopped.",
      },
      {
        q: "Can I pause the trading on my account?",
        a: "Yes! You can toggle trading on and off using the switch at the top right of your dashboard. If you turn it off, no new trades will be opened on your account. Any trades that are already open will stay open until they close on their own. You can turn it back on at any time.",
      },
      {
        q: "What markets do you trade?",
        a: "It depends on which algorithm (trading strategy) is connected to your account. We trade different markets like Forex, Futures, Crypto, and Stocks. The specific markets are handled by our trading team — you don't need to worry about choosing what to trade.",
      },
      {
        q: "How often will there be trades on my account?",
        a: "The number of trades depends on market conditions and the trading strategy being used. Some days there might be several trades, and other days there might be none. Our strategies are designed to find the best opportunities, not to trade as much as possible. Quality over quantity!",
      },
      {
        q: "Can I place my own trades on the same account?",
        a: "We strongly recommend that you do NOT place your own trades on accounts that are connected to our service. Adding your own trades could interfere with our trading strategy and could cause problems, especially on prop firm accounts where there are strict rules about drawdown limits.",
      },
      {
        q: "What happens if the market is closed?",
        a: "When the market is closed (like on weekends for Forex and Futures), no trades will be placed. Our service only trades during market hours. You don't need to do anything — it will automatically start trading again when the market opens.",
      },
      {
        q: "Will I lose money?",
        a: "Trading always involves risk, and there will be some losing trades — that's completely normal. No trading strategy wins 100% of the time. What matters is that our strategies are designed to be profitable over time. You can check your performance on the Performance page to see how your account is doing overall.",
        link: { label: "View Performance", href: "/client-dashboard/performance" },
      },
    ],
  },
  {
    id: "dashboard",
    title: "Using Your Dashboard",
    items: [
      {
        q: "What can I see on my dashboard?",
        a: "Your dashboard is like a home base where you can see everything at a glance. You'll see your account balances, recent trading activity, performance stats, and quick links to all the other pages. It updates regularly so you always have the latest info.",
        link: { label: "Go to Dashboard", href: "/client-dashboard" },
      },
      {
        q: "What is the Accounts page for?",
        a: "The Accounts page shows all of your connected trading accounts in one place. You can see each account's balance, status, and platform. You can also connect new accounts or disconnect existing ones from this page.",
        link: { label: "Go to Accounts", href: "/client-dashboard/accounts" },
      },
      {
        q: "What is the Trading Activity page?",
        a: "The Trading Activity page shows you every trade that has been placed on your accounts. You can see when each trade was opened, what was traded, whether it was a buy or sell, the profit or loss, and more. It's like a detailed history of everything that's happened.",
        link: { label: "View Trading Activity", href: "/client-dashboard/activity" },
      },
      {
        q: "What is the Performance page?",
        a: "The Performance page shows you how your accounts are doing over time. You'll see charts, graphs, and numbers like total return, win rate, and drawdown. This is the best place to check if you want to see the big picture of how your account has been performing.",
        link: { label: "View Performance", href: "/client-dashboard/performance" },
      },
      {
        q: "What is the Payments page?",
        a: "The Payments page is where you can see everything related to billing and payments for our service. You can view your payment history, current plan, and manage your subscription.",
        link: { label: "Go to Payments", href: "/client-dashboard/payments" },
      },
      {
        q: "How often does the dashboard update?",
        a: "Your dashboard updates automatically every few seconds. You'll see a little \"Updated just now\" or \"Updated 5s ago\" message near the top of the page. If you want to make sure you're seeing the very latest data, you can refresh the page.",
      },
      {
        q: "Can I use the dashboard on my phone?",
        a: "Yes! The dashboard works on phones, tablets, and computers. Just open your browser and go to your dashboard URL. Everything will adjust to fit your screen size so you can check on your accounts from anywhere.",
      },
    ],
  },
  {
    id: "performance",
    title: "Understanding Your Performance",
    items: [
      {
        q: "What does \"Total Return\" mean?",
        a: "Total Return is the total amount of profit (or loss) your account has made since it was connected to our service. It's shown as both a dollar amount and a percentage. For example, if your account started with $50,000 and now has $55,000, your total return is $5,000 (or 10%).",
      },
      {
        q: "What does \"Win Rate\" mean?",
        a: "Win Rate is the percentage of trades that made money. For example, if 60 out of 100 trades were profitable, the win rate is 60%. Keep in mind that win rate isn't everything — what matters more is how much you win when you win vs. how much you lose when you lose.",
      },
      {
        q: "What does \"Drawdown\" mean?",
        a: "Drawdown is the biggest drop your account has had from its highest point. Think of it like this: if your account went up to $55,000 and then dropped to $52,000, that's a $3,000 drawdown (about 5.5%). Lower drawdown is generally better. Prop firms have drawdown limits, so this number is especially important for prop firm accounts.",
      },
      {
        q: "What does \"Sharpe Ratio\" mean?",
        a: "Don't worry too much about this one — it's a fancy number that measures how good the returns are compared to the risk taken. A higher Sharpe Ratio is better. Anything above 1.0 is generally considered good, and above 2.0 is considered very good. It's mainly useful for comparing different strategies.",
      },
      {
        q: "What does \"Profit Factor\" mean?",
        a: "Profit Factor is a simple ratio: total profits divided by total losses. If the Profit Factor is 2.0, that means for every $1 lost, $2 was made. Anything above 1.0 means the strategy is profitable overall. The higher the number, the better.",
      },
      {
        q: "Why did my account go down today?",
        a: "Losing days are completely normal in trading. No strategy wins every single day. What matters is the overall performance over weeks and months, not individual days. Check your Performance page to see the bigger picture. If you have concerns about your account's performance, don't hesitate to reach out to us.",
        link: { label: "Check Performance", href: "/client-dashboard/performance" },
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & Billing",
    items: [
      {
        q: "How do I pay for the service?",
        a: "You can manage all your billing from the Payments page on your dashboard. We accept major credit/debit cards. You can view your current plan, payment history, and update your payment method from there.",
        link: { label: "Go to Payments", href: "/client-dashboard/payments" },
      },
      {
        q: "When will I be charged?",
        a: "Billing depends on your subscription plan. Most plans bill monthly on the same date you signed up. You can see your next billing date on the Payments page.",
        link: { label: "View Billing Details", href: "/client-dashboard/payments" },
      },
      {
        q: "Can I cancel my subscription?",
        a: "Yes, you can cancel at any time from the Payments page. If you cancel, your accounts will stop receiving trades at the end of your current billing period. You won't be charged again after that.",
        link: { label: "Manage Subscription", href: "/client-dashboard/payments" },
      },
      {
        q: "Is the service fee separate from prop firm fees?",
        a: "Yes, they are separate. The prop firm fee is what you pay to the prop firm company for your evaluation or funded account. Our service fee is what you pay us for the copy trading service. They are two different things from two different companies.",
      },
    ],
  },
  {
    id: "security",
    title: "Account Security",
    items: [
      {
        q: "Is my trading account safe?",
        a: "Yes! We take security very seriously. All your login details are encrypted (scrambled into a secret code) before they are sent to us. We only use your credentials to read your balance and place trades. We can NEVER withdraw money from your account. Your funds always stay safely in your own account.",
      },
      {
        q: "Can anyone else see my account information?",
        a: "No. Your account information is private and only visible to you when you log into your dashboard. We do not share your personal information, trading data, or account details with anyone else.",
      },
      {
        q: "What should I do if I think someone accessed my account?",
        a: "If you think someone might have accessed your dashboard account, change your password immediately. Also change the password on your trading platform (MetaTrader, Binance, etc.) and then reconnect your account with the new password. Contact us right away if you need help.",
      },
      {
        q: "Should I turn on \"Enable Withdrawals\" for my Binance API key?",
        a: "NO! Never turn on \"Enable Withdrawals\" for your Binance API key. We do not need withdrawal access, and keeping it off protects your funds. Only turn on \"Enable Reading\" and \"Enable Spot & Margin Trading\" — that's all we need.",
        link: { label: "See Binance Setup Guide", href: "/client-dashboard/connect-guide" },
      },
      {
        q: "How do I log out of my dashboard?",
        a: "Click on your name/avatar at the bottom of the left sidebar menu, and then click \"Log Out\". This will sign you out of your dashboard. You'll need to log in again to access your account.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting & Common Issues",
    items: [
      {
        q: "The page is loading slowly. What should I do?",
        a: "Try refreshing the page. If it's still slow, clear your browser's cache (in your browser settings) and try again. The dashboard works best on modern browsers like Chrome, Firefox, Safari, or Edge. Also make sure you have a stable internet connection.",
      },
      {
        q: "I can't log into my dashboard. What do I do?",
        a: "Make sure you're using the correct email and password. If you forgot your password, click the \"Forgot Password\" link on the login page. If you're still having trouble, contact us and we'll help you get back into your account.",
      },
      {
        q: "My account shows a $0 balance but I know I have money in it.",
        a: "This usually means the connection to your trading platform needs to be refreshed. Try disconnecting the account and reconnecting it. Make sure you're using the correct login details. If the problem persists, your trading platform might be doing maintenance — try again in a few minutes.",
        link: { label: "Go to Accounts", href: "/client-dashboard/accounts" },
      },
      {
        q: "I don't see any trades happening on my account.",
        a: "First, make sure trading is set to \"Active\" (check the toggle at the top right of your dashboard). If trading is active but you're not seeing trades, it might mean the market is closed, or the trading strategy is waiting for the right conditions to enter a trade. Not every day will have trades — that's normal.",
      },
      {
        q: "I connected the wrong account. How do I fix this?",
        a: "No problem! Go to your Accounts page, find the wrong account, click the three-dot menu, and click \"Disconnect\". Then connect the correct account by clicking \"Connect New Account\" and entering the right details.",
        link: { label: "Go to Accounts", href: "/client-dashboard/accounts" },
      },
      {
        q: "Where do I find my Login ID, Server name, or API Key?",
        a: "Check the email your broker sent you when you first created your trading account — your login details are usually there. You can also find them inside your trading platform's settings. For step-by-step instructions on where to find everything, see our Connection Guide.",
        link: { label: "View Connection Guide", href: "/client-dashboard/connect-guide" },
      },
      {
        q: "Something looks wrong with my performance numbers.",
        a: "Performance data can sometimes take a moment to update. Try refreshing the page. If the numbers still look off, it could be because of an open trade that hasn't closed yet — open trades can affect your balance temporarily. If you're still concerned, contact us and we'll take a look.",
        link: { label: "Check Performance", href: "/client-dashboard/performance" },
      },
    ],
  },
];

// Flatten all FAQ items with category info for search
export function getAllFAQItems(): FAQItem[] {
  const items: FAQItem[] = [];
  for (const cat of FAQ_CATEGORIES) {
    for (const item of cat.items) {
      items.push({
        q: item.q,
        a: item.a,
        category: cat.title,
        link: item.link,
      });
    }
  }
  return items;
}

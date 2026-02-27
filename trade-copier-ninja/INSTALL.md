# AlgoFintech Trade Copier — NinjaTrader 8

## Overview
Custom trade copier that runs inside NinjaTrader 8. When you place a trade
on the master account, it automatically copies to all active slave accounts
with configurable contract sizes per account.

## Architecture
```
NinjaTrader 8 (your VPS)
  ├── Master Account → you trade here manually
  ├── Slave Account 1 → auto-copied (1 contract)
  ├── Slave Account 2 → auto-copied (2 contracts)
  └── ...100+ accounts
          │
          ▼
   Node.js API (localhost:3002)
          │
          ▼
    Supabase DB → Admin Dashboard shows trade history
```

## Installation

### Step 1: Supabase Tables
Run `supabase-migration.sql` in your Supabase SQL Editor to create the
`copier_trade_events` and `copier_accounts` tables.

### Step 2: NinjaTrader Add-On
1. Open NinjaTrader 8
2. Go to **Tools → NinjaScript Editor**
3. Right-click on **AddOns** folder → **New → Add On**
4. Name it `AlgoFintechCopier`
5. Copy the contents of `AddOn/AlgoFintechCopier.cs` into the main file
6. Add a new file and paste `AddOn/AlgoFintechCopierTab.cs`
7. Press **F5** to compile (or click the compile button)

Alternatively, compile to DLL and place in:
`Documents\NinjaTrader 8\bin\Custom\AddOns\`

### Step 3: Trade Logging API (optional)
```bash
cd API
npm install
# Copy .env from main project or create one with:
#   SUPABASE_URL=...
#   SUPABASE_SERVICE_ROLE_KEY=...
npm start
```

### Step 4: Connect Accounts
1. In NinjaTrader, connect all your Tradovate accounts via **Connections → Configure**
2. Open the copier: **New → AlgoFintech Copier** (in Control Center menu)
3. Select your master account from the dropdown
4. Check "Active" on each slave account you want to copy to
5. Set contract sizes per account
6. Click **START COPYING**

## How It Works

1. You place a trade on the master account (manually in NinjaTrader)
2. The Add-On detects the fill via `Account.ExecutionUpdate` event
3. For each active slave, it creates a market order via `Account.CreateOrder()`
4. The order is submitted via `Account.Submit()`
5. Trade events are logged to the API → Supabase for the dashboard

## Config File
Located at: `Documents\NinjaTrader 8\AlgoFintechCopier\config.json`

```json
{
  "MasterAccountName": "YourMasterAccount",
  "ApiBaseUrl": "http://localhost:3002",
  "SlaveAccounts": [
    {
      "AccountName": "APEX-123456",
      "IsActive": true,
      "ContractSize": 1
    }
  ]
}
```

## Logs
- NinjaTrader Output tab (real-time)
- File: `Documents\NinjaTrader 8\AlgoFintechCopier\copier.log`
- Supabase: `copier_trade_events` table

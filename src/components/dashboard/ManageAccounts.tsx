"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  X,
  Trash2,
  Copy,
  User,
  ChevronDown,
  ChevronUp,
  Users,
  FolderOpen,
  Maximize2,
  RefreshCw,
  Info,
  Check,
  Search,
} from "lucide-react";
import { mockClients, getCategoryColor } from "@/lib/mock-data";
import { useSavedAlgorithms } from "@/context/SavedAlgorithmsContext";
import type { Algorithm } from "@/lib/types";

// ─── Types ──────────────────────────────────────────────
interface ClientAccount {
  id: string;
  account_name: string;
  account_label: string;
  platform: string;
  account_type: "Demo" | "Real";
  account_number: string;
  currency: string;
  balance: number;
  credit: number;
  equity: number;
  free_margin: number;
  open_trades: number;
  asset_class: string;
  algorithm_id: string | null;
  is_active: boolean;
}

type MainTab = "accounts" | "open-positions" | "closed-positions";

// ─── Mock Data ──────────────────────────────────────────
function getMockAccounts(clientName: string): ClientAccount[] {
  return [
    {
      id: "acc_001",
      account_name: `slave - tradovate - BLUERJPYWBEO`,
      account_label: `tradovate Demo / BLUERJPYWBEO (USD)`,
      platform: "Tradovate",
      account_type: "Demo",
      account_number: "BLUERJPYWBEO",
      currency: "USD",
      balance: 197363.4,
      credit: 0,
      equity: 197363.4,
      free_margin: 197363.4,
      open_trades: 0,
      asset_class: "Futures",
      algorithm_id: null,
      is_active: false,
    },
    {
      id: "acc_002",
      account_name: `slave - tradovate - XYZABC123`,
      account_label: `tradovate Real / XYZABC123 (USD)`,
      platform: "Tradovate",
      account_type: "Real",
      account_number: "XYZABC123",
      currency: "USD",
      balance: 52480.25,
      credit: 500.0,
      equity: 52980.25,
      free_margin: 48250.0,
      open_trades: 3,
      asset_class: "Futures",
      algorithm_id: "algo_001",
      is_active: true,
    },
    {
      id: "acc_003",
      account_name: `slave - MT5 - 12345678`,
      account_label: `MetaTrader 5 Demo / 12345678 (EUR)`,
      platform: "MetaTrader 5",
      account_type: "Demo",
      account_number: "12345678",
      currency: "EUR",
      balance: 10000.0,
      credit: 0,
      equity: 10000.0,
      free_margin: 10000.0,
      open_trades: 0,
      asset_class: "Forex",
      algorithm_id: "algo_005",
      is_active: true,
    },
    {
      id: "acc_004",
      account_name: `slave - MT4 - 87654321`,
      account_label: `MetaTrader 4 Real / 87654321 (USD)`,
      platform: "MetaTrader 4",
      account_type: "Real",
      account_number: "87654321",
      currency: "USD",
      balance: 25890.5,
      credit: 0,
      equity: 25890.5,
      free_margin: 24500.0,
      open_trades: 1,
      asset_class: "Forex",
      algorithm_id: null,
      is_active: false,
    },
    {
      id: "acc_005",
      account_name: `slave - Binance - SPOT-A1B2C3`,
      account_label: `Binance Real / SPOT-A1B2C3 (USDT)`,
      platform: "Binance",
      account_type: "Real",
      account_number: "SPOT-A1B2C3",
      currency: "USDT",
      balance: 84210.0,
      credit: 0,
      equity: 84210.0,
      free_margin: 78000.0,
      open_trades: 5,
      asset_class: "Crypto",
      algorithm_id: "algo_009",
      is_active: true,
    },
    {
      id: "acc_006",
      account_name: `slave - Schwab - 99887766`,
      account_label: `Schwab Real / 99887766 (USD)`,
      platform: "Schwab",
      account_type: "Real",
      account_number: "99887766",
      currency: "USD",
      balance: 145000.0,
      credit: 0,
      equity: 145000.0,
      free_margin: 130000.0,
      open_trades: 2,
      asset_class: "Stocks",
      algorithm_id: "algo_001",
      is_active: true,
    },
  ];
}

// ─── Algorithm Color Helper (uses same category colors as sidebar) ──
function getAlgoDropdownColor(category: string): {
  dot: string;
  bg: string;
  border: string;
  text: string;
} {
  const c = getCategoryColor(category);
  return { dot: c.dot, bg: c.bg, border: c.border, text: c.text };
}

// ─── Main Component ─────────────────────────────────────
export default function ManageAccounts() {
  const params = useParams();
  const slug = params?.slug as string;

  // Find client by slug (client_id)
  const client = mockClients.find(
    (c) => c.client_id.toLowerCase() === slug?.toLowerCase()
  );
  const clientName = client?.name || "Unknown Client";

  // Get only the algorithms saved by the agency owner (shown in sidebar)
  const { savedAlgorithms } = useSavedAlgorithms();

  const [accounts, setAccounts] = useState<ClientAccount[]>(
    getMockAccounts(clientName)
  );
  const [activeTab, setActiveTab] = useState<MainTab>("accounts");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClientAccount | null>(null);
  const [copySettingsTarget, setCopySettingsTarget] =
    useState<ClientAccount | null>(null);
  const [searchAccount, setSearchAccount] = useState("");

  const filteredAccounts = accounts.filter(
    (a) =>
      a.account_name.toLowerCase().includes(searchAccount.toLowerCase()) ||
      a.account_number.toLowerCase().includes(searchAccount.toLowerCase())
  );

  const handleToggle = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId ? { ...a, is_active: !a.is_active } : a
      )
    );
  };

  const handleStrategyChange = (
    accountId: string,
    algorithmId: string | null
  ) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId ? { ...a, algorithm_id: algorithmId } : a
      )
    );
  };

  const handleDeleteAccount = (accountId: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4 h-full px-6 pb-6">
        {/* Breadcrumb in header area */}
        <div className="flex items-center gap-3 text-sm -mt-2 mb-2">
          <Link
            href="/dashboard"
            className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
          >
            Platform
          </Link>
          <span className="text-slate-700">/</span>
          <Link
            href="/dashboard/clients"
            className="hover:text-slate-300 cursor-pointer transition-colors text-slate-500"
          >
            Clients
          </Link>
          <span className="text-slate-700">/</span>
          <span className="font-medium text-white">{clientName}</span>
        </div>

        {/* Title Row */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Clients Accounts
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-medium text-white">
              {accounts.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex hover:bg-blue-500 transition-colors text-sm font-medium text-white bg-blue-600 ring-blue-500/50 ring-1 rounded-md py-1.5 px-3 shadow-sm gap-2 items-center"
            >
              Add Client
            </button>
            <div className="h-6 w-px bg-white/10 mx-1" />
            <button className="p-1.5 text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded">
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-[#13161C] border-white/5 border rounded-xl px-3 shadow-sm">
          {/* Tabs */}
          <div className="flex shrink-0 bg-[#13161C] border-white/5 border-b pt-2 px-4 items-center">
            <button
              onClick={() => setActiveTab("accounts")}
              className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === "accounts"
                  ? "text-white border-blue-500"
                  : "text-slate-400 hover:text-slate-200 border-transparent hover:border-white/10"
              }`}
            >
              <Users className="w-4 h-4" />
              Accounts
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  activeTab === "accounts"
                    ? "bg-white/10"
                    : "bg-white/5 text-slate-500"
                }`}
              >
                {accounts.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("open-positions")}
              className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === "open-positions"
                  ? "text-white border-blue-500"
                  : "text-slate-400 hover:text-slate-200 border-transparent hover:border-white/10"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Open Positions
              <span className="bg-white/5 text-slate-500 px-1.5 py-0.5 rounded text-[10px]">
                0
              </span>
            </button>
            <button
              onClick={() => setActiveTab("closed-positions")}
              className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === "closed-positions"
                  ? "text-white border-blue-500"
                  : "text-slate-400 hover:text-slate-200 border-transparent hover:border-white/10"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Closed Positions
              <span className="bg-white/5 text-slate-500 px-1.5 py-0.5 rounded text-[10px]">
                0
              </span>
            </button>
          </div>

          {/* Filter bar */}
          <div className="flex items-center justify-end gap-2 p-3 border-b border-white/5 bg-[#13161C] shrink-0" />

          {/* Table Content */}
          {activeTab === "accounts" && (
            <div className="flex-1 overflow-auto custom-scrollbar relative bg-[#13161C]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#13161C] z-10 shadow-sm">
                  <tr>
                    <th className="py-3 px-4 border-b border-white/5 w-40" />
                    <th className="py-3 px-4 border-b border-white/5 min-w-[200px] align-top">
                      <div className="flex flex-col gap-2">
                        <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1 cursor-pointer hover:text-slate-300">
                          Account
                          <SortIcon />
                        </div>
                        <input
                          type="text"
                          placeholder="Search Account"
                          value={searchAccount}
                          onChange={(e) => setSearchAccount(e.target.value)}
                          className="bg-[#0B0E14] border border-white/10 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 w-full placeholder:text-slate-700 transition-colors"
                        />
                      </div>
                    </th>
                    <ColumnHeader label="Balance/Credit" sortable />
                    <ColumnHeader label="Equity" sortable />
                    <ColumnHeader label="Free Margin" sortable />
                    <ColumnHeader label="Open Trades" sortable />
                    <ColumnHeader label="Asset Class" />
                    <ColumnHeader label="Strategy" />
                    <ColumnHeader label="Off/On" />
                    <ColumnHeader label="Status" sortable />
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredAccounts.map((account) => (
                    <AccountRow
                      key={account.id}
                      account={account}
                      algorithms={savedAlgorithms}
                      onToggle={handleToggle}
                      onStrategyChange={handleStrategyChange}
                      onCopySettings={() => setCopySettingsTarget(account)}
                      onDelete={() => setDeleteTarget(account)}
                    />
                  ))}
                  {filteredAccounts.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-12 text-center text-slate-500 text-sm"
                      >
                        No accounts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab !== "accounts" && (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              No {activeTab === "open-positions" ? "open" : "closed"} positions.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddClientAccountModal onClose={() => setShowAddModal(false)} />
      )}
      {deleteTarget && (
        <DeleteAccountModal
          accountName={deleteTarget.account_name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDeleteAccount(deleteTarget.id)}
        />
      )}
      {copySettingsTarget && (
        <CopySettingsModal onClose={() => setCopySettingsTarget(null)} />
      )}
    </>
  );
}

// ─── Column Header ──────────────────────────────────────
function ColumnHeader({
  label,
  sortable,
}: {
  label: string;
  sortable?: boolean;
}) {
  return (
    <th className="py-3 px-4 border-b border-white/5 align-top">
      <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1 cursor-pointer hover:text-slate-300 h-[26px]">
        {label}
        {sortable && <SortIcon />}
      </div>
    </th>
  );
}

function SortIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  );
}

// ─── Account Row ────────────────────────────────────────
function AccountRow({
  account,
  algorithms,
  onToggle,
  onStrategyChange,
  onCopySettings,
  onDelete,
}: {
  account: ClientAccount;
  algorithms: Algorithm[];
  onToggle: (id: string) => void;
  onStrategyChange: (id: string, algorithmId: string | null) => void;
  onCopySettings: () => void;
  onDelete: () => void;
}) {
  const selectedAlgo = algorithms.find(
    (a) => a.id === account.algorithm_id
  );
  const algoColor = selectedAlgo ? getAlgoDropdownColor(selectedAlgo.category) : { dot: "", bg: "", border: "", text: "" };

  return (
    <tr className="hover:bg-white/5 group border-b border-white/5 transition-colors">
      {/* Copy Settings + Delete */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onCopySettings}
            className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 px-2 py-1 rounded transition-colors"
          >
            <Copy className="w-2.5 h-2.5" />
            Copy Settings
          </button>
          <button
            onClick={onDelete}
            className="hover:text-red-500 transition-colors text-slate-600 p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>

      {/* Account */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="text-slate-500">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-white text-xs">
              {account.account_name}
            </div>
            <div className="text-[10px] text-slate-500 italic">
              {account.account_label}
            </div>
          </div>
        </div>
      </td>

      {/* Balance/Credit */}
      <td className="py-3 px-4 font-mono text-xs text-white">
        {account.balance.toFixed(2)}
        <span className="text-slate-500">/{account.credit.toFixed(2)}</span>
      </td>

      {/* Equity */}
      <td className="py-3 px-4 font-mono text-xs text-white">
        {account.equity.toFixed(2)}
      </td>

      {/* Free Margin */}
      <td className="py-3 px-4 font-mono text-xs text-white">
        {account.free_margin.toFixed(2)}
      </td>

      {/* Open Trades */}
      <td className="py-3 px-4 font-mono text-xs text-white">
        {account.open_trades}
      </td>

      {/* Asset Class */}
      <td className="text-xs text-slate-300 py-3 px-4">
        {account.asset_class}
      </td>

      {/* Strategy Dropdown */}
      <td className="text-xs text-slate-400 py-3 px-4">
        <StrategyDropdown
          selectedAlgo={selectedAlgo}
          algorithms={algorithms}
          onSelect={(algoId) => onStrategyChange(account.id, algoId)}
        />
      </td>

      {/* Toggle */}
      <td className="py-3 px-4">
        <ToggleSwitch
          isOn={account.is_active}
          onToggle={() => onToggle(account.id)}
        />
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        {account.is_active ? (
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-medium">
            Active
          </span>
        ) : (
          <span className="bg-slate-700/50 text-slate-400 border border-slate-600/50 text-[10px] px-2 py-0.5 rounded font-medium">
            Off
          </span>
        )}
      </td>
    </tr>
  );
}

// ─── Toggle Switch ──────────────────────────────────────
function ToggleSwitch({
  isOn,
  onToggle,
}: {
  isOn: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${
        isOn ? "bg-emerald-500" : "bg-slate-700"
      }`}
    >
      <div
        className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-200 ${
          isOn ? "left-5 bg-white" : "left-1 bg-slate-400"
        }`}
      />
    </div>
  );
}

// ─── Strategy Dropdown (shows only agency's saved algorithms) ──
function StrategyDropdown({
  selectedAlgo,
  algorithms,
  onSelect,
}: {
  selectedAlgo: Algorithm | undefined;
  algorithms: Algorithm[];
  onSelect: (algoId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const algoColor = selectedAlgo
    ? getAlgoDropdownColor(selectedAlgo.category)
    : { dot: "", bg: "", border: "", text: "" };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-2 py-1 rounded transition-colors text-xs min-w-[140px] justify-between ${
          selectedAlgo
            ? `${algoColor.bg} border ${algoColor.border} ${algoColor.text}`
            : "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200"
        }`}
      >
        {selectedAlgo ? (
          <span className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${algoColor.dot}`}
            />
            <span>{selectedAlgo.name}</span>
          </span>
        ) : (
          <span>Assign a Strategy</span>
        )}
        <ChevronDown className="w-2.5 h-2.5" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-[#1a1d24] border border-white/10 rounded-lg shadow-xl z-50 min-w-[200px] overflow-hidden">
          {algorithms.length === 0 ? (
            <div className="p-3 text-xs text-slate-500 text-center">
              No algorithms saved yet.
              <br />
              Add algorithms from the sidebar.
            </div>
          ) : (
            <div className="p-1">
              {algorithms.map((algo) => {
                const color = getAlgoDropdownColor(algo.category);
                return (
                  <button
                    key={algo.id}
                    onClick={() => {
                      onSelect(algo.id);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/10 rounded transition-colors text-left"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${color.dot}`}
                    />
                    {algo.name}
                    <span className={`text-[9px] ${color.text} bg-white/5 px-1.5 py-0.5 rounded border border-white/5 ml-auto uppercase`}>
                      {algo.category.slice(0, 3)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="border-t border-white/5 p-1">
            <button
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-white/10 rounded transition-colors text-left"
            >
              <X className="w-3 h-3" />
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Client Account Modal ───────────────────────────
function AddClientAccountModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        <div className="bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-base font-semibold text-white tracking-tight">
              ADD CLIENT
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <label className="w-36 text-sm text-slate-300 shrink-0">
                Trading Platform
                <span className="text-red-500">*</span>
              </label>
              <div className="flex-1 relative">
                <select className="w-full bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all">
                  <option>Tradovate (Beta)</option>
                  <option>MetaTrader 4</option>
                  <option>MetaTrader 5</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-36 text-sm text-slate-300 shrink-0">
                Demo/Real
                <span className="text-red-500">*</span>
              </label>
              <div className="flex-1 relative">
                <select className="w-full bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all">
                  <option>Demo</option>
                  <option>Real</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-36 text-sm text-slate-300 shrink-0 flex items-center gap-1">
                Account
                <span className="text-red-500">*</span>
                <span className="w-4 h-4 rounded-full border border-slate-500 text-slate-500 text-[10px] flex items-center justify-center cursor-help">
                  ?
                </span>
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Account Number (i.e. XXXX123456-1)"
                  className="w-full bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-36 text-sm text-slate-300 shrink-0">
                Plan
                <span className="text-red-500">*</span>
              </label>
              <div className="flex-1 relative">
                <select className="w-full bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all">
                  <option>Subscription / 1 / 29 day(s)</option>
                  <option>Subscription / 3 / 90 day(s)</option>
                  <option>Subscription / 12 / 365 day(s)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Account Modal ───────────────────────────────
function DeleteAccountModal({
  accountName,
  onClose,
  onConfirm,
}: {
  accountName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
        <div className="bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-base font-semibold text-white tracking-tight">
              DELETE CLIENT
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-1">
                  Are you sure you want to delete this client?
                </p>
                <p className="text-xs text-slate-400 mb-3">{accountName}</p>
                <p className="text-xs text-slate-500">
                  This action cannot be undone. The client will be permanently
                  removed from the database.
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              Delete Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Copy Settings Modal ────────────────────────────────
type SettingsTab =
  | "copy-settings"
  | "symbols-mapping"
  | "position-management"
  | "order-filter"
  | "advanced-settings";

const SETTINGS_TABS: {
  id: SettingsTab;
  label: string;
  desc: string;
}[] = [
  {
    id: "copy-settings",
    label: "Copy Settings",
    desc: "Define if the copy is active and the trade size",
  },
  {
    id: "symbols-mapping",
    label: "Symbols Mapping",
    desc: "Define which master symbol correspond to slave",
  },
  {
    id: "position-management",
    label: "Position Management",
    desc: "Manage and adjust SL/TP",
  },
  {
    id: "order-filter",
    label: "Order Filter",
    desc: "Filter trades to be copied",
  },
  {
    id: "advanced-settings",
    label: "Advanced Settings",
    desc: "Add more customization on the trade copied",
  },
];

function CopySettingsModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("copy-settings");

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh]">
        <div className="bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
            <h2 className="text-base font-semibold text-white tracking-tight">
              COPY SETTINGS
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-56 border-r border-white/10 p-4 space-y-1 shrink-0 bg-[#13161C]">
              {SETTINGS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-white/5 text-white"
                      : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Check
                    className={`w-4 h-4 mt-0.5 ${
                      activeTab === tab.id ? "text-blue-400" : ""
                    }`}
                  />
                  <div>
                    <div className="text-sm font-medium">{tab.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {tab.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {activeTab === "copy-settings" && <CopySettingsTab />}
              {activeTab === "symbols-mapping" && <SymbolsMappingTab />}
              {activeTab === "position-management" && (
                <PositionManagementTab />
              )}
              {activeTab === "order-filter" && <OrderFilterTab />}
              {activeTab === "advanced-settings" && <AdvancedSettingsTab />}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 flex justify-end shrink-0 bg-[#13161C]">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Settings Sub-Components ─────────────────────
function OptionGroup({
  options,
  active,
}: {
  options: string[];
  active: string;
}) {
  const [selected, setSelected] = useState(active);
  return (
    <div className="flex items-center gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => setSelected(opt)}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            selected === opt
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SettingRow({
  label,
  required,
  isNew,
  children,
}: {
  label: string;
  required?: boolean;
  isNew?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-300">
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
        <span className="w-4 h-4 rounded-full border border-slate-500 text-slate-500 text-[10px] flex items-center justify-center cursor-help">
          ?
        </span>
        {isNew && (
          <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-medium rounded">
            New
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function SettingsToggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div
      onClick={() => setOn(!on)}
      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
        on ? "bg-emerald-500" : "bg-slate-700"
      }`}
    >
      <div
        className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-200 ${
          on ? "left-5 bg-white" : "left-1 bg-slate-400"
        }`}
      />
    </div>
  );
}

function InputWithUnit({
  placeholder,
  disabled,
}: {
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder={placeholder || ""}
        disabled={disabled}
        className={`w-32 bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all ${
          disabled ? "text-slate-500 cursor-not-allowed opacity-50" : ""
        }`}
      />
      <div className="relative w-24">
        <select
          disabled={disabled}
          className={`w-full bg-[#2a2d35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50 transition-all ${
            disabled ? "text-slate-500 cursor-not-allowed opacity-50" : ""
          }`}
        >
          <option>%</option>
          <option>Pips</option>
          <option>Points</option>
        </select>
        <ChevronDown
          className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3 ${
            disabled ? "text-slate-600" : "text-slate-400"
          }`}
        />
      </div>
    </div>
  );
}

// ─── Tab Contents ───────────────────────────────────────
function CopySettingsTab() {
  return (
    <div className="space-y-6">
      <SettingRow label="Copier Status">
        <OptionGroup
          options={["Off", "Inherited", "On", "Open Only", "Close Only"]}
          active="Inherited"
        />
      </SettingRow>
      <SettingRow label="Risk Factor" required>
        <div className="relative w-48">
          <select className="w-full bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50 transition-all">
            <option>Fixed Lot</option>
            <option>Lot Multiplier</option>
            <option>Equity Percentage</option>
            <option>Mirror Master</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-3.5 h-3.5" />
        </div>
      </SettingRow>
      <SettingRow label="Risk Value" required>
        <input
          type="text"
          defaultValue="0.01"
          className="w-48 bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </SettingRow>
      <SettingRow label="Reverse Trading">
        <SettingsToggle />
      </SettingRow>
      <SettingRow label="Copy Pending Order">
        <OptionGroup options={["Off", "Inherited", "On"]} active="Inherited" />
      </SettingRow>
      <SettingRow label="Smart Price Adjustment" isNew>
        <OptionGroup options={["Off", "Inherited", "On"]} active="Inherited" />
      </SettingRow>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-3 h-3 text-blue-400" />
        </div>
        <p className="text-sm text-slate-300">
          Risk Factor and Risk Value are mandatory to enable link between Master
          and Slave and to define the trade size to copy. All others Copy
          Settings are optional.
        </p>
      </div>
    </div>
  );
}

function SymbolsMappingTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400">
          Manually define which master symbol correspond to slave symbol
        </p>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors">
          <Plus className="w-3 h-3" />
          Add Mapping
        </button>
      </div>
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Master Symbol
              </th>
              <th className="px-4 py-3 text-left text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Slave Symbol
              </th>
              <th className="px-4 py-3 text-right text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-white/5">
              <td className="px-4 py-3">
                <input
                  type="text"
                  placeholder="e.g. EURUSD"
                  className="w-full bg-[#2a2d35] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  placeholder="e.g. EURUSD.pro"
                  className="w-full bg-[#2a2d35] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
                />
              </td>
              <td className="px-4 py-3 text-right">
                <button className="text-slate-500 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        Leave empty to use automatic symbol matching
      </p>
    </div>
  );
}

function PositionManagementTab() {
  return (
    <div className="space-y-4">
      <SettingRow label="Copy Stop Loss">
        <OptionGroup options={["Off", "Inherited", "On"]} active="Inherited" />
      </SettingRow>
      <SettingRow label="Copy Take Profit">
        <OptionGroup options={["Off", "Inherited", "On"]} active="Inherited" />
      </SettingRow>
      <SettingRow label="Copy Stop Loss Updates">
        <OptionGroup options={["Off", "Inherited", "On"]} active="Inherited" />
      </SettingRow>
      <SettingRow label="Copy Take Profit Updates">
        <OptionGroup options={["Off", "Inherited", "On"]} active="Inherited" />
      </SettingRow>
      <SettingRow label="Maximum Risk">
        <InputWithUnit />
      </SettingRow>
      <SettingRow label="Fixed SL">
        <InputWithUnit />
      </SettingRow>
      <SettingRow label="Fixed TP">
        <InputWithUnit />
      </SettingRow>
      <SettingRow label="Minimum SL">
        <InputWithUnit />
      </SettingRow>
      <SettingRow label="Minimum TP">
        <InputWithUnit />
      </SettingRow>
      <SettingRow label="Maximum SL">
        <InputWithUnit />
      </SettingRow>
      <SettingRow label="Maximum TP">
        <InputWithUnit />
      </SettingRow>
      <SettingRow label="Offset SL" isNew>
        <InputWithUnit />
      </SettingRow>
      <SettingRow label="Offset TP" isNew>
        <InputWithUnit />
      </SettingRow>
      <SettingRow label="Offset Pending" isNew>
        <InputWithUnit />
      </SettingRow>
      <div className="flex items-center justify-between py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-300">Trailing Stop</span>
          <span className="w-4 h-4 rounded-full border border-slate-500 text-slate-500 text-[10px] flex items-center justify-center cursor-help">
            ?
          </span>
          <span className="px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-medium rounded">
            Coming soon
          </span>
        </div>
        <InputWithUnit disabled />
      </div>
    </div>
  );
}

function OrderFilterTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400 mb-4">
        Filter trades to be copied based on specific criteria
      </p>
      <SettingRow label="Min Lot Size">
        <input
          type="text"
          defaultValue="0.01"
          className="w-32 bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </SettingRow>
      <SettingRow label="Max Lot Size">
        <input
          type="text"
          defaultValue="100"
          className="w-32 bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </SettingRow>
      <SettingRow label="Allowed Symbols">
        <input
          type="text"
          placeholder="Leave empty for all"
          className="w-48 bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </SettingRow>
      <SettingRow label="Excluded Symbols">
        <input
          type="text"
          placeholder="Comma separated"
          className="w-48 bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </SettingRow>
    </div>
  );
}

function AdvancedSettingsTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400 mb-4">
        Add more customization on the trade copied
      </p>
      <SettingRow label="Max Slippage (pips)">
        <input
          type="number"
          defaultValue={3}
          className="w-32 bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </SettingRow>
      <SettingRow label="Max Retries">
        <input
          type="number"
          defaultValue={3}
          className="w-32 bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </SettingRow>
      <SettingRow label="Trade Comment">
        <input
          type="text"
          placeholder="Optional comment"
          className="w-48 bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </SettingRow>
      <SettingRow label="Magic Number">
        <input
          type="number"
          defaultValue={0}
          className="w-32 bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </SettingRow>
      <SettingRow label="Copy SL/TP Modifications">
        <SettingsToggle defaultOn />
      </SettingRow>
    </div>
  );
}

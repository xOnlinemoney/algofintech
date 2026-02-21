"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronDown, Plus, X, Mail, Phone, Trash2, Info, Check, Filter as FilterIcon, Layers, Cpu } from "lucide-react";
import { mockClients, formatCurrencyFull, formatLiquidity, getStatusColor } from "@/lib/mock-data";
import type { Client, ClientStatus } from "@/lib/types";

// Live stats from Supabase
type ClientStats = Record<
  string,
  { accounts_count: number; active_strategies: number; liquidity: number }
>;

// ─── Main Component ──────────────────────────────────────
export default function ClientsGrid() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCopySettings, setShowCopySettings] = useState(false);
  const [liveStats, setLiveStats] = useState<ClientStats>({});
  const [dbClients, setDbClients] = useState<Client[]>([]);

  // Fetch live account stats from Supabase
  useEffect(() => {
    fetch("/api/client-stats")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setLiveStats(json.data);
      })
      .catch(console.error);
  }, []);

  // Fetch clients from Supabase
  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((json) => {
        if (json.data && json.data.length > 0) {
          const mapped: Client[] = json.data.map((row: Record<string, unknown>) => ({
            id: row.id as string,
            client_id: row.client_id as string,
            agency_id: row.agency_id as string,
            name: row.name as string,
            email: row.email as string,
            phone: (row.phone as string) || null,
            avatar_url: (row.avatar_url as string) || null,
            avatar_gradient: (row.avatar_gradient as string) || null,
            status: (row.status as ClientStatus) || "active",
            liquidity: Number(row.liquidity) || 0,
            total_pnl: Number(row.total_pnl) || 0,
            pnl_percentage: Number(row.pnl_percentage) || 0,
            active_strategies: Number(row.active_strategies) || 0,
            accounts_count: 0,
            risk_level: (row.risk_level as "low" | "medium" | "high") || "medium",
            sparkline_path: "M0,25 Q10,20 20,22 T40,18 T60,22 T80,15 T100,20",
            sparkline_color: "#3b82f6",
            broker: (row.broker as string) || "—",
            joined_at: (row.joined_at as string) || new Date().toISOString(),
            last_active: (row.last_active as string) || new Date().toISOString(),
          }));
          setDbClients(mapped);
        }
      })
      .catch(console.error);
  }, []);

  // Use DB clients if available, else fall back to mock
  const baseClients = dbClients.length > 0 ? dbClients : mockClients;

  // Merge with live Supabase stats
  const clients = baseClients.map((c) => {
    const stats = liveStats[c.client_id];
    if (stats) {
      return {
        ...c,
        accounts_count: stats.accounts_count,
        active_strategies: stats.active_strategies,
        liquidity: stats.liquidity,
      };
    }
    return c;
  });

  // Filter
  const filtered = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.client_id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="flex flex-col gap-6 h-full">
        {/* Header Section */}
        <div className="flex flex-col gap-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white tracking-tight">
                Clients
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-medium text-white">
                {clients.length}
              </span>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex hover:bg-blue-500 transition-colors text-sm font-medium text-white bg-blue-600 rounded-lg ring-blue-500/50 ring-1 py-2 px-4 shadow-sm gap-2 items-center"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3 p-1">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#13161C] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-[#13161C] border border-white/10 rounded-lg text-sm text-slate-300 hover:text-white hover:border-white/20 transition-all">
                <span className="text-slate-500">Status:</span>
                All
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-[#13161C] border border-white/10 rounded-lg text-sm text-slate-300 hover:text-white hover:border-white/20 transition-all">
                <span className="text-slate-500">Asset Class:</span>
                Any
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-[#13161C] border border-white/10 rounded-lg text-sm text-slate-300 hover:text-white hover:border-white/20 transition-all">
                <span className="text-slate-500">Risk:</span>
                Any
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 pb-4">
          {filtered.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onDelete={() => setDeleteTarget(client)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 text-sm">
              No clients found matching your filters.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {deleteTarget && (
        <DeleteConfirmModal
          clientName={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            // Future: Supabase delete
            setDeleteTarget(null);
          }}
        />
      )}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onClientAdded={() => {
            // Refresh live stats
            fetch("/api/client-stats")
              .then((res) => res.json())
              .then((json) => {
                if (json.data) setLiveStats(json.data);
              })
              .catch(console.error);
          }}
        />
      )}
      {showCopySettings && (
        <CopySettingsModal onClose={() => setShowCopySettings(false)} />
      )}
    </>
  );
}

// ─── Client Card ─────────────────────────────────────────
function ClientCard({
  client,
  onDelete,
}: {
  client: Client;
  onDelete: () => void;
}) {
  const status = getStatusColor(client.status);
  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const avatarClass = client.avatar_gradient
    ? `w-10 h-10 rounded-full bg-gradient-to-br ${client.avatar_gradient} flex items-center justify-center text-white font-semibold text-sm shadow-inner`
    : "w-10 h-10 rounded-full bg-[#2a2d35] flex items-center justify-center text-slate-300 font-semibold text-sm ring-1 ring-white/10";

  return (
    <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:border-white/10 hover:shadow-lg transition-all group">
      {/* Header: Avatar + Name + Status + Delete */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={avatarClass}>{initials}</div>
          <div>
            <h3 className="text-white font-medium text-sm leading-tight">
              {client.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ID: {client.client_id}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-medium ${status.bg} ${status.text} border ${status.border}`}
          >
            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </span>
          <button
            onClick={onDelete}
            className="text-slate-500 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Mail className="w-3 h-3 text-slate-600" />
          {client.email}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Phone className="w-3 h-3 text-slate-600" />
          {client.phone || "Not provided"}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-3 pt-2 border-t border-white/5">
        <div className="space-y-0.5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Liquidity
          </p>
          <p className="text-sm text-white font-medium font-mono">
            {formatLiquidity(client.liquidity)}
          </p>
        </div>
        <div className="space-y-0.5 text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Total PnL
          </p>
          <p
            className={`text-sm font-medium font-mono ${
              client.total_pnl >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatCurrencyFull(client.total_pnl)}
          </p>
        </div>
      </div>

      {/* Accounts & Strategies Row */}
      <div className="flex items-center gap-3 -mt-1">
        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-1.5 flex-1">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-400">Accounts</span>
          <span className="text-xs text-white font-medium ml-auto">{client.accounts_count}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-1.5 flex-1">
          <Cpu className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-400">Strategies</span>
          <span className={`text-xs font-medium ml-auto ${client.active_strategies > 0 ? "text-blue-400" : "text-slate-500"}`}>
            {client.active_strategies}
          </span>
        </div>
      </div>

      {/* Manage Button */}
      <Link
        href={`/dashboard/clients/${client.client_id}`}
        className="hover:bg-white/10 hover:text-white transition-colors text-xs font-medium text-slate-300 bg-white/5 w-full border-white/5 border rounded-lg py-2 text-center block"
      >
        Manage Accounts
      </Link>
    </div>
  );
}

// ─── Delete Confirmation Modal ───────────────────────────
function DeleteConfirmModal({
  clientName,
  onClose,
  onConfirm,
}: {
  clientName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
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
                <p className="text-xs text-slate-400 mb-3">{clientName}</p>
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

// ─── Add Client Modal ────────────────────────────────────
function AddClientModal({
  onClose,
  onClientAdded,
}: {
  onClose: () => void;
  onClientAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [maxAccounts, setMaxAccounts] = useState<string>("unlimited");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const autoId = `CL-${Math.floor(1000 + Math.random() * 9000)}`;

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) {
      setError("Client name and email are required.");
      return;
    }
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          max_accounts: maxAccounts === "unlimited" ? null : Number(maxAccounts),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to create client.");
        setSaving(false);
        return;
      }
      onClientAdded();
      onClose();
      // Reload to show new client
      window.location.reload();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
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
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="flex items-center gap-4">
              <label className="w-36 text-sm text-slate-300 shrink-0">
                Client Name
                <span className="text-red-500">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter client name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-36 text-sm text-slate-300 shrink-0">
                Client ID
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  readOnly
                  value={autoId}
                  className="w-full bg-[#2a2d35]/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-36 text-sm text-slate-300 shrink-0">
                Client Email
                <span className="text-red-500">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-36 text-sm text-slate-300 shrink-0">
                Phone Number
              </label>
              <div className="flex-1">
                <input
                  type="tel"
                  placeholder="Enter phone number (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-36 text-sm text-slate-300 shrink-0">
                Max Accounts
                <span className="text-red-500">*</span>
              </label>
              <div className="flex-1 relative">
                <select
                  value={maxAccounts}
                  onChange={(e) => setMaxAccounts(e.target.value)}
                  className="w-full bg-[#2a2d35] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                >
                  <option value="5">5 Accounts</option>
                  <option value="10">10 Accounts</option>
                  <option value="20">20 Accounts</option>
                  <option value="unlimited">Unlimited</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
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
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              {saving ? "Saving..." : "Add Client"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Copy Settings Modal ─────────────────────────────────
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
      ></div>
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
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Copy Settings Tab Content ───────────────────────────
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

function ToggleSwitch({ defaultOn = false }: { defaultOn?: boolean }) {
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
      ></div>
    </div>
  );
}

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
        <ToggleSwitch />
      </SettingRow>
      <SettingRow label="Copy Pending Order">
        <OptionGroup options={["Off", "Inherited", "On"]} active="Inherited" />
      </SettingRow>
      <SettingRow label="Smart Price Adjustment" isNew>
        <OptionGroup options={["Off", "Inherited", "On"]} active="Inherited" />
      </SettingRow>

      {/* Info Box */}
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

function InputWithUnit({
  placeholder,
  disabled,
  wideSelect,
}: {
  placeholder?: string;
  disabled?: boolean;
  wideSelect?: string;
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
      <div className={`relative ${wideSelect || "w-24"}`}>
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
        <InputWithUnit wideSelect="w-36" />
      </SettingRow>
      <SettingRow label="Offset TP" isNew>
        <InputWithUnit wideSelect="w-36" />
      </SettingRow>
      <SettingRow label="Offset Pending" isNew>
        <InputWithUnit wideSelect="w-44" />
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
        <ToggleSwitch defaultOn />
      </SettingRow>
    </div>
  );
}

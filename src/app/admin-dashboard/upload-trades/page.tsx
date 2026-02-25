"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  FileUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  ArrowLeft,
  FileText,
  Trash2,
  Zap,
  Download,
  Building2,
  User,
  Wallet,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────── */

type ParsedRow = {
  line: number;
  account: string;
  agency: string;
  client: string;
  symbol: string;
  pnl: string;
  boughtTimestamp: string;
  soldTimestamp: string;
  raw: string[];
};

type AccountGroup = {
  account: string;
  agency: string;
  client: string;
  rows: ParsedRow[];
};

type AccountResult = {
  account_number: string;
  account_id: string | null;
  account_label: string | null;
  agency_name: string | null;
  client_name: string | null;
  imported_count: number;
  skipped_count: number;
  total_rows: number;
  errors: string[];
  status: "success" | "error" | "unmatched";
};

type Algorithm = {
  id: string;
  name: string;
  slug: string;
};

type ImportSummary = {
  total_imported: number;
  total_skipped: number;
  total_rows: number;
  accounts_found: number;
  accounts_failed: number;
  unique_accounts: number;
};

/* ── CSV Template ───────────────────────────────────────── */

const CSV_TEMPLATE = `account_number,agency,client,symbol,_priceFormat,_priceFormatType,_tickSize,buyFillId,sellFillId,qty,buyPrice,sellPrice,pnl,boughtTimestamp,soldTimestamp,duration
APEX41449900000221,My Agency,John Doe,NQH6,-2,0,0.25,412247650010,412247650018,1,24937.00,24956.75,$395.00,02/24/2026 10:23:47,02/24/2026 10:26:34,2min 46sec
APEX41449900000221,My Agency,John Doe,NQH6,-2,0,0.25,412247650026,412247650032,2,24983.75,25000.75,$680.00,02/24/2026 10:28:04,02/24/2026 10:28:37,32sec
APEX98765400000112,My Agency,Jane Smith,ESH6,-2,0,0.25,412247650040,412247650048,1,5100.50,5105.25,$237.50,02/24/2026 11:00:00,02/24/2026 11:05:30,5min 30sec`;

/* ── Helpers ────────────────────────────────────────────── */

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "trade_import_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Page Component ─────────────────────────────────────── */

export default function UploadTradesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [headerCols, setHeaderCols] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<AccountResult[] | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("");

  // Assign-all state (when CSV is missing account/agency/client columns OR manual override)
  const [missingAccountCol, setMissingAccountCol] = useState(false);
  const [overrideAssign, setOverrideAssign] = useState(false); // manual toggle
  const showAssignPanel = missingAccountCol || overrideAssign;
  const [agencies, setAgencies] = useState<{ id: string; name: string }[]>([]);
  const [agencyClients, setAgencyClients] = useState<{ id: string; name: string }[]>([]);
  const [clientAccounts, setClientAccounts] = useState<{ id: string; account_number: string; account_label: string }[]>([]);
  const [assignAgency, setAssignAgency] = useState("");
  const [assignClient, setAssignClient] = useState("");
  const [assignAccount, setAssignAccount] = useState("");

  // Fetch algorithms + agencies on mount
  useEffect(() => {
    fetch("/api/admin/algorithms")
      .then((res) => res.json())
      .then((data) => {
        if (data.algorithms) setAlgorithms(data.algorithms);
      })
      .catch(() => {});

    fetch("/api/admin/agencies")
      .then((res) => res.json())
      .then((data) => {
        if (data.agencies) setAgencies(data.agencies);
      })
      .catch(() => {});
  }, []);

  // Cache full client+account data for the selected agency
  const [agencyClientsData, setAgencyClientsData] = useState<any[]>([]);

  // When agency changes, fetch clients + accounts from lightweight endpoint
  useEffect(() => {
    setAgencyClients([]);
    setClientAccounts([]);
    setAssignClient("");
    setAssignAccount("");
    setAgencyClientsData([]);
    if (!assignAgency) return;
    fetch(`/api/admin/agency-clients?agency_id=${assignAgency}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const clients = data.clients || [];
        setAgencyClientsData(clients);
        setAgencyClients(clients.map((c: any) => ({ id: c.id, name: c.name })));
      })
      .catch((err) => {
        console.error("Failed to fetch agency clients:", err);
      });
  }, [assignAgency]);

  // When client changes, pull accounts from cached data
  useEffect(() => {
    setClientAccounts([]);
    setAssignAccount("");
    if (!assignClient || agencyClientsData.length === 0) return;
    const client = agencyClientsData.find((c: any) => c.id === assignClient);
    if (client?.accounts) {
      setClientAccounts(client.accounts.map((a: any) => ({
        id: a.id,
        account_number: a.account_number || "",
        account_label: a.account_label || a.account_number || "Unnamed",
      })));
    }
  }, [assignClient, agencyClientsData]);

  // Group rows by account
  const accountGroups = useMemo(() => {
    const groups = new Map<string, AccountGroup>();
    for (const row of parsedRows) {
      const key = row.account.toUpperCase().replace(/[-\s]/g, "");
      if (!groups.has(key)) {
        groups.set(key, {
          account: row.account,
          agency: row.agency,
          client: row.client,
          rows: [],
        });
      }
      groups.get(key)!.rows.push(row);
    }
    return Array.from(groups.values());
  }, [parsedRows]);

  const loadFile = (f: File) => {
    setFile(f);
    setResults(null);
    setSummary(null);
    setParseError(null);
    setParsedRows([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target?.result as string;
      // Strip BOM if present
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

      if (lines.length < 2) {
        setParseError("CSV must have a header row and at least one data row.");
        return;
      }

      const header = parseCSVLine(lines[0]);
      setHeaderCols(header);

      // Find key column indices
      const findCol = (names: string[]) => {
        for (const name of names) {
          const idx = header.findIndex(
            (h) => h.toLowerCase().replace(/[\s_-]+/g, "") === name.toLowerCase().replace(/[\s_-]+/g, "")
          );
          if (idx >= 0) return idx;
        }
        return -1;
      };

      const acctCol = findCol(["account_number", "account"]);
      const agencyCol = findCol(["agency", "agency_name"]);
      const clientCol = findCol(["client", "client_name"]);
      const symbolCol = findCol(["symbol"]);
      const pnlCol = findCol(["pnl"]);
      const boughtCol = findCol(["boughtTimestamp", "boughttimestamp"]);
      const soldCol = findCol(["soldTimestamp", "soldtimestamp"]);

      // Check if account column is missing OR if all account values are empty
      let noAccountCol = acctCol === -1;

      // If account column exists, check if all values are empty (blank column)
      if (!noAccountCol) {
        let hasAnyAccount = false;
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          if (cols.every((c) => c.trim() === "")) continue; // skip blank rows
          const val = (cols[acctCol] || "").trim();
          if (val) { hasAnyAccount = true; break; }
        }
        if (!hasAnyAccount) noAccountCol = true;
      }
      setMissingAccountCol(noAccountCol);

      const rows: ParsedRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        // Skip truly empty rows
        if (cols.every((c) => c.trim() === "")) continue;
        const acct = noAccountCol ? "ASSIGN" : (cols[acctCol] || "").trim();
        if (!noAccountCol && !acct) continue;

        rows.push({
          line: i + 1,
          account: acct,
          agency: agencyCol >= 0 ? (cols[agencyCol] || "").trim() : "",
          client: clientCol >= 0 ? (cols[clientCol] || "").trim() : "",
          symbol: symbolCol >= 0 ? (cols[symbolCol] || "").trim() : "",
          pnl: pnlCol >= 0 ? (cols[pnlCol] || "").trim() : "",
          boughtTimestamp: boughtCol >= 0 ? (cols[boughtCol] || "").trim() : "",
          soldTimestamp: soldCol >= 0 ? (cols[soldCol] || "").trim() : "",
          raw: cols,
        });
      }

      if (rows.length === 0) {
        setParseError("No valid data rows found in CSV.");
        return;
      }

      setParsedRows(rows);
    };
    reader.readAsText(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.name.endsWith(".csv")) loadFile(f);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
    e.target.value = "";
  };

  const clearFile = () => {
    setFile(null);
    setParsedRows([]);
    setHeaderCols([]);
    setParseError(null);
    setResults(null);
    setSummary(null);
    setExpandedAccounts(new Set());
    setMissingAccountCol(false);
    setOverrideAssign(false);
    setAssignAgency("");
    setAssignClient("");
    setAssignAccount("");
  };

  const toggleAccount = (account: string) => {
    setExpandedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(account)) next.delete(account);
      else next.add(account);
      return next;
    });
  };

  const handleImport = async () => {
    if (!file || importing) return;
    if (showAssignPanel && !assignAccount) {
      setParseError("Please select an account to assign all trades to.");
      return;
    }
    setImporting(true);
    setResults(null);
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (selectedAlgorithm) {
        formData.append("algorithm_name", selectedAlgorithm);
        formData.append("algorithm_color", "#6366f1");
      }
      if (showAssignPanel && assignAccount) {
        formData.append("assign_account_id", assignAccount);
      }

      const res = await fetch("/api/admin/bulk-import-trades", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        setParseError(json.error || "Import failed.");
        setImporting(false);
        return;
      }

      setResults(json.results || []);
      setSummary(json.summary || null);
    } catch (err) {
      setParseError(String(err));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {/* Top Bar */}
      <div className="border-b border-white/5 bg-[#060910]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin-dashboard"
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Bulk Trade Import
              </h1>
              <p className="text-xs text-slate-500">
                Upload one master CSV with trades for all accounts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin-dashboard/upload-files"
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
            >
              Switch to Multi-File
            </Link>
            <button
              onClick={downloadTemplate}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              Download Template
            </button>
            {file && (
              <button
                onClick={clearFile}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Drop Zone — only show when no file loaded */}
        {!file && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
                  : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-base text-slate-200 font-medium">
                    Drop your master trade CSV here
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    or <span className="text-indigo-400 underline">browse files</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Format Guide */}
            <div className="bg-[#070a10] border border-white/5 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">CSV Format</h3>
              <p className="text-xs text-slate-400">
                Upload your Tradovate trade CSV. If it includes an <span className="text-indigo-300 font-medium">account_number</span> column,
                trades will be grouped by account automatically. If it&apos;s missing or empty, you can
                <span className="text-amber-300 font-medium"> assign all trades to a specific account</span> after uploading.
              </p>
              <div className="overflow-x-auto">
                <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-[10px] font-mono text-slate-400 whitespace-nowrap">
                  <span className="text-slate-500">account_number</span>,<span className="text-slate-500">agency</span>,<span className="text-slate-500">client</span>,symbol,_priceFormat,_priceFormatType,_tickSize,buyFillId,sellFillId,qty,buyPrice,sellPrice,pnl,boughtTimestamp,soldTimestamp,duration
                </div>
              </div>
              <p className="text-[10px] text-slate-600">
                The <span className="text-slate-500">account_number</span>, <span className="text-slate-500">agency</span>, and <span className="text-slate-500">client</span> columns are all optional.
                Without them, you&apos;ll pick the target agency, client, and account from dropdowns after uploading.
              </p>
            </div>
          </>
        )}

        {/* Parse Error */}
        {parseError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-300 font-medium">Error</p>
              <p className="text-xs text-red-400/80 mt-0.5">{parseError}</p>
            </div>
          </div>
        )}

        {/* File Loaded — Preview */}
        {file && parsedRows.length > 0 && !results && (
          <>
            {/* File Info Bar */}
            <div className="bg-[#070a10] border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{file.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {parsedRows.length.toLocaleString()} trade{parsedRows.length !== 1 ? "s" : ""} across{" "}
                    {accountGroups.length} account{accountGroups.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                className="px-3 py-2.5 bg-[#0a0e18] border border-white/10 text-sm text-white rounded-lg focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
              >
                <option value="">Algorithm: Manual</option>
                {algorithms.map((algo) => (
                  <option key={algo.id} value={algo.name}>
                    {algo.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {importing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileUp className="w-4 h-4" />
                )}
                {importing ? "Importing..." : `Import ${parsedRows.length} Trades`}
              </button>
            </div>

            {/* Override toggle — when CSV has account columns, allow manual override */}
            {!missingAccountCol && parsedRows.length > 0 && (
              <div className="flex items-center gap-3 bg-[#070a10] border border-white/5 rounded-xl px-4 py-3">
                <button
                  onClick={() => {
                    setOverrideAssign(!overrideAssign);
                    if (overrideAssign) {
                      setAssignAgency("");
                      setAssignClient("");
                      setAssignAccount("");
                    }
                  }}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    overrideAssign ? "bg-amber-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      overrideAssign ? "translate-x-5" : ""
                    }`}
                  />
                </button>
                <div>
                  <p className="text-xs text-white font-medium">Assign all to one account</p>
                  <p className="text-[10px] text-slate-500">Override CSV account numbers and send all trades to a single account</p>
                </div>
              </div>
            )}

            {/* Assign All Panel — when CSV is missing account columns or override is on */}
            {showAssignPanel && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-300 font-medium">
                      {missingAccountCol ? "Missing account columns" : "Assign all override"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {missingAccountCol ? (
                        <>Your CSV doesn&apos;t have <span className="text-amber-300">account_number</span>, <span className="text-amber-300">agency</span>, or <span className="text-amber-300">client</span> columns. Assign all trades to a specific account below.</>
                      ) : (
                        <>All {parsedRows.length} trades will be imported to the account you select below, ignoring account numbers in the CSV.</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Agency */}
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-medium">Agency</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={assignAgency}
                        onChange={(e) => setAssignAgency(e.target.value)}
                        className="w-full bg-[#0a0e18] border border-white/10 rounded-lg py-2.5 pl-9 pr-8 text-xs text-white focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                      >
                        <option value="">Select Agency...</option>
                        {agencies.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  {/* Client */}
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-medium">Client</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={assignClient}
                        onChange={(e) => setAssignClient(e.target.value)}
                        disabled={!assignAgency}
                        className="w-full bg-[#0a0e18] border border-white/10 rounded-lg py-2.5 pl-9 pr-8 text-xs text-white focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <option value="">{assignAgency ? "Select Client..." : "Select agency first"}</option>
                        {agencyClients.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  {/* Account */}
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-medium">Account</label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={assignAccount}
                        onChange={(e) => setAssignAccount(e.target.value)}
                        disabled={!assignClient}
                        className="w-full bg-[#0a0e18] border border-white/10 rounded-lg py-2.5 pl-9 pr-8 text-xs text-white focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <option value="">{assignClient ? "Select Account..." : "Select client first"}</option>
                        {clientAccounts.map((a) => (
                          <option key={a.id} value={a.id}>{a.account_label} ({a.account_number})</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
                {assignAccount && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    All {parsedRows.length} trades will be imported to the selected account
                  </div>
                )}
              </div>
            )}

            {/* Account Breakdown */}
            <div className="space-y-2">
              <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {missingAccountCol ? "Trade Preview" : "Account Breakdown"}
              </h2>
              {accountGroups.map((group) => {
                const key = group.account.toUpperCase().replace(/[-\s]/g, "");
                const expanded = expandedAccounts.has(key);
                return (
                  <div key={key} className="bg-[#070a10] border border-white/5 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleAccount(key)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {group.account}
                        </span>
                        {group.agency && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {group.agency}
                          </span>
                        )}
                        {group.client && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {group.client}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {group.rows.length} trade{group.rows.length !== 1 ? "s" : ""}
                      </span>
                    </button>
                    {expanded && (
                      <div className="border-t border-white/5 overflow-x-auto">
                        <table className="w-full text-[10px]">
                          <thead className="bg-white/[0.02] text-slate-500">
                            <tr>
                              <th className="px-3 py-2 text-left">Row</th>
                              <th className="px-3 py-2 text-left">Symbol</th>
                              <th className="px-3 py-2 text-right">P&L</th>
                              <th className="px-3 py-2 text-left">Bought</th>
                              <th className="px-3 py-2 text-left">Sold</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {group.rows.slice(0, 20).map((row) => (
                              <tr key={row.line} className="text-slate-400">
                                <td className="px-3 py-1.5 text-slate-600">{row.line}</td>
                                <td className="px-3 py-1.5 text-white font-medium">{row.symbol}</td>
                                <td className={`px-3 py-1.5 text-right font-medium ${
                                  row.pnl.includes("-") || row.pnl.includes("(") ? "text-red-400" : "text-emerald-400"
                                }`}>{row.pnl}</td>
                                <td className="px-3 py-1.5">{row.boughtTimestamp}</td>
                                <td className="px-3 py-1.5">{row.soldTimestamp}</td>
                              </tr>
                            ))}
                            {group.rows.length > 20 && (
                              <tr>
                                <td colSpan={5} className="px-3 py-2 text-center text-slate-600">
                                  +{group.rows.length - 20} more trades
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Import Results */}
        {results && (
          <div className="space-y-4">
            {/* Summary Cards */}
            {summary && (
              <div className="bg-[#070a10] border border-white/10 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Import Complete
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MiniStat label="Accounts Processed" value={String(summary.accounts_found)} color="indigo" />
                  <MiniStat label="Trades Imported" value={String(summary.total_imported)} color="emerald" />
                  <MiniStat label="Duplicates Skipped" value={String(summary.total_skipped)} color="amber" />
                  <MiniStat
                    label="Accounts Failed"
                    value={String(summary.accounts_failed)}
                    color={summary.accounts_failed > 0 ? "red" : "slate"}
                  />
                </div>
              </div>
            )}

            {/* Per-Account Results */}
            <div className="space-y-2">
              <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Per-Account Results
              </h2>
              {results.map((r, idx) => (
                <div
                  key={idx}
                  className={`border rounded-xl p-4 ${
                    r.status === "success"
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : r.status === "unmatched"
                      ? "bg-amber-500/5 border-amber-500/20"
                      : "bg-red-500/5 border-red-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {r.status === "success" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : r.status === "unmatched" ? (
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {r.account_number}
                          </span>
                          {r.account_label && (
                            <span className="text-[10px] text-slate-400">
                              {r.account_label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {r.agency_name && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {r.agency_name}
                            </span>
                          )}
                          {r.client_name && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {r.client_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {r.status === "success" ? (
                        <div className="text-[10px] text-slate-400">
                          <span className="text-emerald-400 font-bold text-xs">{r.imported_count}</span> imported
                          {r.skipped_count > 0 && (
                            <span className="ml-2">
                              <span className="text-amber-400 font-medium">{r.skipped_count}</span> skipped
                            </span>
                          )}
                          <span className="text-slate-600 ml-2">/ {r.total_rows} rows</span>
                        </div>
                      ) : (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          r.status === "unmatched"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                        }`}>
                          {r.status === "unmatched" ? "No Match" : "Error"}
                        </span>
                      )}
                    </div>
                  </div>
                  {r.errors.length > 0 && (
                    <div className="mt-2 pl-7 text-[10px] text-red-400/80 space-y-0.5">
                      {r.errors.slice(0, 3).map((err, i) => (
                        <p key={i}>&#8226; {err}</p>
                      ))}
                      {r.errors.length > 3 && (
                        <p className="text-slate-600">+{r.errors.length - 3} more</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Another */}
            <div className="text-center pt-4">
              <button
                onClick={clearFile}
                className="px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/30 rounded-lg transition-colors"
              >
                Upload Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Mini Stat ──────────────────────────────────────────── */

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
    slate: "text-slate-400",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
      <p className={`text-xl font-bold ${colorMap[color] || "text-white"}`}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

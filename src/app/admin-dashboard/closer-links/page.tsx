"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Copy,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Link2,
  Users,
  Building2,
  X,
  ChevronDown,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────── */

type CloserLink = {
  id: string;
  token: string;
  agency_id: string;
  name: string;
  client_ids: string[];
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  agency_name: string;
  client_names: { id: string; name: string }[];
};

type Agency = { id: string; name: string };
type Client = { id: string; name: string };

/* ── Page ────────────────────────────────────────────────── */

export default function CloserLinksPage() {
  const [links, setLinks] = useState<CloserLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Create form state
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [formName, setFormName] = useState("");
  const [formAgency, setFormAgency] = useState("");
  const [formClients, setFormClients] = useState<string[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  // Load links + agencies on mount
  useEffect(() => {
    fetchLinks();
    fetch("/api/admin/agencies")
      .then((r) => r.json())
      .then((d) => { if (d.agencies) setAgencies(d.agencies); })
      .catch(() => {});
  }, []);

  const fetchLinks = () => {
    setLoading(true);
    fetch("/api/admin/closer-links")
      .then((r) => r.json())
      .then((d) => { setLinks(d.links || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  // When agency changes in create form, fetch clients
  useEffect(() => {
    setAvailableClients([]);
    setFormClients([]);
    if (!formAgency) return;
    setLoadingClients(true);
    fetch(`/api/admin/agency-clients?agency_id=${formAgency}`)
      .then((r) => r.json())
      .then((d) => {
        setAvailableClients((d.clients || []).map((c: any) => ({ id: c.id, name: c.name })));
        setLoadingClients(false);
      })
      .catch(() => setLoadingClients(false));
  }, [formAgency]);

  const handleCreate = async () => {
    if (!formName.trim()) { setFormError("Enter a closer name."); return; }
    if (!formAgency) { setFormError("Select an agency."); return; }
    if (formClients.length === 0) { setFormError("Select at least one client."); return; }

    setCreating(true);
    setFormError("");
    try {
      const res = await fetch("/api/admin/closer-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim(), agency_id: formAgency, client_ids: formClients }),
      });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error || "Failed to create."); setCreating(false); return; }

      setShowCreate(false);
      setFormName("");
      setFormAgency("");
      setFormClients([]);
      fetchLinks();
    } catch {
      setFormError("Network error.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (link: CloserLink) => {
    await fetch(`/api/admin/closer-links/${link.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !link.is_active }),
    });
    fetchLinks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this closer link? This cannot be undone.")) return;
    await fetch(`/api/admin/closer-links/${id}`, { method: "DELETE" });
    fetchLinks();
  };

  const copyUrl = (token: string) => {
    const url = `${window.location.origin}/dashboard/closer/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleClient = (id: string) => {
    setFormClients((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {/* Top Bar */}
      <div className="border-b border-white/5 bg-[#060910]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin-dashboard" className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <Link2 className="w-5 h-5 text-indigo-400" />
                Closer Links
              </h1>
              <p className="text-xs text-slate-500">Generate secure links for sales closers to view client data</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Link
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        {/* Links Table */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
        ) : links.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Link2 className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-500">No closer links yet</p>
            <p className="text-xs text-slate-600">Create a link to give your sales closers access to client data</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <div key={link.id} className={`bg-[#070a10] border rounded-xl p-4 ${link.is_active ? "border-white/10" : "border-white/5 opacity-60"}`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${link.is_active ? "bg-emerald-400" : "bg-slate-600"}`} />
                      <span className="text-sm font-medium text-white">{link.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        link.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-500"
                      }`}>{link.is_active ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{link.agency_name}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{link.client_names.length} client{link.client_names.length !== 1 ? "s" : ""}</span>
                      <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {link.client_names.map((c) => (
                        <span key={c.id} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 text-[10px] rounded-full border border-indigo-500/20">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyUrl(link.token)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
                      title="Copy URL"
                    >
                      {copied === link.token ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleToggle(link)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
                      title={link.is_active ? "Deactivate" : "Activate"}
                    >
                      {link.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0e18] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl mx-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-indigo-400" /> Create Closer Link
              </h2>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">{formError}</div>
            )}

            {/* Name */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-medium">Closer Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. John Sales"
                className="w-full bg-[#060910] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            {/* Agency */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-medium">Agency</label>
              <div className="relative">
                <select
                  value={formAgency}
                  onChange={(e) => setFormAgency(e.target.value)}
                  className="w-full bg-[#060910] border border-white/10 rounded-lg py-2.5 pl-3 pr-8 text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                >
                  <option value="">Select Agency...</option>
                  {agencies.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Clients */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-medium">
                Assign Clients {formClients.length > 0 && <span className="text-indigo-400">({formClients.length} selected)</span>}
              </label>
              {loadingClients ? (
                <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading clients...
                </div>
              ) : !formAgency ? (
                <p className="text-xs text-slate-600 py-2">Select an agency first</p>
              ) : availableClients.length === 0 ? (
                <p className="text-xs text-slate-600 py-2">No clients found for this agency</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1 border border-white/5 rounded-lg p-2 bg-[#060910]">
                  {availableClients.map((c) => {
                    const selected = formClients.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleClient(c.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                          selected
                            ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                            : "hover:bg-white/5 text-slate-400 border border-transparent"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selected ? "bg-indigo-500 border-indigo-500" : "border-white/20"
                        }`}>
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {creating ? "Creating..." : "Create Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

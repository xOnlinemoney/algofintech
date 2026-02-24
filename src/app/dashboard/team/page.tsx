"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Crown,
  Shield,
  TrendingUp,
  MessageSquare,
  Code,
  Mail,
  Phone,
  Pencil,
  Trash2,
  User,
  Ban,
  Send,
  Loader2,
  X,
  Check,
  Settings2,
  Download,
  LayoutList,
  LayoutGrid,
  Hourglass,
  UserCheck,
} from "lucide-react";

/* ─── Types ─── */
interface TeamMember {
  id: string;
  agency_id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "sales" | "support" | "developer";
  department: string | null;
  phone: string | null;
  avatar_gradient: string | null;
  status: "active" | "pending" | "inactive" | "suspended";
  last_active: string | null;
  assigned_client_count: number;
  assigned_clients: string[];
  created_at: string;
}

interface Invite {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string | null;
  status: string;
  created_at: string;
}

interface AgencySession {
  agency_id: string;
  agency_name: string;
  agency_slug: string;
  user_name: string;
  user_email: string;
}

/* ─── Role Config ─── */
const ROLE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  owner: {
    label: "Owner",
    color: "text-white",
    bg: "bg-blue-500",
    border: "border-blue-500/30",
    icon: <Crown className="w-2.5 h-2.5" />,
  },
  admin: {
    label: "Admin",
    color: "text-white",
    bg: "bg-purple-500",
    border: "border-purple-500/30",
    icon: <Shield className="w-2.5 h-2.5" />,
  },
  sales: {
    label: "Sales Rep",
    color: "text-white",
    bg: "bg-emerald-500",
    border: "border-emerald-500/30",
    icon: <TrendingUp className="w-2.5 h-2.5" />,
  },
  support: {
    label: "Support",
    color: "text-white",
    bg: "bg-amber-500",
    border: "border-amber-500/30",
    icon: <MessageSquare className="w-2.5 h-2.5" />,
  },
  developer: {
    label: "Developer",
    color: "text-white",
    bg: "bg-slate-500",
    border: "border-slate-500/30",
    icon: <Code className="w-2.5 h-2.5" />,
  },
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
  active: { label: "Active", dot: "bg-green-500", bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  pending: { label: "Pending", dot: "bg-amber-500", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  inactive: { label: "Inactive", dot: "bg-slate-500", bg: "bg-slate-700/30", text: "text-slate-400", border: "border-slate-600/30" },
  suspended: { label: "Suspended", dot: "bg-red-500", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

/* ─── Helpers ─── */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ─── Main Page ─── */
export default function TeamManagementPage() {
  const [session, setSession] = useState<AgencySession | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState<TeamMember | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Load session
  useEffect(() => {
    try {
      const stored = localStorage.getItem("agency_session");
      if (stored) setSession(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

  // Fetch team data
  const fetchTeam = useCallback(async () => {
    if (!session?.agency_id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/agency/team?agency_id=${session.agency_id}`);
      const json = await res.json();
      if (res.ok) {
        setMembers(json.members || []);
        setInvites(json.invites || []);
      }
    } catch (err) {
      console.error("Failed to fetch team:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.agency_id]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Show toast
  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Delete member
  async function handleRemoveMember(member: TeamMember) {
    if (member.role === "owner") return;
    if (!confirm(`Remove ${member.name} from the team?`)) return;

    try {
      const res = await fetch(
        `/api/agency/team?member_id=${member.id}&agency_id=${session?.agency_id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        showToast(`${member.name} has been removed.`);
        fetchTeam();
      } else {
        const json = await res.json();
        showToast(json.error || "Failed to remove member.", "error");
      }
    } catch {
      showToast("Failed to remove member.", "error");
    }
    setOpenMenu(null);
  }

  // Update member status
  async function handleStatusChange(member: TeamMember, newStatus: string) {
    try {
      const res = await fetch("/api/agency/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: member.id,
          agency_id: session?.agency_id,
          status: newStatus,
        }),
      });
      if (res.ok) {
        showToast(`${member.name} is now ${newStatus}.`);
        fetchTeam();
      }
    } catch {
      showToast("Failed to update status.", "error");
    }
    setOpenMenu(null);
  }

  // Filter members
  const filteredMembers = members.filter((m) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !m.name.toLowerCase().includes(q) &&
        !m.email.toLowerCase().includes(q) &&
        !m.role.toLowerCase().includes(q)
      )
        return false;
    }
    if (roleFilter !== "all" && m.role !== roleFilter) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    return true;
  });

  // Stats
  const totalMembers = members.length;
  const activeNow = members.filter((m) => m.status === "active").length;
  const pendingInvites = members.filter((m) => m.status === "pending").length + invites.length;

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-8">
        <nav className="flex items-center text-xs text-slate-500 mb-3">
          <span className="hover:text-slate-300 cursor-pointer transition-colors">
            Dashboard
          </span>
          <ChevronRight className="w-3 h-3 mx-2" />
          <span className="text-slate-200">Team Members</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Team Members
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your team and control access to your agency dashboard
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Invite Team Member
          </button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Team"
          value={totalMembers}
          suffix="members"
          icon={<Users className="w-4 h-4 text-slate-500 opacity-50" />}
        />
        <StatCard
          label="Active Now"
          value={activeNow}
          suffix="online"
          icon={<div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
        />
        <StatCard
          label="Pending"
          value={pendingInvites}
          suffix="invites"
          icon={<Hourglass className="w-4 h-4 text-slate-500 opacity-50" />}
        />
        <StatCard
          label="Roles Used"
          value={new Set(members.map((m) => m.role)).size}
          suffix="/ 5"
          icon={<UserCheck className="w-4 h-4 text-slate-500 opacity-50" />}
        />
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#020408] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <FilterDropdown
              label="Role"
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: "all", label: "All Roles" },
                { value: "owner", label: "Owner" },
                { value: "admin", label: "Admin" },
                { value: "sales", label: "Sales Rep" },
                { value: "support", label: "Support" },
                { value: "developer", label: "Developer" },
              ]}
            />
            <FilterDropdown
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending" },
                { value: "inactive", label: "Inactive" },
                { value: "suspended", label: "Suspended" },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <div className="hidden sm:flex items-center bg-[#0B0E14] border border-white/10 rounded-lg p-1">
            <button className="p-1.5 rounded bg-white/10 text-white transition-all">
              <LayoutList className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded text-slate-500 hover:text-white transition-all">
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <div className="h-8 w-px bg-white/10 hidden sm:block" />
          <button className="flex items-center gap-2 px-3 py-2 bg-[#0B0E14] border border-white/10 hover:bg-white/5 rounded-lg text-sm text-slate-300 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] border-b border-white/5 text-xs uppercase text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Client Access</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Loading team members...</p>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-medium mb-1">No team members found</p>
                    <p className="text-slate-500 text-xs">
                      {members.length === 0
                        ? "Invite your first team member to get started."
                        : "Try adjusting your search or filters."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const role = ROLE_CONFIG[member.role] || ROLE_CONFIG.support;
                  const status = STATUS_CONFIG[member.status] || STATUS_CONFIG.inactive;
                  const isOwner = member.role === "owner";
                  const isYou = member.email === session?.user_email;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Member */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-full bg-gradient-to-br ${
                              member.avatar_gradient || "from-blue-600 to-indigo-600"
                            } flex items-center justify-center text-white font-semibold text-sm border-2 border-white/10 ${
                              member.status === "pending" ? "border-dashed opacity-70" : ""
                            }`}
                          >
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {member.name}
                              {isYou && (
                                <span className="text-slate-500 font-normal ml-1">(You)</span>
                              )}
                            </div>
                            <div className="text-slate-400 text-xs">{member.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`${role.bg} ${role.color} px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase flex items-center w-fit gap-1 shadow-sm`}
                        >
                          {role.icon} {role.label}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4 text-slate-300">
                        {member.department || <span className="text-slate-600">—</span>}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div
                          className={`flex items-center gap-1.5 px-2 py-1 rounded ${status.bg} border ${status.border} w-fit`}
                        >
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${status.dot} ${
                              member.status === "active" ? "animate-pulse" : ""
                            }`}
                          />
                          <span className={`text-xs font-medium ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                      </td>

                      {/* Client Access */}
                      <td className="px-6 py-4">
                        {isOwner || member.role === "admin" ? (
                          <span className="text-white">All clients</span>
                        ) : member.assigned_client_count > 0 ? (
                          <span className="text-blue-400 text-xs font-medium bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 cursor-pointer hover:text-blue-300">
                            {member.assigned_client_count} client
                            {member.assigned_client_count !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-xs">No access</span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="px-6 py-4">
                        {member.status === "pending" ? (
                          <span className="text-slate-500 text-xs italic">
                            Invited {timeAgo(member.created_at)}
                          </span>
                        ) : member.status === "active" &&
                          member.last_active &&
                          Date.now() - new Date(member.last_active).getTime() < 300000 ? (
                          <span className="text-green-400 font-medium text-xs">Now</span>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            {timeAgo(member.last_active)}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right relative">
                        {isOwner && isYou ? (
                          <div className="h-8 w-8" />
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(openMenu === member.id ? null : member.id);
                              }}
                              className="h-8 w-8 rounded hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openMenu === member.id && (
                              <div className="absolute right-8 top-8 w-48 bg-[#0B0E14] border border-white/10 rounded-lg shadow-2xl z-50 py-1 animate-in fade-in duration-150">
                                <button
                                  onClick={() => {
                                    setShowProfileModal(member);
                                    setOpenMenu(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                >
                                  <User className="w-3.5 h-3.5" /> View Profile
                                </button>
                                <button
                                  onClick={() => {
                                    setShowProfileModal(member);
                                    setOpenMenu(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                >
                                  <Pencil className="w-3.5 h-3.5" /> Edit Role
                                </button>
                                {member.status === "active" && (
                                  <button
                                    onClick={() => handleStatusChange(member, "suspended")}
                                    className="w-full text-left px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10 flex items-center gap-2"
                                  >
                                    <Ban className="w-3.5 h-3.5" /> Suspend
                                  </button>
                                )}
                                {member.status === "suspended" && (
                                  <button
                                    onClick={() => handleStatusChange(member, "active")}
                                    className="w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-green-500/10 flex items-center gap-2"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Reactivate
                                  </button>
                                )}
                                <div className="h-px bg-white/5 my-1" />
                                <button
                                  onClick={() => handleRemoveMember(member)}
                                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Remove
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredMembers.length > 0 && (
          <div className="bg-white/[0.02] border-t border-white/5 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-slate-500">
              Showing <span className="text-white font-medium">{filteredMembers.length}</span> of{" "}
              <span className="text-white font-medium">{members.length}</span> members
            </span>
          </div>
        )}
      </div>

      {/* Close menus on outside click */}
      {openMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          agencyId={session?.agency_id || ""}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            fetchTeam();
            showToast("Invitation sent successfully!");
          }}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          member={showProfileModal}
          session={session}
          onClose={() => setShowProfileModal(null)}
          onUpdate={() => {
            fetchTeam();
            showToast("Team member updated.");
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-8 right-8 z-[60] animate-in slide-in-from-right duration-300`}
        >
          <div
            className={`bg-[#0B0E14] border ${
              toast.type === "success" ? "border-green-500/20" : "border-red-500/20"
            } shadow-2xl rounded-xl p-4 flex items-center gap-3 w-80 relative overflow-hidden`}
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${
                toast.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <div
              className={`h-8 w-8 rounded-full ${
                toast.type === "success" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
              } flex items-center justify-center shrink-0`}
            >
              {toast.type === "success" ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </div>
            <p className="text-sm font-medium text-white">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  label,
  value,
  suffix,
  icon,
}: {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/5 backdrop-blur-sm rounded-xl p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
      <div className="flex justify-between items-start z-10">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white z-10">
        {value} <span className="text-sm font-normal text-slate-500 ml-1">{suffix}</span>
      </div>
      <div className="absolute -right-4 -bottom-4 h-20 w-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
    </div>
  );
}

/* ─── Filter Dropdown ─── */
function FilterDropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-[#0B0E14] border border-white/10 hover:bg-white/5 rounded-lg text-sm text-slate-300 transition-colors whitespace-nowrap"
      >
        <span className="text-slate-500">{label}:</span> {selected?.label || "All"}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 w-40 bg-[#0B0E14] border border-white/10 rounded-lg shadow-2xl z-50 py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors ${
                  value === opt.value ? "text-blue-400" : "text-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Invite Modal ─── */
function InviteModal({
  agencyId,
  onClose,
  onSuccess,
}: {
  agencyId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("sales");
  const [department, setDepartment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    {
      value: "admin",
      label: "Admin",
      desc: "Full access to manage clients, team, and settings. Excludes billing.",
      icon: <Shield className="w-4 h-4 text-slate-500" />,
    },
    {
      value: "sales",
      label: "Sales Rep",
      desc: "Invite new clients and view assigned client dashboards and stats.",
      icon: <TrendingUp className="w-4 h-4 text-slate-500" />,
    },
    {
      value: "support",
      label: "Support / VA",
      desc: "View assigned clients and account status. Read-only dashboard access.",
      icon: <MessageSquare className="w-4 h-4 text-slate-500" />,
    },
    {
      value: "developer",
      label: "IT / Developer",
      desc: "Access API settings, domain config, and integrations. No client data.",
      icon: <Settings2 className="w-4 h-4 text-slate-500" />,
    },
  ];

  async function handleSend() {
    if (!firstName.trim() || !email.trim()) {
      setError("First name and email are required.");
      return;
    }
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/agency/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agency_id: agencyId,
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(),
          role,
          department: department || null,
        }),
      });
      const json = await res.json();

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(json.error || "Failed to send invitation.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-[#020408]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#0B0E14] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white">Invite Team Member</h2>
            <p className="text-sm text-slate-400 mt-1">
              Send an invitation to join your agency team
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-400">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-400">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-400">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#020408] border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-400">
              Select Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map((r) => (
                <label key={r.value} className="cursor-pointer group">
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="peer hidden"
                  />
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      role === r.value
                        ? "border-blue-500 bg-blue-500/5"
                        : "border-white/10 bg-white/[0.02] hover:border-blue-500/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded-full border-2 transition-all ${
                            role === r.value
                              ? "border-blue-500 bg-blue-500 shadow-[inset_0_0_0_2px_#0B0E14]"
                              : "border-slate-500"
                          }`}
                        />
                        <span className="text-sm font-semibold text-white">{r.label}</span>
                      </div>
                      {r.icon}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pl-6">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Department */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-400">
                Department (Optional)
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none appearance-none"
              >
                <option value="">Select a department...</option>
                <option value="Sales Team">Sales Team</option>
                <option value="Support Team">Support Team</option>
                <option value="Management">Management</option>
                <option value="IT">IT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Send Invitation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile Modal ─── */
function ProfileModal({
  member,
  session,
  onClose,
  onUpdate,
}: {
  member: TeamMember;
  session: AgencySession | null;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [editRole, setEditRole] = useState(member.role);
  const [editDepartment, setEditDepartment] = useState(member.department || "");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const role = ROLE_CONFIG[member.role] || ROLE_CONFIG.support;
  const status = STATUS_CONFIG[member.status] || STATUS_CONFIG.inactive;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/agency/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: member.id,
          agency_id: session?.agency_id,
          role: editRole,
          department: editDepartment || null,
        }),
      });
      if (res.ok) {
        onUpdate();
        onClose();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function handleSuspend() {
    const newStatus = member.status === "suspended" ? "active" : "suspended";
    try {
      await fetch("/api/agency/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: member.id,
          agency_id: session?.agency_id,
          status: newStatus,
        }),
      });
      onUpdate();
      onClose();
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-[#020408]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#0B0E14] border border-white/10 rounded-2xl shadow-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-start bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div
              className={`h-16 w-16 rounded-full bg-gradient-to-br ${
                member.avatar_gradient || "from-blue-600 to-indigo-600"
              } flex items-center justify-center text-white font-bold text-2xl border-4 border-[#0B0E14] shadow-lg`}
            >
              {getInitials(member.name)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{member.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-400">{member.email}</span>
                <span className="h-1 w-1 rounded-full bg-slate-500" />
                <span
                  className={`${role.bg} ${role.color} px-1.5 py-0.5 rounded text-[10px] font-bold uppercase`}
                >
                  {role.label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-6">
          {["overview", "edit"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "text-white border-blue-500"
                  : "text-slate-400 hover:text-white border-transparent hover:border-white/10"
              }`}
            >
              {tab === "overview" ? "Overview" : "Edit Role"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === "overview" ? (
            <>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-xs font-medium text-slate-500 uppercase mb-3">
                    Contact
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span className="text-white">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span className="text-white">
                        {member.phone || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-xs font-medium text-slate-500 uppercase mb-3">
                    Status
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Department</span>
                      <span className="text-white">{member.department || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Joined</span>
                      <span className="text-white">
                        {new Date(member.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Status</span>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${status.bg} border ${status.border}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Last Active</span>
                      <span className="text-slate-300">{timeAgo(member.last_active)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-xs font-medium text-slate-500 uppercase mb-3">
                  Client Access
                </div>
                {member.role === "owner" || member.role === "admin" ? (
                  <p className="text-sm text-slate-300">
                    This member has access to <span className="text-white font-medium">all clients</span> based on their role.
                  </p>
                ) : member.assigned_client_count > 0 ? (
                  <p className="text-sm text-slate-300">
                    Assigned to <span className="text-white font-medium">{member.assigned_client_count}</span> client{member.assigned_client_count !== 1 ? "s" : ""}.
                    Client assignments can be managed from the Edit Role tab.
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    No clients assigned. Use the Edit Role tab to assign clients.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {/* Edit Role */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-400">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as TeamMember["role"])}
                  disabled={member.role === "owner"}
                  className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none appearance-none disabled:opacity-50"
                >
                  <option value="admin">Admin</option>
                  <option value="sales">Sales Rep</option>
                  <option value="support">Support / VA</option>
                  <option value="developer">IT / Developer</option>
                </select>
              </div>

              {/* Edit Department */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-400">Department</label>
                <select
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none appearance-none"
                >
                  <option value="">None</option>
                  <option value="Sales Team">Sales Team</option>
                  <option value="Support Team">Support Team</option>
                  <option value="Management">Management</option>
                  <option value="IT">IT</option>
                </select>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] rounded-b-2xl flex justify-between items-center">
          {member.role !== "owner" ? (
            <button
              onClick={handleSuspend}
              className={`text-sm font-medium flex items-center gap-2 ${
                member.status === "suspended"
                  ? "text-green-400 hover:text-green-300"
                  : "text-red-400 hover:text-red-300"
              }`}
            >
              <Ban className="w-4 h-4" />
              {member.status === "suspended" ? "Reactivate Account" : "Suspend Account"}
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

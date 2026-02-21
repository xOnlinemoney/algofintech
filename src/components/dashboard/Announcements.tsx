"use client";

import { useState } from "react";
import {
  Search,
  Clock,
  Calendar,
  CalendarClock,
  Bell,
  Megaphone,
  ShieldAlert,
  OctagonAlert,
  FileText,
  Wrench,
  PartyPopper,
  Siren,
  FileDown,
  ChevronDown,
  X,
  CheckCheck,
  ArrowRight,
} from "lucide-react";
import {
  mockAnnouncements,
  mockPreviousAnnouncements,
  mockUpcomingSchedule,
  getAnnouncementPriorityColor,
} from "@/lib/mock-data";
import type { AnnouncementPriority } from "@/lib/types";

const iconMap: Record<string, React.ReactNode> = {
  "shield-alert": <ShieldAlert className="w-5 h-5" />,
  "octagon-alert": <OctagonAlert className="w-5 h-5" />,
  "file-text": <FileText className="w-5 h-5" />,
  wrench: <Wrench className="w-5 h-5" />,
  "party-popper": <PartyPopper className="w-5 h-5" />,
  megaphone: <Megaphone className="w-5 h-5" />,
  siren: <Siren className="w-6 h-6" />,
};

const filterTabs: { label: string; priority: AnnouncementPriority | "All" }[] = [
  { label: "All Announcements", priority: "All" },
  { label: "Critical", priority: "Critical" },
  { label: "Important", priority: "Important" },
  { label: "General", priority: "General" },
  { label: "Maintenance", priority: "Maintenance" },
];

export default function Announcements() {
  const [activeFilter, setActiveFilter] = useState<AnnouncementPriority | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  const banner = mockAnnouncements.find((a) => a.is_banner);
  const announcements = mockAnnouncements.filter((a) => !a.is_banner);

  let filtered = activeFilter === "All"
    ? announcements
    : announcements.filter((a) => a.priority === activeFilter);

  if (showUnreadOnly) {
    filtered = filtered.filter((a) => a.is_unread);
  }

  if (searchQuery) {
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="flex flex-col max-w-[1200px] mx-auto w-full gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Announcements
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Important updates, system status, and communications from our
              team.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#13161C] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-all w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors">
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          </div>
        </div>

        {/* Critical Banner */}
        {banner && !dismissedBanner && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start md:items-center justify-between gap-4 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
            <div className="flex items-start gap-4 z-10">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0">
                {iconMap[banner.icon] || <Siren className="w-6 h-6" />}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-red-100 flex items-center gap-2">
                  {banner.title}
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white uppercase tracking-wide">
                    Critical
                  </span>
                </h3>
                <p className="text-xs text-red-200/80">{banner.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 z-10">
              <button className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold transition-colors whitespace-nowrap">
                View Details
              </button>
              <button
                onClick={() => setDismissedBanner(true)}
                className="p-2 hover:bg-red-500/20 rounded-lg text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-1">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full md:w-auto">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.priority;
              const color =
                tab.priority === "All"
                  ? null
                  : getAnnouncementPriorityColor(tab.priority);
              return (
                <button
                  key={tab.priority}
                  onClick={() => setActiveFilter(tab.priority)}
                  className={
                    isActive
                      ? "px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-medium border border-white/10 whitespace-nowrap"
                      : "px-4 py-2 rounded-lg bg-[#13161C] text-slate-400 text-xs font-medium border border-white/5 whitespace-nowrap hover:text-slate-300 transition-colors flex items-center gap-2"
                  }
                >
                  {color && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${color.dot} inline-block`}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-500 font-medium">
              Show Unread Only
            </span>
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`w-10 h-5 rounded-full relative p-1 cursor-pointer transition-colors ${
                showUnreadOnly ? "bg-blue-600" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full shadow-sm transition-all ${
                  showUnreadOnly
                    ? "bg-white translate-x-5"
                    : "bg-slate-400 translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Announcements Feed */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {filtered.map((ann) => {
            const color = getAnnouncementPriorityColor(ann.priority);
            return (
              <div
                key={ann.id}
                className={`group bg-[#13161C] border border-white/5 border-l-4 ${color.leftBorder} rounded-lg p-5 hover:border-white/10 transition-all relative ${
                  !ann.is_unread ? "opacity-80 hover:opacity-100" : ""
                }`}
              >
                {ann.is_unread && (
                  <div className="absolute right-4 top-4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2.5 rounded-lg ${color.iconBg} border mt-1`}
                  >
                    {iconMap[ann.icon] || <Megaphone className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold ${color.text} ${color.bg} px-2 py-0.5 rounded border ${color.border}`}
                      >
                        {ann.category_label}
                      </span>
                      {ann.time_ago ? (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ann.time_ago}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          {ann.published_at}
                        </span>
                      )}
                      {ann.time_ago && (
                        <span className="text-[10px] text-slate-500">
                          • {ann.published_at}
                        </span>
                      )}
                    </div>
                    <h3
                      className={`text-base font-semibold ${
                        ann.is_unread ? "text-white" : "text-slate-200"
                      }`}
                    >
                      {ann.title}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed max-w-2xl ${
                        ann.is_unread ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {ann.description}
                    </p>

                    {/* Affected System */}
                    {ann.affected_system && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                          Affected: {ann.affected_system}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    {(ann.attachment || ann.cta) && (
                      <div className="flex items-center gap-3 mt-2">
                        {ann.attachment && (
                          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/5 border border-white/5 text-[10px] font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
                            <FileDown className="w-3 h-3" />
                            {ann.attachment.label}
                          </button>
                        )}
                        {ann.cta && (
                          <button className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                            {ann.cta.label}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Read actions for unread items without CTA */}
                    {ann.is_unread && !ann.cta && !ann.attachment && (
                      <div className="flex items-center gap-2 mt-2">
                        <button className="text-[10px] font-medium text-slate-500 hover:text-white transition-colors">
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500 text-sm">
                No announcements found matching your criteria.
              </p>
            </div>
          )}

          {/* Previous Announcements */}
          {activeFilter === "All" && !searchQuery && !showUnreadOnly && (
            <div className="flex flex-col gap-1 mt-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Previous Announcements
              </h4>

              {mockPreviousAnnouncements.map((prev) => {
                const color = getAnnouncementPriorityColor(prev.priority);
                return (
                  <div
                    key={prev.id}
                    className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-b border-white/5 border-dashed"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${color.dot} shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm text-slate-300 truncate">
                        {prev.title}
                      </h5>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {prev.published_at}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More */}
          <button className="w-full py-3 rounded-lg border border-white/5 bg-white/5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors mt-2">
            Load Older Announcements
          </button>
        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Upcoming Schedule */}
          <div className="bg-[#13161C] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#181b21]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CalendarClock className="w-3.5 h-3.5 text-blue-400" />
                Upcoming Schedule
              </h3>
            </div>
            <div className="flex flex-col">
              {mockUpcomingSchedule.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-4 hover:bg-white/5 transition-colors ${
                    i < mockUpcomingSchedule.length - 1
                      ? "border-b border-white/5"
                      : ""
                  }`}
                >
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded bg-white/5 border border-white/5 shrink-0">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">
                      {item.month}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {item.day}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">
                      {item.title}
                    </span>
                    <span className={`text-[10px] ${item.time_color}`}>
                      {item.time}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-sm font-semibold text-white">
                Notification Settings
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              <NotifToggle
                label="Email Digest"
                description="Daily summary of updates"
                defaultOn={true}
              />
              <NotifToggle
                label="Critical SMS"
                description="Only for urgent alerts"
                defaultOn={true}
              />
              <NotifToggle
                label="Push Notifications"
                description="Browser alerts"
                defaultOn={false}
              />
              <button className="mt-2 text-[10px] text-blue-400 font-medium hover:text-blue-300 transition-colors text-left">
                Manage detailed preferences
              </button>
            </div>
          </div>

          {/* Archive Widget */}
          <div className="bg-gradient-to-br from-blue-900/10 to-[#13161C] border border-white/5 rounded-xl p-5 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white">
              Announcement Archive
            </h3>
            <p className="text-xs text-slate-400">
              Looking for an older update? Browse our complete history of
              communications.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {["Nov 2024", "Oct 2024", "Sep 2024"].map((month) => (
                <button
                  key={month}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-slate-300 transition-colors"
                >
                  {month}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 text-xs font-medium text-white mt-2 group">
              Search Archive
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotifToggle({
  label,
  description,
  defaultOn,
}: {
  label: string;
  description: string;
  defaultOn: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <span className="text-[10px] text-slate-500">{description}</span>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${
          on ? "bg-blue-600" : "bg-white/10"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full absolute top-1 transition-all ${
            on ? "bg-white right-1" : "bg-slate-400 left-1"
          }`}
        />
      </button>
    </div>
  );
}

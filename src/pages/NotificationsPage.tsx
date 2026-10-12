import React, { useState } from "react";
import {
  Bell,
  Send,
  Clock,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Search,
  Trash2,
  Ban,
  Copy,
  Calendar,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useGetNotificationsQuery,
  useGetNotificationStatsQuery,
  useSendNotificationMutation,
  useCancelNotificationMutation,
  useDeleteNotificationMutation,
  type PushNotificationItem,
} from "@/redux/api/notificationApi";

export const NotificationsPage: React.FC = () => {
  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [target, setTarget] = useState<"all" | "users_only" | "guests_only">("all");
  const [deliveryMode, setDeliveryMode] = useState<"instant" | "scheduled">("instant");
  const [scheduledAt, setScheduledAt] = useState("");

  // Feedback State
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filter & Search State
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // API Hooks
  const { data: statsData, refetch: refetchStats } = useGetNotificationStatsQuery();
  const {
    data: listData,
    isLoading: isLoadingList,
    refetch: refetchList,
  } = useGetNotificationsQuery({
    page,
    limit: 15,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchTerm.trim() || undefined,
  });

  const [sendNotification, { isLoading: isSending }] = useSendNotificationMutation();
  const [cancelNotification, { isLoading: isCancelling }] = useCancelNotificationMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();

  // Stats
  const stats = statsData?.data || { totalDevices: 0, totalSent: 0, totalPending: 0 };

  // Handle Send / Schedule Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim()) {
      setFeedback({ type: "error", message: "Please provide a notification title." });
      return;
    }
    if (!body.trim()) {
      setFeedback({ type: "error", message: "Please provide a message body." });
      return;
    }

    if (deliveryMode === "scheduled") {
      if (!scheduledAt) {
        setFeedback({ type: "error", message: "Please select a date and time for scheduled delivery." });
        return;
      }
      const scheduledTime = new Date(scheduledAt).getTime();
      if (scheduledTime <= Date.now()) {
        setFeedback({ type: "error", message: "Scheduled time must be in the future." });
        return;
      }
    }

    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || undefined,
        target,
        scheduledAt: deliveryMode === "scheduled" ? new Date(scheduledAt).toISOString() : null,
      };

      const res = await sendNotification(payload).unwrap();
      setFeedback({
        type: "success",
        message: res.message || (deliveryMode === "scheduled" ? "Notification scheduled!" : "Notification sent!"),
      });

      // Reset form
      setTitle("");
      setBody("");
      setImageUrl("");
      setScheduledAt("");
      setDeliveryMode("instant");

      refetchStats();
      refetchList();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.data?.message || err?.message || "Failed to process notification.",
      });
    }
  };

  // Handle Cancel Schedule
  const handleCancel = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled notification?")) return;
    try {
      await cancelNotification(id).unwrap();
      setFeedback({ type: "success", message: "Notification schedule cancelled." });
      refetchList();
      refetchStats();
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.data?.message || "Failed to cancel notification." });
    }
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this notification record from history?")) return;
    try {
      await deleteNotification(id).unwrap();
      setFeedback({ type: "success", message: "Notification deleted from history." });
      refetchList();
      refetchStats();
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.data?.message || "Failed to delete notification." });
    }
  };

  // Copy template to form
  const handleReuse = (item: PushNotificationItem) => {
    setTitle(item.title);
    setBody(item.body);
    setImageUrl(item.imageUrl || "");
    setTarget(item.target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Format Helper
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get current local datetime string for input min attribute
  const minDateTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Push Notifications</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              FCM Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Broadcast push alerts instantly to users or schedule automated campaigns via Firebase.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchStats();
            refetchList();
          }}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Registered Devices</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalDevices.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ready to receive push alerts</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Sent</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalSent.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Successful push campaigns</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Scheduled / Pending</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalPending.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Waiting in queue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:opacity-80 font-medium ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Form (Left) & Mobile Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Compose Form */}
        <div className="lg:col-span-7">
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">Compose Notification</CardTitle>
                  <CardDescription>Configure message details, target audience, and dispatch mode</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Target Audience
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "all", label: "All Devices", desc: "Everyone" },
                      { id: "users_only", label: "Logged-In", desc: "Registered users" },
                      { id: "guests_only", label: "Guests", desc: "Unauthenticated" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTarget(item.id as any)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          target === item.id
                            ? "border-blue-600 bg-blue-50/50 text-blue-900 font-medium ring-1 ring-blue-600"
                            : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                        }`}
                      >
                        <div className="text-xs font-semibold">{item.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Notification Title <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">{title.length}/65 chars</span>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Special 20% Discount on Home Cleaning!"
                    maxLength={100}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400"
                  />
                </div>

                {/* Body / Message */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Message Body <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">{body.length}/200 chars</span>
                  </div>
                  <textarea
                    rows={3}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="e.g. Book your service today and enjoy an exclusive discount. Use code WIDE20 at checkout."
                    maxLength={350}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Image URL (Optional) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Banner Image URL <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.example.com/promo-banner.jpg"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Delivery Mode (Instant vs Scheduled) */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Delivery Timing
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <label
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        deliveryMode === "instant"
                          ? "border-blue-600 bg-blue-50/40 text-blue-900 ring-1 ring-blue-600"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMode"
                        checked={deliveryMode === "instant"}
                        onChange={() => setDeliveryMode("instant")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-semibold flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-blue-600" /> Send Now
                        </div>
                        <div className="text-[11px] text-slate-400">Deliver to devices immediately</div>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        deliveryMode === "scheduled"
                          ? "border-blue-600 bg-blue-50/40 text-blue-900 ring-1 ring-blue-600"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMode"
                        checked={deliveryMode === "scheduled"}
                        onChange={() => setDeliveryMode("scheduled")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-semibold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" /> Schedule for Later
                        </div>
                        <div className="text-[11px] text-slate-400">Set date & time to auto-send</div>
                      </div>
                    </label>
                  </div>

                  {/* Scheduled Date/Time Input */}
                  {deliveryMode === "scheduled" && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 animate-in fade-in">
                      <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" /> Select Dispatch Date & Time:
                      </label>
                      <input
                        type="datetime-local"
                        min={minDateTime}
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        required={deliveryMode === "scheduled"}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
                      />
                      <p className="text-[11px] text-slate-500">
                        The backend cron worker runs every minute and will dispatch automatically at this time.
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Delivery...</span>
                      </>
                    ) : deliveryMode === "scheduled" ? (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Schedule Push Notification</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Push Notification Now</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Live Mobile Device Preview Mockup */}
        <div className="lg:col-span-5">
          <Card className="border-slate-200 shadow-xs sticky top-6">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <CardTitle className="text-sm">Live Mobile Lockscreen Preview</CardTitle>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Real-time simulation</span>
              </div>
            </CardHeader>
            <CardContent className="pt-5 flex flex-col items-center">
              {/* Phone Frame */}
              <div className="w-full max-w-[340px] bg-slate-900 rounded-[32px] p-3 shadow-xl border-4 border-slate-800">
                {/* Speaker notch */}
                <div className="w-20 h-3.5 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                </div>

                {/* Phone screen */}
                <div className="bg-gradient-to-b from-slate-800 to-slate-950 rounded-[22px] p-3 min-h-[360px] flex flex-col justify-between text-white">
                  {/* Lockscreen Header Time */}
                  <div className="text-center pt-2">
                    <div className="text-3xl font-light tracking-tight">09:41</div>
                    <div className="text-[11px] text-slate-400 font-normal">Tuesday, October 12</div>
                  </div>

                  {/* Notification Card on lockscreen */}
                  <div className="my-auto">
                    <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-lg text-slate-100 space-y-2">
                      {/* App header */}
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-md bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold">
                            W
                          </div>
                          <span className="font-semibold text-white">Wide Service</span>
                        </div>
                        <span className="text-[10px] text-slate-400">now</span>
                      </div>

                      {/* Notification Title & Body */}
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white leading-tight">
                          {title || "Notification Title Appears Here"}
                        </div>
                        <div className="text-[11px] text-slate-200 leading-snug line-clamp-3">
                          {body || "Your message description and details will appear here as users see it on their phones."}
                        </div>
                      </div>

                      {/* Optional Image Banner */}
                      {imageUrl && (
                        <div className="pt-1">
                          <img
                            src={imageUrl}
                            alt="Notification preview"
                            onError={(e) => {
                              // Hide broken image in preview
                              (e.target as HTMLElement).style.display = "none";
                            }}
                            className="w-full h-28 object-cover rounded-lg border border-white/10"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lockscreen Bottom Bar */}
                  <div className="flex justify-between items-center px-4 pb-1 text-slate-400 text-xs">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="w-16 h-1 bg-white/30 rounded-full"></div>
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-3 text-center">
                This shows the Android & iOS lockscreen notification card format.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History & Scheduled Notifications Table */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Notification History & Queue</CardTitle>
              <CardDescription>Track all delivered campaigns and manage upcoming scheduled alerts</CardDescription>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search title..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 w-44"
                />
              </div>

              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium text-slate-600">
                {[
                  { id: "all", label: "All" },
                  { id: "sent", label: "Sent" },
                  { id: "pending", label: "Scheduled" },
                  { id: "failed", label: "Failed" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      statusFilter === tab.id ? "bg-white text-slate-900 shadow-xs font-semibold" : "hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-400 bg-slate-50/50">
                <tr>
                  <th className="py-3 px-4 font-semibold">Notification</th>
                  <th className="py-3 px-4 font-semibold">Target Audience</th>
                  <th className="py-3 px-4 font-semibold">Timing / Schedule</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Delivered</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingList ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                      Loading notifications...
                    </td>
                  </tr>
                ) : !listData?.data || listData.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-medium text-slate-600">No notifications found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Create your first notification above to reach your users.
                      </p>
                    </td>
                  </tr>
                ) : (
                  listData.data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Notification Info */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 mt-0.5"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-400 mt-0.5">
                              <Bell className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.body}</p>
                          </div>
                        </div>
                      </td>

                      {/* Audience */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                          {item.target === "all"
                            ? "All Devices"
                            : item.target === "users_only"
                            ? "Logged-in Users"
                            : "Guests Only"}
                        </span>
                      </td>

                      {/* Timing */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {item.status === "pending" && item.scheduledAt ? (
                          <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>{formatDateTime(item.scheduledAt)}</span>
                          </div>
                        ) : item.sentAt ? (
                          <div className="text-slate-600">{formatDateTime(item.sentAt)}</div>
                        ) : (
                          <div className="text-slate-400">{formatDateTime(item.createdAt)}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {item.status === "sent" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Sent
                          </span>
                        )}
                        {item.status === "pending" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 animate-spin" /> Scheduled
                          </span>
                        )}
                        {item.status === "failed" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Failed
                          </span>
                        )}
                        {item.status === "cancelled" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Ban className="w-3 h-3" /> Cancelled
                          </span>
                        )}
                      </td>

                      {/* Delivered Count */}
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {item.status === "sent" ? (
                          <span className="text-emerald-700 font-semibold">
                            {item.successCount || 0} devices
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(item.id)}
                              disabled={isCancelling}
                              title="Cancel Schedule"
                              className="h-8 px-2 text-amber-700 border-amber-200 hover:bg-amber-50"
                            >
                              <Ban className="w-3.5 h-3.5 mr-1" /> Cancel
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReuse(item)}
                            title="Reuse this notification template"
                            className="h-8 px-2 text-slate-600 hover:text-blue-600"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting}
                            title="Delete Record"
                            className="h-8 px-2 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {listData && listData.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Page {listData.page} of {listData.totalPages} (Total {listData.total} notifications)
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-3 text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= listData.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 px-3 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;

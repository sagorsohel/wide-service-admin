import React, { useState } from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  Shield,
  ShieldAlert,
  Sparkles,
  Search,
  RefreshCw,
  Trash2,
  Edit,
  Phone,
  Mail,
  Calendar,
  Eye,
  PhoneCall,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/Pagination";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  type UserItem,
} from "@/redux/api/userApi";

export const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editRoleUser, setEditRoleUser] = useState<UserItem | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<UserItem | null>(null);

  // Add User Form
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "customer" as "customer" | "creator" | "admin" | "staff" | "superadmin",
  });

  // Action status feedback
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch Users Query
  const {
    data: usersResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetUsersQuery({
    page,
    limit,
    search: searchTerm.trim() || undefined,
    role: selectedRole === "all" ? undefined : selectedRole,
  });

  // Mutations
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const usersList: UserItem[] = usersResponse?.data || [];
  const pagination = usersResponse?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const stats = usersResponse?.stats || {
    totalUsers: 0,
    customerCount: 0,
    creatorCount: 0,
    adminCount: 0,
  };

  const showAlert = (type: "success" | "error", text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Handle Add User
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.password.trim()) {
      showAlert("error", "Name, Phone and Password are required.");
      return;
    }

    try {
      const res = await createUser({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        password: formData.password,
        role: formData.role,
      }).unwrap();

      showAlert("success", res.message || "User created successfully!");
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "customer",
      });
    } catch (err: any) {
      showAlert("error", err?.data?.message || "Failed to create user");
    }
  };

  // Handle Update Role
  const handleRoleUpdate = async (newRole: "superadmin" | "creator" | "admin" | "staff" | "customer") => {
    if (!editRoleUser) return;
    try {
      const res = await updateUserRole({ id: editRoleUser.id, role: newRole }).unwrap();
      showAlert("success", res.message || "User role updated successfully!");
      setEditRoleUser(null);
    } catch (err: any) {
      showAlert("error", err?.data?.message || "Failed to update role");
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!deleteUserTarget) return;
    try {
      const res = await deleteUser(deleteUserTarget.id).unwrap();
      showAlert("success", res.message || "User deleted successfully!");
      setDeleteUserTarget(null);
    } catch (err: any) {
      showAlert("error", err?.data?.message || "Failed to delete user");
    }
  };

  // Role Badge Styling
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "superadmin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldAlert className="w-3 h-3 text-purple-600" /> Super Admin
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
            <Shield className="w-3 h-3 text-amber-600" /> Admin
          </span>
        );
      case "creator":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Sparkles className="w-3 h-3 text-blue-600" /> Creator
          </span>
        );
      case "staff":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 border border-cyan-200">
            Staff
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3 h-3 text-emerald-600" /> Customer / User
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      {alertMsg && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl shadow-sm border animate-in fade-in ${
            alertMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-3">
            {alertMsg.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <p className="text-sm font-medium">{alertMsg.text}</p>
          </div>
          <button
            onClick={() => setAlertMsg(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            User Management
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              Live DB
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            মোবাইল অ্যাপ ও ওয়েব থেকে নিবন্ধিত সকল গ্রাহক, ক্রিয়েটর ও অ্যাডমিনদের রিয়েল-টাইম তালিকা।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-amber-500" : ""}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-amber-500 to-[#e0b328] hover:from-amber-600 hover:to-[#cfa320] text-slate-950 font-bold shadow-md shadow-amber-500/20"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</h3>
              <p className="text-xs text-slate-500 mt-0.5">নিবন্ধিত মোট একাউন্ট</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Customers (App)</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.customerCount}</h3>
              <p className="text-xs text-slate-500 mt-0.5">সাধারণ মোবাইল অ্যাপ ইউজার</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Creators</p>
              <h3 className="text-2xl font-black text-blue-600 mt-1">{stats.creatorCount}</h3>
              <p className="text-xs text-slate-500 mt-0.5">সার্ভিস প্রদানকারী পার্টনার</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Sparkles className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Admins & Staff</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{stats.adminCount}</h3>
              <p className="text-xs text-slate-500 mt-0.5">ম্যানেজমেন্ট ও সুপার এডমিন</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Shield className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">All Registered Users</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                ডাটাবেজে সংরক্ষিত ইউজারদের তথ্য খুঁজুন এবং এক্সেস নিয়ন্ত্রণ করুন।
              </CardDescription>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-slate-800"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Role Filter Tabs */}
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setPage(1);
                }}
                className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-700"
              >
                <option value="all">All Roles (সকল)</option>
                <option value="customer">Customer (সাধারণ ইউজার)</option>
                <option value="creator">Creator (সার্ভিস প্রোভাইডার)</option>
                <option value="admin">Admin (অ্যাডমিন)</option>
                <option value="superadmin">Super Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-slate-200 text-xs uppercase font-bold text-slate-500 bg-slate-50/75">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200" />
                          <div className="space-y-1.5">
                            <div className="w-28 h-3.5 bg-slate-200 rounded" />
                            <div className="w-16 h-2.5 bg-slate-100 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div className="w-24 h-3 bg-slate-200 rounded" />
                          <div className="w-32 h-2.5 bg-slate-100 rounded" />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-20 h-5 bg-slate-200 rounded-full" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-20 h-3 bg-slate-200 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-20 h-3 bg-slate-200 rounded" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="w-8 h-8 bg-slate-200 rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <Users className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-slate-700">কোন ইউজার পাওয়া যায়নি</p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          {searchTerm
                            ? `"${searchTerm}" এর সাথে মিল রেখে কোন ফলাফল পাওয়া যায়নি। অন্য কিছু দিয়ে চেষ্টা করুন।`
                            : "ডাটাবেজে বর্তমানে এই ক্যাটাগরিতে কোন ইউজার নিবন্ধিত নেই।"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  usersList.map((user) => {
                    const initials = (user.name || "U").charAt(0).toUpperCase();
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* User Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-[#e0b328] flex items-center justify-center text-slate-950 font-black text-sm shadow-sm border border-amber-300">
                                {initials}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{user.name}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-bold border border-slate-200">
                                  #{user.id}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400">
                                {user.role === "creator" ? "Service Creator" : "App Member"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <a
                              href={`tel:${user.phone}`}
                              className="text-xs font-semibold text-slate-800 hover:text-amber-600 flex items-center gap-1.5 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {user.phone}
                            </a>
                            {user.email ? (
                              <a
                                href={`mailto:${user.email}`}
                                className="text-xs text-slate-500 hover:text-amber-600 flex items-center gap-1.5 transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {user.email}
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No email</span>
                            )}
                          </div>
                        </td>

                        {/* Role Column */}
                        <td className="py-3.5 px-4">{renderRoleBadge(user.role)}</td>

                        {/* Activity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                            <span className="flex items-center gap-1" title="Services Viewed">
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              {user.servicesViewed ?? 0}
                            </span>
                            <span className="flex items-center gap-1" title="Calls Clicked">
                              <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                              {user.callsClicked ?? 0}
                            </span>
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditRoleUser(user)}
                              title="Change Role"
                              className="h-8 px-2 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-amber-50"
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" />
                              Role
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteUserTarget(user)}
                              title="Delete User"
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setPage(p)}
                totalItems={pagination.total}
                pageSize={limit}
                onPageSizeChange={(newSize) => {
                  setLimit(newSize);
                  setPage(1);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New User</h3>
                <p className="text-xs text-slate-500">নতুন ইউজার একাউন্ট তৈরি করুন</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rakibul Hasan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 01894781338"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium"
                >
                  <option value="customer">Customer (App User)</option>
                  <option value="creator">Creator (Service Provider)</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="border-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  {isCreating ? "Creating..." : "Save User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editRoleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Change User Role</h3>
              <button
                onClick={() => setEditRoleUser(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-4">
              <p className="text-xs text-slate-500">
                Update account permission level for <strong className="text-slate-800">{editRoleUser.name}</strong> ({editRoleUser.phone}):
              </p>

              <div className="mt-3 space-y-2">
                {[
                  { role: "customer", label: "Customer", desc: "Regular mobile app user" },
                  { role: "creator", label: "Creator", desc: "Can manage listed services" },
                  { role: "admin", label: "Admin", desc: "Admin dashboard access" },
                  { role: "staff", label: "Staff", desc: "Staff support permissions" },
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleRoleUpdate(item.role as any)}
                    disabled={isUpdatingRole}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      editRoleUser.role === item.role
                        ? "border-amber-500 bg-amber-50/50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.label}</p>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </div>
                    {editRoleUser.role === item.role && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditRoleUser(null)}
                className="border-slate-200"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteUserTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete User Account?</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              আপনি কি নিশ্চিত যে আপনি <strong className="text-slate-800">{deleteUserTarget.name}</strong> ({deleteUserTarget.phone}) এর একাউন্ট মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteUserTarget(null)}
                className="border-slate-200"
              >
                বাতিল করুন
              </Button>
              <Button
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteUser}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                {isDeleting ? "মুছে ফেলা হচ্ছে..." : "হ্যাঁ, মুছে ফেলুন"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

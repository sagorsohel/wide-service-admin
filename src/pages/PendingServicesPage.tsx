import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Building2,
  Phone,
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppSelector } from "@/redux/store";
import {
  useGetServicesQuery,
  useUpdateServiceStatusMutation,
  useDeleteServiceMutation,
  type Service,
} from "@/redux/api/serviceApi";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";
import { Pagination } from "@/components/ui/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const PendingServicesPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isSuperAdmin = user?.role === "superadmin";

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  // Detail & Delete modal states
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Queries & Mutations
  const {
    data: servicesResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetServicesQuery({
    status: "pending",
    categoryId: categoryFilter !== "all" ? Number(categoryFilter) : undefined,
    search: searchTerm,
    page: currentPage,
    limit: pageSize,
  });

  const { data: categoriesResponse } = useGetCategoriesQuery();
  const [updateServiceStatus, { isLoading: isUpdatingStatus }] = useUpdateServiceStatusMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const categories = categoriesResponse?.data || [];
  const pendingServices = servicesResponse?.data || [];
  const totalPending = servicesResponse?.total ?? pendingServices.length;
  const totalPages = servicesResponse?.totalPages ?? (Math.ceil(totalPending / pageSize) || 1);

  // Handler: Approve service (Super Admin only)
  const handleApprove = async (service: Service) => {
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
    if (!isSuperAdmin) {
      setActionErrorMsg("Only Super Admin is allowed to approve or reject services.");
      return;
    }
    try {
      await updateServiceStatus({ id: service.id, status: "active" }).unwrap();
      setActionSuccessMsg(`"${service.name}" has been approved! It is now live in the mobile app.`);
      if (viewingService?.id === service.id) {
        setViewingService(null);
      }
    } catch (err: any) {
      setActionErrorMsg(err?.data?.message || "Failed to approve service. Please try again.");
    }
  };

  // Handler: Reject service (Super Admin only)
  const handleReject = async (service: Service) => {
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
    if (!isSuperAdmin) {
      setActionErrorMsg("Only Super Admin is allowed to approve or reject services.");
      return;
    }
    try {
      await updateServiceStatus({ id: service.id, status: "rejected" }).unwrap();
      setActionSuccessMsg(`"${service.name}" was marked as rejected.`);
      if (viewingService?.id === service.id) {
        setViewingService(null);
      }
    } catch (err: any) {
      setActionErrorMsg(err?.data?.message || "Failed to reject service. Please try again.");
    }
  };

  // Handler: Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingService) return;
    try {
      await deleteService(deletingService.id).unwrap();
      setActionSuccessMsg(`"${deletingService.name}" was permanently removed.`);
      setDeletingService(null);
    } catch (err: any) {
      setActionErrorMsg(err?.data?.message || "Failed to delete service.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Pending Services Approval
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <Clock className="w-3.5 h-3.5" />
              {totalPending} Awaiting Review
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review new services submitted by creators. Approved services immediately become active and visible in the Wide Service mobile app.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link to="/services">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              View All Services
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Feedback Messages */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-sm shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-md"
          >
            ✕
          </button>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between text-sm shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{actionErrorMsg}</span>
          </div>
          <button
            onClick={() => setActionErrorMsg(null)}
            className="text-rose-700 hover:text-rose-900 p-1 rounded-md"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pending services by name, business, phone, or address..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-2xs"
          />
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={categoryFilter}
            onValueChange={(val) => {
              setCategoryFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full text-sm rounded-xl h-10 border-slate-200 bg-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="h-64 rounded-2xl bg-slate-200/60 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 shadow-xs">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-base">Failed to load pending services</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">An error occurred while communicating with the server.</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      ) : pendingServices.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center my-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            No Pending Services!
          </h3>
          <p className="text-sm text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
            All submitted services have been reviewed. When creators add new services, they will automatically appear here for your review and approval.
          </p>
          <Link to="/services">
            <Button className="bg-[#e0b328] hover:bg-amber-500 text-slate-950 font-bold px-6 rounded-xl shadow-sm">
              Manage Active Services
            </Button>
          </Link>
        </div>
      ) : (
        /* Pending Services Grid */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pendingServices.map((service) => (
              <Card
                key={service.id}
                className="overflow-hidden border border-amber-200/90 bg-white shadow-xs hover:shadow-md transition-all rounded-2xl flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with Status Badge */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/70 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          {service.logo ? (
                            <img
                              src={service.logo}
                              alt={service.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100";
                              }}
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-amber-700" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-slate-900 truncate leading-snug">
                            {service.name}
                          </h3>
                          {service.businessName && (
                            <p className="text-xs font-semibold text-amber-800 truncate">
                              {service.businessName}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shrink-0">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Pending
                      </span>
                    </div>

                    {/* Category Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="inline-flex items-center text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                        {service.categoryName || "General Category"}
                      </span>
                      {service.subcategoryName && (
                        <span className="inline-flex items-center text-[11px] font-medium bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md">
                          {service.subcategoryName}
                        </span>
                      )}
                    </div>

                    {/* Creator / Submission Metadata */}
                    <div className="text-xs text-slate-500 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Submitted by:</span>
                        <span className="font-bold text-slate-800">
                          {service.creatorName || `User #${service.userId || "N/A"}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Phone:</span>
                        <a
                          href={`tel:${service.phone}`}
                          className="font-mono font-semibold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {service.phone}
                        </a>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-slate-400 font-medium shrink-0">Address:</span>
                        <span className="font-medium text-slate-700 text-right truncate max-w-[180px]">
                          {service.address}
                        </span>
                      </div>
                      {service.schedule && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-400 font-medium shrink-0">Schedule:</span>
                          <span className="font-semibold text-blue-700 text-right truncate max-w-[180px]">
                            {service.schedule}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description preview */}
                    {service.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic mb-2">
                        "{service.description}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingService(service)}
                      title="View Details"
                      className="text-slate-600 hover:text-slate-900 px-2 h-8"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingService(service)}
                        title="Delete"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 h-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Decision Buttons (Approve / Reject - Super Admin Only) */}
                  {isSuperAdmin ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(service)}
                        disabled={isUpdatingStatus}
                        className="text-xs font-semibold text-rose-700 border-rose-300 hover:bg-rose-50 h-8 px-2.5"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                        Reject
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleApprove(service)}
                        disabled={isUpdatingStatus}
                        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Approve & Publish
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 italic">
                      Approval reserved for Super Admin
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-bold text-lg text-slate-900">Pending Service Details</h3>
              </div>
              <button
                onClick={() => setViewingService(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 p-2 flex items-center justify-center shrink-0">
                  {viewingService.logo ? (
                    <img
                      src={viewingService.logo}
                      alt={viewingService.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-amber-700" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">{viewingService.name}</h4>
                  {viewingService.businessName && (
                    <p className="font-bold text-amber-800 text-xs">{viewingService.businessName}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">
                    Category: {viewingService.categoryName} {viewingService.subcategoryName && `• ${viewingService.subcategoryName}`}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Hotline Phone:</span>
                  <span className="font-mono font-bold text-slate-800">{viewingService.phone}</span>
                </div>
                {viewingService.whatsapp && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">WhatsApp:</span>
                    <span className="font-mono font-bold text-emerald-700">{viewingService.whatsapp}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Address:</span>
                  <span className="font-medium text-slate-800 text-right">{viewingService.address}</span>
                </div>
                {viewingService.schedule && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Operating Schedule:</span>
                    <span className="font-semibold text-blue-700 text-right">{viewingService.schedule}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Creator / Owner:</span>
                  <span className="font-bold text-indigo-700">
                    {viewingService.creatorName || `User #${viewingService.userId || "N/A"}`}
                  </span>
                </div>
              </div>

              {viewingService.description && (
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">
                    Service Description
                  </h5>
                  <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
                    {viewingService.description}
                  </p>
                </div>
              )}

              {/* Uploaded Photos preview */}
              {viewingService.images && viewingService.images.length > 0 && (
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                    Uploaded Showcase Images ({viewingService.images.length})
                  </h5>
                  <div className="grid grid-cols-3 gap-2">
                    {viewingService.images.map((imgUri, idx) => (
                      <a
                        key={idx}
                        href={imgUri}
                        target="_blank"
                        rel="noreferrer"
                        className="h-20 rounded-xl overflow-hidden border border-slate-200 block group relative"
                      >
                        <img
                          src={imgUri}
                          alt={`showcase-${idx}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setViewingService(null)}
                className="rounded-xl"
              >
                Close
              </Button>

              {isSuperAdmin ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(viewingService)}
                    disabled={isUpdatingStatus}
                    className="text-rose-700 border-rose-300 hover:bg-rose-50 rounded-xl"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(viewingService)}
                    disabled={isUpdatingStatus}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Approve & Make Active
                  </Button>
                </div>
              ) : (
                <span className="text-xs font-medium text-slate-500 italic">
                  Only Super Admin can approve or reject
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-center text-slate-900">Delete Pending Service?</h3>
            <p className="text-xs text-slate-500 text-center mt-1 mb-6">
              Are you sure you want to permanently remove "{deletingService.name}"? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeletingService(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingServicesPage;

import React, { useState, useRef } from "react";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Search,
  Image as ImageIcon,
  Phone,
  MessageCircle,
  MapPin,
  Building2,
  Tag,
  Layers,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Eye,
  Loader2,
  ShieldAlert,
  Sparkles,
  Filter,
  Check,
  Grid,
  List,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppSelector } from "@/redux/store";
import {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  type Service,
} from "@/redux/api/serviceApi";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";
import { useGetSubcategoriesQuery } from "@/redux/api/subcategoryApi";
import { useUploadImageMutation, useUploadMultipleImagesMutation } from "@/redux/api/uploadApi";
import { Pagination } from "@/components/ui/Pagination";
import { ServiceSchedulePicker } from "@/components/ServiceSchedulePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ServicesPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isSuperAdmin = user?.role === "superadmin";
  const isCreator = user?.role === "creator";
  const canManageServices = isSuperAdmin || isCreator || user?.role === "admin";

  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // API Queries
  const { data: servicesResponse, isLoading, isError, refetch } = useGetServicesQuery({
    categoryId: categoryFilter !== "all" ? Number(categoryFilter) : undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : "all",
    search: searchTerm,
    page: currentPage,
    limit: pageSize,
  });
  const { data: categoriesResponse } = useGetCategoriesQuery();

  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const [uploadImage, { isLoading: isUploadingLogo }] = useUploadImageMutation();
  const [uploadMultipleImages, { isLoading: isUploadingMultiple }] = useUploadMultipleImagesMutation();

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetService, setTargetService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [schedule, setSchedule] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [subcategoryId, setSubcategoryId] = useState<number | "">("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "pending" | "rejected">(
    isCreator ? "pending" : "active"
  );
  const [logo, setLogo] = useState("");
  const [serviceImages, setServiceImages] = useState<string[]>([]);

  // Feedback states
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // File Input Refs
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const multiImagesInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic Subcategories for Modal (filtered by selected category)
  const { data: subcategoriesResponse, isLoading: isLoadingSubcategories } = useGetSubcategoriesQuery(
    categoryId !== "" ? { categoryId: Number(categoryId) } : undefined
  );

  const categories = categoriesResponse?.data || [];
  const subcategories = subcategoriesResponse?.data || [];
  const services = servicesResponse?.data || [];
  const totalServices = servicesResponse?.total ?? services.length;
  const totalPages = servicesResponse?.totalPages ?? (Math.ceil(totalServices / pageSize) || 1);

  // Filtered Services List (already filtered on server with pagination)
  const filteredServices = services;

  // Modal Handlers
  const openCreateModal = () => {
    if (!canManageServices) return;
    setEditingService(null);
    setName("");
    setBusinessName("");
    setSchedule("");
    setCategoryId("");
    setSubcategoryId("");
    setPhone("");
    setWhatsapp("");
    setAddress("");
    setDescription("");
    setStatus(isSuperAdmin ? "active" : "pending");
    setLogo("");
    setServiceImages([]);
    setFormError(null);
    setUploadSuccessMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    if (!canManageServices) return;
    setEditingService(service);
    setName(service.name);
    setBusinessName(service.businessName || "");
    setSchedule(service.schedule || "");
    setCategoryId(service.categoryId);
    setSubcategoryId(service.subcategoryId || "");
    setPhone(service.phone);
    setWhatsapp(service.whatsapp || "");
    setAddress(service.address);
    setDescription(service.description || "");
    setStatus(service.status);
    setLogo(service.logo || "");
    setServiceImages(service.images || []);
    setFormError(null);
    setUploadSuccessMsg(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (service: Service) => {
    if (!canManageServices) return;
    setTargetService(service);
    setIsDeleteModalOpen(true);
  };

  // Handle Logo Upload (Single Image)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);
    setUploadSuccessMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadImage(formData).unwrap();
      if (res?.url) {
        setLogo(res.url);
        setUploadSuccessMsg("Profile Image uploaded successfully!");
      }
    } catch (err: any) {
      setFormError(err?.data?.message || err?.message || "Failed to upload Profile Image.");
    } finally {
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  // Handle Multiple Images Upload
  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFormError(null);
    setUploadSuccessMsg(null);

    const fileList = Array.from(files);

    try {
      // Attempt backend multiple upload endpoint first
      const formData = new FormData();
      fileList.forEach((file) => formData.append("files", file));

      const res = await uploadMultipleImages(formData).unwrap();
      if (res?.urls && res.urls.length > 0) {
        setServiceImages((prev) => [...prev, ...res.urls]);
        setUploadSuccessMsg(`${res.urls.length} service images uploaded successfully!`);
      }
    } catch {
      // Fallback: Upload images individually via single upload endpoint
      try {
        const uploadPromises = fileList.map(async (file) => {
          const singleData = new FormData();
          singleData.append("file", file);
          const singleRes = await uploadImage(singleData).unwrap();
          return singleRes.url;
        });

        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter(Boolean);
        setServiceImages((prev) => [...prev, ...validUrls]);
        setUploadSuccessMsg(`${validUrls.length} images uploaded successfully!`);
      } catch (innerErr: any) {
        setFormError(
          innerErr?.data?.message || innerErr?.message || "Failed to upload service images."
        );
      }
    } finally {
      if (multiImagesInputRef.current) multiImagesInputRef.current.value = "";
    }
  };

  const removeServiceImage = (indexToRemove: number) => {
    setServiceImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Handler (Create or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Service name is required.");
      return;
    }
    if (!categoryId) {
      setFormError("Please select a Category first.");
      return;
    }
    if (!phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }
    if (!address.trim()) {
      setFormError("Address is required.");
      return;
    }

    // Creator cannot change or approve status. Only Super Admin can set status.
    const finalStatus: "active" | "inactive" | "pending" | "rejected" = !isSuperAdmin
      ? editingService
        ? editingService.status
        : "pending"
      : status;

    try {
      if (editingService) {
        await updateService({
          id: editingService.id,
          name: name.trim(),
          businessName: businessName.trim() || null,
          schedule: schedule.trim() || null,
          categoryId: Number(categoryId),
          subcategoryId: subcategoryId ? Number(subcategoryId) : null,
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || null,
          address: address.trim(),
          description: description.trim() || null,
          status: finalStatus,
          logo: logo.trim() || null,
          images: serviceImages,
        }).unwrap();
      } else {
        await createService({
          name: name.trim(),
          businessName: businessName.trim() || null,
          schedule: schedule.trim() || null,
          categoryId: Number(categoryId),
          subcategoryId: subcategoryId ? Number(subcategoryId) : null,
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || null,
          address: address.trim(),
          description: description.trim() || null,
          status: finalStatus,
          logo: logo.trim() || null,
          images: serviceImages,
        }).unwrap();
      }

      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      setFormError(err?.data?.message || err?.message || "Operation failed.");
    }
  };

  // Confirm Delete Handler
  const confirmDelete = async () => {
    if (!canManageServices || !targetService) return;

    try {
      await deleteService(targetService.id).unwrap();
      setIsDeleteModalOpen(false);
      setTargetService(null);
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to delete service");
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Notice Banner */}
      {!canManageServices ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold">Read-Only Access</p>
              <p className="text-xs text-amber-700">
                You are logged in as <span className="font-bold">{user?.role}</span>. Only{" "}
                <span className="font-bold">Super Admin</span> and{" "}
                <span className="font-bold">Creator</span> roles can create, edit, or delete services.
              </p>
            </div>
          </div>
        </div>
      ) : isCreator ? (
        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              You are logged in as <strong className="font-semibold">Creator</strong>. Showing only your own services. Any new service you submit will be pending review until approved by Super Admin.
            </span>
          </div>
        </div>
      ) : null}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {isCreator ? "My Services" : "Services Catalog"}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {services.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {isCreator
              ? "Manage your service offerings, showcase images, business details, and track approval status."
              : "Manage provider listings, multiple photo showcases, direct contact details, and categories."}
          </p>
        </div>

        {canManageServices && (
          <Button
            onClick={openCreateModal}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Service
          </Button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Services</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{services.length}</p>
          <span className="text-[11px] text-slate-400">Total registered</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            {services.filter((s) => s.status === "active").length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Published live</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Categories</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{categories.length}</p>
          <span className="text-[11px] text-slate-400">Available categories</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Gallery Photos</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {services.reduce((acc, curr) => acc + (curr.images?.length || 0), 0)}
          </p>
          <span className="text-[11px] text-slate-400">Showcase images</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <Card className="border-slate-200 shadow-2xs">
        <CardHeader className="p-4 pb-3 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search services, business name, phone, address..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Filter Dropdowns (Shadcn Select) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500 shrink-0">Category:</span>
                <Select
                  value={categoryFilter}
                  onValueChange={(val) => {
                    setCategoryFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="border-0 shadow-none bg-transparent h-7 text-xs font-medium text-slate-800 p-0 focus:ring-0 gap-1.5 cursor-pointer">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600">
                <span className="font-semibold text-slate-500 shrink-0">Status:</span>
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="border-0 shadow-none bg-transparent h-7 text-xs font-medium text-slate-800 p-0 focus:ring-0 gap-1.5 cursor-pointer">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    viewMode === "grid" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    viewMode === "table" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs h-8">
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Loading services...</p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center text-red-500">
              <AlertCircle className="w-9 h-9 mx-auto mb-2 text-red-400" />
              <p className="text-sm font-semibold">Failed to fetch services</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
                Try Again
              </Button>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-1" />
              <p className="text-base font-semibold text-slate-700">No services found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                  ? "No services match your active filter criteria."
                  : "Start creating your first professional service offering."}
              </p>
              {canManageServices && !searchTerm && (
                <Button onClick={openCreateModal} size="sm" className="mt-4 gap-1.5 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4" /> Add Service Now
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="group rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col overflow-hidden"
                >
                  {/* Top Header / Logo & Titles */}
                  <div className="p-4 sm:p-5 pb-3 flex items-start gap-3.5">
                    {/* Logo / Image */}
                    <div className="w-13 h-13 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                      {service.logo ? (
                        <img
                          src={service.logo}
                          alt={service.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/100x100?text=Service";
                          }}
                        />
                      ) : (
                        <Briefcase className="w-6 h-6 text-slate-400 stroke-1" />
                      )}
                    </div>

                    {/* Service & Business Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                            service.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : service.status === "pending"
                              ? "bg-amber-50 text-amber-800 border border-amber-300"
                              : service.status === "rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1 ${
                              service.status === "active"
                                ? "bg-emerald-500"
                                : service.status === "pending"
                                ? "bg-amber-500"
                                : service.status === "rejected"
                                ? "bg-rose-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {service.status === "active"
                            ? "Active"
                            : service.status === "pending"
                            ? "Pending"
                            : service.status === "rejected"
                            ? "Rejected"
                            : "Inactive"}
                        </span>
                        {service.creatorName && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[100px]" title={`By ${service.creatorName}`}>
                            By {service.creatorName}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1 truncate group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h3>
                      {service.businessName && (
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{service.businessName}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Categories & Tags */}
                  <div className="px-5 py-2 bg-slate-50/70 border-y border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      <Tag className="w-3 h-3 text-blue-500" />
                      {service.categoryName || `Category #${service.categoryId}`}
                    </span>
                    {service.subcategoryName && (
                      <span className="inline-flex items-center gap-1 font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        <Layers className="w-3 h-3 text-indigo-500" />
                        {service.subcategoryName}
                      </span>
                    )}
                  </div>

                  {/* Contact Info & Address */}
                  <div className="p-4 sm:p-5 pt-3 space-y-2 text-xs flex-1">
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">{service.address}</span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <a
                        href={`tel:${service.phone}`}
                        className="inline-flex items-center gap-1.5 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                        <span>{service.phone}</span>
                      </a>

                      {service.whatsapp && (
                        <a
                          href={`https://wa.me/${service.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
                          title="Open WhatsApp Chat"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>

                    {/* Operating Schedule */}
                    {service.schedule && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium bg-blue-50/70 text-blue-900 border border-blue-100 px-2.5 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{service.schedule}</span>
                      </div>
                    )}

                    {/* Showcase Images Gallery Thumbnails */}
                    {service.images && service.images.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1.5">
                          Gallery ({service.images.length})
                        </span>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {service.images.slice(0, 4).map((imgUrl, i) => (
                            <div
                              key={i}
                              className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                              onClick={() => setViewingService(service)}
                            >
                              <img src={imgUrl} alt={`Showcase ${i}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {service.images.length > 4 && (
                            <div
                              className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0 cursor-pointer hover:bg-slate-200"
                              onClick={() => setViewingService(service)}
                            >
                              +{service.images.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3.5 px-5 bg-white border-t border-slate-100 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingService(service)}
                      className="gap-1.5 text-xs text-slate-600 hover:text-slate-900 h-8 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </Button>

                    {canManageServices && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(service)}
                          className="gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 h-8 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(service)}
                          className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-8 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Phone / WhatsApp</th>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4">Gallery</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {service.logo ? (
                              <img src={service.logo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Briefcase className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{service.name}</p>
                            {service.businessName && (
                              <p className="text-slate-500 text-xs">{service.businessName}</p>
                            )}
                            {service.schedule && (
                              <p className="text-blue-600 text-[11px] font-medium flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                                <span className="truncate max-w-[200px]">{service.schedule}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-100">
                            {service.categoryName || `Category #${service.categoryId}`}
                          </span>
                          {service.subcategoryName && (
                            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                              <Layers className="w-3 h-3 text-indigo-500" />
                              {service.subcategoryName}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">{service.phone}</p>
                        {service.whatsapp && (
                          <p className="text-emerald-600 text-[11px] mt-0.5 font-medium flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> {service.whatsapp}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {service.address}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          <ImageIcon className="w-3 h-3 text-slate-400" />
                          {service.images?.length || 0} photos
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            service.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : service.status === "pending"
                              ? "bg-amber-50 text-amber-800 border border-amber-300"
                              : service.status === "rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {service.status === "active"
                            ? "Active"
                            : service.status === "pending"
                            ? "Pending"
                            : service.status === "rejected"
                            ? "Rejected"
                            : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingService(service)}
                            className="h-8 px-2 text-xs"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {canManageServices && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(service)}
                                className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteModal(service)}
                                className="h-8 px-2 text-xs text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Global Pagination Controls (1 2 3 Next Prev) */}
          {!isLoading && !isError && totalServices > 0 && (
            <div className="border-t border-slate-200 px-6 py-2 bg-slate-50/50 mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
                totalItems={totalServices}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[6, 9, 12, 24, 48]}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE / EDIT SERVICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingService ? "Edit Service Listing" : "Create New Service"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select category first, configure business details, contact information, and upload photos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {uploadSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              {/* 1. Category & Subcategory Selection (FIRST) */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-4">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" /> 1. Category Selection (Required First)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Select Category <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={categoryId === "" ? undefined : String(categoryId)}
                      onValueChange={(val) => {
                        setCategoryId(val === "" ? "" : Number(val));
                        setSubcategoryId("");
                      }}
                    >
                      <SelectTrigger className="w-full text-sm h-10 bg-white">
                        <SelectValue placeholder="-- Select Category --" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subcategory Selection (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block flex items-center justify-between">
                      <span>Sub Category</span>
                      <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                    </label>
                    <Select
                      value={subcategoryId === "" ? "none" : String(subcategoryId)}
                      disabled={categoryId === "" || isLoadingSubcategories}
                      onValueChange={(val) => {
                        setSubcategoryId(val === "none" || val === "" ? "" : Number(val));
                      }}
                    >
                      <SelectTrigger className="w-full text-sm h-10 bg-white disabled:bg-slate-100">
                        <SelectValue
                          placeholder={
                            categoryId === ""
                              ? "Select a category first"
                              : isLoadingSubcategories
                              ? "Loading subcategories..."
                              : subcategories.length === 0
                              ? "No subcategories available"
                              : "-- None / Optional --"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- None / Optional --</SelectItem>
                        {subcategories.map((sub) => (
                          <SelectItem key={sub.id} value={String(sub.id)}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 2. Basic Information */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  2. Service Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Service Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Service Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. AC Deep Cleaning Service"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Business Name (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block flex items-center justify-between">
                      <span>Business Name</span>
                      <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Apex Cool Engineering Ltd."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block flex items-center justify-between">
                    <span>Description</span>
                    <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed description of what this service covers..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Status Toggle (Super Admin Only) */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-700">Listing Status:</label>
                  {!isSuperAdmin ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold ${
                          (editingService ? editingService.status : "pending") === "active"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                            : (editingService ? editingService.status : "pending") === "rejected"
                            ? "bg-rose-50 text-rose-800 border border-rose-300"
                            : "bg-amber-50 text-amber-800 border border-amber-300"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {editingService
                          ? editingService.status.charAt(0).toUpperCase() + editingService.status.slice(1)
                          : "Pending Review (Creator Default)"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        (Only Super Admin can approve or change status)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStatus("active")}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          status === "active"
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus("pending")}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          status === "pending"
                            ? "bg-amber-500 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus("inactive")}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          status === "inactive"
                            ? "bg-slate-800 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Inactive
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Contact & Address */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  3. Contact & Location
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 01812345678"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* WhatsApp Number (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block flex items-center justify-between">
                      <span>WhatsApp Number</span>
                      <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="e.g. 01812345678"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. House 42, Road 11, Banani, Dhaka"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 4. Operating Schedule (Optional) */}
              <ServiceSchedulePicker value={schedule} onChange={setSchedule} />

              {/* 5. Profile Image Upload (Single) */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    5. Profile Image
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                </div>

                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center gap-4">
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-4 text-center cursor-pointer transition-all"
                  >
                    {isUploadingLogo ? (
                      <div className="flex items-center justify-center gap-2 text-blue-600 py-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-xs font-semibold">Uploading Profile Image to server...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-slate-600 py-1">
                        <UploadCloud className="w-5 h-5 text-blue-600" />
                        <span className="text-xs font-medium">Click to upload Profile Image</span>
                      </div>
                    )}
                  </div>

                  {logo && (
                    <div className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 shadow-2xs group">
                      <img src={logo} alt="Profile Image" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setLogo("")}
                        className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove Profile Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Optional direct URL input */}
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="Or paste Profile Image URL directly (https://...)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 font-mono text-slate-600"
                />
              </div>

              {/* 6. Services Images as Multiple Upload */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    6. Services Images (Multiple Upload)
                  </span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {serviceImages.length} images selected
                  </span>
                </div>

                <input
                  type="file"
                  ref={multiImagesInputRef}
                  onChange={handleMultipleImagesUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                <div
                  onClick={() => multiImagesInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-5 text-center cursor-pointer transition-all"
                >
                  {isUploadingMultiple ? (
                    <div className="flex flex-col items-center justify-center gap-2 text-blue-600">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <p className="text-xs font-semibold">Uploading multiple images to Image Server...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        Click to select & upload multiple service images
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Select multiple PNG, JPG, or WEBP photos to showcase this service
                      </p>
                    </div>
                  )}
                </div>

                {/* Multiple Images Thumbnails Gallery */}
                {serviceImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-1">
                    {serviceImages.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100"
                      >
                        <img src={imgUrl} alt={`Showcase ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeServiceImage(index)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating || isUpdating}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating || isUploadingLogo || isUploadingMultiple}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 cursor-pointer shadow-xs"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingService ? (
                    <>
                      <Check className="w-4 h-4" /> Update Service
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Create Service
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SERVICE DETAILS MODAL */}
      {viewingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden my-8 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">Service Profile & Details</h3>
              <button
                onClick={() => setViewingService(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-sm">
              {/* Header profile info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {viewingService.logo ? (
                    <img src={viewingService.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Briefcase className="w-8 h-8 text-slate-400 stroke-1" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        viewingService.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {viewingService.status === "active" ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-100">
                      {viewingService.categoryName || `Category #${viewingService.categoryId}`}
                    </span>
                    {viewingService.subcategoryName && (
                      <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold border border-indigo-100">
                        {viewingService.subcategoryName}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{viewingService.name}</h2>
                  <p className="text-xs text-slate-500 font-medium">{viewingService.businessName}</p>
                </div>
              </div>

              {/* Description */}
              {viewingService.description && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  {viewingService.description}
                </div>
              )}

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Phone Number</span>
                  <a href={`tel:${viewingService.phone}`} className="font-semibold text-slate-900 flex items-center gap-1.5 hover:text-blue-600">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    {viewingService.phone}
                  </a>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">WhatsApp</span>
                  {viewingService.whatsapp ? (
                    <a
                      href={`https://wa.me/${viewingService.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-emerald-700 flex items-center gap-1.5 hover:text-emerald-800"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                      {viewingService.whatsapp}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Physical Address</span>
                <p className="font-medium text-slate-800 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  {viewingService.address}
                </p>
              </div>

              {/* Operating Schedule */}
              {viewingService.schedule && (
                <div className="p-3 rounded-xl border border-blue-200/80 bg-blue-50/60 text-xs">
                  <span className="text-[10px] uppercase font-bold text-blue-600 block mb-1">
                    Operating Schedule
                  </span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    {viewingService.schedule}
                  </p>
                </div>
              )}

              {/* Showcase Images Gallery */}
              {viewingService.images && viewingService.images.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Showcase Images ({viewingService.images.length})
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {viewingService.images.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100 block"
                      >
                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setViewingService(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && targetService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Service?</h3>
              <p className="text-sm text-slate-500 mt-2">
                Are you sure you want to delete <strong className="text-slate-800 font-semibold">{targetService.name}</strong>{" "}
                ({targetService.businessName})? This action cannot be undone.
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white gap-2 cursor-pointer shadow-xs"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Yes, Delete Service"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;

import React, { useState, useRef } from "react";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Search,
  Image as ImageIcon,
  Loader2,
  Check,
  X,
  AlertCircle,
  UploadCloud,
  CheckCircle2,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";
import {
  useGetSubcategoriesQuery,
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
  type Subcategory,
} from "@/redux/api/subcategoryApi";
import { useUploadImageMutation } from "@/redux/api/uploadApi";
import { Pagination } from "@/components/ui/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SubcategoriesPage: React.FC = () => {
  const { data: catResponse } = useGetCategoriesQuery();
  const categories = catResponse?.data || [];

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: subResponse,
    isLoading,
    isError,
    refetch,
  } = useGetSubcategoriesQuery({
    categoryId: selectedCategoryFilter !== "all" ? Number(selectedCategoryFilter) : undefined,
    search: searchTerm,
    page: currentPage,
    limit: pageSize,
  });

  const [createSubcategory, { isLoading: isCreating }] = useCreateSubcategoryMutation();
  const [updateSubcategory, { isLoading: isUpdating }] = useUpdateSubcategoryMutation();
  const [deleteSubcategory, { isLoading: isDeleting }] = useDeleteSubcategoryMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

  // Form State
  const [formCategoryId, setFormCategoryId] = useState<number | "">("");
  const [formName, setFormName] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [targetSubcategory, setTargetSubcategory] = useState<Subcategory | null>(null);

  const subcategories = subResponse?.data || [];
  const totalSubcategories = subResponse?.total ?? subcategories.length;
  const totalPages = subResponse?.totalPages ?? (Math.ceil(totalSubcategories / pageSize) || 1);

  const filteredSubcategories = subcategories;

  const openCreateModal = () => {
    setEditingSubcategory(null);
    setFormCategoryId(categories.length > 0 ? categories[0].id : "");
    setFormName("");
    setFormImage("");
    setFormError(null);
    setUploadSuccessMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subcategory) => {
    setEditingSubcategory(sub);
    setFormCategoryId(sub.categoryId);
    setFormName(sub.name);
    setFormImage(sub.image || "");
    setFormError(null);
    setUploadSuccessMsg(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (sub: Subcategory) => {
    setTargetSubcategory(sub);
    setDeletingId(sub.id);
    setIsDeleteModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);
    setUploadSuccessMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadImage(formData).unwrap();
      if (res.success && res.url) {
        setFormImage(res.url);
        setUploadSuccessMsg("Image uploaded successfully to image.streamespn.org!");
      } else {
        setFormError(res.message || "Failed to upload image.");
      }
    } catch (err: any) {
      setFormError(err?.data?.message || err?.message || "Error uploading image to server.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCategoryId) {
      setFormError("Please select a parent category");
      return;
    }

    if (!formName.trim()) {
      setFormError("Subcategory name is required");
      return;
    }

    setFormError(null);

    try {
      if (editingSubcategory) {
        const res = await updateSubcategory({
          id: editingSubcategory.id,
          categoryId: Number(formCategoryId),
          name: formName.trim(),
          image: formImage.trim() || undefined,
        }).unwrap();

        if (res.success) {
          setIsModalOpen(false);
        }
      } else {
        const res = await createSubcategory({
          categoryId: Number(formCategoryId),
          name: formName.trim(),
          image: formImage.trim() || undefined,
        }).unwrap();

        if (res.success) {
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      setFormError(err?.data?.message || err?.message || "Operation failed.");
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteSubcategory(deletingId).unwrap();
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      setTargetSubcategory(null);
    } catch (err: any) {
      alert(err?.data?.message || "Failed to delete subcategory");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Subcategories</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {subcategories.length} total
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Create and organize specific subcategories mapped under primary service categories.
          </p>
        </div>

        <Button onClick={openCreateModal} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="w-4 h-4" /> Add Subcategory
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
              {/* Category Dropdown Filter (Shadcn Select) */}
              <div className="w-full sm:w-60">
                <Select
                  value={selectedCategoryFilter}
                  onValueChange={(val) => {
                    setSelectedCategoryFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full text-sm h-10 border-slate-200 bg-white font-medium text-slate-700">
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

              {/* Search Field */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subcategory by name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-sm">Loading subcategories...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="text-sm font-semibold">Failed to fetch subcategories</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
                Try Again
              </Button>
            </div>
          ) : filteredSubcategories.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FolderTree className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No subcategories found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm
                  ? "No matching subcategories for your search."
                  : "Add your first subcategory under a category."}
              </p>
              {!searchTerm && (
                <Button onClick={openCreateModal} size="sm" className="mt-4 gap-1.5">
                  <Plus className="w-4 h-4" /> Add Subcategory
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-400 bg-slate-50/70">
                  <tr>
                    <th className="py-3 px-6 font-semibold">Image / Icon</th>
                    <th className="py-3 px-6 font-semibold">Subcategory Name</th>
                    <th className="py-3 px-6 font-semibold">Parent Category</th>
                    <th className="py-3 px-6 font-semibold">Created Date</th>
                    <th className="py-3 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubcategories.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="py-3 px-6">
                        {sub.image ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-1 shadow-2xs">
                            <img
                              src={sub.image}
                              alt={sub.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-6">
                        <span className="font-semibold text-slate-900">{sub.name}</span>
                        <span className="block text-xs text-slate-400 font-mono">ID: #{sub.id}</span>
                      </td>

                      {/* Parent Category Badge */}
                      <td className="py-3 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <Layers className="w-3 h-3 text-blue-500" />
                          {sub.categoryName || `Category #${sub.categoryId}`}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-6 text-slate-500 text-xs">
                        {sub.createdAt
                          ? new Date(sub.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(sub)}
                            className="h-8 px-2.5 text-xs gap-1 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal(sub)}
                            className="h-8 px-2.5 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Global Pagination Controls (1 2 3 Next Prev) */}
          {!isLoading && !isError && totalSubcategories > 0 && (
            <div className="border-t border-slate-200 px-6 py-2 bg-slate-50/50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
                totalItems={totalSubcategories}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE / EDIT SUBCATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {editingSubcategory ? "Edit Subcategory" : "Create New Subcategory"}
                </h3>
                <p className="text-xs text-slate-500">
                  Select parent category, specify subcategory name and image/icon.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {uploadSuccessMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              {/* 1. Parent Category Selector (Shadcn Select) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Select Parent Category <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formCategoryId === "" ? undefined : String(formCategoryId)}
                  onValueChange={(val) => setFormCategoryId(Number(val))}
                >
                  <SelectTrigger className="w-full text-sm h-10 border-slate-200 bg-white font-medium text-slate-800">
                    <SelectValue placeholder="-- Select a Category --" />
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

              {/* 2. Subcategory Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Subcategory Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. AC Deep Cleaning Service"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              {/* 3. Image/Icon Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Upload Subcategory Image / Icon
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30 rounded-xl p-5 text-center cursor-pointer transition-all"
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center justify-center gap-2 text-blue-600">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <p className="text-xs font-semibold">Uploading to image.streamespn.org...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        Click to upload image file
                      </p>
                      <p className="text-[11px] text-slate-400">
                        PNG, JPG, SVG, WEBP up to 10MB • Uploads to Image Server
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Or Image URL
                </label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://image.streamespn.org/uploads/..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs"
                />
              </div>

              {/* Preview Thumbnail */}
              {formImage && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 p-1 flex items-center justify-center">
                    <img
                      src={formImage}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Image Ready</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{formImage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormImage("")}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating || isUpdating || isUploadingImage}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating || isUploadingImage}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {editingSubcategory ? "Update Subcategory" : "Create Subcategory"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && targetSubcategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">Delete Subcategory</h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to delete <span className="font-semibold text-slate-800">"{targetSubcategory.name}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Yes, Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcategoriesPage;

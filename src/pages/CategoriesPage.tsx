import React, { useState, useRef } from "react";
import {
  FolderPlus,
  Pencil,
  Trash2,
  Search,
  Image as ImageIcon,
  ShieldAlert,
  Loader2,
  Check,
  X,
  AlertCircle,
  Tag,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppSelector } from "@/redux/store";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type Category,
} from "@/redux/api/categoryApi";
import { useUploadImageMutation } from "@/redux/api/uploadApi";

export const CategoriesPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isSuperAdmin = user?.role === "superadmin";

  const { data: response, isLoading, isError, refetch } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState<Category | null>(null);

  const categories = response?.data || [];

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    if (!isSuperAdmin) return;
    setEditingCategory(null);
    setName("");
    setImage("");
    setFormError(null);
    setUploadSuccessMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    if (!isSuperAdmin) return;
    setEditingCategory(category);
    setName(category.name);
    setImage(category.image || "");
    setFormError(null);
    setUploadSuccessMsg(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    if (!isSuperAdmin) return;
    setTargetCategory(category);
    setDeletingId(category.id);
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
        setImage(res.url);
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
    if (!isSuperAdmin) {
      setFormError("Only Super Admin can manage categories");
      return;
    }

    if (!name.trim()) {
      setFormError("Category name is required");
      return;
    }

    setFormError(null);

    try {
      if (editingCategory) {
        const res = await updateCategory({
          id: editingCategory.id,
          name: name.trim(),
          image: image.trim() || undefined,
        }).unwrap();

        if (res.success) {
          setIsModalOpen(false);
        }
      } else {
        const res = await createCategory({
          name: name.trim(),
          image: image.trim() || undefined,
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
    if (!isSuperAdmin || !deletingId) return;

    try {
      await deleteCategory(deletingId).unwrap();
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      setTargetCategory(null);
    } catch (err: any) {
      alert(err?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Permission Header */}
      {!isSuperAdmin && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold">Read-Only Access</p>
              <p className="text-xs text-amber-700">
                You are logged in as <span className="font-bold">{user?.role}</span>. Only <span className="font-bold">Super Admin</span> can create, edit, or delete categories.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {categories.length} total
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Configure high-level service categories displayed across Web and Mobile applications.
          </p>
        </div>

        {isSuperAdmin && (
          <Button onClick={openCreateModal} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <FolderPlus className="w-4 h-4" /> Add Category
          </Button>
        )}
      </div>

      {/* Search & Actions Bar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh List
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-sm">Loading categories from database...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="text-sm font-semibold">Failed to fetch categories</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
                Try Again
              </Button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Tag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No categories found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm ? "No matching categories found." : "Get started by creating your first category."}
              </p>
              {isSuperAdmin && !searchTerm && (
                <Button onClick={openCreateModal} size="sm" className="mt-4 gap-1.5">
                  <FolderPlus className="w-4 h-4" /> Add Category
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-400 bg-slate-50/70">
                  <tr>
                    <th className="py-3 px-6 font-semibold">Image / Icon</th>
                    <th className="py-3 px-6 font-semibold">Category Name</th>
                    <th className="py-3 px-6 font-semibold">Created Date</th>
                    <th className="py-3 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Image / Icon Cell */}
                      <td className="py-3 px-6">
                        {category.image ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover"
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

                      {/* Name Cell */}
                      <td className="py-3 px-6">
                        <span className="font-semibold text-slate-900">{category.name}</span>
                        <span className="block text-xs text-slate-400 font-mono">ID: #{category.id}</span>
                      </td>

                      {/* Created Date Cell */}
                      <td className="py-3 px-6 text-slate-500 text-xs">
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </td>

                      {/* Actions Cell */}
                      <td className="py-3 px-6 text-right">
                        {isSuperAdmin ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(category)}
                              className="h-8 px-2.5 text-xs gap-1 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(category)}
                              className="h-8 px-2.5 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No access</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingCategory
                    ? "Update category details, name, and image/icon."
                    : "Upload an image/icon or provide a URL (Super Admin only)."}
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

              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AC Repair & Maintenance"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              {/* Image / Icon File Upload Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Upload Category Image / Icon
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
                        PNG, JPG, SVG, WEBP up to 10MB • Uploads directly to Image Server
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Image URL Manual Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Or Image URL
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://image.streamespn.org/uploads/..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs"
                />
              </div>

              {/* Preview Thumbnail */}
              {image && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-full object-cover"
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
                    <p className="text-[11px] text-slate-500 font-mono truncate">{image}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Action Buttons */}
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
                      {editingCategory ? "Update Category" : "Create Category"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && targetCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">Delete Category</h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to delete <span className="font-semibold text-slate-800">"{targetCategory.name}"</span>? This action cannot be undone.
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

export default CategoriesPage;

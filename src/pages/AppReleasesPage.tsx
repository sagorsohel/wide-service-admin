import React, { useState } from "react";
import {
  Smartphone,
  Apple,
  UploadCloud,
  CheckCircle2,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  AlertCircle,
  FileCode,
  Sparkles,
  Link as LinkIcon,
  HardDrive,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useGetAllReleasesQuery,
  useSaveReleaseMutation,
  useDeleteReleaseMutation,
  useUploadAppBinaryMutation,
  type AppRelease,
} from "@/redux/api/appReleaseApi";

export const AppReleasesPage: React.FC = () => {
  const { data: releasesData, isLoading, refetch } = useGetAllReleasesQuery();
  const [saveRelease, { isLoading: isSaving }] = useSaveReleaseMutation();
  const [deleteRelease, { isLoading: isDeleting }] = useDeleteReleaseMutation();
  const [uploadAppBinary, { isLoading: isUploading }] = useUploadAppBinaryMutation();

  const releases = releasesData?.data || [];

  // Form states
  const [platform, setPlatform] = useState<"android" | "ios">("android");
  const [version, setVersion] = useState("1.0.0");
  const [buildNumber, setBuildNumber] = useState("1");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileType, setFileType] = useState("apk");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [minOsVersion, setMinOsVersion] = useState("Android 7.0+");
  const [isActive, setIsActive] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Upload feedback state
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Active Android and iOS releases
  const activeAndroid = releases.find((r) => r.platform === "android" && r.isActive === 1);
  const activeIos = releases.find((r) => r.platform === "ios" && r.isActive === 1);

  const totalDownloads = releases.reduce((sum, r) => sum + (r.downloadsCount || 0), 0);
  const androidDownloads = releases
    .filter((r) => r.platform === "android")
    .reduce((sum, r) => sum + (r.downloadsCount || 0), 0);
  const iosDownloads = releases
    .filter((r) => r.platform === "ios")
    .reduce((sum, r) => sum + (r.downloadsCount || 0), 0);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setUploadSuccessMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadAppBinary(formData).unwrap();
      if (res.success) {
        setDownloadUrl(res.downloadUrl);
        setFileSize(res.fileSize);
        setFileType(res.fileType);
        setUploadSuccessMessage(
          `ফাইল সফলভাবে আপলোড হয়েছে! (${file.name} - ${res.fileSize})`
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err?.message || "ফাইল আপলোডে সমস্যা হয়েছে");
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setUploadSuccessMessage(null);

    if (!version || !downloadUrl) {
      setErrorMessage("ভার্সন এবং ডাউনলোড লিঙ্ক দেওয়া বাধ্যতামূলক!");
      return;
    }

    try {
      await saveRelease({
        id: editingId || undefined,
        platform,
        version,
        buildNumber,
        downloadUrl,
        fileSize,
        fileType,
        releaseNotes,
        minOsVersion:
          minOsVersion || (platform === "android" ? "Android 7.0+" : "iOS 14.0+"),
        isActive,
      }).unwrap();

      setUploadSuccessMessage(
        editingId
          ? "অ্যাপ রিলিজ সফলভাবে আপডেট করা হয়েছে!"
          : "নতুন অ্যাপ রিলিজ সফলভাবে পাবলিশ করা হয়েছে!"
      );

      // Reset form
      setEditingId(null);
      setDownloadUrl("");
      setFileSize("");
      setReleaseNotes("");
      refetch();
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err?.message || "রিলিজ সেভ করতে ব্যর্থ হয়েছে");
    }
  };

  const handleEdit = (release: AppRelease) => {
    setEditingId(release.id);
    setPlatform(release.platform);
    setVersion(release.version);
    setBuildNumber(release.buildNumber || "1");
    setDownloadUrl(release.downloadUrl);
    setFileSize(release.fileSize || "");
    setFileType(release.fileType || (release.platform === "android" ? "apk" : "ipa"));
    setReleaseNotes(release.releaseNotes || "");
    setMinOsVersion(release.minOsVersion || "");
    setIsActive(release.isActive);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("আপনি কি নিশ্চিত এই রিলিজটি মুছে ফেলতে চান?")) return;
    try {
      await deleteRelease(id).unwrap();
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || "ডিলিট করতে ব্যর্থ হয়েছে");
    }
  };

  const handleCopyLink = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl pb-16 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                মোবাইল অ্যাপ রিলিজ সেন্টার (APK & iOS)
              </h2>
              <p className="text-sm text-slate-500">
                Android APK এবং iOS অ্যাপ আপলোড ও ভার্সন কন্ট্রোল করুন। ওয়েবসাইট ভিজিটররা সরাসরি /apk পেজ থেকে ডাউনলোড করতে পারবে।
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center gap-2 text-slate-700 bg-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>রিফ্রেশ</span>
          </Button>

          <a
            href="https://wideservice.widetechbd.com/apk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
          >
            <ExternalLink className="w-4 h-4" />
            <span>লাইভ /apk পেজ দেখুন</span>
          </a>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Android Active */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Active Android
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-950">
              v{activeAndroid?.version || "N/A"}
            </div>
            <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1.5">
              <span>{activeAndroid?.fileSize || "45 MB"}</span> •{" "}
              <span>{androidDownloads} বার ডাউনলোড হয়েছে</span>
            </p>
          </div>
        </div>

        {/* iOS Active */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
              Active iOS
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Apple className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-indigo-950">
              v{activeIos?.version || "N/A"}
            </div>
            <p className="text-xs text-indigo-700 mt-1 flex items-center gap-1.5">
              <span>{activeIos?.fileSize || "52 MB"}</span> •{" "}
              <span>{iosDownloads} বার ডাউনলোড হয়েছে</span>
            </p>
          </div>
        </div>

        {/* Total App Downloads */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              সর্বমোট ডাউনলোড
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-950">{totalDownloads}</div>
            <p className="text-xs text-amber-700 mt-1">সবগুলো ভার্সন মিলিয়ে</p>
          </div>
        </div>

        {/* Status */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-100 to-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              রিলিজ হিস্টোরি
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{releases.length} টি</div>
            <p className="text-xs text-slate-500 mt-1">আর্কাইভ ও একটিভ মিলিয়ে</p>
          </div>
        </div>
      </div>

      {/* Main Content: Upload & Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Configuration Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    {editingId ? "অ্যাপ রিলিজ এডিট করুন" : "নতুন অ্যাপ ফাইল আপলোড বা লিংক যুক্ত করুন"}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-1">
                    সার্ভারে সরাসরি APK/IPA ফাইল আপলোড করুন অথবা EAS বা ক্লাউড ডাউনলোড লিংক পেস্ট করুন।
                  </CardDescription>
                </div>
                {editingId && (
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setDownloadUrl("");
                      setFileSize("");
                      setReleaseNotes("");
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                  >
                    বাতিল করুন
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Alert Feedback Messages */}
              {uploadSuccessMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{uploadSuccessMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Platform Selector Tabs */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    প্ল্যাটফর্ম নির্বাচন করুন
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPlatform("android");
                        setFileType("apk");
                        setMinOsVersion("Android 7.0+");
                      }}
                      className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                        platform === "android"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-2 ring-emerald-500/20"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>Android (APK)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPlatform("ios");
                        setFileType("ipa");
                        setMinOsVersion("iOS 14.0+");
                      }}
                      className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                        platform === "ios"
                          ? "bg-indigo-50 border-indigo-500 text-indigo-800 shadow-xs ring-2 ring-indigo-500/20"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Apple className="w-4 h-4 text-indigo-600" />
                      <span>Apple iOS (IPA)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Direct File Upload Dropzone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    ফাইল আপলোড করুন (.apk, .ipa, .aab, .zip — সর্বোচ্চ 150MB)
                  </label>
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer group">
                    <input
                      type="file"
                      accept=".apk,.ipa,.aab,.zip,.plist"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        {isUploading ? (
                          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                        ) : (
                          <UploadCloud className="w-6 h-6" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        {isUploading
                          ? "ফাইল আপলোড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন"
                          : "কম্পিউটার থেকে ফাইল সিলেক্ট করুন বা ড্র্যাগ করে ছাড়ুন"}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        Android এর জন্য .apk ফাইল এবং iOS এর জন্য .ipa ফাইল নির্বাচন করুন
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Direct Download Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                      ডাউনলোড URL (সরাসরি লিঙ্ক)
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">
                      *ফাইল আপলোড করলে অটো পূরণ হবে অথবা EAS/Drive লিংক পেস্ট করুন
                    </span>
                  </label>
                  <input
                    type="url"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="https://..."
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* 4. Version, Build Number & File Size */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      ভার্সন (Version)
                    </label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="1.0.0"
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      বিল্ড নম্বর (Build)
                    </label>
                    <input
                      type="text"
                      value={buildNumber}
                      onChange={(e) => setBuildNumber(e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      ফাইল সাইজ (Size)
                    </label>
                    <input
                      type="text"
                      value={fileSize}
                      onChange={(e) => setFileSize(e.target.value)}
                      placeholder="e.g. 45.2 MB"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 5. Minimum OS Version */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    সাপোর্টেড অপারেটিং সিস্টেম (Min OS)
                  </label>
                  <input
                    type="text"
                    value={minOsVersion}
                    onChange={(e) => setMinOsVersion(e.target.value)}
                    placeholder={platform === "android" ? "Android 7.0+" : "iOS 14.0+"}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* 6. Release Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    রিলিজ নোটস / নতুন কী কী যুক্ত হয়েছে (Release Notes)
                  </label>
                  <textarea
                    rows={3}
                    value={releaseNotes}
                    onChange={(e) => setReleaseNotes(e.target.value)}
                    placeholder="যেমন: নতুন আল্ট্রা-স্মুথ সিনেমা কার্টেন এনিমেশন, ফাস্ট সার্চ এবং নোটিফিকেশন সিস্টেম আপডেট..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* 7. Active Status Toggle */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive === 1}
                    onChange={(e) => setIsActive(e.target.checked ? 1 : 0)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    এই ভার্সনটিকে ওয়েবসাইটে <strong>অফিশিয়াল একটিভ রিলিজ</strong> হিসেবে লাইভ করুন
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs"
                  >
                    {isSaving
                      ? "সংরক্ষণ হচ্ছে..."
                      : editingId
                      ? "রিলিজ আপডেট করুন"
                      : "অ্যাপ রিলিজ পাবলিশ করুন"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Web Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-200 shadow-sm bg-gradient-to-b from-[#080e1e] to-[#0c162d] text-white">
            <CardHeader className="pb-3 border-b border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#e0b328]">
                লাইভ প্রিভিউ (ওয়েবসাইটে যেমন দেখাবে)
              </span>
              <CardTitle className="text-base text-white">
                Wide Service {platform === "android" ? "Android APK" : "iOS App"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#e0b328] flex items-center justify-center text-slate-900 font-black text-xl shadow-lg">
                      W
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Wide Service Mobile</h4>
                      <span className="text-[11px] text-slate-400">
                        {platform === "android" ? "Android 7.0+ (ARM64 & x86)" : "iOS 14.0+ (Universal)"}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#e0b328]/20 text-[#e0b328] border border-[#e0b328]/40">
                    v{version || "1.0.0"}
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                  {releaseNotes ||
                    "জরুরি মেরামত, এসি সার্ভিস, মেকানিক এবং ড্রাইভারসহ ১০০+ সার্ভিস পেতে অ্যাপটি ডাউনলোড করুন।"}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>সাইজ: {fileSize || "45 MB"}</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ১০০% সুরক্ষিত ও ভাইরাস মুক্ত
                  </span>
                </div>

                <div className="pt-2">
                  <div className="w-full py-3 rounded-xl bg-[#e0b328] text-slate-950 font-black text-center flex items-center justify-center gap-2 shadow-lg">
                    <Download className="w-4 h-4" />
                    <span>
                      {platform === "android" ? "Download Wide Service APK" : "Download iOS App"}
                    </span>
                  </div>
                </div>
              </div>

              {/* EAS Build Helper Notice */}
              <div className="p-4 rounded-xl bg-blue-900/30 border border-blue-500/30 text-xs text-blue-200 space-y-2">
                <span className="font-bold text-blue-300 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  EAS Build ইন্টিগ্রেশন
                </span>
                <p className="text-[11px] leading-relaxed text-blue-200/90">
                  আপনি যখন টার্মিনালে <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300">eas build -p android --profile preview</code> চালান, তখন যে সরাসরি .apk ডাউনলোড লিংকটি পাওয়া যায়, তা কপি করে এখানে পেস্ট করতে পারেন অথবা তৈরি হওয়া APK ফাইলটি ডাউনলোড করে এখানে আপলোড করতে পারেন।
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Release History Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                সকল রিলিজ ও ডাউনলোড হিস্টোরি
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                পূর্বে পাবলিশ করা সকল ভার্সন এবং তাদের ডাউনলোড সংখ্যা।
              </CardDescription>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              মোট রিলিজ: {releases.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">প্ল্যাটফর্ম</th>
                  <th className="px-5 py-3.5">ভার্সন</th>
                  <th className="px-5 py-3.5">সাইজ & টাইপ</th>
                  <th className="px-5 py-3.5">ডাউনলোড সংখ্যা</th>
                  <th className="px-5 py-3.5">স্ট্যাটাস</th>
                  <th className="px-5 py-3.5">তারিখ</th>
                  <th className="px-5 py-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {releases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                      এখনও কোনো রিলিজ যুক্ত করা হয়নি।
                    </td>
                  </tr>
                ) : (
                  releases.map((rel) => (
                    <tr key={rel.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {rel.platform === "android" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Smartphone className="w-3.5 h-3.5" /> Android
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Apple className="w-3.5 h-3.5" /> iOS
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        v{rel.version}
                        {rel.buildNumber && (
                          <span className="text-[10px] text-slate-400 font-normal ml-1">
                            ({rel.buildNumber})
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <span>{rel.fileSize || "45 MB"}</span>
                        <span className="text-[10px] text-slate-400 uppercase ml-1">
                          ({rel.fileType})
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900">
                          {rel.downloadsCount || 0}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1">বার</span>
                      </td>

                      <td className="px-5 py-4">
                        {rel.isActive === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> একটিভ (Live)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                            আর্কাইভ
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {new Date(rel.createdAt).toLocaleDateString("bn-BD")}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopyLink(rel.downloadUrl, rel.id)}
                            title="লিঙ্ক কপি করুন"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                          >
                            {copiedId === rel.id ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <a
                            href={rel.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            title="সরাসরি ডাউনলোড করুন"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => handleEdit(rel)}
                            title="এডিট করুন"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                          >
                            <FileCode className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(rel.id)}
                            disabled={isDeleting}
                            title="মুছে ফেলুন"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppReleasesPage;

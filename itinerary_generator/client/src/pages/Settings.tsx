import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, RotateCcw, Settings as SettingsIcon, LogOut, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const DEFAULT_LOGO = "https://pikme.in/cdn/logo-banner/pikme-logo-600.png";

export default function Settings() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState("");

  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();

  const updateLogoMutation = trpc.settings.updateLogo.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Logo updated successfully!");
    },
    onError: (e) => toast.error("Failed to update logo: " + e.message),
  });

  const resetLogoMutation = trpc.settings.resetLogo.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      setLogoUrlInput("");
      toast.success("Logo reset to default");
    },
    onError: (e) => toast.error("Failed to reset logo: " + e.message),
  });

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      await updateLogoMutation.mutateAsync({ logoUrl: url });
    } catch (e: any) {
      toast.error("Upload failed: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!logoUrlInput.trim()) return;
    try {
      new URL(logoUrlInput); // validate URL
      await updateLogoMutation.mutateAsync({ logoUrl: logoUrlInput.trim() });
      setLogoUrlInput("");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const currentLogo = settings?.logoUrl ?? DEFAULT_LOGO;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-20">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center">
            {isLoading ? (
              <div className="h-10 w-32 bg-gray-700 rounded animate-pulse" />
            ) : (
              <img src={currentLogo} alt="Logo" className="h-10 object-contain brightness-0 invert" />
            )}
          </div>
          <p className="text-gray-400 text-xs mt-1">Itinerary Generator</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm font-medium w-full text-left"
          >
            <FileText className="w-4 h-4" />
            Itineraries
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium">
            <SettingsIcon className="w-4 h-4" />
            Settings
          </div>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full text-gray-400 hover:text-white hover:bg-gray-700 justify-start gap-2" onClick={logout}>
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your application settings</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Logo</CardTitle>
              <CardDescription>
                Upload a custom logo that will appear in the sidebar, login page, and PDF/preview headers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current logo preview */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Current Logo</Label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center gap-4">
                  {isLoading ? (
                    <div className="h-14 w-40 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <img src={currentLogo} alt="Current logo" className="h-14 object-contain max-w-[200px]" />
                  )}
                  <div className="text-xs text-gray-400 break-all">{currentLogo}</div>
                </div>
              </div>

              {/* Upload file */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Upload New Logo</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full border-dashed border-2 h-20 flex-col gap-2 text-gray-500 hover:text-gray-700 hover:border-gray-400"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || updateLogoMutation.isPending}
                >
                  {uploading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="w-5 h-5" /> Click to upload an image file</>
                  )}
                </Button>
                <p className="text-xs text-gray-400 mt-1">Recommended: PNG or SVG with transparent background, min 300px wide</p>
              </div>

              {/* Or paste URL */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Or Paste Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                  />
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                    onClick={handleUrlSubmit}
                    disabled={!logoUrlInput.trim() || updateLogoMutation.isPending}
                  >
                    {updateLogoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              </div>

              {/* Reset to default */}
              <div className="pt-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  className="gap-2 text-gray-600"
                  onClick={() => resetLogoMutation.mutate()}
                  disabled={resetLogoMutation.isPending || currentLogo === DEFAULT_LOGO}
                >
                  {resetLogoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  Reset to Default Pikme Logo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

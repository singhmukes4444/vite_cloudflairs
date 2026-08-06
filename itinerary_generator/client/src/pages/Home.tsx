import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, FileText, Pencil, Trash2, Eye, Download, LogOut, Link2, Check, Hotel, Copy } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);

  function handleShareLink(id: number) {
    const url = `${window.location.origin}/itinerary/${id}/preview`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      toast.success("Preview link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  }

  const { data: itineraries, isLoading, refetch } = trpc.itinerary.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteMutation = trpc.itinerary.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Itinerary deleted"); setDeletingId(null); },
    onError: (e) => { toast.error(e.message); setDeletingId(null); },
  });

  const generateMutation = trpc.itinerary.generatePDF.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      setGeneratingId(null);
      toast.success("PDF generated! Opening download...");
    },
    onError: (e) => { toast.error("PDF generation failed: " + e.message); setGeneratingId(null); },
  });

  const duplicateMutation = trpc.itinerary.duplicate.useMutation({
    onSuccess: (data) => {
      refetch();
      setDuplicatingId(null);
      toast.success(`Itinerary duplicated as "${data?.title}"`);
    },
    onError: (e) => { toast.error("Failed to duplicate: " + e.message); setDuplicatingId(null); },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white rounded-xl px-4 py-2 inline-block">
              <img src="https://pikme.in/cdn/logo-banner/pikme-logo-600.png" alt="Pikme" className="h-12 object-contain" />
            </div>
          </div>
          <p className="text-gray-300 text-lg">Itinerary Generator</p>
          <p className="text-gray-400 text-sm">Sign in to manage and generate PDF itineraries</p>
          <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8" onClick={() => window.location.href = getLoginUrl()}>
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-gray-900 text-white flex-col fixed inset-y-0 left-0 z-20">
        <div className="px-4 py-5 border-b border-gray-700">
          <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-center">
            <img src="https://pikme.in/cdn/logo-banner/pikme-logo-600.png" alt="Pikme" className="h-16 w-full object-contain" />
          </div>
          <p className="text-gray-400 text-xs mt-2 text-center">Itinerary Generator</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium">
            <FileText className="w-4 h-4" />
            Itineraries
          </div>
          <button
            onClick={() => navigate("/vouchers")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 text-sm font-medium w-full text-left transition-colors">
            <Hotel className="w-4 h-4" />
            Hotel Vouchers
          </button>
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
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Itineraries</h1>
              <p className="text-gray-500 text-xs md:text-sm mt-1">Create and manage travel itineraries for your guests</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 w-full sm:w-auto" onClick={() => navigate("/itinerary/new")}>
              <Plus className="w-4 h-4" /> New Itinerary
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : !itineraries?.length ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No itineraries yet</h3>
              <p className="text-gray-400 mb-6 text-sm">Create your first itinerary to get started</p>
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-2" onClick={() => navigate("/itinerary/new")}>
                <Plus className="w-4 h-4" /> Create First Itinerary
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 md:gap-4">
              {itineraries.map((itin) => (
                <Card key={itin.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-3 md:p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-base md:text-lg truncate">{itin.title}</h3>
                          <Badge variant={itin.status === "published" ? "default" : "secondary"}
                            className={itin.status === "published" ? "bg-green-100 text-green-700 border-green-200 w-fit" : "bg-gray-100 text-gray-600 w-fit"}>
                            {itin.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                          {itin.destination && <span className="truncate">📍 {itin.destination}</span>}
                          {itin.startDate && <span className="truncate">📅 {itin.startDate} – {itin.endDate}</span>}
                          <span className="whitespace-nowrap">🌙 {itin.numNights}N / {itin.numDays}D</span>
                          <span className="whitespace-nowrap">👥 {itin.numGuests} guest{itin.numGuests > 1 ? "s" : ""}</span>
                        </div>
                        {itin.guestNames && (
                          <p className="text-xs md:text-sm text-gray-400 mt-1 truncate">
                            {itin.guestNames.split("\n").filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 md:gap-2 md:flex-shrink-0 md:ml-4">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs md:text-sm text-gray-600 hover:text-blue-600 px-2 md:px-3"
                          onClick={() => navigate(`/itinerary/${itin.id}/preview`)}>
                          <Eye className="w-3 md:w-4 h-3 md:h-4" />
                          <span className="hidden sm:inline">Preview</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs md:text-sm text-gray-600 hover:text-gray-900 px-2 md:px-3"
                          onClick={() => navigate(`/itinerary/${itin.id}/edit`)}>
                          <Pencil className="w-3 md:w-4 h-3 md:h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs md:text-sm text-gray-600 hover:text-purple-600 px-2 md:px-3"
                          disabled={duplicatingId === itin.id}
                          onClick={() => {
                            setDuplicatingId(itin.id);
                            duplicateMutation.mutate({ id: itin.id });
                          }}>
                          {duplicatingId === itin.id ? <Loader2 className="w-3 md:w-4 h-3 md:h-4 animate-spin" /> : <Copy className="w-3 md:w-4 h-3 md:h-4" />}
                          <span className="hidden sm:inline">Duplicate</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs md:text-sm text-gray-600 hover:text-green-600 px-2 md:px-3"
                          onClick={() => handleShareLink(itin.id)}>
                          {copiedId === itin.id ? <Check className="w-3 md:w-4 h-3 md:h-4 text-green-600" /> : <Link2 className="w-3 md:w-4 h-3 md:h-4" />}
                          <span className="hidden sm:inline">{copiedId === itin.id ? "Copied!" : "Share"}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs md:text-sm text-gray-600 hover:text-red-600 px-2 md:px-3"
                          disabled={generatingId === itin.id}
                          onClick={() => { setGeneratingId(itin.id); generateMutation.mutate({ id: itin.id }); }}>
                          {generatingId === itin.id ? <Loader2 className="w-3 md:w-4 h-3 md:h-4 animate-spin" /> : <Download className="w-3 md:w-4 h-3 md:h-4" />}
                          <span className="hidden sm:inline">PDF</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs md:text-sm text-red-400 hover:text-red-600 hover:bg-red-50 px-2 md:px-3"
                          disabled={deletingId === itin.id}
                          onClick={() => {
                            if (confirm("Delete this itinerary?")) {
                              setDeletingId(itin.id);
                              deleteMutation.mutate({ id: itin.id });
                            }
                          }}>
                          {deletingId === itin.id ? <Loader2 className="w-3 md:w-4 h-3 md:h-4 animate-spin" /> : <Trash2 className="w-3 md:w-4 h-3 md:h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

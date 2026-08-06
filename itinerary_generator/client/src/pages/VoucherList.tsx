import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Hotel, Pencil, Trash2, Eye, Download, LogOut, FileText, Share2, Copy } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function VoucherList() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);

  const { data: vouchers, isLoading, refetch } = trpc.voucher.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteMutation = trpc.voucher.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Voucher deleted"); setDeletingId(null); },
    onError: (e) => { toast.error(e.message); setDeletingId(null); },
  });

  const generatePDFMutation = trpc.voucher.generatePDF.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      setGeneratingId(null);
      toast.success("PDF generated! Opening download...");
    },
    onError: (e) => { toast.error("PDF generation failed: " + e.message); setGeneratingId(null); },
  });

  const duplicateMutation = trpc.voucher.duplicate.useMutation({
    onSuccess: () => {
      refetch();
      setDuplicatingId(null);
      toast.success("Voucher duplicated successfully!");
    },
    onError: (e) => {
      toast.error("Failed to duplicate: " + e.message);
      setDuplicatingId(null);
    },
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
          <p className="text-gray-300 text-lg">Hotel Confirmation Voucher</p>
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
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-20">
        <div className="px-4 py-5 border-b border-gray-700">
          <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-center">
            <img src="https://pikme.in/cdn/logo-banner/pikme-logo-600.png" alt="Pikme" className="h-16 w-full object-contain" />
          </div>
          <p className="text-gray-400 text-xs mt-2 text-center">Itinerary Generator</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 text-sm font-medium w-full text-left transition-colors">
            <FileText className="w-4 h-4" />
            Itineraries
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium">
            <Hotel className="w-4 h-4" />
            Hotel Vouchers
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hotel Confirmation Vouchers</h1>
              <p className="text-gray-500 text-sm mt-1">Create and manage hotel booking confirmation vouchers</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2" onClick={() => navigate("/voucher/new")}>
              <Plus className="w-4 h-4" /> New Voucher
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : !vouchers?.length ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <Hotel className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No vouchers yet</h3>
              <p className="text-gray-400 mb-6 text-sm">Create your first hotel confirmation voucher</p>
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-2" onClick={() => navigate("/voucher/new")}>
                <Plus className="w-4 h-4" /> Create First Voucher
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {vouchers.map((v) => (
                <Card key={v.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900 text-lg truncate">{v.hotelName || "Untitled Hotel"}</h3>
                          <Badge className={v.status === "confirmed" ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600"}>
                            {v.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                          {v.guestName && <span>👤 {v.guestName}</span>}
                          {v.checkInDate && <span>📅 {v.checkInDate} → {v.checkOutDate}</span>}
                          {v.numNights > 0 && <span>🌙 {v.numNights} Night{v.numNights > 1 ? "s" : ""}</span>}
                          {v.roomType && <span>🛏 {v.roomType}</span>}
                          {v.bookingRef && <span>🔖 Ref: {v.bookingRef}</span>}
                        </div>
                        {v.hotelConfirmationNo && (
                          <p className="text-sm text-gray-400 mt-1">Confirmation No: {v.hotelConfirmationNo}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-blue-600"
                          onClick={() => navigate(`/voucher/${v.id}/preview`)}>
                          <Eye className="w-4 h-4" /> Preview
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-green-600"
                          onClick={() => {
                            const url = `${window.location.origin}/voucher/${v.id}/preview`;
                            navigator.clipboard.writeText(url)
                              .then(() => toast.success("Link copied!"))
                              .catch(() => toast.error("Failed to copy link"));
                          }}>
                          <Share2 className="w-4 h-4" /> Share
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-gray-900"
                          onClick={() => navigate(`/voucher/${v.id}/edit`)}>
                          <Pencil className="w-4 h-4" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-purple-600"
                          disabled={duplicatingId === v.id}
                          onClick={() => { setDuplicatingId(v.id); duplicateMutation.mutate({ id: v.id }); }}>
                          {duplicatingId === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                          Duplicate
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-red-600"
                          disabled={generatingId === v.id}
                          onClick={() => { setGeneratingId(v.id); generatePDFMutation.mutate({ id: v.id }); }}>
                          {generatingId === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          PDF
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          disabled={deletingId === v.id}
                          onClick={() => {
                            if (confirm("Delete this voucher?")) {
                              setDeletingId(v.id);
                              deleteMutation.mutate({ id: v.id });
                            }
                          }}>
                          {deletingId === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

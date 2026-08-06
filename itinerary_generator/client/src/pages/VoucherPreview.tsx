import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Pencil, Download, Printer, Share2 } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

type GuestEntry = { name: string; category: string };

function StarRating({ count }: { count: number }) {
  return (
    <span className="text-yellow-500 text-base leading-none">
      {"★".repeat(Math.max(0, count))}
      <span className="text-gray-300">{"★".repeat(Math.max(0, 5 - count))}</span>
    </span>
  );
}

export default function VoucherPreview() {
  const { isAuthenticated } = useAuth();
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const voucherId = parseInt(params.id);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const { data: voucher, isLoading } = useQuery({
    queryKey: ["voucher", voucherId],
    queryFn: async () => {
      const res = await fetch(`/api/public/voucher/${voucherId}`);
      if (!res.ok) throw new Error("Failed to load voucher");
      return res.json();
    },
    enabled: !!voucherId && !isNaN(voucherId),
  });
  const { data: settings } = trpc.settings.get.useQuery();

  const generatePDFMutation = trpc.voucher.generatePDF.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      setGeneratingPDF(false);
      toast.success("PDF generated!");
    },
    onError: (e) => { toast.error("PDF failed: " + e.message); setGeneratingPDF(false); },
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-red-600" /></div>;
  }

  if (!voucher) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Voucher not found</div>;
  }

  const logoUrl = settings?.logoUrl ?? "https://pikme.in/cdn/logo-banner/pikme-logo-600.png";
  const guestList = (voucher.guestList as GuestEntry[]) ?? [];
  const inclusions = (voucher.inclusions as string[]) ?? [];
  const earlyCheckIn = !!(voucher as any).earlyCheckIn;
  const lateCheckOut = !!(voucher as any).lateCheckOut;

  // Only show occupancy rows that have a non-zero value
  const occupancyRows = [
    { label: "Double Sharing", value: voucher.doubleSharing },
    { label: "Triple Sharing", value: voucher.tripleSharing },
    { label: "Child (No Bed)", value: voucher.childNoBed },
    { label: "Child (With Bed)", value: voucher.childWithBed },
    { label: "Extra Bed", value: voucher.extraBed },
  ].filter(r => r.value > 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action bar */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/vouchers")} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <span className="text-sm text-gray-500 font-medium">Hotel Confirmation Voucher</span>
          </div>
          <div className="flex gap-2">
            {isAuthenticated && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/voucher/${voucherId}/edit`)} className="gap-1.5">
                <Pencil className="w-4 h-4" /> Edit
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => {
              const url = `${window.location.origin}/voucher/${voucherId}/preview`;
              navigator.clipboard.writeText(url)
                .then(() => toast.success("Link copied to clipboard!"))
                .catch(() => toast.error("Failed to copy link"));
            }} className="gap-1.5">
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
              <Printer className="w-4 h-4" /> Print
            </Button>
            {isAuthenticated && (
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
                disabled={generatingPDF}
                onClick={() => { setGeneratingPDF(true); generatePDFMutation.mutate({ id: voucherId }); }}>
                {generatingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* A4 Voucher */}
      <div className="max-w-4xl mx-auto py-8 px-4 print:p-0 print:max-w-none">
        <div
          id="voucher-content"
          className="bg-white shadow-xl print:shadow-none"
          style={{ minHeight: "297mm", fontFamily: "'Georgia', serif" }}
        >
          {/* ── HEADER ── */}
          <div className="bg-gray-900 px-10 py-6 flex items-center justify-between">
            <img src={logoUrl} alt="Pikme" className="h-14 object-contain bg-white rounded-lg px-3 py-1.5" />
            <div className="text-right">
              <h1 className="text-xl font-bold tracking-widest text-white uppercase">Hotel Confirmation Voucher</h1>
              {voucher.bookingRef && (
                <p className="text-gray-300 text-sm mt-1">Voucher No: <span className="text-white font-semibold">{voucher.bookingRef}</span></p>
              )}
              {voucher.bookingDate && (
                <p className="text-gray-400 text-xs mt-0.5">Date: {voucher.bookingDate}</p>
              )}
            </div>
          </div>
          {/* Red accent bar */}
          <div className="h-1 bg-red-600" />

          {/* ── HOTEL IMAGE (full-width banner) ── */}
          {voucher.hotelImageUrl && (
            <div className="w-full h-52 overflow-hidden">
              <img
                src={voucher.hotelImageUrl}
                alt={voucher.hotelName}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

          <div className="px-10 py-8 space-y-7">
            {/* Status badge */}
            <div className="flex justify-end -mt-2">
              <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                voucher.status === "confirmed"
                  ? "bg-green-50 text-green-700 border-green-300"
                  : "bg-amber-50 text-amber-700 border-amber-300"
              }`}>
                {voucher.status}
              </span>
            </div>

            {/* ── GUEST & HOTEL INFO ── */}
            <div className="grid grid-cols-2 gap-8 border rounded-xl overflow-hidden">
              {/* Guest */}
              <div className="p-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-3 pb-2 border-b border-red-100">Guest Information</h2>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="text-gray-400 py-1 pr-3 font-medium w-32 text-xs uppercase tracking-wide">Lead Guest</td>
                      <td className="font-bold text-gray-900">{voucher.guestName || "—"}</td>
                    </tr>
                    <tr>
                      <td className="text-gray-400 py-1 pr-3 font-medium text-xs uppercase tracking-wide">Total Guests</td>
                      <td className="text-gray-800 font-semibold">{voucher.numGuests}</td>
                    </tr>
                    {guestList.length > 0 && (
                      <tr>
                        <td className="text-gray-400 py-1 pr-3 font-medium text-xs uppercase tracking-wide align-top">Guest List</td>
                        <td>
                          {guestList.map((g, i) => (
                            <div key={i} className="text-gray-800 text-sm">
                              {g.name} <span className="text-gray-400 text-xs">({g.category})</span>
                            </div>
                          ))}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Hotel */}
              <div className="p-5 bg-gray-50 border-l">
                <h2 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-3 pb-2 border-b border-red-100">Hotel Details</h2>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="text-gray-400 py-1 pr-3 font-medium w-28 text-xs uppercase tracking-wide">Hotel</td>
                      <td className="font-bold text-gray-900">{voucher.hotelName}</td>
                    </tr>
                    <tr>
                      <td className="text-gray-400 py-1 pr-3 font-medium text-xs uppercase tracking-wide">Rating</td>
                      <td><StarRating count={voucher.starRating} /></td>
                    </tr>
                    {voucher.hotelAddress && (
                      <tr>
                        <td className="text-gray-400 py-1 pr-3 font-medium text-xs uppercase tracking-wide align-top">Address</td>
                        <td className="text-gray-700">{voucher.hotelAddress}</td>
                      </tr>
                    )}
                    {voucher.hotelPhone && (
                      <tr>
                        <td className="text-gray-400 py-1 pr-3 font-medium text-xs uppercase tracking-wide">Phone</td>
                        <td className="text-gray-700">{voucher.hotelPhone}</td>
                      </tr>
                    )}
                    {voucher.hotelEmail && (
                      <tr>
                        <td className="text-gray-400 py-1 pr-3 font-medium text-xs uppercase tracking-wide">Email</td>
                        <td className="text-gray-700">{voucher.hotelEmail}</td>
                      </tr>
                    )}
                    {voucher.hotelConfirmationNo && (
                      <tr>
                        <td className="text-gray-400 py-1 pr-3 font-medium text-xs uppercase tracking-wide">Conf. No</td>
                        <td className="font-bold text-gray-900">{voucher.hotelConfirmationNo}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── STAY DETAILS ── */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-3 pb-2 border-b border-red-100">Stay Details</h2>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-red-600 text-white rounded-xl p-4 text-center">
                  <p className="text-xs uppercase tracking-wide opacity-80 mb-1">Check-In</p>
                  <p className="font-bold text-sm">{voucher.checkInDate || "—"}</p>
                  <p className="text-xs opacity-75 mt-0.5">{voucher.checkInTime}</p>
                </div>
                <div className="bg-gray-800 text-white rounded-xl p-4 text-center">
                  <p className="text-xs uppercase tracking-wide opacity-80 mb-1">Check-Out</p>
                  <p className="font-bold text-sm">{voucher.checkOutDate || "—"}</p>
                  <p className="text-xs opacity-75 mt-0.5">{voucher.checkOutTime}</p>
                </div>
                <div className="bg-gray-50 border rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Duration</p>
                  <p className="font-bold text-gray-900 text-sm">{voucher.numNights} Night{voucher.numNights !== 1 ? "s" : ""}</p>
                </div>
                <div className="bg-gray-50 border rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Rooms</p>
                  <p className="font-bold text-gray-900 text-sm">{voucher.numRooms} Room{voucher.numRooms !== 1 ? "s" : ""}</p>
                </div>
              </div>
              {/* Early Check-In / Late Check-Out badges */}
              {(earlyCheckIn || lateCheckOut) && (
                <div className="flex gap-3 mt-3">
                  {earlyCheckIn && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold">
                      ⏰ Early Check-In <span className="font-normal text-amber-600">(If Available)</span>
                    </span>
                  )}
                  {lateCheckOut && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-300 text-blue-800 text-xs font-semibold">
                      🕐 Late Check-Out <span className="font-normal text-blue-600">(If Available)</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ── ROOM & OCCUPANCY ── */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-3 pb-2 border-b border-red-100">Room & Occupancy</h2>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b bg-gray-50">
                      <td className="px-5 py-3 text-gray-400 text-xs uppercase tracking-wide font-medium w-40">Room Type</td>
                      <td className="px-5 py-3 font-bold text-gray-900">{voucher.roomType || "—"}</td>
                    </tr>
                    {occupancyRows.map((row, i) => (
                      <tr key={i} className={i < occupancyRows.length - 1 ? "border-b" : ""}>
                        <td className="px-5 py-2.5 text-gray-400 text-xs uppercase tracking-wide font-medium">{row.label}</td>
                        <td className="px-5 py-2.5 text-gray-800 font-semibold">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── MEAL PLAN & AGENT ── */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-3 pb-2 border-b border-red-100">Meal Plan & Food</h2>
                <div className="flex gap-3">
                  {voucher.mealPlan && (
                    <span className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-bold text-red-700">{voucher.mealPlan}</span>
                  )}
                  {voucher.foodPreference && (
                    <span className="px-4 py-2 bg-gray-50 border rounded-lg text-sm font-medium text-gray-700">{voucher.foodPreference}</span>
                  )}
                </div>
              </div>
              {(voucher.agentName || voucher.agentPhone) && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-3 pb-2 border-b border-red-100">Agent / Consultant</h2>
                  <table className="w-full text-sm">
                    <tbody>
                      {voucher.agentName && (
                        <tr>
                          <td className="text-gray-400 py-1 pr-3 text-xs uppercase tracking-wide w-24">Name</td>
                          <td className="font-semibold text-gray-900">{voucher.agentName}</td>
                        </tr>
                      )}
                      {voucher.agentPhone && (
                        <tr>
                          <td className="text-gray-400 py-1 pr-3 text-xs uppercase tracking-wide">Phone</td>
                          <td className="text-gray-700">{voucher.agentPhone}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── INCLUSIONS ── */}
            {inclusions.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-3 pb-2 border-b border-red-100">Inclusions</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                  {inclusions.map((inc, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-red-500 mt-0.5 font-bold">✓</span>
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SPECIAL REQUESTS ── */}
            {voucher.specialRequests && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">Special Requests / Notes</h2>
                <p className="text-sm text-gray-700 whitespace-pre-line">{voucher.specialRequests}</p>
              </div>
            )}
          </div>

          {/* ── FOOTER ── */}
          <div className="bg-gray-900 text-white px-10 py-5 mt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">This is a computer-generated confirmation voucher.</p>
              <p className="text-xs text-gray-400 mt-0.5">Please present this voucher at the time of check-in.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-300 font-semibold">Powered by Pikme.org</p>
              <a href="https://www.pikme.org" className="text-xs text-gray-400 hover:text-gray-200">www.pikme.org</a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
          #voucher-content { box-shadow: none; }
        }
      `}</style>
    </div>
  );
}

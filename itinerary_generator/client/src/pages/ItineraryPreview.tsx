import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, Pencil, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { TransportationCard } from "@/components/TransportationCard";
import { useQuery } from "@tanstack/react-query";

function stars(n: number) {
  return "★".repeat(Math.min(5, Math.max(1, n)));
}

const FOOD_TYPE_LABELS: Record<string, string> = {
  self_paid: "Self Paid",
  complimentary: "Complimentary",
  candle_ld: "Candle L D",
  birthday: "Birthday",
  anniversary: "Anniversary",
  no: "No",
  coupon: "Coupon",
  fixed: "Fixed Menu",
  unlimited: "Unlimited",
  buffet: "Buffet",
  food_with_drink: "Food with Drink",
  drink_only: "Drink Only",
  take_away: "Take Away",
  packed_food: "Packed Food",
  gala_dinner: "Gala Dinner",
  event: "Event",
  others: "Others",
};

function mealPlanLabel(code: string) {
  if (code === "CP") return "CP — Breakfast Only";
  if (code === "MAPI") return "MAPI — Breakfast & Dinner";
  if (code === "AP") return "AP — All Meal Plan";
  if (code === "EP") return "EP — Room Only (No Food)";
  return code;
}

function PikmeFooter({ pageNum, totalPages }: { pageNum?: number; totalPages?: number }) {
  return (
    <div className="bg-gray-900 text-white text-center py-3 text-xs">
      <div>#740, 60th Cross, 5th Block, Bashyam Circle, Rajajinagar, Bangalore - 560010</div>
      <div className="text-gray-400 text-xs flex items-center justify-center gap-3">
        <span>www.pikme.org | tours@pikme.org | Ph: 8088379983</span>
        {pageNum != null && totalPages != null && (
          <span className="ml-4 text-white font-semibold">Page {pageNum} / {totalPages}</span>
        )}
      </div>
    </div>
  );
}

function InnerPageHeader({ logoUrl }: { logoUrl?: string }) {
  const src = logoUrl ?? "https://pikme.in/cdn/logo-banner/pikme-logo-600.png";
  return (
    <div className="flex items-center px-6 pt-5 pb-2">
      <img src={src} alt="Company Logo" style={{ height: 40, objectFit: "contain", maxWidth: 180 }} />
    </div>
  );
}

export default function ItineraryPreview() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const id = parseInt(params.id);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingDOCX, setGeneratingDOCX] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["itinerary", id],
    queryFn: async () => {
      const res = await fetch(`/api/public/itinerary/${id}`);
      if (!res.ok) throw new Error("Failed to load itinerary");
      return res.json();
    },
    enabled: !!id && !isNaN(id),
  });
  const { data: settingsData } = trpc.settings.get.useQuery();

  const generateDOCXMutation = trpc.itinerary.generateDOCX.useMutation({
    onSuccess: (res) => {
      window.open(res.url, "_blank");
      setGeneratingDOCX(false);
      toast.success("Word file ready! Opening download...");
    },
    onError: (e) => {
      toast.error("Word export failed: " + e.message);
      setGeneratingDOCX(false);
    },
  });
  const generateMutation = trpc.itinerary.generatePDF.useMutation({
    onSuccess: (res) => {
      window.open(res.url, "_blank");
      setGeneratingPDF(false);
      toast.success("PDF ready! Opening download...");
    },
    onError: (e) => {
      toast.error("PDF failed: " + e.message);
      setGeneratingPDF(false);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-red-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Itinerary not found</p>
      </div>
    );
  }

  const inclusions: string[] = Array.isArray(data.inclusions) ? (data.inclusions as string[]) : [];
  const exclusions: string[] = Array.isArray(data.exclusions) ? (data.exclusions as string[]) : [];
  const d = data as any;

  // Guest list: prefer structured guestList, fall back to guestNames string
  const guestList: Array<{ name: string; category: string }> = Array.isArray(d.guestList) && d.guestList.length
    ? d.guestList
    : (data.guestNames || "").split("\n").filter(Boolean).map((n: string) => ({ name: n, category: "" }));

  // Arrival / Return helpers
  const hasArrival = !!(d.arrivalFrom || d.arrivalTo || d.arrivalFlightNo);
  const hasReturn = !!(d.returnFlightNo || d.returnDepartureDate);
  const isRoundTrip = d.tripType === "flight-rt" || d.tripType === "train-rt";
  const isTrainTrip = d.tripType === "train-rt" || d.tripType === "train-ow";
  const vehicleLabel = isTrainTrip ? "Train" : "Flight";
  const stopsLabel = (stops: string) => stops === "direct" ? "Direct / Non-Stop" : stops === "1stop" ? "1 Stop" : stops === "2stop" ? "2 Stops" : stops;

  // A4 page style: 794px wide (96dpi A4), auto height
  const pageStyle: React.CSSProperties = {
    width: "794px",
    minHeight: "1123px",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Print CSS */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white; margin: 0; }
          .a4-page {
            width: 210mm !important;
            min-height: 297mm !important;
            page-break-after: always;
            box-shadow: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          @page { size: A4; margin: 0; }
        }
      `}</style>

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="h-5 w-px bg-gray-200" />
            <h1 className="font-semibold text-gray-900 truncate max-w-xs">{data.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/itinerary/${id}/edit`)}>
              <Pencil className="w-4 h-4" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
              disabled={generatingDOCX}
              onClick={() => { setGeneratingDOCX(true); generateDOCXMutation.mutate({ id }); }}
            >
              {generatingDOCX ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Word
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
              size="sm"
              disabled={generatingPDF}
              onClick={() => { setGeneratingPDF(true); generateMutation.mutate({ id }); }}
            >
              {generatingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Preview content — centered, A4 width */}
      <div className="py-8 px-4 space-y-6 flex flex-col items-center">

        {/* ══════════════════════════════════════════════════════════════
            PAGE 1: Cover
        ══════════════════════════════════════════════════════════════ */}
        <div className="a4-page bg-white shadow-lg rounded-lg overflow-hidden" style={pageStyle}>
          {/* Banner */}
          <div className="flex flex-shrink-0" style={{ height: 260 }}>
            <div className="flex-1 overflow-hidden relative">
              {data.coverImageUrl ? (
                <img src={data.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #e94560 100%)" }}>
                  <div className="text-white text-center px-8">
                    <div className="text-2xl italic mb-1" style={{ fontFamily: "Georgia, serif" }}>Travel is our Story</div>
                    <div className="text-3xl font-bold mb-1">trust is our promise,</div>
                    <div className="text-3xl italic mb-4" style={{ fontFamily: "Georgia, serif" }}>Rest is your Experience.</div>
                    <div className="text-sm">🌐 www.pikme.org</div>
                  </div>
                </div>
              )}
            </div>
            <div className="w-44 bg-gray-900 flex flex-col flex-shrink-0">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white flex-shrink-0">
                      <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
                    </svg>
                  ),
                  text: "AIR TICKET\nBOOKING FOR\nGROUP & FIT"
                },
                { icon: <span className="text-xl">🏨</span>, text: "HOTEL & RESORT\nBOOKING" },
                { icon: <span className="text-xl">🌍</span>, text: "DOMESTIC\n& INTERNATIONAL\nTOUR OPERATOR" },
                { icon: <span className="text-xl">🛕</span>, text: "SPIRITUAL TEMPLE\nVISIT WITH VIP\nDARSHAN PASS" },
                { icon: <span className="text-xl">💼</span>, text: "CORPORATE\nBOOKING" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-700 flex-1">
                  {s.icon}
                  <span className="text-white text-xs font-semibold leading-tight whitespace-pre-line">{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cover body */}
          <div className="px-12 py-6 flex-1">
            {/* Title */}
            <h1 className="text-3xl font-bold text-center mb-1 tracking-tight">{data.destination || data.title}</h1>
            <div className="flex justify-center mb-5">
              <div className="h-1 w-16 rounded" style={{ background: "#e53e3e" }} />
            </div>

            {/* ── Guest list ── */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-5 py-3 mb-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Guests</div>
              <div className="flex flex-wrap gap-x-8 gap-y-1">
                {guestList.map((g, i) => (
                  <div key={i} className="flex items-baseline gap-1.5">
                    <span className="font-semibold text-sm text-gray-900">{g.name}</span>
                    {g.category && <span className="text-xs text-gray-400 italic">({g.category})</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Trip details grid ── */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { label: "Duration", value: `${data.numNights} Nights / ${data.numDays} Days` },
                { label: "Guests", value: `${data.numGuests} Pax` },
                { label: "Dates", value: `${data.startDate} – ${data.endDate}` },
                ...(data.transfers ? [{ label: "Transfers", value: data.transfers }] : []),
              ].map((item, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</div>
                  <div className="text-sm font-semibold text-gray-800">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Accommodation spans full width */}
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 mb-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Accommodation</div>
              <div className="text-sm font-semibold text-gray-800">{data.hotels.map((h: any) => `${h.name} (${h.starRating}★)`).join(" · ")}</div>
            </div>

            {/* ── Arrival & Return Details ── */}
            {(hasArrival || hasReturn) && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Arrival &amp; Return Details</div>
                <div className="flex flex-col gap-3">
                  {/* Arrival card */}
                  {hasArrival && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 text-xs font-bold text-white flex items-center gap-2" style={{ background: "#e53e3e" }}>
                        <span>↗</span>
                        <span>{vehicleLabel} Arrival — {d.arrivalFrom || "—"} → {d.arrivalTo || "—"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-0 divide-x divide-gray-100 bg-white">
                        {d.arrivalFlightNo && <div className="px-3 py-2"><div className="text-xs text-gray-400">{vehicleLabel} No.</div><div className="text-xs font-semibold">{d.arrivalFlightNo}</div></div>}
                        {d.arrivalAirline && <div className="px-3 py-2"><div className="text-xs text-gray-400">Airline</div><div className="text-xs font-semibold">{d.arrivalAirline}</div></div>}
                        {d.arrivalStops && <div className="px-3 py-2"><div className="text-xs text-gray-400">Stops</div><div className="text-xs font-semibold">{stopsLabel(d.arrivalStops)}</div></div>}
                        {d.arrivalDepartureDate && <div className="px-3 py-2"><div className="text-xs text-gray-400">Departure</div><div className="text-xs font-semibold">{d.arrivalDepartureDate} {d.arrivalDepartureTime}</div></div>}
                        {d.arrivalArrivalDate && <div className="px-3 py-2"><div className="text-xs text-gray-400">Arrival</div><div className="text-xs font-semibold">{d.arrivalArrivalDate} {d.arrivalArrivalTime}</div></div>}
                      </div>
                    </div>
                  )}
                  {/* Return card */}
                  {isRoundTrip && hasReturn && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 text-xs font-bold text-white flex items-center gap-2" style={{ background: "#374151" }}>
                        <span>↘</span>
                        <span>Return — {d.returnFrom || d.arrivalTo || "—"} → {d.returnTo || d.arrivalFrom || "—"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-0 divide-x divide-gray-100 bg-white">
                        {d.returnFlightNo && <div className="px-3 py-2"><div className="text-xs text-gray-400">{vehicleLabel} No.</div><div className="text-xs font-semibold">{d.returnFlightNo}</div></div>}
                        {d.returnAirline && <div className="px-3 py-2"><div className="text-xs text-gray-400">Airline</div><div className="text-xs font-semibold">{d.returnAirline}</div></div>}
                        {d.returnStops && <div className="px-3 py-2"><div className="text-xs text-gray-400">Stops</div><div className="text-xs font-semibold">{stopsLabel(d.returnStops)}</div></div>}
                        {d.returnDepartureDate && <div className="px-3 py-2"><div className="text-xs text-gray-400">Departure</div><div className="text-xs font-semibold">{d.returnDepartureDate} {d.returnDepartureTime}</div></div>}
                        {d.returnArrivalDate && <div className="px-3 py-2"><div className="text-xs text-gray-400">Arrival</div><div className="text-xs font-semibold">{d.returnArrivalDate} {d.returnArrivalTime}</div></div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Special Notes ── */}
            {d.specialNotes && (
              <div className="border-l-4 bg-amber-50 rounded-r-lg px-4 py-3 text-xs text-gray-700 leading-6" style={{ borderColor: "#f59e0b" }}>
                <div className="font-bold text-sm text-amber-800 mb-1">Special Notes / Requests</div>
                <div className="whitespace-pre-line">{d.specialNotes}</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <PikmeFooter pageNum={1} totalPages={4} />
        </div>

        {/* ══════════════════════════════════════════════════════════════
            PAGE 2: Hotels + Itinerary Days
        ══════════════════════════════════════════════════════════════ */}
        <div className="a4-page bg-white shadow-lg rounded-lg overflow-hidden" style={pageStyle}>
          <InnerPageHeader logoUrl={settingsData?.logoUrl} />
          <div className="border border-gray-200 mx-6 rounded p-6 flex-1">
            <h2 className="text-2xl font-light text-center mb-2">Hotel Detail</h2>
            <hr className="border-gray-200 mb-3" />
            <div className="max-w-xl mx-auto">
            {data.hotels.map((h: any, i: number) => (
              <div key={i} className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-400 text-sm">{stars(h.starRating)}</span>
                  {(h as any).destinationName && (
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{(h as any).destinationName}</span>
                  )}
                </div>
                <div className="flex gap-3">
                  {h.imageUrl ? (
                    <img src={h.imageUrl} alt={h.name} className="rounded object-cover flex-shrink-0" style={{ width: 140, height: 90 }} />
                  ) : (
                    <div className="rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300 text-xs" style={{ width: 140, height: 90 }}>No Image</div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-bold mb-1">{h.numNights}N Stay @ {h.name} ({h.starRating}★)</div>
                    <div className="flex gap-4">
                      <div>
                        <div className="text-xs text-gray-400">Check-in</div>
                        <div className="text-xs font-semibold">{h.checkInTime} {h.checkInDate}</div>
                      </div>
                      <div className="text-gray-300">|</div>
                      <div>
                        <div className="text-xs text-gray-400">Check-out</div>
                        <div className="text-xs font-semibold">{h.checkOutTime} {h.checkOutDate}</div>
                      </div>
                    </div>
                    {/* Room Allocation */}
                    {((h as any).numRooms > 0 || (h as any).doubleSharing > 0 || (h as any).tripleSharing > 0 || (h as any).childNoBed > 0 || (h as any).childWithBed > 0) && (
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {(h as any).numRooms > 0 && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5">{(h as any).numRooms} Room{(h as any).numRooms !== 1 ? 's' : ''}</span>}
                        {(h as any).doubleSharing > 0 && <span className="text-xs bg-gray-50 text-gray-700 border border-gray-200 rounded px-2 py-0.5">Double ×{(h as any).doubleSharing}</span>}
                        {(h as any).tripleSharing > 0 && <span className="text-xs bg-gray-50 text-gray-700 border border-gray-200 rounded px-2 py-0.5">Triple ×{(h as any).tripleSharing}</span>}
                        {(h as any).childNoBed > 0 && <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded px-2 py-0.5">Child No Bed ×{(h as any).childNoBed}</span>}
                        {(h as any).childWithBed > 0 && <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded px-2 py-0.5">Child With Bed ×{(h as any).childWithBed}</span>}
                        {(h as any).extraBed > 0 && <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded px-2 py-0.5">Extra Bed ×{(h as any).extraBed}</span>}
                      </div>
                    )}
                    {((h as any).mealPlan || (h as any).foodPreference) && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {(h as any).mealPlan && (
                          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5">{mealPlanLabel((h as any).mealPlan)}</span>
                        )}
                        {(h as any).foodPreference && (
                          <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-2 py-0.5">🍽 {(h as any).foodPreference}</span>
                        )}
                      </div>
                    )}
                    {(h as any).specialNotes && (
                      <div className="mt-1 text-xs text-gray-600 italic border-l-2 border-amber-400 pl-2">{(h as any).specialNotes}</div>
                    )}
                  </div>
                </div>
                {i < data.hotels.length - 1 && <hr className="border-gray-200 my-2" />}
              </div>
            ))}
            </div>

            <h2 className="text-3xl font-light text-center mt-8 mb-3">Detailed Itinerary</h2>
            <hr className="border-gray-200 mb-4" />
            {data.days.map((day: any, i: number) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">Day {day.dayNumber}</span>
                  <span className="text-sm font-bold"> - {day.date}{day.title ? " | " + day.title : ""}</span>
                </div>
                <div className="flex gap-4 mb-2">
                  {day.imageUrl ? (
                    <img src={day.imageUrl} alt={`Day ${day.dayNumber}`} className="rounded object-cover flex-shrink-0" style={{ width: 180, height: 130 }} />
                  ) : null}
                  <div className="flex-1">
                    <div className="text-sm font-bold mb-1">Itinerary:</div>
                    <hr className="border-gray-200 mb-2" />
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{day.description}</div>
                  </div>
                </div>
                
                {/* Transportation Segments */}
                {day.transportationSegments && day.transportationSegments.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {day.transportationSegments.map((segment: any) => (
                      <TransportationCard key={segment.id} segment={segment} />
                    ))}
                  </div>
                )}
                
                {i < data.days.length - 1 && <hr className="border-gray-200 my-4" />}
              </div>
            ))}
          </div>
          <PikmeFooter pageNum={2} totalPages={4} />
        </div>

        {/* ══════════════════════════════════════════════════════════════
            PAGE 3: Meals + Inclusions + Terms
        ══════════════════════════════════════════════════════════════ */}
        <div className="a4-page bg-white shadow-lg rounded-lg overflow-hidden" style={pageStyle}>
          <InnerPageHeader logoUrl={settingsData?.logoUrl} />
          <div className="border border-gray-200 mx-6 rounded p-6 flex-1">
            {data.mealPlans.length > 0 && (
              <>
                <h3 className="text-xl font-bold text-center mb-4">-: Meal Plan :-</h3>
                <table className="w-full text-sm border-collapse mb-6">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left font-bold">Date / Day</th>
                      <th className="border border-gray-200 px-4 py-2 text-center font-bold">Breakfast</th>
                      <th className="border border-gray-200 px-4 py-2 text-center font-bold">Lunch</th>
                      <th className="border border-gray-200 px-4 py-2 text-center font-bold">Dinner</th>
                      <th className="border border-gray-200 px-4 py-2 text-center font-bold">Food Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.mealPlans.map((m: any, i: number) => (
                      <tr key={i}>
                        <td className="border border-gray-200 px-4 py-2 font-bold">{m.date}{m.date ? `, Day ${String(m.dayNumber).padStart(2, "0")}` : `Day ${m.dayNumber}`}</td>
                        <td className="border border-gray-200 px-4 py-2 text-center font-semibold">
                          {m.breakfast > 0 && (m as any).breakfastType && (m as any).breakfastType !== 'none' && (m as any).breakfastType !== 'no' && (m as any).breakfastType !== '' ? <span className="text-green-700 font-bold">✓</span> : <span className="text-gray-400">—</span>}
                          {(m as any).breakfastType && (m as any).breakfastType !== 'none' && (m as any).breakfastType !== 'no' && (m as any).breakfastType !== '' && <div className="text-xs text-gray-500 mt-0.5">{FOOD_TYPE_LABELS[(m as any).breakfastType] || (m as any).breakfastType}</div>}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center font-semibold">
                          {m.lunch > 0 && (m as any).lunchType && (m as any).lunchType !== 'none' && (m as any).lunchType !== 'no' && (m as any).lunchType !== '' ? <span className="text-green-700 font-bold">✓</span> : <span className="text-gray-400">—</span>}
                          {(m as any).lunchType && (m as any).lunchType !== 'none' && (m as any).lunchType !== 'no' && (m as any).lunchType !== '' && <div className="text-xs text-gray-500 mt-0.5">{FOOD_TYPE_LABELS[(m as any).lunchType] || (m as any).lunchType}</div>}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center font-semibold">
                          {m.dinner > 0 && (m as any).dinnerType && (m as any).dinnerType !== 'none' && (m as any).dinnerType !== 'no' && (m as any).dinnerType !== '' ? <span className="text-green-700 font-bold">✓</span> : <span className="text-gray-400">—</span>}
                          {(m as any).dinnerType && (m as any).dinnerType !== 'none' && (m as any).dinnerType !== 'no' && (m as any).dinnerType !== '' && <div className="text-xs text-gray-500 mt-0.5">{FOOD_TYPE_LABELS[(m as any).dinnerType] || (m as any).dinnerType}</div>}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center text-xs text-gray-600">
                          {[(m as any).breakfastType, (m as any).lunchType, (m as any).dinnerType].filter(t => t && t !== 'none' && t !== 'no' && t !== '').map((t, ti) => FOOD_TYPE_LABELS[t] || t).filter((v, i, a) => a.indexOf(v) === i).join(', ') || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <hr className="border-gray-200 mb-4" />
              </>
            )}
            {inclusions.length > 0 && (
              <>
                <div className="flex gap-4 mb-4">
                  <span className="font-bold text-sm min-w-24">Inclusions:</span>
                  <ul className="list-disc pl-4 text-sm leading-7 flex-1">
                    {inclusions.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <hr className="border-gray-200 mb-4" />
              </>
            )}
            {exclusions.length > 0 && (
              <>
                <div className="flex gap-4 mb-4">
                  <span className="font-bold text-sm min-w-24">Exclusions:</span>
                  <ul className="list-none pl-0 text-sm leading-7 flex-1">
                    {exclusions.map((item, i) => <li key={i}>- {item}</li>)}
                  </ul>
                </div>
                <hr className="border-gray-200 mb-4" />
              </>
            )}
            {data.termsAndConditions && (
              <div className="flex gap-4">
                <span className="font-bold text-sm min-w-24">Notes &amp; Terms:</span>
                <div className="text-xs leading-7 flex-1 text-gray-700">
                  {data.termsAndConditions.split("\n").filter(Boolean).map((t: string, i: number) => (
                    <div key={i}>· {t}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <PikmeFooter pageNum={3} totalPages={4} />
        </div>

        {/* ══════════════════════════════════════════════════════════════
            BACK COVER
        ══════════════════════════════════════════════════════════════ */}
        <div className="a4-page bg-white shadow-lg rounded-lg overflow-hidden" style={{ ...pageStyle, minHeight: "400px" }}>
          <div style={{ height: 160, background: "linear-gradient(135deg, #e53e3e 0%, #e53e3e 55%, #fff 55%)" }} />
          <div className="flex flex-col items-center justify-center py-10 flex-1">
            <div className="text-9xl text-red-500 opacity-10 mb-6">✈</div>
            <img
              src="https://pikme.in/cdn/logo-banner/pikme-logo-600.png"
              alt="Pikme"
              style={{ width: 320, objectFit: "contain", marginBottom: 16 }}
            />

          </div>
          <div style={{ height: 80, background: "linear-gradient(to top left, #e53e3e 49%, #fff 50%)" }} />
          <PikmeFooter pageNum={4} totalPages={4} />
        </div>

        <div className="text-center py-4 print:hidden">
          <Button
            className="bg-red-600 hover:bg-red-700 text-white gap-2 px-8 py-3 text-base"
            disabled={generatingPDF}
            onClick={() => { setGeneratingPDF(true); generateMutation.mutate({ id }); }}
          >
            {generatingPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {generatingPDF ? "Generating PDF..." : "Download PDF for Guest"}
          </Button>
        </div>
      </div>
    </div>
  );
}

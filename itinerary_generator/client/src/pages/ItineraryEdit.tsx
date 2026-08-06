import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Save, Plus, Trash2, Star, Eye, Download, ArrowUpCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TransportationCard, TransportationSegment } from "@/components/TransportationCard";
import { TransportationForm } from "@/components/TransportationForm";
import { TransportationEditModal } from "@/components/TransportationEditModal";

// Parses a time string like "7:14Am", "09:15 AM", "14:30" and returns total minutes since midnight
function parseTimeToMinutes(t: string): number | null {
  if (!t) return null;
  const cleaned = t.trim().toUpperCase().replace(/\./g, "");
  // Try HH:MM AM/PM
  const ampm = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (ampm) {
    let h = parseInt(ampm[1]);
    const m = parseInt(ampm[2]);
    if (ampm[3] === "PM" && h !== 12) h += 12;
    if (ampm[3] === "AM" && h === 12) h = 0;
    return h * 60 + m;
  }
  // Try HH:MM (24h)
  const h24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) return parseInt(h24[1]) * 60 + parseInt(h24[2]);
  // Try HHMMam/pm (e.g. "714Am" -> "7:14 AM")
  const compact = cleaned.match(/^(\d{1,2})(\d{2})\s*(AM|PM)$/);
  if (compact) {
    let h = parseInt(compact[1]);
    const m = parseInt(compact[2]);
    if (compact[3] === "PM" && h !== 12) h += 12;
    if (compact[3] === "AM" && h === 12) h = 0;
    return h * 60 + m;
  }
  return null;
}

function calcJourneyTime(dep: string, arr: string): string | null {
  const depMin = parseTimeToMinutes(dep);
  const arrMin = parseTimeToMinutes(arr);
  if (depMin === null || arrMin === null) return null;
  let diff = arrMin - depMin;
  if (diff < 0) diff += 24 * 60; // overnight
  if (diff === 0) return null;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
}


import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";
import { DatePickerField } from "@/components/DatePickerField";
import { RichTextEditor } from "@/components/RichTextEditor";
import { TimePickerField } from "@/components/TimePickerField";

// ─── Types ─────────────────────────────────────────────────────────────────
interface GuestEntry { name: string; category: string; }

const GUEST_CATEGORIES = [
  { value: "adult",     label: "Adult" },
  { value: "child",     label: "Child" },
  { value: "infant",    label: "Infant" },
  { value: "pregnant",  label: "Pregnant" },
  { value: "sr-citizen",label: "Sr. Citizen" },
  { value: "medical",   label: "Medical Condition" },
  { value: "spl-attn",  label: "Spl Attn Req" },
] as const;

interface HotelForm { destinationName: string; name: string; starRating: number; numNights: number; checkInTime: string; checkInDate: string; checkOutTime: string; checkOutDate: string; specialNotes?: string | null; imageUrl?: string | null; numRooms: number; doubleSharing: number; tripleSharing: number; childNoBed: number; childWithBed: number; extraBed: number; privateTent: number; sharedTent: number; mealPlan: string; foodPreference: string; }
interface DayForm { dayNumber: number; date: string; title: string; description: string; imageUrl?: string | null; transportationSegments?: any[]; }
interface MealPlanForm { dayNumber: number; date: string; breakfast: number; breakfastType: string; lunch: number; lunchType: string; dinner: number; dinnerType: string; }

const FOOD_TYPES = [
  { value: "buffet", label: "Buffet" },
  { value: "self_paid", label: "Self Paid" },
  { value: "complimentary", label: "Complimentary" },
  { value: "candle_ld", label: "Candle L D" },
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "coupon", label: "Coupon" },
  { value: "fixed", label: "Fixed Menu" },
  { value: "unlimited", label: "Unlimited" },
  { value: "food_with_drink", label: "Food with Drink" },
  { value: "drink_only", label: "Drink Only" },
  { value: "take_away", label: "Take Away" },
  { value: "packed_food", label: "Packed Food" },
  { value: "gala_dinner", label: "Gala Dinner" },
  { value: "event", label: "Event" },
  { value: "others", label: "Others" },
] as const;

// ─── Vehicle config ───────────────────────────────────────────────────────────
const VEHICLE_CATEGORIES: Record<string, { label: string; brands: string[] }> = {
  sedan:    { label: "Sedan",         brands: ["Swift Dzire", "Honda Amaze", "Hyundai Xcent", "Toyota Etios", "Maruti Ciaz"] },
  ertiga:   { label: "Ertiga (6-Seater)", brands: ["Maruti Ertiga", "Toyota Rumion"] },
  crysta:   { label: "Innova Crysta", brands: ["Toyota Innova Crysta", "Toyota Innova HyCross"] },
  fortuner: { label: "Fortuner (7-Seater)", brands: ["Toyota Fortuner", "Toyota Fortuner Legender"] },
  carnival: { label: "Kia Carnival (8-Seater)", brands: ["Kia Carnival", "Kia Carnival Limousine"] },
  traveler: { label: "Traveller (12-Seater)", brands: ["Force Traveller 12", "Force Traveller 17", "Tempo Traveller"] },
};


function getDefaultVehicleCategory(pax: number): string {
  if (pax <= 2) return "sedan";
  if (pax <= 3) return "sedan";
  if (pax === 4) return "ertiga";
  if (pax <= 6) return "crysta";
  return "traveler";
}

const defaultHotel = (): HotelForm => ({ destinationName: "", name: "", starRating: 3, numNights: 1, checkInTime: "02:00 PM", checkInDate: "", checkOutTime: "12:00 PM", checkOutDate: "", specialNotes: null, imageUrl: null, numRooms: 0, doubleSharing: 0, tripleSharing: 0, childNoBed: 0, childWithBed: 0, extraBed: 0, privateTent: 0, sharedTent: 0, mealPlan: "MAPI", foodPreference: "" });
const defaultDay = (n: number, date = ""): DayForm => ({ dayNumber: n, date, title: "", description: "", imageUrl: null, transportationSegments: [] as any[] });
const defaultMeal = (n: number, date = ""): MealPlanForm => ({ dayNumber: n, date, breakfast: 0, breakfastType: "", lunch: 0, lunchType: "", dinner: 0, dinnerType: "" });

const DEFAULT_TERMS_LINES: string[] = [];

// ─── Date helpers ──────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/**
 * Try to parse a free-text date string like "April 02 2026", "Apr 02 2026",
 * "02 April 2026", "April 2, 2026", etc. Returns a Date or null.
 */
function parseFlexDate(raw: string): Date | null {
  if (!raw?.trim()) return null;
  // Try native parse first
  const native = new Date(raw);
  if (!isNaN(native.getTime())) return native;
  // Try "Month DD YYYY" or "DD Month YYYY"
  const cleaned = raw.replace(/,/g, "").trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length === 3) {
    let day: number, month: number, year: number;
    // Check if first part is a month name
    const m1 = [...MONTHS, ...MONTHS_FULL].findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
    if (m1 >= 0) {
      month = m1 % 12;
      day = parseInt(parts[1]);
      year = parseInt(parts[2]);
    } else {
      // Try last part as month
      const m2 = [...MONTHS, ...MONTHS_FULL].findIndex(m => m.toLowerCase() === parts[1].toLowerCase());
      if (m2 >= 0) {
        day = parseInt(parts[0]);
        month = m2 % 12;
        year = parseInt(parts[2]);
      } else {
        return null;
      }
    }
    if (!isNaN(day) && !isNaN(year)) return new Date(year, month, day);
  }
  return null;
}

/**
 * Format a Date as "Apr 02, 2026" for day cards
 */
function formatDayDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
}

/**
 * Format a Date as "02 April 2026" for meal plan rows
 */
function formatMealDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Given a start date string and a count of days, return an array of
 * formatted date strings (one per day). Falls back to empty strings if
 * the start date cannot be parsed.
 */
function buildDateSequence(startDateStr: string, count: number): string[] {
  const base = parseFlexDate(startDateStr);
  if (!base) return Array(count).fill("");
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return formatDayDate(d);
  });
}

function buildMealDateSequence(startDateStr: string, count: number): string[] {
  const base = parseFlexDate(startDateStr);
  if (!base) return Array(count).fill("");
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return formatMealDate(d);
  });
}

export default function ItineraryEdit() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const isNew = !params.id;
  const id = params.id ? parseInt(params.id) : undefined;

  // ─── Form state ───────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [guestNames, setGuestNames] = useState("");
  const [guestList, setGuestList] = useState<GuestEntry[]>([{ name: "", category: "adult" }]);
  const [numGuests, setNumGuests] = useState(2);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numNights, setNumNights] = useState(2);
  const [numDays, setNumDays] = useState(3);

  // Trip type: flight-rt | train-rt | mixed | na
  const [tripType, setTripType] = useState("flight-rt");
  // Arrival
  const [arrivalType, setArrivalType] = useState("flight"); // kept for payload compat
  const [arrivalFrom, setArrivalFrom] = useState("");
  const [arrivalTo, setArrivalTo] = useState("");
  const [arrivalFlightNo, setArrivalFlightNo] = useState("");
  const [arrivalAirline, setArrivalAirline] = useState("");
  const [arrivalStops, setArrivalStops] = useState("direct");
  const [arrivalStop1, setArrivalStop1] = useState("");
  const [arrivalStop2, setArrivalStop2] = useState("");
  const [arrivalDepartureDate, setArrivalDepartureDate] = useState("");
  const [arrivalDepartureTime, setArrivalDepartureTime] = useState("");
  const [arrivalArrivalDate, setArrivalArrivalDate] = useState("");
  const [arrivalArrivalTime, setArrivalArrivalTime] = useState("");
  // Return
  const [returnFlightNo, setReturnFlightNo] = useState("");
  const [returnAirline, setReturnAirline] = useState("");
  const [returnStops, setReturnStops] = useState("direct");
  const [returnFrom, setReturnFrom] = useState("");
  const [returnTo, setReturnTo] = useState("");
  const [returnStop1, setReturnStop1] = useState("");
  const [returnStop2, setReturnStop2] = useState("");
  const [returnDepartureDate, setReturnDepartureDate] = useState("");
  const [returnDepartureTime, setReturnDepartureTime] = useState("");
  const [returnArrivalDate, setReturnArrivalDate] = useState("");
  const [returnArrivalTime, setReturnArrivalTime] = useState("");
  const [vehicleCategory, setVehicleCategory] = useState<string>("sedan");
  const [vehicleBrand, setVehicleBrand] = useState<string>("");
  // transfers is kept for PDF payload — derived from vehicle selection
  const [transfers, setTransfers] = useState("Private Transfers for all activities");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [specialNotes, setSpecialNotes] = useState<string>("");
  const [inclusions, setInclusions] = useState<string[]>([""]);
  const [exclusions, setExclusions] = useState<string[]>([""]);
  const [termsLines, setTermsLines] = useState<string[]>(DEFAULT_TERMS_LINES);
  const [hotels, setHotels] = useState<HotelForm[]>([defaultHotel()]);
  const [days, setDays] = useState<DayForm[]>([defaultDay(1)]);
  const [mealPlans, setMealPlans] = useState<MealPlanForm[]>([defaultMeal(1)]);
  const [saving, setSaving] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [editingTransportation, setEditingTransportation] = useState<TransportationSegment | null>(null);
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // ─── Load existing ────────────────────────────────────────────────────────
  const { data: existing, isLoading } = trpc.itinerary.get.useQuery(
    { id: id! },
    { enabled: !!id, staleTime: Infinity, refetchOnWindowFocus: false }
  );

  // Guard: only populate form state once from the server (prevents refetch from overwriting edits)
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!existing || hasLoaded.current) return;
    hasLoaded.current = true;
    setTitle(existing.title);
    setDestination(existing.destination || "");
    setGuestNames(existing.guestNames || "");
    const loadedGuestList = (existing as any).guestList;
    if (Array.isArray(loadedGuestList) && loadedGuestList.length > 0) {
      setGuestList(loadedGuestList);
    } else if (existing.guestNames) {
      // Migrate legacy newline-separated names to structured list
      const names = existing.guestNames.split("\n").filter(Boolean);
      setGuestList(names.map(n => ({ name: n, category: "adult" })));
    }
    setNumGuests(existing.numGuests);
    setStartDate(existing.startDate || "");
    setEndDate(existing.endDate || "");
    setNumNights(existing.numNights);
    setNumDays(existing.numDays);
    // Fix: parentheses required — without them JS evaluates as: (tripType || condition) ? ... : ...
    const tt = (existing as any).tripType || ((existing as any).arrivalType === "train" ? "train-rt" : "flight-rt");
    setTripType(tt);
    setArrivalType((existing as any).arrivalType || "flight");
    setArrivalFrom((existing as any).arrivalFrom || "");
    setArrivalTo((existing as any).arrivalTo || "");
    setArrivalFlightNo((existing as any).arrivalFlightNo || "");
    setArrivalAirline((existing as any).arrivalAirline || "");
    setArrivalStops((existing as any).arrivalStops || "direct");
    setArrivalStop1((existing as any).arrivalStop1 || "");
    setArrivalStop2((existing as any).arrivalStop2 || "");
    setArrivalDepartureDate((existing as any).arrivalDepartureDate || "");
    setArrivalDepartureTime((existing as any).arrivalDepartureTime || "");
    setArrivalArrivalDate((existing as any).arrivalArrivalDate || "");
    setArrivalArrivalTime((existing as any).arrivalArrivalTime || "");
    setReturnFlightNo((existing as any).returnFlightNo || "");
    setReturnAirline((existing as any).returnAirline || "");
    setReturnStops((existing as any).returnStops || "direct");
    setReturnFrom((existing as any).returnFrom || "");
    setReturnTo((existing as any).returnTo || "");
    setReturnStop1((existing as any).returnStop1 || "");
    setReturnStop2((existing as any).returnStop2 || "");
    setReturnDepartureDate((existing as any).returnDepartureDate || "");
    setReturnDepartureTime((existing as any).returnDepartureTime || "");
    setReturnArrivalDate((existing as any).returnArrivalDate || "");
    setReturnArrivalTime((existing as any).returnArrivalTime || "");
    // Try to parse stored transfers back into category/brand
    const stored = existing.transfers || "";
    // Detect category from stored string
    const detectedCat = Object.entries(VEHICLE_CATEGORIES).find(([, v]) =>
      v.brands.some(b => stored.includes(b)) || stored.toLowerCase().includes(v.label.toLowerCase())
    )?.[0] || getDefaultVehicleCategory(existing.numGuests);
    const detectedBrand = Object.values(VEHICLE_CATEGORIES)
      .flatMap(v => v.brands)
      .find(b => stored.includes(b)) || "";
    setVehicleCategory(detectedCat);
    setVehicleBrand(detectedBrand);
    setTransfers(stored);
    setCoverImageUrl(existing.coverImageUrl || null);
    setSpecialNotes((existing as any).specialNotes || "");
    setInclusions(Array.isArray(existing.inclusions) && existing.inclusions.length ? existing.inclusions as string[] : [""]);
    setExclusions(Array.isArray(existing.exclusions) && existing.exclusions.length ? existing.exclusions as string[] : [""]);
    // Load terms: if stored as newline-separated plain text use split; if HTML extract text lines
    const rawT = existing.termsAndConditions || "";
    if (!rawT) {
      setTermsLines(DEFAULT_TERMS_LINES);
    } else if (rawT.trim().startsWith("<")) {
      // Legacy HTML — strip tags and split by </li> or </p>
      const stripped = rawT.replace(/<\/li>|<\/p>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      const lines = stripped.split("\n").map(l => l.trim()).filter(Boolean);
      setTermsLines(lines.length ? lines : DEFAULT_TERMS_LINES);
    } else {
      const lines = rawT.split("\n").map(l => l.trim()).filter(Boolean);
      setTermsLines(lines.length ? lines : DEFAULT_TERMS_LINES);
    }
    setHotels(existing.hotels.length ? existing.hotels.map(h => ({ destinationName: (h as any).destinationName || "", name: h.name, starRating: h.starRating, numNights: h.numNights, checkInTime: h.checkInTime, checkInDate: h.checkInDate, checkOutTime: h.checkOutTime, checkOutDate: h.checkOutDate, specialNotes: (h as any).specialNotes || null, imageUrl: h.imageUrl, numRooms: (h as any).numRooms ?? 0, doubleSharing: (h as any).doubleSharing ?? 0, tripleSharing: (h as any).tripleSharing ?? 0, childNoBed: (h as any).childNoBed ?? 0, childWithBed: (h as any).childWithBed ?? 0, extraBed: (h as any).extraBed ?? 0, privateTent: (h as any).privateTent ?? 0, sharedTent: (h as any).sharedTent ?? 0, mealPlan: (h as any).mealPlan || "MAPI", foodPreference: (h as any).foodPreference || "" })) : [defaultHotel()]);
    // Normalize transportation segments from database field names to form field names
    const normalizeTransSegs = (segs: any[]) => segs.map(seg => ({
      id: seg.id,
      type: seg.type,
      departureLocation: seg.departureLocation || seg.originLocation || "",
      departureDate: seg.departureDate || seg.originDate || "",
      departureTime: seg.departureTime || seg.originTime || "",
      arrivalLocation: seg.arrivalLocation || seg.destinationLocation || "",
      arrivalDate: seg.arrivalDate || seg.destinationDate || "",
      arrivalTime: seg.arrivalTime || seg.destinationTime || "",
      flightNumber: seg.flightNumber || "",
      airline: seg.airline || "",
      trainNumber: seg.trainNumber || "",
      trainName: seg.trainName || "",
      vehicleType: seg.vehicleType || "",
      vehicleNumber: seg.vehicleNumber || "",
    }));
    setDays(existing.days.length ? existing.days.map(d => ({ dayNumber: d.dayNumber, date: d.date, title: d.title, description: d.description, imageUrl: d.imageUrl, transportationSegments: normalizeTransSegs((d as any).transportationSegments || []) })) : [defaultDay(1)]);
    setMealPlans(existing.mealPlans.length ? existing.mealPlans.map(m => ({ dayNumber: m.dayNumber, date: m.date, breakfast: m.breakfast, breakfastType: (m as any).breakfastType || "", lunch: m.lunch, lunchType: (m as any).lunchType || "", dinner: m.dinner, dinnerType: (m as any).dinnerType || "" })) : [defaultMeal(1)]);
  }, [existing]);

  // ─── Auto-populate dates when start date or day count changes ─────────────
  const applyDatesFromStart = useCallback((start: string, count: number) => {
    const dayDates = buildDateSequence(start, count);
    const mealDates = buildMealDateSequence(start, count);
    setDays(prev =>
      Array.from({ length: count }, (_, i) => {
        const existing = prev[i];
        return existing
          ? { ...existing, dayNumber: i + 1, date: dayDates[i] || existing.date }
          : defaultDay(i + 1, dayDates[i]);
      })
    );
    setMealPlans(prev =>
      Array.from({ length: count }, (_, i) => {
        const existing = prev[i];
        return existing
          ? { ...existing, dayNumber: i + 1, date: mealDates[i] || existing.date }
          : defaultMeal(i + 1, mealDates[i]);
      })
    );
  }, []);

  // When numGuests changes: auto-update vehicle category default
  const handleNumGuestsChange = (n: number) => {
    setNumGuests(n);
    const newCat = getDefaultVehicleCategory(n);
    setVehicleCategory(newCat);
    setVehicleBrand(""); // reset brand to default
    const label = VEHICLE_CATEGORIES[newCat]?.label || "";
    setTransfers(`Private Transfers — ${label}`);
  };

  // When vehicle category changes
  const handleVehicleCategoryChange = (cat: string) => {
    setVehicleCategory(cat);
    setVehicleBrand("");
    const label = VEHICLE_CATEGORIES[cat]?.label || cat;
    setTransfers(`Private Transfers — ${label}`);
  };

  // When vehicle brand changes
  const handleVehicleBrandChange = (brand: string) => {
    setVehicleBrand(brand);
    const label = VEHICLE_CATEGORIES[vehicleCategory]?.label || vehicleCategory;
    setTransfers(`Private Transfers — ${brand} (${label})`);
  };

  // When start date is changed: re-derive all day/meal dates AND recalculate nights/days if end date is set
  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    const s = parseFlexDate(val);
    const e = parseFlexDate(endDate);
    if (s && e && e >= s) {
      const nights = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
      const days = nights + 1;
      setNumNights(nights);
      setNumDays(days);
      applyDatesFromStart(val, days);
    } else {
      applyDatesFromStart(val, numDays);
    }
  };
  // When end date is changed: auto-calculate nights and days from start date
  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    const s = parseFlexDate(startDate);
    const e = parseFlexDate(val);
    if (s && e && e >= s) {
      const nights = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
      const days = nights + 1;
      setNumNights(nights);
      setNumDays(days);
      applyDatesFromStart(startDate, days);
    }
  };
  // When numDays changes manually: resize arrays AND re-derive dates
  const syncDayCount = (n: number) => {
    setNumDays(n);
    applyDatesFromStart(startDate, n);
  };
  // ─── Mutationss ────────────────────────────────────────────────────────────
  const createMutation = trpc.itinerary.create.useMutation({
    onSuccess: (data) => { toast.success("Itinerary created!"); if (data?.id) navigate(`/itinerary/${data.id}/edit`); else navigate("/"); setSaving(false); },
    onError: (e) => { toast.error(e.message); setSaving(false); },
  });
  const utils = trpc.useUtils();
  const updateMutation = trpc.itinerary.update.useMutation({
    onSuccess: () => {
      toast.success("Saved!");
      setSaving(false);
      // Invalidate the cache so the next navigation/reload reflects saved data,
      // but hasLoaded.current stays true so the form is NOT re-populated from server.
      if (id) utils.itinerary.get.invalidate({ id });
    },
    onError: (e) => { toast.error(e.message); setSaving(false); },
  });
  const generateMutation = trpc.itinerary.generatePDF.useMutation({
    onSuccess: (data) => { window.open(data.url, "_blank"); setGeneratingPDF(false); toast.success("PDF ready! Opening download..."); },
    onError: (e) => { toast.error("PDF failed: " + e.message); setGeneratingPDF(false); },
  });



  const buildPayload = () => ({
    title, destination,
    // Sync guestNames (legacy) from guestList for PDF compatibility
    guestNames: guestList.map(g => g.name).filter(Boolean).join("\n") || guestNames,
    guestList,
    numGuests, startDate, endDate, numNights, numDays,
    transfers,
    tripType, arrivalType: tripType === "train-rt" ? "train" : "flight",
    arrivalFrom, arrivalTo, arrivalFlightNo, arrivalAirline, arrivalStops, arrivalStop1, arrivalStop2,
    arrivalDepartureDate, arrivalDepartureTime, arrivalArrivalDate, arrivalArrivalTime,
    returnFlightNo, returnAirline, returnStops, returnFrom, returnTo, returnStop1, returnStop2,
    returnDepartureDate, returnDepartureTime, returnArrivalDate, returnArrivalTime,
    coverImageUrl,
    specialNotes,
    inclusions: inclusions.filter(Boolean),
    exclusions: exclusions.filter(Boolean),
    termsAndConditions: termsLines.filter(Boolean).join("\n"),
    hotels: hotels.map(h => ({ ...h, imageUrl: h.imageUrl ?? null })),
    days: days.map(d => ({
      ...d,
      imageUrl: d.imageUrl ?? null,
      transportationSegments: d.transportationSegments || [],
    })),
    mealPlans,
  });

  const handleSave = () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    if (isNew) createMutation.mutate(buildPayload());
    else updateMutation.mutate({ id: id!, data: buildPayload() });
  };

  const handleGeneratePDF = () => {
    if (!id) { toast.error("Save first before generating PDF"); return; }
    setGeneratingPDF(true);
    generateMutation.mutate({ id });
  };

  if (!isNew && isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="h-5 w-px bg-gray-200" />
            <h1 className="font-semibold text-gray-900">{isNew ? "New Itinerary" : title || "Edit Itinerary"}</h1>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/itinerary/${id}/preview`)}>
                  <Eye className="w-4 h-4" /> Preview
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={handleGeneratePDF} disabled={generatingPDF}>
                  {generatingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download PDF
                </Button>
              </>
            )}
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isNew ? "Create" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <Tabs defaultValue="cover">
          <TabsList className="mb-6 bg-white border border-gray-200 p-1 rounded-lg">
            <TabsTrigger value="cover" className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-none">Cover Info</TabsTrigger>
            <TabsTrigger value="hotels" className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-none">Hotels</TabsTrigger>
            <TabsTrigger value="itinerary" className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-none">Itinerary Days</TabsTrigger>
            <TabsTrigger value="meals" className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-none">Meal Plan</TabsTrigger>
            <TabsTrigger value="inclusions" className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-none">Inclusions / Exclusions</TabsTrigger>
            <TabsTrigger value="terms" className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-none">Terms</TabsTrigger>
          </TabsList>

          {/* ── Cover Info ── */}
          <TabsContent value="cover">
            <div className="grid grid-cols-2 gap-6">
              <Card className="col-span-2">
                <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label>Itinerary Title *</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Ujjain Jyotirlinga Tour" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Destination / Sub-title</Label>
                    <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Mahakaleshwar, Madhya Pradesh" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Number of Guests</Label>
                    <Input type="number" min={1} max={10} value={numGuests} onChange={e => handleNumGuestsChange(parseInt(e.target.value) || 1)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Start Date</Label>
                    <DatePickerField
                      value={startDate}
                      onChange={handleStartDateChange}
                      placeholder="Pick start date"
                    />
                    <p className="text-xs text-gray-400">Itinerary &amp; meal plan dates auto-fill from this</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>End Date</Label>
                    <DatePickerField
                      value={endDate}
                      onChange={handleEndDateChange}
                      placeholder="Pick end date"
                      minDate={parseFlexDate(startDate) ? new Date(parseFlexDate(startDate)!.getTime() + 86400000) : undefined}
                    />
                    <p className="text-xs text-gray-400">Nights &amp; days auto-calculate from dates</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Number of Nights</Label>
                    <Input
                      type="number" min={1} value={numNights}
                      onChange={e => setNumNights(parseInt(e.target.value) || 1)}
                      readOnly={!!(parseFlexDate(startDate) && parseFlexDate(endDate))}
                      className={parseFlexDate(startDate) && parseFlexDate(endDate) ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Number of Days</Label>
                    <Input
                      type="number" min={1} value={numDays}
                      onChange={e => syncDayCount(parseInt(e.target.value) || 1)}
                      readOnly={!!(parseFlexDate(startDate) && parseFlexDate(endDate))}
                      className={parseFlexDate(startDate) && parseFlexDate(endDate) ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <div className="flex items-center gap-2">
                      <Label>Vehicle / Transfers</Label>
                      {vehicleCategory !== getDefaultVehicleCategory(numGuests) && (
                        <Badge className="bg-amber-100 text-amber-700 border border-amber-300 text-xs font-semibold flex items-center gap-1">
                          <ArrowUpCircle className="w-3 h-3" /> Upgraded
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Vehicle Category */}
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Vehicle Type</p>
                        <Select value={vehicleCategory} onValueChange={handleVehicleCategoryChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(VEHICLE_CATEGORIES).map(([key, v]) => (
                              <SelectItem key={key} value={key}>
                                <span className="flex items-center gap-2">
                                  {v.label}
                                  {key === getDefaultVehicleCategory(numGuests) && (
                                    <span className="text-xs text-green-600 font-medium">(Default)</span>
                                  )}
                                  {key !== getDefaultVehicleCategory(numGuests) && (
                                    <span className="text-xs text-amber-600 font-medium">(Upgrade)</span>
                                  )}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Vehicle Brand */}
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Vehicle Brand</p>
                        <Select
                          value={vehicleBrand || "__default__"}
                          onValueChange={v => handleVehicleBrandChange(v === "__default__" ? "" : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__default__">Any {VEHICLE_CATEGORIES[vehicleCategory]?.label}</SelectItem>
                            {(VEHICLE_CATEGORIES[vehicleCategory]?.brands || []).map(brand => (
                              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Default for {numGuests} pax: <strong>{VEHICLE_CATEGORIES[getDefaultVehicleCategory(numGuests)]?.label}</strong>
                      {vehicleCategory !== getDefaultVehicleCategory(numGuests) && (
                        <span className="text-amber-600 ml-2">— Upgraded from default</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Saved as: <em>{transfers}</em></p>
                  </div>
                </CardContent>
              </Card>

              {/* ── Arrival Details ── */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Arrival &amp; Return Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Trip type selector */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Trip Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { value: "flight-rt", icon: "✈", label: "Flight Round Trip" },
                        { value: "train-rt",  icon: "🚆", label: "Train Round Trip" },
                        { value: "mixed",     icon: "✈🚆", label: "1 Side Flight & 1 Side Train" },
                        { value: "na",        icon: "—",  label: "Not Applicable" },
                      ] as const).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setTripType(opt.value)}
                          className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors text-left flex items-center gap-2 ${
                            tripType === opt.value
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-white text-gray-600 border-gray-300 hover:border-red-400"
                          }`}
                        >
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Route — hidden when N/A */}
                  {tripType !== "na" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>From (Departure City)</Label>
                        <Input value={arrivalFrom} onChange={e => setArrivalFrom(e.target.value)} placeholder="e.g. Mumbai" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>To (Destination City)</Label>
                        <Input value={arrivalTo} onChange={e => setArrivalTo(e.target.value)} placeholder="e.g. Ujjain" />
                      </div>
                    </div>
                  )}

                  {/* Arrival + Return legs — conditional on tripType */}
                  {tripType !== "na" && (() => {
                    const arrMode = tripType === "train-rt" ? "train" : "flight";
                    const retMode = tripType === "mixed" ? "train" : tripType === "train-rt" ? "train" : "flight";
                    const arrLabel = arrMode === "flight"
                      ? { num: "Flight Number", carrier: "Airline", numPh: "e.g. AI 2345", carrierPh: "e.g. Air India" }
                      : { num: "Train Number", carrier: "Train Name", numPh: "e.g. 12961", carrierPh: "e.g. Avantika Express" };
                    const retLabel = retMode === "flight"
                      ? { num: "Flight Number", carrier: "Airline", numPh: "e.g. AI 2346", carrierPh: "e.g. Air India" }
                      : { num: "Train Number", carrier: "Train Name", numPh: "e.g. 12962", carrierPh: "e.g. Avantika Express" };
                    return (
                      <>
                        {/* Arrival leg */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">↓</span>
                            {arrMode === "flight" ? "✈" : "🚆"} Arrival — {arrivalFrom || "Origin"} → {arrivalTo || "Destination"}
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label>{arrLabel.num}</Label>
                              <Input value={arrivalFlightNo} onChange={e => setArrivalFlightNo(e.target.value)} placeholder={arrLabel.numPh} />
                            </div>
                            <div className="space-y-1.5">
                              <Label>{arrLabel.carrier}</Label>
                              <Input value={arrivalAirline} onChange={e => setArrivalAirline(e.target.value)} placeholder={arrLabel.carrierPh} />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Stops</Label>
                              <Select value={arrivalStops} onValueChange={setArrivalStops}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="direct">Direct / Non-Stop</SelectItem>
                                  <SelectItem value="1-stop">1 Stop</SelectItem>
                                  <SelectItem value="2-stop">2 Stops</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {(arrivalStops === "1-stop" || arrivalStops === "2-stop") && (
                              <div className="space-y-1.5">
                                <Label>Stop 1 Location</Label>
                                <Input value={arrivalStop1} onChange={e => setArrivalStop1(e.target.value)} placeholder="e.g. Delhi" />
                              </div>
                            )}
                            {arrivalStops === "2-stop" && (
                              <div className="space-y-1.5">
                                <Label>Stop 2 Location</Label>
                                <Input value={arrivalStop2} onChange={e => setArrivalStop2(e.target.value)} placeholder="e.g. Mumbai" />
                              </div>
                            )}
                            <div className="space-y-1.5">
                              <Label>Departure Date</Label>
                              <DatePickerField value={arrivalDepartureDate} onChange={setArrivalDepartureDate} placeholder="Pick departure date" minDate={new Date(new Date().setHours(0,0,0,0))} />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Departure Time</Label>
                              <TimePickerField value={arrivalDepartureTime} onChange={setArrivalDepartureTime} />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Arrival Date</Label>
                              <DatePickerField value={arrivalArrivalDate} onChange={setArrivalArrivalDate} placeholder="Pick arrival date" minDate={new Date(new Date().setHours(0,0,0,0))} />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Arrival Time</Label>
                              <TimePickerField value={arrivalArrivalTime} onChange={setArrivalArrivalTime} />
                            </div>
                            {calcJourneyTime(arrivalDepartureTime, arrivalArrivalTime) && (
                              <div className="col-span-2">
                                <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-3 py-1 text-xs font-medium">
                                  <span>⏱</span>
                                  <span>Journey Time: {calcJourneyTime(arrivalDepartureTime, arrivalArrivalTime)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Return leg */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">↑</span>
                            {retMode === "flight" ? "✈" : "🚆"} Return — {returnFrom || arrivalTo || "Departure City"} → {returnTo || arrivalFrom || "Destination City"}
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label>{retLabel.num}</Label>
                              <Input value={returnFlightNo} onChange={e => setReturnFlightNo(e.target.value)} placeholder={retLabel.numPh} />
                            </div>
                            <div className="space-y-1.5">
                              <Label>{retLabel.carrier}</Label>
                              <Input value={returnAirline} onChange={e => setReturnAirline(e.target.value)} placeholder={retLabel.carrierPh} />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Departure City</Label>
                              <Input value={returnFrom} onChange={e => setReturnFrom(e.target.value)} placeholder="e.g. Ujjain" />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Destination City</Label>
                              <Input value={returnTo} onChange={e => setReturnTo(e.target.value)} placeholder="e.g. Mumbai" />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Stops</Label>
                              <Select value={returnStops} onValueChange={setReturnStops}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="direct">Direct / Non-Stop</SelectItem>
                                  <SelectItem value="1-stop">1 Stop</SelectItem>
                                  <SelectItem value="2-stop">2 Stops</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {(returnStops === "1-stop" || returnStops === "2-stop") && (
                              <div className="space-y-1.5">
                                <Label>Stop 1 Location</Label>
                                <Input value={returnStop1} onChange={e => setReturnStop1(e.target.value)} placeholder="e.g. Delhi" />
                              </div>
                            )}
                            {returnStops === "2-stop" && (
                              <div className="space-y-1.5">
                                <Label>Stop 2 Location</Label>
                                <Input value={returnStop2} onChange={e => setReturnStop2(e.target.value)} placeholder="e.g. Mumbai" />
                              </div>
                            )}
                            <div className="space-y-1.5">
                              <Label>Departure Date</Label>
                              <DatePickerField value={returnDepartureDate} onChange={setReturnDepartureDate} placeholder="Pick departure date" minDate={new Date(new Date().setHours(0,0,0,0))} />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Departure Time</Label>
                              <TimePickerField value={returnDepartureTime} onChange={setReturnDepartureTime} />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Arrival Date</Label>
                              <DatePickerField value={returnArrivalDate} onChange={setReturnArrivalDate} placeholder="Pick arrival date" minDate={new Date(new Date().setHours(0,0,0,0))} />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Arrival Time</Label>
                              <TimePickerField value={returnArrivalTime} onChange={setReturnArrivalTime} />
                            </div>
                            {calcJourneyTime(returnDepartureTime, returnArrivalTime) && (
                              <div className="col-span-2">
                                <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-3 py-1 text-xs font-medium">
                                  <span>⏱</span>
                                  <span>Journey Time: {calcJourneyTime(returnDepartureTime, returnArrivalTime)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {/* Not Applicable message */}
                  {tripType === "na" && (
                    <div className="rounded-lg bg-gray-50 border border-dashed border-gray-300 p-6 text-center text-gray-400 text-sm">
                      No transport details required for this itinerary.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Guest Names &amp; Categories</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => setGuestList(prev => [...prev, { name: "", category: "adult" }])}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Guest
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {guestList.map((guest, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-5 text-right shrink-0">{i + 1}.</span>
                      <Input
                        value={guest.name}
                        onChange={e => setGuestList(prev => prev.map((g, j) => j === i ? { ...g, name: e.target.value } : g))}
                        placeholder="Guest full name (e.g. Mr. Rishi Dey)"
                        className="flex-1"
                      />
                      <Select
                        value={guest.category}
                        onValueChange={val => setGuestList(prev => prev.map((g, j) => j === i ? { ...g, category: val } : g))}
                      >
                        <SelectTrigger className="w-[170px] h-9 text-sm">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {GUEST_CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-600 px-2"
                        disabled={guestList.length <= 1}
                        onClick={() => setGuestList(prev => prev.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 mt-1">Each guest name will appear on the itinerary cover page.</p>
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader><CardTitle className="text-base">Cover Banner Image</CardTitle></CardHeader>
                <CardContent>
                  <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} label="Upload Cover Banner" previewHeight={200} />
                  <p className="text-xs text-gray-400 mt-2">Recommended: 1200×400px landscape image. If no image is uploaded, a default Pikme banner will be used.</p>
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader><CardTitle className="text-base">Special Notes / Requests</CardTitle></CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter any special notes, requests, or important information for this itinerary (e.g. wheelchair access required, anniversary celebration, dietary restrictions)..."
                    value={specialNotes}
                    onChange={e => setSpecialNotes(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-gray-400 mt-2">These notes will appear on the cover page of the itinerary.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Hotels ── */}
          <TabsContent value="hotels">
            <div className="space-y-4">
              {hotels.map((hotel, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-400 whitespace-nowrap">Hotel {i + 1}</span>
                        <Input
                          value={hotel.destinationName}
                          onChange={e => setHotels(prev => prev.map((h, j) => j === i ? { ...h, destinationName: e.target.value } : h))}
                          placeholder="Destination name (e.g. Ujjain, Indore)"
                          className="h-8 text-base font-semibold border-0 border-b border-gray-200 rounded-none px-1 focus-visible:ring-0 focus-visible:border-red-400 bg-transparent"
                        />
                      </div>
                      {hotels.length > 1 && (
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 ml-2" onClick={() => setHotels(prev => prev.filter((_, j) => j !== i))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">


                    <div className="col-span-2 space-y-1.5">
                      <Label>Hotel Name</Label>
                      <Input value={hotel.name} onChange={e => setHotels(prev => prev.map((h, j) => j === i ? { ...h, name: e.target.value } : h))} placeholder="e.g. Best Western Plus Indore" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Star Rating</Label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} type="button" onClick={() => setHotels(prev => prev.map((h, j) => j === i ? { ...h, starRating: s } : h))}>
                            <Star className={`w-6 h-6 ${s <= hotel.starRating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                          </button>
                        ))}
                        <span className="text-sm text-gray-500 ml-1">{hotel.starRating} Star</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nights at this hotel</Label>
                      <Input type="number" min={1} value={hotel.numNights} onChange={e => setHotels(prev => prev.map((h, j) => j === i ? { ...h, numNights: parseInt(e.target.value) || 1 } : h))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Check-in Time</Label>
                      <TimePickerField
                        value={hotel.checkInTime}
                        onChange={val => setHotels(prev => prev.map((h, j) => j === i ? { ...h, checkInTime: val } : h))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Check-in Date</Label>
                      <DatePickerField
                        value={hotel.checkInDate}
                        onChange={val => setHotels(prev => prev.map((h, j) => j === i ? { ...h, checkInDate: val } : h))}
                        placeholder="Pick check-in date"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Check-out Time</Label>
                      <TimePickerField
                        value={hotel.checkOutTime}
                        onChange={val => setHotels(prev => prev.map((h, j) => j === i ? { ...h, checkOutTime: val } : h))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Check-out Date</Label>
                      <DatePickerField
                        value={hotel.checkOutDate}
                        onChange={val => setHotels(prev => prev.map((h, j) => j === i ? { ...h, checkOutDate: val } : h))}
                        placeholder="Pick check-out date"
                      />
                    </div>
                    {/* Room Allocation */}
                    <div className="col-span-2">
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Room Allocation</p>
                        <div className="grid grid-cols-8 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">No. of Rooms</Label>
                            <Input type="number" min={0} value={hotel.numRooms} onChange={e => setHotels(prev => prev.map((h, j) => j === i ? { ...h, numRooms: parseInt(e.target.value) || 0 } : h))} className="text-center" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Double Sharing</Label>
                            <Input type="number" min={0} value={hotel.doubleSharing} onChange={e => setHotels(prev => prev.map((h, j) => j === i ? { ...h, doubleSharing: parseInt(e.target.value) || 0 } : h))} className="text-center" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Triple Sharing</Label>
                            <Input type="number" min={0} value={hotel.tripleSharing} onChange={e => setHotels(prev => prev.map((h, j) => j === i ? { ...h, tripleSharing: parseInt(e.target.value) || 0 } : h))} className="text-center" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Child No Bed</Label>
                            <Input type="number" min={0} value={hotel.childNoBed} onChange={e => setHotels(prev => prev.map((h, j) => j === i ? { ...h, childNoBed: parseInt(e.target.value) || 0 } : h))} className="text-center" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Child With Bed</Label>
                            <Input type="number" min={0} value={hotel.childWithBed} onChange={e => setHotels(prev => prev.map((h, j) => j === i ? { ...h, childWithBed: parseInt(e.target.value) || 0 } : h))} className="text-center" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Extra Bed</Label>
                            <Input type="number" min={0} value={hotel.extraBed} onChange={e => setHotels(prev => prev.map((h, j) => j === i ? { ...h, extraBed: parseInt(e.target.value) || 0 } : h))} className="text-center" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600 whitespace-nowrap">Pvt Tent</Label>
                            <Input type="number" min={0} value={hotel.privateTent} onChange={e => setHotels(prev => prev.map((h, j) => j === i ? { ...h, privateTent: parseInt(e.target.value) || 0 } : h))} className="text-center" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600 whitespace-nowrap">Shr Tent</Label>
                            <Input type="number" min={0} value={hotel.sharedTent} onChange={e => setHotels(prev => prev.map((h, j) => j === i ? { ...h, sharedTent: parseInt(e.target.value) || 0 } : h))} className="text-center" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <Label>Special Notes / Requests</Label>
                      <Textarea
                        value={hotel.specialNotes || ""}
                        onChange={e => setHotels(prev => prev.map((h, j) => j === i ? { ...h, specialNotes: e.target.value } : h))}
                        placeholder="e.g. Early check-in requested, sea-facing room preferred, extra bed required..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Meal Plan</Label>
                      <Select value={hotel.mealPlan || "MAPI"} onValueChange={v => setHotels(prev => prev.map((h, j) => j === i ? { ...h, mealPlan: v } : h))}>
                        <SelectTrigger><SelectValue placeholder="Select meal plan" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CP">CP — Breakfast Only</SelectItem>
                          <SelectItem value="MAPI">MAPI — Breakfast &amp; Dinner</SelectItem>
                          <SelectItem value="AP">AP — All Meal Plan</SelectItem>
                          <SelectItem value="EP">EP — Room Only (No Food)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Food Preference</Label>
                      <Select value={hotel.foodPreference || "__none__"} onValueChange={v => setHotels(prev => prev.map((h, j) => j === i ? { ...h, foodPreference: v === "__none__" ? "" : v } : h))}>
                        <SelectTrigger><SelectValue placeholder="Select food preference" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          <SelectItem value="Veg">Veg</SelectItem>
                          <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                          <SelectItem value="Jain">Jain</SelectItem>
                          <SelectItem value="Veg &amp; Non-Veg">Veg &amp; Non-Veg</SelectItem>
                          <SelectItem value="Combination">Combination</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Hotel Image</Label>
                      <ImageUpload value={hotel.imageUrl} onChange={url => setHotels(prev => prev.map((h, j) => j === i ? { ...h, imageUrl: url } : h))} label="Upload Hotel Photo" previewHeight={140} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full gap-2 border-dashed" onClick={() => setHotels(prev => [...prev, defaultHotel()])}>
                <Plus className="w-4 h-4" /> Add Another Hotel
              </Button>
            </div>
          </TabsContent>

          {/* ── Itinerary Days ── */}
          <TabsContent value="itinerary">
            <div className="space-y-4">
              {days.map((day, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">Day {day.dayNumber}</span>
                      <span className="text-gray-500 font-normal text-sm">{day.date}</span>
                      {day.title && <span className="text-gray-700">— {day.title}</span>}
                      <div className="ml-auto">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (days.length === 1) return; // keep at least 1 day
                            setDays(prev => prev.filter((_, j) => j !== i).map((d, idx) => ({ ...d, dayNumber: idx + 1 })));
                          }}
                          title="Delete this day"
                          disabled={days.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="ml-1 text-xs">Delete Day</span>
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Date</Label>
                      <DatePickerField
                        value={day.date}
                        onChange={val => setDays(prev => prev.map((d, j) => j === i ? { ...d, date: val } : d))}
                        placeholder="Pick a date"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label>Day Title</Label>
                        {day.transportationSegments && day.transportationSegments.length > 0 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => {
                              // Auto-generate route from transportation segments
                              const locations: string[] = [];
                              day.transportationSegments?.forEach((seg, idx) => {
                                if (idx === 0 && seg.departureLocation) {
                                  locations.push(seg.departureLocation.split(/[,\s]+/)[0]); // Get city name
                                }
                                if (seg.arrivalLocation) {
                                  locations.push(seg.arrivalLocation.split(/[,\s]+/)[0]); // Get city name
                                }
                              });
                              const uniqueLocations = Array.from(new Set(locations));
                              const route = uniqueLocations.join(" → "); // Remove duplicates and join
                              if (route) {
                                setDays(prev => prev.map((d, j) => j === i ? { ...d, title: route } : d));
                              }
                            }}
                          >
                            Auto-fill from Route
                          </Button>
                        )}
                      </div>
                      <Input value={day.title} onChange={e => setDays(prev => prev.map((d, j) => j === i ? { ...d, title: e.target.value } : d))} placeholder="e.g. Delhi → Bhubaneswar → Puri" />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Itinerary Description</Label>
                      <Textarea value={day.description} onChange={e => setDays(prev => prev.map((d, j) => j === i ? { ...d, description: e.target.value } : d))} placeholder="Describe the day's activities..." rows={5} />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Day Image</Label>
                      <ImageUpload value={day.imageUrl} onChange={url => setDays(prev => prev.map((d, j) => j === i ? { ...d, imageUrl: url } : d))} label="Upload Day Photo" previewHeight={140} />
                    </div>
                    
                    {/* Transportation Segments */}
                    <div className="col-span-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Transportation</Label>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            const newSegment: TransportationSegment = {
                              id: Date.now().toString(),
                              type: "flight",
                              departureLocation: "",
                              arrivalLocation: "",
                              departureDate: day.date,
                              departureTime: "",
                              arrivalDate: day.date,
                              arrivalTime: "",
                            };
                            setDays(prev => prev.map((d, j) => j === i ? { ...d, transportationSegments: [...(d.transportationSegments || []), newSegment] } : d));
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Transportation
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {day.transportationSegments?.map((segment, segIdx) => (
                          <TransportationCard
                            key={segment.id}
                            segment={segment}
                            onEdit={(seg) => { setEditingTransportation(seg); setEditingDayIndex(i); setEditModalOpen(true); }}
                            onDelete={() => {
                              setDays(prev => prev.map((d, j) => j === i ? { ...d, transportationSegments: (d.transportationSegments || []).filter((_, k) => k !== segIdx) } : d));
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Add Day Button */}
              <Button
                type="button"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  const newDayNumber = days.length + 1;
                  const lastDay = days[days.length - 1];
                  let nextDate = "";
                  if (lastDay?.date) {
                    try {
                      const lastDate = new Date(lastDay.date);
                      const nextDateObj = new Date(lastDate);
                      nextDateObj.setDate(nextDateObj.getDate() + 1);
                      nextDate = nextDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
                    } catch (e) {
                      nextDate = "";
                    }
                  }
                  setDays(prev => [...prev, defaultDay(newDayNumber)]);
                  setMealPlans(prev => [...prev, defaultMeal(newDayNumber)]);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Day
              </Button>
            </div>
          </TabsContent>

          {/* ── Meal Plan ── */}
          <TabsContent value="meals">
            <Card>
              <CardHeader><CardTitle className="text-base">Meal Plan Configuration</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Day</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Date</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Breakfast</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Breakfast Type</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Lunch</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Lunch Type</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Dinner</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Dinner Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mealPlans.map((meal, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-3 px-2">
                            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Day {meal.dayNumber}</span>
                          </td>
                          <td className="py-3 px-2 min-w-[180px]">
                            <DatePickerField
                              value={meal.date}
                              onChange={val => {
                                // Convert from "Apr 02, 2026" (DatePickerField output) to "02 April 2026" (meal format)
                                let formatted = val;
                                if (val) {
                                  const d = new Date(val);
                                  if (!isNaN(d.getTime())) {
                                    formatted = `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`;
                                  }
                                }
                                setMealPlans(prev => prev.map((m, j) => j === i ? { ...m, date: formatted } : m));
                              }}
                              placeholder="Pick a date"
                              className="h-8 text-sm"
                            />
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Input type="number" min={0} max={9} value={meal.breakfast} onChange={e => setMealPlans(prev => prev.map((m, j) => j === i ? { ...m, breakfast: parseInt(e.target.value) || 0 } : m))} className="h-8 text-center w-16 mx-auto" />
                          </td>
                          <td className="py-3 px-2 text-center min-w-[180px]">
                            <Select value={meal.breakfastType || "none"} onValueChange={val => setMealPlans(prev => prev.map((m, j) => j === i ? { ...m, breakfastType: val === "none" ? "" : val } : m))}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="— Type —" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">— None —</SelectItem>
                                {FOOD_TYPES.map(ft => <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Input type="number" min={0} max={9} value={meal.lunch} onChange={e => setMealPlans(prev => prev.map((m, j) => j === i ? { ...m, lunch: parseInt(e.target.value) || 0 } : m))} className="h-8 text-center w-16 mx-auto" />
                          </td>
                          <td className="py-3 px-2 text-center min-w-[180px]">
                            <Select value={meal.lunchType || "none"} onValueChange={val => setMealPlans(prev => prev.map((m, j) => j === i ? { ...m, lunchType: val === "none" ? "" : val } : m))}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="— Type —" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">— None —</SelectItem>
                                {FOOD_TYPES.map(ft => <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Input type="number" min={0} max={9} value={meal.dinner} onChange={e => setMealPlans(prev => prev.map((m, j) => j === i ? { ...m, dinner: parseInt(e.target.value) || 0 } : m))} className="h-8 text-center w-16 mx-auto" />
                          </td>
                          <td className="py-3 px-2 text-center min-w-[180px]">
                            <Select value={meal.dinnerType || "none"} onValueChange={val => setMealPlans(prev => prev.map((m, j) => j === i ? { ...m, dinnerType: val === "none" ? "" : val } : m))}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="— Type —" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">— None —</SelectItem>
                                {FOOD_TYPES.map(ft => <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-400 mt-3">Enter 1 for included, 0 for not included per meal per day. Dates are auto-filled from the Start Date on the Cover tab.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Inclusions / Exclusions ── */}
          <TabsContent value="inclusions">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base text-green-700">✓ Inclusions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {inclusions.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={item} onChange={e => setInclusions(prev => prev.map((v, j) => j === i ? e.target.value : v))} placeholder="e.g. 1 Night stay at 3-Star Hotel" />
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 flex-shrink-0" onClick={() => setInclusions(prev => prev.filter((_, j) => j !== i))}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full gap-2 border-dashed mt-2" onClick={() => setInclusions(prev => [...prev, ""])}>
                    <Plus className="w-4 h-4" /> Add Inclusion
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base text-red-700">✗ Exclusions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {exclusions.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={item} onChange={e => setExclusions(prev => prev.map((v, j) => j === i ? e.target.value : v))} placeholder="e.g. Air Ticket" />
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 flex-shrink-0" onClick={() => setExclusions(prev => prev.filter((_, j) => j !== i))}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full gap-2 border-dashed mt-2" onClick={() => setExclusions(prev => [...prev, ""])}>
                    <Plus className="w-4 h-4" /> Add Exclusion
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Terms ── */}
          <TabsContent value="terms">
            <Card>
              <CardHeader><CardTitle className="text-base">📋 Notes & Terms and Conditions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {termsLines.map((item, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="mt-2 text-gray-400 text-xs font-bold flex-shrink-0 w-5 text-right">{i + 1}.</span>
                    <Input value={item} onChange={e => setTermsLines(prev => prev.map((v, j) => j === i ? e.target.value : v))} placeholder="e.g. Tour packages are non-refundable." />
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 flex-shrink-0" onClick={() => setTermsLines(prev => prev.filter((_, j) => j !== i))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-2 border-dashed mt-2" onClick={() => setTermsLines(prev => [...prev, ""])}>
                  <Plus className="w-4 h-4" /> Add Term / Note
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Transportation Edit Modal */}
        <TransportationEditModal
          segment={editingTransportation}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingTransportation(null);
            setEditingDayIndex(null);
          }}
          onSave={(updatedSegment) => {
            if (editingDayIndex !== null) {
              setDays(prev => prev.map((d, j) => {
                if (j === editingDayIndex) {
                  return {
                    ...d,
                    transportationSegments: (d.transportationSegments || []).map(seg =>
                      seg.id === updatedSegment.id ? updatedSegment : seg
                    ),
                  };
                }
                return d;
              }));
            }
          }}
        />

        {/* Bottom save bar */}
        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={() => navigate("/")}>Cancel</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isNew ? "Create Itinerary" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

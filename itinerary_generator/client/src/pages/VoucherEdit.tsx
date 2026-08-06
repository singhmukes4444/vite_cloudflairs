import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, ArrowLeft, Plus, Trash2, Eye, Hotel, FileText, Upload, X } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";

type GuestEntry = { name: string; category: string };

const MEAL_PLANS = ["CP", "MAPI", "AP", "EP"];
const FOOD_PREFS = ["Veg", "Non-Veg", "Jain", "Veg & Non-Veg", "Combination"];
const ROOM_TYPES = ["Deluxe Room", "Super Deluxe Room", "Suite", "Junior Suite", "Executive Room", "Standard Room", "Premium Room", "Cottage", "Villa", "Other"];
const STAR_RATINGS = [1, 2, 3, 4, 5];
const GUEST_CATEGORIES = ["Adult", "Child (with bed)", "Child (no bed)", "Infant"];

const DEFAULT_INCLUSIONS = [
  "Accommodation as per the itinerary",
  "Breakfast as per meal plan",
  "All taxes and service charges",
];

function emptyForm() {
  return {
    bookingRef: "",
    bookingDate: new Date().toISOString().split("T")[0],
    guestName: "",
    guestList: [] as GuestEntry[],
    numGuests: 1,
    hotelName: "",
    hotelAddress: "",
    hotelPhone: "",
    hotelEmail: "",
    starRating: 3,
    hotelImageUrl: "",
    checkInDate: "",
    checkInTime: "02:00 PM",
    checkOutDate: "",
    checkOutTime: "12:00 PM",
    numNights: 1,
    roomType: "Deluxe Room",
    numRooms: 1,
    doubleSharing: 0,
    tripleSharing: 0,
    childNoBed: 0,
    childWithBed: 0,
    extraBed: 0,
    mealPlan: "CP",
    foodPreference: "Veg",
    inclusions: [...DEFAULT_INCLUSIONS],
    specialRequests: "",
    hotelConfirmationNo: "",
    agentName: "",
    agentPhone: "",
    status: "draft" as "draft" | "confirmed",
    earlyCheckIn: false,
    lateCheckOut: false,
  };
}

export default function VoucherEdit() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const isNew = !params.id;
  const voucherId = params.id ? parseInt(params.id) : undefined;

  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [newInclusion, setNewInclusion] = useState("");
  const [newGuest, setNewGuest] = useState<GuestEntry>({ name: "", category: "Adult" });
  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      set("hotelImageUrl", url);
      toast.success("Hotel image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  const { data: existing, isLoading: loadingExisting } = trpc.voucher.get.useQuery(
    { id: voucherId! },
    { enabled: !isNew && !!voucherId }
  );

  useEffect(() => {
    if (existing) {
      setForm({
        bookingRef: existing.bookingRef ?? "",
        bookingDate: existing.bookingDate ?? "",
        guestName: existing.guestName ?? "",
        guestList: (existing.guestList as GuestEntry[]) ?? [],
        numGuests: existing.numGuests ?? 1,
        hotelName: existing.hotelName ?? "",
        hotelAddress: existing.hotelAddress ?? "",
        hotelPhone: existing.hotelPhone ?? "",
        hotelEmail: existing.hotelEmail ?? "",
        starRating: existing.starRating ?? 3,
        hotelImageUrl: existing.hotelImageUrl ?? "",
        checkInDate: existing.checkInDate ?? "",
        checkInTime: existing.checkInTime ?? "02:00 PM",
        checkOutDate: existing.checkOutDate ?? "",
        checkOutTime: existing.checkOutTime ?? "12:00 PM",
        numNights: existing.numNights ?? 1,
        roomType: existing.roomType ?? "Deluxe Room",
        numRooms: existing.numRooms ?? 1,
        doubleSharing: existing.doubleSharing ?? 0,
        tripleSharing: existing.tripleSharing ?? 0,
        childNoBed: existing.childNoBed ?? 0,
        childWithBed: existing.childWithBed ?? 0,
        extraBed: existing.extraBed ?? 0,
        mealPlan: existing.mealPlan ?? "CP",
        foodPreference: existing.foodPreference ?? "Veg",
        inclusions: (existing.inclusions as string[]) ?? [...DEFAULT_INCLUSIONS],
        specialRequests: existing.specialRequests ?? "",
        hotelConfirmationNo: existing.hotelConfirmationNo ?? "",
        agentName: existing.agentName ?? "",
        agentPhone: existing.agentPhone ?? "",
        status: (existing.status as "draft" | "confirmed") ?? "draft",
        earlyCheckIn: (existing as any).earlyCheckIn ?? false,
        lateCheckOut: (existing as any).lateCheckOut ?? false,
      });
    }
  }, [existing]);

  // Auto-calculate nights when check-in or check-out date changes
  const calcNights = useCallback((checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0) setForm(prev => ({ ...prev, numNights: diff }));
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const createMutation = trpc.voucher.create.useMutation({
    onSuccess: (data) => {
      setSaving(false);
      toast.success("Voucher created!");
      if (data?.id) navigate(`/voucher/${data.id}/edit`);
    },
    onError: (e) => { setSaving(false); toast.error(e.message); },
  });

  const updateMutation = trpc.voucher.update.useMutation({
    onSuccess: () => { setSaving(false); toast.success("Voucher saved!"); },
    onError: (e) => { setSaving(false); toast.error(e.message); },
  });

  function handleSave() {
    if (!form.hotelName.trim()) { toast.error("Hotel name is required"); return; }
    setSaving(true);
    const payload = {
      ...form,
      hotelAddress: form.hotelAddress || null,
      hotelImageUrl: form.hotelImageUrl || null,
      specialRequests: form.specialRequests || null,
      earlyCheckIn: form.earlyCheckIn ? 1 : 0,
      lateCheckOut: form.lateCheckOut ? 1 : 0,
    };
    if (isNew) {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate({ id: voucherId!, data: payload });
    }
  }

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function addGuest() {
    if (!newGuest.name.trim()) return;
    set("guestList", [...form.guestList, { ...newGuest }]);
    setNewGuest({ name: "", category: "Adult" });
  }

  function removeGuest(idx: number) {
    set("guestList", form.guestList.filter((_, i) => i !== idx));
  }

  function addInclusion() {
    if (!newInclusion.trim()) return;
    set("inclusions", [...form.inclusions, newInclusion.trim()]);
    setNewInclusion("");
  }

  function removeInclusion(idx: number) {
    set("inclusions", form.inclusions.filter((_, i) => i !== idx));
  }

  if (loading || (!isNew && loadingExisting)) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-red-600" /></div>;
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
          <button
            onClick={() => navigate("/vouchers")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium w-full text-left">
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
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/vouchers")} className="gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                {isNew ? "New Hotel Voucher" : "Edit Hotel Voucher"}
              </h1>
            </div>
            <div className="flex gap-2">
              {!isNew && (
                <Button variant="outline" className="gap-1.5" onClick={() => navigate(`/voucher/${voucherId}/preview`)}>
                  <Eye className="w-4 h-4" /> Preview
                </Button>
              )}
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-1.5" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Voucher
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Booking Reference */}
            <Card>
              <CardHeader><CardTitle className="text-base">Booking Reference</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Booking Ref / Voucher No</Label>
                  <Input value={form.bookingRef} onChange={e => set("bookingRef", e.target.value)} placeholder="e.g. PKM-2026-001" className="mt-1" />
                </div>
                <div>
                  <Label>Booking Date</Label>
                  <Input type="date" value={form.bookingDate} min={today} onChange={e => set("bookingDate", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => set("status", v as "draft" | "confirmed")}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Hotel Confirmation No</Label>
                  <Input value={form.hotelConfirmationNo} onChange={e => set("hotelConfirmationNo", e.target.value)} placeholder="Hotel's confirmation number" className="mt-1" />
                </div>
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card>
              <CardHeader><CardTitle className="text-base">Guest Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Lead Guest Name</Label>
                    <Input value={form.guestName} onChange={e => set("guestName", e.target.value)} placeholder="Mr. / Mrs. Full Name" className="mt-1" />
                  </div>
                  <div>
                    <Label>Total Guests</Label>
                    <Input type="number" min={1} value={form.numGuests} onChange={e => set("numGuests", parseInt(e.target.value) || 1)} className="mt-1" />
                  </div>
                </div>
                {/* Guest list */}
                <div>
                  <Label className="mb-2 block">Guest List</Label>
                  {form.guestList.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <span className="flex-1 text-sm bg-gray-50 border rounded px-3 py-2">{g.name} <span className="text-gray-400">({g.category})</span></span>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600" onClick={() => removeGuest(i)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <Input value={newGuest.name} onChange={e => setNewGuest(g => ({ ...g, name: e.target.value }))} placeholder="Guest name" className="flex-1" />
                    <Select value={newGuest.category} onValueChange={v => setNewGuest(g => ({ ...g, category: v }))}>
                      <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {GUEST_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={addGuest} className="gap-1"><Plus className="w-4 h-4" /> Add</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hotel Details */}
            <Card>
              <CardHeader><CardTitle className="text-base">Hotel Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Hotel Name <span className="text-red-500">*</span></Label>
                    <Input value={form.hotelName} onChange={e => set("hotelName", e.target.value)} placeholder="e.g. The Taj Mahal Palace" className="mt-1" />
                  </div>
                  <div>
                    <Label>Star Rating</Label>
                    <Select value={String(form.starRating)} onValueChange={v => set("starRating", parseInt(v))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STAR_RATINGS.map(s => <SelectItem key={s} value={String(s)}>{s} Star</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Hotel Phone</Label>
                    <Input value={form.hotelPhone} onChange={e => set("hotelPhone", e.target.value)} placeholder="+91 XXXXX XXXXX" className="mt-1" />
                  </div>
                  <div>
                    <Label>Hotel Email</Label>
                    <Input value={form.hotelEmail} onChange={e => set("hotelEmail", e.target.value)} placeholder="reservations@hotel.com" className="mt-1" />
                  </div>
                  <div>
                    <Label>Hotel Image</Label>
                    <div className="mt-1 space-y-2">
                      {form.hotelImageUrl ? (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border bg-gray-50">
                          <img src={form.hotelImageUrl} alt="Hotel" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => set("hotelImageUrl", "")}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50 border">
                            <X className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors">
                          {uploadingImage ? (
                            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-gray-400 mb-1" />
                              <span className="text-xs text-gray-500">Click to upload hotel image</span>
                              <span className="text-xs text-gray-400">JPG, PNG up to 5MB</span>
                            </>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label>Hotel Address</Label>
                    <Textarea value={form.hotelAddress} onChange={e => set("hotelAddress", e.target.value)} placeholder="Full hotel address" rows={2} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stay Details */}
            <Card>
              <CardHeader><CardTitle className="text-base">Stay Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Check-In Date</Label>
                  <Input
                    type="date"
                    value={form.checkInDate}
                    min={today}
                    onChange={e => {
                      const val = e.target.value;
                      setForm(prev => {
                        const updated = { ...prev, checkInDate: val };
                        // auto-recalc nights
                        if (val && prev.checkOutDate) {
                          const diff = Math.round((new Date(prev.checkOutDate).getTime() - new Date(val).getTime()) / 86400000);
                          if (diff > 0) updated.numNights = diff;
                        }
                        return updated;
                      });
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Check-In Time</Label>
                  <Input value={form.checkInTime} onChange={e => set("checkInTime", e.target.value)} placeholder="02:00 PM" className="mt-1" />
                </div>
                <div>
                  <Label>Check-Out Date</Label>
                  <Input
                    type="date"
                    value={form.checkOutDate}
                    min={form.checkInDate || today}
                    onChange={e => {
                      const val = e.target.value;
                      setForm(prev => {
                        const updated = { ...prev, checkOutDate: val };
                        if (prev.checkInDate && val) {
                          const diff = Math.round((new Date(val).getTime() - new Date(prev.checkInDate).getTime()) / 86400000);
                          if (diff > 0) updated.numNights = diff;
                        }
                        return updated;
                      });
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Check-Out Time</Label>
                  <Input value={form.checkOutTime} onChange={e => set("checkOutTime", e.target.value)} placeholder="12:00 PM" className="mt-1" />
                </div>
                <div>
                  <Label>Number of Nights</Label>
                  <Input type="number" min={1} value={form.numNights} readOnly className="mt-1 bg-gray-50 cursor-default" />
                </div>
                {/* Early Check-In / Late Check-Out */}
                <div className="col-span-2">
                  <div className="flex gap-6 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.earlyCheckIn}
                        onChange={e => set("earlyCheckIn", e.target.checked)}
                        className="w-4 h-4 accent-red-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Early Check-In
                        <span className="ml-1 text-xs text-gray-400 font-normal">(If Available)</span>
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.lateCheckOut}
                        onChange={e => set("lateCheckOut", e.target.checked)}
                        className="w-4 h-4 accent-red-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Late Check-Out
                        <span className="ml-1 text-xs text-gray-400 font-normal">(If Available)</span>
                      </span>
                    </label>
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Details */}
            <Card>
              <CardHeader><CardTitle className="text-base">Room Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Room Type</Label>
                    <Select value={form.roomType} onValueChange={v => set("roomType", v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROOM_TYPES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Number of Rooms</Label>
                    <Input type="number" min={1} value={form.numRooms} onChange={e => set("numRooms", parseInt(e.target.value) || 1)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Double Sharing</Label>
                    <Input type="number" min={0} value={form.doubleSharing} onChange={e => set("doubleSharing", parseInt(e.target.value) || 0)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Triple Sharing</Label>
                    <Input type="number" min={0} value={form.tripleSharing} onChange={e => set("tripleSharing", parseInt(e.target.value) || 0)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Child (No Bed)</Label>
                    <Input type="number" min={0} value={form.childNoBed} onChange={e => set("childNoBed", parseInt(e.target.value) || 0)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Child (With Bed)</Label>
                    <Input type="number" min={0} value={form.childWithBed} onChange={e => set("childWithBed", parseInt(e.target.value) || 0)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Extra Bed</Label>
                    <Input type="number" min={0} value={form.extraBed} onChange={e => set("extraBed", parseInt(e.target.value) || 0)} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meal & Food */}
            <Card>
              <CardHeader><CardTitle className="text-base">Meal Plan & Food Preference</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Meal Plan</Label>
                  <Select value={form.mealPlan} onValueChange={v => set("mealPlan", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MEAL_PLANS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Food Preference</Label>
                  <Select value={form.foodPreference} onValueChange={v => set("foodPreference", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FOOD_PREFS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Inclusions */}
            <Card>
              <CardHeader><CardTitle className="text-base">Inclusions</CardTitle></CardHeader>
              <CardContent>
                {form.inclusions.map((inc, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <span className="flex-1 text-sm bg-gray-50 border rounded px-3 py-2">{inc}</span>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600" onClick={() => removeInclusion(i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <Input value={newInclusion} onChange={e => setNewInclusion(e.target.value)} placeholder="Add inclusion..." className="flex-1"
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addInclusion(); } }} />
                  <Button variant="outline" onClick={addInclusion} className="gap-1"><Plus className="w-4 h-4" /> Add</Button>
                </div>
              </CardContent>
            </Card>

            {/* Special Requests & Agent */}
            <Card>
              <CardHeader><CardTitle className="text-base">Special Requests & Agent Info</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Special Requests / Notes</Label>
                  <Textarea value={form.specialRequests} onChange={e => set("specialRequests", e.target.value)} placeholder="Any special requests for the hotel..." rows={3} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Agent / Consultant Name</Label>
                    <Input value={form.agentName} onChange={e => set("agentName", e.target.value)} placeholder="Agent name" className="mt-1" />
                  </div>
                  <div>
                    <Label>Agent Phone</Label>
                    <Input value={form.agentPhone} onChange={e => set("agentPhone", e.target.value)} placeholder="+91 XXXXX XXXXX" className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save button at bottom */}
            <div className="flex justify-end gap-2 pb-8">
              {!isNew && (
                <Button variant="outline" className="gap-1.5" onClick={() => navigate(`/voucher/${voucherId}/preview`)}>
                  <Eye className="w-4 h-4" /> Preview
                </Button>
              )}
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-1.5" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Voucher
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

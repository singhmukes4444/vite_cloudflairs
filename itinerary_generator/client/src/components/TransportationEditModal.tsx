import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransportationSegment } from "./TransportationCard";
import { Plane, Train, Car, Bus } from "lucide-react";

interface TransportationEditModalProps {
  segment: TransportationSegment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (segment: TransportationSegment) => void;
}

export function TransportationEditModal({
  segment,
  isOpen,
  onClose,
  onSave,
}: TransportationEditModalProps) {
  const [formData, setFormData] = useState<TransportationSegment>({
    id: "",
    type: "flight",
    departureLocation: "",
    arrivalLocation: "",
    departureDate: "",
    departureTime: "",
    arrivalDate: "",
    arrivalTime: "",
  });

  // Normalize segment data to use form field names (departure/arrival)
  const normalizeSegment = (seg: TransportationSegment | null): TransportationSegment => {
    if (!seg) {
      return {
        id: "",
        type: "flight",
        departureLocation: "",
        arrivalLocation: "",
        departureDate: "",
        departureTime: "",
        arrivalDate: "",
        arrivalTime: "",
      };
    }

    return {
      ...seg,
      // Map database field names to form field names
      departureLocation: seg.departureLocation || seg.originLocation || "",
      arrivalLocation: seg.arrivalLocation || seg.destinationLocation || "",
      departureDate: seg.departureDate || seg.originDate || "",
      departureTime: seg.departureTime || seg.originTime || "",
      arrivalDate: seg.arrivalDate || seg.destinationDate || "",
      arrivalTime: seg.arrivalTime || seg.destinationTime || "",
      // Preserve optional fields
      flightNumber: seg.flightNumber || "",
      airline: seg.airline || "",
      trainNumber: seg.trainNumber || "",
      trainName: seg.trainName || "",
      vehicleType: seg.vehicleType || "",
      vehicleNumber: seg.vehicleNumber || "",
      bookingReference: seg.bookingReference || "",
      notes: seg.notes || "",
    };
  };

  // Denormalize form data back to database field names for saving
  const denormalizeSegment = (data: TransportationSegment): TransportationSegment => {
    // Extract only the fields we need, excluding form field names
    const result: any = {
      id: data.id,
      type: data.type,
      originLocation: data.departureLocation || "",
      originDate: data.departureDate || "",
      originTime: data.departureTime || "",
      destinationLocation: data.arrivalLocation || "",
      destinationDate: data.arrivalDate || "",
      destinationTime: data.arrivalTime || "",
    };
    
    // Add optional fields if they exist
    if (data.flightNumber) result.flightNumber = data.flightNumber;
    if (data.airline) result.airline = data.airline;
    if (data.trainNumber) result.trainNumber = data.trainNumber;
    if (data.trainName) result.trainName = data.trainName;
    if (data.vehicleType) result.vehicleType = data.vehicleType;
    if (data.vehicleNumber) result.vehicleNumber = data.vehicleNumber;
    if (data.bookingReference) result.bookingReference = data.bookingReference;
    if (data.notes) result.notes = data.notes;
    
    return result as TransportationSegment;
  };

  // Sync formData when segment prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const normalized = normalizeSegment(segment);
      setFormData(normalized);
    }
  }, [segment, isOpen]);

  const handleSave = () => {
    // Don't denormalize here - keep form field names so parent can denormalize once
    onSave(formData);
    onClose();
  };

  const handleTypeChange = (newType: string) => {
    setFormData(prev => ({
      ...prev,
      type: newType as "flight" | "train" | "taxi" | "bus",
      // Clear type-specific fields when changing type
      airline: undefined,
      flightNumber: undefined,
      trainName: undefined,
      trainNumber: undefined,
      vehicleType: undefined,
      vehicleNumber: undefined,
    }));
  };

  const getTypeIcon = () => {
    switch (formData.type) {
      case "flight":
        return <Plane className="w-4 h-4" />;
      case "train":
        return <Train className="w-4 h-4" />;
      case "taxi":
        return <Car className="w-4 h-4" />;
      case "bus":
        return <Bus className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Transportation Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transportation Type Selector */}
          <div className="space-y-2">
            <Label>Transportation Type</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon()}
                  <SelectValue placeholder="Select transportation type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flight" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4" />
                    Flight
                  </div>
                </SelectItem>
                <SelectItem value="train" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Train className="w-4 h-4" />
                    Train
                  </div>
                </SelectItem>
                <SelectItem value="taxi" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Taxi
                  </div>
                </SelectItem>
                <SelectItem value="bus" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4" />
                    Bus
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Origin Section */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm">Origin</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Departure Location</Label>
                <Input
                  value={formData.departureLocation || ""}
                  onChange={e => setFormData(prev => ({ ...prev, departureLocation: e.target.value }))}
                  placeholder="e.g., Delhi International Airport"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Departure Time</Label>
                <Input
                  type="time"
                  value={formData.departureTime || ""}
                  onChange={e => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Departure Date</Label>
                <Input
                  type="date"
                  value={formData.departureDate || ""}
                  onChange={e => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Destination Section */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm">Destination</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Arrival Location</Label>
                <Input
                  value={formData.arrivalLocation || ""}
                  onChange={e => setFormData(prev => ({ ...prev, arrivalLocation: e.target.value }))}
                  placeholder="e.g., Jammu Airport"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Arrival Time</Label>
                <Input
                  type="time"
                  value={formData.arrivalTime || ""}
                  onChange={e => setFormData(prev => ({ ...prev, arrivalTime: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Arrival Date</Label>
                <Input
                  type="date"
                  value={formData.arrivalDate || ""}
                  onChange={e => setFormData(prev => ({ ...prev, arrivalDate: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Type-specific fields */}
          {formData.type === "flight" && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-sm">Flight Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Airline</Label>
                  <Input
                    value={formData.airline || ""}
                    onChange={e => setFormData(prev => ({ ...prev, airline: e.target.value }))}
                    placeholder="e.g., Indigo"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Flight Number</Label>
                  <Input
                    value={formData.flightNumber || ""}
                    onChange={e => setFormData(prev => ({ ...prev, flightNumber: e.target.value }))}
                    placeholder="e.g., 6E 6887"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === "train" && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-sm">Train Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Train Name</Label>
                  <Input
                    value={formData.trainName || ""}
                    onChange={e => setFormData(prev => ({ ...prev, trainName: e.target.value }))}
                    placeholder="e.g., Rajdhani Express"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Train Number</Label>
                  <Input
                    value={formData.trainNumber || ""}
                    onChange={e => setFormData(prev => ({ ...prev, trainNumber: e.target.value }))}
                    placeholder="e.g., 12001"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === "taxi" && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-sm">Car Details</h3>
              <div className="space-y-1">
                <Label className="text-xs">Car Type</Label>
                <Input
                  value={formData.vehicleType || ""}
                  onChange={e => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                  placeholder="e.g., Sedan, SUV"
                />
              </div>
            </div>
          )}

          {formData.type === "bus" && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-sm">Bus Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Bus Operator</Label>
                  <Input
                    value={formData.vehicleNumber || ""}
                    onChange={e => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                    placeholder="e.g., Volvo Buses"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Bus Number</Label>
                  <Input
                    value={formData.vehicleType || ""}
                    onChange={e => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                    placeholder="e.g., VB-1234"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Common fields */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm">Additional Information</h3>
            <div className="space-y-1">
              <Label className="text-xs">Booking Reference</Label>
              <Input
                value={formData.bookingReference || ""}
                onChange={e => setFormData(prev => ({ ...prev, bookingReference: e.target.value }))}
                placeholder="e.g., BK123456"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={formData.notes || ""}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

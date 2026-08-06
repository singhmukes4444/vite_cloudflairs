import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { TransportationSegment } from "./TransportationCard";

interface TransportationFormProps {
  segment?: TransportationSegment;
  onSave: (segment: TransportationSegment) => void;
  onCancel: () => void;
}

export function TransportationForm({
  segment,
  onSave,
  onCancel,
}: TransportationFormProps) {
  const [type, setType] = useState<"flight" | "train" | "taxi" | "bus" | "car" | "ship" | "other">(
    (segment?.type as any) || "flight"
  );
  const [departureLocation, setDepartureLocation] = useState(
    segment?.departureLocation || ""
  );
  const [arrivalLocation, setArrivalLocation] = useState(
    segment?.arrivalLocation || ""
  );
  const [departureDate, setDepartureDate] = useState(
    segment?.departureDate || ""
  );
  const [departureTime, setDepartureTime] = useState(
    segment?.departureTime || ""
  );
  const [arrivalDate, setArrivalDate] = useState(segment?.arrivalDate || "");
  const [arrivalTime, setArrivalTime] = useState(segment?.arrivalTime || "");
  const [flightNumber, setFlightNumber] = useState(segment?.flightNumber || "");
  const [airline, setAirline] = useState(segment?.airline || "");
  const [trainNumber, setTrainNumber] = useState(segment?.trainNumber || "");
  const [trainName, setTrainName] = useState(segment?.trainName || "");
  const [taxiType, setTaxiType] = useState(segment?.taxiType || "");
  const [busOperator, setBusOperator] = useState(segment?.busOperator || "");
  const [busNumber, setBusNumber] = useState(segment?.busNumber || "");
  const [bookingReference, setBookingReference] = useState(
    segment?.bookingReference || ""
  );
  const [notes, setNotes] = useState(segment?.notes || "");

  const handleSave = () => {
    const newSegment: TransportationSegment = {
      id: segment?.id || Date.now().toString(),
      type,
      departureLocation,
      arrivalLocation,
      departureDate,
      departureTime,
      arrivalDate,
      arrivalTime,
      flightNumber: type === "flight" ? flightNumber : undefined,
      airline: type === "flight" ? airline : undefined,
      trainNumber: type === "train" ? trainNumber : undefined,
      trainName: type === "train" ? trainName : undefined,
      taxiType: type === "taxi" ? taxiType : undefined,
      busOperator: type === "bus" ? busOperator : undefined,
      busNumber: type === "bus" ? busNumber : undefined,
      bookingReference,
      notes,
    };
    onSave(newSegment);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {segment ? "Edit Transportation" : "Add Transportation"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Transportation Type */}
      <div>
        <Label htmlFor="type">Transportation Type</Label>
        <Select value={type} onValueChange={(v: any) => setType(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flight">Flight</SelectItem>
            <SelectItem value="train">Train</SelectItem>
            <SelectItem value="taxi">Car / Taxi</SelectItem>
            <SelectItem value="bus">Bus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Origin & Destination */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="departureLocation">Departure Location</Label>
          <Input
            id="departureLocation"
            value={departureLocation}
            onChange={(e) => setDepartureLocation(e.target.value)}
            placeholder="e.g., Delhi Airport"
          />
        </div>
        <div>
          <Label htmlFor="arrivalLocation">Arrival Location</Label>
          <Input
            id="arrivalLocation"
            value={arrivalLocation}
            onChange={(e) => setArrivalLocation(e.target.value)}
            placeholder="e.g., Mumbai Airport"
          />
        </div>
      </div>

      {/* Dates & Times */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="departureDate">Departure Date</Label>
          <Input
            id="departureDate"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="departureTime">Departure Time</Label>
          <Input
            id="departureTime"
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="arrivalDate">Arrival Date</Label>
          <Input
            id="arrivalDate"
            type="date"
            value={arrivalDate}
            onChange={(e) => setArrivalDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="arrivalTime">Arrival Time</Label>
          <Input
            id="arrivalTime"
            type="time"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
          />
        </div>
      </div>

      {/* Transport-specific fields */}
      {type === "flight" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="airline">Airline</Label>
            <Input
              id="airline"
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              placeholder="e.g., Indigo"
            />
          </div>
          <div>
            <Label htmlFor="flightNumber">Flight Number</Label>
            <Input
              id="flightNumber"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              placeholder="e.g., 6E 6887"
            />
          </div>
        </div>
      )}

      {type === "train" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="trainName">Train Name</Label>
            <Input
              id="trainName"
              value={trainName}
              onChange={(e) => setTrainName(e.target.value)}
              placeholder="e.g., Rajdhani Express"
            />
          </div>
          <div>
            <Label htmlFor="trainNumber">Train Number</Label>
            <Input
              id="trainNumber"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              placeholder="e.g., 12001"
            />
          </div>
        </div>
      )}

      {type === "taxi" && (
        <div>
          <Label htmlFor="taxiType">Vehicle Type</Label>
          <Input
            id="taxiType"
            value={taxiType}
            onChange={(e) => setTaxiType(e.target.value)}
            placeholder="e.g., Sedan, SUV, Luxury Car"
          />
        </div>
      )}

      {type === "bus" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="busOperator">Bus Operator</Label>
            <Input
              id="busOperator"
              value={busOperator}
              onChange={(e) => setBusOperator(e.target.value)}
              placeholder="e.g., Volvo, Luxury Coach"
            />
          </div>
          <div>
            <Label htmlFor="busNumber">Bus Number</Label>
            <Input
              id="busNumber"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              placeholder="e.g., Route 101"
            />
          </div>
        </div>
      )}

      {/* Booking Reference */}
      <div>
        <Label htmlFor="bookingReference">Booking Reference</Label>
        <Input
          id="bookingReference"
          value={bookingReference}
          onChange={(e) => setBookingReference(e.target.value)}
          placeholder="e.g., BK123456"
        />
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional information..."
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
          {segment ? "Update" : "Add"} Transportation
        </Button>
      </div>
    </div>
  );
}

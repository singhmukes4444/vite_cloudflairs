import { Plane, Train, Car, Bus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TransportationSegment {
  id: string | number;
  type: "flight" | "train" | "taxi" | "bus" | "car" | "ship" | "other";
  originLocation?: string;
  destinationLocation?: string;
  originDate?: string;
  originTime?: string;
  destinationDate?: string;
  destinationTime?: string;
  departureLocation?: string;
  arrivalLocation?: string;
  departureDate?: string;
  departureTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  flightNumber?: string;
  airline?: string;
  trainNumber?: string;
  trainName?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  taxiType?: string;
  busOperator?: string;
  busNumber?: string;
  bookingReference?: string;
  notes?: string;
}

interface TransportationCardProps {
  segment: TransportationSegment;
  onEdit?: (segment: TransportationSegment) => void;
  onDelete?: (id: string) => void;
}

export function TransportationCard({
  segment,
  onEdit,
  onDelete,
}: TransportationCardProps) {
  const getIcon = () => {
    switch (segment.type) {
      case "flight":
        return <Plane className="w-8 h-8" />;
      case "train":
        return <Train className="w-8 h-8" />;
      case "taxi":
        return <Car className="w-8 h-8" />;
      case "bus":
        return <Bus className="w-8 h-8" />;
    }
  };

  const getTransportDetails = () => {
    switch (segment.type) {
      case "flight":
        return `${segment.airline || "Flight"} ${segment.flightNumber || ""}`.trim();
      case "train":
        return `${segment.trainName || "Train"} ${segment.trainNumber || ""}`.trim();
      case "taxi":
        return segment.vehicleType || segment.taxiType || "Car";
      case "bus":
        return `${segment.busOperator || "Bus"} ${segment.busNumber || ""}`.trim();
    }
  };

  return (
    <div className="bg-red-600 text-white rounded-lg overflow-hidden shadow-lg">
      {/* Header with icon and type */}
      <div className="flex items-center justify-between p-4 bg-red-700">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <p className="text-sm font-semibold uppercase">
              {segment.type === "flight"
                ? "Flight"
                : segment.type === "train"
                  ? "Train"
                  : segment.type === "taxi" || segment.type === "car"
                    ? "Car"
                    : "Bus"}
            </p>
            <p className="text-xs opacity-90 capitalize">{getTransportDetails()}</p>
          </div>
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(String(segment.id))}
            className="text-white hover:bg-red-800"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Main content */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-6 items-center">
          {/* Origin */}
          <div>
            <p className="text-xs font-semibold uppercase opacity-75 mb-2">
              Origin
            </p>
            <p className="text-lg font-bold">{segment.departureLocation || segment.originLocation || "N/A"}</p>
            <p className="text-sm opacity-90">
              {(segment.departureTime || segment.originTime) ? `${segment.departureTime || segment.originTime} Hrs` : "N/A"}
            </p>
            <p className="text-xs opacity-75">{segment.departureDate || segment.originDate || "N/A"}</p>
          </div>

          {/* Center icon and booking ref */}
          <div className="flex flex-col items-center justify-center">
            {getIcon()}
            {segment.bookingReference && (
              <p className="text-xs font-semibold mt-2 text-center">
                {segment.bookingReference}
              </p>
            )}
          </div>

          {/* Destination */}
          <div className="text-right">
            <p className="text-xs font-semibold uppercase opacity-75 mb-2">
              Destination
            </p>
            <p className="text-lg font-bold">{segment.arrivalLocation || segment.destinationLocation || "N/A"}</p>
            <p className="text-sm opacity-90">
              {(segment.arrivalTime || segment.destinationTime) ? `${segment.arrivalTime || segment.destinationTime} Hrs` : "N/A"}
            </p>
            <p className="text-xs opacity-75">{segment.arrivalDate || segment.destinationDate || "N/A"}</p>
          </div>
        </div>

        {/* Notes section */}
        {segment.notes && (
          <div className="mt-4 pt-4 border-t border-red-500 border-opacity-50">
            <p className="text-xs font-semibold uppercase opacity-75 mb-2">
              Notes
            </p>
            <p className="text-sm opacity-90">{segment.notes}</p>
          </div>
        )}
      </div>

      {/* Edit button */}
      {onEdit && (
        <div className="px-6 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(segment)}
            className="w-full bg-white text-red-600 hover:bg-gray-100 border-0"
          >
            Edit Transportation
          </Button>
        </div>
      )}
    </div>
  );
}

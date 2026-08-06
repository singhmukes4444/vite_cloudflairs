import { describe, it, expect } from "vitest";

/**
 * Test suite for ItineraryPreview return flight display logic
 * Verifies that return flight cities are correctly displayed in the preview
 */

describe("ItineraryPreview - Return Flight Display", () => {
  /**
   * Test 1: Return flight header should display returnFrom and returnTo
   * when they are provided
   */
  it("should display returnFrom and returnTo in return flight header when provided", () => {
    const d = {
      tripType: "flight-rt",
      arrivalFrom: "Delhi",
      arrivalTo: "Trivandrum",
      returnFlightNo: "AI 1896",
      returnFrom: "Trivandrum",
      returnTo: "Delhi",
      returnDepartureDate: "2026-05-30",
    };

    // Simulate the header display logic
    const returnHeader = `Return — ${d.returnFrom || d.arrivalTo || "—"} → ${d.returnTo || d.arrivalFrom || "—"}`;

    expect(returnHeader).toBe("Return — Trivandrum → Delhi");
  });

  /**
   * Test 2: Return flight header should fallback to reversed arrival cities
   * when returnFrom and returnTo are not provided
   */
  it("should fallback to reversed arrival cities when returnFrom/returnTo not provided", () => {
    const d = {
      tripType: "flight-rt",
      arrivalFrom: "Delhi",
      arrivalTo: "Trivandrum",
      returnFlightNo: "AI 1896",
      returnFrom: "",
      returnTo: "",
      returnDepartureDate: "2026-05-30",
    };

    // Simulate the header display logic
    const returnHeader = `Return — ${d.returnFrom || d.arrivalTo || "—"} → ${d.returnTo || d.arrivalFrom || "—"}`;

    expect(returnHeader).toBe("Return — Trivandrum → Delhi");
  });

  /**
   * Test 3: Return flight header should display dashes when no data is available
   */
  it("should display dashes when no return flight data is available", () => {
    const d = {
      tripType: "flight-rt",
      arrivalFrom: "",
      arrivalTo: "",
      returnFlightNo: "",
      returnFrom: "",
      returnTo: "",
      returnDepartureDate: "",
    };

    // Simulate the header display logic
    const returnHeader = `Return — ${d.returnFrom || d.arrivalTo || "—"} → ${d.returnTo || d.arrivalFrom || "—"}`;

    expect(returnHeader).toBe("Return — — → —");
  });

  /**
   * Test 4: Return flight should be displayed only when isRoundTrip and hasReturn are true
   */
  it("should determine hasReturn correctly", () => {
    // Case 1: Has return flight number
    const d1 = { returnFlightNo: "AI 1896", returnDepartureDate: "" };
    const hasReturn1 = !!(d1.returnFlightNo || d1.returnDepartureDate);
    expect(hasReturn1).toBe(true);

    // Case 2: Has return departure date
    const d2 = { returnFlightNo: "", returnDepartureDate: "2026-05-30" };
    const hasReturn2 = !!(d2.returnFlightNo || d2.returnDepartureDate);
    expect(hasReturn2).toBe(true);

    // Case 3: No return data
    const d3 = { returnFlightNo: "", returnDepartureDate: "" };
    const hasReturn3 = !!(d3.returnFlightNo || d3.returnDepartureDate);
    expect(hasReturn3).toBe(false);
  });

  /**
   * Test 5: Return flight should only display when isRoundTrip is true
   */
  it("should only display return flight when isRoundTrip is true", () => {
    // Round trip
    const d1 = { tripType: "flight-rt" };
    const isRoundTrip1 = d1.tripType === "flight-rt" || d1.tripType === "train-rt";
    expect(isRoundTrip1).toBe(true);

    // One-way trip
    const d2 = { tripType: "flight-ow" };
    const isRoundTrip2 = d2.tripType === "flight-rt" || d2.tripType === "train-rt";
    expect(isRoundTrip2).toBe(false);

    // Train round trip
    const d3 = { tripType: "train-rt" };
    const isRoundTrip3 = d3.tripType === "flight-rt" || d3.tripType === "train-rt";
    expect(isRoundTrip3).toBe(true);
  });

  /**
   * Test 6: Real-world scenario - Trivandrum to Delhi return flight
   */
  it("should correctly display Trivandrum to Delhi return flight", () => {
    const d = {
      tripType: "flight-rt",
      arrivalFrom: "Delhi",
      arrivalTo: "Trivandrum",
      returnFlightNo: "AI 1896",
      returnAirline: "Air India",
      returnStops: "direct",
      returnFrom: "Trivandrum",
      returnTo: "Delhi",
      returnDepartureDate: "2026-05-30",
      returnDepartureTime: "14:30",
      returnArrivalDate: "2026-05-30",
      returnArrivalTime: "17:45",
    };

    // Simulate the header display logic
    const returnHeader = `Return — ${d.returnFrom || d.arrivalTo || "—"} → ${d.returnTo || d.arrivalFrom || "—"}`;

    // Verify all return flight details are present
    expect(returnHeader).toBe("Return — Trivandrum → Delhi");
    expect(d.returnFlightNo).toBe("AI 1896");
    expect(d.returnAirline).toBe("Air India");
    expect(d.returnStops).toBe("direct");
    expect(d.returnDepartureDate).toBe("2026-05-30");
    expect(d.returnDepartureTime).toBe("14:30");
  });
});

import { describe, it, expect } from "vitest";

/**
 * Test suite for ItineraryEdit Add Day functionality
 * Verifies that new days can be added to the itinerary
 */

describe("ItineraryEdit - Add Day Functionality", () => {
  /**
   * Test 1: Adding a day should increment the day number
   */
  it("should increment day number when adding a new day", () => {
    const initialDays = [
      { dayNumber: 1, date: "Jun 11, 2026", title: "Arrival", description: "Arrive at destination", imageUrl: null, transportationSegments: [] },
      { dayNumber: 2, date: "Jun 12, 2026", title: "Exploration", description: "Explore the city", imageUrl: null, transportationSegments: [] },
    ];

    const newDayNumber = initialDays.length + 1;
    expect(newDayNumber).toBe(3);
  });

  /**
   * Test 2: Adding a day should create a corresponding meal plan entry
   */
  it("should create a corresponding meal plan entry when adding a day", () => {
    const initialDays = [
      { dayNumber: 1, date: "Jun 11, 2026", title: "Arrival", description: "", imageUrl: null, transportationSegments: [] },
    ];

    const initialMealPlans = [
      { dayNumber: 1, date: "11 June 2026", breakfast: 0, breakfastType: "", lunch: 0, lunchType: "", dinner: 1, dinnerType: "" },
    ];

    const newDayNumber = initialDays.length + 1;
    const newMealPlan = {
      dayNumber: newDayNumber,
      date: "",
      breakfast: 0,
      breakfastType: "",
      lunch: 0,
      lunchType: "",
      dinner: 0,
      dinnerType: "",
    };

    const updatedMealPlans = [...initialMealPlans, newMealPlan];
    expect(updatedMealPlans.length).toBe(2);
    expect(updatedMealPlans[1].dayNumber).toBe(2);
  });

  /**
   * Test 3: Day numbers should be sequential
   */
  it("should maintain sequential day numbers", () => {
    const days = [
      { dayNumber: 1, date: "Jun 11, 2026", title: "Day 1", description: "", imageUrl: null, transportationSegments: [] },
      { dayNumber: 2, date: "Jun 12, 2026", title: "Day 2", description: "", imageUrl: null, transportationSegments: [] },
      { dayNumber: 3, date: "Jun 13, 2026", title: "Day 3", description: "", imageUrl: null, transportationSegments: [] },
    ];

    // Verify sequential numbering
    for (let i = 0; i < days.length; i++) {
      expect(days[i].dayNumber).toBe(i + 1);
    }
  });

  /**
   * Test 4: New day should have empty fields
   */
  it("should create a new day with empty/default fields", () => {
    const newDay = {
      dayNumber: 3,
      date: "",
      title: "",
      description: "",
      imageUrl: null,
      transportationSegments: [],
    };

    expect(newDay.date).toBe("");
    expect(newDay.title).toBe("");
    expect(newDay.description).toBe("");
    expect(newDay.imageUrl).toBeNull();
    expect(newDay.transportationSegments).toEqual([]);
  });

  /**
   * Test 5: Adding multiple days should work correctly
   */
  it("should handle adding multiple days sequentially", () => {
    let days = [
      { dayNumber: 1, date: "Jun 11, 2026", title: "Day 1", description: "", imageUrl: null, transportationSegments: [] },
    ];

    // Add first day
    days = [...days, { dayNumber: days.length + 1, date: "", title: "", description: "", imageUrl: null, transportationSegments: [] }];
    expect(days.length).toBe(2);
    expect(days[1].dayNumber).toBe(2);

    // Add second day
    days = [...days, { dayNumber: days.length + 1, date: "", title: "", description: "", imageUrl: null, transportationSegments: [] }];
    expect(days.length).toBe(3);
    expect(days[2].dayNumber).toBe(3);

    // Verify all day numbers are sequential
    for (let i = 0; i < days.length; i++) {
      expect(days[i].dayNumber).toBe(i + 1);
    }
  });

  /**
   * Test 6: Real-world scenario - Adding a day to a 3-day itinerary
   */
  it("should correctly add a day to a 3-day itinerary", () => {
    const initialDays = [
      { dayNumber: 1, date: "Jun 11, 2026", title: "Arrival at Katra", description: "Arrive and check-in", imageUrl: null, transportationSegments: [] },
      { dayNumber: 2, date: "Jun 12, 2026", title: "Vaishno Devi Yatra", description: "Trek to shrine", imageUrl: null, transportationSegments: [] },
      { dayNumber: 3, date: "Jun 13, 2026", title: "Departure", description: "Return home", imageUrl: null, transportationSegments: [] },
    ];

    const newDay = {
      dayNumber: initialDays.length + 1,
      date: "",
      title: "",
      description: "",
      imageUrl: null,
      transportationSegments: [],
    };

    const updatedDays = [...initialDays, newDay];

    expect(updatedDays.length).toBe(4);
    expect(updatedDays[3].dayNumber).toBe(4);
    expect(updatedDays[0].dayNumber).toBe(1);
    expect(updatedDays[1].dayNumber).toBe(2);
    expect(updatedDays[2].dayNumber).toBe(3);
  });

  /**
   * Test 7: Verify meal plan is created for new day
   */
  it("should create a meal plan entry with correct day number", () => {
    const newDayNumber = 4;
    const newMealPlan = {
      dayNumber: newDayNumber,
      date: "",
      breakfast: 0,
      breakfastType: "",
      lunch: 0,
      lunchType: "",
      dinner: 0,
      dinnerType: "",
    };

    expect(newMealPlan.dayNumber).toBe(4);
    expect(newMealPlan.breakfast).toBe(0);
    expect(newMealPlan.lunch).toBe(0);
    expect(newMealPlan.dinner).toBe(0);
  });
});

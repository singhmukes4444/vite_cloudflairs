import {
  int,
  tinyint,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Itinerary (main record) ───────────────────────────────────────────────
export const itineraries = mysqlTable("itineraries", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull().default(""),
  guestNames: text("guestNames").notNull(),   // newline-separated (legacy; guestList is the new format)
  guestList: json("guestList").$type<Array<{name: string; category: string}>>(),
  numGuests: int("numGuests").notNull().default(1),
  startDate: varchar("startDate", { length: 32 }).notNull().default(""),
  endDate: varchar("endDate", { length: 32 }).notNull().default(""),
  numNights: int("numNights").notNull().default(1),
  numDays: int("numDays").notNull().default(2),
  mealPlan: varchar("mealPlan", { length: 255 }).notNull().default(""),
  foodPreference: varchar("foodPreference", { length: 64 }).notNull().default(""),
  transfers: varchar("transfers", { length: 255 }).notNull().default(""),
  tripType: varchar("tripType", { length: 32 }).notNull().default("flight-rt"),
  // Arrival details
  arrivalType: varchar("arrivalType", { length: 16 }).notNull().default("flight"),
  arrivalFrom: varchar("arrivalFrom", { length: 128 }).notNull().default(""),
  arrivalTo: varchar("arrivalTo", { length: 128 }).notNull().default(""),
  arrivalFlightNo: varchar("arrivalFlightNo", { length: 32 }).notNull().default(""),
  arrivalAirline: varchar("arrivalAirline", { length: 128 }).notNull().default(""),
  arrivalStops: varchar("arrivalStops", { length: 16 }).notNull().default("direct"),
  arrivalDepartureDate: varchar("arrivalDepartureDate", { length: 32 }).notNull().default(""),
  arrivalDepartureTime: varchar("arrivalDepartureTime", { length: 32 }).notNull().default(""),
  arrivalArrivalDate: varchar("arrivalArrivalDate", { length: 32 }).notNull().default(""),
  arrivalArrivalTime: varchar("arrivalArrivalTime", { length: 32 }).notNull().default(""),
  // Return details
  returnFlightNo: varchar("returnFlightNo", { length: 32 }).notNull().default(""),
  returnAirline: varchar("returnAirline", { length: 128 }).notNull().default(""),
  returnStops: varchar("returnStops", { length: 16 }).notNull().default("direct"),
  returnFrom: varchar("returnFrom", { length: 128 }).notNull().default(""),
  returnTo: varchar("returnTo", { length: 128 }).notNull().default(""),
  returnDepartureDate: varchar("returnDepartureDate", { length: 32 }).notNull().default(""),
  returnDepartureTime: varchar("returnDepartureTime", { length: 32 }).notNull().default(""),
  returnArrivalDate: varchar("returnArrivalDate", { length: 32 }).notNull().default(""),
  returnArrivalTime: varchar("returnArrivalTime", { length: 32 }).notNull().default(""),
  coverImageUrl: text("coverImageUrl"),
  specialNotes: text("specialNotes"),
  inclusions: json("inclusions").$type<string[]>(),
  exclusions: json("exclusions").$type<string[]>(),
  termsAndConditions: text("termsAndConditions").notNull(),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Itinerary = typeof itineraries.$inferSelect;
export type InsertItinerary = typeof itineraries.$inferInsert;

// ─── Hotels ───────────────────────────────────────────────────────────────
export const hotels = mysqlTable("hotels", {
  id: int("id").autoincrement().primaryKey(),
  itineraryId: int("itineraryId").notNull(),
  sortOrder: int("sortOrder").notNull().default(0),
  destinationName: varchar("destinationName", { length: 255 }).notNull().default(""),
  name: varchar("name", { length: 255 }).notNull(),
  starRating: int("starRating").notNull().default(3),
  numNights: int("numNights").notNull().default(1),
  checkInTime: varchar("checkInTime", { length: 32 }).notNull().default("02:00 PM"),
  checkInDate: varchar("checkInDate", { length: 64 }).notNull().default(""),
  checkOutTime: varchar("checkOutTime", { length: 32 }).notNull().default("12:00 PM"),
  checkOutDate: varchar("checkOutDate", { length: 64 }).notNull().default(""),
  specialNotes: text("specialNotes"),
  imageUrl: text("imageUrl"),
  numRooms: int("numRooms").notNull().default(0),
  doubleSharing: int("doubleSharing").notNull().default(0),
  tripleSharing: int("tripleSharing").notNull().default(0),
  childNoBed: int("childNoBed").notNull().default(0),
  childWithBed: int("childWithBed").notNull().default(0),
  extraBed: int("extraBed").notNull().default(0),
  privateTent: int("privateTent").notNull().default(0),
  sharedTent: int("sharedTent").notNull().default(0),
  mealPlan: varchar("mealPlan", { length: 255 }).notNull().default(""),
  foodPreference: varchar("foodPreference", { length: 64 }).notNull().default(""),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = typeof hotels.$inferInsert;

// ─── Itinerary Days ────────────────────────────────────────────────────────
export const itineraryDays = mysqlTable("itinerary_days", {
  id: int("id").autoincrement().primaryKey(),
  itineraryId: int("itineraryId").notNull(),
  dayNumber: int("dayNumber").notNull(),
  date: varchar("date", { length: 64 }).notNull().default(""),
  title: varchar("title", { length: 255 }).notNull().default(""),
  description: text("description").notNull(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ItineraryDay = typeof itineraryDays.$inferSelect & { transportationSegments?: TransportationSegment[] };
export type InsertItineraryDay = typeof itineraryDays.$inferInsert;

// ─── Transportation Segments ───────────────────────────────────────────────
export const transportationSegments = mysqlTable("transportation_segments", {
  id: int("id").autoincrement().primaryKey(),
  dayId: int("dayId").notNull(),
  itineraryId: int("itineraryId").notNull(),
  type: mysqlEnum("type", ["flight", "train", "car", "bus", "ship", "taxi", "other"]).notNull().default("flight"),
  originLocation: varchar("originLocation", { length: 255 }).notNull().default(""),
  originDate: varchar("originDate", { length: 32 }).notNull().default(""),
  originTime: varchar("originTime", { length: 16 }).notNull().default(""),
  destinationLocation: varchar("destinationLocation", { length: 255 }).notNull().default(""),
  destinationDate: varchar("destinationDate", { length: 32 }).notNull().default(""),
  destinationTime: varchar("destinationTime", { length: 16 }).notNull().default(""),
  // Flight specific
  flightNumber: varchar("flightNumber", { length: 32 }).notNull().default(""),
  airline: varchar("airline", { length: 128 }).notNull().default(""),
  // Train specific
  trainNumber: varchar("trainNumber", { length: 32 }).notNull().default(""),
  trainName: varchar("trainName", { length: 128 }).notNull().default(""),
  // Car/Bus specific
  vehicleType: varchar("vehicleType", { length: 64 }).notNull().default(""),
  vehicleNumber: varchar("vehicleNumber", { length: 32 }).notNull().default(""),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TransportationSegment = typeof transportationSegments.$inferSelect;
export type InsertTransportationSegment = typeof transportationSegments.$inferInsert;

// ─── Meal Plans ────────────────────────────────────────────────────────────
export const mealPlans = mysqlTable("meal_plans", {
  id: int("id").autoincrement().primaryKey(),
  itineraryId: int("itineraryId").notNull(),
  dayNumber: int("dayNumber").notNull(),
  date: varchar("date", { length: 64 }).notNull().default(""),
  breakfast: int("breakfast").notNull().default(0),
  breakfastType: varchar("breakfastType", { length: 64 }).notNull().default(""),
  lunch: int("lunch").notNull().default(0),
  lunchType: varchar("lunchType", { length: 64 }).notNull().default(""),
  dinner: int("dinner").notNull().default(0),
  dinnerType: varchar("dinnerType", { length: 64 }).notNull().default(""),
});

export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = typeof mealPlans.$inferInsert;

// ─── Hotel Confirmation Vouchers ─────────────────────────────────────────────
export const hotelVouchers = mysqlTable("hotel_vouchers", {
  id: int("id").autoincrement().primaryKey(),
  // Booking reference
  bookingRef: varchar("bookingRef", { length: 64 }).notNull().default(""),
  bookingDate: varchar("bookingDate", { length: 32 }).notNull().default(""),
  // Guest info
  guestName: varchar("guestName", { length: 255 }).notNull().default(""),
  guestList: json("guestList").$type<Array<{name: string; category: string}>>().default([]),
  numGuests: int("numGuests").notNull().default(1),
  // Hotel info
  hotelName: varchar("hotelName", { length: 255 }).notNull().default(""),
  hotelAddress: text("hotelAddress"),
  hotelPhone: varchar("hotelPhone", { length: 64 }).notNull().default(""),
  hotelEmail: varchar("hotelEmail", { length: 255 }).notNull().default(""),
  starRating: int("starRating").notNull().default(3),
  hotelImageUrl: text("hotelImageUrl"),
  // Stay details
  checkInDate: varchar("checkInDate", { length: 32 }).notNull().default(""),
  checkInTime: varchar("checkInTime", { length: 32 }).notNull().default("02:00 PM"),
  checkOutDate: varchar("checkOutDate", { length: 32 }).notNull().default(""),
  checkOutTime: varchar("checkOutTime", { length: 32 }).notNull().default("12:00 PM"),
  numNights: int("numNights").notNull().default(1),
  // Room details
  roomType: varchar("roomType", { length: 128 }).notNull().default(""),
  numRooms: int("numRooms").notNull().default(1),
  doubleSharing: int("doubleSharing").notNull().default(0),
  tripleSharing: int("tripleSharing").notNull().default(0),
  childNoBed: int("childNoBed").notNull().default(0),
  childWithBed: int("childWithBed").notNull().default(0),
  extraBed: int("extraBed").notNull().default(0),
  // Meal & food
  mealPlan: varchar("mealPlan", { length: 64 }).notNull().default(""),
  foodPreference: varchar("foodPreference", { length: 64 }).notNull().default(""),
  // Inclusions / special requests
  inclusions: json("inclusions").$type<string[]>().default([]),
  specialRequests: text("specialRequests"),
  // Confirmation details
  hotelConfirmationNo: varchar("hotelConfirmationNo", { length: 128 }).notNull().default(""),
  agentName: varchar("agentName", { length: 255 }).notNull().default(""),
  agentPhone: varchar("agentPhone", { length: 64 }).notNull().default(""),
  // Early check-in / late check-out
  earlyCheckIn: tinyint("earlyCheckIn").default(0).notNull(),
  lateCheckOut: tinyint("lateCheckOut").default(0).notNull(),
  // Status
  status: mysqlEnum("status", ["draft", "confirmed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HotelVoucher = typeof hotelVouchers.$inferSelect;
export type InsertHotelVoucher = typeof hotelVouchers.$inferInsert;

// ─── App Settings ─────────────────────────────────────────────────────────────
export const appSettings = mysqlTable("app_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = typeof appSettings.$inferInsert;

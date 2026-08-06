# Pikme Itinerary Generator - TODO

## Database & Backend
- [x] Database schema: itineraries, hotels, itinerary_days, meal_plans, inclusions, exclusions
- [x] tRPC routers: CRUD for all entities
- [x] File upload endpoint (S3)
- [x] PDF generation endpoint (Puppeteer/HTML-to-PDF)

## Admin UI
- [x] Dashboard layout with sidebar navigation
- [x] Itinerary list page (create, edit, delete)
- [x] Itinerary editor: cover info (guest names, dates, duration, guests count)
- [x] Hotel management module (star rating, check-in/out, image upload)
- [x] Day-by-day itinerary builder (title, description, image per day)
- [x] Meal plan table (breakfast/lunch/dinner per day)
- [x] Inclusions & exclusions editor
- [x] Terms & conditions editor
- [x] Image upload for cover, hotels, daily itinerary

## PDF Engine
- [x] PDF template matching exact Pikme layout (5 pages)
- [x] Page 1: Cover page with banner, guest info, trip details
- [x] Page 2: Hotel details + all days itinerary
- [x] Page 3: Meal plan + inclusions/exclusions/terms
- [x] Page 4: Back cover with Pikme branding
- [x] Page 5: PDF generation via Puppeteer
- [x] Instant PDF download button
- [x] Live preview before download (ItineraryPreview page)

## Testing & Polish
- [x] Vitest unit tests for routers (9 tests passing)
- [x] Form validation (title required, image size limits)
- [x] Loading/error states
- [x] Responsive admin UI

## Bug Fixes (Round 2)
- [x] Auto-populate itinerary day dates from start date + numDays
- [x] Auto-populate meal plan dates from start date + numDays
- [x] Fix PDF download error (chromium executablePath corrected to real binary)

## Bug Fixes (Round 3)
- [x] Auto-calculate Number of Nights and Number of Days from Start Date + End Date

## Bug Fix: Transportation Modal Pre-population & Save Validation (Round 31 - COMPLETE)
- [x] Fix transportation edit modal showing blank fields instead of saved data
- [x] Add normalizeTransSegs function to normalize database field names when loading days
- [x] Convert originLocation → departureLocation, originDate → departureDate, etc.
- [x] Ensure transportation segments display correctly in edit form
- [x] Ensure transportation segments save without validation errors
- [x] Preserve all optional fields (vehicleType, airline, flightNumber, etc.) in normalization
- [x] Car Type field now displays correctly in transportation modal
- [x] Car Type now displays in transportation card header (e.g., "CAR / Sedan")
- [x] All 21 tests passing
- [x] Itinerary saves successfully with all transportation segments

## Feature: Smart Vehicle Selector (Round 4)
- [x] Replace Transfers text field with vehicle dropdown (pax-based default + Upgraded badge)

## Feature: Meal Plan Dropdown + Food Preference + Arrival Details (Round 5)
- [x] Replace Meal Plan text field with CP/MAPI/AP/EP dropdown
- [x] Add food preference selector (Veg / Non-Veg / Jain / Veg & Non-Veg / Combination)
- [x] Add Arrival Details section (Flight/Train, route, number, airline, stops, times, return)
- [x] Extend DB schema with foodPreference, arrivalType, arrivalFrom/To, arrivalFlightNo, arrivalAirline, arrivalStops, arrivalTime, returnFlightNo, returnAirline, returnStops, returnDepartureTime, returnArrivalTime
- [x] Update tRPC routers to include new fields

## Feature: Trip Type Selector (Round 6)
- [x] Replace Transport Mode toggle with 4-option trip type (Flight RT / Train RT / Mixed / N/A)
- [x] Conditionally show arrival/return fields based on trip type selection

## Feature: Journey Time Calculator (Round 7)
- [x] Auto-calculate and display journey duration from departure + arrival times for arrival leg
- [x] Auto-calculate and display journey duration from departure + arrival times for return leg

## Feature: Date & Time Pickers (Round 8)
- [x] Replace Start Date and End Date text inputs with calendar date pickers
- [x] Add travel date field to arrival leg (departure date + arrival date)
- [x] Add travel date field to return leg (departure date + arrival date)
- [x] Replace all time text inputs with time picker dropdowns (hour/minute/AM-PM)
- [x] Add 5 new DB columns: tripType, arrivalDepartureDate, arrivalArrivalDate, returnDepartureDate, returnArrivalDate
- [x] Update tRPC schema with new date fields
- [x] 21 tests passing

## Bug Fixes & Features (Round 9)
- [x] Fix JSX syntax error at line 658 in ItineraryEdit.tsx (was stale cached error, file was clean)
- [x] End Date picker: disable all dates on or before the selected Start Date (minDate = startDate + 1 day)
- [x] Vehicle section: add Kia Carnival and Fortuner to vehicle models list
- [x] Fix time picker values not being captured/saved (TimePickerField now emits on any single field change)
- [x] PDF: Thicker divider line on cover page (2.5px solid #888)
- [x] PDF: Guest names bold and perfectly aligned under Guest: label
- [x] PDF: All body pages use Itinerary-02.png letterhead background (CDN URL)
- [x] PDF: Hotel section headings bold + bold horizontal rule (2px solid)
- [x] PDF: Last page redesigned to match Itinerary-03.png (full-page back cover image from CDN)
- [x] 21 tests passing

## Bug Fixes (Round 10)
- [x] Trip Type auto-switches from Flight to Train after ~1 min — fixed: staleTime: Infinity + refetchOnWindowFocus: false on query, and hasLoaded ref prevents re-population
- [x] Return leg departure/arrival times not saving — fixed: TimePickerField emits on any change; state wiring was correct, issue was refetch overwriting state
- [x] All typed data vanishes after ~2 min — fixed: hasLoaded ref ensures useEffect only runs once on first load
- [x] After Save, text boxes reflect current edits — fixed: invalidate cache after save but hasLoaded stays true so form is not re-populated
- [x] tripType operator precedence bug fixed: added parentheses around ternary
- [x] 21 tests passing

## PDF Layout Fix (Round 11)
- [x] Root cause: Puppeteer blocked CDN URLs — images not loading in PDF
- [x] Fix: Embedded both images as base64 data URIs in pdfAssets.ts (no network required)
- [x] Letterhead background (Itinerary-02) now renders on all inner pages
- [x] Back cover (Itinerary-03) now renders as full-page image on last page
- [x] Inner page padding adjusted to sit inside the letterhead red border frame
- [x] Duplicate footer removed from inner pages (letterhead already has footer baked in)
- [x] 21 tests passing

## Feature: Meal Plan Date Pickers (Round 12)
- [x] Replace plain text date inputs in Meal Plan Configuration table with DatePickerField calendar pickers

## Feature: Rich Text Editor for Notes & T&C (Round 13)
- [x] Install Tiptap rich text editor library
- [x] Build RichTextEditor component with toolbar (bold, italic, underline, bullet list, numbered list, link)
- [x] Replace plain textarea in Notes & Terms section with RichTextEditor
- [x] Update PDF generator to render HTML content from rich text editor (with legacy plain text fallback)
- [x] 21 tests passing

## Feature: Delete Day Button (Round 14)
- [x] Add delete button to each day card in Itinerary tab
- [x] Auto-renumber remaining days after deletion (Day 1 stays Day 1, gaps removed)
- [x] Button disabled when only 1 day remains
- [x] 21 tests passing

## Feature: Active Tab Red Highlight (Round 15)
- [x] Active tab in ItineraryEdit shows red background with white text (data-[state=active]:bg-red-600 data-[state=active]:text-white)

## Feature: Hotel Section Enhancements (Round 16)
- [x] Date picker (DatePickerField) for Check-in Date and Check-out Date
- [x] Time picker (TimePickerField) for Check-in Time and Check-out Time
- [x] Read-only Food Info banner showing Meal Plan + Food Preference from Cover Info
- [x] Special Notes / Requests textarea on each hotel card
- [x] Editable destination name field in hotel card header (replaces static "Hotel 1" label)
- [x] Added destinationName and specialNotes columns to hotels DB table
- [x] Updated tRPC HotelInput schema with new fields
- [x] 21 tests passing

## Feature: Itinerary Day Date Picker (Round 17)
- [x] Replace plain text Date input in each Itinerary Day card with DatePickerField calendar picker
- [x] 21 tests passing

## Feature: Cover Info Fixes & Guest Categories (Round 18)
- [x] Trip Type default to Flight Round Trip on new itineraries (already correct, verified)
- [x] Fix return section time pickers not capturing/saving values (TimePickerField: use undefined not "" for unset Select values)
- [x] Replace Guest Names plain textarea with structured per-guest list (name + category)
- [x] Guest categories: Infant, Child, Adult, Pregnant, Sr. Citizen, Medical Condition, Spl Attn Req
- [x] Store guest list as JSON array in DB (guestList field)
- [x] Update tRPC schema for new guest list format; guestNames auto-synced for PDF compatibility
- [x] 21 tests passing

## Bug Fix: Missing Fields in Output (Round 19)
- [x] Meal Plan now shows full label in preview (e.g. "MAPI — Breakfast & Dinner") and PDF
- [x] Food Preference now shown in both preview and PDF cover page
- [x] Vehicle/Transfers already rendered; confirmed working
- [x] 21 tests passing

## Feature: Preview & PDF Enhancements (Round 20)
- [x] Arrival & Return Details shown on cover page (preview + PDF) — conditionally rendered when data present
- [x] A4 format enforced for all pages (794px wide, 1123px min-height, @page A4 print CSS)
- [x] Guest names in bold Georgia serif font with category shown as small italic text next to each name
- [x] Horizontal rule after guest list (cover-divider)
- [x] Special Notes box on cover page (amber-bordered box in edit form + preview + PDF)
- [x] specialNotes field added to itineraries table (DB + tRPC schema)
- [x] Hotel destination name + special notes also shown in PDF hotel section
- [x] 21 tests passing

## Feature: Logo & Hotel Compact (Round 24)
- [x] Replace "pikme" text in sidebar/header with logo image (pikme-logo-600.png) — both login page and sidebar
- [x] Compress Hotel Detail section in preview and PDF (max-width 520px centered, 140x90px image, tighter typography)
- [x] 21 tests passing

## Feature: Dynamic Logo Upload from Backend (Round 25)
- [ ] Add app_settings table to DB (key/value store for logo URL and other settings)
- [ ] Add tRPC procedures: getSettings (public) and updateSettings (protected/admin)
- [ ] Add Settings page with logo upload card (image upload + preview)
- [ ] Add Settings nav item to sidebar
- [ ] Wire dynamic logo URL into sidebar, login page, and PDF/preview headers
- [ ] Fall back to pikme-logo-600.png if no custom logo is set

## Feature: Per-Hotel Meal Plan & Food Preference (Round 26)
- [x] Added mealPlan and foodPreference columns to hotels table (ALTER TABLE)
- [x] Updated HotelInput zod schema in routers.ts to include mealPlan and foodPreference
- [x] Added Meal Plan and Food Preference dropdowns to each hotel card in ItineraryEdit.tsx
- [x] Removed Meal Plan and Food Preference from the cover section (ItineraryEdit.tsx)
- [x] Removed cover-level mealPlan/foodPreference state variables and buildPayload references
- [x] Updated ItineraryPreview.tsx to show per-hotel meal plan and food preference
- [x] Updated pdfGenerator.ts (pdfmake PDF + DOCX) to show per-hotel meal plan and food preference
- [x] Made ItineraryInput.mealPlan optional in routers.ts (backward compatible)
- [x] 21 tests passing

## Feature: Hotel Confirmation Voucher Module (Round 27)
- [x] Add hotel_vouchers table to DB schema (drizzle/schema.ts) + direct SQL migration
- [x] Add tRPC procedures: list, get, create, update, delete, generatePDF for vouchers
- [x] Add "Hotel Vouchers" sidebar nav item in Home.tsx, VoucherList.tsx, VoucherEdit.tsx
- [x] Build VoucherList.tsx page (list, create, delete, PDF download)
- [x] Build VoucherEdit.tsx page (full form editor with all fields)
- [x] Build VoucherPreview.tsx page (A4 voucher layout with Pikme branding + print support)
- [x] Add PDF generation for vouchers (voucherPdfGenerator.ts with pdfmake)
- [x] Wire routes in App.tsx (/vouchers, /voucher/new, /voucher/:id/edit, /voucher/:id/preview)
- [x] 21 tests passing (all existing tests green)

## Feature: Voucher Date Improvements (Round 28)
- [x] Restrict Booking Date, Check-In Date, Check-Out Date to today and future only (min=today)
- [x] Auto-calculate Number of Nights when Check-In and Check-Out dates are selected
- [x] Add Early Check-In (If Available) toggle checkbox
- [x] Add Late Check-Out (If Available) toggle checkbox
- [x] Add earlyCheckIn and lateCheckOut tinyint columns to hotel_vouchers DB table (direct SQL)
- [x] Update tRPC VoucherInput schema with earlyCheckIn/lateCheckOut (z.number 0/1)
- [x] Update VoucherPreview to show early check-in / late check-out badges if enabled

## Feature: Voucher Image Upload & Preview Fixes (Round 29)
- [ ] Replace "Hotel Image URL" text field with file upload button (upload to S3)
- [ ] Add tRPC uploadVoucherImage procedure using storagePut
- [ ] Fix broken hotel image in VoucherPreview (was showing alt text instead of image)
- [ ] Remove stray "0" character in VoucherPreview
- [ ] Update footer: "Powered by Pikme.org (www.pikme.org)"
- [ ] Redesign VoucherPreview with professional A4 layout

## Feature: Voucher Image Upload & Preview Fixes (Round 29) - COMPLETED
- [x] Replace Hotel Image URL text field with a proper image upload button (file picker → /api/upload → S3)
- [x] Show uploaded image preview with remove button in the editor
- [x] Fix broken hotel image display in VoucherPreview (full-width banner with onError fallback)
- [x] Remove stray "0" character (filter occupancy rows to only show non-zero values)
- [x] Update footer to "Powered by Pikme.org / www.pikme.org"
- [x] Redesign VoucherPreview with professional A4 layout (colored check-in/out cards, bordered sections)

## Feature: Voucher PDF Redesign (Round 30)
- [x] White/light header with Pikme logo clearly visible (no dark ribbon obscuring logo)
- [x] Proper star rating symbols (★★★★★) rendered in PDF with gold color
- [x] Compact layout — hotel name/stars/address/conf-no immediately below header
- [x] Footer: "Powered by Pikme.org | www.pikme.org" (updated from pikme.in)
- [x] Professional two-column info layout for guest/hotel details
- [x] Hotel image shown in PDF if available (130px height banner)

## Feature: Share Hotel Voucher (Round 31)
- [x] Add Share button to VoucherList cards (copies public preview URL to clipboard)
- [x] Make VoucherPreview accessible without login (public tRPC procedure for voucher.get)
- [x] Show toast "Link copied!" on share click

## Bug Fix: Itinerary PDF Image Error (Round 32)
- [x] Fix pdfmake "Invalid image: Unknown image format" — fetchBuffer now follows HTTP 301/302/307/308 redirects
- [x] Apply to logo, hotel images, cover image, and day images in pdfGenerator.ts
- [x] Also fixed in voucherPdfGenerator.ts (same redirect-following fetchBuffer added)
- [x] Improved MIME type detection using magic bytes instead of URL extension parsing

## Feature: Transportation Segments Between Destinations (Round 33)
- [ ] Add transportationSegments table to schema.ts with fields: type (Flight/Train/Car/Bus), departureTime, arrivalTime, departureLocation, arrivalLocation, bookingRef, notes, etc.
- [ ] Create tRPC procedures: transportation.add, transportation.update, transportation.delete, transportation.list
- [ ] Build TransportationForm component with mode selector (Flight/Train/Car/Bus) and dynamic fields
- [ ] Add transportation section to ItineraryEdit day editor with add/edit/delete buttons
- [ ] Display transportation segments in ItineraryPreview with icons and timeline
- [ ] Include transportation in PDF generation (pdfGenerator.ts)
- [ ] Write vitest tests for transportation procedures

## Bug Fix: Transportation Edit Modal Pre-population (Round 31)
- [x] Fixed TransportationEditModal not showing saved data when clicking Edit
- [x] Root cause: Form field names (departureLocation, arrivalLocation) didn't match database field names (originLocation, destinationLocation)
- [x] Solution: Added normalizeSegment() function to map database fields to form fields
- [x] Added proper useEffect dependency on isOpen to ensure form syncs when modal opens
- [x] All form fields now show saved data when editing transportation segments
- [x] 21 tests passing

## Feature: Duplicate Itinerary (Round 32)
- [ ] Add duplicate itinerary tRPC procedure on backend
- [ ] Add duplicate button to itinerary list UI
- [ ] Test duplicate functionality
- [ ] Verify all data is copied correctly

## Feature: Responsive Itinerary List UI (Round 33)
- [ ] Make itinerary card layout responsive for mobile (< 640px)
- [ ] Make itinerary card layout responsive for tablet (640px - 1024px)
- [ ] Make itinerary card layout responsive for desktop (> 1024px)
- [ ] Test on multiple screen sizes
- [ ] Ensure buttons and text are readable on all devices

## Feature: Duplicate Itinerary & Responsive UI (Round 32)
- [x] Add duplicateItinerary function to server/db.ts (copies itinerary + all related data)
- [x] Add duplicate tRPC procedure to server/routers.ts
- [x] Add Duplicate button to itinerary list UI in Home.tsx
- [x] Make itinerary list responsive for mobile/tablet/desktop
  - [x] Hide sidebar on mobile (sm breakpoint)
  - [x] Hide button text labels on mobile (show icons only)
  - [x] Adjust card padding and spacing for smaller screens
  - [x] Full-width "New Itinerary" button on mobile
- [x] Test duplicate functionality (creates copy with "Copy of" prefix)
- [x] Test responsive design on mobile, tablet, desktop
- [x] All 21 tests passing

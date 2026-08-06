# Pikme Itinerary Generator - Complete Setup Guide

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Project Structure](#project-structure)
7. [Key Files to Edit](#key-files-to-edit)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements:
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or pnpm 8.0.0+)
- **RAM**: 2GB minimum
- **Disk**: 2GB free space
- **OS**: Linux, macOS, or Windows

### Recommended:
- **Node.js**: 20 LTS
- **RAM**: 4GB+
- **Disk**: 5GB+
- **Database**: MySQL 8.0+ or PostgreSQL 12+

---

## Installation Steps

### Step 1: Install Node.js

#### On Ubuntu/Debian:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### On macOS (with Homebrew):
```bash
brew install node
```

#### On Windows:
```
Visit: https://nodejs.org/
Download: LTS version
Run installer
```

### Step 2: Verify Installation
```bash
node --version    # Should show v20.x.x
npm --version     # Should show 9.x.x or higher
```

### Step 3: Extract Project Files
```bash
# Extract the ZIP file
unzip itinerary-generator-complete.zip
cd itinerary_generator
```

### Step 4: Install Dependencies
```bash
# Using npm
npm install

# OR using pnpm (faster)
npm install -g pnpm
pnpm install
```

This will install all required packages (React, Express, TypeScript, etc.)

### Step 5: Setup Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
# or
vi .env
# or
code .env  # if using VS Code
```

### Step 6: Setup Database
See [Database Setup](#database-setup) section below

### Step 7: Run Database Migrations
```bash
npm run db:push
```

### Step 8: Start Development Server
```bash
npm run dev
```

Your app will be available at: `http://localhost:3000`

---

## Configuration

### Environment Variables (.env file)

Create a `.env` file in the project root with these variables:

```env
# Database Connection
DATABASE_URL=mysql://user:password@localhost:3306/itinerary_db

# Authentication
JWT_SECRET=your_super_secret_key_here_minimum_32_characters

# OAuth (Manus)
VITE_APP_ID=your_app_id_from_manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im

# API Keys
BUILT_IN_FORGE_API_KEY=your_api_key
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge

# Application
VITE_APP_TITLE=Pikme Itinerary Generator
VITE_APP_LOGO=https://pikme.in/cdn/logo-banner/pikme-logo-600.png

# Owner Info
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

### Where to Get These Values:

| Variable | Where to Get |
|----------|-------------|
| DATABASE_URL | From your database provider |
| JWT_SECRET | Generate: `openssl rand -base64 32` |
| VITE_APP_ID | From Manus dashboard |
| OWNER_NAME | Your name |
| VITE_APP_TITLE | Your app name |
| VITE_APP_LOGO | Your logo URL |

---

## Database Setup

### Option 1: Local MySQL

#### Install MySQL:
```bash
# Ubuntu/Debian
sudo apt-get install mysql-server

# macOS
brew install mysql
```

#### Start MySQL:
```bash
# Ubuntu/Debian
sudo systemctl start mysql

# macOS
brew services start mysql
```

#### Create Database:
```bash
mysql -u root -p
```

Then in MySQL shell:
```sql
CREATE DATABASE itinerary_db;
CREATE USER 'itinerary_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON itinerary_db.* TO 'itinerary_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Connection String:
```
DATABASE_URL=mysql://itinerary_user:strong_password_here@localhost:3306/itinerary_db
```

### Option 2: Cloud Database (Recommended)

#### Using PlanetScale (Free):
```
1. Visit: https://planetscale.com
2. Sign up
3. Create database
4. Get connection string
5. Add to .env as DATABASE_URL
```

#### Using Supabase (PostgreSQL):
```
1. Visit: https://supabase.com
2. Sign up
3. Create project
4. Get connection string
5. Add to .env as DATABASE_URL
```

### Run Migrations:
```bash
npm run db:push
```

This will create all necessary tables automatically.

---

## Running the Application

### Development Mode (with Hot Reload):
```bash
npm run dev
```

Access at: `http://localhost:3000`

### Build for Production:
```bash
npm run build
```

### Start Production Server:
```bash
npm start
```

### Run Tests:
```bash
npm test
```

### Format Code:
```bash
npm run format
```

---

## Project Structure

```
itinerary_generator/
│
├── client/                          # React Frontend
│   ├── src/
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.tsx             # Landing page
│   │   │   ├── ItineraryList.tsx    # List all itineraries
│   │   │   ├── ItineraryEdit.tsx    # Edit itinerary
│   │   │   ├── ItineraryPreview.tsx # Preview itinerary
│   │   │   └── ...
│   │   ├── components/              # Reusable components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── RichTextEditor.tsx
│   │   │   └── ...
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── public/                      # Static files
│   └── index.html                   # HTML template
│
├── server/                          # Express Backend
│   ├── routers.ts                   # API routes (tRPC)
│   ├── db.ts                        # Database queries
│   ├── pdfGenerator.ts              # PDF generation
│   ├── storage.ts                   # File storage
│   ├── _core/                       # Core utilities
│   │   ├── context.ts               # Request context
│   │   ├── auth.ts                  # Authentication
│   │   ├── llm.ts                   # LLM integration
│   │   └── ...
│   └── ...
│
├── drizzle/                         # Database Schema
│   ├── schema.ts                    # Table definitions
│   └── migrations/                  # Migration files
│
├── shared/                          # Shared Code
│   ├── types.ts                     # Shared types
│   ├── const.ts                     # Constants
│   └── ...
│
├── package.json                     # Dependencies
├── vite.config.ts                   # Frontend build config
├── tsconfig.json                    # TypeScript config
├── vitest.config.ts                 # Test config
└── README.md                        # Documentation
```

---

## Key Files to Edit

### 1. Database Schema
**File**: `drizzle/schema.ts`

Add new tables or modify existing ones:
```typescript
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  // Add your fields here
});
```

After editing, run:
```bash
npm run db:push
```

### 2. API Routes
**File**: `server/routers.ts`

Add new API endpoints:
```typescript
export const appRouter = router({
  itinerary: {
    create: protectedProcedure
      .input(z.object({ title: z.string() }))
      .mutation(async ({ input, ctx }) => {
        // Your logic here
      }),
  },
});
```

### 3. Frontend Pages
**File**: `client/src/pages/YourPage.tsx`

Create new pages:
```typescript
export default function YourPage() {
  const { data } = trpc.yourRoute.useQuery();
  
  return (
    <div>
      {/* Your UI here */}
    </div>
  );
}
```

### 4. Styling
**File**: `client/src/index.css`

Add global styles:
```css
:root {
  --primary: #e53e3e;
  --secondary: #2d3748;
  /* Add your colors */
}
```

### 5. Application Title & Logo
**File**: `.env`

```env
VITE_APP_TITLE=Your App Name
VITE_APP_LOGO=https://your-logo-url.png
```

---

## Common Tasks

### Add New Database Table
```bash
# 1. Edit drizzle/schema.ts
# 2. Add your table definition
# 3. Run migration
npm run db:push
```

### Add New API Endpoint
```bash
# 1. Edit server/routers.ts
# 2. Add new procedure
# 3. Use in frontend with trpc.yourRoute.useQuery()
```

### Add New Page
```bash
# 1. Create file: client/src/pages/YourPage.tsx
# 2. Add route in: client/src/App.tsx
# 3. Add navigation link
```

### Change Styling
```bash
# Edit: client/src/index.css
# Or add Tailwind classes to components
```

### Deploy to Production
```bash
# 1. Build
npm run build

# 2. Start
npm start

# 3. Or deploy to Railway/Render (see deployment guide)
```

---

## Troubleshooting

### "Port 3000 already in use"
```bash
# Use different port
PORT=3001 npm run dev

# Or kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### "Cannot find module"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Database connection failed"
```bash
# Check connection string
# Verify database is running
# Test connection:
mysql -u user -p -h host -D database
```

### "TypeScript errors"
```bash
# Check for syntax errors
npm run build

# Fix common issues
npm run format
```

### "Build fails"
```bash
# Clear cache
npm run clean

# Rebuild
npm run build
```

### "Tests failing"
```bash
# Run tests with verbose output
npm test -- --reporter=verbose

# Run specific test
npm test -- server/itinerary.test.ts
```

---

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
```

### 2. Make Changes
- Edit files in `client/src/` for frontend
- Edit files in `server/` for backend
- Changes auto-reload (HMR)

### 3. Test Your Changes
```bash
# Visit http://localhost:3000
# Test in browser
```

### 4. Run Tests
```bash
npm test
```

### 5. Format Code
```bash
npm run format
```

### 6. Commit Changes
```bash
git add .
git commit -m "Your message"
git push
```

---

## Performance Tips

### 1. Database Optimization
- Add indexes to frequently queried columns
- Use pagination for large datasets
- Cache frequently accessed data

### 2. Frontend Optimization
- Use React.memo for expensive components
- Lazy load images
- Code splitting for large bundles

### 3. Server Optimization
- Enable compression
- Use caching headers
- Optimize database queries

---

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` file
- Use strong JWT_SECRET
- Rotate API keys regularly

### 2. Database
- Use strong passwords
- Enable SSL for connections
- Regular backups

### 3. Authentication
- Use HTTPS in production
- Implement rate limiting
- Validate all inputs

---

## Getting Help

### Documentation:
- Node.js: https://nodejs.org/docs
- React: https://react.dev
- Express: https://expressjs.com
- TypeScript: https://www.typescriptlang.org

### Community:
- Stack Overflow: https://stackoverflow.com
- GitHub Discussions: https://github.com/discussions
- Reddit: r/node, r/reactjs

### Issues:
- Check logs: `.manus-logs/devserver.log`
- Check browser console: F12
- Check terminal output

---

## Next Steps

1. ✅ Install Node.js
2. ✅ Extract project files
3. ✅ Install dependencies
4. ✅ Setup environment variables
5. ✅ Setup database
6. ✅ Run migrations
7. ✅ Start development server
8. ✅ Test the application
9. ✅ Deploy to production

---

## Support

For issues or questions:
1. Check this guide
2. Check troubleshooting section
3. Check project logs
4. Search Stack Overflow
5. Ask in GitHub Discussions

Good luck! 🚀

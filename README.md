# Events Management Platform

A modern, full-featured events management system built with Next.js 14, TypeScript, Tailwind CSS, and NeonDB.

## 🎯 Features

- **Events Listing Page**: Browse upcoming events in a beautiful card-based layout
- **Event Registration**: User-friendly forms with real-time validation
- **NeonDB Integration**: Serverless PostgreSQL database for data persistence
- **Component-Based Architecture**: Multiple reusable components for maintainability
- **Responsive Design**: Works seamlessly on all devices
- **Modern UI/UX**: Gradient designs, smooth animations, and intuitive navigation

## 🚀 Quick Start

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

Then edit `.env.local` and add your NeonDB connection string:
\`\`\`
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
\`\`\`

3. **Seed the database:**
   \`\`\`bash
   npm run seed
   \`\`\`

4. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser:**
   Navigate to [http://localhost:3000/events](http://localhost:3000/events)

## 📁 Project Structure

- **`app/`** - Next.js app router pages and API routes
  - `events/` - Events listing and registration pages
  - `api/events/register/` - Registration API endpoint
- **`components/`** - Reusable React components
  - `EventCard.tsx` - Individual event card
  - `EventList.tsx` - Grid of event cards
  - `EventRegistrationForm.tsx` - Registration form
  - `FormInput.tsx` - Reusable form input
  - `EventDetails.tsx` - Event details display
  - `LoadingSpinner.tsx` - Loading state
  - `ErrorMessage.tsx` & `SuccessMessage.tsx` - Feedback messages
- **`lib/`** - Database configuration and utilities
- **`types/`** - TypeScript type definitions
- **`scripts/`** - Database seeding scripts

## 📚 Detailed Documentation

For complete setup instructions, database schema, API documentation, and deployment guide, see [SETUP.md](SETUP.md).

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: NeonDB (Serverless PostgreSQL)
- **Database Client**: @neondatabase/serverless

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed database with sample events
- `npm run lint` - Run ESLint

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

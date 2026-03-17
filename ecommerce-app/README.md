# E-Commerce Web Application (React + Supabase)

A modern full-stack e-commerce application featuring a real-time cart system with expiry logic, built using React, Tailwind CSS, and Supabase.

## Features

- **User Authentication**: Secure sign-up and login via Supabase Auth.
- **Product Catalog**: View products and real-time stock availability.
- **Add to Cart with Timer**: Items added to the cart are reserved for exactly 7 minutes.
- **Real-Time Sync**: Cart updates, expirations, and removals sync instantly across connected clients using Supabase Realtime subscriptions.
- **Automated Cart Expiry**: A Supabase `pg_cron` job automatically removes expired cart items in the background.
- **Checkout System**: Validates the cart and processes dummy placement of orders securely.
- **Modern UI**: Clean design, responsive layout, glassmorphism elements, and loading skeletons.

## Prerequisites

- Node.js (v18 or higher)
- A Supabase account ([supabase.com](https://supabase.com/))

## Setup Instructions

### 1. Supabase Database Setup

1. Create a new project in your Supabase dashboard.
2. Navigate to the **SQL Editor** in your Supabase project.
3. Copy the contents of the `supabase_schema.sql` file provided in the root of this repository.
4. Execute the SQL script. This will set up the:
   - `profiles`, `products`, `cart`, `orders`, and `order_items` tables.
   - Row Level Security (RLS) policies.
   - Trigger to automatically create a profile when a user registers.
   - Database function to clear expired cart items.
5. **Enable `pg_cron`**: If you want the background worker to automatically delete expired items, go to Database -> Extensions in your Supabase dashboard, and enable the `pg_cron` extension. Then you can uncomment and run the scheduled job query in the `supabase_schema.sql` file.

### 2. Frontend Environment Setup

1. Rename the `.env` file or create a `.env.local` file in the root directory.
2. Add your Supabase project URL and Anon public key:
   ```env
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   ```

### 3. Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` (or the port provided by Vite).

## Deployment

This application is ready to be hosted on platforms like **Vercel** or **Netlify**.

### Deploying to Vercel
1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. During setup, Vite will automatically be detected. Ensure the Build Command is `npm run build` and Output Directory is `dist`.
4. Add your Environment Variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
5. Click **Deploy**.

## Built With

- **Frontend**: React (Vite), React Router, Tailwind CSS, Lucide Icons.
- **Backend & Database**: Supabase (PostgreSQL, Auth, Realtime, pg_cron).

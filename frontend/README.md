# PantherFinder - Next.js Version

A modern lost and found platform built with Next.js, Tailwind CSS, and Supabase.

## Features

- User authentication with Supabase Auth
- Dark/light mode toggle
- Responsive design with Tailwind CSS
- Lost and found item management
- Item claiming system
- User profiles and dashboard

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pantherfinder.git
cd pantherfinder
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `src/app/` - Next.js app router pages
- `src/components/` - Reusable UI components
- `src/context/` - React context providers
- `src/lib/` - Utility functions and libraries
- `src/services/` - API and service functions

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Supabase](https://supabase.io/) - Open source Firebase alternative
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript

## License

This project is licensed under the MIT License - see the LICENSE file for details.

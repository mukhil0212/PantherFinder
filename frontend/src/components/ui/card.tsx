"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { MagicCard } from '@/components/ui/magic-card';

interface CardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  status: string;
  imageUrl?: string;
  href: string;
  dateLost?: string;
}

export function ItemCard({
  id,
  title,
  description,
  category,
  location,
  date,
  status,
  imageUrl,
  href,
  dateLost
}: CardProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  // Format image URL - if it starts with http, use as is, otherwise prepend API base URL
  const formattedImageUrl = imageUrl ?
    (imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`) :
    "https://images.unsplash.com/photo-1544077960-604201fe74bc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1651&q=80";

  return (
    <MagicCard className="h-full">
      <Link href={href} className="block relative z-20 h-full">
        <div className="bg-[var(--card)] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
          <div className="flex flex-col gap-4">
            <div className="w-full h-40 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <img
                src={formattedImageUrl || ''}
                alt={title}
                className="object-contain w-full h-full"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-[var(--foreground)] truncate">{title}</h3>
              <p className="text-sm text-[var(--foreground)]/70 truncate">{description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  {category}
                </span>
                <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                  {location}
                </span>
                <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {status.toLowerCase() === 'lost' && dateLost
                    ? `Lost: ${new Date(dateLost).toLocaleDateString()}`
                    : `Found: ${new Date(date).toLocaleDateString()}`
                  }
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${status.toLowerCase() === "lost" ? "bg-red-500/80 text-white" : "bg-green-500/70 text-white"} shadow-md`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </MagicCard>
  );
}

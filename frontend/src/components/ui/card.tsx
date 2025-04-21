"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

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
    <motion.div
      whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
      transition={{ type: "spring", stiffness: 180, damping: 14 }}
      className="max-w-xs w-full group/card"
    >
      <Link href={href} className="block">
        <div
          className={cn(
            "cursor-pointer overflow-hidden relative card h-96 rounded-2xl shadow-2xl max-w-sm mx-auto flex flex-col justify-between p-4 border border-gray-200 dark:border-gray-700 bg-cover transition-all duration-300",
            "hover:shadow-3xl hover:-translate-y-1 hover:border-blue-400 dark:hover:border-blue-400"
          )}
          style={{ backgroundImage: `url(${formattedImageUrl})` }}
        >
          <motion.div
            initial={{ opacity: 0.65 }}
            whileHover={{ opacity: 0.45 }}
            className="absolute w-full h-full top-0 left-0 bg-black dark:bg-black opacity-60 transition duration-300 group-hover/card:opacity-50 rounded-2xl"
          ></motion.div>
          <div className="flex flex-row items-center space-x-4 z-10">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
              {category.charAt(0)}
            </div>
            <div className="flex flex-col">
              <p className="font-normal text-base text-gray-50 relative z-10">
                {category}
              </p>
              <p className="text-sm text-gray-300 dark:text-gray-400">{location}</p>
            </div>
          </div>
          <div className="text content">
            <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10 drop-shadow-lg">
              {title}
            </h1>
            <motion.p
              className="font-normal text-sm text-gray-50 relative z-10 my-4 line-clamp-3"
              initial={{ opacity: 0.85 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.18 }}
            >
              {description}
            </motion.p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-300 dark:text-gray-400 relative z-10">
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
      </Link>
    </motion.div>
  );
}

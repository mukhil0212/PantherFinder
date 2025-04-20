"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
  href
}: CardProps) {
  const defaultImage = "https://images.unsplash.com/photo-1544077960-604201fe74bc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1651&q=80";
  
  return (
    <Link href={href} className="max-w-xs w-full group/card">
      <div
        className={cn(
          "cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl max-w-sm mx-auto flex flex-col justify-between p-4",
          "bg-cover"
        )}
        style={{ backgroundImage: `url(${imageUrl || defaultImage})` }}
      >
        <div className="absolute w-full h-full top-0 left-0 bg-black opacity-60 transition duration-300 group-hover/card:opacity-50"></div>
        <div className="flex flex-row items-center space-x-4 z-10">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {category.charAt(0)}
          </div>
          <div className="flex flex-col">
            <p className="font-normal text-base text-gray-50 relative z-10">
              {category}
            </p>
            <p className="text-sm text-gray-400">{location}</p>
          </div>
        </div>
        <div className="text content">
          <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10">
            {title}
          </h1>
          <p className="font-normal text-sm text-gray-50 relative z-10 my-4 line-clamp-3">
            {description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-300 relative z-10">
              {new Date(date).toLocaleDateString()}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full relative z-10 ${
              status === 'found' ? 'bg-green-600' : 
              status === 'claimed' ? 'bg-blue-600' : 
              'bg-yellow-600'
            }`}>
              {status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

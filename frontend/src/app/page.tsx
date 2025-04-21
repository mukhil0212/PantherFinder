'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import BackgroundBeamsDemo from '@/components/background-beams-demo';
import { BorderBeam } from '@/components/ui/border-beam';
import { MagicCard } from '@/components/ui/magic-card';

import { ItemCard } from '@/components/ui/card';
import { BackgroundBeams } from '@/components/ui/background-beams';
import MagnifyReveal from '@/components/MagnifyReveal';
import MagnifyLink from '@/components/MagnifyLink';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import NavbarDemo from '@/components/navbar-menu-demo';

export default function Home() {
  const { isAuthenticated } = useAuth();

  const featuredItems = [
    {
      id: 1,
      name: 'MacBook Pro',
      category: 'Electronics',
      location: 'Library',
      date: '2025-03-31',
      status: 'Found',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      name: 'Notebook',
      category: 'Stationery',
      location: 'Classroom Building',
      date: '2025-04-02',
      status: 'Found',
      image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      name: 'Water Bottle',
      category: 'Personal',
      location: 'Recreation Center',
      date: '2025-03-29',
      status: 'Found',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <MagnifyReveal>
      <div className="w-full min-h-screen relative">
        <div className="relative z-10">
          <NavbarDemo />
          {/* Hero Section */}
          <BackgroundBeamsDemo />
          {/* Features Section */}
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-[var(--foreground)]/70">
                Our intuitive platform bridges the gap between lost items and their owners.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                title="Search"
                description="Quickly find lost items using our smart filters."
                icon={
                  <svg className="h-8 w-8 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
              <FeatureCard
                title="Report"
                description="Easily report items you've found or lost."
                icon={
                  <svg className="h-8 w-8 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              />
              <FeatureCard
                title="Connect"
                description="Communicate securely with item owners and finders."
                icon={
                  <svg className="h-8 w-8 text-yellow-500 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m2-4h4a2 2 0 012 2v4H7V6a2 2 0 012-2z" />
                  </svg>
                }
              />
              <FeatureCard
                title="Claim"
                description="Reclaim your lost items with proof of ownership."
                icon={
                  <svg className="h-8 w-8 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Recently Found Items Section */}
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl text-center mb-12">
              Recently Found Items
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id.toString()}
                  title={item.name}
                  description="A detailed description of the item would go here. This is a placeholder text to show how the card would look with a longer description."
                  category={item.category}
                  location={item.location}
                  date={item.date}
                  status={item.status.toLowerCase()}
                  imageUrl={item.image}
                  href={`/items/${item.id}`}
                />
              ))}
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
            <div className="card relative overflow-hidden">
              <div className="absolute inset-0">
                <BackgroundBeams />
              </div>
              <div className="text-center relative z-10">
                <h2 className="text-3xl font-bold text-[var(--foreground)]">
                  Ready to Get Started?
                </h2>
                <p className="mt-4 text-xl muted">
                  Join our community to help reunite lost items with their owners.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <InteractiveHoverButton onClick={() => window.location.href = isAuthenticated ? '/submit-item' : '/auth/register'}>
                    {isAuthenticated ? 'Submit Found Item' : 'Get Started'}
                  </InteractiveHoverButton>
                  <InteractiveHoverButton onClick={() => window.location.href = '/learn-more'} className="border-[var(--accent)] bg-transparent">
                    Learn More
                  </InteractiveHoverButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MagnifyReveal>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <MagicCard className="bg-[var(--background)] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="inline-flex items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30 p-3 mb-4 relative z-20">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-[var(--foreground)] relative z-20">{title}</h3>
      <p className="mt-2 text-[var(--foreground)]/70 relative z-20">{description}</p>
    </MagicCard>
  );
}

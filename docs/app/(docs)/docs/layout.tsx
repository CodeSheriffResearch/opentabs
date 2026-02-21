import SideNav from '@/components/SideNav';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Docs | OpenTabs',
};

export default function ComponentLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative mx-auto max-w-7xl">
      <div className="max-lg:px-4">
        <div className="flex items-start lg:gap-20">
          {/* Sidebar */}
          <div className="sticky top-16 hidden w-60 flex-shrink-0 self-start lg:block">
            <SideNav />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

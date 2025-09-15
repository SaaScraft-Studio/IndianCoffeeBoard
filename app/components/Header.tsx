'use client';

import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="relative w-full h-24 md:h-32">
          <Image
            src="/coffeHeader.png"
            alt="National Coffee Championships 2025 - India Coffee Board"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </header>
  );
}
"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full shadow-sm ">
      <div className="relative w-full h-auto ">
        <Image
          src="/coffeeHeader.jpg"
          alt="India International Coffee Festival 2026 - Coffee Board "
          width={1920}
          height={500}
          className="w-full h-auto object-contain"
          priority
        />
      </div>
    </header>
  );
}

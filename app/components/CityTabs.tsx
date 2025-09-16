"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CityTabsProps {
  selectedCity: "mumbai" | "delhi" | "bangalore";
  onCityChange: (city: "mumbai" | "delhi" | "bangalore") => void;
}

const cities = [
  { id: "mumbai" as const, name: "Mumbai", icon: "/gateway.png" },
  { id: "delhi" as const, name: "Delhi", icon: "lalQuila.png" },
  { id: "bangalore" as const, name: "Bangalore", icon: "bangalore.png" },
];

export default function CityTabs({
  selectedCity,
  onCityChange,
}: CityTabsProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex flex-col sm:flex-row gap-4">
        {cities.map((city) => (
          <button
            key={city.id}
            onClick={() => onCityChange(city.id)}
            className={cn(
              "flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105",
              selectedCity === city.id
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                : "bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
            )}
          >
            <img
              src={city.icon}
              alt={city.name}
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="text-lg">{city.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

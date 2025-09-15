"use client";

import { useState } from "react";
import Header from "./components/Header";
import CityTabs from "./components/CityTabs";
import RegistrationForm from "./components/RegistrationForm";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<
    "mumbai" | "hyderabad" | "bangalore"
  >("mumbai");

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            National Coffee Championships 2025
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Register for India's premier coffee competition. Showcase your
            skills and compete with the best coffee professionals across the
            country.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <CityTabs
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
          />
          <RegistrationForm city={selectedCity} />
        </div>
      </main>

      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-300">
            © 2025 India Coffee Board. All rights reserved. | National Coffee
            Championships 2025
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <span className="text-orange-400">Powered by SCAI</span>
            <span className="text-gray-400">|</span>
            <span className="text-orange-400">
              Specialty Coffee Association of India
            </span>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

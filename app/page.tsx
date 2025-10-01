"use client";

import { useState } from "react";
import Header from "./components/Header";
import CityTabs from "./components/CityTabs";
import RegistrationForm from "./components/RegistrationForm";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<
    "mumbai" | "delhi" | "bangalore"
  >("mumbai");

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-white to-orange-50">
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
          {/* <RegistrationForm city={selectedCity} /> */}
          {selectedCity === "mumbai" ? (
            <RegistrationForm city={selectedCity} />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="bg-orange-100 border border-orange-300 rounded-2xl shadow-md px-6 py-8 text-center max-w-md">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  🚧 Coming Soon
                </p>
                <p className="text-gray-700 mt-2 text-lg">
                  Registration for this city will open soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-300">
            © {currentYear} India Coffee Board. All rights reserved. | National
            Coffee Championships 2025
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <a
              href="https://saascraft.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:underline"
            >
              Powered by SaaScraft Studio (India) Pvt. Ltd.
            </a>
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

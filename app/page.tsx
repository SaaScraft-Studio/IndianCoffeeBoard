"use client";

import { useState } from "react";
import Header from "./components/Header";
import CityTabs from "./components/CityTabs";
import RegistrationForm from "./components/RegistrationForm";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<
    "mumbai" | "delhi" | "bengaluru"
  >("bengaluru");

  const currentYear = new Date().getFullYear();

  // City-specific event details
  const cityEventDetails = {
    mumbai: {
      title: "Alongside HORECA Business & BAKERY Business 2025",
      venue: "Jioworld Convention Centre, BKC - Mumbai",
      dates: "30th October to 1st November, 2025",
    },
    delhi: {
      title: "Nexus Select CityWalk Delhi",
      venue:
        "Saket District Centre, District Centre, Sector 6, Pushp Vihar, New Delhi, Delhi 110017, India",
      dates: "December 5th, 6th, and 7th, 2025",
    },
    bengaluru: {
      title: "NEXUS SHANTINIKETAN",
      venue:
        "Whitefield Main Rd, Thigalarapalya, Krishnarajapuram, Bengaluru, Karnataka 560048",
      dates: "14th to 16th Nov 2025",
    },
  };

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

          {/* Event details for all cities */}
          {/* Event details only for Bengaluru */}
          {/* Event details for Bengaluru and Delhi */}
          {(selectedCity === "bengaluru" || selectedCity === "delhi") && (
            <div className="text-center m-6 text-gray-700 space-y-1">
              <p className="font-semibold">
                {cityEventDetails[selectedCity].title}
              </p>
              <p>{cityEventDetails[selectedCity].venue}</p>
              <p>{cityEventDetails[selectedCity].dates}</p>
            </div>
          )}

          {/* Show RegistrationForm for Mumbai and Delhi, Coming Soon for Bengaluru */}
          {/* Show RegistrationForm for Mumbai and Bengaluru, Coming Soon for Delhi */}
          {/* Show RegistrationForm for Bengaluru, Registration Closed for Mumbai, Coming Soon for Delhi */}
          {/* Show RegistrationForm for Bengaluru and Delhi, Registration Closed for Mumbai */}
          {selectedCity === "mumbai" ? (
            <div className="flex items-center justify-center h-64">
              <div className="bg-red-100 border border-red-300 rounded-2xl shadow-md px-6 py-8 text-center max-w-md">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  ❌ Registration Closed
                </p>
                <p className="text-gray-700 mt-2 text-lg">
                  Registration for Mumbai is now closed.
                </p>
              </div>
            </div>
          ) : (
            <RegistrationForm city={selectedCity} />
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

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Download,
  Home,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
} from "lucide-react";

interface RegistrationDetails {
  _id: string;
  registrationId: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  state: string;
  workPlace: string;
  pin: string;
  aadhaarNumber: string;
  competitionName: string;
  city: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
}

export default function RegistrationSuccessPage() {
  const [registration, setRegistration] = useState<RegistrationDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const registrationId = searchParams.get("id");

  useEffect(() => {
    if (registrationId) {
      fetchRegistrationDetails(registrationId);
    } else {
      setIsLoading(false);
    }
  }, [registrationId]);

  const fetchRegistrationDetails = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/registration/${id}`
      );
      if (response.ok) {
        const registrationData = await response.json();
        setRegistration(registrationData);
      }
    } catch (error) {
      console.error("Failed to fetch registration details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAadhaar = (aadhaar: string) => {
    return aadhaar.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">
              Loading Registration Details
            </h2>
            <p className="text-gray-600">
              Please wait while we fetch your registration information...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16" />
            </div>
            <CardTitle className="text-3xl">Registration Confirmed!</CardTitle>
            <p className="text-orange-100 mt-2">
              Thank you for registering for National Coffee Championships 2025
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Registration Details */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Registration Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Registration ID</p>
                    <p className="font-semibold font-mono">
                      {registration?.registrationId || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-semibold text-green-600 capitalize">
                      {registration?.paymentStatus || "success"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Participant Name</p>
                    <p className="font-semibold">
                      {registration?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="font-semibold text-orange-600">
                      ₹{registration?.amount?.toLocaleString("en-IN") || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Participant Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Participant Details
                </h3>
                <div className="space-y-4">
                  {/* Personal Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Full Name</p>
                        <p className="text-sm text-gray-600">
                          {registration?.name || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-gray-600">
                          {registration?.email || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Mobile</p>
                        <p className="text-sm text-gray-600">
                          {registration?.mobile || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Aadhaar Number</p>
                        <p className="text-sm text-gray-600 font-mono">
                          {registration?.aadhaarNumber
                            ? formatAadhaar(registration.aadhaarNumber)
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Work & Location */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Work Place</p>
                        <p className="text-sm text-gray-600">
                          {registration?.workPlace || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">State</p>
                        <p className="text-sm text-gray-600">
                          {registration?.state || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-gray-600">
                        {registration?.address || "N/A"}
                        {registration?.pin && ` - ${registration.pin}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competition Details */}
              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Competition Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Competition</p>
                      <p className="text-sm text-gray-600">
                        {registration?.competitionName || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Competition City</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {registration?.city || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Registration Date</p>
                      <p className="text-sm text-gray-600">
                        {registration?.createdAt
                          ? formatDate(registration.createdAt)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Confirmation */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">
                      Confirmation Email Sent
                    </p>
                    <p className="text-sm text-orange-600">
                      A detailed confirmation has been sent to{" "}
                      {registration?.email || "your email"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Button>
                <Button
                  onClick={handlePrint}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Print Confirmation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

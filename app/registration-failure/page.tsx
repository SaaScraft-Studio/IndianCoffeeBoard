"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  XCircle,
  RefreshCw,
  Calendar,
  MapPin,
  AlertTriangle,
} from "lucide-react";

interface RegistrationDetails {
  _id: string;
  registrationId: string;
  name: string;
  email: string;
  mobile: string;
  competitionName: string;
  city: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
}

export default function RegistrationFailurePage() {
  const [registration, setRegistration] = useState<RegistrationDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
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
        const data = await response.json();
        setRegistration(data);
      }
    } catch (err) {
      console.error("Error fetching registration:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!registrationId) return;

    setRetrying(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/retry/${registrationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert("Failed to initiate payment retry. Please try again.");
      }
    } catch (error) {
      console.error("Error retrying payment:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setRetrying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-red-500 to-orange-600 text-white text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16" />
            </div>
            <CardTitle className="text-3xl">Payment Failed</CardTitle>
            <p className="text-red-100 mt-2">
              We couldn't process your payment. Your registration is saved, but
              the payment was not completed.
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Registration Details */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6">
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
                    <p className="font-semibold text-red-600 capitalize">
                      {registration?.paymentStatus || "failed"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Participant Name</p>
                    <p className="font-semibold">
                      {registration?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-semibold text-red-600">
                      ₹{registration?.amount?.toLocaleString("en-IN") || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Competition Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Competition Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Competition</p>
                      <p className="text-sm text-gray-600">
                        {registration?.competitionName || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Competition City</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {registration?.city || "N/A"}
                      </p>
                    </div>
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
                  Try New Registration
                </Button>
                <Button
                  onClick={handleRetryPayment}
                  disabled={retrying || !registration}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-700 hover:from-red-700 hover:to-orange-800"
                >
                  {retrying ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry Payment
                    </>
                  )}
                </Button>
              </div>

              {/* Important Note */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Important
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <span>
                      Your registration will be confirmed only after successful
                      payment
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <span>
                      Make sure you have sufficient balance in your account
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <span>Use a stable internet connection during payment</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

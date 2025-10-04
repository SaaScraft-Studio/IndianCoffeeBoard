"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, RefreshCw, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface RegistrationDetails {
  _id: string;
  registrationId: string;
  name: string;
  competitionName: string;
  amount: number;
  paymentStatus: string;
}

export default function RegistrationFailurePage() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get("id");
  const [registration, setRegistration] = useState<RegistrationDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const fetchRegistrationDetails = async () => {
      if (!registrationId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/registration/${registrationId}`
        );

        if (response.ok) {
          const data = await response.json();
          setRegistration(data);
        }
      } catch (err) {
        console.error("Error fetching registration:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationDetails();
  }, [registrationId]);

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
        // Redirect to payment page
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registration details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        {/* Failure Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-red-700 mb-4">
            Payment Failed
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We couldn't process your payment. Your registration is saved, but
            the payment was not completed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registration Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Registration Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {registration ? (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">
                      Registration ID
                    </h3>
                    <p className="text-lg font-mono text-gray-900">
                      {registration.registrationId}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">
                      Participant
                    </h3>
                    <p className="text-lg text-gray-900">{registration.name}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">
                      Competition
                    </h3>
                    <p className="text-lg text-gray-900">
                      {registration.competitionName}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Amount</h3>
                    <p className="text-lg font-bold text-red-600">
                      ₹ {registration.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-600">
                  Registration details not available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions & Support */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  What happened?
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Payment was declined or cancelled</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Network or technical issue occurred</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Payment session timed out</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={handleRetryPayment}
                disabled={retrying || !registration}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                {retrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Payment
                  </>
                )}
              </Button>

              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/">Try New Registration</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <Card className="mt-8 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-800 mb-4">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800">Email Support</h4>
                  <p className="text-blue-700 text-sm">
                    support@indiacoffeeboard.org
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800">Phone Support</h4>
                  <p className="text-blue-700 text-sm">+91-XXXXX-XXXXX</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Your registration details are saved. You
                can retry the payment using the same registration ID. If you
                continue to face issues, please contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// export default function RegistrationFailurePage() {
//   return (
//     <div className="min-h-screen bg-red-50 flex items-center justify-center">
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-red-600 mb-4">Payment Failed</h1>
//         <p className="text-gray-600">
//           There was an issue processing your payment.
//         </p>
//       </div>
//     </div>
//   );
// }

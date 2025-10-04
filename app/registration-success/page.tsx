"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface RegistrationDetails {
  _id: string;
  registrationId: string;
  name: string;
  email: string;
  mobile: string;
  competitionName: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
}

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get("id");
  const [registration, setRegistration] = useState<RegistrationDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRegistrationDetails = async () => {
      if (!registrationId) {
        setError("No registration ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/registration/${registrationId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch registration details");
        }

        const data = await response.json();
        setRegistration(data);
      } catch (err) {
        console.error("Error fetching registration:", err);
        setError("Failed to load registration details");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationDetails();
  }, [registrationId]);

  const handleDownloadReceipt = () => {
    // Generate and download PDF receipt
    // You can implement this with a PDF generation service or library
    alert("Receipt download functionality will be implemented soon!");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading your registration details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Registration Details Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "We couldn't find your registration details. Please contact support if you believe this is an error."}
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/">Return to Home</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-green-700 mb-4">
            Registration Successful!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thank you for registering for the National Coffee Championships
            2025. Your payment has been confirmed and your registration is
            complete.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Registration Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Registration ID
                  </h3>
                  <p className="text-lg font-mono text-green-600 bg-green-50 px-3 py-2 rounded">
                    {registration.registrationId}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Competition
                  </h3>
                  <p className="text-lg text-gray-900">
                    {registration.competitionName}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Participant Name
                  </h3>
                  <p className="text-lg text-gray-900">{registration.name}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Registration Fee
                  </h3>
                  <p className="text-lg font-bold text-green-600">
                    ₹ {registration.amount.toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Email</h3>
                  <p className="text-lg text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {registration.email}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Mobile</h3>
                  <p className="text-lg text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {registration.mobile}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Registration Date & Time
                  </h3>
                  <p className="text-lg text-gray-900">
                    {formatDate(registration.createdAt)}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800 mb-1">
                      Payment Confirmed
                    </h4>
                    <p className="text-green-700 text-sm">
                      Your payment has been successfully processed. A
                      confirmation email with your registration details has been
                      sent to {registration.email}.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Next Steps</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Check your email for confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Save your registration ID for future reference</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Wait for further instructions from the organizing team
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={handleDownloadReceipt}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>

              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/">Return to Home</Link>
              </Button>

              <Button asChild variant="ghost" className="w-full" size="lg">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <Card className="mt-8 border-orange-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-orange-800 mb-3">
              Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-orange-700">
              <li>
                • Please keep your registration ID safe for all future
                communications
              </li>
              <li>
                • The organizing team will contact you with competition schedule
                and details
              </li>
              <li>
                • For any queries, email us at competitions@indiacoffeeboard.org
              </li>
              <li>• Follow us on social media for competition updates</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// export default function RegistrationSuccessPage() {
//   return (
//     <div className="min-h-screen bg-green-50 flex items-center justify-center">
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-green-600 mb-4">
//           Payment Successful!
//         </h1>
//         <p className="text-gray-600">
//           Your registration has been completed successfully.
//         </p>
//       </div>
//     </div>
//   );
// }

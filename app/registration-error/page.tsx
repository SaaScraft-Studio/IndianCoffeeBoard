"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function RegistrationErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const getErrorMessage = (message: string | null) => {
    switch (message) {
      case "RegistrationNotFound":
        return "We couldn't find your registration details. Please try registering again.";
      case "InternalError":
        return "An internal server error occurred. Please try again later.";
      default:
        return "An unexpected error occurred during the registration process. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-orange-700">
              Registration Error
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            <div>
              <p className="text-gray-600 mb-2">{getErrorMessage(message)}</p>
              <p className="text-sm text-gray-500">
                If this problem persists, please contact our support team.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                asChild
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Home
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>

            {/* Quick Support Info */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-gray-700 mb-3">
                Quick Support
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>support@indiacoffeeboard.org</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>+91-XXXXX-XXXXX</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <Card className="mt-6 border-blue-200">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-blue-800 mb-2">
              Common Solutions
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Clear browser cache and cookies</li>
              <li>• Try using a different browser</li>
              <li>• Ensure all form fields are filled correctly</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// export default function RegistrationErrorPage() {
//   return (
//     <div className="min-h-screen bg-orange-50 flex items-center justify-center">
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-orange-600 mb-4">
//           Registration Error
//         </h1>
//         <p className="text-gray-600">An error occurred during registration.</p>
//       </div>
//     </div>
//   );
// }

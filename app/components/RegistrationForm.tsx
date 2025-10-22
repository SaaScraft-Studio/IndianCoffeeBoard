"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CreditCard, CheckCircle, XCircle } from "lucide-react";
import {
  RegistrationData,
  INDIAN_STATES,
  Competition,
} from "@/app/types/registration";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface RegistrationFormProps {
  city: "mumbai" | "delhi" | "bangalore";
}

export default function RegistrationForm({ city }: RegistrationFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<RegistrationData>>({
    city,
    name: "",
    email: "",
    mobile: "",
    address: "",
    state: "",
    pin: "",
    competition: "",
    workPlace: "",
    passportNumber: "",
    passportFile: null,
    amount: 0,
    competitionName: "",
    aadhaarNumber: "",
    acceptedTerms: false,
  });

  useEffect(() => {
    console.log("🔄 City prop changed to:", city);
    setFormData((prev) => ({ ...prev, city }));
  }, [city]);

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loadingCompetitions, setLoadingCompetitions] = useState(true);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/competitions`;

        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Failed to fetch competitions");
        const data = await res.json();
        setCompetitions(data);
      } catch (err) {
        console.error("Error fetching competitions:", err);
        toast({
          title: "Error",
          description: "Failed to load competitions",
          variant: "destructive",
        });
      } finally {
        setLoadingCompetitions(false);
      }
    };
    fetchCompetitions();
  }, [toast]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.mobile?.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.workPlace) newErrors.workPlace = "Work place is required";
    if (!formData.pin?.trim()) {
      newErrors.pin = "PIN code is required";
    } else if (!/^\d{6}$/.test(formData.pin)) {
      newErrors.pin = "Please enter a valid 6-digit PIN code";
    }
    if (!formData.competition)
      newErrors.competition = "Please select a competition";
    if (!formData.aadhaarNumber?.trim()) {
      newErrors.aadhaarNumber = "Aadhaar number is required";
    } else if (!/^\d{12}$/.test(formData.aadhaarNumber.replace(/\s/g, ""))) {
      newErrors.aadhaarNumber = "Please enter a valid 12-digit Aadhaar number";
    }

    if (selectedCompetition?.passportRequired) {
      if (!formData.passportNumber?.trim()) {
        newErrors.passportNumber = "Passport number is required";
      }
      if (!formData.passportFile) {
        newErrors.passportFile = "Please upload your passport";
      }
    }

    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms =
        "You must scroll the T&C box to read and accept before proceeding.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof RegistrationData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const handleSubmitAndPay = async () => {
    // console.log("Selected city:", city);
    // console.log("Form data city:", formData.city);
    if (!validateForm()) {
      console.warn("⚠️ Validation failed!");
      toast({
        title: "Please fill all required fields",
        description: "Please fix the errors in the form before proceeding.",
        variant: "destructive",
      });
      return;
    }

    const selectedCompetition = competitions.find(
      (c) => c._id === formData.competition
    );

    if (!selectedCompetition) {
      console.error("❌ No competition found for:", formData.competition);
      toast({
        title: "Error",
        description: "Competition not found. Please select again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPaymentStatus("processing");

    try {
      // 1️⃣ Create FormData for multipart/form-data
      const formPayload = new FormData();

      // Append all form fields as expected by backend
      formPayload.append("name", formData.name || "");
      formPayload.append("email", formData.email || "");
      formPayload.append("mobile", formData.mobile || "");
      formPayload.append("address", formData.address || "");
      formPayload.append("state", formData.state || "");
      formPayload.append("workPlace", formData.workPlace || "");
      formPayload.append("pin", formData.pin || "");
      formPayload.append(
        "aadhaarNumber",
        formData.aadhaarNumber?.replace(/\s/g, "") || ""
      );
      formPayload.append("competition", formData.competition || "");
      formPayload.append("competitionName", selectedCompetition.name || "");
      formPayload.append("competitionCity", formData.city || "");
      formPayload.append("amount", selectedCompetition.price.toString());
      formPayload.append(
        "acceptedTerms",
        formData.acceptedTerms ? "true" : "false"
      );
      // console.log("📤 Sending to API - competitionCity:", formData.city);
      // Append passport fields if required
      if (selectedCompetition.passportRequired) {
        formPayload.append("passportNumber", formData.passportNumber || "");
        if (formData.passportFile) {
          formPayload.append("passportFile", formData.passportFile);
        }
      }

      // 2️⃣ Submit to register-and-pay endpoint (combines registration + payment)
      const paymentRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/register-and-pay`,
        {
          method: "POST",
          body: formPayload, // No Content-Type header for FormData
        }
      );

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        console.error("❌ Registration/Payment failed:", paymentData);

        // Handle duplicate registration with successful payment
        if (paymentRes.status === 409) {
          toast({
            title: "Already Registered",
            description:
              "You have already completed registration for this competition.",
            variant: "destructive",
          });
          setPaymentStatus("failed");
          setLoading(false);
          return;
        }

        toast({
          title: "Registration/Payment Failed",
          description:
            paymentData.error ||
            paymentData.message ||
            "Error processing registration",
          variant: "destructive",
        });
        setPaymentStatus("failed");
        setLoading(false);
        return;
      }

      // 3️⃣ Handle successful payment initiation
      if (paymentData.payment_url) {
        // Redirect user to Instamojo payment page
        window.location.href = paymentData.payment_url;
      } else {
        console.error("❌ No payment URL received");
        toast({
          title: "Payment Error",
          description: "Could not initiate payment. Please try again.",
          variant: "destructive",
        });
        setPaymentStatus("failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("💥 Unexpected error:", err);
      setLoading(false);
      setPaymentStatus("failed");
      toast({
        title: "Registration Failed",
        description:
          err instanceof Error
            ? err.message
            : "Something went wrong. Try again.",
        variant: "destructive",
      });
    }
  };

  const handleRetryPayment = async () => {
    // For retry, we need to use the retry endpoint
    if (!formData.competition) {
      toast({
        title: "Error",
        description: "Please select a competition to retry payment.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // You would need to store the registration ID from a previous attempt
      // For now, we'll just resubmit the entire form
      await handleSubmitAndPay();
    } catch (error) {
      setLoading(false);
      setPaymentStatus("failed");
    }
  };

  const selectedCompetition = competitions.find(
    (c) => c._id === formData.competition
  );

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 bg-gradient-to-br from-white to-orange-50">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
          Registration Form
        </CardTitle>
        <CardDescription className="text-lg text-gray-600">
          {city.charAt(0).toUpperCase() + city.slice(1)} Chapter
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Form fields remain the same as your original code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name *
            </Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={cn(
                "border-2 focus:border-orange-500 focus:ring-orange-500",
                errors.name && "border-red-500"
              )}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={cn(
                "border-2 focus:border-orange-500 focus:ring-orange-500",
                errors.email && "border-red-500"
              )}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="mobile"
              className="text-sm font-medium text-gray-700"
            >
              Mobile *
            </Label>
            <Input
              id="mobile"
              placeholder="10-digit mobile number"
              value={formData.mobile || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                handleInputChange("mobile", value);
              }}
              className={cn(
                "border-2 focus:border-orange-500 focus:ring-orange-500",
                errors.mobile && "border-red-500"
              )}
            />
            {errors.mobile && (
              <p className="text-sm text-red-600">{errors.mobile}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin" className="text-sm font-medium text-gray-700">
              PIN Code *
            </Label>
            <Input
              id="pin"
              placeholder="6-digit PIN code"
              value={formData.pin || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                handleInputChange("pin", value);
              }}
              className={cn(
                "border-2 focus:border-orange-500 focus:ring-orange-500",
                errors.pin && "border-red-500"
              )}
            />
            {errors.pin && <p className="text-sm text-red-600">{errors.pin}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="address"
            className="text-sm font-medium text-gray-700"
          >
            Address *
          </Label>
          <Textarea
            id="address"
            placeholder="Enter your complete address"
            value={formData.address || ""}
            onChange={(e) => handleInputChange("address", e.target.value)}
            rows={3}
            className={cn(
              "border-2 focus:border-orange-500 focus:ring-orange-500",
              errors.address && "border-red-500"
            )}
          />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">State *</Label>
          <Select
            value={formData.state || ""}
            onValueChange={(value) => handleInputChange("state", value)}
          >
            <SelectTrigger
              className={cn(
                "border-2 focus:border-orange-500 focus:ring-orange-500",
                errors.state && "border-red-500"
              )}
            >
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {INDIAN_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="text-sm text-red-600">{errors.state}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="workPlace"
            className="text-sm font-medium text-gray-700"
          >
            Work Place / Home Brewer *
          </Label>
          <Input
            id="workPlace"
            placeholder="work place / home brewer"
            value={formData.workPlace || ""}
            onChange={(e) => handleInputChange("workPlace", e.target.value)}
            className={cn(
              "border-2 focus:border-orange-500 focus:ring-orange-500",
              errors.workPlace && "border-red-500"
            )}
          />
          {errors.workPlace && (
            <p className="text-sm text-red-600">{errors.workPlace}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Select Competition *
          </Label>
          <Select
            value={formData.competition || ""}
            onValueChange={(value) => handleInputChange("competition", value)}
            disabled={loadingCompetitions}
          >
            <SelectTrigger
              className={cn(
                "border-2 focus:border-orange-500 focus:ring-orange-500",
                errors.competition && "border-red-500"
              )}
            >
              <SelectValue
                placeholder={
                  loadingCompetitions ? "Loading..." : "Choose competition"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((comp) => (
                <SelectItem key={comp._id} value={comp._id}>
                  {comp.name} (₹ {comp.price.toLocaleString("en-IN")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.competition && (
            <p className="text-sm text-red-600">{errors.competition}</p>
          )}
        </div>

        {selectedCompetition?.passportRequired && (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label
                htmlFor="passportNumber"
                className="text-sm font-medium text-gray-700"
              >
                Passport Number *
              </Label>
              <Input
                id="passportNumber"
                placeholder="Enter passport number"
                value={formData.passportNumber || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    passportNumber: e.target.value,
                  }))
                }
                className={cn(
                  "border-2 focus:border-orange-500 focus:ring-orange-500",
                  errors.passportNumber && "border-red-500"
                )}
              />
              {errors.passportNumber && (
                <p className="text-sm text-red-600">{errors.passportNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="passportUpload"
                className="text-sm font-medium text-gray-700"
              >
                Upload Passport *
              </Label>
              <Input
                id="passportUpload"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    passportFile: e.target.files?.[0] || null,
                  }))
                }
                className={cn(
                  "border-2 focus:border-orange-500 focus:ring-orange-500",
                  errors.passportFile && "border-red-500"
                )}
              />
              {errors.passportFile && (
                <p className="text-sm text-red-600">{errors.passportFile}</p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="aadhaar"
            className="text-sm font-medium text-gray-700"
          >
            Aadhaar Number *
          </Label>
          <Input
            id="aadhaar"
            placeholder="12-digit Aadhaar number"
            value={formatAadhaar(formData.aadhaarNumber || "")}
            onChange={(e) => {
              const value = e.target.value
                .replace(/\s/g, "")
                .replace(/\D/g, "")
                .slice(0, 12);
              handleInputChange("aadhaarNumber", value);
            }}
            className={cn(
              "border-2 focus:border-orange-500 focus:ring-orange-500",
              errors.aadhaarNumber && "border-red-500"
            )}
          />
          {errors.aadhaarNumber && (
            <p className="text-sm text-red-600">{errors.aadhaarNumber}</p>
          )}
        </div>

        <div className="space-y-4">
          {/* T&C Scrollable Box */}
          <div className="text-sm font-medium text-gray-700">
            Terms & Conditions *
          </div>
          <div className="max-h-60 overflow-y-auto border border-orange-200 bg-orange-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
            <ul className="list-disc list-outside p-2 space-y-1">
              <li>
                All coffee competitions will follow the WCE Rules and
                Regulations combined with the Organizing Body Rules &
                Regulations.
              </li>
              <li>
                Age requirement: Competitors must be at least 18 years of age
                for competing in the National Coffee Championships.
              </li>
              <li>
                Nationality: Participant must hold a valid passport from the
                place they represent or documentation substantiating 24 months
                of residency, employment or scholastic enrolment.
              </li>
              <li>
                The Winners of the sanctioned National Coffee Championship will
                represent India in the respective World Coffee Championship.
              </li>
              <li>
                All Rules and Regulations are subject to change based on local
                and venue health and safety requirements or guidelines.
              </li>
              <li>
                Competitors are allowed to enter only 1 sanctioned Competition
                throughout the year, according to the announced schedule.
              </li>
              <li>
                Coffee Competition Registration Form: Competitors must complete
                the online form at{" "}
                <a
                  href="https://registrations.indiacoffeefestival.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 underline break-all"
                >
                  https://registrations.indiacoffeefestival.com
                </a>
              </li>

              <li>
                Registration slots are limited for each competition:
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    Barista – 32 slots per city, with a maximum of 5
                    participants per company.
                  </li>
                  <li>
                    Brewer’s – 25 slots per city, with a maximum of 5
                    participants per company.
                  </li>
                  <li>
                    CIGS – 25 slots per city, with a maximum of 5 participants
                    per company.
                  </li>
                  <li>
                    Filter Coffee – 32 slots per city, with a maximum of 5
                    participants per company.
                  </li>
                </ul>
                All registrations will be considered on a First come, First Paid
                basis.
              </li>
              <li>
                Competitor Questions: All competitors are personally responsible
                for reading and understanding current Rules & Regulations and
                scoresheets. Competitors are encouraged to ask questions prior
                to arriving at the coffee competitions.
              </li>
              <li>
                Competitors will also have the opportunity to ask questions
                during the official Competitors Meeting (Briefing Session) held
                prior to the start of the competition. Failure to attend these
                sessions will result in disqualification from participation.
                After the briefing, lots would be drawn for the order of
                performance in the preliminaries of each competition.
              </li>
              <li>
                The Competition Body or Organizing Team will supply the standard
                competition stage, including sponsored machines, grinders, and
                other necessary equipment as specified by the World Coffee
                Events (WCE) competition guidelines. Beyond these standard stage
                requirements, participants are responsible for bringing their
                own tools, ingredients, and accessories needed for their
                performance.
              </li>
              <li>
                All types of disqualifications will result in removal of the
                competitor from the competition, with no refund of fees.
              </li>
              <li>
                Any damage to the competition equipment due to misuse or abuse
                is grounds for disqualification.
              </li>
              <li>
                Coffee Beans: The Competitors may only use Coffee Beans from
                Indian Origin for preparing all the Beverages for the
                competition.
              </li>
              <li>
                The Sanctioned Coffee Championship will follow the rules and
                guidelines as prescribed in the World Coffee Championship
                official rules & regulations.
              </li>
              <li>
                If a competitor violates 1 or more of these Rules & Regulations,
                they may be automatically disqualified from the competition.
              </li>
              <li>
                Supporters/Assistants Not Allowed on Stage: Only the competitor,
                their designated interpreter, and NCC authorized personnel are
                allowed onstage.
              </li>
            </ul>

            {/* ✅ Checkbox inside T&C box */}
            <div className="mt-4 flex items-start space-x-2">
              <input
                type="checkbox"
                id="readTnc"
                checked={formData.acceptedTerms || false}
                onChange={(e) =>
                  handleInputChange("acceptedTerms", e.target.checked as any)
                }
                className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
              />
              <label
                htmlFor="readTnc"
                className="text-sm text-gray-700 cursor-pointer"
              >
                I have read the Terms & Conditions
              </label>
            </div>
          </div>
          {errors.acceptedTerms && (
            <p className="text-sm text-red-600">{errors.acceptedTerms}</p>
          )}

          {/* Final agreement checkbox (optional) */}
          {/* <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="tnc"
              checked={formData.acceptedTerms || false}
              onChange={(e) =>
                handleInputChange("acceptedTerms", e.target.checked as any)
              }
              className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
              disabled={!formData.acceptedTerms} //  enforce reading first
            />
            <label
              htmlFor="tnc"
              className="text-sm text-gray-700 cursor-pointer"
            >
              I agree to the Terms & Conditions
            </label>
          </div>
          {errors.acceptedTerms && (
            <p className="text-sm text-red-600">{errors.acceptedTerms}</p>
          )} */}
        </div>

        {selectedCompetition && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">
                Registration Fee:
              </span>
              <span className="text-2xl font-bold text-orange-600">
                ₹ {selectedCompetition.price.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}

        {/* <div className="pt-6">
          {paymentStatus === "success" ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-green-700">
                  Registration Successful!
                </h3>
                <p className="text-green-600">
                  Check your email and SMS for confirmation with PDF receipt.
                </p>
              </div>
            </div>
          ) : paymentStatus === "failed" ? (
            <div className="text-center space-y-4">
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-red-700">
                  Payment Failed
                </h3>
                <p className="text-red-600 mb-4">
                  There was an issue processing your payment.
                </p>
                <Button
                  onClick={handleRetryPayment}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Retry Payment
                </Button>
              </div>
            </div>
          ) : ( */}
        <Button
          onClick={handleSubmitAndPay}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-4 text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          disabled={loading || paymentStatus === "processing"}
        >
          {loading || paymentStatus === "processing" ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {paymentStatus === "processing"
                ? "Processing Payment..."
                : "Submitting..."}
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Submit & Pay{" "}
              {selectedCompetition
                ? `₹ ${selectedCompetition.price.toLocaleString("en-IN")}`
                : ""}
            </>
          )}
        </Button>
        {/* )} */}
        {/* </div> */}
      </CardContent>
    </Card>
  );
}

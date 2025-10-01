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
import { Loader2, CreditCard, CheckCircle, XCircle, X } from "lucide-react";
import {
  RegistrationData,
  INDIAN_STATES,
  COMPETITIONS,
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
    aadhaarNumber: "",
    acceptedTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPDF, setShowPDF] = useState(false);

  const [competitions, setCompetitions] = useState<
    { _id: string; name: string; price: number }[]
  >([]);

  const [loadingCompetitions, setLoadingCompetitions] = useState(true);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const res = await fetch("/api/competitions");
        const data = await res.json();
        setCompetitions(data);
      } catch (err) {
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
  }, []);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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

    if (
      selectedCompetition &&
      competitionsRequiringPassport.includes(selectedCompetition.name)
    ) {
      if (!formData.passportNumber?.trim()) {
        newErrors.passportNumber = "Passport number is required";
      }
      if (!formData.passportFile) {
        newErrors.passportFile = "Please upload your passport";
      }
    }

    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms =
        "You must read and accept the T&C before proceeding";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const competitionsRequiringPassport = [
    "National Barista Championship",
    "National Brewer’s Cup",
    "Coffee in Good Spirits",
  ];

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const resetForm = () => {
    setFormData({
      city,
      name: "",
      email: "",
      mobile: "",
      address: "",
      state: "",
      pin: "",
      competition: "",
      aadhaarNumber: "",
      acceptedTerms: false,
    });
    setPaymentStatus("idle");
  };

  const handleSubmitAndPay = async () => {
    // console.log("🔄 handleSubmitAndPay called");
    // console.log("📦 Current formData:", formData);
    // console.log("📦 Available competitions:", competitions);

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
    // console.log("🎯 selectedCompetition:", selectedCompetition);

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
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // File object handling
          if (key === "passportFile" && value instanceof File) {
            formPayload.append("passportFile", value);
          } else {
            formPayload.append(key, value.toString());
          }
        }
      });
      formPayload.append("amount", selectedCompetition.price.toString());
      formPayload.append("competitionName", selectedCompetition.name);

      // console.log("📡 Sending registration payload:", payload);

      // 1️⃣ Create registration in DB
      const regRes = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: formPayload,
      });

      const regData = await regRes.json();
      // console.log("Registration API response:", regData);

      if (!regRes.ok) {
        console.error("Registration failed:", regData);
        toast({
          // title: "Registration Failed",
          description: regData.error || "Error creating registration",
          variant: "destructive",
        });
        setLoading(false);
        setPaymentStatus("idle");
        return;
      }

      const { registration } = regData;
      // console.log("🧾 Created registration:", registration);

      if (registration.paymentStatus === "success") {
        // console.log("Already paid, skipping Razorpay.");
        toast({
          title: "Already Registered",
          description: "Your payment was successful. Registration complete.",
        });
        setPaymentStatus("success");
        setLoading(false);
        return;
      }

      // 2️⃣ Create Razorpay order
      // console.log(
      //   "💰 Creating Razorpay order for amount:",
      //   selectedCompetition.price
      // );
      const orderRes = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedCompetition.price,
          currency: "INR",
        }),
      });

      const { order } = await orderRes.json();
      // console.log("✅ Razorpay order created:", order);

      if (!orderRes.ok || !order) {
        console.error("❌ Failed to create Razorpay order");
        toast({
          title: "Payment Failed",
          description: "Could not create payment order. Try again.",
          variant: "destructive",
        });
        setPaymentStatus("idle");
        setLoading(false);
        return;
      }

      // 3️⃣ Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        console.error("❌ Could not load Razorpay script");
        toast({
          title: "Payment Failed",
          description: "Unable to load payment gateway. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        setPaymentStatus("idle");
        return;
      }

      // 4️⃣ Open Razorpay checkout
      // console.log("🪟 Opening Razorpay checkout...");
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Competition Registration",
        description: "Complete your payment",
        order_id: order.id,
        prefill: {
          name: registration.name,
          email: registration.email,
          contact: registration.mobile,
        },
        handler: async function (response: any) {
          // console.log("✅ Payment success callback:", response);

          const payRes = await fetch("/api/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              registrationId: registration.registrationId,
              amount: selectedCompetition.price,
              currency: "INR",
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              customerInfo: {
                name: registration.name,
                email: registration.email,
                mobile: registration.mobile,
              },
            }),
          });

          const data = await payRes.json();
          // console.log("📩 Payment verification response:", data);

          setLoading(false);
          if (data.success) {
            setPaymentStatus("success");
            toast({
              title: "Payment Successful",
              description:
                "Your registration is confirmed! Check email for receipt.",
            });
            setTimeout(() => resetForm(), 3000);
          } else {
            setPaymentStatus("failed");
            toast({
              title: "Payment Failed",
              description: "There was an issue completing your payment.",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: () => {
            console.warn("🛑 Razorpay modal closed by user");
            setPaymentStatus("idle");
            setLoading(false);
          },
        },
      };

      new (window as any).Razorpay(options).open();
    } catch (err) {
      console.error("💥 Unexpected error:", err);
      setLoading(false);
      setPaymentStatus("failed");
      toast({
        title: "Payment Failed",
        description:
          err instanceof Error
            ? err.message
            : "Something went wrong. Try again.",
        variant: "destructive",
      });
    }
  };

  const handleRetryPayment = () => {
    setPaymentStatus("idle");
    handleSubmitAndPay();
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
        {/* --- Form fields (same as your original code) --- */}
        {/* --- Terms & Conditions, PDF Viewer, Fee display --- */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name *
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

        {/* <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Select Competition *
          </Label>
          <Select
            value={formData.competition || ""}
            onValueChange={(value) => handleInputChange("competition", value)}
          >
            <SelectTrigger
              className={cn(
                "border-2 focus:border-orange-500 focus:ring-orange-500",
                errors.competition && "border-red-500"
              )}
            >
              <SelectValue placeholder="Choose competition" />
            </SelectTrigger>
            <SelectContent>
              {COMPETITIONS.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.name} (₹ {comp.price.toLocaleString("en-IN")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.competition && (
            <p className="text-sm text-red-600">{errors.competition}</p>
          )}
        </div> */}

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

        {selectedCompetition &&
          competitionsRequiringPassport.includes(selectedCompetition.name) && (
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
                  <p className="text-sm text-red-600">
                    {errors.passportNumber}
                  </p>
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

        {/* <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="tnc"
            checked={formData.acceptedTerms || false}
            onChange={(e) =>
              handleInputChange("acceptedTerms", e.target.checked as any)
            }
            className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
          />
          <label htmlFor="tnc" className="text-sm text-gray-700 cursor-pointer">
            I have read and agree to the{" "}
            <button
              type="button"
              onClick={() => setShowPDF(true)} // ✅ open inline viewer
              className="text-orange-600 underline hover:text-orange-700 inline-flex items-center"
            >
              Terms & Conditions
            </button>
          </label>
        </div>
        {errors.acceptedTerms && (
          <p className="text-sm text-red-600">{errors.acceptedTerms}</p>
        )} */}

        {/* ✅ Simple PDF Viewer (No Background) */}
        {/* {showPDF && (
          <>
            <div className="fixed inset-0 bg-white z-40">
              <embed
                src="/competition-guidelines.pdf#toolbar=0&navpanes=0&scrollbar=0"
                type="application/pdf"
                className="w-full h-full"
              />
            </div>
            <button
              onClick={() => setShowPDF(false)}
              className="fixed top-1 right-4 z-50 bg-white p-2 rounded-full shadow hover:bg-red-50"
            >
              <X className="w-6 h-6 text-red-600" />
            </button>
          </>
        )} */}

        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="tnc"
              checked={formData.acceptedTerms || false}
              onChange={(e) =>
                handleInputChange("acceptedTerms", e.target.checked as any)
              }
              className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
            />
            <label
              htmlFor="tnc"
              className="text-sm text-gray-700 cursor-pointer"
            >
              I have read and agree to the Terms & Conditions
            </label>
          </div>
          {errors.acceptedTerms && (
            <p className="text-sm text-red-600">{errors.acceptedTerms}</p>
          )}

          {/* ✅ T&C Box */}
          <div className="max-h-60 overflow-y-auto border border-orange-200 bg-orange-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>
                All coffee competitions will follow the WCE Rules and
                Regulations combined with the Organizing Body Rules &
                Regulations.
              </li>
              <li>
                Competitors must be at least 18 years of age for competing in
                the National Coffee Championships.
              </li>
              <li>
                Participant must hold a valid passport or documentation
                substantiating 24 months of residency, employment or scholastic
                enrolment.
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
                Registration slots are limited per competition and per city.
              </li>
              <li>
                Competitors are personally responsible for reading and
                understanding current Rules & Regulations and scoresheets.
              </li>
              <li>
                Failure to attend official briefing sessions will result in
                disqualification.
              </li>
              <li>
                Participants are responsible for bringing their own tools,
                ingredients, and accessories beyond the standard competition
                stage.
              </li>
              <li>
                Any damage to the competition equipment due to misuse or abuse
                is grounds for disqualification.
              </li>
              <li>
                Only Indian Origin Coffee Beans may be used for preparing all
                competition beverages.
              </li>
              <li>
                If a competitor violates 1 or more rules, they may be
                automatically disqualified.
              </li>
              <li>
                Only the competitor, designated interpreter, and authorized
                personnel are allowed on stage.
              </li>
            </ul>
          </div>
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

        <div className="pt-6">
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
          ) : (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}

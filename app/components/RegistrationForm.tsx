'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { RegistrationData, INDIAN_STATES, COMPETITIONS } from '@/app/types/registration';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface RegistrationFormProps {
  city: 'mumbai' | 'hyderabad' | 'bangalore';
}

export default function RegistrationForm({ city }: RegistrationFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<RegistrationData>>({
    city,
    name: '',
    email: '',
    mobile: '',
    address: '',
    state: '',
    pin: '',
    competition: '',
    aadhaarNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.mobile?.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.state) newErrors.state = 'State is required';
    
    if (!formData.pin?.trim()) {
      newErrors.pin = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pin)) {
      newErrors.pin = 'Please enter a valid 6-digit PIN code';
    }
    
    if (!formData.competition) newErrors.competition = 'Please select a competition';
    
    if (!formData.aadhaarNumber?.trim()) {
      newErrors.aadhaarNumber = 'Aadhaar number is required';
    } else if (!/^\d{12}$/.test(formData.aadhaarNumber.replace(/\s/g, ''))) {
      newErrors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const handleSubmitAndPay = async () => {
    if (!validateForm()) {
      toast({
        title: "Form Validation Error",
        description: "Please fix the errors in the form before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      // Simulate API call to create registration
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate Razorpay integration
      const selectedCompetition = COMPETITIONS.find(c => c.id === formData.competition);
      if (!selectedCompetition) throw new Error('Competition not found');

      // Mock Razorpay payment
      const paymentSuccess = await simulatePayment(selectedCompetition.price);

      if (paymentSuccess) {
        setPaymentStatus('success');
        toast({
          title: "Registration Successful! 🎉",
          description: "Payment completed successfully. Check your email and SMS for confirmation with PDF receipt.",
          variant: "default",
        });
        
        // Reset form after success
        setTimeout(() => {
          setFormData({
            city,
            name: '',
            email: '',
            mobile: '',
            address: '',
            state: '',
            pin: '',
            competition: '',
            aadhaarNumber: '',
          });
          setPaymentStatus('idle');
        }, 3000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      setPaymentStatus('failed');
      toast({
        title: "Payment Failed",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const simulatePayment = async (amount: number): Promise<boolean> => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90% success rate for demo purposes
    return Math.random() > 0.1;
  };

  const handleRetryPayment = () => {
    setPaymentStatus('idle');
    handleSubmitAndPay();
  };

  const selectedCompetition = COMPETITIONS.find(c => c.id === formData.competition);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name *</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={cn(
                "border-2 focus:border-orange-500 focus:ring-orange-500",
                errors.name && "border-red-500"
              )}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email * (Unique)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={cn(
                "border-2 focus:border-orange-500 focus:ring-orange-500",
                errors.email && "border-red-500"
              )}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">Mobile * (Unique)</Label>
            <Input
              id="mobile"
              placeholder="10-digit mobile number"
              value={formData.mobile || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                handleInputChange('mobile', value);
              }}
              className={cn(
                "border-2 focus:border-orange-500 focus:ring-orange-500",
                errors.mobile && "border-red-500"
              )}
            />
            {errors.mobile && <p className="text-sm text-red-600">{errors.mobile}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin" className="text-sm font-medium text-gray-700">PIN Code *</Label>
            <Input
              id="pin"
              placeholder="6-digit PIN code"
              value={formData.pin || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                handleInputChange('pin', value);
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
          <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address *</Label>
          <Textarea
            id="address"
            placeholder="Enter your complete address"
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
            className={cn(
              "border-2 focus:border-orange-500 focus:ring-orange-500 resize-none",
              errors.address && "border-red-500"
            )}
          />
          {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">State *</Label>
          <Select value={formData.state || ''} onValueChange={(value) => handleInputChange('state', value)}>
            <SelectTrigger className={cn(
              "border-2 focus:border-orange-500 focus:ring-orange-500",
              errors.state && "border-red-500"
            )}>
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
          {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Select Competition *</Label>
          <Select value={formData.competition || ''} onValueChange={(value) => handleInputChange('competition', value)}>
            <SelectTrigger className={cn(
              "border-2 focus:border-orange-500 focus:ring-orange-500",
              errors.competition && "border-red-500"
            )}>
              <SelectValue placeholder="Choose competition" />
            </SelectTrigger>
            <SelectContent>
              {COMPETITIONS.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.name} / ₹ {comp.price.toLocaleString('en-IN')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.competition && <p className="text-sm text-red-600">{errors.competition}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="aadhaar" className="text-sm font-medium text-gray-700">Aadhaar Number * (Unique)</Label>
          <Input
            id="aadhaar"
            placeholder="12-digit Aadhaar number"
            value={formatAadhaar(formData.aadhaarNumber || '')}
            onChange={(e) => {
              const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 12);
              handleInputChange('aadhaarNumber', value);
            }}
            className={cn(
              "border-2 focus:border-orange-500 focus:ring-orange-500",
              errors.aadhaarNumber && "border-red-500"
            )}
          />
          {errors.aadhaarNumber && <p className="text-sm text-red-600">{errors.aadhaarNumber}</p>}
        </div>

        {selectedCompetition && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Registration Fee:</span>
              <span className="text-2xl font-bold text-orange-600">
                ₹ {selectedCompetition.price.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        <div className="pt-6">
          {paymentStatus === 'success' ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-green-700">Registration Successful!</h3>
                <p className="text-green-600">Check your email and SMS for confirmation with PDF receipt.</p>
              </div>
            </div>
          ) : paymentStatus === 'failed' ? (
            <div className="text-center space-y-4">
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-red-700">Payment Failed</h3>
                <p className="text-red-600 mb-4">There was an issue processing your payment.</p>
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
              disabled={loading || paymentStatus === 'processing'}
            >
              {loading || paymentStatus === 'processing' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {paymentStatus === 'processing' ? 'Processing Payment...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Submit & Pay {selectedCompetition ? `₹ ${selectedCompetition.price.toLocaleString('en-IN')}` : ''}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
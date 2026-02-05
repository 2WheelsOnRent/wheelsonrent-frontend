import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Phone } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSendOTP = () => {
    if (phoneNumber.length === 10) {
      // Mock OTP send
      setStep('otp');
      toast.message('OTP sent to your phone number: 1234');
    } else {
      toast.error('Please enter a valid 10-digit phone number');
    }
  };

  const handleVerifyOTP = () => {
    if (!termsAccepted) {
      toast.error('Please accept the Terms & Conditions');
      return;
    }

    // Mock OTP verification
    if (otp === '1234') {
      localStorage.setItem('isLoggedIn', 'true');
      toast.success('Login successful!');
      navigate('/profile');
    } else {
      toast.error('Invalid OTP. Please try: 1234');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-3xl text-black mb-2">Welcome Back</h1>
              <p className="text-gray-600">Login to continue your booking</p>
            </div>

            {step === 'phone' ? (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="phone" className="mb-2 block">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    We'll send you an OTP to verify your number
                  </p>
                </div>

                <Button
                  onClick={handleSendOTP}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6"
                >
                  Send OTP
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="otp" className="mb-2 block">
                    Enter OTP
                  </Label>
                  <div className="relative">
                    {/* <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /> */}
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 4-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="pl-10 tracking-widest text-center text-xl"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    OTP sent to +91 {phoneNumber}
                  </p>
                  <button
                    onClick={() => setStep('phone')}
                    className="text-sm text-blue-500 hover:text-blue-600 mt-2"
                  >
                    Change number
                  </button>
                </div>

               <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      className="self-start mt-1"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer leading-5">
                      I accept the{' '}
                      <a href="/terms" className="text-blue-500 hover:underline">
                        Terms & Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacy-policy" className="text-blue-500 hover:underline">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>


                <Button
                  onClick={handleVerifyOTP}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6"
                  disabled={!termsAccepted}
                >
                  Verify & Login
                </Button>

                <button
                  onClick={handleSendOTP}
                  className="w-full text-center text-sm text-gray-600 hover:text-blue-500"
                >
                  Didn't receive OTP? Resend
                </button>
              </div>
            )}
          </div>

          {/* Demo credentials
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">Demo Credentials:</p>
            <p className="text-sm text-gray-600">• Any 10-digit phone number</p>
            <p className="text-sm text-gray-600">• OTP: 1234</p>
          </div> */}
        </div>
      </div>

      <Footer />
    </div>
  );
}

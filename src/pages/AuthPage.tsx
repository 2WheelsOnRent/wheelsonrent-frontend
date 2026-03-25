import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, Lock, Mail, User, ArrowRight, AlertCircle,  Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSendOtpMutation, useVerifyOtpMutation } from '../store/api/authApi';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone');
  const [, setGeneratedOtp] = useState('');

  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [/*verifyOtp*/, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const response = await sendOtp({ phoneNumber: `+91${phoneNumber}` }).unwrap();
      
      if (response.success) {
        setGeneratedOtp(response.otp || '');
        setStep('otp');
        toast.success(response.message, {
          description: response.otp ? `Development OTP: ${response.otp}` : undefined,
          duration: 10000,
        });
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast.error(error?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      // const response = await verifyOtp({
      //   phoneNumber: `+91${phoneNumber}`,
      //   otp,
      //   name: name || undefined,
      //   email: email || undefined,
      // }).unwrap();

      // if (response.success && response.token && response.user) {
      //   // Check if new user needs to provide details
      //   if (response.isNewUser && (!response.user.userNumber || response.user.name === 'User')) {
      //     setIsNewUser(true);
      //     setStep('details');
      //     toast.info('Please complete your profile');
      //     return;
      //   }

      //   // Store auth data
      //   localStorage.setItem('token', response.token);
      //   localStorage.setItem('userId', response.user.id.toString());
      //   localStorage.setItem('userPhone', response.user.phoneNumber);
      //   localStorage.setItem('userName', response.user.name);
      //   localStorage.setItem('isLoggedIn', 'true');

      //   dispatch(setCredentials({
      //     user: response.user,
      //     token: response.token,
      //   }));

      //   toast.success(response.message);
        
      //   // Navigate to intended page
      //   setTimeout(() => {
      //     navigate(from, { replace: true });
      //   }, 500);
      // } else {
      //   toast.error(response.message);
      // }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      toast.error(error?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.trim().length < 2) {
      toast.error('Please enter your name');
      return;
    }

    try {
      // const response = await verifyOtp({
      //   phoneNumber: `+91${phoneNumber}`,
      //   otp,
      //   name,
      //   email: email || undefined,
      // }).unwrap();

      // if (response.success && response.token && response.user) {
      //   // Store auth data
      //   localStorage.setItem('token', response.token);
      //   localStorage.setItem('userId', response.user.id.toString());
      //   localStorage.setItem('userPhone', response.user.phoneNumber);
      //   localStorage.setItem('userName', response.user.name);
      //   localStorage.setItem('isLoggedIn', 'true');

      //   dispatch(setCredentials({
      //     user: response.user,
      //     token: response.token,
      //   }));

      //   toast.success('Profile completed successfully!');
        
      //   setTimeout(() => {
      //     navigate(from, { replace: true });
      //   }, 500);
      // }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await sendOtp({ phoneNumber: `+91${phoneNumber}` }).unwrap();
      
      if (response.success) {
        setGeneratedOtp(response.otp || '');
        toast.success('OTP resent successfully', {
          description: response.otp ? `Development OTP: ${response.otp}` : undefined,
          duration: 10000,
        });
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Scooty<span className="text-blue-600">onrent</span>
          </h1>
          <p className="text-gray-600">
            {step === 'phone' && 'Enter your phone number to continue'}
            {step === 'otp' && 'Verify your phone number'}
            {step === 'details' && 'Complete your profile'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Phone Number Step */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                    <span className="text-gray-500">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full pl-24 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    maxLength={10}
                    required
                  />
                </div>
                {phoneNumber.length > 0 && phoneNumber.length !== 10 && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Phone number must be 10 digits
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSendingOtp || phoneNumber.length !== 10}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP Verification Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center mb-4"
                >
                  ← Change Phone Number
                </button>
                <p className="text-sm text-gray-600 mb-4">
                  OTP sent to +91-{phoneNumber}
                </p>
              </div>

              {/* {generatedOtp && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Development OTP: <strong className="ml-2">{generatedOtp}</strong>
                  </p>
                </div>
              )} */}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp || otp.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center mb-4"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isSendingOtp}
                className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Resend OTP
              </button>
            </form>
          )}

          {/* Profile Details Step */}
          {step === 'details' && (
            <form onSubmit={handleCompleteProfile}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp || !name || name.trim().length < 2}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthPage;

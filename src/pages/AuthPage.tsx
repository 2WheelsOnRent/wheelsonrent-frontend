import React, { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  User,
  Mail,
} from "lucide-react";
import { useSendOtpMutation, useVerifyOtpMutation } from "../store/api/authApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCredentials } from "../store/slices/authSlice";
import { toast } from "sonner";
import Header from "../components/Header";
import BackgroundSlideshow from "../components/BackgroundSlideshow";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState<"phone" | "otp" | "details">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [sendOtp] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();

  // Only redirect if already logged in as USER — admin token does NOT count here
  if (isAuthenticated && user?.userType === "user") {
    return <Navigate to="/profile" replace />;
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) return;
    setIsSendingOtp(true);
    try {
      const response = await sendOtp({ phoneNumber }).unwrap();
      if (response.success) {
        setStep("otp");
        toast.success("OTP sent to your mobile number");
      } else {
        toast.error("Failed to send OTP", { description: response.message });
      }
    } catch (err: any) {
      toast.error("Failed to send OTP", {
        description: err?.data?.message ?? "Please try again",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setIsVerifyingOtp(true);
    try {
      const response = await verifyOtp({ phoneNumber, otp }).unwrap();
      if (response.success && response.token && response.user) {
        if (response.isNewUser) {
          // New user — collect name/email
          setStep("details");
          setIsVerifyingOtp(false);
          return;
        }
        // Existing user — log them in directly
        completeLogin(response);
      } else {
        toast.error("Invalid OTP", { description: response.message });
      }
    } catch (err: any) {
      toast.error("Verification failed", {
        description: err?.data?.message ?? "Please try again",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) return;
    setIsVerifyingOtp(true);
    try {
      // Re-verify with name/email to update profile
      const response = await verifyOtp({ phoneNumber, otp, name, email }).unwrap();
      if (response.success && response.token && response.user) {
        completeLogin(response);
      } else {
        toast.error("Failed to complete registration", {
          description: response.message,
        });
      }
    } catch (err: any) {
      toast.error("Failed", {
        description: err?.data?.message ?? "Please try again",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const completeLogin = (response: any) => {
    dispatch(
      setCredentials({
        user: {
          id: response.user.id,
          name: response.user.name ?? response.user.userNumber,
          phone: response.user.userNumber,
          email: response.user.email ?? undefined,
          userType: "user",
          districtId: response.user.districtId ?? undefined,
        },
        token: response.token,
      })
    );

    localStorage.setItem("token", response.token);
    localStorage.setItem("userId", response.user.id.toString());
    localStorage.setItem("userPhone", response.user.userNumber);
    localStorage.setItem("userName", response.user.name ?? response.user.userNumber);
    if (response.user.email) {
      localStorage.setItem("userEmail", response.user.email);
    }

    toast.success(response.isNewUser ? "Welcome to ScootyOnRent!" : "Welcome back!", {
      description: "You are now logged in.",
    });

    // Restore booking intent
    const intentRaw = sessionStorage.getItem("bookingIntent");
    if (intentRaw) {
      try {
        const intent = JSON.parse(intentRaw);
        sessionStorage.removeItem("bookingIntent");
        if (intent.vehicleId) {
          const params = new URLSearchParams();
          if (intent.startDate) params.set("startDate", intent.startDate);
          if (intent.startTime) params.set("startTime", intent.startTime);
          if (intent.endDate) params.set("endDate", intent.endDate);
          if (intent.endTime) params.set("endTime", intent.endTime);
          navigate(`/book/${intent.vehicleId}?${params.toString()}`, {
            replace: true,
          });
          return;
        }
      } catch {
        sessionStorage.removeItem("bookingIntent");
      }
    }

    // Restore react-router redirect
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== "/auth" && from !== "/login") {
      navigate(from, { replace: true });
      return;
    }

    navigate("/profile", { replace: true });
  };

  const handleResendOtp = async () => {
    setOtp("");
    await handleSendOtp({ preventDefault: () => {} } as any);
  };

  return (
    <div className="min-h-screen bg-white relative">
      <BackgroundSlideshow />
      <div className="relative z-10">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-8 shadow-lg">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-black mb-2">
                  {step === "phone"
                    ? "Welcome Back"
                    : step === "otp"
                    ? "Enter OTP"
                    : "Complete Profile"}
                </h1>
                <p className="text-gray-600">
                  {step === "phone"
                    ? "Login to continue your booking"
                    : step === "otp"
                    ? `OTP sent to +91-${phoneNumber}`
                    : "Just a few more details"}
                </p>
              </div>

              {/* Step: Phone */}
              {step === "phone" && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400 ml-3" />
                      </div>
                      <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                        <span className="text-gray-500">+91</span>
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) =>
                          setPhoneNumber(
                            e.target.value.replace(/\D/g, "").slice(0, 10)
                          )
                        }
                        placeholder="9876543210"
                        className="w-full pl-24 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
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
                    className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
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

              {/* Step: OTP */}
              {step === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setOtp("");
                      }}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center mb-4"
                    >
                      ← Change Phone Number
                    </button>
                  </div>

                  <div>
                    <label
                      htmlFor="otp"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Enter OTP
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="123456"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest"
                        maxLength={6}
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      OTP expires in 10 minutes
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center mb-4"
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
                    className="w-full text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Resend OTP
                  </button>
                </form>
              )}

              {/* Step: Profile Details (new users only) */}
              {step === "details" && (
                <form onSubmit={handleCompleteProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
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
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email{" "}
                      <span className="text-gray-400 font-normal">(Optional)</span>
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
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || !name || name.trim().length < 2}
                    className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
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

              <p className="text-center text-sm text-gray-600 mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

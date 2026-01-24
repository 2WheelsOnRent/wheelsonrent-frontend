import React, { useState, useEffect } from 'react';
import { Mail, Lock, Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from '../store/api/authApi';
import { useAppDispatch } from '../store/hooks';
import { setCredentials, setLoading } from '../store/slices/authSlice';
import { API_CONFIG } from '../config/api.config';
import { toast } from 'sonner';
import type { User as UserType } from '../store/slices/authSlice';

const AuthPage: React.FC = () => {
  const [userType, setUserType] = useState<'user' | 'admin' | 'superadmin'>('user');
  const [otpSent, setOtpSent] = useState(false);
  
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
    otpCode: ''
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  // Auto-fill dummy data based on user type
  useEffect(() => {
    setOtpSent(false);
    
    if (userType === 'user') {
      setLoginData({
        identifier: '9876543210',
        password: '',
        otpCode: ''
      });
    } else if (userType === 'admin') {
      setLoginData({
        identifier: 'admin@2wheelsonrent.com',
        password: 'password123',
        otpCode: ''
      });
    } else {
      setLoginData({
        identifier: 'superadmin@2wheelsonrent.com',
        password: 'password123',
        otpCode: ''
      });
    }
  }, [userType]);

  const handleSendOtp = async () => {
    if (!loginData.identifier.trim()) {
      toast.error('Please enter phone number');
      return;
    }
    
    try {
      // For now, just simulate OTP send (backend skeleton)
      await new Promise(resolve => setTimeout(resolve, 500));
      setOtpSent(true);
      toast.success(`OTP sent to ${loginData.identifier}`, {
        description: `Use OTP: ${API_CONFIG.OTP_BYPASS}`,
        duration: 5000,
      });
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));

    try {
      // Prepare login request based on user type
      const loginRequest = {
        type: userType,
        identifier: loginData.identifier.trim(),
        password: userType !== 'user' ? loginData.password : undefined,
        otpCode: userType === 'user' ? loginData.otpCode : undefined,
      };

      // Validate inputs
      if (userType === 'user') {
        if (!otpSent) {
          toast.error('Please send OTP first');
          dispatch(setLoading(false));
          return;
        }
        if (!loginData.otpCode.trim()) {
          toast.error('Please enter OTP');
          dispatch(setLoading(false));
          return;
        }
      } else {
        if (!loginData.password.trim()) {
          toast.error('Please enter password');
          dispatch(setLoading(false));
          return;
        }
      }

      // Call login API
      const response = await login(loginRequest).unwrap();

      if (response.success && response.token && response.userData) {
        // Map backend response to frontend User type
        const user: UserType = {
          id: response.userData.id,
          name: response.userData.username || response.userData.userNumber || 'User',
          email: response.userData.email,
          phone: response.userData.userNumber,
          userType: userType,
          districtId: response.userData.districtId,
          role: response.userData.role,
        };

        // Store credentials in Redux + localStorage
        dispatch(
          setCredentials({
            user,
            token: response.token,
            refreshToken: response.refreshToken,
          })
        );

        toast.success('Login successful!', {
          description: `Welcome back, ${user.name}!`,
        });

        // Navigate based on user type
        setTimeout(() => {
          if (userType === 'user') {
            navigate('/dashboard');
          } else {
            navigate('/admin');
          }
        }, 500);
      } else {
        toast.error('Login failed', {
          description: response.message || 'Please check your credentials.',
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.status === 400) {
        toast.error('Invalid credentials', {
          description: error.data?.message || 'Please check your input.',
        });
      } else if (error.status === 401) {
        toast.error('Authentication failed', {
          description: 'Invalid email/password or OTP',
        });
      } else if (error.status === 404) {
        toast.error('User not found', {
          description: 'Please check your credentials.',
        });
      } else {
        toast.error('Network error', {
          description: 'Please check if backend is running.',
        });
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
            <h2 className="text-2xl font-bold">Welcome to 2WheelsOnRent</h2>
            <p className="text-blue-100 text-sm mt-1">Login to continue</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Login As</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['user', 'admin', 'superadmin'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserType(type)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                        userType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'user' ? 'User' : type === 'admin' ? 'Admin' : 'Super Admin'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  {userType === 'user' && `📱 Phone: +919876543210 | OTP: ${API_CONFIG.OTP_BYPASS}`}
                  {userType === 'admin' && '📧 Email: admin@2wheelsonrent.com | 🔒 Password: password123'}
                  {userType === 'superadmin' && '📧 Email: superadmin@2wheelsonrent.com | 🔒 Password: password123'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userType === 'user' ? (
                    <><Phone className="inline w-4 h-4 mr-1" />Phone Number</>
                  ) : (
                    <><Mail className="inline w-4 h-4 mr-1" />Email Address</>
                  )}
                </label>
                <input
                  type={userType === 'user' ? 'tel' : 'email'}
                  value={loginData.identifier}
                  onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                  placeholder={userType === 'user' ? '9876543210' : 'admin@example.com'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
              </div>

              {userType !== 'user' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="inline w-4 h-4 mr-1" />Password
                  </label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                </div>
              )}

              {userType === 'user' && (
                <>
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      Send OTP
                    </button>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                      <input
                        type="text"
                        value={loginData.otpCode}
                        onChange={(e) => setLoginData({ ...loginData, otpCode: e.target.value })}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                        disabled={isLoading}
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>

              {userType !== 'user' && (
                <div className="text-center">
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Forgot Password?</a>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">API: {API_CONFIG.BASE_URL}</div>
      </div>
    </div>
  );
};

export default AuthPage;

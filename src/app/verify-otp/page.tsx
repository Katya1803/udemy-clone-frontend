'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  const getErrorMessage = (err: any): string => {
    // Try different error paths
    if (err.response?.data?.data?.message) {
      return err.response.data.data.message;
    }
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.response?.data?.data?.details) {
      // Validation errors
      const details = err.response.data.data.details;
      return details.map((d: any) => d.message).join(', ');
    }
    if (err.message) {
      return err.message;
    }
    return 'An error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    if (!/^\d+$/.test(otp)) {
      setError('OTP must contain only numbers');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.verifyOtp({ email, otp });
      
      if (response.success && response.data) {
        const { access_token, user } = response.data;
        
        // Save auth state
        setAuth(user, access_token);
        
        setSuccess('Verification successful! Redirecting...');
        
        // Redirect to homepage
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setResending(true);

    try {
      const response = await authApi.resendOtp({ email });
      
      if (response.success) {
        setSuccess('New OTP sent successfully! Please check your email.');
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spring-500 to-spring-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a 6-digit code to
            <br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength={6}
              pattern="\d{6}"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setOtp(value);
                setError('');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spring-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
              placeholder="000000"
            />
            <p className="mt-1 text-xs text-gray-500 text-center">
              6-digit code (numbers only)
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-spring-600 text-white py-3 rounded-lg hover:bg-spring-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResendOtp}
            disabled={resending}
            className="text-spring-600 hover:text-spring-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>

        {/* Back to Register */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/register')}
            className="text-gray-600 hover:text-gray-700"
          >
            ← Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-spring-500 to-spring-700 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
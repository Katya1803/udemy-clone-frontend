'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { useAuthStore } from '@/store/auth.store';
import { userApi } from '@/services/user.service';
import { UserResponse, UpdateUserProfileRequest, Gender } from '@/types/api.types';
import { useRouter } from 'next/navigation';

type MenuItem = 'profile' | 'courses' | 'settings';

export default function UserInformationPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [activeMenu, setActiveMenu] = useState<MenuItem>('profile');
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profileForm, setProfileForm] = useState<UpdateUserProfileRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: undefined,
    bio: '',
    address: '',
    city: '',
    country: '',
  });

  // Wait for hydration before checking auth
  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadUserData();
  }, [isAuthenticated, isHydrated, router]);

  const loadUserData = async () => {
    try {
      const response = await userApi.getCurrentUser();
      if (response.success && response.data) {
        setUserData(response.data);
        
        // Populate form with existing data
        if (response.data.profile) {
          setProfileForm({
            firstName: response.data.profile.firstName || '',
            lastName: response.data.profile.lastName || '',
            phone: response.data.profile.phone || '',
            dateOfBirth: response.data.profile.dateOfBirth || '',
            gender: response.data.profile.gender,
            bio: response.data.profile.bio || '',
            address: response.data.profile.address || '',
            city: response.data.profile.city || '',
            country: response.data.profile.country || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      if ((error as any)?.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    // Validate date of birth is in the past
    if (profileForm.dateOfBirth) {
      const dob = new Date(profileForm.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dob >= today) {
        return 'Date of birth must be in the past';
      }
    }

    // Validate phone format
    if (profileForm.phone && !/^[0-9+\-\s()]*$/.test(profileForm.phone)) {
      return 'Invalid phone number format';
    }

    return null;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.id) return;

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await userApi.updateProfile(userData.id, profileForm);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        await loadUserData();
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  // Show loading while hydrating
  if (!isHydrated || (loading && !userData)) {
    return (
      <>
        <TopBar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spring-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              {/* Sidebar Menu */}
              <div className="md:w-64 bg-gray-100 p-6">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveMenu('profile')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeMenu === 'profile'
                        ? 'bg-spring-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveMenu('courses')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeMenu === 'courses'
                        ? 'bg-spring-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    My Courses
                  </button>
                  <button
                    onClick={() => setActiveMenu('settings')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeMenu === 'settings'
                        ? 'bg-spring-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Settings
                  </button>
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 md:p-8">
                {/* Message Alert */}
                {message && (
                  <div
                    className={`mb-6 p-4 rounded-lg ${
                      message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {/* Profile Tab */}
                {activeMenu === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={profileForm.firstName}
                            onChange={handleProfileChange}
                            maxLength={50}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spring-500 focus:border-transparent"
                            placeholder="Enter your first name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={profileForm.lastName}
                            onChange={handleProfileChange}
                            maxLength={50}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spring-500 focus:border-transparent"
                            placeholder="Enter your last name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            maxLength={20}
                            pattern="[0-9+\-\s()]*"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spring-500 focus:border-transparent"
                            placeholder="Enter your phone number"
                          />
                          <p className="mt-1 text-xs text-gray-500">Format: numbers, +, -, spaces, ()</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={profileForm.dateOfBirth}
                            onChange={handleProfileChange}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spring-500 focus:border-transparent"
                          />
                          <p className="mt-1 text-xs text-gray-500">Must be in the past</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                          </label>
                          <select
                            name="gender"
                            value={profileForm.gender || ''}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spring-500 focus:border-transparent"
                          >
                            <option value="">Select gender</option>
                            <option value={Gender.MALE}>Male</option>
                            <option value={Gender.FEMALE}>Female</option>
                            <option value={Gender.OTHER}>Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={profileForm.bio}
                          onChange={handleProfileChange}
                          rows={4}
                          maxLength={500}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spring-500 focus:border-transparent"
                          placeholder="Tell us about yourself (max 500 characters)"
                        />
                        <p className="mt-1 text-xs text-gray-500 text-right">
                          {profileForm.bio?.length || 0} / 500
                        </p>
                      </div>

                      {/* Address */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Street Address
                            </label>
                            <input
                              type="text"
                              name="address"
                              value={profileForm.address}
                              onChange={handleProfileChange}
                              maxLength={200}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spring-500 focus:border-transparent"
                              placeholder="Enter your street address"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={profileForm.city}
                              onChange={handleProfileChange}
                              maxLength={100}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spring-500 focus:border-transparent"
                              placeholder="Enter your city"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Country
                            </label>
                            <input
                              type="text"
                              name="country"
                              value={profileForm.country}
                              onChange={handleProfileChange}
                              maxLength={100}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spring-500 focus:border-transparent"
                              placeholder="Enter your country"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-3 bg-spring-600 text-white rounded-lg hover:bg-spring-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* My Courses Tab */}
                {activeMenu === 'courses' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h2>
                    <p className="text-gray-600">Your enrolled courses will appear here.</p>
                  </div>
                )}

                {/* Settings Tab */}
                {activeMenu === 'settings' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
                    <p className="text-gray-600">Account settings coming soon.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
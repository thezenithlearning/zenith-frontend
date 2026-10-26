'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail,
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { 
  useGetSessionsQuery, 
  useLogoutAllMutation
} from '../../../features/auth/api/authApi';
import TrafficStats from '../../../components/dashboard/TrafficStats';
import DashboardStats from '../../../components/dashboard/DashboardStats';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, initialized } = useAuth();
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  console.log('🔍 Dashboard: Auth state:', { 
    isAuthenticated, 
    isLoading, 
    initialized, 
    user: !!user,
    isRedirecting 
  });

  // Only fetch sessions when authenticated and initialized
  const { 
    data: sessions = [], 
    isLoading: sessionsLoading, 
    error: sessionsError,
    refetch: refetchSessions
  } = useGetSessionsQuery(undefined, {
    skip: !isAuthenticated || isLoading || !initialized || isRedirecting,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  console.log('🔍 Dashboard: Sessions state:', { 
    sessionsLoading, 
    sessionsCount: sessions?.length, 
    hasError: !!sessionsError,
    skip: !isAuthenticated || isLoading || !initialized || isRedirecting
  });

  const [logoutAll, { isLoading: logoutAllLoading }] = useLogoutAllMutation();
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);

  // Redirect if not authenticated - with proper checks
  useEffect(() => {
    console.log('🔍 Dashboard: Redirect check:', { 
      initialized, 
      isLoading, 
      isAuthenticated,
      isRedirecting 
    });
    
    // Only redirect after initialization is complete and not loading
    if (initialized && !isLoading && !isRedirecting) {
      if (!isAuthenticated) {
        console.log('🔒 Not authenticated, redirecting to login...');
        setIsRedirecting(true);
        router.replace('/login');
      } else {
        console.log('✅ Authenticated, staying on dashboard');
      }
    }
  }, [isAuthenticated, isLoading, initialized, router, isRedirecting]);

  // Log sessions error but don't redirect
  useEffect(() => {
    if (sessionsError) {
      console.error('❌ Sessions error:', sessionsError);
      // Don't redirect - useAuth handles it
    }
    
    if (!sessionsLoading && sessions !== undefined) {
      setSessionsLoaded(true);
    }
  }, [sessionsError, sessionsLoading, sessions]);

  // Refetch sessions when authenticated
  useEffect(() => {
    if (isAuthenticated && initialized && !sessionsLoaded && !isRedirecting) {
      console.log('🔄 Fetching sessions...');
      refetchSessions();
    }
  }, [isAuthenticated, initialized, refetchSessions, sessionsLoaded, isRedirecting]);

  const handleLogoutAll = async () => {
    try {
      await logoutAll().unwrap();
      setShowLogoutAllConfirm(false);
      setIsRedirecting(true);
      router.push('/login');
    } catch (error) {
      console.error('Logout all failed:', error);
    }
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Loading state - show only while initializing
  if (!initialized || isLoading || isRedirecting) {
    console.log('🔍 Dashboard: Showing loading state');
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
          <p className="text-sm text-gray-400 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render (will redirect)
  if (!isAuthenticated) {
    console.log('🔍 Dashboard: Not authenticated, returning null');
    return null;
  }

  console.log('🔍 Dashboard: Rendering dashboard content');
  
  // Rest of your dashboard JSX...
  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-0 pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5 sm:mt-1">
          Welcome back, <span className="font-medium text-gray-700">{getDisplayName()}</span>!
        </p>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-blue-50 rounded-xl">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Email</p>
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {user?.email || 'Not set'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-purple-50 rounded-xl">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Role</p>
              <p className="text-xs sm:text-sm font-medium text-gray-900 capitalize truncate">
                {user?.role || 'User'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-green-50 rounded-xl">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Active Sessions</p>
              <p className="text-xs sm:text-sm font-medium text-gray-900">
                {sessionsLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  sessions?.length || 0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-yellow-50 rounded-xl">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Verified</p>
              <p className="text-xs sm:text-sm font-medium text-green-600 flex items-center gap-1">
                {user?.isVerified ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block flex-shrink-0"></span>
                    <span>Yes</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full inline-block flex-shrink-0"></span>
                    <span>Pending</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live platform statistics & charts */}
      <DashboardStats />

      <TrafficStats />

      {/* Session Manager */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Session Manager */}
        <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Active Sessions</h3>
            <div className="flex items-center gap-2">
              {sessions && sessions.length > 1 && (
                <button id="dashboard-logout-all-button"
                  onClick={() => setShowLogoutAllConfirm(true)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 hover:underline transition-colors active:scale-95"
                >
                  <span className="hidden xs:inline">Logout All</span>
                  <LogOut className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {sessionsLoading ? (
              <div className="text-center py-6">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="mt-3 text-sm text-gray-500">Loading sessions...</p>
              </div>
            ) : sessions && sessions.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {sessions.map((session) => {
                  const isCurrentSession = session.id === sessions[0]?.id;
                  return (
                    <div
                      key={session.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors duration-150 ${
                        isCurrentSession ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isCurrentSession ? 'bg-blue-200' : 'bg-blue-100'
                      }`}>
                        <Activity className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          isCurrentSession ? 'text-blue-700' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {session.userAgent || 'Unknown Device'}
                          </p>
                          {isCurrentSession && (
                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5">
                          <p className="text-xs text-gray-500 truncate">{session.ip || 'Unknown IP'}</p>
                          <span className="text-xs text-gray-300 hidden xs:inline">•</span>
                          <p className="text-xs text-gray-500 hidden xs:inline">
                            {new Date(session.lastUsedAt).toLocaleDateString()} {new Date(session.lastUsedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-gray-500 hidden xs:inline">Active</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active sessions found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout All Confirm Dialog */}
      {showLogoutAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 shadow-xl mx-4 animate-scaleIn">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Logout All Devices
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This will log you out from all {sessions?.length || 0} active sessions. 
                  You will need to login again on all devices.
                </p>
                <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 mt-4">
                  <button id="dashboard-logout-all-sessions-button"
                    onClick={handleLogoutAll}
                    disabled={logoutAllLoading}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2 active:scale-95"
                  >
                    {logoutAllLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      'Yes, Logout All'
                    )}
                  </button>
                  <button id="dashboard-cancel-button"
                    onClick={() => setShowLogoutAllConfirm(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
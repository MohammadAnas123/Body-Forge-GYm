// src/hooks/useAuth.tsx - SECURE Hybrid Session Management
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  status?: string;
}

interface LocalSession {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userData?: UserData;
  deviceFingerprint?: string; // Device verification
  lastActivity?: number; // Inactivity timeout
}

const SESSION_KEY = 'app_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // REDUCED: 24 hours instead of 7 days
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity = auto logout
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute

export const useAuth = () => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const userDataRef = useRef<UserData | null>(null);
  const isVerifyingRef = useRef(false);
  const activityTimeoutRef = useRef<number | null>(null);

  // Generate device fingerprint (basic - can be enhanced)
  const getDeviceFingerprint = (): string => {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  // Encrypt sensitive data before storing (basic XOR encryption)
  // In production, use Web Crypto API or a proper encryption library
  const encryptData = (data: string, key: string): string => {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result); // Base64 encode
  };

  const decryptData = (encrypted: string, key: string): string => {
    try {
      const decoded = atob(encrypted);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch {
      return '';
    }
  };

  // Save session with encryption
  const saveSession = (session: LocalSession) => {
    try {
      const deviceKey = getDeviceFingerprint();
      session.deviceFingerprint = deviceKey;
      session.lastActivity = Date.now();
      
      const sessionString = JSON.stringify(session);
      const encrypted = encryptData(sessionString, deviceKey);
      
      localStorage.setItem(SESSION_KEY, encrypted);
      console.log('[useAuth] Session saved securely');
    } catch (error) {
      console.error('[useAuth] Error saving session:', error);
    }
  };

  // Load and validate session
  const loadSession = (): LocalSession | null => {
    try {
      const encrypted = localStorage.getItem(SESSION_KEY);
      if (!encrypted) return null;
      
      const deviceKey = getDeviceFingerprint();
      const decrypted = decryptData(encrypted, deviceKey);
      
      if (!decrypted) {
        console.warn('[useAuth] Failed to decrypt session');
        clearSession();
        return null;
      }
      
      const session: LocalSession = JSON.parse(decrypted);
      
      // Validate device fingerprint
      if (session.deviceFingerprint !== deviceKey) {
        console.warn('[useAuth] Device fingerprint mismatch - possible session theft');
        clearSession();
        toast({
          title: 'Security Alert',
          description: 'Session invalid. Please sign in again.',
          variant: 'destructive',
        });
        return null;
      }
      
      // Check session expiry
      if (Date.now() > session.expiresAt) {
        console.log('[useAuth] Session expired');
        clearSession();
        return null;
      }
      
      // Check inactivity timeout
      if (session.lastActivity && (Date.now() - session.lastActivity) > INACTIVITY_TIMEOUT) {
        console.log('[useAuth] Session expired due to inactivity');
        clearSession();
        toast({
          title: 'Session Expired',
          description: 'You were logged out due to inactivity.',
        });
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('[useAuth] Error loading session:', error);
      clearSession();
      return null;
    }
  };

  // Clear session
  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    console.log('[useAuth] Session cleared');
  };

  // Update last activity timestamp
  const updateActivity = () => {
    const session = loadSession();
    if (session) {
      session.lastActivity = Date.now();
      saveSession(session);
    }
  };

  // Update session with user data
  const updateSessionUserData = (userData: UserData) => {
    const session = loadSession();
    if (session) {
      session.userData = userData;
      saveSession(session);
    }
  };

  // Verify session with Supabase
  const verifyAndRefreshSession = async (session: LocalSession) => {
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;

    try {
      console.log('[useAuth] Verifying session with Supabase...');
      
      const { data, error } = await supabase.auth.setSession({
        access_token: session.accessToken,
        refresh_token: session.refreshToken,
      });

      if (error || !data.session) {
        console.error('[useAuth] Session verification failed:', error);
        clearSession();
        setUser(null);
        setUserData(null);
        userDataRef.current = null;
        
        toast({
          title: 'Session Expired',
          description: 'Please sign in again',
          variant: 'destructive',
        });
        return;
      }

      // Session valid - update if tokens changed
      if (data.session.access_token !== session.accessToken) {
        console.log('[useAuth] Session refreshed');
        const newSession: LocalSession = {
          userId: data.user.id,
          email: data.user.email || session.email,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: Date.now() + SESSION_DURATION,
          userData: session.userData
        };
        saveSession(newSession);
      }

      console.log('[useAuth] Session verified successfully');
    } catch (error) {
      console.error('[useAuth] Error verifying session:', error);
    } finally {
      isVerifyingRef.current = false;
    }
  };

  // Setup activity tracking
  const setupActivityTracking = () => {
    // Track user activity
    const trackActivity = () => updateActivity();
    
    window.addEventListener('mousedown', trackActivity);
    window.addEventListener('keydown', trackActivity);
    window.addEventListener('scroll', trackActivity);
    window.addEventListener('touchstart', trackActivity);

    // Check inactivity periodically
    activityTimeoutRef.current = window.setInterval(() => {
      const session = loadSession();
      if (!session) {
        // Session expired, logout
        setUser(null);
        setUserData(null);
        userDataRef.current = null;
      }
    }, ACTIVITY_CHECK_INTERVAL);

    return () => {
      window.removeEventListener('mousedown', trackActivity);
      window.removeEventListener('keydown', trackActivity);
      window.removeEventListener('scroll', trackActivity);
      window.removeEventListener('touchstart', trackActivity);
      if (activityTimeoutRef.current) {
        clearInterval(activityTimeoutRef.current);
      }
    };
  };

  useEffect(() => {
    console.log('[useAuth] Initializing auth...');
    
    const initAuth = async () => {
      const session = loadSession();
      
      if (session) {
        console.log('[useAuth] Found local session');
        setUser({ id: session.userId, email: session.email });
        
        if (session.userData) {
          console.log('[useAuth] Using cached user data');
          userDataRef.current = session.userData;
          setUserData(session.userData);
          setLoading(false);
          verifyAndRefreshSession(session);
        } else {
          await fetchUserData(session.userId, session.email);
          setLoading(false);
          verifyAndRefreshSession(session);
        }
      } else {
        try {
          const { data: { session: supabaseSession } } = await supabase.auth.getSession();
          
          if (supabaseSession?.user) {
            console.log('[useAuth] Found Supabase session');
            const newSession: LocalSession = {
              userId: supabaseSession.user.id,
              email: supabaseSession.user.email || '',
              accessToken: supabaseSession.access_token,
              refreshToken: supabaseSession.refresh_token,
              expiresAt: Date.now() + SESSION_DURATION
            };
            saveSession(newSession);
            
            setUser({ id: supabaseSession.user.id, email: supabaseSession.user.email || '' });
            await fetchUserData(supabaseSession.user.id, supabaseSession.user.email || '');
          }
        } catch (error) {
          console.error('[useAuth] Error checking Supabase session:', error);
        }
        
        setLoading(false);
      }
    };

    initAuth();

    // Setup activity tracking
    const cleanupActivity = setupActivityTracking();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] Auth state change:', event);
        
        if (event === 'SIGNED_IN' && session) {
          const newSession: LocalSession = {
            userId: session.user.id,
            email: session.user.email || '',
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: Date.now() + SESSION_DURATION
          };
          saveSession(newSession);
          
          setUser({ id: session.user.id, email: session.user.email || '' });
          
          if (!userDataRef.current || userDataRef.current.id !== session.user.id) {
            await fetchUserData(session.user.id, session.user.email || '');
          }
        } else if (event === 'SIGNED_OUT') {
          clearSession();
          setUser(null);
          setUserData(null);
          userDataRef.current = null;
        } else if (event === 'TOKEN_REFRESHED' && session) {
          const existingSession = loadSession();
          if (existingSession) {
            existingSession.accessToken = session.access_token;
            existingSession.refreshToken = session.refresh_token;
            existingSession.expiresAt = Date.now() + SESSION_DURATION;
            saveSession(existingSession);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      cleanupActivity();
    };
  }, []);

  const fetchUserData = async (userId: string, email: string) => {
    if (userDataRef.current && userDataRef.current.id === userId) {
      return;
    }

    console.log('[useAuth] Fetching user data for:', userId);

    try {
      const [adminRes, memberRes] = await Promise.all([
        supabase.from('admin_master')
          .select('admin_name, admin_email, status, admin_id')
          .eq('admin_id', userId)
          .maybeSingle(),
        supabase.from('user_master')
          .select('user_name, email, user_id, status, admin_approved')
          .eq('user_id', userId)
          .maybeSingle()
      ]);

      const adminData = adminRes?.data;
      const memberData = memberRes?.data;

      let newUserData: UserData;

      if (adminData) {
        newUserData = {
          id: userId,
          name: adminData.admin_name || 'Admin',
          email: adminData.admin_email,
          isAdmin: true
        };
      } else if (memberData) {
        if (!memberData.admin_approved) {
          await signOut();
          toast({
            title: 'Approval Pending',
            description: 'Your account is pending admin approval.',
            variant: 'destructive',
          });
          return;
        }

        newUserData = {
          id: userId,
          name: memberData.user_name || 'User',
          email: memberData.email,
          isAdmin: false,
          status: memberData.status
        };
      } else {
        newUserData = {
          id: userId,
          name: email.split('@')[0],
          email: email,
          isAdmin: false
        };
      }

      userDataRef.current = newUserData;
      setUserData(newUserData);
      updateSessionUserData(newUserData);

    } catch (error) {
      console.error('Error fetching user data:', error);
      const newUserData = {
        id: userId,
        name: 'User',
        email: email,
        isAdmin: false
      };
      userDataRef.current = newUserData;
      setUserData(newUserData);
      updateSessionUserData(newUserData);
    }
  };

  const signOut = async () => {
    try {
      clearSession();
      setUser(null);
      setUserData(null);
      userDataRef.current = null;

      supabase.auth.signOut().catch(err => {
        console.warn('Supabase signOut error:', err);
      });

      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });

      window.location.href = '#home';
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    user,
    userData,
    loading,
    signOut,
    isAdmin: userData?.isAdmin || false,
    userName: userData?.name || '',
    status: userData?.status
  };
};
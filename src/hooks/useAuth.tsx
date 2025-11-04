// src/hooks/useAuth.tsx - Custom Session Management
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

interface StoredSession {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const SESSION_KEY = 'app_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export const useAuth = () => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const userDataRef = useRef<UserData | null>(null);

  // Save session to localStorage
  const saveSession = (session: StoredSession) => {
    console.log('[useAuth] Saving session to localStorage');
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  };

  // Load session from localStorage
  const loadSession = (): StoredSession | null => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      
      const session: StoredSession = JSON.parse(stored);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        console.log('[useAuth] Session expired');
        clearSession();
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('[useAuth] Error loading session:', error);
      return null;
    }
  };

  // Clear session from localStorage
  const clearSession = () => {
    console.log('[useAuth] Clearing session');
    localStorage.removeItem(SESSION_KEY);
  };

  // Verify session with Supabase (optional - for extra security)
  const verifySessionWithSupabase = async (accessToken: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.getUser(accessToken);
      return !error && !!data.user;
    } catch {
      return false;
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    console.log('[useAuth] Initializing...');
    
    const initAuth = async () => {
      // First, try to load session from localStorage
      const session = loadSession();
      
      if (session) {
        console.log('[useAuth] Found stored session for user:', session.userId);
        
        // Optionally verify with Supabase (comment out for faster load)
        // const isValid = await verifySessionWithSupabase(session.accessToken);
        // if (!isValid) {
        //   console.log('[useAuth] Session invalid, clearing');
        //   clearSession();
        //   setLoading(false);
        //   return;
        // }
        
        // Set user from stored session
        setUser({ id: session.userId, email: session.email });
        
        // Fetch user data
        await fetchUserData(session.userId, session.email);
      } else {
        console.log('[useAuth] No stored session found');
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const fetchUserData = async (userId: string, email: string) => {
    // If we already have data for this user, skip
    if (userDataRef.current && userDataRef.current.id === userId) {
      console.log('[useAuth] User data already cached');
      return;
    }

    console.log('[useAuth] Fetching user data for:', userId);

    try {
      // Query both tables in PARALLEL
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

      // If admin found
      if (adminData) {
        console.log('[useAuth] Admin user found');
        const newUserData = {
          id: userId,
          name: adminData.admin_name || 'Admin',
          email: adminData.admin_email,
          isAdmin: true
        };
        userDataRef.current = newUserData;
        setUserData(newUserData);
        return;
      }

      // If member found
      if (memberData) {
        console.log('[useAuth] Member user found');
        
        // Check if user is not approved
        if (!memberData.admin_approved) {
          await signOut();
          toast({
            title: 'Approval Pending',
            description: 'Your account is pending admin approval.',
            variant: 'destructive',
          });
          return;
        }

        const newUserData = {
          id: userId,
          name: memberData.user_name || 'User',
          email: memberData.email,
          isAdmin: false,
          status: memberData.status
        };
        userDataRef.current = newUserData;
        setUserData(newUserData);
        return;
      }

      // Default user data
      console.log('[useAuth] User not found in database, using defaults');
      const newUserData = {
        id: userId,
        name: email.split('@')[0],
        email: email,
        isAdmin: false
      };
      userDataRef.current = newUserData;
      setUserData(newUserData);

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
    }
  };

  // Sign in function - call this after successful Supabase auth
  const signIn = async (email: string, password: string) => {
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session && data.user) {
        // Store our own session
        const session: StoredSession = {
          userId: data.user.id,
          email: data.user.email || email,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: Date.now() + SESSION_DURATION
        };
        
        saveSession(session);
        setUser({ id: data.user.id, email: data.user.email || email });
        
        // Fetch user data
        await fetchUserData(data.user.id, data.user.email || email);

        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });

        return { success: true };
      }

      return { success: false, error: 'No session returned' };
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Sign out from Supabase (optional - can be done in background)
      supabase.auth.signOut().catch(err => {
        console.warn('Supabase signOut error (non-blocking):', err);
      });

      // Immediately clear local session
      clearSession();
      setUser(null);
      setUserData(null);
      userDataRef.current = null;

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
    signIn,
    signOut,
    isAdmin: userData?.isAdmin || false,
    userName: userData?.name || '',
    status: userData?.status
  };
};
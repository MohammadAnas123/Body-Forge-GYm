// src/hooks/useAuth.tsx
import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  status?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const userDataRef = useRef<UserData | null>(null);
  const loadingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('[useAuth] getInitialSession: starting');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[useAuth] getInitialSession: session', !!session);
        if (session?.user) {
          setUser(session.user);
          await fetchUserData(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current as any);
          loadingTimeoutRef.current = null;
        }
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    console.log('[useAuth] setting up onAuthStateChange subscription');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] Auth state changed:', event, session?.user?.email);
        
        // Only fetch user data on specific events, not on TOKEN_REFRESHED
        if (event === 'TOKEN_REFRESHED' && userDataRef.current) {
          // Skip fetching user data on token refresh if we already have it
          console.log('Token refreshed, skipping user data fetch');
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          // Only fetch if user ID changed or we don't have user data
          if (!userDataRef.current || userDataRef.current.id !== session.user.id) {
            await fetchUserData(session.user.id, session.user.email || '');
          }
        } else {
          setUser(null);
          setUserData(null);
          userDataRef.current = null;
        }
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current as any);
          loadingTimeoutRef.current = null;
        }
        setLoading(false);
      }
    );

    // safety fallback: if nothing resolves within 10s, stop the loading state and log a warning
    if (!loadingTimeoutRef.current) {
      loadingTimeoutRef.current = window.setTimeout(() => {
        console.warn('[useAuth] loading timeout reached — forcing loading=false');
        setLoading(false);
        loadingTimeoutRef.current = null;
      }, 10000);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current as any);
        loadingTimeoutRef.current = null;
      }
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string, email: string) => {
    try {
      console.log('Fetching user data for:', { userId, email });
      
      // First, try to find admin by admin_id
      let { data: adminData, error: adminError } = await supabase
        .from('admin_master')
        .select('admin_name, admin_email, status, admin_id')
        .eq('admin_id', userId)
        .maybeSingle();

      // If not found by ID, try by email
      if (!adminData && !adminError) {
        console.log('Admin not found by ID, trying email...');
        const result = await supabase
          .from('admin_master')
          .select('admin_name, admin_email, status, admin_id')
          .ilike('admin_email', email.trim().toLowerCase())
          .maybeSingle();
        adminData = result.data;
        adminError = result.error;
      }

      console.log('Admin query result:', { adminData, adminError });

      if (!adminError && adminData) {
        // User is an admin
        console.log('Admin found:', adminData);
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

      // If not admin, check user_master
      let { data: memberData, error: memberError } = await supabase
        .from('user_master')
        .select('user_name, email, user_id, status, admin_approved')
        .eq('user_id', userId)
        .maybeSingle();

      // If not found by ID, try by email
      if (!memberData && !memberError) {
        console.log('User not found by ID, trying email...');
        const result = await supabase
          .from('user_master')
          .select('user_name, email, user_id, status, admin_approved')
          .ilike('email', email.trim().toLowerCase())
          .maybeSingle();
        memberData = result.data;
        memberError = result.error;
      }

      console.log('User query result:', { memberData, memberError });

      if (!memberError && memberData) {
        console.log('User found:', memberData);
        
        // Check if user is not approved
        if (!memberData.admin_approved) {
          // Try signing out remotely; treat missing/expired sessions as non-fatal
          try {
            const { error } = await supabase.auth.signOut();
            if (error) {
              const msg = (error?.message || '').toString();
              if (msg.toLowerCase().includes('auth session') || msg.toLowerCase().includes('no active session') || msg.toLowerCase().includes('session missing')) {
                console.warn('signOut during fetchUserData: remote session missing', msg);
              } else {
                throw error;
              }
            }
          } catch (err) {
            console.error('Error signing out during fetchUserData:', err);
          }

          toast({
            title: 'Approval Pending',
            description: 'Your account is pending admin approval.',
            variant: 'destructive',
          });
          setUser(null);
          setUserData(null);
          userDataRef.current = null;
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

      // If neither admin nor user found
      console.warn('User not found in admin_master or user_master');
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

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      // Supabase may return an error when there is no active session (e.g. "Auth
      // session missing"). Treat that as an already-signed-out state and proceed
      // to clear local state so the UI doesn't get stuck.
      if (error) {
        const msg = (error?.message || '').toString();
        if (msg.toLowerCase().includes('auth session') || msg.toLowerCase().includes('no active session') || msg.toLowerCase().includes('session missing')) {
          console.warn('signOut: remote session missing - treating as logged out', msg);
        } else {
          throw error;
        }
      }

      // Clear local auth state regardless
      setUser(null);
      setUserData(null);
      userDataRef.current = null;

      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });

      // Optionally redirect to home
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
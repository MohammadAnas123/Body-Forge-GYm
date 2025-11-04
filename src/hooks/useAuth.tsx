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
  const isFetchingRef = useRef(false); // Prevent concurrent fetches

  useEffect(() => {
    console.log('[useAuth] useEffect mounting...');
    
    const getInitialSession = async () => {
      console.log('[useAuth] getInitialSession START');
      try {
        console.log('[useAuth] Calling supabase.auth.getSession()...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[useAuth] getSession() returned, session exists:', !!session);
        
        if (session?.user) {
          console.log('[useAuth] Setting user and fetching user data...');
          setUser(session.user);
          await fetchUserData(session.user.id, session.user.email || '');
          console.log('[useAuth] fetchUserData completed');
        } else {
          console.log('[useAuth] No session found, clearing user data');
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('[useAuth] Error getting session:', error);
      } finally {
        console.log('[useAuth] getInitialSession FINALLY block');
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current as any);
          loadingTimeoutRef.current = null;
        }
        setLoading(false);
        console.log('[useAuth] Loading set to false');
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] Auth state change event:', event);
        
        // Skip refetching for these events if we already have user data
        if (userDataRef.current && (
          event === 'TOKEN_REFRESHED' || 
          event === 'USER_UPDATED'
        )) {
          console.log('[useAuth] Skipping refetch for event:', event);
          // Just update the user object, keep userData
          if (session?.user) {
            setUser(session.user);
          }
          return;
        }
        
        // Handle SIGNED_IN
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('[useAuth] SIGNED_IN event');
          setUser(session.user);
          // Only fetch if we don't have data or it's a different user
          if (!userDataRef.current || userDataRef.current.id !== session.user.id) {
            console.log('[useAuth] Fetching user data for SIGNED_IN');
            await fetchUserData(session.user.id, session.user.email || '');
          } else {
            console.log('[useAuth] User data already cached, skipping fetch');
          }
        } 
        // Handle SIGNED_OUT
        else if (event === 'SIGNED_OUT') {
          console.log('[useAuth] SIGNED_OUT event');
          setUser(null);
          setUserData(null);
          userDataRef.current = null;
        }
        // Handle INITIAL_SESSION - only if no data cached
        else if (event === 'INITIAL_SESSION' && session?.user) {
          console.log('[useAuth] INITIAL_SESSION event');
          if (!userDataRef.current) {
            setUser(session.user);
            await fetchUserData(session.user.id, session.user.email || '');
          } else {
            console.log('[useAuth] User data already cached for INITIAL_SESSION');
          }
        }
        
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current as any);
          loadingTimeoutRef.current = null;
        }
        setLoading(false);
      }
    );

    if (!loadingTimeoutRef.current) {
      console.log('[useAuth] Setting 10-second loading timeout');
      loadingTimeoutRef.current = window.setTimeout(() => {
        console.warn('[useAuth] 10-second loading timeout hit! Force setting loading to false');
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
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('[useAuth] Already fetching user data, skipping...');
      return;
    }

    // If we already have data for this user, skip
    if (userDataRef.current && userDataRef.current.id === userId) {
      console.log('[useAuth] User data already cached for userId:', userId);
      return;
    }

    isFetchingRef.current = true;
    console.log('[useAuth] Starting fetchUserData for:', userId);

    // Helper to time each query
    const withTiming = async <T,>(label: string, fn: () => Promise<T>, ms: number = 15000) => {
      const start = performance.now();
      let timeoutId: number | null = null;
      try {
        timeoutId = window.setTimeout(() => {
          console.warn(`[useAuth] Query '${label}' timed out after ${ms}ms`);
        }, ms);
        const result = await fn();
        const duration = performance.now() - start;
        console.log(`[useAuth] Query '${label}' completed in ${duration.toFixed(1)}ms`);
        return result;
      } finally {
        if (timeoutId) clearTimeout(timeoutId as any);
      }
    };

    try {
      // Query both tables in PARALLEL for better performance
      // Only query by ID for speed (email lookups are slow without proper indexes)
      const [adminRes, memberRes] = await Promise.all([
        withTiming('admin_master by id', () => 
          supabase.from('admin_master')
            .select('admin_name, admin_email, status, admin_id')
            .eq('admin_id', userId)
            .maybeSingle()
        ).catch(err => {
          console.error('admin_master by id failed:', err);
          return { data: null, error: err };
        }),
        withTiming('user_master by id', () => 
          supabase.from('user_master')
            .select('user_name, email, user_id, status, admin_approved')
            .eq('user_id', userId)
            .maybeSingle()
        ).catch(err => {
          console.error('user_master by id failed:', err);
          return { data: null, error: err };
        })
      ]);

      console.log('[useAuth] Parallel queries completed');

      let adminData = (adminRes as any)?.data;
      let memberData = (memberRes as any)?.data;

      // If admin found, use admin data
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

      // If member found, check approval and use member data
      if (memberData) {
        console.log('[useAuth] Member user found');
        // Check if user is not approved
        if (!memberData.admin_approved) {
          try {
            const { error } = await supabase.auth.signOut();
            if (error) {
              const msg = (error?.message || '').toString();
              if (!msg.toLowerCase().includes('auth session') && 
                  !msg.toLowerCase().includes('no active session') && 
                  !msg.toLowerCase().includes('session missing')) {
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

      // If neither found, create default user data
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
    } finally {
      isFetchingRef.current = false;
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
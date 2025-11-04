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
  const isFetchingRef = useRef(false);
  const initialSessionHandledRef = useRef(false); // Prevent double initial fetch

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
        
        // Mark initial session as handled
        initialSessionHandledRef.current = true;
      } catch (error) {
        console.error('[useAuth] Error getting session:', error);
      } finally {
        console.log('[useAuth] getInitialSession FINALLY block');
        setLoading(false);
        console.log('[useAuth] Loading set to false');
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] Auth state change event:', event);
        
        // CRITICAL: Skip SIGNED_IN if we just handled initial session
        // This prevents double-fetching on page load
        if (event === 'SIGNED_IN' && !initialSessionHandledRef.current) {
          console.log('[useAuth] SIGNED_IN event (not initial)');
          if (session?.user) {
            setUser(session.user);
            if (!userDataRef.current || userDataRef.current.id !== session.user.id) {
              await fetchUserData(session.user.id, session.user.email || '');
            }
          }
          setLoading(false);
          return;
        }
        
        // Skip refetching for token refresh/updates if we already have data
        if (userDataRef.current && (
          event === 'TOKEN_REFRESHED' || 
          event === 'USER_UPDATED'
        )) {
          console.log('[useAuth] Skipping refetch for event:', event);
          if (session?.user) {
            setUser(session.user);
          }
          return;
        }
        
        // Handle SIGNED_OUT
        if (event === 'SIGNED_OUT') {
          console.log('[useAuth] SIGNED_OUT event');
          setUser(null);
          setUserData(null);
          userDataRef.current = null;
          initialSessionHandledRef.current = false;
          setLoading(false);
        }
      }
    );

    return () => {
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

    try {
      // Query both tables in PARALLEL for better performance
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

      console.log('[useAuth] Parallel queries completed');

      const adminData = adminRes?.data;
      const memberData = memberRes?.data;

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
            await supabase.auth.signOut();
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

      if (error) {
        const msg = (error?.message || '').toString();
        if (msg.toLowerCase().includes('auth session') || 
            msg.toLowerCase().includes('no active session') || 
            msg.toLowerCase().includes('session missing')) {
          console.warn('signOut: remote session missing - treating as logged out');
        } else {
          throw error;
        }
      }

      // Clear local auth state
      setUser(null);
      setUserData(null);
      userDataRef.current = null;
      initialSessionHandledRef.current = false;

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
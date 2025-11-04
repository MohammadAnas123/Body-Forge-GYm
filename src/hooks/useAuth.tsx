// src/hooks/useAuth.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
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
  // Initialize loading to true
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Track if we're fetching to prevent duplicate calls
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  // --- Fetch User Data Logic (Simplified and Enhanced) ---
  const fetchUserData = useCallback(async (userId: string, email: string) => {
    if (!mountedRef.current) return; // Exit early if unmounted
    if (fetchingRef.current) {
      console.log('⏭️ Skipping fetch - already in progress');
      return;
    }

    fetchingRef.current = true;
    const startTime = performance.now();
    let userDataFound = false;

    try {
      console.log('🔍 [START] Fetching user data for:', { userId, email });
      const lowerEmail = email.trim().toLowerCase();

      // --- Attempt 1: Check Admin by ID then Email ---
      let { data: adminData, error: adminError } = await supabase
        .from('admin_master')
        .select('admin_name, admin_email, status, admin_id')
        .eq('admin_id', userId)
        .maybeSingle();

      if (adminError) {
        console.error('❌ Admin query error (by ID):', adminError);
      }
      
      if (!adminData && !adminError) {
        // Try by email if not found by ID and no ID error
        const result = await supabase
          .from('admin_master')
          .select('admin_name, admin_email, status, admin_id')
          .ilike('admin_email', lowerEmail)
          .maybeSingle();
        
        adminData = result.data;
        adminError = result.error;

        if (adminError) {
            console.error('❌ Admin query error (by email):', adminError);
        }
      }

      if (!mountedRef.current) return; // Re-check mounted after awaited calls

      if (adminData) {
        console.log('✨ ADMIN FOUND:', adminData);
        setUserData({
          id: userId,
          name: adminData.admin_name || 'Admin',
          email: adminData.admin_email,
          isAdmin: true
        });
        userDataFound = true;
      }

      // --- Attempt 2: Check Standard User if not Admin ---
      if (!userDataFound) {
        let { data: memberData, error: memberError } = await supabase
          .from('user_master')
          .select('user_name, email, user_id, status, admin_approved')
          .eq('user_id', userId)
          .maybeSingle();

        if (memberError) {
            console.error('❌ User query error (by ID):', memberError);
        }
        
        if (!memberData && !memberError) {
          // Try by email if not found by ID and no ID error
          const result = await supabase
            .from('user_master')
            .select('user_name, email, user_id, status, admin_approved')
            .ilike('email', lowerEmail)
            .maybeSingle();
            
          memberData = result.data;
          memberError = result.error;
          
          if (memberError) {
              console.error('❌ User query error (by email):', memberError);
          }
        }

        if (!mountedRef.current) return; // Re-check mounted

        if (memberData) {
          console.log('✨ USER FOUND:', memberData);
          userDataFound = true;
          
          if (!memberData.admin_approved) {
            console.warn('⚠️ User not approved, signing out...');
            await supabase.auth.signOut();
            // Note: The auth listener handles the state reset (user/userData = null)
            toast({
              title: 'Approval Pending',
              description: 'Your account is pending admin approval.',
              variant: 'destructive',
            });
            // Setting userData to null immediately ensures unapproved user data isn't used
            setUserData(null);
            setUser(null); 
          } else {
            setUserData({
              id: userId,
              name: memberData.user_name || 'User',
              email: memberData.email,
              isAdmin: false,
              status: memberData.status
            });
          }
        }
      }

      // --- Not Found Case ---
      if (!userDataFound) {
        console.warn('⚠️ User not found in either table, using defaults');
        setUserData({
          id: userId,
          name: email.split('@')[0],
          email: email,
          isAdmin: false
        });
      }

      console.log(`⏱️ Total fetch time: ${(performance.now() - startTime).toFixed(2)}ms`);

    } catch (error) {
      console.error('💥 CRITICAL ERROR in fetchUserData:', error);
      if (mountedRef.current) {
        setUserData({
          id: userId,
          name: 'User',
          email: email,
          isAdmin: false
        });
      }
    } finally {
      fetchingRef.current = false;
    }
  }, [toast]);

  // --- Main Auth Effect ---
  useEffect(() => {
    mountedRef.current = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      console.log('🚀 Initializing auth...');
      
      // 1. Get initial session
      console.log('📱 Getting session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session error:', error);
        // Handle error, but still set loading to false
      }

      // 2. Process initial session
      if (mountedRef.current && session?.user) {
        console.log('✅ Session retrieved, processing user:', session.user.email);
        setUser(session.user);
        // Await fetching user data to ensure all initial work is done before setting loading=false
        await fetchUserData(session.user.id, session.user.email || '');
      } else {
        console.log('✅ Session retrieved: No user');
        setUser(null);
        setUserData(null);
      }
      
      // 3. Set up auth listener (non-blocking)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 Auth event:', event, session?.user?.email);
          
          if (!mountedRef.current) return;
          
          if (session?.user) {
            setUser(session.user);
            await fetchUserData(session.user.id, session.user.email || '');
          } else {
            setUser(null);
            setUserData(null);
          }
          
          // Only set loading false here if the initial state hasn't been set yet
          // In this structure, the initial state is handled below, outside the listener.
        }
      );
      
      authSubscription = subscription;

      // 4. Final step: Set loading to false once initial state is fully processed.
      if (mountedRef.current) {
        setLoading(false);
        console.log('✅ Auth initialization complete and loading set to false');
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 Cleanup: Unmounting auth hook');
      mountedRef.current = false;
      fetchingRef.current = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [fetchUserData]); // Dependencies are correct

  // --- Sign Out Logic (Unchanged) ---
  const signOut = async () => {
    try {
      console.log('👋 Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // State is mostly handled by auth listener, but setting explicitly helps local cleanup
      setUser(null);
      setUserData(null);
      
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
      
      window.location.href = '#home'; // Good for a non-SPA redirect or hash change
      console.log('✅ Signed out successfully');
    } catch (error: any) {
      console.error('💥 Error logging out:', error);
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
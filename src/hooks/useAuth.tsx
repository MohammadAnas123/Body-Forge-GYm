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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Track if we're fetching to prevent duplicate calls
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchUserData = useCallback(async (userId: string, email: string) => {
    // Prevent duplicate fetches
    if (fetchingRef.current) {
      console.log('⏭️ Skipping fetch - already in progress');
      return;
    }

    fetchingRef.current = true;
    
    try {
      console.log('🔍 [START] Fetching user data for:', { userId, email });
      const startTime = performance.now();
      
      // ============= ADMIN CHECK =============
      console.log('📋 Checking admin_master by ID...');
      let { data: adminData, error: adminError } = await supabase
        .from('admin_master')
        .select('admin_name, admin_email, status, admin_id')
        .eq('admin_id', userId)
        .maybeSingle();
      
      // Check if component unmounted during query
      if (!mountedRef.current) {
        console.log('🛑 Component unmounted, aborting');
        return;
      }
      
      console.log('✅ Admin by ID response:', { 
        data: adminData, 
        error: adminError,
        timeMs: (performance.now() - startTime).toFixed(2)
      });

      // If not found by ID, try by email
      if (!adminData && !adminError) {
        console.log('📧 Admin not found by ID, trying email...');
        
        const result = await supabase
          .from('admin_master')
          .select('admin_name, admin_email, status, admin_id')
          .ilike('admin_email', email.trim().toLowerCase())
          .maybeSingle();
        
        if (!mountedRef.current) {
          console.log('🛑 Component unmounted, aborting');
          return;
        }
        
        adminData = result.data;
        adminError = result.error;
        
        console.log('✅ Admin by email response:', { data: adminData, error: adminError });
      }

      if (adminError) {
        console.error('❌ Admin query error:', adminError);
      }

      if (adminData) {
        console.log('✨ ADMIN FOUND:', adminData);
        if (mountedRef.current) {
          setUserData({
            id: userId,
            name: adminData.admin_name || 'Admin',
            email: adminData.admin_email,
            isAdmin: true
          });
        }
        console.log(`⏱️ Total fetch time: ${(performance.now() - startTime).toFixed(2)}ms`);
        return;
      }

      // ============= USER CHECK =============
      console.log('📋 Checking user_master by ID...');
      
      let { data: memberData, error: memberError } = await supabase
        .from('user_master')
        .select('user_name, email, user_id, status, admin_approved')
        .eq('user_id', userId)
        .maybeSingle();

      if (!mountedRef.current) {
        console.log('🛑 Component unmounted, aborting');
        return;
      }

      console.log('✅ User by ID response:', { data: memberData, error: memberError });

      // If not found by ID, try by email
      if (!memberData && !memberError) {
        console.log('📧 User not found by ID, trying email...');
        
        const result = await supabase
          .from('user_master')
          .select('user_name, email, user_id, status, admin_approved')
          .ilike('email', email.trim().toLowerCase())
          .maybeSingle();
        
        if (!mountedRef.current) {
          console.log('🛑 Component unmounted, aborting');
          return;
        }
        
        memberData = result.data;
        memberError = result.error;
        
        console.log('✅ User by email response:', { data: memberData, error: memberError });
      }

      if (memberError) {
        console.error('❌ User query error:', memberError);
      }

      if (memberData) {
        console.log('✨ USER FOUND:', memberData);
        
        // Check if user is not approved
        if (!memberData.admin_approved) {
          console.warn('⚠️ User not approved, signing out...');
          await supabase.auth.signOut();
          if (mountedRef.current) {
            toast({
              title: 'Approval Pending',
              description: 'Your account is pending admin approval.',
              variant: 'destructive',
            });
            setUser(null);
            setUserData(null);
          }
          return;
        }

        if (mountedRef.current) {
          setUserData({
            id: userId,
            name: memberData.user_name || 'User',
            email: memberData.email,
            isAdmin: false,
            status: memberData.status
          });
        }
        console.log(`⏱️ Total fetch time: ${(performance.now() - startTime).toFixed(2)}ms`);
        return;
      }

      // ============= NOT FOUND =============
      console.warn('⚠️ User not found in either table, using defaults');
      if (mountedRef.current) {
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

  useEffect(() => {
    mountedRef.current = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth...');
        
        // Set up auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔄 Auth event:', event, session?.user?.email);
            
            if (!mountedRef.current) {
              console.log('🛑 Not mounted, ignoring auth event');
              return;
            }
            
            if (session?.user) {
              setUser(session.user);
              await fetchUserData(session.user.id, session.user.email || '');
            } else {
              setUser(null);
              setUserData(null);
            }
            
            if (mountedRef.current) {
              setLoading(false);
            }
          }
        );
        
        authSubscription = subscription;
        
        // Get initial session
        console.log('📱 Getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          throw error;
        }
        
        console.log('✅ Session retrieved:', session?.user?.email || 'No user');
        
        // Only process if still mounted and session exists
        if (mountedRef.current && session?.user) {
          setUser(session.user);
          await fetchUserData(session.user.id, session.user.email || '');
        }
        
        if (mountedRef.current) {
          setLoading(false);
          console.log('✅ Auth initialization complete');
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
        if (mountedRef.current) {
          setLoading(false);
        }
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
  }, [fetchUserData]);

  const signOut = async () => {
    try {
      console.log('👋 Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserData(null);
      
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
      
      window.location.href = '#home';
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
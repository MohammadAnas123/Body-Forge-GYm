// src/hooks/useAuth.tsx
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  status?: string; // 'active' or 'inactive' - for plan validity
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
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
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserData(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      }
    );

    return () => {
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
        setUserData({
          id: userId,
          name: adminData.admin_name || 'Admin',
          email: adminData.admin_email,
          isAdmin: true
        });
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
          await supabase.auth.signOut();
          toast({
            title: 'Approval Pending',
            description: 'Your account is pending admin approval.',
            variant: 'destructive',
          });
          setUser(null);
          setUserData(null);
          return;
        }

        setUserData({
          id: userId,
          name: memberData.user_name || 'User',
          email: memberData.email,
          isAdmin: false,
          status: memberData.status
        });
        return;
      }

      // If neither admin nor user found
      console.warn('User not found in admin_master or user_master');
      setUserData({
        id: userId,
        name: email.split('@')[0],
        email: email,
        isAdmin: false
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData({
        id: userId,
        name: 'User',
        email: email,
        isAdmin: false
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserData(null);
      
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

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { GoalSection } from '@/components/MemDashComponents/GoalSection';
import RecentWorkouts from "@/components/MemDashComponents/RecentWorkouts";
import WeeklyActivity from "@/components/MemDashComponents/WeeklyActivity";
import WeightProgress from '@/components/MemDashComponents/WeightProgress';
import StatsOverview from "@/components/MemDashComponents/StatsOverview";
import ActiveMembershipCard from '@/components/MemDashComponents/ActiveMembershipCard';
import QuickLink from '@/components/MemDashComponents/QuickLink';
import Header from '@/components/MemDashComponents/Header';
import AddMeasurements from '@/components/MemDashComponents/AddMeasurements';
import BMICalculator from '@/components/MemDashComponents/BMICalculator';
import DietPlan from '@/components/MemDashComponents/DietPlan';
import WorkoutDashboard from '@/components/MemDashComponents/WorkoutDashboard';
import { Listbox } from '@headlessui/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, ChevronDown, Calendar, Activity, Weight, Ruler, Apple, Dumbbell, LogOut, ArrowLeft, Target,
         Award, Plus, ChevronRight, Flame, Clock, CheckCircle2, BarChart3, X, Save, Loader, CreditCard} from 'lucide-react';

const MemberDashboard = () => {
  const { user, userName, signOut } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loadpage, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for all data
  const [userProfile, setUserProfile] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [activeMembership, setActiveMembership] = useState(null);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [goals, setGoals] = useState([]);
  
  // BMI Calculator state
  const [bmiData, setBmiData] = useState({ height: '', weight: '', bmi: null, category: '' });
  
  // Modal states
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [currentWeight, setCurrentWeight] = useState();

  // Form states
  const [newMeasurement, setNewMeasurement] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: ''
  });

  const [isUpdateMeasurement, setIsUpdateMeasurement] = useState(false);
  const [recordId, setRecordId] = useState(null);

  const workoutOptions = [
    'Chest', 'Triceps', 'Back','Biceps', 'Shoulders', 'Legs',
    'Chest & Triceps', 'Back & Biceps', 'Shoulders & Legs',
    'Full Body', 'Cardio'
  ];

  const [newWorkout, setNewWorkout] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    duration: '',
    exercises: '',
    calories: ''
  });

  const [newGoal, setNewGoal] = useState({
    name: '',
    current: '',
    target: '',
    unit: ''
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
      });
      
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  }, [signOut, navigate, toast]);

  // ✅ Fetch today's measurement (autopopulate)
  const fetchTodayMeasurement = async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("user_measurements") // your table name
      .select("weight, chest, waist, hips, arms, thighs, created_at, measurement_id")
      .eq("user_id", user.id)
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString())
      .single();
    console.log("Data:::"+data);
    if (error && error.code !== "PGRST116") console.error("Fetch error:", error);
    if (data) {
      setCurrentWeight(data.weight);
      setNewMeasurement({
        weight: data.weight || '',
        chest: data.chest || '',
        waist: data.waist || '',
        hips: data.hips || '',
        arms: data.arms || '',
        thighs: data.thighs || '',
      });
      setRecordId(data.measurement_id);
      setIsUpdateMeasurement(true);
    }
  };

  // Fetch all data from Supabase
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_master')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile);

      // Fetch measurements
      const { data: measurementsData, error: measurementsError } = await supabase
        .from('user_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (measurementsError) throw measurementsError;
      setMeasurements(measurementsData || []);

      // Fetch active membership
      const { data: membershipData, error: membershipError } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('payment_status', 'completed')
        .gte('end_date', new Date().toISOString())
        .order('end_date', { ascending: false })
        .limit(1)
        .single();

      if (!membershipError && membershipData) {
        setActiveMembership(membershipData);
      }

      // Fetch workout logs
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(20);

      if (!workoutsError) {
        setWorkoutLogs(workoutsData || []);
      }

      fetchTodayMeasurement();
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!activeMembership) return 0;
    const endDate = new Date(activeMembership.end_date);
    const today = new Date();
    return Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  };

  // Add new measurement
  const addMeasurement = async () => {
    if (!newMeasurement.weight) {
      alert('Please enter at least weight');
      return;
    }
    try {
      const payload = {
        user_id: user.id,
        weight: parseFloat(newMeasurement.weight),
        chest: newMeasurement.chest ? parseFloat(newMeasurement.chest) : null,
        waist: newMeasurement.waist ? parseFloat(newMeasurement.waist) : null,
        hips: newMeasurement.hips ? parseFloat(newMeasurement.hips) : null,
        arms: newMeasurement.arms ? parseFloat(newMeasurement.arms) : null,
        thighs: newMeasurement.thighs ? parseFloat(newMeasurement.thighs) : null,
        created_at: new Date().toISOString(),
      };
       if (isUpdateMeasurement) {
      const { error } = await supabase
        .from("user_measurements")
        .update(payload)
        .eq("measurement_id", recordId);

      if (error) {
        console.error("Update error:", error);
        alert("Error updating measurement.");
      } else {
        alert("Measurement updated successfully!");
      }
    } else {
      const { data, error } = await supabase
        .from("user_measurements")
        .insert([payload])
        .select();

      if (error) {
        console.error("Insert error:", error);
        alert("Error saving measurement.");
      } else {
        alert("Measurement saved successfully!");
      }
    }
      // Refresh measurements
      await fetchAllData();
      
      setNewMeasurement({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        chest: '',
        waist: '',
        hips: '',
        arms: '',
        thighs: ''
      });
      setShowMeasurementModal(false);
    } catch (err) {
      console.error('Error adding measurement:', err);
      alert('Failed to add measurement. Please try again.');
    }
  };

  // Add new workout
  const addWorkout = async () => {
    if (!newWorkout.type || !newWorkout.duration) {
      alert('Please enter at least workout type and duration');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .insert([{
          user_id: user.id,
          date: newWorkout.date,
          type: newWorkout.type,
          duration: parseInt(newWorkout.duration),
          exercises: newWorkout.exercises ? parseInt(newWorkout.exercises) : 0,
          calories: newWorkout.calories ? parseInt(newWorkout.calories) : 0,
          completed: true
        }])
        .select();

      if (error) throw error;

      // Refresh workouts
      await fetchAllData();
      
      setNewWorkout({
        date: new Date().toISOString().split('T')[0],
        type: '',
        duration: '',
        exercises: '',
        calories: ''
      });
      setShowWorkoutModal(false);
    } catch (err) {
      console.error('Error adding workout:', err);
      alert('Failed to add workout. Please try again.');
    }
  };

  // Calculate filtered data based on selected period
  const filteredWeightData = useMemo(() => {
    if (!measurements || measurements.length === 0) return [];
    
    const now = new Date();
    let startDate;
    
    switch(selectedPeriod) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        return measurements.map(m => ({
          date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weight: m.weight,
          chest: m.chest,
          waist: m.waist
        }));
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return measurements
      .filter(m => new Date(m.created_at) >= startDate)
      .map(m => ({
        date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: m.weight,
        chest: m.chest,
        waist: m.waist
      }));
  }, [measurements, selectedPeriod]);

  // Calculate weekly workout stats
  const workoutStats = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const stats = days.map(day => ({ day, duration: 0, calories: 0 }));
    
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    workoutLogs
      .filter(w => new Date(w.date) >= lastWeek)
      .forEach(workout => {
        const dayIndex = new Date(workout.date).getDay();
        stats[dayIndex].duration += workout.duration || 0;
        stats[dayIndex].calories += workout.calories || 0;
      });
    
    return stats;
  }, [workoutLogs]);
  
  // Calculate streak
  const calculateStreak = () => {
    if (!workoutLogs || workoutLogs.length === 0) return 0;

    const uniqueDatesSet = new Set(workoutLogs.map(w => new Date(w.date).toDateString()));
    const uniqueDates = Array.from(uniqueDatesSet)
      .map(d => new Date(d))
      .sort((a, b) => b - a);

    let streak = 0;
    let currentDate = new Date();

    for (let date of uniqueDates) {
      const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentDate = date;
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateBMI = () => {
    const heightInMeters = parseFloat(bmiData.height) / 100;
    const weightInKg = parseFloat(bmiData.weight);
    
    if (heightInMeters && weightInKg) {
      const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
      let category = '';
      
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal';
      else if (bmi < 30) category = 'Overweight';
      else category = 'Obese';
      
      setBmiData({ ...bmiData, bmi, category });
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-red-500/30 p-3 rounded-lg">
          <p className="text-white font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate stats
  const totalWorkouts = workoutLogs?.length || 0;
  const weeklyWorkouts = workoutLogs?.filter(w => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(w.date) >= weekAgo;
  }).length || 0;

  const totalCalories = workoutStats.reduce((sum, day) => sum + day.calories, 0);
  const weightChange = measurements?.length > 1 
    ? (measurements[measurements.length - 1].weight - measurements[0].weight).toFixed(1)
    : 0;

  const currentStreak = calculateStreak();

  // Loading state
  if (loadpage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-red-500 mx-auto mb-4" size={48} />
          <p className="text-white text-xl">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <Header
        currentStreak={currentStreak}
        userName={userName}
        handleLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
          {/* Quick Stats Grid */}
          
          <StatsOverview
            getDaysRemaining={getDaysRemaining}
            activeMembership={activeMembership}
            weeklyWorkouts={weeklyWorkouts}
            weightChange={weightChange}
            totalCalories={totalCalories}
          />

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Progress Chart */}
            <WeightProgress
              filteredWeightData={filteredWeightData}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              setActiveTab={setActiveTab}
            />
            {/* Goals Card */}
            <GoalSection currentWeight={currentWeight} userId={user?.id || ''}/>
            <div>
          {/* Rest of your content */}
        </div>
          </div>
          {/* Weekly Activity and Recent Workouts */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Weekly Activity Chart */}
            <WeeklyActivity workoutStats={workoutStats} />
            {/* Recent Workouts */}
            <RecentWorkouts workoutLogs={workoutLogs} setActiveTab={setActiveTab} />
          </div>

          {/* Membership Details */}
          {activeMembership && (
            <ActiveMembershipCard
              activeMembership={activeMembership}
              getDaysRemaining={getDaysRemaining}
            />
          )}

          {/* Quick Actions */}
          <QuickLink setActiveTab={setActiveTab} />
        </div>
        )}

        {/* Measurements Tab */}
        {activeTab === 'measurements' && (
          <AddMeasurements
  measurements={measurements}
  setActiveTab={setActiveTab}
  setShowMeasurementModal={setShowMeasurementModal}
/>
        )}

        {/* BMI Tab */}
        {activeTab === 'bmi' && (
          <BMICalculator setActiveTab={setActiveTab} />
        )}

        {/* Diet Tab */}
        {activeTab === 'diet' && (
          <DietPlan setActiveTab={setActiveTab} />
        )}

        {/* Workout Tab */}
        {activeTab === 'workout' && (
          <WorkoutDashboard
          setActiveTab={setActiveTab}
          setShowWorkoutModal={setShowWorkoutModal}
          workoutLogs={workoutLogs}
          workoutStats={workoutStats}
          totalWorkouts={workoutLogs.length}
          currentStreak={3}
          weeklyWorkouts={5}
          CustomTooltip={() => <div>Tooltip</div>}
        />
        )}
      </div>

      {/* Modals */}
      {/* Add Measurement Modal */}
      {showMeasurementModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-red-500/30 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Add Measurement</h3>
              <button onClick={() => setShowMeasurementModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Weight (kg) *", key: "weight", placeholder: "72.5" },
          { label: "Chest (cm)", key: "chest", placeholder: "99" },
          { label: "Waist (cm)", key: "waist", placeholder: "78" },
          { label: "Hips (cm)", key: "hips", placeholder: "92" },
          { label: "Arms (cm)", key: "arms", placeholder: "37" },
          { label: "Thighs (cm)", key: "thighs", placeholder: "56" },
        ].map((field) => (
          <div key={field.key}>
            <label className="text-white block mb-2 text-sm">{field.label}</label>
            <input
              type="number"
              step="0.1"
              value={newMeasurement[field.key]}
              onChange={(e) =>
                setNewMeasurement({ ...newMeasurement, [field.key]: e.target.value })
              }
              className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setShowMeasurementModal(false)}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={addMeasurement}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
        >
          <Save size={16} className="mr-2" />
          {isUpdateMeasurement ? "Update" : "Save"}
        </button>
      </div>
    </div>
          </div>
        </div>
      )}

      {/* Add Workout Modal */}
      {showWorkoutModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Log Workout</h3>
              <button onClick={() => setShowWorkoutModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
  {/* Date */}
  <div>
    <label className="text-white block mb-1 text-sm">Date</label>
    <input
      type="date"
      value={newWorkout.date}
      onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
      className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
    />
  </div>

  {/* Workout Type */}
  <div>
    <label className="text-white block mb-1 text-sm">Workout Type *</label>
        <Listbox value={newWorkout.type} onChange={(value) => setNewWorkout({ ...newWorkout, type: value })}>
      <div className="relative">
        {/* Button that shows the currently selected workout type */}
        <Listbox.Button className="w-full bg-black/50 border border-gray-800 text-white rounded-lg px-3 py-2 text-sm flex justify-between items-center">
          {newWorkout.type || 'Select workout type'}
          <ChevronDown className="text-gray-400" size={16} />
        </Listbox.Button>

        {/* Options list */}
        <Listbox.Options className="absolute mt-1 w-full bg-black/100 border border-gray-700 rounded-lg z-10 max-h-60 overflow-auto text-white">
          {workoutOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option} // this sets newWorkout.type when selected
              className={({ active }) =>
                `cursor-pointer px-3 py-2 ${active ? 'bg-purple-500/30' : ''}`
              }
            >
              {option}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  </div>

  {/* Numeric Inputs */}
  <div className="grid grid-cols-3 gap-3">
    <div>
      <label className="text-white block mb-1 text-sm">Duration (min) *</label>
      <input
        type="number"
        value={newWorkout.duration}
        onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
        className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
        placeholder="45"
      />
    </div>
    <div>
      <label className="text-white block mb-1 text-sm">Exercises</label>
      <input
        type="number"
        value={newWorkout.exercises}
        onChange={(e) => setNewWorkout({ ...newWorkout, exercises: e.target.value })}
        className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
        placeholder="8"
      />
    </div>
    <div>
      <label className="text-white block mb-1 text-sm">Calories</label>
      <input
        type="number"
        value={newWorkout.calories}
        onChange={(e) => setNewWorkout({ ...newWorkout, calories: e.target.value })}
        className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
        placeholder="320"
      />
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex gap-3 mt-4">
    <button
      onClick={() => setShowWorkoutModal(false)}
      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors text-sm"
    >
      Cancel
    </button>
    <button
      onClick={addWorkout}
      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center text-sm"
    >
      <Save size={16} className="mr-2" />
      Save
    </button>
  </div>
</div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { 
  User, 
  TrendingUp, 
  TrendingDown,
  Heart, 
  Calendar, 
  Activity,
  Weight,
  Ruler,
  Apple,
  Dumbbell,
  LogOut,
  ArrowLeft,
  Target,
  Award,
  Plus,
  ChevronRight,
  Flame,
  Clock,
  CheckCircle2,
  BarChart3,
  Download,
  Share2,
  Settings,
  X,
  Save,
  Loader,
  Zap,
  CreditCard
} from 'lucide-react';

const MemberDashboard = () => {
  const { user, userName, signOut } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
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

      // Fetch workout logs (if table exists, otherwise skip)
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(20);

      if (!workoutsError) {
        setWorkoutLogs(workoutsData || []);
      }

      // Fetch goals (if table exists, otherwise skip)
      const { data: goalsData, error: goalsError } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('user_id', user.id);

      if (!goalsError) {
        setGoals(goalsData || []);
      }

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
      const { data, error } = await supabase
        .from('user_measurements')
        .insert([{
          user_id: user.id,
          weight: parseFloat(newMeasurement.weight),
          chest: newMeasurement.chest ? parseFloat(newMeasurement.chest) : null,
          waist: newMeasurement.waist ? parseFloat(newMeasurement.waist) : null,
          hips: newMeasurement.hips ? parseFloat(newMeasurement.hips) : null,
          arms: newMeasurement.arms ? parseFloat(newMeasurement.arms) : null,
          thighs: newMeasurement.thighs ? parseFloat(newMeasurement.thighs) : null,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

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

  // Add new goal
  const addGoal = async () => {
    if (!newGoal.name || !newGoal.target) {
      alert('Please enter goal name and target');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fitness_goals')
        .insert([{
          user_id: user.id,
          name: newGoal.name,
          current: newGoal.current ? parseFloat(newGoal.current) : 0,
          target: parseFloat(newGoal.target),
          unit: newGoal.unit
        }])
        .select();

      if (error) throw error;

      // Refresh goals
      await fetchAllData();
      
      setNewGoal({ name: '', current: '', target: '', unit: '' });
      setShowGoalModal(false);
    } catch (err) {
      console.error('Error adding goal:', err);
      alert('Failed to add goal. Please try again.');
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

  // Calculate goal progress
  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    if (current >= target) return 100;
    return Math.round((current / target) * 100);
  };

  // Calculate streak
  const calculateStreak = () => {
    if (!workoutLogs || workoutLogs.length === 0) return 0;
    
    const sortedWorkouts = [...workoutLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let currentDate = new Date();
    
    for (let workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= streak + 1) {
        streak++;
        currentDate = workoutDate;
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
  if (loading) {
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
      <header className="bg-black/50 backdrop-blur-sm border-b border-red-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-white hover:text-red-500 transition-colors">
                <ArrowLeft size={24} />
              </a>
              <h1 className="text-2xl font-bold">
                SUPER<span className="text-red-500">FIT</span>
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              {currentStreak > 0 && (
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-red-500/20 rounded-full border border-red-500/30">
                  <Flame className="text-red-500" size={16} />
                  <span className="text-white text-sm font-semibold">{currentStreak} Day Streak 🔥</span>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <span className="text-white">Welcome, <span className="font-bold text-red-500">{userName}</span></span>
                <button className="text-white hover:text-red-500 transition-colors">
                  <Settings size={20} />
                </button>
                <button onClick={signOut} className="text-white hover:text-red-500 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl p-6 hover:from-red-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Days Left</p>
                    <p className="text-4xl font-bold text-white">{getDaysRemaining()}</p>
                    <p className="text-red-400 text-xs mt-1">{activeMembership?.package_name || 'No Active Plan'}</p>
                  </div>
                  <Calendar className="text-red-500" size={40} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6 hover:from-blue-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">This Week</p>
                    <p className="text-4xl font-bold text-white">{weeklyWorkouts}</p>
                    <p className="text-blue-400 text-xs mt-1">Workouts Done</p>
                  </div>
                  <Dumbbell className="text-blue-500" size={40} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6 hover:from-green-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Weight Progress</p>
                    <p className="text-4xl font-bold text-white">{weightChange > 0 ? '+' : ''}{weightChange}</p>
                    <p className={`text-xs mt-1 flex items-center ${weightChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {weightChange < 0 ? <TrendingDown size={12} className="mr-1" /> : <TrendingUp size={12} className="mr-1" />}
                      kg {weightChange < 0 ? 'lost' : 'gained'}
                    </p>
                  </div>
                  <Weight className="text-green-500" size={40} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6 hover:from-purple-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Calories</p>
                    <p className="text-4xl font-bold text-white">{(totalCalories / 1000).toFixed(1)}k</p>
                    <p className="text-purple-400 text-xs mt-1">Burned this week</p>
                  </div>
                  <Flame className="text-purple-500" size={40} />
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Progress Chart */}
              <div className="lg:col-span-2 bg-black/50 border border-red-500/30 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <BarChart3 className="mr-3 text-red-500" size={28} />
                      Weight Progress
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">{filteredWeightData.length} data points</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className={`px-3 py-1 rounded-lg text-sm ${selectedPeriod === '7d' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400'}`}
                      onClick={() => setSelectedPeriod('7d')}
                    >
                      7D
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-lg text-sm ${selectedPeriod === '30d' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400'}`}
                      onClick={() => setSelectedPeriod('30d')}
                    >
                      30D
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-lg text-sm ${selectedPeriod === '90d' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400'}`}
                      onClick={() => setSelectedPeriod('90d')}
                    >
                      90D
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-lg text-sm ${selectedPeriod === 'all' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400'}`}
                      onClick={() => setSelectedPeriod('all')}
                    >
                      ALL
                    </button>
                  </div>
                </div>
                {filteredWeightData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={filteredWeightData}>
                      <defs>
                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="weight" stroke="#ef4444" fill="url(#weightGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Weight className="mx-auto mb-3 opacity-50" size={48} />
                      <p>No measurement data yet</p>
                      <button
                        onClick={() => setActiveTab('measurements')}
                        className="mt-3 text-sm text-red-500 hover:text-red-400"
                      >
                        Add your first measurement →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Goals Card */}
              <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Target className="mr-2 text-purple-500" size={24} />
                  Your Goals
                </h3>
                <div className="space-y-4">
                  {goals && goals.length > 0 ? (
                    goals.map((goal) => {
                      const progress = calculateProgress(goal.current, goal.target);
                      return (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white text-sm font-medium">{goal.name}</span>
                            <span className="text-gray-400 text-xs">{goal.current}/{goal.target} {goal.unit}</span>
                          </div>
                          <div className="bg-gray-800 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                progress >= 75 ? 'bg-green-500' : 
                                progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="mx-auto mb-2 opacity-50" size={32} />
                      <p className="text-sm">No goals set yet</p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setShowGoalModal(true)}
                  className="w-full mt-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-white py-2 rounded-lg transition-all flex items-center justify-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add New Goal
                </button>
              </div>
            </div>

            {/* Weekly Activity and Recent Workouts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Weekly Activity Chart */}
              <div className="bg-black/50 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Activity className="mr-2 text-blue-500" size={24} />
                  Weekly Activity
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={workoutStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="day" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="duration" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Workouts */}
              <div className="bg-black/50 border border-green-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <CheckCircle2 className="mr-2 text-green-500" size={24} />
                  Recent Workouts
                </h3>
                <div className="space-y-3">
                  {workoutLogs && workoutLogs.length > 0 ? (
                    workoutLogs.slice(0, 4).map((workout) => (
                      <div key={workout.id} className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-4 hover:from-green-500/20 transition-all cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-semibold">{workout.type}</p>
                            <p className="text-gray-400 text-xs mt-1">{new Date(workout.date).toLocaleDateString()}</p>
                          </div>
                          <ChevronRight className="text-gray-600" size={20} />
                        </div>
                        <div className="flex gap-4 mt-3">
                          <div className="flex items-center text-sm">
                            <Clock className="text-blue-400 mr-1" size={14} />
                            <span className="text-gray-300">{workout.duration} min</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Dumbbell className="text-purple-400 mr-1" size={14} />
                            <span className="text-gray-300">{workout.exercises} exercises</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Flame className="text-orange-400 mr-1" size={14} />
                            <span className="text-gray-300">{workout.calories} cal</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Dumbbell className="mx-auto mb-2 opacity-50" size={32} />
                      <p className="text-sm">No workouts logged yet</p>
                      <button
                        onClick={() => setActiveTab('workout')}
                        className="mt-3 text-sm text-green-500 hover:text-green-400"
                      >
                        Log your first workout →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Membership Details */}
            {activeMembership && (
              <div className="bg-black/50 border border-red-500/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <CreditCard className="mr-3 text-red-500" size={28} />
                  Active Membership
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Package</p>
                    <p className="text-white font-semibold">{activeMembership.package_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Start Date</p>
                    <p className="text-white font-semibold">{new Date(activeMembership.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">End Date</p>
                    <p className="text-white font-semibold">{new Date(activeMembership.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-4 bg-red-500/20 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (getDaysRemaining() / 30) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('measurements')}
                className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl p-6 hover:from-red-500/30 transition-all group"
              >
                <Ruler className="text-red-500 mx-auto mb-3 group-hover:scale-110 transition-transform" size={32} />
                <p className="text-white font-semibold">Track Progress</p>
                <p className="text-gray-400 text-xs mt-1">Body measurements</p>
              </button>

              <button
                onClick={() => setActiveTab('bmi')}
                className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6 hover:from-blue-500/30 transition-all group"
              >
                <Weight className="text-blue-500 mx-auto mb-3 group-hover:scale-110 transition-transform" size={32} />
                <p className="text-white font-semibold">BMI Check</p>
                <p className="text-gray-400 text-xs mt-1">Calculate your BMI</p>
              </button>

              <button
                onClick={() => setActiveTab('diet')}
                className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6 hover:from-green-500/30 transition-all group"
              >
                <Apple className="text-green-500 mx-auto mb-3 group-hover:scale-110 transition-transform" size={32} />
                <p className="text-white font-semibold">Diet Plan</p>
                <p className="text-gray-400 text-xs mt-1">Nutrition guide</p>
              </button>

              <button
                onClick={() => setActiveTab('workout')}
                className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6 hover:from-purple-500/30 transition-all group"
              >
                <Dumbbell className="text-purple-500 mx-auto mb-3 group-hover:scale-110 transition-transform" size={32} />
                <p className="text-white font-semibold">Workout Log</p>
                <p className="text-gray-400 text-xs mt-1">Track exercises</p>
              </button>
            </div>
          </div>
        )}

        {/* Measurements Tab */}
        {activeTab === 'measurements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setActiveTab('overview')}
                className="text-white hover:text-red-500 flex items-center transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Dashboard
              </button>
              <div className="flex gap-2">
                <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                  <Download size={16} className="mr-2" />
                  Export
                </button>
                <button 
                  onClick={() => setShowMeasurementModal(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  Add Measurement
                </button>
              </div>
            </div>

            {measurements && measurements.length > 0 ? (
              <>
                <div className="bg-black/50 border border-red-500/30 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <TrendingUp className="mr-3 text-red-500" size={28} />
                    Body Measurements Trend
                  </h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={measurements.slice(-10).map(m => ({
                      date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      weight: m.weight,
                      chest: m.chest,
                      waist: m.waist
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="weight" stroke="#ef4444" strokeWidth={2} name="Weight (kg)" />
                      <Line type="monotone" dataKey="chest" stroke="#3b82f6" strokeWidth={2} name="Chest (cm)" />
                      <Line type="monotone" dataKey="waist" stroke="#10b981" strokeWidth={2} name="Waist (cm)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {measurements.slice(-2).reverse().map((m, idx) => (
                    <div key={m.id} className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-white font-semibold text-lg">{new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        {idx === 0 && <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs">Latest</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-black/30 rounded-lg">
                          <p className="text-gray-400 text-xs mb-1">Weight</p>
                          <p className="text-white font-bold text-xl">{m.weight}</p>
                          <p className="text-gray-500 text-xs">kg</p>
                        </div>
                        <div className="text-center p-3 bg-black/30 rounded-lg">
                          <p className="text-gray-400 text-xs mb-1">Chest</p>
                          <p className="text-white font-bold text-xl">{m.chest || '-'}</p>
                          <p className="text-gray-500 text-xs">cm</p>
                        </div>
                        <div className="text-center p-3 bg-black/30 rounded-lg">
                          <p className="text-gray-400 text-xs mb-1">Waist</p>
                          <p className="text-white font-bold text-xl">{m.waist || '-'}</p>
                          <p className="text-gray-500 text-xs">cm</p>
                        </div>
                        <div className="text-center p-3 bg-black/30 rounded-lg">
                          <p className="text-gray-400 text-xs mb-1">Hips</p>
                          <p className="text-white font-bold text-xl">{m.hips || '-'}</p>
                          <p className="text-gray-500 text-xs">cm</p>
                        </div>
                        <div className="text-center p-3 bg-black/30 rounded-lg">
                          <p className="text-gray-400 text-xs mb-1">Arms</p>
                          <p className="text-white font-bold text-xl">{m.arms || '-'}</p>
                          <p className="text-gray-500 text-xs">cm</p>
                        </div>
                        <div className="text-center p-3 bg-black/30 rounded-lg">
                          <p className="text-gray-400 text-xs mb-1">Thighs</p>
                          <p className="text-white font-bold text-xl">{m.thighs || '-'}</p>
                          <p className="text-gray-500 text-xs">cm</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-black/50 border border-red-500/30 rounded-xl p-12 text-center">
                <Ruler className="mx-auto mb-4 text-red-500 opacity-50" size={64} />
                <h3 className="text-2xl font-bold text-white mb-2">No Measurements Yet</h3>
                <p className="text-gray-400 mb-6">Start tracking your body measurements to see your progress over time</p>
                <button 
                  onClick={() => setShowMeasurementModal(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Add First Measurement
                </button>
              </div>
            )}
          </div>
        )}

        {/* BMI Tab */}
        {activeTab === 'bmi' && (
          <div className="space-y-6">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-white hover:text-red-500 flex items-center transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </button>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-black/50 border border-blue-500/30 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Weight className="mr-3 text-blue-500" size={28} />
                  BMI Calculator
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-white block mb-2 font-medium">Height (cm)</label>
                    <input
                      type="number"
                      value={bmiData.height}
                      onChange={(e) => setBmiData({ ...bmiData, height: e.target.value })}
                      className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="e.g., 175"
                    />
                  </div>
                  <div>
                    <label className="text-white block mb-2 font-medium">Weight (kg)</label>
                    <input
                      type="number"
                      value={bmiData.weight}
                      onChange={(e) => setBmiData({ ...bmiData, weight: e.target.value })}
                      className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="e.g., 70"
                    />
                  </div>

                  <button
                    onClick={calculateBMI}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors mt-6"
                  >
                    Calculate BMI
                  </button>
                </div>

                {bmiData.bmi && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Your BMI</p>
                      <p className="text-6xl font-bold text-white mb-3">{bmiData.bmi}</p>
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                        bmiData.category === 'Normal' ? 'bg-green-500/20 text-green-400' :
                        bmiData.category === 'Overweight' ? 'bg-yellow-500/20 text-yellow-400' :
                        bmiData.category === 'Underweight' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {bmiData.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-black/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">BMI Categories</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <span className="text-white font-medium">Underweight</span>
                    <span className="text-blue-400 font-semibold">&lt; 18.5</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <span className="text-white font-medium">Normal Weight</span>
                    <span className="text-green-400 font-semibold">18.5 - 24.9</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <span className="text-white font-medium">Overweight</span>
                    <span className="text-yellow-400 font-semibold">25 - 29.9</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <span className="text-white font-medium">Obese</span>
                    <span className="text-red-400 font-semibold">≥ 30</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    <strong className="text-white">Note:</strong> BMI is a general indicator and doesn't account for muscle mass, bone density, or body composition. Consult with fitness professionals for personalized assessments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Diet Tab */}
        {activeTab === 'diet' && (
          <div className="space-y-6">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-white hover:text-red-500 flex items-center transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </button>

            <div className="bg-black/50 border border-green-500/30 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Apple className="mr-3 text-green-500" size={28} />
                  General Diet Guidelines
                </h2>
                <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                  <Share2 size={16} className="mr-2" />
                  Share Plan
                </button>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">Calories</p>
                  <p className="text-3xl font-bold text-white">2,200</p>
                  <p className="text-blue-400 text-xs mt-1">Daily Target</p>
                </div>
                <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">Protein</p>
                  <p className="text-3xl font-bold text-white">165g</p>
                  <p className="text-red-400 text-xs mt-1">30% of diet</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">Carbs</p>
                  <p className="text-3xl font-bold text-white">220g</p>
                  <p className="text-yellow-400 text-xs mt-1">40% of diet</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">Fats</p>
                  <p className="text-3xl font-bold text-white">73g</p>
                  <p className="text-purple-400 text-xs mt-1">30% of diet</p>
                </div>
              </div>

              <div className="space-y-4 text-white">
                <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2 text-green-500">Breakfast (7-9 AM)</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>Oatmeal with fruits and nuts</li>
                    <li>Eggs (2-3) with whole wheat toast</li>
                    <li>Protein shake with banana</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2 text-green-500">Lunch (12-2 PM)</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>Grilled chicken/fish with brown rice</li>
                    <li>Large portion of vegetables</li>
                    <li>Lentils or beans</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2 text-green-500">Dinner (7-9 PM)</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>Lean protein (chicken/fish/tofu)</li>
                    <li>Steamed vegetables</li>
                    <li>Small portion of complex carbs</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2 text-blue-500">Hydration & Snacks</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>Drink 3-4 liters of water daily</li>
                    <li>Nuts and fruits for snacks</li>
                    <li>Greek yogurt or protein bars</li>
                  </ul>
                </div>
              </div>

              <p className="text-center text-gray-400 text-sm italic mt-6">
                This is a general nutrition plan. Consult with a nutritionist for a personalized diet plan based on your specific goals.
              </p>
            </div>
          </div>
        )}

        {/* Workout Tab */}
        {activeTab === 'workout' && (
          <div className="space-y-6">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-white hover:text-red-500 flex items-center transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </button>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <Dumbbell className="mr-3 text-purple-500" size={28} />
                      Workout History
                    </h2>
                    <button 
                      onClick={() => setShowWorkoutModal(true)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                    >
                      <Plus size={16} className="mr-2" />
                      Log Workout
                    </button>
                  </div>

                  {workoutLogs && workoutLogs.length > 0 ? (
                    <div className="space-y-4">
                      {workoutLogs.map((workout) => (
                        <div key={workout.id} className="bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-lg p-5 hover:from-purple-500/20 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-white font-bold text-lg">{workout.type}</h3>
                              <p className="text-gray-400 text-sm">{new Date(workout.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                            </div>
                            <ChevronRight className="text-gray-600" size={24} />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-black/30 rounded-lg p-3 text-center">
                              <Clock className="text-blue-400 mx-auto mb-1" size={16} />
                              <p className="text-white font-semibold">{workout.duration}</p>
                              <p className="text-gray-400 text-xs">minutes</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3 text-center">
                              <Activity className="text-purple-400 mx-auto mb-1" size={16} />
                              <p className="text-white font-semibold">{workout.exercises}</p>
                              <p className="text-gray-400 text-xs">exercises</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3 text-center">
                              <Flame className="text-orange-400 mx-auto mb-1" size={16} />
                              <p className="text-white font-semibold">{workout.calories}</p>
                              <p className="text-gray-400 text-xs">calories</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Dumbbell className="mx-auto mb-4 text-purple-500 opacity-50" size={64} />
                      <h3 className="text-xl font-bold text-white mb-2">No Workouts Logged</h3>
                      <p className="text-gray-400 mb-6">Start logging your workouts to track your fitness journey</p>
                      <button 
                        onClick={() => setShowWorkoutModal(true)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
                      >
                        <Plus size={20} className="mr-2" />
                        Log First Workout
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-black/50 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <BarChart3 className="mr-2 text-blue-500" size={24} />
                    This Week's Activity
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={workoutStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="day" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="calories" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-black/50 border border-green-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Award className="mr-2 text-green-500" size={24} />
                    This Month
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Total Workouts</p>
                      <p className="text-3xl font-bold text-white">{totalWorkouts}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Total Time</p>
                      <p className="text-3xl font-bold text-white">
                        {(workoutLogs.reduce((sum, w) => sum + (w.duration || 0), 0) / 60).toFixed(1)}
                      </p>
                      <p className="text-blue-400 text-xs">hours</p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Calories Burned</p>
                      <p className="text-3xl font-bold text-white">
                        {workoutLogs.reduce((sum, w) => sum + (w.calories || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/50 border border-yellow-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Flame className="mr-2 text-yellow-500" size={24} />
                    Achievements
                  </h3>
                  <div className="space-y-3">
                    {currentStreak > 0 && (
                      <div className="flex items-center space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="bg-yellow-500/20 p-2 rounded-lg">
                          <Award className="text-yellow-500" size={20} />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{currentStreak} Day Streak</p>
                          <p className="text-gray-400 text-xs">Keep it up!</p>
                        </div>
                      </div>
                    )}
                    {weeklyWorkouts >= 5 && (
                      <div className="flex items-center space-x-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <div className="bg-purple-500/20 p-2 rounded-lg">
                          <Target className="text-purple-500" size={20} />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">Goal Crusher</p>
                          <p className="text-gray-400 text-xs">Met weekly target</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                <div>
                  <label className="text-white block mb-2 text-sm">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.weight}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, weight: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                    placeholder="72.5"
                  />
                </div>
                <div>
                  <label className="text-white block mb-2 text-sm">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.chest}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, chest: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                    placeholder="99"
                  />
                </div>
                <div>
                  <label className="text-white block mb-2 text-sm">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.waist}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, waist: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                    placeholder="78"
                  />
                </div>
                <div>
                  <label className="text-white block mb-2 text-sm">Hips (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.hips}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, hips: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                    placeholder="92"
                  />
                </div>
                <div>
                  <label className="text-white block mb-2 text-sm">Arms (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.arms}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, arms: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                    placeholder="37"
                  />
                </div>
                <div>
                  <label className="text-white block mb-2 text-sm">Thighs (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.thighs}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, thighs: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                    placeholder="56"
                  />
                </div>
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
                  Save
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

            <div className="space-y-4">
              <div>
                <label className="text-white block mb-2 text-sm">Date</label>
                <input
                  type="date"
                  value={newWorkout.date}
                  onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
                  className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-white block mb-2 text-sm">Workout Type *</label>
                <input
                  type="text"
                  value={newWorkout.type}
                  onChange={(e) => setNewWorkout({ ...newWorkout, type: e.target.value })}
                  className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., Chest & Triceps"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-white block mb-2 text-sm">Duration (min) *</label>
                  <input
                    type="number"
                    value={newWorkout.duration}
                    onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                    placeholder="45"
                  />
                </div>
                <div>
                  <label className="text-white block mb-2 text-sm">Exercises</label>
                  <input
                    type="number"
                    value={newWorkout.exercises}
                    onChange={(e) => setNewWorkout({ ...newWorkout, exercises: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                    placeholder="8"
                  />
                </div>
                <div>
                  <label className="text-white block mb-2 text-sm">Calories</label>
                  <input
                    type="number"
                    value={newWorkout.calories}
                    onChange={(e) => setNewWorkout({ ...newWorkout, calories: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                    placeholder="320"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowWorkoutModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addWorkout}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Save size={16} className="mr-2" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Add New Goal</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white block mb-2 text-sm">Goal Name *</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., Monthly Workouts"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-white block mb-2 text-sm">Current</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newGoal.current}
                    onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-white block mb-2 text-sm">Target *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="text-white block mb-2 text-sm">Unit</label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                    placeholder="kg"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addGoal}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
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
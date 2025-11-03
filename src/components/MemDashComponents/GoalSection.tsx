// src/components/GoalSection.tsx
import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, TrendingUp, TrendingDown, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: number;
  user_id?: string;
  goal_type: string;
  current_value: number;
  target_value: number;
  unit: string;
  status?: string;
  progress?: number;
  created_at?: string;
}

interface Measurement {
  id: number;
  user_id: string;
  weight?: number;
  chest?: number;
  hip?: number;
  thigh?: number;
  bicep?: number;
  waist?: number;
  created_at: string;
}

interface GoalSectionProps {
  measurements: Measurement[];
  userId: string;
}

export const GoalSection: React.FC<GoalSectionProps> = ({ 
  measurements, 
  userId 
}) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: '',
    current:'',
    target: '',
  });
  const [errors, setErrors] = useState<any>({});
  const { toast } = useToast();

  const goalTypes = [
    { value: 'Weight Loss', icon: TrendingDown, unit: 'kg' },
    { value: 'Weight Gain', icon: TrendingUp, unit: 'kg' },
  ];

  // Get current weight from latest measurement
  const getCurrentWeight = (): number => {
    if (measurements.length === 0) return 0;
    const latestMeasurement = measurements[measurements.length - 1];
    return latestMeasurement.weight || 0;
  };

  // Fetch goals from database
  useEffect(() => {
    if (userId) {
      fetchGoals();
    }
  }, [userId]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;
      
      setGoals(goalsData || []);
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load goals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get the most recent measurement value for a goal
  const getCurrentValueForGoal = (goal: Goal): number => {
    if (!goal.created_at) return goal.current_value;
    
    // Filter measurements that were created after the goal
    const measurementsAfterGoal = measurements.filter(
      m => new Date(m.created_at) > new Date(goal.created_at!)
    );
    
    // If no measurements after goal creation, use the initial value
    if (measurementsAfterGoal.length === 0) {
      return goal.current_value;
    }
    
    // Get the most recent measurement
    const mostRecentMeasurement = measurementsAfterGoal[measurementsAfterGoal.length - 1];
    
    // Return the appropriate measurement based on goal type
    if (goal.goal_type.includes('Weight')) {
      return mostRecentMeasurement.weight || goal.current_value;
    } else if (goal.goal_type.includes('Chest')) {
      return mostRecentMeasurement.chest || goal.current_value;
    } else if (goal.goal_type.includes('Hip')) {
      return mostRecentMeasurement.hip || goal.current_value;
    } else if (goal.goal_type.includes('Thigh')) {
      return mostRecentMeasurement.thigh || goal.current_value;
    } else if (goal.goal_type.includes('Bicep')) {
      return mostRecentMeasurement.bicep || goal.current_value;
    } else if (goal.goal_type.includes('Waist')) {
      return mostRecentMeasurement.waist || goal.current_value;
    }
    
    return goal.current_value;
  };

  const calculateProgress = (goal: Goal) => {
    const currentValue = getCurrentValueForGoal(goal);
    const initialValue = goal.current_value;
    const targetValue = goal.target_value;
    
    if (goal.goal_type === 'Weight Loss' || goal.goal_type === 'Body Fat Loss') {
      const totalToLose = initialValue - targetValue;
      if (totalToLose <= 0) return 100; // Already at or below target
      const lost = initialValue - currentValue;
      const progress = (lost / totalToLose) * 100;
      return Math.max(0, Math.min(progress, 100));
    } else {
      const totalToGain = targetValue - initialValue;
      if (totalToGain <= 0) return 100; // Already at or above target
      const gained = currentValue - initialValue;
      const progress = (gained / totalToGain) * 100;
      return Math.max(0, Math.min(progress, 100));
    }
  };

  const validateGoal = () => {
    const newErrors: any = {};
    const currentWeight = getCurrentWeight();

    if (!newGoal.type) {
      newErrors.type = 'Please select a goal type';
    }

    if (!newGoal.target) {
      newErrors.target = 'Please enter target value';
    } else {
      const targetNum = parseFloat(newGoal.target);
      if (isNaN(targetNum) || targetNum <= 0) {
        newErrors.target = 'Target must be a positive number';
      } else {
        if (currentWeight > 0) {
          if (newGoal.type === 'Weight Loss' && targetNum >= currentWeight) {
            newErrors.target = `Target must be less than current weight (${currentWeight} kg)`;
          } else if (newGoal.type === 'Weight Gain' && targetNum <= currentWeight) {
            newErrors.target = `Target must be greater than current weight (${currentWeight} kg)`;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddGoal = async () => {
    if (validateGoal()) {
      try {
        const selectedGoalType = goalTypes.find(g => g.value === newGoal.type);
        const currentWeight = getCurrentWeight();
        
        if(newGoal.current === ''){
          newGoal.current = `${currentWeight}`;
        }
        
        const newGoalData = {
          user_id: userId,
          goal_type: newGoal.type,
          current_value: parseFloat(newGoal.current),
          target_value: parseFloat(newGoal.target),
          unit: selectedGoalType?.unit || 'kg',
          status: 'active',
          progress: 0,
        };

        const { data, error } = await supabase
          .from('goals')
          .insert([newGoalData])
          .select()
          .single();

        if (error) throw error;

        setGoals([data, ...goals]);
        setNewGoal({ type: '', current:'', target: '' });
        setShowGoalModal(false);
        setErrors({});

        toast({
          title: 'Success',
          description: 'Goal created successfully',
        });
      } catch (error: any) {
        console.error('Error creating goal:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to create goal',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setGoals(goals.filter(goal => goal.id !== id));

      toast({
        title: 'Success',
        description: 'Goal deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete goal',
        variant: 'destructive',
      });
    }
  };

  const getRemainingValue = (goal: Goal) => {
    const currentValue = getCurrentValueForGoal(goal);
    
    if (goal.goal_type === 'Weight Loss') {
      // For weight loss: show how much more needs to be lost
      return Math.max(0, currentValue - goal.target_value);
    } else {
      // For weight gain: show how much more needs to be gained
      return Math.max(0, goal.target_value - currentValue);
    }
  };

  const getDaysSinceGoalCreated = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="bg-black/50 border border-purple-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
          <Target className="mr-2 text-purple-500" size={20} />
          Your Goals
        </h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 text-sm mt-2">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-black/50 border border-purple-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center">
          <Target className="mr-2 text-purple-500" size={16} />
          Your Goals
        </h3>
        <div >
        <div
        className="goals-list space-y-2 space-x-1 sm:space-y-3 overflow-y-auto pr-1"
        style={{ maxHeight: 200 }}
      >
            <style>{`
                .goals-list {
                scrollbar-width: thin;
                scrollbar-color: rgba(128,90,213,0.18) transparent; /* Firefox */
                }

                .goals-list::-webkit-scrollbar {
                width: 6px;
                }
                .goals-list::-webkit-scrollbar-track {
                background: transparent;
                }
                .goals-list::-webkit-scrollbar-thumb {
                background: rgba(128,90,213,0); /* hidden by default */
                border-radius: 9999px;
                box-shadow: none;
                transition: background 150ms ease, box-shadow 150ms ease;
                }
                .goals-list:hover::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, rgba(128,90,213,0.18), rgba(128,90,213,0.12));
                box-shadow: 0 0 8px rgba(128,90,213,0.06), inset 0 0 2px rgba(0,0,0,0.4);
                }
                .goals-list:hover::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(180deg, rgba(128,90,213,0.28), rgba(128,90,213,0.16));
                box-shadow: 0 0 10px rgba(128,90,213,0.08);
                }
            `}</style>

            {goals && goals.length > 0 ? (
                goals.map((goal) => {
                const progress = calculateProgress(goal);
                const remaining = getRemainingValue(goal);
                const currentValue = getCurrentValueForGoal(goal);
                const daysSinceCreated = goal.created_at ? getDaysSinceGoalCreated(goal.created_at) : 0;
                const GoalIcon = goalTypes.find(g => g.value === goal.goal_type)?.icon || Target;

                return (
                    <div key={goal.id} className="bg-gradient-to-r from-purple-500/5 to-transparent border border-purple-500/20 rounded-lg p-2.5 sm:p-3 hover:from-purple-500/15 hover:border-purple-500/40 hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`p-1 rounded ${
                          goal.goal_type.includes('Loss') ? 'bg-orange-500/20' : 'bg-green-500/20'
                        }`}>
                          <GoalIcon 
                            className={goal.goal_type.includes('Loss') ? 'text-orange-400' : 'text-green-400'} 
                            size={14} 
                          />
                        </div>
                        <span className="text-white text-xs sm:text-sm font-medium truncate pr-2">
                          {goal.goal_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-[10px] sm:text-xs whitespace-nowrap">
                          {currentValue.toFixed(1)}/{goal.target_value} {goal.unit}
                        </span>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="opacity-50 hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-400 hover:bg-red-800/10 rounded"
                          title="Delete goal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          progress >= 75 ? 'bg-green-500' : 
                          progress >= 50 ? 'bg-yellow-500' : 
                          progress >= 25 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>{remaining.toFixed(1)} {goal.unit} to go</span>
                      <span>{progress.toFixed(1)}% complete</span>
                    </div>
                    <div className="text-[10px] text-gray-600 flex items-center gap-1">
                      <span>📅</span>
                      <span>
                        {daysSinceCreated === 0 
                          ? 'Started today' 
                          : `Day ${daysSinceCreated} of journey`}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <Target className="mx-auto mb-2 opacity-50" size={28} />
                <p className="text-xs sm:text-sm">No goals set yet</p>
              </div>
            )}
          </div>
        </div>
          <button 
            onClick={() => setShowGoalModal(true)}
            className="w-full mt-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-white py-2 sm:py-2.5 rounded-lg transition-all flex items-center justify-center text-sm"
          >
            <Plus size={16} className="mr-2" />
            Add New Goal
          </button>
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Create New Goal</h3>
              <button
                onClick={() => {
                  setShowGoalModal(false);
                  setNewGoal({ type: '', current:'', target: '' });
                  setErrors({});
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Goal Type Select */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Goal Type *
                </label>
                <select
                  value={newGoal.type}
                  onChange={(e) => {
                    setNewGoal({ ...newGoal, type: e.target.value });
                    setErrors({ ...errors, type: '' });
                  }}
                  className={`w-full px-4 py-3 bg-gray-800 border ${
                    errors.type ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="">Select a goal type</option>
                  {goalTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.value}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-xs text-red-400">{errors.type}</p>
                )}
              </div>

              {/* Current Value (Auto-filled) */}
              {newGoal.type && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Value
                  </label>

                  <input
                    type="text"
                    value={
                      getCurrentWeight() > 0
                        ? (newGoal.type.includes('Fat') ? '20%' : `${getCurrentWeight()} kg`)
                        : newGoal.current || ''
                    }
                    onChange={(e) => {
                      if (getCurrentWeight() === 0) {
                        setNewGoal({ ...newGoal, current: e.target.value });
                      }
                    }}
                    disabled={getCurrentWeight() > 0}
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-sm ${
                      getCurrentWeight() > 0
                        ? 'border-gray-700 text-gray-400 cursor-not-allowed'
                        : 'border-gray-600 text-gray-200'
                    }`}
                    placeholder="Enter your current value"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    {getCurrentWeight() > 0
                      ? 'Automatically filled from your latest weight entry'
                      : 'Enter manually if no latest record found'}
                  </p>
                </div>
              )}


              {/* Target Value */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Value *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={newGoal.target}
                    onChange={(e) => {
                      setNewGoal({ ...newGoal, target: e.target.value });
                      setErrors({ ...errors, target: '' });
                    }}
                    placeholder="Enter target value"
                    className={`w-full px-4 py-3 bg-gray-800 border ${
                      errors.target ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  {newGoal.type && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      {goalTypes.find(g => g.value === newGoal.type)?.unit}
                    </span>
                  )}
                </div>
                {errors.target && (
                  <p className="mt-1 text-xs text-red-400">{errors.target}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddGoal}
                  className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Create Goal
                </button>
                <button
                  onClick={() => {
                    setShowGoalModal(false);
                    setNewGoal({ type: '', current:'', target: '' });
                    setErrors({});
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
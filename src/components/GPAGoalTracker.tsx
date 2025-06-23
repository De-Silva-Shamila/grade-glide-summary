
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Target, Calculator } from 'lucide-react';
import { GPAData } from '@/types/gpa';

interface GPAGoalTrackerProps {
  gpaData: GPAData;
}

const GPAGoalTracker: React.FC<GPAGoalTrackerProps> = ({ gpaData }) => {
  const [targetGPA, setTargetGPA] = useState('');
  const [remainingCredits, setRemainingCredits] = useState('');
  const [requiredGPA, setRequiredGPA] = useState<number | null>(null);

  const calculateRequiredGPA = () => {
    if (!targetGPA || !remainingCredits) return;
    
    const target = parseFloat(targetGPA);
    const remaining = parseInt(remainingCredits);
    const currentGPA = gpaData.overallGPA;
    const currentCredits = gpaData.totalCredits;
    
    // Formula: (target * totalCredits) - (current * currentCredits) = required * remainingCredits
    const totalCredits = currentCredits + remaining;
    const requiredPoints = (target * totalCredits) - (currentGPA * currentCredits);
    const required = requiredPoints / remaining;
    
    setRequiredGPA(Math.round(required * 100) / 100);
  };

  const getRequiredGPAColor = (required: number) => {
    if (required > 4.0) return 'text-red-600';
    if (required > 3.5) return 'text-blue-600';
    if (required > 3.0) return 'text-blue-700';
    return 'text-blue-800';
  };

  const getRequiredGPAMessage = (required: number) => {
    if (required > 4.0) return 'Target not achievable with current grading system';
    if (required > 3.5) return 'Challenging but achievable with excellent grades';
    if (required > 3.0) return 'Achievable with good performance';
    return 'Easily achievable';
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
      <CardHeader className="bg-blue-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          GPA Goal Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Target GPA
            </label>
            <Input
              type="number"
              placeholder="e.g., 3.5"
              value={targetGPA}
              onChange={(e) => setTargetGPA(e.target.value)}
              min="0"
              max="4"
              step="0.01"
              className="bg-white border-blue-300 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Remaining Credits
            </label>
            <Input
              type="number"
              placeholder="e.g., 60"
              value={remainingCredits}
              onChange={(e) => setRemainingCredits(e.target.value)}
              min="1"
              className="bg-white border-blue-300 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={calculateRequiredGPA}
              disabled={!targetGPA || !remainingCredits}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate
            </Button>
          </div>
        </div>

        {requiredGPA !== null && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Required GPA for Remaining Courses:</h4>
            <div className={`text-3xl font-bold mb-2 ${getRequiredGPAColor(requiredGPA)}`}>
              {requiredGPA.toFixed(2)}
            </div>
            <p className={`text-sm ${getRequiredGPAColor(requiredGPA)}`}>
              {getRequiredGPAMessage(requiredGPA)}
            </p>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <span className="font-medium">Current GPA:</span> {gpaData.overallGPA.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Current Credits:</span> {gpaData.totalCredits}
              </div>
              <div>
                <span className="font-medium">Target GPA:</span> {targetGPA}
              </div>
              <div>
                <span className="font-medium">Total Credits:</span> {gpaData.totalCredits + parseInt(remainingCredits || '0')}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GPAGoalTracker;

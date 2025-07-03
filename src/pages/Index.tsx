
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import SemesterCard from '@/components/SemesterCard';
import OverallStats from '@/components/OverallStats';
import GPAGoalTracker from '@/components/GPAGoalTracker';
import PlannedModules from '@/components/PlannedModules';
import { Semester, GPAData, Course } from '@/types/gpa';
import { calculateSemesterGPA, calculateOverallGPA } from '@/utils/gpaCalculations';

interface PlannedModule {
  id: string;
  name: string;
  credits: number;
  semester: string;
  grade?: string;
}

interface ExtendedGPAData extends GPAData {
  plannedModules: PlannedModule[];
}

const Index = () => {
  const [gpaData, setGpaData] = useState<ExtendedGPAData>({
    semesters: [],
    overallGPA: 0,
    totalCredits: 0,
    plannedModules: [],
  });
  const [newSemesterName, setNewSemesterName] = useState('');

  useEffect(() => {
    // Load data from localStorage on component mount
    const savedData = localStorage.getItem('gpaData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setGpaData({
          semesters: parsedData.semesters || [],
          overallGPA: parsedData.overallGPA || 0,
          totalCredits: parsedData.totalCredits || 0,
          plannedModules: parsedData.plannedModules || [],
        });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Recalculate overall GPA whenever semesters change
    const updatedSemesters = gpaData.semesters.map(semester => {
      const { gpa, totalCredits } = calculateSemesterGPA(semester.courses);
      return { ...semester, gpa, totalCredits };
    });

    const { overallGPA, totalCredits } = calculateOverallGPA(updatedSemesters);

    const updatedGpaData = {
      ...gpaData,
      semesters: updatedSemesters,
      overallGPA,
      totalCredits,
    };

    setGpaData(updatedGpaData);
    
    // Save to localStorage whenever data changes
    localStorage.setItem('gpaData', JSON.stringify(updatedGpaData));
  }, [
    gpaData.semesters.length, 
    JSON.stringify(gpaData.semesters.map(s => s.courses))
  ]);

  const addSemester = () => {
    if (!newSemesterName.trim()) return;

    const newSemester: Semester = {
      id: Date.now().toString(),
      name: newSemesterName.trim(),
      courses: [],
      gpa: 0,
      totalCredits: 0,
    };

    setGpaData(prev => ({
      ...prev,
      semesters: [...prev.semesters, newSemester],
    }));
    setNewSemesterName('');
  };

  const updateSemester = (updatedSemester: Semester) => {
    setGpaData(prev => ({
      ...prev,
      semesters: prev.semesters.map(semester =>
        semester.id === updatedSemester.id ? updatedSemester : semester
      ),
    }));
  };

  const deleteSemester = (semesterId: string) => {
    setGpaData(prev => ({
      ...prev,
      semesters: prev.semesters.filter(semester => semester.id !== semesterId),
    }));
  };

  const updatePlannedModules = (modules: PlannedModule[]) => {
    setGpaData(prev => ({
      ...prev,
      plannedModules: modules,
    }));
  };

  const handleModuleComplete = (completedModule: any) => {
    // Find or create the semester for this module
    let targetSemester = gpaData.semesters.find(s => s.name === completedModule.semester);
    
    if (!targetSemester) {
      // Create new semester if it doesn't exist
      targetSemester = {
        id: Date.now().toString(),
        name: completedModule.semester,
        courses: [],
        gpa: 0,
        totalCredits: 0,
      };
      setGpaData(prev => ({
        ...prev,
        semesters: [...prev.semesters, targetSemester!],
      }));
    }

    // Add the completed module as a course
    const course: Course = {
      id: Date.now().toString(),
      name: completedModule.name,
      credits: completedModule.credits,
      grade: completedModule.grade,
    };

    const updatedSemester = {
      ...targetSemester,
      courses: [...targetSemester.courses, course],
    };

    updateSemester(updatedSemester);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            GPA Calculator
          </h1>
          <p className="text-xl text-blue-700 max-w-2xl mx-auto">
            Track your academic performance across semesters and calculate your overall GPA
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          <OverallStats gpaData={gpaData} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GPAGoalTracker gpaData={gpaData} />
            <PlannedModules 
              onModuleComplete={handleModuleComplete}
              plannedModules={gpaData.plannedModules}
              onUpdatePlannedModules={updatePlannedModules}
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
            <h3 className="text-2xl font-semibold text-blue-800 mb-4">
              Add New Semester
            </h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="semester-name" className="text-blue-700 font-medium">Semester Name</Label>
                <Input
                  id="semester-name"
                  placeholder="Enter semester name (e.g., Fall 2024)"
                  value={newSemesterName}
                  onChange={(e) => setNewSemesterName(e.target.value)}
                  className="border-blue-300 focus:border-blue-500 bg-blue-50 text-blue-900"
                  onKeyPress={(e) => e.key === 'Enter' && addSemester()}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={addSemester}
                  disabled={!newSemesterName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Semester
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {gpaData.semesters.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-blue-200">
                <div className="text-blue-400 mb-4">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-medium text-blue-700">No semesters added yet</h3>
                  <p className="text-blue-600">Add your first semester to get started</p>
                </div>
              </div>
            ) : (
              gpaData.semesters.map((semester) => (
                <SemesterCard
                  key={semester.id}
                  semester={semester}
                  onUpdateSemester={updateSemester}
                  onDeleteSemester={deleteSemester}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

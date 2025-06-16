
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import SemesterCard from '@/components/SemesterCard';
import OverallStats from '@/components/OverallStats';
import { Semester, GPAData } from '@/types/gpa';
import { calculateSemesterGPA, calculateOverallGPA } from '@/utils/gpaCalculations';

const Index = () => {
  const [gpaData, setGpaData] = useState<GPAData>({
    semesters: [],
    overallGPA: 0,
    totalCredits: 0,
  });
  const [newSemesterName, setNewSemesterName] = useState('');

  useEffect(() => {
    // Recalculate overall GPA whenever semesters change
    const updatedSemesters = gpaData.semesters.map(semester => {
      const { gpa, totalCredits } = calculateSemesterGPA(semester.courses);
      return { ...semester, gpa, totalCredits };
    });

    const { overallGPA, totalCredits } = calculateOverallGPA(updatedSemesters);

    setGpaData({
      semesters: updatedSemesters,
      overallGPA,
      totalCredits,
    });
  }, [gpaData.semesters.length, gpaData.semesters.map(s => s.courses.length).join(',')]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            GPA Calculator
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Track your academic performance across semesters and calculate your overall GPA
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <OverallStats gpaData={gpaData} />

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-slate-800 mb-4">
              Add New Semester
            </h3>
            <div className="flex gap-3">
              <Input
                placeholder="Enter semester name (e.g., Fall 2024)"
                value={newSemesterName}
                onChange={(e) => setNewSemesterName(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addSemester()}
              />
              <Button 
                onClick={addSemester}
                disabled={!newSemesterName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Semester
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {gpaData.semesters.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <div className="text-slate-400 mb-4">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-medium">No semesters added yet</h3>
                  <p className="text-slate-500">Add your first semester to get started</p>
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

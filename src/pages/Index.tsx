
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Download, Upload, LogOut } from 'lucide-react';
import SemesterCard from '@/components/SemesterCard';
import OverallStats from '@/components/OverallStats';
import GPAGoalTracker from '@/components/GPAGoalTracker';
import PlannedModules from '@/components/PlannedModules';
import { useAuth } from '@/hooks/useAuth';
import { useGPAData } from '@/hooks/useGPAData';
import { Semester, Course } from '@/types/gpa';
import { useToast } from '@/hooks/use-toast';

interface PlannedModule {
  id: string;
  name: string;
  credits: number;
  semester: string;
  grade?: string;
}

const Index = () => {
  const { signOut } = useAuth();
  const { gpaData, loading, saveSemester, deleteSemester, savePlannedModules, importJSONData } = useGPAData();
  const [newSemesterName, setNewSemesterName] = useState('');
  const { toast } = useToast();

  const addSemester = async () => {
    if (!newSemesterName.trim()) return;

    const newSemester: Semester = {
      id: crypto.randomUUID(),
      name: newSemesterName.trim(),
      courses: [],
      gpa: 0,
      totalCredits: 0,
    };

    try {
      await saveSemester(newSemester);
      setNewSemesterName('');
      toast({
        title: "Success",
        description: "Semester added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add semester",
        variant: "destructive",
      });
    }
  };

  const updateSemester = async (updatedSemester: Semester) => {
    try {
      await saveSemester(updatedSemester);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update semester",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSemester = async (semesterId: string) => {
    try {
      await deleteSemester(semesterId);
      toast({
        title: "Success",
        description: "Semester deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete semester",
        variant: "destructive",
      });
    }
  };

  const updatePlannedModules = async (modules: PlannedModule[]) => {
    try {
      await savePlannedModules(modules);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update planned modules",
        variant: "destructive",
      });
    }
  };

  const handleModuleComplete = async (completedModule: any) => {
    // Find or create the semester for this module
    let targetSemester = gpaData.semesters.find(s => s.name === completedModule.semester);
    
    if (!targetSemester) {
      // Create new semester if it doesn't exist
      targetSemester = {
        id: crypto.randomUUID(),
        name: completedModule.semester,
        courses: [],
        gpa: 0,
        totalCredits: 0,
      };
      await saveSemester(targetSemester);
    }

    // Add the completed module as a course
    const course: Course = {
      id: crypto.randomUUID(),
      name: completedModule.name,
      credits: completedModule.credits,
      grade: completedModule.grade,
    };

    const updatedSemester = {
      ...targetSemester,
      courses: [...targetSemester.courses, course],
    };

    await updateSemester(updatedSemester);
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(gpaData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `gpa_data_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const uploadJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          await importJSONData(jsonData);
          toast({
            title: "Success",
            description: "Data imported successfully",
          });
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          toast({
            title: "Error",
            description: "Error parsing JSON file. Please check the file format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-blue-600 text-xl">Loading your GPA data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              GPA Calculator
            </h1>
            <p className="text-xl text-blue-700 max-w-2xl mx-auto">
              Track your academic performance across semesters and calculate your overall GPA
            </p>
          </div>
          <Button
            onClick={signOut}
            variant="ghost"
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-blue-800">
                Data Management
              </h3>
              <div className="flex gap-3">
                <Button
                  onClick={downloadJSON}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Save JSON
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={uploadJSON}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="json-upload"
                  />
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                    asChild
                  >
                    <label htmlFor="json-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Load JSON
                    </label>
                  </Button>
                </div>
              </div>
            </div>
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
                  onDeleteSemester={handleDeleteSemester}
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

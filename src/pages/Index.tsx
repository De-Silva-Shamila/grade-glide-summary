
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Download, Upload, LogOut, User, Settings } from 'lucide-react';
import SemesterCard from '@/components/SemesterCard';
import OverallStats from '@/components/OverallStats';
import GPAGoalTracker from '@/components/GPAGoalTracker';
import PlannedModules from '@/components/PlannedModules';
import { useAuth } from '@/hooks/useAuth';
import { useGPAData } from '@/hooks/useGPAData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, userProfile, updateProfile } = useAuth();
  const { gpaData, loading, addSemester, updateSemester, deleteSemester, importData, updatePlannedModules } = useGPAData();
  const [newSemesterName, setNewSemesterName] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    setProfileName(userProfile?.full_name || '');
  }, [userProfile]);

  if (!user) {
    return null; // Will redirect to auth
  }

  const handleAddSemester = async () => {
    if (!newSemesterName.trim()) return;
    await addSemester(newSemesterName.trim());
    setNewSemesterName('');
  };

  const handleModuleComplete = async (completedModule: any) => {
    console.log('Module completed:', completedModule);
    // Remove the completed module from planned modules
    const updatedModules = gpaData.plannedModules.filter(m => m.id !== completedModule.id);
    await updatePlannedModules(updatedModules);
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

  const uploadJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          importData(jsonData);
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          alert('Error parsing JSON file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const handleUpdateProfile = async () => {
    if (profileName.trim()) {
      await updateProfile(profileName.trim());
      setProfileDialogOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-blue-600 text-xl">Loading your data...</div>
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
              {userProfile?.full_name ? `Welcome back, ${userProfile.full_name}!` : 'Track your academic performance across semesters'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input
                      id="profile-name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Enter your full name"
                      className="border-blue-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateProfile} className="bg-blue-600 hover:bg-blue-700">
                      Update
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm" onClick={handleSignOut} className="border-blue-300 text-blue-700 hover:bg-blue-50">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
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
                  Export Data
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
                      Import Data
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
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSemester()}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleAddSemester}
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

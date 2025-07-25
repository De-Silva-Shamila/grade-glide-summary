
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, BookOpen, Edit, Save, X } from 'lucide-react';
import { GRADE_OPTIONS } from '@/types/gpa';

interface PlannedModule {
  id: string;
  name: string;
  credits: number;
  semester: string;
  grade?: string;
}

interface PlannedModulesProps {
  onModuleComplete: (module: PlannedModule) => void;
  plannedModules: PlannedModule[];
  onUpdatePlannedModules: (modules: PlannedModule[]) => void;
}

const PlannedModules: React.FC<PlannedModulesProps> = ({ 
  onModuleComplete, 
  plannedModules, 
  onUpdatePlannedModules 
}) => {
  const [newModule, setNewModule] = useState({
    name: '',
    credits: '',
    semester: ''
  });
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    name: '',
    credits: '',
    semester: ''
  });

  const addModule = () => {
    if (!newModule.name.trim() || !newModule.credits || !newModule.semester.trim()) return;

    const module: PlannedModule = {
      id: Date.now().toString(),
      name: newModule.name.trim(),
      credits: parseInt(newModule.credits),
      semester: newModule.semester.trim(),
    };

    const updatedModules = [...plannedModules, module];
    onUpdatePlannedModules(updatedModules);
    setNewModule({ name: '', credits: '', semester: '' });
  };

  const deleteModule = (moduleId: string) => {
    const updatedModules = plannedModules.filter(module => module.id !== moduleId);
    onUpdatePlannedModules(updatedModules);
  };

  const startEditModule = (module: PlannedModule) => {
    setEditingModule(module.id);
    setEditValues({
      name: module.name,
      credits: module.credits.toString(),
      semester: module.semester
    });
  };

  const saveEditModule = (moduleId: string) => {
    if (!editValues.name.trim() || !editValues.credits || !editValues.semester.trim()) return;

    const updatedModules = plannedModules.map(module =>
      module.id === moduleId 
        ? { 
            ...module, 
            name: editValues.name.trim(),
            credits: parseInt(editValues.credits),
            semester: editValues.semester.trim()
          } 
        : module
    );
    onUpdatePlannedModules(updatedModules);
    setEditingModule(null);
  };

  const cancelEdit = () => {
    setEditingModule(null);
    setEditValues({ name: '', credits: '', semester: '' });
  };

  const updateModuleGrade = (moduleId: string, grade: string) => {
    const module = plannedModules.find(m => m.id === moduleId);
    if (module) {
      const completedModule = { ...module, grade };
      onModuleComplete(completedModule);
      const updatedModules = plannedModules.filter(m => m.id !== moduleId);
      onUpdatePlannedModules(updatedModules);
    }
  };

  const pendingModules = plannedModules.filter(m => !m.grade);

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
      <CardHeader className="bg-blue-700 text-white">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Planned Modules
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <h4 className="font-medium text-blue-800 mb-3">Add New Module</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="module-name" className="text-blue-700 font-medium">Module Name</Label>
              <Input
                id="module-name"
                value={newModule.name}
                onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                className="bg-white border-blue-300 focus:border-blue-500 text-blue-900"
              />
            </div>
            <div>
              <Label htmlFor="module-credits" className="text-blue-700 font-medium">Credits</Label>
              <Input
                id="module-credits"
                type="number"
                value={newModule.credits}
                onChange={(e) => setNewModule({ ...newModule, credits: e.target.value })}
                min="1"
                max="10"
                className="bg-white border-blue-300 focus:border-blue-500 text-blue-900"
              />
            </div>
            <div>
              <Label htmlFor="module-semester" className="text-blue-700 font-medium">Semester</Label>
              <Input
                id="module-semester"
                value={newModule.semester}
                onChange={(e) => setNewModule({ ...newModule, semester: e.target.value })}
                className="bg-white border-blue-300 focus:border-blue-500 text-blue-900"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={addModule}
                disabled={!newModule.name.trim() || !newModule.credits || !newModule.semester.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          </div>
        </div>

        {pendingModules.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-blue-800 mb-3">Pending Modules</h4>
            <div className="space-y-2">
              {pendingModules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200"
                >
                  {editingModule === module.id ? (
                    <>
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <Input
                          value={editValues.name}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          className="border-blue-300 focus:border-blue-500 bg-white text-blue-900"
                        />
                        <Input
                          type="number"
                          value={editValues.credits}
                          onChange={(e) => setEditValues({ ...editValues, credits: e.target.value })}
                          className="border-blue-300 focus:border-blue-500 bg-white text-blue-900"
                          min="1"
                          max="10"
                        />
                        <Input
                          value={editValues.semester}
                          onChange={(e) => setEditValues({ ...editValues, semester: e.target.value })}
                          className="border-blue-300 focus:border-blue-500 bg-white text-blue-900"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => saveEditModule(module.id)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 border-0"
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelEdit}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 border-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="font-medium text-blue-800">{module.name}</div>
                        <div className="text-sm text-blue-600">
                          {module.credits} credits • {module.semester}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`grade-${module.id}`} className="text-blue-700 font-medium text-xs">Grade</Label>
                        <Select
                          onValueChange={(grade) => updateModuleGrade(module.id, grade)}
                        >
                          <SelectTrigger id={`grade-${module.id}`} className="w-24 bg-blue-50 border-blue-300 text-blue-900 focus:border-blue-500">
                            <SelectValue placeholder="Grade" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-blue-200 z-50">
                            {GRADE_OPTIONS.map((grade) => (
                              <SelectItem key={grade} value={grade} className="hover:bg-blue-50 text-blue-900 focus:bg-blue-50 focus:text-blue-900">
                                {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditModule(module)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 border-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteModule(module.id)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 border-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {plannedModules.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-blue-700">No modules planned yet</h3>
            <p className="text-blue-600">Add your planned modules to track progress</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlannedModules;

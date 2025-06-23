
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, BookOpen } from 'lucide-react';
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
}

const PlannedModules: React.FC<PlannedModulesProps> = ({ onModuleComplete }) => {
  const [modules, setModules] = useState<PlannedModule[]>([]);
  const [newModule, setNewModule] = useState({
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

    setModules(prev => [...prev, module]);
    setNewModule({ name: '', credits: '', semester: '' });
  };

  const deleteModule = (moduleId: string) => {
    setModules(prev => prev.filter(module => module.id !== moduleId));
  };

  const updateModuleGrade = (moduleId: string, grade: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      const completedModule = { ...module, grade };
      onModuleComplete(completedModule);
      setModules(prev => prev.filter(m => m.id !== moduleId));
    }
  };

  const completedModules = modules.filter(m => m.grade);
  const pendingModules = modules.filter(m => !m.grade);

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
            <Input
              placeholder="Module Name"
              value={newModule.name}
              onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
              className="bg-white border-blue-300 focus:border-blue-500"
            />
            <Input
              type="number"
              placeholder="Credits"
              value={newModule.credits}
              onChange={(e) => setNewModule({ ...newModule, credits: e.target.value })}
              min="1"
              max="10"
              className="bg-white border-blue-300 focus:border-blue-500"
            />
            <Input
              placeholder="Semester"
              value={newModule.semester}
              onChange={(e) => setNewModule({ ...newModule, semester: e.target.value })}
              className="bg-white border-blue-300 focus:border-blue-500"
            />
            <Button
              onClick={addModule}
              disabled={!newModule.name.trim() || !newModule.credits || !newModule.semester.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
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
                  <div className="flex-1">
                    <div className="font-medium text-blue-800">{module.name}</div>
                    <div className="text-sm text-blue-600">
                      {module.credits} credits • {module.semester}
                    </div>
                  </div>
                  <Select
                    onValueChange={(grade) => updateModuleGrade(module.id, grade)}
                  >
                    <SelectTrigger className="w-24 bg-blue-50 border-blue-300">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_OPTIONS.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteModule(module.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {modules.length === 0 && (
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

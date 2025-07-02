import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Edit, Save, X } from 'lucide-react';
import { Course, Semester, GRADE_OPTIONS } from '@/types/gpa';

interface SemesterCardProps {
  semester: Semester;
  onUpdateSemester: (semester: Semester) => void;
  onDeleteSemester: (semesterId: string) => void;
}

// Generate a proper UUID v4
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const SemesterCard: React.FC<SemesterCardProps> = ({
  semester,
  onUpdateSemester,
  onDeleteSemester,
}) => {
  const [newCourse, setNewCourse] = useState({ name: '', credits: '', grade: '' });
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ name: '', credits: '', grade: '' });
  const [editingSemesterName, setEditingSemesterName] = useState(false);
  const [semesterNameValue, setSemesterNameValue] = useState(semester.name);

  const addCourse = async () => {
    if (!newCourse.name.trim() || !newCourse.credits || !newCourse.grade) return;

    const course: Course = {
      id: generateUUID(), // Use proper UUID generation
      name: newCourse.name.trim(),
      credits: parseInt(newCourse.credits),
      grade: newCourse.grade,
    };

    const updatedSemester = {
      ...semester,
      courses: [...semester.courses, course],
    };

    console.log('Adding course:', course);
    console.log('Updated semester:', updatedSemester);
    
    await onUpdateSemester(updatedSemester);
    setNewCourse({ name: '', credits: '', grade: '' });
  };

  const deleteCourse = (courseId: string) => {
    const updatedSemester = {
      ...semester,
      courses: semester.courses.filter(course => course.id !== courseId),
    };
    onUpdateSemester(updatedSemester);
  };

  const startEditCourse = (course: Course) => {
    setEditingCourse(course.id);
    setEditValues({
      name: course.name,
      credits: course.credits.toString(),
      grade: course.grade
    });
  };

  const saveEditCourse = (courseId: string) => {
    if (!editValues.name.trim() || !editValues.credits || !editValues.grade) return;

    const updatedSemester = {
      ...semester,
      courses: semester.courses.map(course =>
        course.id === courseId 
          ? { 
              ...course, 
              name: editValues.name.trim(),
              credits: parseInt(editValues.credits),
              grade: editValues.grade
            } 
          : course
      ),
    };
    onUpdateSemester(updatedSemester);
    setEditingCourse(null);
  };

  const cancelEdit = () => {
    setEditingCourse(null);
    setEditValues({ name: '', credits: '', grade: '' });
  };

  const startEditSemesterName = () => {
    setEditingSemesterName(true);
    setSemesterNameValue(semester.name);
  };

  const saveEditSemesterName = () => {
    if (!semesterNameValue.trim()) return;
    
    const updatedSemester = {
      ...semester,
      name: semesterNameValue.trim(),
    };
    onUpdateSemester(updatedSemester);
    setEditingSemesterName(false);
  };

  const cancelEditSemesterName = () => {
    setEditingSemesterName(false);
    setSemesterNameValue(semester.name);
  };

  return (
    <Card className="w-full animate-fade-in shadow-lg border-0 bg-white font-montserrat">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <div className="flex justify-between items-center">
          {editingSemesterName ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={semesterNameValue}
                onChange={(e) => setSemesterNameValue(e.target.value)}
                className="flex-1 border-blue-300 focus:border-blue-500 bg-white text-slate-900 font-montserrat"
                placeholder="Semester name"
                onKeyPress={(e) => e.key === 'Enter' && saveEditSemesterName()}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={saveEditSemesterName}
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-1"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEditSemesterName}
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-semibold text-slate-900 font-montserrat">
                {semester.name}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={startEditSemesterName}
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-1"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-700 font-montserrat">
                {semester.gpa.toFixed(2)}
              </div>
              <div className="text-sm text-slate-700 font-montserrat">
                {semester.totalCredits} credits
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteSemester(semester.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {semester.courses.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-slate-800 mb-3 font-montserrat">Courses</h4>
            <div className="space-y-2">
              {semester.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  {editingCourse === course.id ? (
                    <>
                      <Input
                        value={editValues.name}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        className="flex-1 border-slate-300 focus:border-blue-500 bg-white text-slate-900 font-montserrat"
                        placeholder="Course name"
                      />
                      <Input
                        type="number"
                        value={editValues.credits}
                        onChange={(e) => setEditValues({ ...editValues, credits: e.target.value })}
                        className="w-20 border-slate-300 focus:border-blue-500 bg-white text-slate-900 font-montserrat"
                        min="1"
                        max="10"
                      />
                      <Select
                        value={editValues.grade}
                        onValueChange={(value) => setEditValues({ ...editValues, grade: value })}
                      >
                        <SelectTrigger className="w-24 bg-white border-slate-300 focus:border-blue-500 text-slate-900 font-montserrat">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 z-50 font-montserrat">
                          {GRADE_OPTIONS.map((grade) => (
                            <SelectItem key={grade} value={grade} className="hover:bg-blue-50 text-slate-900 focus:bg-blue-50 focus:text-slate-900 font-montserrat">
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => saveEditCourse(course.id)}
                        className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1"
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelEdit}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 text-slate-900 font-medium font-montserrat">{course.name}</div>
                      <div className="text-sm font-medium text-slate-700 min-w-[60px] font-montserrat">
                        {course.credits} credits
                      </div>
                      <div className="text-sm font-semibold text-slate-800 min-w-[40px] font-montserrat">
                        {course.grade}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditCourse(course)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCourse(course.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
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

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-medium text-slate-800 mb-3 font-montserrat">Add New Course</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Label htmlFor="course-name" className="text-slate-700 font-medium font-montserrat">Course Name</Label>
              <Input
                id="course-name"
                placeholder="Enter course name"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                className="bg-white border-slate-300 focus:bg-white focus:border-blue-500 text-slate-900 font-montserrat"
              />
            </div>
            <div>
              <Label htmlFor="course-credits" className="text-slate-700 font-medium font-montserrat">Credits</Label>
              <Input
                id="course-credits"
                type="number"
                placeholder="Credits"
                value={newCourse.credits}
                onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })}
                min="1"
                max="10"
                className="bg-white border-slate-300 focus:bg-white focus:border-blue-500 text-slate-900 font-montserrat"
              />
            </div>
            <div>
              <Label htmlFor="course-grade" className="text-slate-700 font-medium font-montserrat">Grade</Label>
              <Select
                value={newCourse.grade}
                onValueChange={(value) => setNewCourse({ ...newCourse, grade: value })}
              >
                <SelectTrigger id="course-grade" className="bg-white border-slate-300 focus:bg-white focus:border-blue-500 text-slate-900 font-montserrat">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 z-50 font-montserrat">
                  {GRADE_OPTIONS.map((grade) => (
                    <SelectItem key={grade} value={grade} className="hover:bg-blue-50 text-slate-900 focus:bg-blue-50 focus:text-slate-900 font-montserrat">
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={addCourse} 
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white border-0 font-montserrat"
            disabled={!newCourse.name.trim() || !newCourse.credits || !newCourse.grade}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SemesterCard;

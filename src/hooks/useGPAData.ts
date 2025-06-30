
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Semester, Course } from '@/types/gpa';
import { calculateSemesterGPA, calculateOverallGPA } from '@/utils/gpaCalculations';

interface PlannedModule {
  id: string;
  name: string;
  credits: number;
  semester: string;
}

interface ExtendedGPAData {
  semesters: Semester[];
  overallGPA: number;
  totalCredits: number;
  plannedModules: PlannedModule[];
}

export const useGPAData = () => {
  const { user } = useAuth();
  const [gpaData, setGpaData] = useState<ExtendedGPAData>({
    semesters: [],
    overallGPA: 0,
    totalCredits: 0,
    plannedModules: [],
  });
  const [loading, setLoading] = useState(true);

  // Load data from database
  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load semesters with courses
      const { data: semestersData, error: semestersError } = await supabase
        .from('semesters')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', user.id)
        .order('created_at');

      if (semestersError) throw semestersError;

      // Load planned modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('planned_modules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

      if (modulesError) throw modulesError;

      // Transform data to match our types
      const semesters = semestersData?.map(semester => {
        const courses = semester.courses.map((course: any) => ({
          id: course.id,
          name: course.name,
          credits: course.credits,
          grade: course.grade,
        }));

        const { gpa, totalCredits } = calculateSemesterGPA(courses);

        return {
          id: semester.id,
          name: semester.name,
          courses,
          gpa,
          totalCredits,
        };
      }) || [];

      const { overallGPA, totalCredits } = calculateOverallGPA(semesters);

      const plannedModules = modulesData?.map(module => ({
        id: module.id,
        name: module.name,
        credits: module.credits,
        semester: module.semester,
      })) || [];

      setGpaData({
        semesters,
        overallGPA,
        totalCredits,
        plannedModules,
      });
    } catch (error) {
      console.error('Error loading GPA data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save semester to database
  const saveSemester = async (semester: Semester) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('semesters')
        .upsert({
          id: semester.id,
          user_id: user.id,
          name: semester.name,
          gpa: semester.gpa,
          total_credits: semester.totalCredits,
        })
        .select()
        .single();

      if (error) throw error;

      // Save courses
      for (const course of semester.courses) {
        await supabase
          .from('courses')
          .upsert({
            id: course.id,
            semester_id: semester.id,
            name: course.name,
            credits: course.credits,
            grade: course.grade,
          });
      }

      return data;
    } catch (error) {
      console.error('Error saving semester:', error);
      throw error;
    }
  };

  // Delete semester from database
  const deleteSemester = async (semesterId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('semesters')
        .delete()
        .eq('id', semesterId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting semester:', error);
      throw error;
    }
  };

  // Save planned modules
  const savePlannedModules = async (modules: PlannedModule[]) => {
    if (!user) return;

    try {
      // Delete existing modules
      await supabase
        .from('planned_modules')
        .delete()
        .eq('user_id', user.id);

      // Insert new modules
      if (modules.length > 0) {
        const { error } = await supabase
          .from('planned_modules')
          .insert(
            modules.map(module => ({
              id: module.id,
              user_id: user.id,
              name: module.name,
              credits: module.credits,
              semester: module.semester,
            }))
          );

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving planned modules:', error);
      throw error;
    }
  };

  // Import JSON data
  const importJSONData = async (jsonData: any) => {
    if (!user) return;

    try {
      // Clear existing data
      await supabase.from('planned_modules').delete().eq('user_id', user.id);
      await supabase.from('semesters').delete().eq('user_id', user.id);

      // Import semesters and courses
      if (jsonData.semesters) {
        for (const semester of jsonData.semesters) {
          await saveSemester(semester);
        }
      }

      // Import planned modules
      if (jsonData.plannedModules) {
        await savePlannedModules(jsonData.plannedModules);
      }

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error importing JSON data:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  return {
    gpaData,
    loading,
    loadData,
    saveSemester,
    deleteSemester,
    savePlannedModules,
    importJSONData,
  };
};

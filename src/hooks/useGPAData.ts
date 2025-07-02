import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Semester, Course, GPAData } from '@/types/gpa'
import { calculateSemesterGPA, calculateOverallGPA } from '@/utils/gpaCalculations'

interface PlannedModule {
  id: string
  name: string
  credits: number
  semester: string
}

interface ExtendedGPAData extends GPAData {
  plannedModules: PlannedModule[]
}

// Function to generate proper UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export function useGPAData() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [gpaData, setGpaData] = useState<ExtendedGPAData>({
    semesters: [],
    overallGPA: 0,
    totalCredits: 0,
    plannedModules: [],
  })
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    if (!user) return

    setLoading(true)
    try {
      console.log('Fetching GPA data for user:', user.id)
      
      // Fetch semesters with courses
      const { data: semesters, error: semestersError } = await supabase
        .from('semesters')
        .select(`
          id,
          name,
          gpa,
          total_credits,
          courses (
            id,
            name,
            credits,
            grade
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (semestersError) {
        console.error('Error fetching semesters:', semestersError)
        throw semestersError
      }

      // Fetch planned modules
      const { data: plannedModules, error: modulesError } = await supabase
        .from('planned_modules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (modulesError) {
        console.error('Error fetching planned modules:', modulesError)
        throw modulesError
      }

      console.log('Fetched semesters:', semesters)
      console.log('Fetched planned modules:', plannedModules)

      // Transform data
      const transformedSemesters: Semester[] = (semesters || []).map(semester => ({
        id: semester.id,
        name: semester.name,
        courses: (semester.courses || []).map((course: any) => ({
          id: course.id,
          name: course.name,
          credits: course.credits,
          grade: course.grade,
        })),
        gpa: semester.gpa || 0,
        totalCredits: semester.total_credits || 0,
      }))

      // Recalculate GPAs
      const updatedSemesters = transformedSemesters.map(semester => {
        const { gpa, totalCredits } = calculateSemesterGPA(semester.courses)
        return { ...semester, gpa, totalCredits }
      })

      const { overallGPA, totalCredits } = calculateOverallGPA(updatedSemesters)

      const newGpaData = {
        semesters: updatedSemesters,
        overallGPA,
        totalCredits,
        plannedModules: (plannedModules || []).map(module => ({
          id: module.id,
          name: module.name,
          credits: module.credits,
          semester: module.semester,
        })),
      }

      console.log('Setting GPA data:', newGpaData)
      setGpaData(newGpaData)
    } catch (error: any) {
      console.error('Error fetching GPA data:', error)
      toast({
        title: "Error Loading Data",
        description: error.message || "Failed to load your GPA data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setGpaData({
        semesters: [],
        overallGPA: 0,
        totalCredits: 0,
        plannedModules: [],
      })
    }
  }, [user])

  const addSemester = async (name: string) => {
    if (!user || !name.trim()) return

    try {
      console.log('Adding semester:', name)
      const { data, error } = await supabase
        .from('semesters')
        .insert({
          user_id: user.id,
          name: name.trim(),
          gpa: 0,
          total_credits: 0,
        })
        .select()
        .single()

      if (error) throw error

      console.log('Semester added successfully:', data)
      await fetchData()
      toast({
        title: "Semester Added",
        description: `${name} has been added successfully.`,
      })
    } catch (error: any) {
      console.error('Error adding semester:', error)
      toast({
        title: "Error Adding Semester",
        description: error.message || "Failed to add semester",
        variant: "destructive",
      })
    }
  }

  const updateSemester = async (updatedSemester: Semester) => {
    if (!user) return

    try {
      console.log('Updating semester:', updatedSemester.id)
      // Update semester
      const { error: semesterError } = await supabase
        .from('semesters')
        .update({
          name: updatedSemester.name,
          gpa: updatedSemester.gpa,
          total_credits: updatedSemester.totalCredits,
        })
        .eq('id', updatedSemester.id)

      if (semesterError) throw semesterError

      await fetchData()
    } catch (error: any) {
      console.error('Error updating semester:', error)
      toast({
        title: "Error Updating Semester",
        description: error.message || "Failed to update semester",
        variant: "destructive",
      })
    }
  }

  const deleteSemester = async (semesterId: string) => {
    if (!user) return

    try {
      console.log('Deleting semester:', semesterId)
      const { error } = await supabase
        .from('semesters')
        .delete()
        .eq('id', semesterId)

      if (error) throw error

      await fetchData()
      toast({
        title: "Semester Deleted",
        description: "Semester has been deleted successfully.",
      })
    } catch (error: any) {
      console.error('Error deleting semester:', error)
      toast({
        title: "Error Deleting Semester",
        description: error.message || "Failed to delete semester",
        variant: "destructive",
      })
    }
  }

  const addCourse = async (semesterId: string, course: Omit<Course, 'id'>) => {
    if (!user) return

    try {
      console.log('Adding course to semester:', semesterId, course)
      const { error } = await supabase
        .from('courses')
        .insert({
          semester_id: semesterId,
          name: course.name,
          credits: course.credits,
          grade: course.grade,
        })

      if (error) throw error

      await fetchData()
      toast({
        title: "Course Added",
        description: `${course.name} has been added successfully.`,
      })
    } catch (error: any) {
      console.error('Error adding course:', error)
      toast({
        title: "Error Adding Course",
        description: error.message || "Failed to add course",
        variant: "destructive",
      })
    }
  }

  const updateCourse = async (courseId: string, updates: Partial<Course>) => {
    if (!user) return

    try {
      console.log('Updating course:', courseId, updates)
      const { error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId)

      if (error) throw error

      await fetchData()
      toast({
        title: "Course Updated",
        description: "Course has been updated successfully.",
      })
    } catch (error: any) {
      console.error('Error updating course:', error)
      toast({
        title: "Error Updating Course",
        description: error.message || "Failed to update course",
        variant: "destructive",
      })
    }
  }

  const deleteCourse = async (courseId: string) => {
    if (!user) return

    try {
      console.log('Deleting course:', courseId)
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error

      await fetchData()
      toast({
        title: "Course Deleted",
        description: "Course has been deleted successfully.",
      })
    } catch (error: any) {
      console.error('Error deleting course:', error)
      toast({
        title: "Error Deleting Course",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      })
    }
  }

  const updatePlannedModules = async (modules: PlannedModule[]) => {
    if (!user) return

    try {
      console.log('Updating planned modules for user:', user.id)
      console.log('Modules to update:', modules)
      
      // First, delete all existing planned modules for this user
      const { error: deleteError } = await supabase
        .from('planned_modules')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting existing modules:', deleteError)
        throw deleteError
      }

      // Then, insert all the new modules (if any)
      if (modules.length > 0) {
        const modulesToInsert = modules.map(module => ({
          id: module.id,
          user_id: user.id,
          name: module.name,
          credits: module.credits,
          semester: module.semester,
        }))

        console.log('Inserting modules:', modulesToInsert)

        const { error: insertError, data: insertedData } = await supabase
          .from('planned_modules')
          .insert(modulesToInsert)
          .select()

        if (insertError) {
          console.error('Error inserting modules:', insertError)
          throw insertError
        }

        console.log('Modules inserted successfully:', insertedData)
      }

      // Refresh the data to ensure UI is updated
      await fetchData()
      
      toast({
        title: "Modules Updated",
        description: "Planned modules have been updated successfully.",
      })
    } catch (error: any) {
      console.error('Error updating planned modules:', error)
      toast({
        title: "Error Updating Modules",
        description: error.message || "Failed to update planned modules",
        variant: "destructive",
      })
    }
  }

  const importData = async (data: any) => {
    if (!user) return

    try {
      setLoading(true)
      console.log('Importing data for user:', user.id)
      
      // Clear existing data
      console.log('Clearing existing data...')
      const semesterIds = gpaData.semesters.map(s => s.id)
      if (semesterIds.length > 0) {
        await supabase.from('courses').delete().in('semester_id', semesterIds)
      }
      await supabase.from('semesters').delete().eq('user_id', user.id)
      await supabase.from('planned_modules').delete().eq('user_id', user.id)

      // Import semesters
      if (data.semesters && data.semesters.length > 0) {
        console.log('Importing semesters:', data.semesters.length)
        for (const semester of data.semesters) {
          const { data: newSemester, error: semesterError } = await supabase
            .from('semesters')
            .insert({
              user_id: user.id,
              name: semester.name,
              gpa: semester.gpa || 0,
              total_credits: semester.totalCredits || 0,
            })
            .select()
            .single()

          if (semesterError) throw semesterError

          // Import courses for this semester
          if (semester.courses && semester.courses.length > 0) {
            const coursesToInsert = semester.courses.map((course: any) => ({
              semester_id: newSemester.id,
              name: course.name,
              credits: course.credits,
              grade: course.grade,
            }))

            const { error: coursesError } = await supabase
              .from('courses')
              .insert(coursesToInsert)

            if (coursesError) throw coursesError
          }
        }
      }

      // Import planned modules
      if (data.plannedModules && data.plannedModules.length > 0) {
        console.log('Importing planned modules:', data.plannedModules.length)
        const modulesToInsert = data.plannedModules.map((module: any) => ({
          id: module.id || generateUUID(),
          user_id: user.id,
          name: module.name,
          credits: module.credits,
          semester: module.semester,
        }))

        const { error: modulesError } = await supabase
          .from('planned_modules')
          .insert(modulesToInsert)

        if (modulesError) throw modulesError
      }

      await fetchData()
      toast({
        title: "Data Imported",
        description: "Your GPA data has been imported successfully.",
      })
    } catch (error: any) {
      console.error('Error importing data:', error)
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    gpaData,
    loading,
    addSemester,
    updateSemester,
    deleteSemester,
    addCourse,
    updateCourse,
    deleteCourse,
    updatePlannedModules,
    importData,
    refetch: fetchData,
  }
}


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

      if (semestersError) throw semestersError

      // Fetch planned modules
      const { data: plannedModules, error: modulesError } = await supabase
        .from('planned_modules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (modulesError) throw modulesError

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

      setGpaData({
        semesters: updatedSemesters,
        overallGPA,
        totalCredits,
        plannedModules: (plannedModules || []).map(module => ({
          id: module.id,
          name: module.name,
          credits: module.credits,
          semester: module.semester,
        })),
      })
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
      const { error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId)

      if (error) throw error

      await fetchData()
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
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error

      await fetchData()
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
      // Delete existing planned modules
      await supabase
        .from('planned_modules')
        .delete()
        .eq('user_id', user.id)

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
          )

        if (error) throw error
      }

      await fetchData()
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
      
      // Clear existing data
      await supabase.from('courses').delete().in('semester_id', 
        gpaData.semesters.map(s => s.id)
      )
      await supabase.from('semesters').delete().eq('user_id', user.id)
      await supabase.from('planned_modules').delete().eq('user_id', user.id)

      // Import semesters
      if (data.semesters && data.semesters.length > 0) {
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
        const modulesToInsert = data.plannedModules.map((module: any) => ({
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

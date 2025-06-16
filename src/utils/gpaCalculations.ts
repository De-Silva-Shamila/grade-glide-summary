
import { Course, Semester, GPAData, GRADE_POINTS } from '@/types/gpa';

export const calculateSemesterGPA = (courses: Course[]): { gpa: number; totalCredits: number } => {
  if (courses.length === 0) return { gpa: 0, totalCredits: 0 };
  
  const totalPoints = courses.reduce((sum, course) => {
    const gradePoints = GRADE_POINTS[course.grade] || 0;
    return sum + (gradePoints * course.credits);
  }, 0);
  
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  
  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  
  return { gpa: Math.round(gpa * 100) / 100, totalCredits };
};

export const calculateOverallGPA = (semesters: Semester[]): { overallGPA: number; totalCredits: number } => {
  const totalPoints = semesters.reduce((sum, semester) => {
    return sum + (semester.gpa * semester.totalCredits);
  }, 0);
  
  const totalCredits = semesters.reduce((sum, semester) => sum + semester.totalCredits, 0);
  
  const overallGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
  
  return {
    overallGPA: Math.round(overallGPA * 100) / 100,
    totalCredits
  };
};


export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
  gpa: number;
  totalCredits: number;
}

export interface GPAData {
  semesters: Semester[];
  overallGPA: number;
  totalCredits: number;
}

export const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0
};

export const GRADE_OPTIONS = Object.keys(GRADE_POINTS);

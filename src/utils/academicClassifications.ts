
export interface AcademicClassification {
  name: string;
  description: string;
  minGPA: number;
  color: string;
}

export const ACADEMIC_CLASSIFICATIONS: AcademicClassification[] = [
  {
    name: "First Class Honours",
    description: "Excellent academic performance",
    minGPA: 3.7,
    color: "text-blue-600"
  },
  {
    name: "Second Class Upper",
    description: "Very good academic performance", 
    minGPA: 3.3,
    color: "text-blue-500"
  },
  {
    name: "Second Class Lower",
    description: "Good academic performance",
    minGPA: 3.0,
    color: "text-blue-400"
  },
  {
    name: "General Pass",
    description: "Satisfactory academic performance",
    minGPA: 2.0,
    color: "text-blue-300"
  },
  {
    name: "Below Pass",
    description: "Needs significant improvement",
    minGPA: 0,
    color: "text-blue-200"
  }
];

export const getAcademicClassification = (gpa: number): AcademicClassification => {
  for (const classification of ACADEMIC_CLASSIFICATIONS) {
    if (gpa >= classification.minGPA) {
      return classification;
    }
  }
  return ACADEMIC_CLASSIFICATIONS[ACADEMIC_CLASSIFICATIONS.length - 1];
};

export const getClassificationColor = (gpa: number): string => {
  return getAcademicClassification(gpa).color;
};

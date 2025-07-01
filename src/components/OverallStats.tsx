
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { GPAData, GRADE_POINTS } from '@/types/gpa';
import { generateGPAPDF } from '@/utils/pdfGenerator';
import { useAuth } from '@/hooks/useAuth';
import { getAcademicClassification } from '@/utils/academicClassifications';

interface OverallStatsProps {
  gpaData: GPAData;
}

const OverallStats: React.FC<OverallStatsProps> = ({ gpaData }) => {
  const { userProfile } = useAuth();

  const handleDownloadPDF = () => {
    const dataWithGradePoints = {
      ...gpaData,
      gradePoints: GRADE_POINTS,
      studentName: userProfile?.full_name || userProfile?.username || 'Student'
    };
    generateGPAPDF(dataWithGradePoints);
  };

  const classification = getAcademicClassification(gpaData.overallGPA);

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-xl border-0">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">Overall Academic Performance</h2>
          <p className="text-blue-100">
            {userProfile?.full_name ? `${userProfile.full_name}'s ` : ''}Comprehensive GPA Summary
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">
              {gpaData.overallGPA.toFixed(2)}
            </div>
            <div className="text-lg text-blue-100">Overall GPA</div>
            <div className="text-sm font-medium text-blue-100 mt-1">
              {classification.name}
            </div>
            <div className="text-xs text-blue-200 mt-1">
              {classification.description}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">
              {gpaData.totalCredits}
            </div>
            <div className="text-lg text-blue-100">Total Credits</div>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">
              {gpaData.semesters.length}
            </div>
            <div className="text-lg text-blue-100">Semesters</div>
          </div>
        </div>

        {gpaData.semesters.length > 0 && (
          <div className="text-center">
            <Button
              onClick={handleDownloadPDF}
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Academic Transcript
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OverallStats;

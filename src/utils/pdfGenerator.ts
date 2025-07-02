
import jsPDF from 'jspdf';
import { GPAData, Course, GRADE_POINTS } from '@/types/gpa';
import { getAcademicClassification } from '@/utils/academicClassifications';

interface ExtendedGPAData extends GPAData {
  gradePoints: typeof GRADE_POINTS;
  studentName: string;
}

export const generateGPAPDF = (data: ExtendedGPAData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 25;
  
  // Set default font to helvetica (closest to Montserrat available in jsPDF)
  doc.setFont('helvetica');
  
  // Modern header with blue gradient
  doc.setFillColor(30, 58, 138); // blue-900
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Title with white text on blue background
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('ACADEMIC TRANSCRIPT', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, pageWidth / 2, 38, { align: 'center' });
  
  yPosition = 70;
  
  // Student Information Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(20, yPosition - 8, pageWidth - 40, 40, 'F');
  doc.setDrawColor(30, 58, 138); // blue-900 border
  doc.setLineWidth(0.5);
  doc.rect(20, yPosition - 8, pageWidth - 40, 40, 'S');
  
  doc.setTextColor(30, 58, 138); // blue-900
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT INFORMATION', 30, yPosition);
  
  yPosition += 12;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(`Student Name: ${data.studentName}`, 30, yPosition);
  yPosition += 8;
  doc.text(`Total Semesters: ${data.semesters.length}`, 30, yPosition);
  yPosition += 8;
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 30, yPosition);
  
  yPosition += 25;
  
  // Overall Performance Summary Card
  const classification = getAcademicClassification(data.overallGPA);
  
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(20, yPosition - 8, pageWidth - 40, 55, 'F');
  doc.setDrawColor(30, 58, 138); // blue-900 border
  doc.setLineWidth(0.5);
  doc.rect(20, yPosition - 8, pageWidth - 40, 55, 'S');
  
  doc.setTextColor(30, 58, 138); // blue-900
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('OVERALL PERFORMANCE SUMMARY', 30, yPosition);
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  
  // Two-column layout
  const leftColumn = 30;
  const rightColumn = pageWidth / 2 + 10;
  
  doc.text(`Overall GPA: ${data.overallGPA.toFixed(2)}`, leftColumn, yPosition);
  doc.text(`Total Credits: ${data.totalCredits}`, rightColumn, yPosition);
  
  yPosition += 12;
  doc.setFont('helvetica', 'normal');
  doc.text(`Classification: ${classification.name}`, leftColumn, yPosition);
  
  // Classification badge with proper contrast
  const badgeWidth = 65;
  const badgeX = rightColumn;
  let badgeColor, textColor;
  
  if (data.overallGPA >= 3.7) {
    badgeColor = [34, 197, 94]; // green-500
    textColor = [255, 255, 255]; // white
  } else if (data.overallGPA >= 3.3) {
    badgeColor = [59, 130, 246]; // blue-500
    textColor = [255, 255, 255]; // white
  } else if (data.overallGPA >= 3.0) {
    badgeColor = [245, 158, 11]; // amber-500
    textColor = [15, 23, 42]; // slate-900
  } else if (data.overallGPA >= 2.0) {
    badgeColor = [251, 146, 60]; // orange-400
    textColor = [15, 23, 42]; // slate-900
  } else {
    badgeColor = [239, 68, 68]; // red-500
    textColor = [255, 255, 255]; // white
  }
  
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(badgeX, yPosition - 6, badgeWidth, 12, 3, 3, 'F');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(classification.name.toUpperCase(), badgeX + badgeWidth/2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(classification.description, leftColumn, yPosition);
  
  yPosition += 25;
  
  // Academic Standards Reference
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(20, yPosition - 8, pageWidth - 40, 50, 'F');
  doc.setDrawColor(148, 163, 184); // slate-400 border
  doc.setLineWidth(0.5);
  doc.rect(20, yPosition - 8, pageWidth - 40, 50, 'S');
  
  doc.setTextColor(30, 58, 138); // blue-900
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('GRADING STANDARDS', 30, yPosition);
  
  yPosition += 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42); // slate-900
  
  const standards = [
    'First Class Honours: 3.70 - 4.00 GPA',
    'Second Class Upper: 3.30 - 3.69 GPA',
    'Second Class Lower: 3.00 - 3.29 GPA',
    'General Pass: 2.00 - 2.99 GPA',
    'Below Pass: Below 2.00 GPA'
  ];
  
  standards.forEach((standard, index) => {
    const xPos = 30 + (index % 2) * (pageWidth / 2 - 30);
    const yPos = yPosition + Math.floor(index / 2) * 8;
    doc.text(`• ${standard}`, xPos, yPos);
  });
  
  yPosition += 40;
  
  // Semester Details
  data.semesters.forEach((semester, semesterIndex) => {
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = 30;
    }
    
    // Semester header
    doc.setFillColor(30, 58, 138); // blue-900
    doc.rect(20, yPosition - 8, pageWidth - 40, 20, 'F');
    
    doc.setTextColor(255, 255, 255); // white
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(semester.name.toUpperCase(), 30, yPosition);
    
    const semesterClassification = getAcademicClassification(semester.gpa);
    doc.setFontSize(10);
    doc.text(`GPA: ${semester.gpa.toFixed(2)} | Credits: ${semester.totalCredits} | ${semesterClassification.name}`, 
             pageWidth - 30, yPosition, { align: 'right' });
    
    yPosition += 25;
    
    // Course table header
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(20, yPosition - 5, pageWidth - 40, 15, 'F');
    doc.setDrawColor(203, 213, 225); // slate-300 border
    doc.setLineWidth(0.3);
    doc.rect(20, yPosition - 5, pageWidth - 40, 15, 'S');
    
    doc.setTextColor(30, 58, 138); // blue-900
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Course Name', 30, yPosition + 3);
    doc.text('Credits', 120, yPosition + 3);
    doc.text('Grade', 145, yPosition + 3);
    doc.text('Points', 170, yPosition + 3);
    
    yPosition += 18;
    
    // Course rows
    semester.courses.forEach((course: Course, courseIndex) => {
      if (yPosition > pageHeight - 25) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Alternating row colors
      if (courseIndex % 2 === 0) {
        doc.setFillColor(255, 255, 255); // white
      } else {
        doc.setFillColor(248, 250, 252); // slate-50
      }
      doc.rect(20, yPosition - 4, pageWidth - 40, 12, 'F');
      
      const gradePoints = data.gradePoints[course.grade] || 0;
      
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(course.name, 30, yPosition + 2);
      doc.text(course.credits.toString(), 120, yPosition + 2);
      
      // Color-coded grades with high contrast
      let gradeColor;
      if (gradePoints >= 3.7) gradeColor = [34, 197, 94]; // green-500
      else if (gradePoints >= 3.3) gradeColor = [59, 130, 246]; // blue-500
      else if (gradePoints >= 3.0) gradeColor = [245, 158, 11]; // amber-500
      else if (gradePoints >= 2.0) gradeColor = [251, 146, 60]; // orange-400
      else gradeColor = [239, 68, 68]; // red-500
      
      doc.setTextColor(gradeColor[0], gradeColor[1], gradeColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(course.grade, 145, yPosition + 2);
      
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont('helvetica', 'normal');
      doc.text((course.credits * gradePoints).toFixed(1), 170, yPosition + 2);
      
      yPosition += 10;
    });
    
    yPosition += 20;
  });
  
  // Modern footer
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = 30;
  }
  
  const footerY = pageHeight - 30;
  doc.setFillColor(30, 58, 138); // blue-900
  doc.rect(0, footerY - 15, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255); // white
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Generated by GPA Calculator Pro', pageWidth / 2, footerY - 5, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${new Date().toLocaleString()} | Confidential Academic Document`, pageWidth / 2, footerY + 3, { align: 'center' });
  
  // Save with better filename
  const fileName = `${data.studentName.replace(/\s+/g, '_')}_Academic_Transcript_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

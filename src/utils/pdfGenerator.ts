
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
  let yPosition = 20;
  
  // Modern header with gradient-like effect
  doc.setFillColor(30, 64, 175); // Blue-800
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFillColor(37, 99, 235); // Blue-600 - lighter overlay
  doc.rect(0, 30, pageWidth, 10, 'F');
  
  // Title with better typography
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('ACADEMIC TRANSCRIPT', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, pageWidth / 2, 30, { align: 'center' });
  
  yPosition = 60;
  
  // Student Information Card
  doc.setFillColor(248, 250, 252); // Blue-50
  doc.rect(15, yPosition - 5, pageWidth - 30, 35, 'F');
  doc.setDrawColor(219, 234, 254); // Blue-200
  doc.rect(15, yPosition - 5, pageWidth - 30, 35, 'S');
  
  doc.setTextColor(30, 64, 175); // Blue-800
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT INFORMATION', 25, yPosition + 5);
  
  yPosition += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85); // Slate-600
  doc.text(`Student Name: ${data.studentName}`, 25, yPosition);
  yPosition += 7;
  doc.text(`Total Semesters: ${data.semesters.length}`, 25, yPosition);
  yPosition += 7;
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 25, yPosition);
  
  yPosition += 25;
  
  // Overall Performance Summary Card
  const classification = getAcademicClassification(data.overallGPA);
  
  doc.setFillColor(239, 246, 255); // Blue-50
  doc.rect(15, yPosition - 5, pageWidth - 30, 50, 'F');
  doc.setDrawColor(147, 197, 253); // Blue-300
  doc.rect(15, yPosition - 5, pageWidth - 30, 50, 'S');
  
  doc.setTextColor(30, 64, 175); // Blue-800
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OVERALL PERFORMANCE SUMMARY', 25, yPosition + 5);
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85); // Slate-600
  
  // Create a two-column layout for better visual appeal
  const leftColumn = 25;
  const rightColumn = pageWidth / 2 + 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Overall GPA: ${data.overallGPA.toFixed(2)}`, leftColumn, yPosition);
  doc.text(`Total Credits: ${data.totalCredits}`, rightColumn, yPosition);
  
  yPosition += 8;
  doc.setFont('helvetica', 'normal');
  doc.text(`Classification: ${classification.name}`, leftColumn, yPosition);
  
  // Add a colored badge for classification
  const badgeWidth = 60;
  const badgeX = rightColumn;
  let badgeColor = [34, 197, 94]; // Green for good performance
  
  if (data.overallGPA < 2.0) badgeColor = [239, 68, 68]; // Red
  else if (data.overallGPA < 3.0) badgeColor = [245, 158, 11]; // Orange
  else if (data.overallGPA < 3.3) badgeColor = [59, 130, 246]; // Blue
  
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(badgeX, yPosition - 5, badgeWidth, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(classification.name.toUpperCase(), badgeX + badgeWidth/2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${classification.description}`, leftColumn, yPosition);
  
  yPosition += 25;
  
  // Academic Standards Reference
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.rect(15, yPosition - 5, pageWidth - 30, 40, 'F');
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.rect(15, yPosition - 5, pageWidth - 30, 40, 'S');
  
  doc.setTextColor(51, 65, 85); // Slate-600
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('GRADING STANDARDS', 25, yPosition + 5);
  
  yPosition += 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const standards = [
    'First Class Honours: 3.70 - 4.00 GPA',
    'Second Class Upper: 3.30 - 3.69 GPA',
    'Second Class Lower: 3.00 - 3.29 GPA',
    'General Pass: 2.00 - 2.99 GPA',
    'Below Pass: Below 2.00 GPA'
  ];
  
  standards.forEach((standard, index) => {
    const xPos = 25 + (index % 2) * (pageWidth / 2 - 20);
    const yPos = yPosition + Math.floor(index / 2) * 6;
    doc.text(`• ${standard}`, xPos, yPos);
  });
  
  yPosition += 35;
  
  // Semester Details
  data.semesters.forEach((semester, semesterIndex) => {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Semester header with modern styling
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(15, yPosition - 5, pageWidth - 30, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(semester.name.toUpperCase(), 25, yPosition + 5);
    
    const semesterClassification = getAcademicClassification(semester.gpa);
    doc.setFontSize(10);
    doc.text(`GPA: ${semester.gpa.toFixed(2)} | Credits: ${semester.totalCredits} | ${semesterClassification.name}`, 
             pageWidth - 25, yPosition + 5, { align: 'right' });
    
    yPosition += 20;
    
    // Course table with better formatting
    doc.setFillColor(248, 250, 252); // Blue-50
    doc.rect(15, yPosition - 2, pageWidth - 30, 12, 'F');
    
    doc.setTextColor(30, 64, 175); // Blue-800
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Course Name', 25, yPosition + 5);
    doc.text('Credits', 120, yPosition + 5);
    doc.text('Grade', 145, yPosition + 5);
    doc.text('Points', 170, yPosition + 5);
    
    yPosition += 15;
    
    // Course rows with alternating colors
    semester.courses.forEach((course: Course, courseIndex) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Alternating row colors
      if (courseIndex % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(248, 250, 252); // Blue-50
      }
      doc.rect(15, yPosition - 3, pageWidth - 30, 10, 'F');
      
      const gradePoints = data.gradePoints[course.grade] || 0;
      
      doc.setTextColor(51, 65, 85); // Slate-600
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(course.name, 25, yPosition + 2);
      doc.text(course.credits.toString(), 120, yPosition + 2);
      
      // Color-coded grades
      let gradeColor = [51, 65, 85]; // Default slate
      if (gradePoints >= 3.7) gradeColor = [34, 197, 94]; // Green
      else if (gradePoints >= 3.0) gradeColor = [59, 130, 246]; // Blue
      else if (gradePoints >= 2.0) gradeColor = [245, 158, 11]; // Orange
      else gradeColor = [239, 68, 68]; // Red
      
      doc.setTextColor(gradeColor[0], gradeColor[1], gradeColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(course.grade, 145, yPosition + 2);
      
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.text((course.credits * gradePoints).toFixed(1), 170, yPosition + 2);
      
      yPosition += 8;
    });
    
    yPosition += 15;
  });
  
  // Modern footer
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }
  
  const footerY = pageHeight - 25;
  doc.setFillColor(30, 64, 175); // Blue-800
  doc.rect(0, footerY - 10, pageWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by GPA Calculator Pro', pageWidth / 2, footerY, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`${new Date().toLocaleString()} | Confidential Academic Document`, pageWidth / 2, footerY + 6, { align: 'center' });
  
  // Save with better filename
  const fileName = `${data.studentName.replace(/\s+/g, '_')}_Academic_Transcript_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};


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
  
  // Set default font to helvetica (closest to Montserrat)
  doc.setFont('helvetica');
  
  // Modern header with blue gradient
  doc.setFillColor(30, 64, 175); // Blue-800
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Title with white text on blue background
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('ACADEMIC TRANSCRIPT', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, pageWidth / 2, 35, { align: 'center' });
  
  yPosition = 65;
  
  // Student Information Card with better contrast
  doc.setFillColor(240, 245, 255); // Very light blue background
  doc.rect(15, yPosition - 5, pageWidth - 30, 35, 'F');
  doc.setDrawColor(59, 130, 246); // Blue-500 border
  doc.setLineWidth(1);
  doc.rect(15, yPosition - 5, pageWidth - 30, 35, 'S');
  
  doc.setTextColor(30, 64, 175); // Blue-800 - dark blue text
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT INFORMATION', 25, yPosition + 5);
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42); // Slate-900 - very dark text
  doc.text(`Student Name: ${data.studentName}`, 25, yPosition);
  yPosition += 7;
  doc.text(`Total Semesters: ${data.semesters.length}`, 25, yPosition);
  yPosition += 7;
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 25, yPosition);
  
  yPosition += 25;
  
  // Overall Performance Summary Card with better colors
  const classification = getAcademicClassification(data.overallGPA);
  
  doc.setFillColor(240, 245, 255); // Very light blue background
  doc.rect(15, yPosition - 5, pageWidth - 30, 55, 'F');
  doc.setDrawColor(59, 130, 246); // Blue-500 border
  doc.rect(15, yPosition - 5, pageWidth - 30, 55, 'S');
  
  doc.setTextColor(30, 64, 175); // Blue-800
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OVERALL PERFORMANCE SUMMARY', 25, yPosition + 5);
  
  yPosition += 15;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // Very dark text
  
  // Create a two-column layout
  const leftColumn = 25;
  const rightColumn = pageWidth / 2 + 10;
  
  doc.text(`Overall GPA: ${data.overallGPA.toFixed(2)}`, leftColumn, yPosition);
  doc.text(`Total Credits: ${data.totalCredits}`, rightColumn, yPosition);
  
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Classification: ${classification.name}`, leftColumn, yPosition);
  
  // Classification badge with proper contrast
  const badgeWidth = 70;
  const badgeX = rightColumn;
  let badgeColor, textColor;
  
  if (data.overallGPA >= 3.7) {
    badgeColor = [22, 163, 74]; // Green-600
    textColor = [255, 255, 255]; // White text
  } else if (data.overallGPA >= 3.3) {
    badgeColor = [59, 130, 246]; // Blue-500
    textColor = [255, 255, 255]; // White text
  } else if (data.overallGPA >= 3.0) {
    badgeColor = [245, 158, 11]; // Amber-500
    textColor = [15, 23, 42]; // Dark text for better contrast
  } else if (data.overallGPA >= 2.0) {
    badgeColor = [251, 146, 60]; // Orange-400
    textColor = [15, 23, 42]; // Dark text
  } else {
    badgeColor = [239, 68, 68]; // Red-500
    textColor = [255, 255, 255]; // White text
  }
  
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(badgeX, yPosition - 5, badgeWidth, 10, 2, 2, 'F');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(classification.name.toUpperCase(), badgeX + badgeWidth/2, yPosition, { align: 'center' });
  
  yPosition += 12;
  doc.setTextColor(75, 85, 99); // Gray-600
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(classification.description, leftColumn, yPosition);
  
  yPosition += 25;
  
  // Academic Standards Reference with better contrast
  doc.setFillColor(248, 250, 252); // Slate-50 - very light background
  doc.rect(15, yPosition - 5, pageWidth - 30, 45, 'F');
  doc.setDrawColor(148, 163, 184); // Slate-400 border
  doc.rect(15, yPosition - 5, pageWidth - 30, 45, 'S');
  
  doc.setTextColor(30, 64, 175); // Blue-800
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('GRADING STANDARDS', 25, yPosition + 5);
  
  yPosition += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42); // Very dark text
  
  const standards = [
    'First Class Honours: 3.70 - 4.00 GPA',
    'Second Class Upper: 3.30 - 3.69 GPA',
    'Second Class Lower: 3.00 - 3.29 GPA',
    'General Pass: 2.00 - 2.99 GPA',
    'Below Pass: Below 2.00 GPA'
  ];
  
  standards.forEach((standard, index) => {
    const xPos = 25 + (index % 2) * (pageWidth / 2 - 20);
    const yPos = yPosition + Math.floor(index / 2) * 7;
    doc.text(`• ${standard}`, xPos, yPos);
  });
  
  yPosition += 40;
  
  // Semester Details with improved styling
  data.semesters.forEach((semester, semesterIndex) => {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Semester header with blue background
    doc.setFillColor(59, 130, 246); // Blue-500
    doc.rect(15, yPosition - 5, pageWidth - 30, 18, 'F');
    
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(semester.name.toUpperCase(), 25, yPosition + 5);
    
    const semesterClassification = getAcademicClassification(semester.gpa);
    doc.setFontSize(11);
    doc.text(`GPA: ${semester.gpa.toFixed(2)} | Credits: ${semester.totalCredits} | ${semesterClassification.name}`, 
             pageWidth - 25, yPosition + 5, { align: 'right' });
    
    yPosition += 23;
    
    // Course table header with better contrast
    doc.setFillColor(240, 245, 255); // Very light blue background
    doc.rect(15, yPosition - 2, pageWidth - 30, 12, 'F');
    
    doc.setTextColor(30, 64, 175); // Blue-800
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Course Name', 25, yPosition + 5);
    doc.text('Credits', 120, yPosition + 5);
    doc.text('Grade', 145, yPosition + 5);
    doc.text('Points', 170, yPosition + 5);
    
    yPosition += 15;
    
    // Course rows with alternating colors and proper contrast
    semester.courses.forEach((course: Course, courseIndex) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Alternating row colors with better contrast
      if (courseIndex % 2 === 0) {
        doc.setFillColor(255, 255, 255); // White
      } else {
        doc.setFillColor(248, 250, 252); // Very light gray
      }
      doc.rect(15, yPosition - 3, pageWidth - 30, 10, 'F');
      
      const gradePoints = data.gradePoints[course.grade] || 0;
      
      doc.setTextColor(15, 23, 42); // Very dark text
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(course.name, 25, yPosition + 2);
      doc.text(course.credits.toString(), 120, yPosition + 2);
      
      // Color-coded grades with high contrast
      let gradeColor;
      if (gradePoints >= 3.7) gradeColor = [22, 163, 74]; // Green-600
      else if (gradePoints >= 3.3) gradeColor = [59, 130, 246]; // Blue-500
      else if (gradePoints >= 3.0) gradeColor = [245, 158, 11]; // Amber-500
      else if (gradePoints >= 2.0) gradeColor = [251, 146, 60]; // Orange-400
      else gradeColor = [239, 68, 68]; // Red-500
      
      doc.setTextColor(gradeColor[0], gradeColor[1], gradeColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(course.grade, 145, yPosition + 2);
      
      doc.setTextColor(15, 23, 42); // Dark text
      doc.setFont('helvetica', 'normal');
      doc.text((course.credits * gradePoints).toFixed(1), 170, yPosition + 2);
      
      yPosition += 8;
    });
    
    yPosition += 15;
  });
  
  // Modern footer with blue theme
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }
  
  const footerY = pageHeight - 25;
  doc.setFillColor(30, 64, 175); // Blue-800
  doc.rect(0, footerY - 10, pageWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Generated by GPA Calculator Pro', pageWidth / 2, footerY, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${new Date().toLocaleString()} | Confidential Academic Document`, pageWidth / 2, footerY + 6, { align: 'center' });
  
  // Save with better filename
  const fileName = `${data.studentName.replace(/\s+/g, '_')}_Academic_Transcript_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

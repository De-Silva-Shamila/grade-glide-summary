
import { GPAData, GRADE_POINTS } from '@/types/gpa';

interface ExtendedGPAData extends GPAData {
  gradePoints: Record<string, number>;
  studentName?: string;
}

export const generateGPAPDF = (gpaData: ExtendedGPAData) => {
  const studentName = gpaData.studentName || 'Student';
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create a comprehensive HTML document with modern styling
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Academic Transcript - ${studentName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #2c3e50;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .document {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border-radius: 12px;
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 40px;
          text-align: center;
          position: relative;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }
        
        .header-content {
          position: relative;
          z-index: 1;
        }
        
        .university-name {
          font-size: 2.5em;
          font-weight: 700;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .document-title {
          font-size: 1.8em;
          font-weight: 300;
          margin-bottom: 20px;
          opacity: 0.9;
        }
        
        .student-info {
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }
        
        .student-name {
          font-size: 1.4em;
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .generation-date {
          font-size: 0.9em;
          opacity: 0.8;
        }
        
        .content {
          padding: 40px;
        }
        
        .overview-section {
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 40px;
          border-left: 6px solid #3b82f6;
        }
        
        .overview-title {
          font-size: 1.8em;
          color: #1e293b;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 25px;
        }
        
        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.07);
          border: 1px solid #e2e8f0;
          transition: transform 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .stat-value {
          font-size: 2.5em;
          font-weight: 700;
          color: #3b82f6;
          display: block;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 1em;
          color: #64748b;
          font-weight: 500;
        }
        
        .semester-section {
          margin-bottom: 40px;
        }
        
        .semester-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 30px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .semester-header {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          padding: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .semester-name {
          font-size: 1.4em;
          font-weight: 600;
        }
        
        .semester-stats {
          display: flex;
          gap: 30px;
          font-size: 0.9em;
        }
        
        .semester-stat {
          text-align: center;
        }
        
        .semester-stat-value {
          font-size: 1.3em;
          font-weight: 700;
          display: block;
        }
        
        .courses-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .courses-table th {
          background: #f8fafc;
          padding: 18px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .courses-table td {
          padding: 16px 18px;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .courses-table tr:hover {
          background: #f8fafc;
        }
        
        .grade-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.85em;
          text-align: center;
          min-width: 50px;
        }
        
        .grade-A { background: #dcfce7; color: #166534; }
        .grade-B { background: #dbeafe; color: #1d4ed8; }
        .grade-C { background: #fef3c7; color: #92400e; }
        .grade-D { background: #fed7aa; color: #9a3412; }
        .grade-F { background: #fecaca; color: #dc2626; }
        
        .footer {
          background: #f8fafc;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
        }
        
        .footer-note {
          font-size: 0.9em;
          margin-bottom: 10px;
        }
        
        .grading-scale {
          margin-top: 30px;
          padding: 20px;
          background: #f1f5f9;
          border-radius: 8px;
        }
        
        .grading-scale h4 {
          color: #334155;
          margin-bottom: 15px;
          font-size: 1.1em;
        }
        
        .scale-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 10px;
          font-size: 0.85em;
        }
        
        .scale-item {
          text-align: center;
          padding: 8px;
          background: white;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .document {
            box-shadow: none;
            border-radius: 0;
          }
          
          .stat-card:hover {
            transform: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.07);
          }
        }
      </style>
    </head>
    <body>
      <div class="document">
        <div class="header">
          <div class="header-content">
            <h1 class="university-name">Academic Institution</h1>
            <h2 class="document-title">Official Academic Transcript</h2>
            <div class="student-info">
              <div class="student-name">${studentName}</div>
              <div class="generation-date">Generated on ${currentDate}</div>
            </div>
          </div>
        </div>
        
        <div class="content">
          <div class="overview-section">
            <h3 class="overview-title">Academic Performance Summary</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-value">${gpaData.overallGPA.toFixed(2)}</span>
                <span class="stat-label">Cumulative GPA</span>
              </div>
              <div class="stat-card">
                <span class="stat-value">${gpaData.totalCredits}</span>
                <span class="stat-label">Total Credits</span>
              </div>
              <div class="stat-card">
                <span class="stat-value">${gpaData.semesters.length}</span>
                <span class="stat-label">Semesters Completed</span>
              </div>
              <div class="stat-card">
                <span class="stat-value">${gpaData.semesters.reduce((total, sem) => total + sem.courses.length, 0)}</span>
                <span class="stat-label">Total Courses</span>
              </div>
            </div>
          </div>
          
          ${gpaData.semesters.map((semester, index) => `
            <div class="semester-section">
              <div class="semester-card">
                <div class="semester-header">
                  <h3 class="semester-name">${semester.name}</h3>
                  <div class="semester-stats">
                    <div class="semester-stat">
                      <span class="semester-stat-value">${semester.gpa.toFixed(2)}</span>
                      <span>GPA</span>
                    </div>
                    <div class="semester-stat">
                      <span class="semester-stat-value">${semester.totalCredits}</span>
                      <span>Credits</span>
                    </div>
                  </div>
                </div>
                
                <table class="courses-table">
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Credits</th>
                      <th>Grade</th>
                      <th>Quality Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${semester.courses.map(course => {
                      const gradePoints = (GRADE_POINTS[course.grade] || 0) * course.credits;
                      const gradeClass = course.grade.startsWith('A') ? 'grade-A' : 
                                       course.grade.startsWith('B') ? 'grade-B' : 
                                       course.grade.startsWith('C') ? 'grade-C' : 
                                       course.grade.startsWith('D') ? 'grade-D' : 'grade-F';
                      
                      return `
                        <tr>
                          <td><strong>${course.name}</strong></td>
                          <td>${course.credits}</td>
                          <td><span class="grade-badge ${gradeClass}">${course.grade}</span></td>
                          <td>${gradePoints.toFixed(1)}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `).join('')}
          
          <div class="grading-scale">
            <h4>Grading Scale</h4>
            <div class="scale-grid">
              ${Object.entries(GRADE_POINTS).map(([grade, points]) => `
                <div class="scale-item">
                  <strong>${grade}</strong><br>${points.toFixed(1)}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-note">
            This transcript was generated automatically by the GPA Calculator system.
          </div>
          <div class="footer-note">
            All calculations follow the standard 4.0 GPA scale.
          </div>
          <div style="margin-top: 20px; font-size: 0.8em; color: #9ca3af;">
            Document ID: GPA-${Date.now().toString(36).toUpperCase()}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create and download the HTML file
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Academic_Transcript_${studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

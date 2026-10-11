export interface AssessmentPeriod {
  period: string; // e.g. 'P1 (W2)', 'P2 (W4)', 'P3 (W6)'
  name: string;   // e.g. 'Orientation Baseline', 'Mid-Term Attendance', 'Current Evaluation'
  score: number;  // 0 - 100
  date: string;
}

export interface StudentRecord {
  id: string;
  rollNo: string;
  name: string;
  gender: 'Female' | 'Male';
  ageAtEnrollment: number;
  course: string;
  semester: number;
  attendanceRate: number; // Percentage
  sem1EnrolledUnits: number;
  sem1ApprovedUnits: number;
  sem1Grade: number; // Scale 0-20 (UCI standard)
  sem2EnrolledUnits: number;
  sem2ApprovedUnits: number;
  sem2Grade: number;
  tuitionFeesUpToDate: boolean;
  scholarshipHolder: boolean;
  debtor: boolean;
  unemploymentRate: number;
  gdp: number;
  riskScore: number; // 0 - 100
  riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk';
  target: 'Dropout' | 'Enrolled' | 'Graduate';
  topFactors: string[];
  interventionsCount: number;
  lastCounseledDate?: string;
  notes?: string;
  // Risk assessment history over the last 3 assessment periods (T-2, T-1, T-0/current)
  riskHistory: [number, number, number];
  assessmentPeriods: [AssessmentPeriod, AssessmentPeriod, AssessmentPeriod];
  trendDirection: 'worsening' | 'improving' | 'stable';
  trendDelta: number; // e.g. +20 (worsened by 20%), -11 (improved by 11%)
}

export const SAMPLE_STUDENTS: StudentRecord[] = [
  {
    id: 'STU-001',
    rollNo: '2023-CS-041',
    name: 'Rahul Verma',
    gender: 'Male',
    ageAtEnrollment: 24,
    course: 'Computer Science & Engineering',
    semester: 2,
    attendanceRate: 58,
    sem1EnrolledUnits: 6,
    sem1ApprovedUnits: 1,
    sem1Grade: 9.2,
    sem2EnrolledUnits: 6,
    sem2ApprovedUnits: 2,
    sem2Grade: 9.8,
    tuitionFeesUpToDate: false,
    scholarshipHolder: false,
    debtor: true,
    unemploymentRate: 12.4,
    gdp: 1.74,
    riskScore: 88,
    riskLevel: 'High Risk',
    target: 'Dropout',
    riskHistory: [68, 78, 88],
    assessmentPeriods: [
      { period: 'P1 (W2)', name: 'Baseline Entry', score: 68, date: 'Aug 18' },
      { period: 'P2 (W4)', name: 'Mid Attendance Check', score: 78, date: 'Sep 02' },
      { period: 'P3 (W6)', name: 'Current Evaluation', score: 88, date: 'Sep 22' },
    ],
    trendDirection: 'worsening',
    trendDelta: 20,
    topFactors: [
      'Unpaid semester tuition fees (Critical)',
      'High subject failure rate (Cleared only 1 of 6 units in Sem 1)',
      'Attendance is 58% (Well below AICTE 75% requirement)',
      'Student debt backlog recorded'
    ],
    interventionsCount: 1,
    lastCounseledDate: '2026-09-18',
    notes: 'Financial hardship due to family medical expense. Advised to apply for NSP emergency relief.'
  },
  {
    id: 'STU-002',
    rollNo: '2023-EE-019',
    name: 'Priya Nair',
    gender: 'Female',
    ageAtEnrollment: 19,
    course: 'Electrical & Electronics Engineering',
    semester: 2,
    attendanceRate: 67,
    sem1EnrolledUnits: 6,
    sem1ApprovedUnits: 3,
    sem1Grade: 10.4,
    sem2EnrolledUnits: 6,
    sem2ApprovedUnits: 3,
    sem2Grade: 10.8,
    tuitionFeesUpToDate: true,
    scholarshipHolder: false,
    debtor: false,
    unemploymentRate: 10.8,
    gdp: 2.1,
    riskScore: 68,
    riskLevel: 'High Risk',
    target: 'Dropout',
    riskHistory: [79, 73, 68],
    assessmentPeriods: [
      { period: 'P1 (W2)', name: 'Baseline Entry', score: 79, date: 'Aug 18' },
      { period: 'P2 (W4)', name: 'Mid Attendance Check', score: 73, date: 'Sep 02' },
      { period: 'P3 (W6)', name: 'Current Evaluation', score: 68, date: 'Sep 22' },
    ],
    trendDirection: 'improving',
    trendDelta: -11,
    topFactors: [
      'Low course clearance ratio (50% approved units)',
      'Attendance below 75% cutoff (67%)',
      'Difficulties in Mathematics & Circuit Analysis'
    ],
    interventionsCount: 2,
    lastCounseledDate: '2026-09-24',
    notes: 'Peer tutoring group assigned. Attending Saturday remedial sessions.'
  },
  {
    id: 'STU-003',
    rollNo: '2023-ME-082',
    name: 'Amit Patel',
    gender: 'Male',
    ageAtEnrollment: 22,
    course: 'Mechanical Engineering',
    semester: 2,
    attendanceRate: 71,
    sem1EnrolledUnits: 6,
    sem1ApprovedUnits: 4,
    sem1Grade: 11.2,
    sem2EnrolledUnits: 6,
    sem2ApprovedUnits: 4,
    sem2Grade: 11.0,
    tuitionFeesUpToDate: false,
    scholarshipHolder: false,
    debtor: true,
    unemploymentRate: 13.9,
    gdp: 0.79,
    riskScore: 59,
    riskLevel: 'Medium Risk',
    target: 'Enrolled',
    riskHistory: [52, 55, 59],
    assessmentPeriods: [
      { period: 'P1 (W2)', name: 'Baseline Entry', score: 52, date: 'Aug 18' },
      { period: 'P2 (W4)', name: 'Mid Attendance Check', score: 55, date: 'Sep 02' },
      { period: 'P3 (W6)', name: 'Current Evaluation', score: 59, date: 'Sep 22' },
    ],
    trendDirection: 'worsening',
    trendDelta: 7,
    topFactors: [
      'Tuition fee installment delayed by 45 days',
      'Attendance fluctuating around 71%',
      'Backlogs in Thermodynamics'
    ],
    interventionsCount: 1,
    lastCounseledDate: '2026-09-10',
    notes: 'Father requested installment breakdown. Dean permitted examination fee deferral.'
  },
  {
    id: 'STU-004',
    rollNo: '2023-IT-015',
    name: 'Pooja Sharma',
    gender: 'Female',
    ageAtEnrollment: 18,
    course: 'Information Technology',
    semester: 2,
    attendanceRate: 74,
    sem1EnrolledUnits: 6,
    sem1ApprovedUnits: 4,
    sem1Grade: 11.8,
    sem2EnrolledUnits: 6,
    sem2ApprovedUnits: 5,
    sem2Grade: 12.1,
    tuitionFeesUpToDate: true,
    scholarshipHolder: true,
    debtor: false,
    unemploymentRate: 11.1,
    gdp: 1.74,
    riskScore: 42,
    riskLevel: 'Medium Risk',
    target: 'Enrolled',
    riskHistory: [44, 43, 42],
    assessmentPeriods: [
      { period: 'P1 (W2)', name: 'Baseline Entry', score: 44, date: 'Aug 18' },
      { period: 'P2 (W4)', name: 'Mid Attendance Check', score: 43, date: 'Sep 02' },
      { period: 'P3 (W6)', name: 'Current Evaluation', score: 42, date: 'Sep 22' },
    ],
    trendDirection: 'stable',
    trendDelta: -2,
    topFactors: [
      'Borderline attendance (74% vs 75% statutory bar)',
      'Scholarship active (Protective factor)',
      'Passing grade achieved in core IT papers'
    ],
    interventionsCount: 0,
    notes: 'Capable student; needs regular attendance encouragement to avoid condonation fine.'
  },
  {
    id: 'STU-005',
    rollNo: '2023-CV-053',
    name: 'Vikram Singh',
    gender: 'Male',
    ageAtEnrollment: 25,
    course: 'Civil Engineering',
    semester: 2,
    attendanceRate: 52,
    sem1EnrolledUnits: 6,
    sem1ApprovedUnits: 2,
    sem1Grade: 9.8,
    sem2EnrolledUnits: 6,
    sem2ApprovedUnits: 1,
    sem2Grade: 9.0,
    tuitionFeesUpToDate: false,
    scholarshipHolder: false,
    debtor: true,
    unemploymentRate: 15.5,
    gdp: -1.7,
    riskScore: 91,
    riskLevel: 'High Risk',
    target: 'Dropout',
    riskHistory: [72, 83, 91],
    assessmentPeriods: [
      { period: 'P1 (W2)', name: 'Baseline Entry', score: 72, date: 'Aug 18' },
      { period: 'P2 (W4)', name: 'Mid Attendance Check', score: 83, date: 'Sep 02' },
      { period: 'P3 (W6)', name: 'Current Evaluation', score: 91, date: 'Sep 22' },
    ],
    trendDirection: 'worsening',
    trendDelta: 19,
    topFactors: [
      'Critical dropout indicator: 1 unit passed in Sem 2',
      'Overdue tuition fees with debt flag',
      'Severe attendance drop (52%)',
      'Late enrollment age (25 years)'
    ],
    interventionsCount: 2,
    lastCounseledDate: '2026-09-28',
    notes: 'Student works part-time night shifts to support family. Needs flexible lab schedule or evening batch.'
  },
  {
    id: 'STU-006',
    rollNo: '2023-CS-008',
    name: 'Ananya Roy',
    gender: 'Female',
    ageAtEnrollment: 18,
    course: 'Computer Science & Engineering',
    semester: 2,
    attendanceRate: 94,
    sem1EnrolledUnits: 6,
    sem1ApprovedUnits: 6,
    sem1Grade: 16.5,
    sem2EnrolledUnits: 6,
    sem2ApprovedUnits: 6,
    sem2Grade: 17.1,
    tuitionFeesUpToDate: true,
    scholarshipHolder: true,
    debtor: false,
    unemploymentRate: 10.8,
    gdp: 2.1,
    riskScore: 6,
    riskLevel: 'Low Risk',
    target: 'Graduate',
    riskHistory: [8, 7, 6],
    assessmentPeriods: [
      { period: 'P1 (W2)', name: 'Baseline Entry', score: 8, date: 'Aug 18' },
      { period: 'P2 (W4)', name: 'Mid Attendance Check', score: 7, date: 'Sep 02' },
      { period: 'P3 (W6)', name: 'Current Evaluation', score: 6, date: 'Sep 22' },
    ],
    trendDirection: 'stable',
    trendDelta: -2,
    topFactors: [
      '100% course clearance rate (12/12 units passed)',
      'Outstanding academic grade (16.8/20 average)',
      'AICTE Pragati Scholarship awardee',
      'Exemplary 94% lecture and lab attendance'
    ],
    interventionsCount: 0,
    notes: 'Department peer tutor candidate. Recommended for IBM Watson AI hackathon team.'
  },
  {
    id: 'STU-007',
    rollNo: '2023-EC-029',
    name: 'Deepak Kumar',
    gender: 'Male',
    ageAtEnrollment: 20,
    course: 'Electronics & Communication',
    semester: 2,
    attendanceRate: 88,
    sem1EnrolledUnits: 6,
    sem1ApprovedUnits: 5,
    sem1Grade: 13.5,
    sem2EnrolledUnits: 6,
    sem2ApprovedUnits: 5,
    sem2Grade: 14.0,
    tuitionFeesUpToDate: true,
    scholarshipHolder: false,
    debtor: false,
    unemploymentRate: 11.1,
    gdp: 1.74,
    riskScore: 16,
    riskLevel: 'Low Risk',
    target: 'Graduate',
    riskHistory: [19, 18, 16],
    assessmentPeriods: [
      { period: 'P1 (W2)', name: 'Baseline Entry', score: 19, date: 'Aug 18' },
      { period: 'P2 (W4)', name: 'Mid Attendance Check', score: 18, date: 'Sep 02' },
      { period: 'P3 (W6)', name: 'Current Evaluation', score: 16, date: 'Sep 22' },
    ],
    trendDirection: 'improving',
    trendDelta: -3,
    topFactors: [
      'Steady clearance of 10/12 units',
      'Healthy 88% attendance',
      'Prompt fee clearance each semester'
    ],
    interventionsCount: 0,
    notes: 'Good progress. Working on mini-project in embedded systems.'
  },
  {
    id: 'STU-008',
    rollNo: '2023-CS-064',
    name: 'Sneha Gupta',
    gender: 'Female',
    ageAtEnrollment: 19,
    course: 'Computer Science & Engineering',
    semester: 2,
    attendanceRate: 64,
    sem1EnrolledUnits: 6,
    sem1ApprovedUnits: 3,
    sem1Grade: 10.9,
    sem2EnrolledUnits: 6,
    sem2ApprovedUnits: 3,
    sem2Grade: 11.2,
    tuitionFeesUpToDate: true,
    scholarshipHolder: false,
    debtor: false,
    unemploymentRate: 12.4,
    gdp: 1.74,
    riskScore: 54,
    riskLevel: 'Medium Risk',
    target: 'Enrolled',
    riskHistory: [44, 49, 54],
    assessmentPeriods: [
      { period: 'P1 (W2)', name: 'Baseline Entry', score: 44, date: 'Aug 18' },
      { period: 'P2 (W4)', name: 'Mid Attendance Check', score: 49, date: 'Sep 02' },
      { period: 'P3 (W6)', name: 'Current Evaluation', score: 54, date: 'Sep 22' },
    ],
    trendDirection: 'worsening',
    trendDelta: 10,
    topFactors: [
      '3 backlogs accumulated over two semesters',
      'Attendance at 64% due to long commute',
      'Fees paid up to date'
    ],
    interventionsCount: 1,
    lastCounseledDate: '2026-09-20',
    notes: 'Commute fatigue causing 1st period absence. Counseling advised hostel seat or carpool.'
  },
  {
    id: 'STU-009',
    rollNo: '2023-BT-011',
    name: 'Kavita Das',
    gender: 'Female',
    ageAtEnrollment: 20,
    course: 'Biotechnology Engineering',
    semester: 2,
    attendanceRate: 82,
    sem1EnrolledUnits: 6,
    sem1ApprovedUnits: 6,
    sem1Grade: 14.2,
    sem2EnrolledUnits: 6,
    sem2ApprovedUnits: 5,
    sem2Grade: 13.8,
    tuitionFeesUpToDate: true,
    scholarshipHolder: true,
    debtor: false,
    unemploymentRate: 11.5,
    gdp: 2.0,
    riskScore: 14,
    riskLevel: 'Low Risk',
    target: 'Graduate',
    riskHistory: [15, 14, 14],
    assessmentPeriods: [
      { period: 'P1 (W2)', name: 'Baseline Entry', score: 15, date: 'Aug 18' },
      { period: 'P2 (W4)', name: 'Mid Attendance Check', score: 14, date: 'Sep 02' },
      { period: 'P3 (W6)', name: 'Current Evaluation', score: 14, date: 'Sep 22' },
    ],
    trendDirection: 'stable',
    trendDelta: -1,
    topFactors: [
      'State Post-Matric Scholarship holder',
      'Consistent grade average above 14/20',
      'Regular attendance (82%)'
    ],
    interventionsCount: 0
  },
  {
    id: 'STU-010',
    rollNo: '2023-AI-032',
    name: 'Mohd. Zeeshan',
    gender: 'Male',
    ageAtEnrollment: 21,
    course: 'Artificial Intelligence & Data Science',
    semester: 2,
    attendanceRate: 60,
    sem1EnrolledUnits: 6,
    sem1ApprovedUnits: 2,
    sem1Grade: 9.9,
    sem2EnrolledUnits: 6,
    sem2ApprovedUnits: 2,
    sem2Grade: 10.1,
    tuitionFeesUpToDate: false,
    scholarshipHolder: false,
    debtor: true,
    unemploymentRate: 13.2,
    gdp: 0.8,
    riskScore: 82,
    riskLevel: 'High Risk',
    target: 'Dropout',
    riskHistory: [66, 75, 82],
    assessmentPeriods: [
      { period: 'P1 (W2)', name: 'Baseline Entry', score: 66, date: 'Aug 18' },
      { period: 'P2 (W4)', name: 'Mid Attendance Check', score: 75, date: 'Sep 02' },
      { period: 'P3 (W6)', name: 'Current Evaluation', score: 82, date: 'Sep 22' },
    ],
    trendDirection: 'worsening',
    trendDelta: 16,
    topFactors: [
      'Overdue college hostel and tuition fee arrears',
      'Low subject clearance (4 backlogs pending)',
      'Attendance 60% with warning notice issued'
    ],
    interventionsCount: 1,
    lastCounseledDate: '2026-09-15',
    notes: 'Needs urgent financial guidance. Referred to institutional hardship fund committee.'
  }
];

export const UCI_DATASET_SUMMARY = {
  totalInstances: 4424,
  featuresCount: 36,
  dropoutCount: 1421, // ~32.1%
  graduateCount: 2209, // ~49.9%
  enrolledCount: 794, // ~18.0%
  baselineDropoutRate: '32.1%',
  source: 'UCI Machine Learning Repository & Polytechnic Institute of Portalegre',
  topPredictiveFeatures: [
    { rank: 1, name: 'Curricular units 2nd sem (approved)', importance: '0.245', category: 'Academic' },
    { rank: 2, name: 'Curricular units 1st sem (approved)', importance: '0.218', category: 'Academic' },
    { rank: 3, name: 'Tuition fees up to date', importance: '0.182', category: 'Financial' },
    { rank: 4, name: 'Curricular units 2nd sem (grade)', importance: '0.114', category: 'Academic' },
    { rank: 5, name: 'Scholarship holder', importance: '0.076', category: 'Financial' },
    { rank: 6, name: 'Age at enrollment', importance: '0.058', category: 'Demographic' },
    { rank: 7, name: 'Debtor status', importance: '0.049', category: 'Financial' },
    { rank: 8, name: 'Curricular units 1st sem (evaluations)', importance: '0.032', category: 'Academic' }
  ]
};

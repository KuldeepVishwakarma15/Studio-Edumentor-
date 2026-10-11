import React, { useState } from 'react';
import { 
  UserPlus, 
  X, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  IndianRupee, 
  Calendar, 
  Percent, 
  Award,
  ArrowRight
} from 'lucide-react';
import { StudentRecord, AssessmentPeriod } from '../data/uciStudents';

interface AddStudentRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: StudentRecord) => void;
}

export const AddStudentRecordModal: React.FC<AddStudentRecordModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
}) => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [course, setCourse] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState(2);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [ageAtEnrollment, setAgeAtEnrollment] = useState(19);
  
  // Academic Metrics
  const [attendanceRate, setAttendanceRate] = useState(72);
  const [sem1EnrolledUnits, setSem1EnrolledUnits] = useState(6);
  const [sem1ApprovedUnits, setSem1ApprovedUnits] = useState(4);
  const [sem1Grade, setSem1Grade] = useState(11.5);
  
  // Financial & Support Factors
  const [tuitionFeesUpToDate, setTuitionFeesUpToDate] = useState(true);
  const [scholarshipHolder, setScholarshipHolder] = useState(false);
  const [debtor, setDebtor] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const calculateSurrogateRisk = (
    att: number, 
    approved: number, 
    total: number, 
    grade: number, 
    feesPaid: boolean, 
    scholarship: boolean,
    isDebtor: boolean
  ) => {
    let score = 48.0;
    // Attendance factor (cutoff 75%)
    score += (75 - att) * 0.9;
    // Failed units factor
    const failedUnits = Math.max(0, total - approved);
    score += failedUnits * 7.5;
    // Fee status
    score += feesPaid ? -18 : 22;
    // Scholarship status
    score += scholarship ? -14 : 4;
    // Debtor
    score += isDebtor ? 10 : -4;
    // Grade index (standard 12/20)
    score += (12.0 - grade) * 2.2;

    const clamped = Math.min(Math.max(Math.round(score), 4), 96);
    let level: 'High Risk' | 'Medium Risk' | 'Low Risk' = 'Low Risk';
    if (clamped >= 65) level = 'High Risk';
    else if (clamped >= 40) level = 'Medium Risk';

    const topFactors: string[] = [];
    if (!feesPaid) topFactors.push('Unpaid tuition fees create immediate financial drop risk');
    if (att < 75) topFactors.push(`Critical attendance deficit (${att}% vs 75% AICTE mandatory cutoff)`);
    if (failedUnits > 1) topFactors.push(`Multiple course backlogs (${failedUnits} subjects failed in Sem 1)`);
    if (isDebtor) topFactors.push('Pending institutional arrears/debtor status');
    if (scholarship) topFactors.push('Active merit/need-based government scholarship grant');
    if (feesPaid && att >= 75) topFactors.push('Stable attendance and up-to-date semester fee payment');
    if (topFactors.length === 0) topFactors.push('Steady academic and institutional engagement');

    return { score: clamped, level, topFactors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    let calculatedScore = 50;
    let calculatedLevel: 'High Risk' | 'Medium Risk' | 'Low Risk' = 'Medium Risk';
    let factors: string[] = [];

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendanceRate,
          sem1ApprovedUnits,
          sem1TotalUnits: sem1EnrolledUnits,
          sem1Grade,
          tuitionFeesUpToDate: tuitionFeesUpToDate ? 1 : 0,
          scholarshipHolder: scholarshipHolder ? 1 : 0,
          ageAtEnrollment,
          debtor: debtor ? 1 : 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        calculatedScore = data.riskScore;
        calculatedLevel = data.riskLevel;
        if (data.shapContributions && Array.isArray(data.shapContributions)) {
          factors = data.shapContributions
            .slice(0, 3)
            .map((c: any) => c.descriptionEn || c.feature);
        }
      } else {
        const fallback = calculateSurrogateRisk(attendanceRate, sem1ApprovedUnits, sem1EnrolledUnits, sem1Grade, tuitionFeesUpToDate, scholarshipHolder, debtor);
        calculatedScore = fallback.score;
        calculatedLevel = fallback.level;
        factors = fallback.topFactors;
      }
    } catch {
      const fallback = calculateSurrogateRisk(attendanceRate, sem1ApprovedUnits, sem1EnrolledUnits, sem1Grade, tuitionFeesUpToDate, scholarshipHolder, debtor);
      calculatedScore = fallback.score;
      calculatedLevel = fallback.level;
      factors = fallback.topFactors;
    }

    if (factors.length === 0) {
      factors = ['Initial baseline enrollment record'];
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const generatedId = `STU-${Math.floor(100 + Math.random() * 900)}`;
    const finalRollNo = rollNo.trim() || `2024-${course.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const assessmentPeriods: [AssessmentPeriod, AssessmentPeriod, AssessmentPeriod] = [
      {
        period: 'P1 (W2)',
        name: 'Orientation Baseline',
        score: Math.max(10, calculatedScore - 8),
        date: '2026-08-15',
      },
      {
        period: 'P2 (W4)',
        name: 'Mid-Term Checkpoint',
        score: Math.max(10, calculatedScore - 3),
        date: '2026-09-10',
      },
      {
        period: 'P3 (W6)',
        name: 'Current Self-Evaluation',
        score: calculatedScore,
        date: todayDate,
      },
    ];

    const newStudent: StudentRecord = {
      id: generatedId,
      rollNo: finalRollNo,
      name: name.trim(),
      gender,
      ageAtEnrollment: Number(ageAtEnrollment) || 19,
      course,
      semester: Number(semester) || 1,
      attendanceRate: Number(attendanceRate),
      sem1EnrolledUnits: Number(sem1EnrolledUnits),
      sem1ApprovedUnits: Number(sem1ApprovedUnits),
      sem1Grade: Number(sem1Grade),
      sem2EnrolledUnits: Number(sem1EnrolledUnits),
      sem2ApprovedUnits: Number(sem1ApprovedUnits),
      sem2Grade: Number(sem1Grade),
      tuitionFeesUpToDate,
      scholarshipHolder,
      debtor,
      unemploymentRate: 11.2,
      gdp: 1.8,
      riskScore: calculatedScore,
      riskLevel: calculatedLevel,
      target: calculatedScore >= 65 ? 'Dropout' : calculatedScore >= 40 ? 'Enrolled' : 'Graduate',
      topFactors: factors,
      interventionsCount: 0,
      riskHistory: [
        Math.max(10, calculatedScore - 8),
        Math.max(10, calculatedScore - 3),
        calculatedScore,
      ],
      assessmentPeriods,
      trendDirection: calculatedScore > 50 ? 'worsening' : 'stable',
      trendDelta: 5,
      notes: 'Newly registered student record. Welcome to EduMentor AI!',
    };

    setSuccessMessage(`Welcome ${newStudent.name}! Logged in to your personal profile...`);
    
    setTimeout(() => {
      onAddStudent(newStudent);
      setIsSubmitting(false);
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8 transition-colors">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Add Student Record / Self-Registration</span>
                <span className="text-[11px] font-normal bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/20 hidden sm:inline">
                  Personal Login
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apna data fill karein — instant ML dropout prediction ke saath personal dashboard activate hoga
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Section 1: Basic Personal Info */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Personal & Enrollment Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Student Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aman Sharma / Priya Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Roll No / Student ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2024-CS-099"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Course / Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Business Administration & Management">Business Administration (Management)</option>
                  <option value="Biotechnology & Bioinformatics">Biotechnology & Bioinformatics</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Sem {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="16"
                    max="45"
                    value={ageAtEnrollment}
                    onChange={(e) => setAgeAtEnrollment(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Academic Performance & Attendance */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Academic Performance & Attendance Metrics</span>
            </div>

            {/* Attendance slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Class Attendance Rate:
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  attendanceRate < 75 
                    ? 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30' 
                    : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                }`}>
                  {attendanceRate}% {attendanceRate < 75 ? '(Below 75% Cutoff)' : '(Good)'}
                </span>
              </div>
              <input
                type="range"
                min="35"
                max="100"
                step="1"
                value={attendanceRate}
                onChange={(e) => setAttendanceRate(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>35% (Severe Warning)</span>
                <span className="text-amber-500 font-medium">75% Mandatory Cutoff</span>
                <span>100% (Full)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Total Sem 1 Subjects
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={sem1EnrolledUnits}
                  onChange={(e) => {
                    const total = Number(e.target.value);
                    setSem1EnrolledUnits(total);
                    if (sem1ApprovedUnits > total) setSem1ApprovedUnits(total);
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Subjects Cleared / Passed
                </label>
                <input
                  type="number"
                  min="0"
                  max={sem1EnrolledUnits}
                  value={sem1ApprovedUnits}
                  onChange={(e) => setSem1ApprovedUnits(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  {sem1EnrolledUnits - sem1ApprovedUnits} Backlog / Failed
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Grade Index (0 - 20 Scale)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={sem1Grade}
                  onChange={(e) => setSem1Grade(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  10 = 50% Pass • 14 = 70% • 16+ = First Class
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Scholarship Status */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Financial Aid & Fee Clearance</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Fee paid toggle */}
              <div 
                onClick={() => setTuitionFeesUpToDate(!tuitionFeesUpToDate)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  tuitionFeesUpToDate 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30' 
                    : 'bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30'
                }`}
              >
                <div>
                  <span className="font-semibold block text-slate-900 dark:text-white text-xs">
                    Tuition Fees
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {tuitionFeesUpToDate ? 'Cleared Up-to-Date' : 'Pending / Arrears'}
                  </span>
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 flex items-center ${tuitionFeesUpToDate ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}>
                  <span className="w-3 h-3 rounded-full bg-white shadow-xs"></span>
                </div>
              </div>

              {/* Scholarship toggle */}
              <div 
                onClick={() => setScholarshipHolder(!scholarshipHolder)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  scholarshipHolder 
                    ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-semibold block text-slate-900 dark:text-white text-xs">
                    Scholarship Grant
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {scholarshipHolder ? 'Govt / NSP Grant' : 'Self-Financed'}
                  </span>
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 flex items-center ${scholarshipHolder ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}>
                  <span className="w-3 h-3 rounded-full bg-white shadow-xs"></span>
                </div>
              </div>

              {/* Debtor toggle */}
              <div 
                onClick={() => setDebtor(!debtor)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  debtor 
                    ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-semibold block text-slate-900 dark:text-white text-xs">
                    Institutional Debt
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {debtor ? 'Hostel / Library Dues' : 'No Overdue Dues'}
                  </span>
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 flex items-center ${debtor ? 'bg-amber-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}>
                  <span className="w-3 h-3 rounded-full bg-white shadow-xs"></span>
                </div>
              </div>

            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
              Data save hone ke baad ye student personal login name ban kar dashboard me show hoga.
            </span>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>{isSubmitting ? 'Calculating Risk & Logging In...' : 'Save & Login as Student'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

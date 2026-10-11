import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Sliders, 
  HeartHandshake, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  BookOpen, 
  IndianRupee, 
  Calendar, 
  User, 
  Save, 
  RefreshCw,
  X,
  UserPlus
} from 'lucide-react';
import { StudentRecord } from '../data/uciStudents';

interface StudentProfileViewProps {
  student: StudentRecord;
  onBack: () => void;
  onOpenChatWithStudent: (student: StudentRecord) => void;
  onAddIntervention: (intervention: {
    studentId: string;
    studentName: string;
    type: string;
    notes: string;
    actionTaken: string;
    counselorName: string;
  }) => void;
  onAddNewStudentClick?: () => void;
  isPersonalLogin?: boolean;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  onBack,
  onOpenChatWithStudent,
  onAddIntervention,
  onAddNewStudentClick,
  isPersonalLogin = false,
}) => {
  // What-If Simulator state (initialized to student's real parameters)
  const [whatIfAttendance, setWhatIfAttendance] = useState<number>(student.attendanceRate);
  const [whatIfUnitsApproved, setWhatIfUnitsApproved] = useState<number>(student.sem1ApprovedUnits);
  const [whatIfFeePaid, setWhatIfFeePaid] = useState<boolean>(student.tuitionFeesUpToDate);
  const [whatIfScholarship, setWhatIfScholarship] = useState<boolean>(student.scholarshipHolder);
  const [whatIfGrade, setWhatIfGrade] = useState<number>(student.sem1Grade);

  // Recalculated What-If outcome
  const [simulatedRiskScore, setSimulatedRiskScore] = useState<number>(student.riskScore);
  const [simulatedRiskLevel, setSimulatedRiskLevel] = useState<string>(student.riskLevel);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Intervention logging modal/form state
  const [showInterventionModal, setShowInterventionModal] = useState<boolean>(false);
  const [interventionCategory, setInterventionCategory] = useState<string>('Academic Remedial Support');
  const [interventionNotes, setInterventionNotes] = useState<string>('');
  const [interventionAction, setInterventionAction] = useState<string>('Assigned peer study cohort and scheduled 1-on-1 proctor follow-up.');
  const [interventionSuccessMsg, setInterventionSuccessMsg] = useState<string | null>(null);

  // Recalculate What-If Score via API or local surrogate
  const runWhatIfCalculation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendanceRate: whatIfAttendance,
          sem1ApprovedUnits: whatIfUnitsApproved,
          sem1TotalUnits: student.sem1EnrolledUnits,
          sem1Grade: whatIfGrade,
          tuitionFeesUpToDate: whatIfFeePaid ? 1 : 0,
          scholarshipHolder: whatIfScholarship ? 1 : 0,
          ageAtEnrollment: student.ageAtEnrollment,
          debtor: whatIfFeePaid ? 0 : (student.debtor ? 1 : 0),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSimulatedRiskScore(data.riskScore);
        setSimulatedRiskLevel(data.riskLevel);
      } else {
        computeFallbackRisk();
      }
    } catch {
      computeFallbackRisk();
    } finally {
      setIsSimulating(false);
    }
  };

  const computeFallbackRisk = () => {
    let score = 50.0;
    score += (75 - whatIfAttendance) * 0.8;
    score += (4 - whatIfUnitsApproved) * 8;
    score += whatIfFeePaid ? -20 : 25;
    score += whatIfScholarship ? -15 : 5;
    score += (12 - whatIfGrade) * 2;
    const clamped = Math.min(Math.max(Math.round(score), 4), 96);
    setSimulatedRiskScore(clamped);
    setSimulatedRiskLevel(clamped >= 65 ? 'High Risk' : clamped >= 40 ? 'Medium Risk' : 'Low Risk');
  };

  useEffect(() => {
    runWhatIfCalculation();
  }, [whatIfAttendance, whatIfUnitsApproved, whatIfFeePaid, whatIfScholarship, whatIfGrade]);

  const resetWhatIf = () => {
    setWhatIfAttendance(student.attendanceRate);
    setWhatIfUnitsApproved(student.sem1ApprovedUnits);
    setWhatIfFeePaid(student.tuitionFeesUpToDate);
    setWhatIfScholarship(student.scholarshipHolder);
    setWhatIfGrade(student.sem1Grade);
  };

  const handleSaveIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    onAddIntervention({
      studentId: student.id,
      studentName: student.name,
      type: interventionCategory,
      notes: interventionNotes || 'Student counseled regarding semester progress & wellness.',
      actionTaken: interventionAction,
      counselorName: 'Dr. S. K. Sharma (CS Faculty Mentor)',
    });
    setInterventionSuccessMsg('Intervention successfully recorded in database audit log!');
    setTimeout(() => {
      setInterventionSuccessMsg(null);
      setShowInterventionModal(false);
    }, 1800);
  };

  const riskDelta = student.riskScore - simulatedRiskScore;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to At-Risk Roster</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {onAddNewStudentClick && (
            <button
              onClick={onAddNewStudentClick}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-200" />
              <span>+ Add / Register New Record</span>
            </button>
          )}
          <button
            onClick={() => setShowInterventionModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Mark as Counseled (Log Intervention)</span>
          </button>
          <button
            onClick={() => onOpenChatWithStudent(student)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Launch AI Mentor for this Student</span>
          </button>
        </div>
      </div>

      {/* Student Profile Card Header */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm transition-colors relative overflow-hidden">
        {isPersonalLogin && (
          <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Personal Student Login: {student.name} (Active Session)</span>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-md shadow-blue-600/20 shrink-0">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</h2>
                <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  {student.rollNo}
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/20">
                  Sem {student.semester}
                </span>
                {isPersonalLogin && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950 px-2 py-0.5 rounded-md font-semibold">
                    You
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                {student.course} • Enrolled at age {student.ageAtEnrollment} • Gender: {student.gender}
              </p>
            </div>
          </div>

          {/* Current Risk Badge Gauge */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-4 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
                Current Dropout Probability
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={`text-3xl font-extrabold ${student.riskScore >= 65 ? 'text-red-600 dark:text-red-400' : student.riskScore >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {student.riskScore}%
                </span>
                <span className={`text-xs font-bold uppercase ${student.riskScore >= 65 ? 'text-red-600 dark:text-red-400' : student.riskScore >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {student.riskLevel}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-xs"
              style={{
                borderColor: student.riskScore >= 65 ? '#ef4444' : student.riskScore >= 40 ? '#f59e0b' : '#10b981',
                color: student.riskScore >= 65 ? '#ef4444' : student.riskScore >= 40 ? '#f59e0b' : '#10b981'
              }}
            >
              {student.riskScore}
            </div>
          </div>
        </div>

        {/* Quick parameters ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Attendance Rate:</span>
            <p className={`font-bold ${student.attendanceRate < 75 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
              {student.attendanceRate}% {student.attendanceRate < 75 && '(Below 75%)'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Sem 1 Course Clearance:</span>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {student.sem1ApprovedUnits} of {student.sem1EnrolledUnits} units passed
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Tuition Fee Status:</span>
            <p className={`font-bold ${student.tuitionFeesUpToDate ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {student.tuitionFeesUpToDate ? 'Cleared Up-to-Date' : 'Overdue Arrears'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Scholarship Support:</span>
            <p className={`font-bold ${student.scholarshipHolder ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {student.scholarshipHolder ? 'Government Grant Holder' : 'Self-Financed'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: SHAP Explainability (Left) vs Interactive What-If Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Feature Impact Breakdown */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>SHAP Explainable Risk Contributors</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Individual Shapley feature contributions translated into actionable insights
              </p>
            </div>
            <span className="text-[11px] bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20 font-medium">
              Module 5
            </span>
          </div>

          {/* Top contributing reasons */}
          <div className="space-y-3 pt-1">
            {student.topFactors.map((factor, idx) => {
              const isNegative = factor.includes('Critical') || factor.includes('Unpaid') || factor.includes('below') || factor.includes('failure') || factor.includes('debt');
              return (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border flex items-start gap-3 ${
                    isNegative 
                      ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-900 dark:text-red-200' 
                      : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-200'
                  }`}
                >
                  <div className={`mt-0.5 p-1 rounded-full ${isNegative ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                    {isNegative ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold block text-slate-900 dark:text-slate-100">{factor}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isNegative 
                        ? 'SHAP Direction: Increases dropout likelihood (+log-odds)' 
                        : 'SHAP Direction: Protective factor, stabilizes persistence (-log-odds)'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>🎯 Recommended Faculty Action:</span>
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              {student.riskLevel === 'High Risk'
                ? 'Prioritize immediate proctor meeting. Guide to college emergency installment facility & enroll in Saturday remedial cohort for 1st sem backlog units.'
                : 'Monitor monthly attendance and encourage peer study group collaboration.'}
            </p>
          </div>
        </div>

        {/* Interactive What-If Simulator */}
        <div className="bg-white dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-5 shadow-sm space-y-4 bg-gradient-to-b from-indigo-50/50 dark:from-indigo-500/5 to-transparent transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Interactive What-If Remedial Simulator</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust parameters below to simulate how student risk drops in real time
              </p>
            </div>
            <button
              onClick={resetWhatIf}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
              title="Reset to Actual Student Values"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Real-time simulation gauge display */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                Simulated Outcome vs Actual
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {student.riskScore}%
                </span>
                <span className="text-slate-400 text-sm">→</span>
                <span className={`text-2xl font-extrabold ${simulatedRiskScore >= 65 ? 'text-red-600 dark:text-red-400' : simulatedRiskScore >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {simulatedRiskScore}% ({simulatedRiskLevel})
                </span>
              </div>
            </div>

            <div className="text-right">
              {riskDelta > 0 ? (
                <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Risk Reduced by -{riskDelta}%</span>
                </div>
              ) : riskDelta < 0 ? (
                <div className="flex items-center gap-1 text-red-700 dark:text-red-400 font-bold text-xs bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-500/20">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Risk Increased by +{Math.abs(riskDelta)}%</span>
                </div>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">Baseline level</span>
              )}
            </div>
          </div>

          {/* Interactive controls */}
          <div className="space-y-4 pt-1 text-xs">
            {/* Control 1: Attendance Slider */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Class Attendance Rate:</span>
                <span className={`font-bold ${whatIfAttendance < 75 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {whatIfAttendance}% {whatIfAttendance >= 75 ? '(Above AICTE 75% Cutoff)' : '(Warning)'}
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="1"
                value={whatIfAttendance}
                onChange={(e) => setWhatIfAttendance(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                <span>40% (Severe Absenteeism)</span>
                <span>75% Cutoff</span>
                <span>100% (Perfect)</span>
              </div>
            </div>

            {/* Control 2: Approved Units Slider */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Subjects Cleared in Sem 1:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-300">
                  {whatIfUnitsApproved} of {student.sem1EnrolledUnits} subjects
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={student.sem1EnrolledUnits}
                step="1"
                value={whatIfUnitsApproved}
                onChange={(e) => setWhatIfUnitsApproved(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                <span>0 (All Failed)</span>
                <span>{Math.floor(student.sem1EnrolledUnits / 2)} (Half)</span>
                <span>{student.sem1EnrolledUnits} (All Passed)</span>
              </div>
            </div>

            {/* Control 3 & 4: Fee Paid Toggle and Scholarship Grant Toggle */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-200 block">Tuition Fees Cleared</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Simulate aid relief</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatIfFeePaid(!whatIfFeePaid)}
                  className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
                    whatIfFeePaid ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                >
                  <span className="bg-white w-3.5 h-3.5 rounded-full shadow-md"></span>
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-200 block">Scholarship Active</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">NSP / Pragati scheme</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatIfScholarship(!whatIfScholarship)}
                  className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
                    whatIfScholarship ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                >
                  <span className="bg-white w-3.5 h-3.5 rounded-full shadow-md"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Counseling Intervention Modal */}
      {showInterventionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Log Counseling Intervention
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Record remedial counseling session into the student's audit trail
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInterventionModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {interventionSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{interventionSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveIntervention} className="space-y-4">
              {/* Student Summary Display */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Student Profile
                </label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm leading-normal">
                        {student.name} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">({student.rollNo})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {student.course} • Sem {student.semester}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                    student.riskScore >= 65 ? 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30' :
                    student.riskScore >= 40 ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30' :
                    'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                  }`}>
                    {student.riskScore}% {student.riskLevel}
                  </span>
                </div>
              </div>

              {/* Intervention Category */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Intervention Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={interventionCategory}
                  onChange={(e) => setInterventionCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                >
                  <option value="Academic Remedial Support">Academic Remedial Support (Backlog Coaching)</option>
                  <option value="Financial Aid / Scholarship Relief">Financial Aid / Scholarship Relief Application</option>
                  <option value="Attendance Warning & Counseling">Attendance Warning & Family Counseling</option>
                  <option value="Mental Health & Wellness Check">Mental Health & Wellness Referral</option>
                  <option value="Career Mentoring & Skill Development">Career Mentoring & Skill Coaching</option>
                  <option value="Peer Cohort & Study Group Pairing">Peer Cohort & Study Group Pairing</option>
                </select>
              </div>

              {/* Diagnostic Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Counselor Diagnostic Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe student's explanation for academic lapse, family context, or financial challenges..."
                  value={interventionNotes}
                  onChange={(e) => setInterventionNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Action Plan */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Prescribed Action Plan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Assigned peer study cohort and scheduled 1-on-1 proctor follow-up"
                  value={interventionAction}
                  onChange={(e) => setInterventionAction(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Counselor & Audit Info */}
              <div className="grid grid-cols-2 gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Mentor: Dr. S. K. Sharma</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInterventionModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save to Database Records</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

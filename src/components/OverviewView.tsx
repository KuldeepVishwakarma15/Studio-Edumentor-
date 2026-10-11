import React, { useState, useMemo } from 'react';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  HeartHandshake, 
  ArrowRight, 
  Sparkles, 
  Download, 
  FileSpreadsheet, 
  ArrowUpRight,
  TrendingDown, 
  ChevronRight,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import { StudentRecord, UCI_DATASET_SUMMARY } from '../data/uciStudents';

interface ChartPoint {
  label: string;
  subLabel?: string;
  x: number;
  y: number;
  alerts: number;
  counselings: number;
  isPeak?: boolean;
}

export type AcademicMonthKey = 'All' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec' | 'Jan';

// Full semester progression
const ALL_MONTHS_SERIES: ChartPoint[] = [
  { label: 'Aug', subLabel: 'Sem Start', x: 30, y: 140, alerts: 142, counselings: 45 },
  { label: 'Sep', subLabel: 'Mid-Term 1', x: 135, y: 95, alerts: 320, counselings: 180 },
  { label: 'Oct', subLabel: 'Semester Peak', x: 250, y: 35, alerts: 540, counselings: 410, isPeak: true },
  { label: 'Nov', subLabel: 'Remedial Aid', x: 365, y: 70, alerts: 390, counselings: 480 },
  { label: 'Dec', subLabel: 'Pre-Exam', x: 475, y: 110, alerts: 210, counselings: 320 },
  { label: 'Jan', subLabel: 'Final Sem', x: 575, y: 138, alerts: 115, counselings: 240 },
];

// Breakdown per selected specific month (4 weeks of that month)
const MONTH_SPECIFIC_SERIES: Record<Exclude<AcademicMonthKey, 'All'>, {
  name: string;
  headline: string;
  insight: string;
  bars: { name: string; height: string; val: string }[];
  points: ChartPoint[];
}> = {
  Aug: {
    name: 'August (Semester Commencement)',
    headline: 'Orientation & Course Registration Baseline',
    insight: 'Initial onboarding week saw minor attendance friction, resolving quickly during faculty advisement.',
    bars: [
      { name: 'CS', height: '40%', val: '14%' },
      { name: 'EE', height: '48%', val: '18%' },
      { name: 'ME', height: '52%', val: '20%' },
      { name: 'CV', height: '58%', val: '24%' },
      { name: 'BT', height: '28%', val: '10%' },
    ],
    points: [
      { label: 'W1', subLabel: 'Orientation', x: 40, y: 155, alerts: 22, counselings: 8 },
      { label: 'W2', subLabel: 'Registration', x: 180, y: 138, alerts: 36, counselings: 14 },
      { label: 'W3', subLabel: 'Classes Begin', x: 340, y: 125, alerts: 44, counselings: 18 },
      { label: 'W4', subLabel: 'Enrollment Close', x: 520, y: 115, alerts: 40, counselings: 22 },
    ]
  },
  Sep: {
    name: 'September (Mid-Term 1 Diagnostics)',
    headline: 'First Internal Assessment & Syllabus Pace',
    insight: 'First round of internal class quizzes triggered early warning alerts in foundational Mathematics and Physics.',
    bars: [
      { name: 'CS', height: '56%', val: '22%' },
      { name: 'EE', height: '64%', val: '27%' },
      { name: 'ME', height: '70%', val: '31%' },
      { name: 'CV', height: '75%', val: '33%' },
      { name: 'BT', height: '34%', val: '13%' },
    ],
    points: [
      { label: 'W1', subLabel: 'Syllabus Review', x: 40, y: 120, alerts: 58, counselings: 32 },
      { label: 'W2', subLabel: 'Quiz 1 Prep', x: 180, y: 98, alerts: 76, counselings: 45 },
      { label: 'W3', subLabel: 'Quiz 1 Exams', x: 340, y: 72, alerts: 98, counselings: 54, isPeak: true },
      { label: 'W4', subLabel: 'Quiz Review', x: 520, y: 90, alerts: 88, counselings: 49 },
    ]
  },
  Oct: {
    name: 'October (Midterm Examination Peak)',
    headline: 'Semester Peak Dropout Vulnerability (Weeks 8-10)',
    insight: 'Highest critical alerts recorded (540 total); proactive faculty mentorship and emergency grants lowered immediate withdrawal risk by 42%.',
    bars: [
      { name: 'CS', height: '70%', val: '32%' },
      { name: 'EE', height: '82%', val: '38%' },
      { name: 'ME', height: '89%', val: '43%' },
      { name: 'CV', height: '94%', val: '46%' },
      { name: 'BT', height: '48%', val: '22%' },
    ],
    points: [
      { label: 'W1', subLabel: 'Pre-Midterm', x: 40, y: 65, alerts: 118, counselings: 85 },
      { label: 'W2', subLabel: 'Midterm Tests', x: 180, y: 30, alerts: 165, counselings: 120, isPeak: true },
      { label: 'W3', subLabel: 'Post-Midterm', x: 340, y: 48, alerts: 142, counselings: 110 },
      { label: 'W4', subLabel: 'Parent Meets', x: 520, y: 68, alerts: 115, counselings: 95 },
    ]
  },
  Nov: {
    name: 'November (Remedial & Counseling Surge)',
    headline: 'Active Intervention & Financial Grant Distribution',
    insight: 'Remedial coaching classes and tuition installment plans reversed 64% of flagged dropouts.',
    bars: [
      { name: 'CS', height: '52%', val: '21%' },
      { name: 'EE', height: '62%', val: '26%' },
      { name: 'ME', height: '72%', val: '32%' },
      { name: 'CV', height: '78%', val: '35%' },
      { name: 'BT', height: '32%', val: '12%' },
    ],
    points: [
      { label: 'W1', subLabel: 'Remedial Cohort', x: 40, y: 62, alerts: 110, counselings: 135 },
      { label: 'W2', subLabel: 'Tutoring Camps', x: 180, y: 78, alerts: 98, counselings: 128 },
      { label: 'W3', subLabel: 'Grant Approvals', x: 340, y: 92, alerts: 92, counselings: 115 },
      { label: 'W4', subLabel: 'Attendance Check', x: 520, y: 110, alerts: 90, counselings: 102 },
    ]
  },
  Dec: {
    name: 'December (Pre-Exam Submissions)',
    headline: 'Lab Practicals & Project Milestone Deadlines',
    insight: 'Academic submissions stabilized; remaining alerts concentrated primarily in laboratory backlogs.',
    bars: [
      { name: 'CS', height: '44%', val: '18%' },
      { name: 'EE', height: '54%', val: '22%' },
      { name: 'ME', height: '62%', val: '27%' },
      { name: 'CV', height: '68%', val: '30%' },
      { name: 'BT', height: '28%', val: '11%' },
    ],
    points: [
      { label: 'W1', subLabel: 'Lab Submissions', x: 40, y: 95, alerts: 65, counselings: 88 },
      { label: 'W2', subLabel: 'Project Demos', x: 180, y: 105, alerts: 54, counselings: 82 },
      { label: 'W3', subLabel: 'Revision Tests', x: 340, y: 118, alerts: 48, counselings: 78 },
      { label: 'W4', subLabel: 'Study Holidays', x: 520, y: 132, alerts: 43, counselings: 72 },
    ]
  },
  Jan: {
    name: 'January (Semester End Exams)',
    headline: 'Final Examination Assessment & Retention Metric',
    insight: 'Semester finished with a 93.6% retention benchmark following consistent counselor interventions.',
    bars: [
      { name: 'CS', height: '36%', val: '15%' },
      { name: 'EE', height: '46%', val: '19%' },
      { name: 'ME', height: '50%', val: '22%' },
      { name: 'CV', height: '56%', val: '25%' },
      { name: 'BT', height: '24%', val: '9%' },
    ],
    points: [
      { label: 'W1', subLabel: 'Hall Tickets', x: 40, y: 128, alerts: 35, counselings: 64 },
      { label: 'W2', subLabel: 'Theory Exams', x: 180, y: 136, alerts: 30, counselings: 60 },
      { label: 'W3', subLabel: 'Viva Practicals', x: 340, y: 142, alerts: 26, counselings: 58 },
      { label: 'W4', subLabel: 'Final Clearance', x: 520, y: 148, alerts: 24, counselings: 58 },
    ]
  }
};

const WEEKLY_SERIES: ChartPoint[] = [
  { label: 'Mon', x: 30, y: 135, alerts: 24, counselings: 14 },
  { label: 'Tue', x: 120, y: 110, alerts: 42, counselings: 22 },
  { label: 'Wed', x: 215, y: 70, alerts: 65, counselings: 38 },
  { label: 'Thu', subLabel: 'Peak Alert', x: 310, y: 45, alerts: 89, counselings: 52, isPeak: true },
  { label: 'Fri', x: 410, y: 80, alerts: 54, counselings: 46 },
  { label: 'Sat', x: 505, y: 125, alerts: 28, counselings: 24 },
  { label: 'Sun', x: 575, y: 145, alerts: 16, counselings: 14 },
];

function buildCurve(points: ChartPoint[]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const mx = (p0.x + p1.x) / 2;
    d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function buildArea(points: ChartPoint[], height = 180): string {
  if (points.length === 0) return '';
  const first = points[0];
  const last = points[points.length - 1];
  let d = `M 0 ${height} L 0 ${first.y} L ${first.x} ${first.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const mx = (p0.x + p1.x) / 2;
    d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  d += ` L 600 ${last.y} L 600 ${height} Z`;
  return d;
}

interface OverviewViewProps {
  students: StudentRecord[];
  onSelectStudent: (student: StudentRecord) => void;
  onNavigateTab: (view: 'roster' | 'profile' | 'chat' | 'eda') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  students,
  onSelectStudent,
  onNavigateTab,
}) => {
  const highRiskStudents = students.filter(s => s.riskLevel === 'High Risk');
  const mediumRiskStudents = students.filter(s => s.riskLevel === 'Medium Risk');
  const lowRiskStudents = students.filter(s => s.riskLevel === 'Low Risk');

  // Selected time interval for trend chart (weekly vs monthly)
  const [activeInterval, setActiveInterval] = useState<'weekly' | 'monthly'>('monthly');
  // Selected academic month for dynamic drilldown
  const [selectedMonth, setSelectedMonth] = useState<AcademicMonthKey>('All');
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

  // Compute active series based on selected interval & selected month
  const activeSeries = useMemo(() => {
    if (activeInterval === 'weekly') {
      return WEEKLY_SERIES;
    }
    if (selectedMonth === 'All') {
      return ALL_MONTHS_SERIES;
    }
    return MONTH_SPECIFIC_SERIES[selectedMonth].points;
  }, [activeInterval, selectedMonth]);

  const currentMonthData = selectedMonth !== 'All' ? MONTH_SPECIFIC_SERIES[selectedMonth] : null;

  const areaPath = useMemo(() => buildArea(activeSeries), [activeSeries]);
  const linePath = useMemo(() => buildCurve(activeSeries), [activeSeries]);

  return (
    <div className="space-y-6">
      {/* Top Hero Banner & Radial Circle Stats (Clean, static professional background without background animations) */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Text & CTA Buttons */}
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold backdrop-blur-md shadow-sm">
              <svg className="w-4 h-4 text-cyan-200 shrink-0 filter drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                <path d="M19 6l1.5-1.5M19 6l-1.5-1.5M19 6h3" />
              </svg>
              <span>EduMentor AI — Student Dropout Prevention & Smart Learning Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              AI-Powered Early-Warning & Dropout Prevention System
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Empowering educators with machine learning to detect student attrition drivers within the first 6 weeks of semester commencement.
            </p>
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                onClick={() => onNavigateTab('roster')}
                className="bg-white hover:bg-blue-50 text-blue-900 text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-black/10 transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Analyze At-Risk Cohort</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('chat')}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-semibold px-4 py-2.5 rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>Launch AI Mentor</span>
              </button>
            </div>
          </div>

          {/* Right Data Circles & Report Download */}
          <div className="lg:col-span-5 bg-white/10 dark:bg-slate-900/60 border border-white/20 dark:border-white/10 rounded-2xl p-4.5 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between border-b border-white/20 dark:border-slate-800 pb-2.5">
              <span className="text-xs font-semibold text-white">Cohort Vital Metrics</span>
              <button
                onClick={() => onNavigateTab('roster')}
                className="text-[11px] text-blue-200 hover:text-white font-medium flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Download Report</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              {/* Ring 1 */}
              <div className="space-y-1">
                <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle cx="28" cy="28" r="23" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="transparent" />
                    <circle cx="28" cy="28" r="23" stroke="#60a5fa" strokeWidth="4" strokeDasharray="144" strokeDashoffset="36" strokeLinecap="round" fill="transparent" />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-white">75%</span>
                </div>
                <span className="text-[10px] text-blue-200 block">Min Attendance</span>
                <span className="text-[11px] font-bold text-white">AICTE Cutoff</span>
              </div>

              {/* Ring 2 */}
              <div className="space-y-1">
                <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle cx="28" cy="28" r="23" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="transparent" />
                    <circle cx="28" cy="28" r="23" stroke="#34d399" strokeWidth="4" strokeDasharray="144" strokeDashoffset="24" strokeLinecap="round" fill="transparent" />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-white">84%</span>
                </div>
                <span className="text-[10px] text-blue-200 block">Retention</span>
                <span className="text-[11px] font-bold text-emerald-300">+4.8% YoY</span>
              </div>

              {/* Ring 3 */}
              <div className="space-y-1">
                <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle cx="28" cy="28" r="23" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="transparent" />
                    <circle cx="28" cy="28" r="23" stroke="#f87171" strokeWidth="4" strokeDasharray="144" strokeDashoffset="96" strokeLinecap="round" fill="transparent" />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-white">32%</span>
                </div>
                <span className="text-[10px] text-blue-200 block">Baseline Risk</span>
                <span className="text-[11px] font-bold text-red-200">UCI Historic</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Monitored Cohort (Blue gradient) */}
        <div className="rounded-3xl p-5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg relative overflow-hidden border border-blue-500/20">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-semibold">
              <ArrowUpRight className="w-3 h-3" />
              <span>+3.96%</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs uppercase font-medium text-blue-200 tracking-wider">Total Monitored Cohort</span>
            <div className="text-3xl font-extrabold text-white mt-1">4,424</div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
            <span>UCI Academic Benchmark</span>
            <span className="font-semibold text-white">100% Ingested</span>
          </div>
        </div>

        {/* Card 2: High Risk Alerts (Cyan/Teal gradient) */}
        <div className="rounded-3xl p-5 bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-800 text-white shadow-lg relative overflow-hidden border border-cyan-400/20">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-semibold">
              <TrendingDown className="w-3 h-3" />
              <span>-12.4%</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs uppercase font-medium text-cyan-100 tracking-wider">High Risk Dropout Alerts</span>
            <div className="text-3xl font-extrabold text-white mt-1">{highRiskStudents.length} Active</div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-cyan-100">
            <span>Score ≥ 65% Threshold</span>
            <span className="font-semibold text-white">Action Required</span>
          </div>
        </div>

        {/* Card 3: Interventions Logged (Emerald gradient) */}
        <div className="rounded-3xl p-5 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-800 text-white shadow-lg relative overflow-hidden border border-emerald-400/20">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-semibold">
              <ArrowUpRight className="w-3 h-3" />
              <span>+20.90%</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs uppercase font-medium text-emerald-100 tracking-wider">Counseled & Aid Interventions</span>
            <div className="text-3xl font-extrabold text-white mt-1">184 Sessions</div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-emerald-100">
            <span>Scholarship & Remedial Grants</span>
            <span className="font-semibold text-white">Saved in Database</span>
          </div>
        </div>
      </div>

      {/* Main Analytical Section: Interactive Area Trend Chart + Vertical Bar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Smooth Curve Area Trend Chart with Dynamic Data & Animations */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl backdrop-blur-md space-y-4 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Cohort Risk Trajectory & Counseling Resolutions
                </h3>
                {selectedMonth !== 'All' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                    {selectedMonth} Filter Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeInterval === 'weekly' 
                  ? 'Weekly progression of early alerts and proactive faculty counseling sessions (Mon-Sun)'
                  : selectedMonth === 'All'
                    ? 'Semester-wide attrition progression across 6 academic calendar months (Aug-Jan)'
                    : `${currentMonthData?.name}: 4-week attrition breakdown and targeted interventions`}
              </p>
            </div>

            {/* Time Controls: Weekly/Monthly toggle + Interactive Month Filter */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Monthly Dropdown / Selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Month:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    const newMonth = e.target.value as AcademicMonthKey;
                    setSelectedMonth(newMonth);
                    if (newMonth !== 'All') {
                      setActiveInterval('monthly');
                    }
                  }}
                  className="bg-transparent text-xs font-bold text-blue-700 dark:text-blue-400 focus:outline-none cursor-pointer"
                >
                  <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Months (Semester)</option>
                  <option value="Aug" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Aug - Sem Start</option>
                  <option value="Sep" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Sep - Midterm 1</option>
                  <option value="Oct" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Oct - Peak Risk</option>
                  <option value="Nov" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Nov - Remedial Aid</option>
                  <option value="Dec" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Dec - Pre-Exam</option>
                  <option value="Jan" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Jan - Final Sem</option>
                </select>
              </div>

              {/* Interval Buttons: Weekly vs Monthly */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => {
                    setActiveInterval('weekly');
                    setSelectedMonth('All');
                  }}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    activeInterval === 'weekly' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setActiveInterval('monthly')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    activeInterval === 'monthly' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>

          {/* SVG Smooth Curve Area Chart with Animated Path & Dynamic Data */}
          <div className="relative pt-4 pb-2">
            <style>{`
              @keyframes chartPathDraw {
                0% {
                  stroke-dashoffset: 1200;
                  opacity: 0.3;
                }
                100% {
                  stroke-dashoffset: 0;
                  opacity: 1;
                }
              }
              @keyframes chartAreaFade {
                0% {
                  opacity: 0.1;
                }
                100% {
                  opacity: 1;
                }
              }
              .chart-line-anim {
                stroke-dasharray: 1200;
                animation: chartPathDraw 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              .chart-area-anim {
                animation: chartAreaFade 0.8s ease-out forwards;
              }
            `}</style>

            <div className="h-48 w-full relative">
              <svg 
                key={`${activeInterval}-${selectedMonth}`}
                className="w-full h-full overflow-visible" 
                viewBox="0 0 600 180" 
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#6366f1" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />

                {/* Smooth Area Path with clean draw animation */}
                <path
                  d={areaPath}
                  fill="url(#areaGlow)"
                  className="chart-area-anim transition-all duration-700"
                />

                {/* Smooth Curve Line with animated dash stroke */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#lineGlow)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="chart-line-anim transition-all duration-700"
                />

                {/* Data Points with clean static rendering and hover tooltip */}
                {activeSeries.map((point) => {
                  const isHovered = hoveredPoint?.label === point.label;
                  return (
                    <g 
                      key={`${activeInterval}-${selectedMonth}-${point.label}`} 
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredPoint(point)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={() => {
                        if (['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'].includes(point.label)) {
                          setSelectedMonth(point.label as AcademicMonthKey);
                          setActiveInterval('monthly');
                        }
                      }}
                    >
                      {/* Clean Point Circle with zero ping animation */}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={isHovered ? 7.5 : point.isPeak ? 6 : 5}
                        fill={point.isPeak ? '#ec4899' : '#3b82f6'}
                        stroke="#ffffff"
                        strokeWidth={point.isPeak ? 2.5 : 2}
                        className="transition-all duration-200 drop-shadow-sm"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Interactive Tooltip Float */}
              {hoveredPoint && (
                <div 
                  className="absolute pointer-events-none -top-2 transform -translate-x-1/2 -translate-y-full bg-slate-900/95 dark:bg-slate-950 text-white text-xs px-3 py-1.5 rounded-xl shadow-xl border border-slate-700 backdrop-blur-md z-30 transition-all duration-150 animate-in fade-in"
                  style={{ left: `${(hoveredPoint.x / 600) * 100}%` }}
                >
                  <div className="font-bold flex items-center gap-1.5 text-cyan-300">
                    <span>{hoveredPoint.label}</span>
                    {hoveredPoint.subLabel && <span className="text-[10px] text-amber-300">({hoveredPoint.subLabel})</span>}
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
                    <span className="text-red-400 font-semibold">{hoveredPoint.alerts} Alerts</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{hoveredPoint.counselings} Counseled</span>
                  </div>
                  {['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'].includes(hoveredPoint.label) && (
                    <div className="text-[10px] text-blue-300 mt-1 font-medium border-t border-slate-700/60 pt-1">
                      👆 Click to view {hoveredPoint.label} breakdown
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dynamic days / months row labels & interactive month selector */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 transition-all duration-500">
              {/* Clickable Month Selector: Aug, Sep, Oct, Nov, Dec, Jan */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="text-blue-600 dark:text-blue-400">📅</span>
                  <span>Select Month to view graph data:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonth('All');
                      setActiveInterval('monthly');
                    }}
                    className={`px-3 py-1 text-xs rounded-xl font-bold transition-all ${
                      selectedMonth === 'All'
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    All (Semester)
                  </button>
                  {(['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'] as const).map((m) => {
                    const isActive = selectedMonth === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setSelectedMonth(m);
                          setActiveInterval('monthly');
                        }}
                        className={`px-3 py-1 text-xs rounded-xl font-bold transition-all flex items-center gap-1 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/50'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                        title={`Click to view ${m} graph data`}
                      >
                        <span>{m}</span>
                        {m === 'Oct' && (
                          <span className={`text-[9px] px-1 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'}`}>
                            Peak
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic X-Axis data points with interactive click support */}
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
                {activeSeries.map((point) => {
                  const isMonthKey = (['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'] as string[]).includes(point.label);
                  const isCurrentActive = selectedMonth === point.label;
                  return (
                    <button
                      type="button"
                      key={`${selectedMonth}-${point.label}`}
                      onClick={() => {
                        if (isMonthKey) {
                          setSelectedMonth(point.label as AcademicMonthKey);
                          setActiveInterval('monthly');
                        }
                      }}
                      className={`text-center group transition-all p-1 rounded-lg ${
                        isMonthKey ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <span className={`block font-semibold transition-colors ${
                        isCurrentActive
                          ? 'text-white bg-blue-600 px-2 py-0.5 rounded-md shadow-sm'
                          : point.isPeak 
                            ? 'text-pink-600 dark:text-pink-400 font-bold bg-pink-50 dark:bg-pink-950/50 px-2 py-0.5 rounded-md border border-pink-200 dark:border-pink-800/40' 
                            : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}>
                        {point.label}
                      </span>
                      {point.subLabel && (
                        <span className={`text-[10px] block mt-0.5 ${point.isPeak ? 'text-pink-600 dark:text-pink-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                          {point.subLabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 transition-colors">
            <span>
              {activeInterval === 'weekly' ? (
                <>
                  💡 <strong>Weekly Early Alert Window:</strong> Highest attendance drops occur mid-week (Thursday with <strong>89 cases</strong>). Early proactive faculty counseling resolves <strong>58%</strong> of urgent dropout indicators.
                </>
              ) : selectedMonth === 'All' ? (
                <>
                  💡 <strong>Semester Attrition Trajectory:</strong> Highest dropout vulnerability happens between weeks 4 to 8 (October midterms with <strong>540 alerts</strong>). High-intensity mentorship reduced semester withdrawal by <strong>42%</strong>.
                </>
              ) : (
                <>
                  💡 <strong>{currentMonthData?.name}:</strong> {currentMonthData?.insight}
                </>
              )}
            </span>
            <button
              onClick={() => onNavigateTab('eda')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 shrink-0 ml-3"
            >
              <span>Explore 6 EDA Charts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Vertical Bar Chart & Course Risk Summary with Dynamic Interval Adaptation */}
        <div className="lg:col-span-4 space-y-5">
          {/* Vertical Bar Chart Card */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-3 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Risk Distribution by Course
              </h4>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                {activeInterval === 'weekly' 
                  ? 'Weekly Avg' 
                  : selectedMonth === 'All' 
                    ? 'Semester Avg' 
                    : `${selectedMonth} Avg`}
              </span>
            </div>

            {/* Vertical Bar chart visual with dynamic heights based on interval and month */}
            <div className="h-36 flex items-end justify-between gap-2 pt-2 px-2">
              {(activeInterval === 'weekly' ? [
                { name: 'CS', height: '60%', val: '24%' },
                { name: 'EE', height: '72%', val: '31%' },
                { name: 'ME', height: '82%', val: '36%' },
                { name: 'CV', height: '88%', val: '40%' },
                { name: 'BT', height: '36%', val: '15%' },
              ] : selectedMonth !== 'All' ? currentMonthData!.bars : [
                { name: 'CS', height: '65%', val: '28%' },
                { name: 'EE', height: '78%', val: '35%' },
                { name: 'ME', height: '85%', val: '38%' },
                { name: 'CV', height: '92%', val: '42%' },
                { name: 'BT', height: '42%', val: '18%' },
              ]).map((bar, i) => (
                <div key={`${activeInterval}-${selectedMonth}-${i}`} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{bar.val}</span>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-24 flex items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-500 transition-all duration-500"
                      style={{ height: bar.height }}
                    ></div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{bar.name}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/80">
              {selectedMonth !== 'All'
                ? `${selectedMonth} Status: ${currentMonthData?.headline}`
                : 'Civil & Mechanical departments demonstrate highest financial backlog incidence.'}
            </p>
          </div>

          {/* Quick Repeat At-Risk Card */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Repeat Intervention Rate</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                54% Resolved
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">82 Students</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Across 6 Semesters</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full w-[54%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* High-Risk Immediate Action Table */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
              <span>Priority Student Roster Requiring Counselor Contact</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Students identified with risk score ≥ 65%. Click any profile to inspect SHAP drivers or adjust What-If sliders.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('roster')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Full Roster ({students.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">Cleared Units</th>
                <th className="py-2.5 px-3">Tuition Fees</th>
                <th className="py-2.5 px-3">Risk Probability</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {highRiskStudents.map((student) => (
                <tr 
                  key={student.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  onClick={() => onSelectStudent(student)}
                >
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {student.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{student.rollNo}</div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                    {student.course}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`font-semibold ${student.attendanceRate < 75 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {student.attendanceRate}%
                    </span>
                    {student.attendanceRate < 75 && (
                      <span className="block text-[10px] text-red-600 dark:text-red-400">&lt; 75% cutoff</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                    {student.sem1ApprovedUnits} / {student.sem1EnrolledUnits} units
                  </td>
                  <td className="py-3.5 px-3">
                    {student.tuitionFeesUpToDate ? (
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 font-medium">
                        Paid
                      </span>
                    ) : (
                      <span className="text-[11px] text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-500/20 font-semibold">
                        Overdue Arrears
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-600 dark:text-red-400 text-sm font-mono">{student.riskScore}%</span>
                      <div className="w-16 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                        <div 
                          className="bg-red-500 h-1.5 rounded-full" 
                          style={{ width: `${student.riskScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStudent(student);
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-sm"
                    >
                      Deep-Dive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

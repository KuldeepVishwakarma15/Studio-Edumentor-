import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown, 
  Sparkles, 
  Sliders, 
  HeartHandshake, 
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { StudentRecord } from '../data/uciStudents';

interface AtRiskRosterViewProps {
  students: StudentRecord[];
  onSelectStudent: (student: StudentRecord) => void;
  onOpenChatWithStudent: (student: StudentRecord) => void;
  onAddNewStudentClick?: () => void;
}

export const AtRiskRosterView: React.FC<AtRiskRosterViewProps> = ({
  students,
  onSelectStudent,
  onOpenChatWithStudent,
  onAddNewStudentClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High Risk' | 'Medium Risk' | 'Low Risk'>('All');
  const [courseFilter, setCourseFilter] = useState<string>('All');
  const [feeFilter, setFeeFilter] = useState<'All' | 'Paid' | 'Overdue'>('All');

  // Filter students based on search and criteria
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = riskFilter === 'All' || student.riskLevel === riskFilter;
    const matchesCourse = courseFilter === 'All' || student.course === courseFilter;
    const matchesFee = 
      feeFilter === 'All' ||
      (feeFilter === 'Paid' && student.tuitionFeesUpToDate) ||
      (feeFilter === 'Overdue' && !student.tuitionFeesUpToDate);

    return matchesSearch && matchesRisk && matchesCourse && matchesFee;
  });

  const coursesList = Array.from(new Set(students.map(s => s.course)));

  // CSV Export Functionality
  const handleExportCSV = () => {
    const headers = [
      'Roll No',
      'Name',
      'Gender',
      'Age',
      'Course',
      'Attendance Rate (%)',
      'Sem1 Units Approved',
      'Sem1 Units Enrolled',
      'Sem1 Grade (0-20)',
      'Tuition Fees Paid',
      'Scholarship Holder',
      'Risk Score (%)',
      'Risk Level',
      'Interventions Count'
    ];

    const rows = filteredStudents.map(s => [
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.gender}"`,
      s.ageAtEnrollment,
      `"${s.course}"`,
      s.attendanceRate,
      s.sem1ApprovedUnits,
      s.sem1EnrolledUnits,
      s.sem1Grade,
      s.tuitionFeesUpToDate ? 'Yes' : 'No',
      s.scholarshipHolder ? 'Yes' : 'No',
      s.riskScore,
      `"${s.riskLevel}"`,
      s.interventionsCount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bharat_cares_student_risk_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* View Header with Title and CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Student Risk Cohort Roster</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sortable, filterable student roster with real-time risk classification, attendance metrics, and intervention tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onAddNewStudentClick && (
            <button
              onClick={onAddNewStudentClick}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
              title="Add New Student / Self-Register"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Student Record</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            title="Download CSV for Departmental Review"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm space-y-3 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer w-full"
            >
              <option value="All" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Risk Levels</option>
              <option value="High Risk" className="bg-white dark:bg-slate-800 text-red-600 dark:text-red-400">High Risk (≥65%)</option>
              <option value="Medium Risk" className="bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400">Medium Risk (40-64%)</option>
              <option value="Low Risk" className="bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">Low Risk (&lt;40%)</option>
            </select>
          </div>

          {/* Course Department Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Branch:</span>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer w-full text-ellipsis overflow-hidden whitespace-nowrap"
            >
              <option value="All" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Branches / Courses</option>
              {coursesList.map(c => (
                <option key={c} value={c} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{c}</option>
              ))}
            </select>
          </div>

          {/* Tuition Fee Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Fees:</span>
            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value as any)}
              className="bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer w-full"
            >
              <option value="All" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Fee Status</option>
              <option value="Overdue" className="bg-white dark:bg-slate-800 text-red-600 dark:text-red-400">Overdue / Arrears</option>
              <option value="Paid" className="bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">Paid Up to Date</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Tags */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700/50">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredStudents.length}</strong> of {students.length} students
          </span>
          {(searchTerm || riskFilter !== 'All' || courseFilter !== 'All' || feeFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRiskFilter('All');
                setCourseFilter('All');
                setFeeFilter('All');
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-[11px]"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Student Records Table */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Student & Roll No</th>
                <th className="py-3 px-3">Course / Branch</th>
                <th className="py-3 px-3">Attendance</th>
                <th className="py-3 px-3">1st Sem Units</th>
                <th className="py-3 px-3">Grade Index</th>
                <th className="py-3 px-3">Fee Status</th>
                <th className="py-3 px-3">Scholarship</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                    No students match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isHigh = student.riskLevel === 'High Risk';
                  const isMedium = student.riskLevel === 'Medium Risk';
                  
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectStudent(student)}
                    >
                      {/* Name & Roll No */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {student.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <span>{student.rollNo}</span>
                          <span>•</span>
                          <span>Age {student.ageAtEnrollment}</span>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {student.course}
                      </td>

                      {/* Attendance */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${student.attendanceRate < 75 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                            {student.attendanceRate}%
                          </span>
                          {student.attendanceRate < 75 && (
                            <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                          )}
                        </div>
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1 mt-1">
                          <div
                            className={`h-1 rounded-full ${student.attendanceRate < 75 ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${student.attendanceRate}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* 1st Sem Units Passed */}
                      <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                        <span className={`font-semibold ${student.sem1ApprovedUnits < 4 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-200'}`}>
                          {student.sem1ApprovedUnits}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500"> / {student.sem1EnrolledUnits} units</span>
                      </td>

                      {/* Grade */}
                      <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-mono">
                        {student.sem1Grade.toFixed(1)} / 20
                      </td>

                      {/* Fees */}
                      <td className="py-3.5 px-3">
                        {student.tuitionFeesUpToDate ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/20 font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            Overdue
                          </span>
                        )}
                      </td>

                      {/* Scholarship */}
                      <td className="py-3.5 px-3">
                        {student.scholarshipHolder ? (
                          <span className="text-[11px] text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20 font-medium">
                            Active Grant
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            Self-funded
                          </span>
                        )}
                      </td>

                      {/* Risk Score */}
                      <td className="py-3.5 px-3">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${
                          isHigh 
                            ? 'bg-red-50 dark:bg-red-500/15 border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-400' 
                            : isMedium 
                            ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-400' 
                            : 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-red-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          {student.riskScore}% {isHigh ? 'High' : isMedium ? 'Medium' : 'Low'}
                        </div>
                      </td>

                      {/* Quick Action buttons */}
                      <td className="py-3.5 px-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition-colors shadow-sm"
                          title="Open Student Profile, SHAP Analysis & What-If Simulator"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenChatWithStudent(student)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg transition-colors shadow-sm"
                          title="Open AI Mentor Chat with this Student's Context"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

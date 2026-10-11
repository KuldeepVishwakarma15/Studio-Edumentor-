/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { OverviewView } from './components/OverviewView';
import { AtRiskRosterView } from './components/AtRiskRosterView';
import { StudentProfileView } from './components/StudentProfileView';
import { AIMentorChatView } from './components/AIMentorChatView';
import { EDAStudioView } from './components/EDAStudioView';
import { AddStudentRecordModal } from './components/AddStudentRecordModal';
import { SAMPLE_STUDENTS, StudentRecord } from './data/uciStudents';
import { 
  LayoutDashboard, 
  Users, 
  Sliders, 
  Sparkles, 
  BarChart2, 
  User, 
  GraduationCap, 
  Menu, 
  X,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'eda' | 'profile' | 'chat'>('overview');
  const [userRole, setUserRole] = useState<'teacher' | 'admin' | 'student'>('teacher');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState<boolean>(false);
  
  // Menu In / Out (Sidebar Expand / Collapse) State
  const [isMenuOut, setIsMenuOut] = useState<boolean>(() => {
    const saved = localStorage.getItem('bharat_cares_menu_out');
    return saved !== null ? saved === 'true' : true;
  });

  // Dark & Light Mode State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('bharat_cares_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  // Apply theme to html root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('bharat_cares_theme', theme);
  }, [theme]);

  // Persist Menu in/out preference
  const toggleMenuInOut = () => {
    setIsMenuOut(prev => {
      const next = !prev;
      localStorage.setItem('bharat_cares_menu_out', String(next));
      return next;
    });
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Student roster state (with persistent custom self-registered students)
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('edumentor_custom_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...SAMPLE_STUDENTS];
        }
      }
    } catch (e) {
      console.error('Failed to load custom students', e);
    }
    return SAMPLE_STUDENTS;
  });

  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(() => {
    try {
      const savedId = localStorage.getItem('edumentor_active_student_id');
      const savedCustom = localStorage.getItem('edumentor_custom_students');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const found = parsed.find((s: any) => s.id === savedId) || parsed[0];
          if (found) return found;
        }
      }
      if (savedId) {
        const found = SAMPLE_STUDENTS.find(s => s.id === savedId);
        if (found) return found;
      }
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_STUDENTS[0];
  });

  // Handle adding new student record from self-registration modal
  const handleAddNewStudent = (newStudent: StudentRecord) => {
    setStudents(prev => {
      const updated = [newStudent, ...prev.filter(s => s.id !== newStudent.id)];
      const customStudents = updated.filter(s => !SAMPLE_STUDENTS.some(orig => orig.id === s.id));
      localStorage.setItem('edumentor_custom_students', JSON.stringify(customStudents));
      return updated;
    });
    setSelectedStudent(newStudent);
    localStorage.setItem('edumentor_active_student_id', newStudent.id);
    setUserRole('student');
    setActiveTab('profile');
  };

  // Handle student selection from table or card
  const handleSelectStudent = (student: StudentRecord) => {
    setSelectedStudent(student);
    localStorage.setItem('edumentor_active_student_id', student.id);
    setActiveTab('profile');
  };

  // Jump directly to AI Mentor with selected student context
  const handleOpenChatWithStudent = (student: StudentRecord) => {
    setSelectedStudent(student);
    localStorage.setItem('edumentor_active_student_id', student.id);
    setActiveTab('chat');
  };

  // Add recorded intervention
  const handleAddIntervention = (intervention: {
    studentId: string;
    studentName: string;
    type: string;
    notes: string;
    actionTaken: string;
    counselorName: string;
  }) => {
    fetch('/api/interventions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intervention),
    }).catch(err => console.error('Failed to log intervention to backend:', err));

    setStudents(prev =>
      prev.map(s => {
        if (s.id === intervention.studentId) {
          return {
            ...s,
            interventionsCount: s.interventionsCount + 1,
            lastCounseledDate: new Date().toISOString().split('T')[0],
            notes: intervention.notes,
          };
        }
        return s;
      })
    );
  };

  const handleRoleChange = (role: 'teacher' | 'admin' | 'student') => {
    setUserRole(role);
    if (role === 'student') {
      if (!selectedStudent) {
        setSelectedStudent(students[0] || SAMPLE_STUDENTS[0]);
      }
      setActiveTab('profile');
    }
  };

  const highRiskCount = students.filter(s => s.riskLevel === 'High Risk').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col md:flex-row font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      
      {/* Mobile Top Header (Only on mobile screens, preserving original desktop dashboard size) */}
      <div className="md:hidden bg-white/95 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between z-40 sticky top-0 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 ring-2 ring-white/20 relative group shrink-0">
            <GraduationCap className="w-4 h-4 text-white" />
            <Sparkles className="w-2.5 h-2.5 text-cyan-300 absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white">EduMentor AI</h1>
            <span className="text-[10px] text-blue-600 dark:text-blue-400">Dropout Prevention & Learning</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            title="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>
          {/* Mobile Menu Drawer Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sleek Modern Left Sidebar (Original full-height layout with Menu In/Out & Theme toggles) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white/95 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800/80 p-4 sm:p-5 flex flex-col justify-between backdrop-blur-xl transition-all duration-300 ease-in-out
        md:translate-x-0 md:static ${isMenuOut ? 'w-64 lg:w-72' : 'w-20'}
        ${mobileMenuOpen ? 'translate-x-0 !w-72' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-5">
          {/* User Profile Card at Top of Sidebar */}
          {isMenuOut ? (
            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center relative overflow-hidden shadow-xs transition-colors">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 mx-auto p-0.5 shadow-lg shadow-blue-500/20">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-lg text-white">
                  {userRole === 'student' 
                    ? (selectedStudent?.name ? selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ST')
                    : userRole === 'admin' ? 'RS' : 'SK'}
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {userRole === 'student' 
                    ? (selectedStudent?.name || 'Student') 
                    : userRole === 'admin' ? 'Prof. R. Sen' : 'Dr. S. K. Sharma'}
                </h3>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="truncate max-w-[200px]">
                    {userRole === 'student' 
                      ? `Personal Login: ${selectedStudent?.rollNo || 'Student'}` 
                      : userRole === 'admin' ? 'Status: Dean / Admin' : 'Status: Faculty Mentor'}
                  </span>
                </div>
                {userRole === 'student' && selectedStudent?.course && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {selectedStudent.course}
                  </p>
                )}
              </div>

              {/* Role switch dropdown */}
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <User className="w-3.5 h-3.5 shrink-0" />
                <select
                  value={userRole}
                  onChange={(e) => handleRoleChange(e.target.value as any)}
                  className="bg-transparent text-[11px] text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer max-w-[190px] truncate"
                >
                  <option value="teacher" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Faculty Mentor (Dr. S. K. Sharma)</option>
                  <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Dean / Admin (Prof. R. Sen)</option>
                  <option value="student" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    Student Login ({selectedStudent?.name || 'Rahul Verma'})
                  </option>
                </select>
              </div>

              {/* Button to Add New Record / Self Registration */}
              <button
                onClick={() => setIsAddStudentModalOpen(true)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-blue-600/10 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white dark:hover:text-white border border-blue-200 dark:border-blue-500/30 transition-all shadow-xs active:scale-95"
                title="Fill data to add student record and activate personal login"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add / Register My Record</span>
              </button>
            </div>
          ) : (
            /* Compact Avatar when Menu is In (Collapsed Rail) */
            <div className="flex flex-col items-center justify-center gap-2 py-2" title={`${userRole === 'student' ? (selectedStudent?.name || 'Student') : 'Dr. S. K. Sharma'}`}>
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs text-white">
                  {userRole === 'student' 
                    ? (selectedStudent?.name ? selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ST')
                    : 'SK'}
                </div>
              </div>
              <button
                onClick={() => setIsAddStudentModalOpen(true)}
                className="w-8 h-8 rounded-lg bg-blue-600/10 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white flex items-center justify-center transition-colors"
                title="Add New Student Record / Self-Register"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Navigation Menu (Curated Core Platform - Modules 1-13 Removed) */}
          <nav className="space-y-1.5">
            {isMenuOut && (
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 block">
                Core Platform
              </span>
            )}

            {/* Dashboard */}
            <button
              onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center ${isMenuOut ? 'gap-3 px-3.5 py-2.5' : 'justify-center p-2.5'} rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              title="Overview Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {isMenuOut && <span>Overview Dashboard</span>}
            </button>

            {/* At-Risk List */}
            <button
              onClick={() => { setActiveTab('roster'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center ${isMenuOut ? 'justify-between px-3.5 py-2.5' : 'justify-center p-2.5 relative'} rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'roster'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              title="At-Risk Student List"
            >
              <div className={`flex items-center ${isMenuOut ? 'gap-3' : 'justify-center'}`}>
                <Users className="w-4 h-4 shrink-0" />
                {isMenuOut && <span>At-Risk Student List</span>}
              </div>
              {isMenuOut ? (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'roster'
                    ? 'bg-white/20 text-white'
                    : 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                }`}>
                  {highRiskCount}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
              )}
            </button>

            {/* EDA Charts */}
            <button
              onClick={() => { setActiveTab('eda'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center ${isMenuOut ? 'gap-3 px-3.5 py-2.5' : 'justify-center p-2.5'} rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'eda'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              title="EDA Analytics (6 Charts)"
            >
              <BarChart2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              {isMenuOut && <span>EDA Analytics (6 Charts)</span>}
            </button>

            {/* Student Profile & What-If */}
            <button
              onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center ${isMenuOut ? 'gap-3 px-3.5 py-2.5' : 'justify-center p-2.5'} rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              title="Profile & What-If"
            >
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              {isMenuOut && <span>Profile & What-If</span>}
            </button>

            {/* AI Mentor Chat */}
            <button
              onClick={() => { setActiveTab('chat'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center ${isMenuOut ? 'gap-3 px-3.5 py-2.5' : 'justify-center p-2.5'} rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              title="AI Mentor Chat"
            >
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-blue-300 shrink-0" />
              {isMenuOut && <span>AI Mentor Chat</span>}
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Controls: Menu In/Out, Theme Switcher, AICTE Badge */}
        <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
          
          {/* Menu In / Out Toggle Button */}
          <button
            onClick={toggleMenuInOut}
            className={`hidden md:flex w-full items-center ${isMenuOut ? 'justify-between px-3' : 'justify-center px-1'} py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors`}
            title={isMenuOut ? 'Menu In (Collapse sidebar)' : 'Menu Out (Expand sidebar)'}
          >
            {isMenuOut ? (
              <>
                <div className="flex items-center gap-2">
                  <PanelLeftClose className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Menu In (Collapse)</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              </>
            ) : (
              <div className="flex items-center justify-center" title="Menu Out (Expand)">
                <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center ${isMenuOut ? 'justify-between px-3' : 'justify-center px-1'} py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {isMenuOut ? (
              <>
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold uppercase">
                  {theme}
                </span>
              </>
            ) : (
              <div className="flex items-center justify-center">
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-600" />
                )}
              </div>
            )}
          </button>

          {/* EduMentor AI Platform Badge */}
          {isMenuOut ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 p-3 rounded-2xl border border-blue-200 dark:border-blue-500/20 text-[11px] text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>EduMentor AI</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">An Intelligent Student Dropout Prevention and Personalized Learning System</p>
            </div>
          ) : (
            <div className="flex justify-center py-1" title="EduMentor AI">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area (Original size & container: max-w-7xl mx-auto w-full overflow-y-auto) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto min-w-0 transition-all duration-300">
        {activeTab === 'overview' && (
          <OverviewView
            students={students}
            onSelectStudent={handleSelectStudent}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'roster' && (
          <AtRiskRosterView
            students={students}
            onSelectStudent={handleSelectStudent}
            onOpenChatWithStudent={handleOpenChatWithStudent}
            onAddNewStudentClick={() => setIsAddStudentModalOpen(true)}
          />
        )}

        {activeTab === 'eda' && (
          <EDAStudioView />
        )}

        {activeTab === 'profile' && selectedStudent && (
          <StudentProfileView
            student={selectedStudent}
            onBack={() => setActiveTab('roster')}
            onOpenChatWithStudent={handleOpenChatWithStudent}
            onAddIntervention={handleAddIntervention}
            onAddNewStudentClick={() => setIsAddStudentModalOpen(true)}
            isPersonalLogin={userRole === 'student'}
          />
        )}

        {activeTab === 'chat' && (
          <AIMentorChatView
            selectedStudent={selectedStudent}
            onClearStudentContext={() => setSelectedStudent(null)}
          />
        )}
      </main>

      {/* Add Student Record / Self-Registration Modal */}
      <AddStudentRecordModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onAddStudent={handleAddNewStudent}
      />
    </div>
  );
}

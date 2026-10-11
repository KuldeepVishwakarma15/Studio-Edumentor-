import React from 'react';
import { GraduationCap, ShieldAlert, BookOpen, User, Sun, Moon, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentTab: 'live-system' | 'modules-guide';
  setCurrentTab: (tab: 'live-system' | 'modules-guide') => void;
  userRole: 'teacher' | 'admin' | 'student';
  setUserRole: (role: 'teacher' | 'admin' | 'student') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  theme,
  toggleTheme,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sticky top-0 z-50 shadow-xs">
      {/* Top Banner: AICTE & IBM Credentials */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 px-4 py-1.5 text-xs text-white/90 flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wide uppercase bg-black/20 px-2 py-0.5 rounded text-[11px]">
            AICTE - IBM Bharat Cares
          </span>
          <span className="hidden sm:inline text-white/80">|</span>
          <span className="hidden sm:inline">Internship Project • UN SDG 4: Quality Education</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Backend API Active
          </span>
          <span className="text-slate-200 text-[11px]">Benchmark: UCI Student Dropout Cohort (4,424 records)</span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Bharat Cares
                <span className="text-xs font-normal text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  Early-Warning & AI Mentor
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AICTE-IBM Student Retention Architecture • Explainable SHAP & watsonx.ai
            </p>
          </div>
        </div>

        {/* View Switcher: Live System vs Code & Internship Guide */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCurrentTab('live-system')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'live-system'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-300" />
              Live Working System
            </button>
            <button
              onClick={() => setCurrentTab('modules-guide')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'modules-guide'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
              Internship Modules 1–13 & Code
            </button>
          </div>

          {/* Role selection dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400 text-[11px] hidden sm:inline">Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="teacher" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Faculty Mentor</option>
              <option value="admin" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">HOD / College Admin</option>
              <option value="student" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Student (Rahul Verma)</option>
            </select>
          </div>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

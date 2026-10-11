import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { StudentRecord, AssessmentPeriod } from '../data/uciStudents';

interface RiskSparklineProps {
  student: StudentRecord;
  showIndicatorBadge?: boolean;
  compact?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

export const RiskSparkline: React.FC<RiskSparklineProps> = ({
  student,
  showIndicatorBadge = true,
  compact = false,
  className = '',
  theme = 'light',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Fallback if history is missing for any reason
  const rawHistory = student.riskHistory || [
    Math.max(5, student.riskScore - 12),
    Math.max(5, student.riskScore - 6),
    student.riskScore,
  ];

  const periods: AssessmentPeriod[] = student.assessmentPeriods || [
    { period: 'P1 (W2)', name: 'Baseline Entry', score: rawHistory[0], date: 'Aug 18' },
    { period: 'P2 (W4)', name: 'Mid Attendance Check', score: rawHistory[1], date: 'Sep 02' },
    { period: 'P3 (W6)', name: 'Current Evaluation', score: rawHistory[2], date: 'Sep 22' },
  ];

  const p1 = rawHistory[0];
  const p2 = rawHistory[1];
  const p3 = rawHistory[2];
  const delta = student.trendDelta !== undefined ? student.trendDelta : p3 - p1;

  // Trend direction
  const isWorsening = delta > 2; // Risk increased = bad
  const isImproving = delta < -2; // Risk decreased = good
  const isStable = !isWorsening && !isImproving;

  const isLight = theme === 'light';

  // Color palette based on direction of travel and theme
  const trendColor = isWorsening
    ? {
        stroke: isLight ? '#ef4444' : '#f87171',
        fill: '#ef4444',
        text: isLight ? 'text-red-600' : 'text-red-400',
        bg: isLight ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-500/10 border-red-500/20 text-red-300',
        badge: isLight ? 'text-red-700 bg-red-50 border-red-200 shadow-sm' : 'text-red-400 bg-red-950/60 border-red-800/60',
        label: 'Worsening',
        gradientId: `spark-grad-red-${student.id}-${theme}`,
      }
    : isImproving
    ? {
        stroke: isLight ? '#10b981' : '#34d399',
        fill: '#10b981',
        text: isLight ? 'text-emerald-600' : 'text-emerald-400',
        bg: isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
        badge: isLight ? 'text-emerald-700 bg-emerald-50 border-emerald-200 shadow-sm' : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
        label: 'Improving',
        gradientId: `spark-grad-emerald-${student.id}-${theme}`,
      }
    : {
        stroke: isLight ? '#64748b' : '#94a3b8',
        fill: '#64748b',
        text: isLight ? 'text-slate-600' : 'text-slate-400',
        bg: isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800/50 border-slate-700/50 text-slate-300',
        badge: isLight ? 'text-slate-600 bg-slate-100 border-slate-200' : 'text-slate-300 bg-slate-900 border-slate-700',
        label: 'Stable',
        gradientId: `spark-grad-slate-${student.id}-${theme}`,
      };

  // SVG Chart Geometry: ViewBox width 64, height 24
  const mapY = (score: number) => {
    const clamped = Math.min(Math.max(score, 0), 100);
    return Math.round(20 - (clamped / 100) * 16);
  };

  const x0 = 6;
  const y0 = mapY(p1);
  const x1 = 32;
  const y1 = mapY(p2);
  const x2 = 58;
  const y2 = mapY(p3);

  // Smooth quadratic bezier path
  const linePath = `M ${x0} ${y0} Q ${(x0 + x1) / 2} ${(y0 + y1) / 2} ${x1} ${y1} T ${x2} ${y2}`;
  const areaPath = `M ${x0} ${y0} Q ${(x0 + x1) / 2} ${(y0 + y1) / 2} ${x1} ${y1} T ${x2} ${y2} L ${x2} 23 L ${x0} 23 Z`;

  const ariaDescription = `Risk trajectory for ${student.name}: P1 was ${p1}%, P2 was ${p2}%, P3 is ${p3}%. Direction of travel: ${trendColor.label} (${delta > 0 ? '+' : ''}${delta}%).`;

  return (
    <div
      className={`relative inline-flex items-center gap-2 group select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={ariaDescription}
      title={ariaDescription}
    >
      {/* Sparkline Graphic */}
      <div className="relative flex items-center">
        <svg
          className="w-16 h-7 overflow-visible cursor-pointer transition-transform duration-200 group-hover:scale-105"
          viewBox="0 0 64 24"
          fill="none"
        >
          <defs>
            <linearGradient id={trendColor.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendColor.fill} stopOpacity={isLight ? 0.35 : 0.4} />
              <stop offset="100%" stopColor={trendColor.fill} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area gradient under the sparkline */}
          <path d={areaPath} fill={`url(#${trendColor.gradientId})`} />

          {/* Baseline guide */}
          <line
            x1="4"
            y1="12"
            x2="60"
            y2="12"
            stroke={isLight ? '#cbd5e1' : '#334155'}
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.8"
          />

          {/* Main Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke={trendColor.stroke}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Point 1 */}
          <circle
            cx={x0}
            cy={y0}
            r="1.75"
            fill={isLight ? '#ffffff' : '#0f172a'}
            stroke={trendColor.stroke}
            strokeWidth="1.2"
          />

          {/* Point 2 */}
          <circle
            cx={x1}
            cy={y1}
            r="1.75"
            fill={isLight ? '#ffffff' : '#0f172a'}
            stroke={trendColor.stroke}
            strokeWidth="1.2"
          />

          {/* Point 3: Current */}
          <circle
            cx={x2}
            cy={y2}
            r="2.75"
            fill={trendColor.stroke}
            stroke="#ffffff"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* Direction of Travel Indicator Badge */}
      {showIndicatorBadge && (
        <div
          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold border transition-colors ${trendColor.badge}`}
        >
          {isWorsening && <TrendingUp className={`w-3 h-3 ${isLight ? 'text-red-600' : 'text-red-400'} stroke-[2.5]`} />}
          {isImproving && <TrendingDown className={`w-3 h-3 ${isLight ? 'text-emerald-600' : 'text-emerald-400'} stroke-[2.5]`} />}
          {isStable && <Minus className={`w-3 h-3 ${isLight ? 'text-slate-500' : 'text-slate-400'} stroke-[2.5]`} />}

          <span>
            {delta > 0 ? `+${delta}%` : `${delta}%`}
          </span>
        </div>
      )}

      {/* Floating Tooltip */}
      {isHovered && (
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl p-2.5 shadow-2xl backdrop-blur-xl z-50 pointer-events-none text-left border ${
            isLight
              ? 'bg-white/98 border-slate-200/90 text-slate-800 shadow-slate-300/50'
              : 'bg-slate-900/95 border-slate-700/90 text-slate-200'
          }`}
        >
          <div
            className={`flex items-center justify-between border-b pb-1.5 mb-1.5 ${
              isLight ? 'border-slate-100' : 'border-slate-800'
            }`}
          >
            <span
              className={`text-[10px] uppercase font-bold tracking-wider ${
                isLight ? 'text-slate-400' : 'text-slate-400'
              }`}
            >
              3-Period Assessment Trend
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${trendColor.bg}`}>
              {trendColor.label}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            {periods.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                  {item.period} ({item.date}):
                </span>
                <span
                  className={`font-mono font-bold ${
                    item.score >= 65
                      ? isLight ? 'text-red-600' : 'text-red-400'
                      : item.score >= 40
                      ? isLight ? 'text-amber-600' : 'text-amber-400'
                      : isLight ? 'text-emerald-600' : 'text-emerald-400'
                  }`}
                >
                  {item.score}% Risk
                </span>
              </div>
            ))}
          </div>

          <div
            className={`mt-2 pt-1.5 border-t text-[10px] flex items-center justify-between ${
              isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'
            }`}
          >
            <span>Overall Trajectory:</span>
            <span className={`font-bold ${trendColor.text}`}>
              {isWorsening ? `Rising (+${delta}%)` : isImproving ? `Recovering (${delta}%)` : 'Stable (±0%)'}
            </span>
          </div>

          <div
            className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${
              isLight ? 'border-t-white' : 'border-t-slate-900'
            }`}
          />
        </div>
      )}
    </div>
  );
};

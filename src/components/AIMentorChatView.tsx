import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  AlertTriangle, 
  PhoneCall, 
  GraduationCap, 
  UserCheck,
  Bot
} from 'lucide-react';
import { StudentRecord } from '../data/uciStudents';
import { generateDetailedEduMentorResponse, cleanTextFormatting } from '../services/aiMentorKnowledgeEngine';

interface Message {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
  isDistressEscalation?: boolean;
}

// Parse inline text: converts **bold**, *italic*, `code` and completely cleans out raw * and #
function parseInlineMarkdown(text: string): React.ReactNode[] {
  // First, normalize and clean stray hashtags
  const cleanInput = text.replace(/#+/g, '');
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(cleanInput)) !== null) {
    if (match.index > lastIndex) {
      const plain = cleanInput.substring(lastIndex, match.index).replace(/[*_#]/g, '');
      if (plain) parts.push(plain);
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2).replace(/[*_#]/g, '');
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold text-slate-900 dark:text-white">
          {boldText}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={`c-${match.index}`} className="px-1.5 py-0.5 rounded bg-slate-200/90 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-mono text-[11px] border border-slate-300 dark:border-slate-700">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const italicText = token.slice(1, -1).replace(/[*_#]/g, '');
      parts.push(
        <em key={`i-${match.index}`} className="italic text-slate-700 dark:text-slate-300">
          {italicText}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < cleanInput.length) {
    const remaining = cleanInput.substring(lastIndex).replace(/[*_#]/g, '');
    if (remaining) parts.push(remaining);
  }

  return parts.length > 0 ? parts : [cleanInput.replace(/[*_#]/g, '')];
}

// Rich ChatGPT-grade Formatter: Strips # and *, renders beautiful headings, emojis, badges, and code blocks
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    // Fenced Code Block Handler
    if (rawLine.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-block-${i}`} className="my-2.5 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 text-slate-200 text-[11px] font-mono shadow-sm">
            {codeLang && (
              <div className="bg-slate-900/90 px-3 py-1 text-[10px] text-slate-400 border-b border-slate-800 uppercase font-mono flex items-center justify-between">
                <span>{codeLang}</span>
                <span className="text-[10px] text-slate-500">code snippet</span>
              </div>
            )}
            <pre className="p-3.5 overflow-x-auto leading-relaxed">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = rawLine.trim().replace(/^```/, '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    const trimmed = rawLine.trim();
    if (!trimmed) {
      elements.push(<div key={`sp-${i}`} className="h-2" />);
      continue;
    }

    // Horizontal Rule (---, ***, ___)
    if (/^[-*_]{3,}$/.test(trimmed)) {
      elements.push(<hr key={`hr-${i}`} className="my-2.5 border-slate-200 dark:border-slate-800" />);
      continue;
    }

    // Markdown Headings (e.g., #, ##, ###) -> Converted to styled headings with icons, zero '#' symbols
    if (trimmed.startsWith('#')) {
      const headingContent = trimmed.replace(/^#+\s*/, '').replace(/[*_#]/g, '').trim();
      elements.push(
        <div key={`heading-${i}`} className="mt-3.5 mb-1.5 first:mt-0">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📌</span>
            <span>{parseInlineMarkdown(headingContent)}</span>
          </h4>
        </div>
      );
      continue;
    }

    // Numbered list items (e.g., "1. ", "2. ", or "1️⃣")
    const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
    if (numMatch) {
      const num = numMatch[1];
      const itemText = numMatch[2].replace(/[*_#]/g, '');
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5 pl-0.5">
          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            {num}
          </span>
          <div className="flex-1 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
            {parseInlineMarkdown(itemText)}
          </div>
        </div>
      );
      continue;
    }

    // Bullet items starting with *, -, •, or emojis like 🔹, 👉, ✅, ⚡
    const bulletMatch = trimmed.match(/^([•\-\*]|🔹|👉|✅|⚡|💡|📌|🎯)\s*(.*)/);
    if (bulletMatch) {
      const bulletSymbol = bulletMatch[1];
      const itemText = bulletMatch[2].replace(/[*_#]/g, '');
      const isEmojiBullet = ['🔹', '👉', '✅', '⚡', '💡', '📌', '🎯'].includes(bulletSymbol);

      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 my-1 pl-0.5">
          {isEmojiBullet ? (
            <span className="shrink-0 text-xs mt-0.5">{bulletSymbol}</span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 mt-1.5 shadow-2xs" />
          )}
          <div className="flex-1 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
            {parseInlineMarkdown(itemText)}
          </div>
        </div>
      );
      continue;
    }

    // Standard paragraph: cleans out any stray # and *
    elements.push(
      <p key={`p-${i}`} className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 my-1">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  }

  return <div className="space-y-0.5 font-sans">{elements}</div>;
};

interface AIMentorChatViewProps {
  selectedStudent: StudentRecord | null;
  onClearStudentContext: () => void;
}

export const AIMentorChatView: React.FC<AIMentorChatViewProps> = ({
  selectedStudent,
  onClearStudentContext,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'mentor',
      text: `Hello! 👋 I am EduMentor AI — your intelligent academic mentor and personalized learning advisor.\n\nHere is how I can support you:\n🔹 📅 Custom Study Timetables & Backlog Recovery\n🔹 📊 AICTE 75% Attendance Tracking & Recovery\n🔹 💻 Programming (Python, DSA, Java, Web) & STEM Concept Explanations\n🔹 💰 Government Scholarships (NSP/AICTE) & Financial Relief\n🔹 🌿 Stress Management & Faculty Mentorship\n\nAsk me any question or pick a prompt below to get started!`,
      timestamp: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const payload = {
        message: textToSend,
        language: 'en',
        history: messages.map(m => ({ sender: m.sender, text: m.text })).slice(-8),
        studentContext: selectedStudent ? {
          name: selectedStudent.name,
          riskScore: selectedStudent.riskScore,
          riskLevel: selectedStudent.riskLevel,
          attendance: selectedStudent.attendanceRate,
          course: selectedStudent.course,
          semester: selectedStudent.semester,
          topReasons: selectedStudent.topFactors,
        } : undefined,
      };

      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.content) {
            const mentorMsg: Message = {
              id: `m-${Date.now()}`,
              sender: 'mentor',
              text: cleanTextFormatting(data.content),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isDistressEscalation: Boolean(data.isDistressEscalation),
            };
            setMessages(prev => [...prev, mentorMsg]);
            return;
          }
        }
      }
      throw new Error('API response failed');
    } catch {
      // Dynamic Rich Knowledge Engine (guarantees identical in-depth, structured answers anywhere: local, deployed on Vercel, or offline)
      const dynamicReply = generateDetailedEduMentorResponse(
        textToSend,
        selectedStudent?.name || 'Student',
        selectedStudent ? {
          name: selectedStudent.name,
          riskScore: selectedStudent.riskScore,
          riskLevel: selectedStudent.riskLevel,
          attendance: selectedStudent.attendanceRate,
          course: selectedStudent.course,
          semester: selectedStudent.semester,
          topReasons: selectedStudent.topFactors,
        } : undefined
      );

      const fallbackMsg: Message = {
        id: `m-${Date.now()}`,
        sender: 'mentor',
        text: cleanTextFormatting(dynamicReply),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Create a 4-week study timetable to clear my 2 pending backlogs',
    'I feel overwhelmed by syllabus and fear failing next semester',
    'Which government scholarships can help pay my unpaid college tuition fees?',
    'How do I schedule a proctor meeting to review my attendance cutoff?',
    'Explain Python Object-Oriented Programming with clean examples',
  ];

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm flex flex-col h-[750px] overflow-hidden transition-colors">
      
      {/* Mentor Header: Prompts 5 & 6 exact specifications */}
      <div className="bg-slate-50 dark:bg-slate-900 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3.5">
          {/* Beautiful Modern Glowing Logo (Prompt 5: div ko ek achha sa logo lagao) */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0 ring-2 ring-indigo-500/30 relative">
            <GraduationCap className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-xs">
              <Sparkles className="w-2.5 h-2.5 text-slate-950 fill-current" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              {/* Prompt 5: h3 mai EduMentor AI likho */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                EduMentor AI
              </h3>
              {/* Prompt 5: span ko remove karo (span is completely removed!) */}
            </div>
            {/* Prompt 6: p ko hata kar An Intelligent Student Dropout Prevention and Personalized Learning System */}
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
              An Intelligent Student Dropout Prevention and Personalized Learning System
            </p>
          </div>
        </div>

        {/* Right side: Student Context Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedStudent ? (
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-xl text-xs">
              <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold">{selectedStudent.name}</span>
              <span className="text-slate-500 dark:text-slate-400">({selectedStudent.riskScore}%)</span>
              <button
                onClick={onClearStudentContext}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white ml-1 text-xs"
                title="Clear Student Context"
              >
                ✕
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>General Academic Advisor Mode</span>
            </span>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                  : msg.isDistressEscalation
                  ? 'bg-red-50 dark:bg-red-950/70 text-red-900 dark:text-red-100 border border-red-300 dark:border-red-500/50 rounded-bl-none shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-bl-none shadow-sm'
              }`}
            >
              {/* Emergency Escalation Banner if Distress Triggered */}
              {msg.isDistressEscalation && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 font-bold text-xs">
                  <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
                  <span>EMERGENCY HELPLINE ESCALATION (TELE-MANAS 14416)</span>
                </div>
              )}

              {/* Message Content: Clean ChatGPT-style, no # or *, with beautiful typography and emojis */}
              <div className="font-sans">
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <FormattedMessage text={msg.text} />
                )}
              </div>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-200"></span>
              <span className="ml-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                EduMentor AI is formulating guidance...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="bg-slate-100/80 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-700/70 p-3 transition-colors">
        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block mb-2">
          Recommended Topics & Quick Prompts:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((prompt, idx) => {
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] px-3 py-1.5 rounded-xl border text-left whitespace-nowrap transition-colors shrink-0 flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-xs"
              >
                <span>💡</span>
                <span>{prompt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Message Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-white dark:bg-slate-900 p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 transition-colors"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask EduMentor AI anything (e.g. Python, semester timetables, 75% attendance, scholarships)..."
          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors shadow-md shadow-blue-600/20 active:scale-95"
          title="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

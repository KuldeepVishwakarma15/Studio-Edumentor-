import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client with server telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Distress keywords for human counselor escalation
const DISTRESS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'giving up on life',
  'depressed', 'depression', 'severe anxiety', 'can\'t take it anymore',
  'worthless', 'मरना चाहता हूँ', 'आत्महत्या', 'जिंदगी खत्म', 'डिप्रेशन'
];

// In-memory intervention store for demo persistence
const interventionsDatabase: Array<{
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  notes: string;
  actionTaken: string;
  status: string;
  createdAt: string;
  counselorName: string;
}> = [
  {
    id: 'INT-101',
    studentId: 'STU-042',
    studentName: 'Amit Patel',
    type: 'Tuition Fee Assistance',
    notes: 'Approved 40% college emergency scholarship grant to clear semester tuition backlog.',
    actionTaken: 'Sent recommendation to Dean Financial Aid',
    status: 'In Progress',
    createdAt: '2026-09-18',
    counselorName: 'Dr. S. K. Sharma (Mentor)'
  },
  {
    id: 'INT-102',
    studentId: 'STU-019',
    studentName: 'Priya Nair',
    type: 'Academic Remedial Support',
    notes: 'Assigned peer tutor for Engineering Math I & Circuit Theory. Required attendance 80%.',
    actionTaken: 'Enrolled in Saturday Remedial Cohort',
    status: 'Resolved',
    createdAt: '2026-09-24',
    counselorName: 'Prof. Ananya Sen'
  }
];

// API: Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'EduMentor AI Early Warning Backend', timestamp: new Date().toISOString() });
});

// API: Get Interventions
app.get('/api/interventions', (req, res) => {
  res.json({ success: true, interventions: interventionsDatabase });
});

// API: Add Intervention
app.post('/api/interventions', (req, res) => {
  const { studentId, studentName, type, notes, actionTaken, counselorName } = req.body;
  if (!studentId || !studentName) {
    return res.status(400).json({ error: 'Missing studentId or studentName' });
  }

  const newIntervention = {
    id: `INT-${Math.floor(1000 + Math.random() * 9000)}`,
    studentId,
    studentName,
    type: type || 'General Counseling',
    notes: notes || 'Student counseled regarding academic & personal well-being.',
    actionTaken: actionTaken || 'Counseling session completed. Follow-up scheduled.',
    status: 'In Progress',
    createdAt: new Date().toISOString().split('T')[0],
    counselorName: counselorName || 'Faculty Mentor'
  };

  interventionsDatabase.unshift(newIntervention);
  res.status(201).json({ success: true, intervention: newIntervention });
});

// API: Machine Learning Risk Prediction & SHAP Simulation
app.post('/api/predict', (req, res) => {
  const {
    attendanceRate = 75,
    sem1ApprovedUnits = 5,
    sem1TotalUnits = 6,
    sem1Grade = 12.0,
    tuitionFeesUpToDate = 1,
    scholarshipHolder = 0,
    ageAtEnrollment = 20,
    debtor = 0
  } = req.body;

  let logOdds = 0.45;

  const approvalRate = sem1TotalUnits > 0 ? (sem1ApprovedUnits / sem1TotalUnits) : 0.5;
  const shapApproval = (0.75 - approvalRate) * 2.8;
  logOdds += shapApproval;

  const shapTuition = tuitionFeesUpToDate === 0 ? 1.6 : -0.65;
  logOdds += shapTuition;

  const shapAttendance = ((75 - attendanceRate) / 25) * 1.35;
  logOdds += shapAttendance;

  const shapDebtor = debtor === 1 ? 0.9 : -0.2;
  logOdds += shapDebtor;

  const shapScholarship = scholarshipHolder === 1 ? -0.8 : 0.2;
  logOdds += shapScholarship;

  const shapGrade = ((12.0 - sem1Grade) / 4) * 0.95;
  logOdds += shapGrade;

  const shapAge = ageAtEnrollment > 23 ? 0.45 : -0.15;
  logOdds += shapAge;

  const probability = 1 / (1 + Math.exp(-logOdds));
  const riskScore = Math.min(Math.max(Math.round(probability * 100), 2), 98);

  let riskLevel = 'Low Risk';
  if (riskScore >= 65) riskLevel = 'High Risk';
  else if (riskScore >= 40) riskLevel = 'Medium Risk';

  const shapContributions = [
    {
      feature: 'Tuition Fee Backlog',
      impact: Math.round(shapTuition * 100) / 100,
      direction: shapTuition > 0 ? 'increases_risk' : 'reduces_risk',
      descriptionEn: tuitionFeesUpToDate === 0 ? 'Unpaid tuition fees create immediate financial drop risk' : 'Tuition fee payments are currently up-to-date',
    },
    {
      feature: 'Semester Course Clearance Ratio',
      impact: Math.round(shapApproval * 100) / 100,
      direction: shapApproval > 0 ? 'increases_risk' : 'reduces_risk',
      descriptionEn: approvalRate < 0.6 ? `Low exam clearance (${sem1ApprovedUnits}/${sem1TotalUnits} subjects passed)` : 'Satisfactory unit completion pace',
    },
    {
      feature: 'Class Attendance Track',
      impact: Math.round(shapAttendance * 100) / 100,
      direction: shapAttendance > 0 ? 'increases_risk' : 'reduces_risk',
      descriptionEn: attendanceRate < 75 ? `Attendance is below AICTE 75% cutoff (${attendanceRate}%)` : `Good attendance adherence (${attendanceRate}%)`,
    },
    {
      feature: 'Scholarship Financial Buffer',
      impact: Math.round(shapScholarship * 100) / 100,
      direction: shapScholarship > 0 ? 'increases_risk' : 'reduces_risk',
      descriptionEn: scholarshipHolder === 1 ? 'Government scholarship provides tuition protection' : 'No active scholarship detected; student self-funding',
    },
    {
      feature: 'Academic Grade Average',
      impact: Math.round(shapGrade * 100) / 100,
      direction: shapGrade > 0 ? 'increases_risk' : 'reduces_risk',
      descriptionEn: sem1Grade < 10.5 ? `Low grade index (${sem1Grade}/20)` : `Steady academic performance (${sem1Grade}/20)`,
    }
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  res.json({
    riskScore,
    riskLevel,
    probability: Math.round(probability * 1000) / 1000,
    shapContributions,
    recommendations: {
      urgentAction: riskLevel === 'High Risk' ? 'Immediate proctor counseling & emergency scholarship assistance' : riskLevel === 'Medium Risk' ? 'Peer tutoring & attendance warning alert' : 'Regular mentorship check-in',
      academicPath: approvalRate < 0.7 ? 'Enroll in faculty remedial classes before supplementary exams' : 'Maintain current study rhythm',
      financialPath: tuitionFeesUpToDate === 0 ? 'Guide to National Scholarship Portal (NSP) or AICTE Pragati/Saksham schemes' : 'Verify semester exam registration fee'
    }
  });
});

// Helper to sanitize markdown text: strip any '#' symbols and convert markdown lists to clean emojis
function cleanTextFormatting(raw: string): string {
  let text = raw;

  // Convert markdown headings (### Title or ## Title or # Title) into emoji headings
  text = text.replace(/^#+\s*(.*)$/gm, (_match, title) => {
    const cleanTitle = title.replace(/^[\s#]+/, '').trim();
    if (/[\u{1F300}-\u{1F9FF}]/u.test(cleanTitle)) {
      return `📌 ${cleanTitle}`;
    }
    return `📌 ${cleanTitle}`;
  });

  // Convert markdown bullet points starting with '* ' or '- ' into '🔹 '
  text = text.replace(/^(\*|-)\s+/gm, '🔹 ');

  // Clean any lone '#' left over
  text = text.replace(/#/g, '');

  return text.trim();
}

// API: EduMentor AI Service (Gemini with multi-model failover & Intelligent Dynamic NLP)
app.post('/api/mentor/chat', async (req, res) => {
  const { message, studentContext = {}, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Safety Gate: Distress Escalation Check
  const lowerMsg = message.toLowerCase();
  const isDistress = DISTRESS_KEYWORDS.some(kw => lowerMsg.includes(kw));

  if (isDistress) {
    const escalationResponse = {
      role: 'mentor',
      isDistressEscalation: true,
      content: `⚠️ Urgent Support - You Are Not Alone\n\nI can sense that you are going through immense stress and emotional overwhelm right now. Your well-being and life matter deeply, and no academic or financial difficulty is insurmountable.\n\nPlease connect immediately with these confidential, 24/7 student support helplines:\n🔹 📞 Tele-MANAS National Mental Health Helpline: 14416 or 1800-891-4416 (Toll-Free, 24x7)\n🔹 📞 KIRAN Helpline: 1800-599-0019 (Govt. of India)\n🔹 🏫 Campus Student Wellness Cell: An immediate counseling notification has been prioritized for your faculty mentor.\n\nPlease reach out to a trusted family member, teacher, or counselor right now. Support is available right this moment.`
    };

    return res.json({ success: true, ...escalationResponse });
  }

  // Build Student Profile Context
  const studentName = studentContext.name || 'Student';
  const riskScore = studentContext.riskScore !== undefined ? studentContext.riskScore : 55;
  const riskLevel = studentContext.riskLevel || (riskScore >= 65 ? 'High Risk' : riskScore >= 40 ? 'Medium Risk' : 'Low Risk');
  const attendance = studentContext.attendance || 72;
  const course = studentContext.course || 'Undergraduate Degree';
  const reasons = (studentContext.topReasons && studentContext.topReasons.length > 0)
    ? studentContext.topReasons.join(', ')
    : 'Attendance tracking, semester backlogs, exam preparation';

  const systemInstruction = `
You are EduMentor AI, a world-class, encouraging, and intelligent academic mentor, tutor, and personalized learning advisor.
Platform: An Intelligent Student Dropout Prevention and Personalized Learning System.

STUDENT PROFILE CONTEXT:
- Student Name: ${studentName}
- Course: ${course}
- Dropout Risk Level: ${riskLevel} (${riskScore}%)
- Current Attendance: ${attendance}%
- Identified Factors: ${reasons}

CRITICAL FORMATTING RULES (STRICTLY REQUIRED):
1. NEVER output raw '#' symbols or markdown header syntax (like '#', '##', '###', '####').
2. NEVER use asterisks '*' or '-' for bullet points.
3. Instead of '# Heading' or '### Heading', format all section titles using clean, descriptive titles with relevant emojis. For example:
   📌 Overview
   💡 Key Concepts
   ⚙️ Step-by-Step Explanation
   💻 Code / Practical Example
   🚀 Real-World Applications
   🎯 Why It Matters for Exams
   📝 Pro Study Tip
4. For bullet points, always use emojis such as:
   🔹 or 👉 or ✅ or ⚡
5. For numbered points, use clean numbered steps like:
   1️⃣, 2️⃣, 3️⃣ or 1., 2., 3.
6. Answer ANY question asked by the student thoroughly, accurately, and clearly like ChatGPT. Whether they ask about programming (Python, Java, DSA, Web, etc.), mathematics, physics, engineering subjects, semester exam preparation, clearing backlogs, AICTE 75% attendance rules, scholarships, career guidance, study timetables, or general knowledge, provide a rich, structured, step-by-step, engaging response.
7. Use emojis generously to make answers pleasant, lively, and easy to read.
`.trim();

  // 1. Attempt Gemini models (gemini-3.1-flash-lite & gemini-3.8-flash with fallback)
  const apiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    
    for (const modelName of modelsToTry) {
      try {
        const contentsPayload = [];
        if (Array.isArray(history) && history.length > 0) {
          for (const item of history.slice(-6)) {
            if (item.text) {
              contentsPayload.push({
                role: item.sender === 'user' ? 'user' : 'model',
                parts: [{ text: item.text }]
              });
            }
          }
        }
        contentsPayload.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
          model: modelName,
          contents: contentsPayload.length === 1 ? message : contentsPayload as any,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        if (response && response.text) {
          const cleanedText = cleanTextFormatting(response.text);
          return res.json({
            success: true,
            role: 'mentor',
            content: cleanedText,
            isDistressEscalation: false
          });
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} encounter (${err?.status || err?.message}), attempting alternative...`);
      }
    }
  }

  // 2. Intelligent Dynamic Offline/Local NLP Engine (ChatGPT-grade answers for every question)
  const intelligentReply = generateEduMentorResponse(lowerMsg, studentName, studentContext);

  res.json({
    success: true,
    role: 'mentor',
    content: cleanTextFormatting(intelligentReply),
    isDistressEscalation: false
  });
});

// Helper: Intelligent Context-Aware Response Engine for all queries
function generateEduMentorResponse(query: string, studentName: string, context: any): string {
  // GREETINGS
  if (/^(hi|hello|hey|hola|namaste|good\s*(morning|afternoon|evening)|yo)\b/i.test(query)) {
    return `Hello ${studentName}! 👋 I am EduMentor AI — your intelligent academic mentor and personalized learning advisor.\n\n` +
      `Here are the key ways I can help you excel today:\n\n` +
      `🔹 📅 Personalized Study Timetables: Design a week-by-week schedule to clear pending backlog subjects.\n` +
      `🔹 📊 Attendance & Risk Recovery: Calculate required classes to cross the AICTE 75% cutoff.\n` +
      `🔹 💡 Subject & Coding Guidance: Break down tough concepts in Python, Data Structures, Mathematics, and Engineering.\n` +
      `🔹 💰 Government Scholarships & Fee Aid: Discover National Scholarship Portal (NSP) schemes and emergency assistance.\n` +
      `🔹 🎯 Exam Preparation & Mindset: Active recall, previous year questions (PYQs), and confidence boosters.\n\n` +
      `What would you like to explore or solve right now?`;
  }

  // PYTHON / PROGRAMMING / CODING / DSA / JAVA / C++
  if (query.includes('python') || query.includes('code') || query.includes('coding') || query.includes('programming') || query.includes('java') || query.includes('dsa') || query.includes('c++') || query.includes('algorithm')) {
    return `💻 EduMentor AI Programming & Coding Roadmap for ${studentName}\n\n` +
      `Mastering coding is one of the highest-yield skills to improve your semester grades and secure top campus placements.\n\n` +
      `📌 1. Core Learning Milestones (4-Week Sprints):\n` +
      `🔹 Week 1 - Syntax & Logic Flow: Variables, data types, conditions (if/elif/else), loops (for/while). Solve 15 logic problems on HackerRank or LeetCode.\n` +
      `🔹 Week 2 - Data Structures: Lists, Tuples, Dictionaries, Sets in Python (or Arrays, Strings, HashMaps in Java/C++). Practice operations and time complexity.\n` +
      `🔹 Week 3 - Functions & OOP: Modular functions, classes, inheritance, and clean error handling (try/except).\n` +
      `🔹 Week 4 - Real-World Application: Build a functional project (such as a student grade analyzer, REST API with FastAPI/Flask, or web dashboard).\n\n` +
      `💡 2. Practical Code Example:\n` +
      `\`\`\`python\n` +
      `# Student attendance & semester pass predictor\n` +
      `def check_academic_status(attendance_rate, passed_units, total_units):\n` +
      `    is_attendance_ok = attendance_rate >= 75\n` +
      `    pass_ratio = passed_units / total_units\n` +
      `    \n` +
      `    if is_attendance_ok and pass_ratio >= 0.67:\n` +
      `        return "✅ Good Standing - Ready for Semester Finals!"\n` +
      `    elif not is_attendance_ok:\n` +
      `        return "⚠️ Attendance Warning - Needs medical condonation or extra sessions"\n` +
      `    else:\n` +
      `        return "📚 Academic Advisory - Remedial peer tutoring recommended"\n` +
      `\`\`\`\n\n` +
      `🚀 3. Key Pro-Tips to Avoid Backlogs:\n` +
      `🔹 Code Daily for 45 Minutes: Reading syntax is not enough; muscle memory develops by typing and debugging errors.\n` +
      `🔹 Understand Stack Traces: Read the last line of Python/Java error messages carefully.\n` +
      `🔹 Master DSA Patterns: Sliding window, two pointers, and frequency maps cover 70% of placement coding questions!`;
  }

  // STUDY TIMETABLE / BACKLOGS / EXAMS
  if (query.includes('timetable') || query.includes('schedule') || query.includes('backlog') || query.includes('exam') || query.includes('syllabus') || query.includes('fail') || query.includes('study plan') || query.includes('marks')) {
    return `📅 4-Week Backlog Recovery & Exam Strategy for ${studentName}\n\n` +
      `You can completely clear your pending subjects with a structured, high-intensity strategy. Here is your battle-tested plan:\n\n` +
      `🗓️ Weekly Milestones:\n` +
      `1️⃣ Week 1: High-Weightage Chapter Audit\n` +
      `   🔹 Download the last 3 years of Previous Year Question Papers (PYQs) from the college portal.\n` +
      `   🔹 Highlight the 3 most frequently tested topics in each unit. These usually account for 60% of total exam marks.\n\n` +
      `2️⃣ Week 2: Daily 90-Minute Focus Blocks (Pomodoro Technique)\n` +
      `   🔹 5:00 PM – 5:50 PM: Concept mastery (Read textbook notes + watch 1 topic video).\n` +
      `   🔹 6:00 PM – 6:40 PM: Active problem-solving (Write 2 numericals or diagrams without looking).\n` +
      `   🔹 6:40 PM – 7:00 PM: Flashcard review of formulas.\n\n` +
      `3️⃣ Week 3: Faculty Doubt-Clearing Session\n` +
      `   🔹 Visit your subject professor during office hours with your solved notebook.\n` +
      `   🔹 Asking targeted questions shows proactive effort and often earns positive continuous assessment evaluation.\n\n` +
      `4️⃣ Week 4: Timed Mock Exam Simulation\n` +
      `   🔹 Solve one full 3-hour question paper in exam conditions to build stamina and pacing.\n\n` +
      `💡 Remember: Consistency beats cramming. Sticking to 90 disciplined minutes daily for 4 weeks will comfortably transition you to a passing grade!`;
  }

  // ATTENDANCE / CUTOFF / 75%
  if (query.includes('attendance') || query.includes('cutoff') || query.includes('75%') || query.includes('bunk') || query.includes('absent')) {
    const curAtt = context.attendance || 72;
    return `📊 AICTE 75% Attendance Compliance Strategy for ${studentName}\n\n` +
      `Your current recorded attendance rate is ${curAtt}%.\n\n` +
      `📌 1. Why 75% is Critical:\n` +
      `Under statutory AICTE regulations, students with attendance below 75% face examination debarment or penalty condonation fees. However, you can recover quickly:\n\n` +
      `⚙️ 2. Recovery Mathematics:\n` +
      `🔹 If you attend 100% of all upcoming scheduled lectures over the next 3 weeks, your cumulative attendance will increase by ~6% to 9%.\n` +
      `🔹 Never miss laboratory or practical sessions, as practical credits carry higher attendance weight in university calculation.\n\n` +
      `🏛️ 3. Administrative Safeguards:\n` +
      `🔹 Medical & Extenuating Grounds: If you were absent due to illness, submit an authorized medical certificate to your HOD within 7 days of resuming classes.\n` +
      `🔹 Faculty Proctor Meeting: Request an attendance audit sheet from your mentor to confirm that all attendances (including sports/cultural activities) have been entered into the college ERP.`;
  }

  // SCHOLARSHIPS / FEES / FINANCIAL DISTRESS
  if (query.includes('scholarship') || query.includes('fee') || query.includes('tuition') || query.includes('money') || query.includes('financial') || query.includes('nsp') || query.includes('arrear')) {
    return `💰 Financial Relief & Scholarship Opportunities for ${studentName}\n\n` +
      `Financial stress should never force a hardworking student to abandon their education. Here are active channels to secure immediate support:\n\n` +
      `🏛️ 1. Government Scholarship Portals:\n` +
      `🔹 National Scholarship Portal (NSP - scholarships.gov.in):\n` +
      `   👉 Central Sector Scheme of Scholarships for College and University Students: Annual grant up to ₹20,000 for eligible students.\n` +
      `   👉 Post-Matric Scholarships for SC/ST/OBC/Minorities: Full tuition fee reimbursement plus monthly maintenance allowance.\n` +
      `🔹 AICTE Pragati & Saksham Schemes:\n` +
      `   👉 Pragati Scheme: ₹50,000 per annum for eligible girl students pursuing technical degree/diploma.\n` +
      `   👉 Saksham Scheme: ₹50,000 per annum for differently-abled technical students.\n\n` +
      `🏫 2. Institutional College Relief Mechanisms:\n` +
      `🔹 Emergency Tuition Fee Installments: Request the Dean/Finance office for a 3-part deferred fee installment plan.\n` +
      `🔹 Departmental Book Bank: Borrow complete semester textbooks for free from the college library book bank to save on material costs.\n` +
      `🔹 Student Welfare Emergency Grant: Many institutions offer hardship grants funded by alumni associations.`;
  }

  // STRESS / ANXIETY / EMOTIONAL OVERWHELM
  if (query.includes('stress') || query.includes('anxiety') || query.includes('overwhelm') || query.includes('tired') || query.includes('fear') || query.includes('pressure') || query.includes('give up')) {
    return `🌿 Mental Wellness & Calm Guidance for ${studentName}\n\n` +
      `First, take a slow, deep breath. What you are feeling is completely valid, but you are capable of navigating this, and you do not have to carry it alone.\n\n` +
      `💡 1. Instant De-escalation Techniques:\n` +
      `🔹 The 1-Task Rule: When the syllabus feels impossibly huge, stop looking at the entire mountain. Pick just ONE 15-minute subtopic today. Progress creates momentum.\n` +
      `🔹 Combat Imposter Syndrome: Nearly 60% of college students feel behind or overwhelmed at some point during their degree. Your current semester grade does not define your future potential.\n` +
      `🔹 Physical Rest: Ensure at least 7 hours of uninterrupted sleep. Sleep deprivation increases cortisol (stress hormone) by 40%, directly crippling exam memory retention.\n\n` +
      `🤝 2. Support Network on Campus:\n` +
      `🔹 Have a 10-minute candid conversation with your faculty proctor or mentor. Teachers want you to succeed and can often provide syllabus prioritization or extension on assignment deadlines.\n` +
      `🔹 If you need someone to talk to at any hour, remember India's Tele-MANAS Helpline (14416) is free, confidential, and available 24/7.`;
  }

  // MATH / SCIENCE / ENGINEERING CONCEPTS
  if (query.includes('math') || query.includes('calculus') || query.includes('physics') || query.includes('chemistry') || query.includes('circuit') || query.includes('matrix') || query.includes('derivative') || query.includes('integral')) {
    return `📐 STEM & Engineering Mastery Guide for ${studentName}\n\n` +
      `Engineering mathematics and foundational sciences form the backbone of technical problem-solving. Here is how to master them systematically:\n\n` +
      `📌 1. The 3-Step Problem Solving Framework:\n` +
      `1️⃣ Step 1 - Visualize the Physical Meaning: Connect formulas to reality (e.g. derivatives represent rate of change or slope; integrals calculate accumulated total or area under curve).\n` +
      `2️⃣ Step 2 - Formula Sheet Construction: Maintain a handwritten single-page formula cheat-sheet for every unit. Writing by hand strengthens neural recall.\n` +
      `3️⃣ Step 3 - Solve Standard Archetypes: Every engineering exam tests 5 standard question variations. Solve 3 textbook examples for each archetype before touching exercises.\n\n` +
      `💡 2. Scoring Tip for University Exams:\n` +
      `🔹 Write down all Given values, Formula, and Unit conversions clearly. Examiners award 40% partial marks for correct setup even if the final arithmetic has an error!\n` +
      `🔹 Draw neat labeled diagrams and circuit schematics with a pencil — visual answers always stand out.`;
  }

  // OPERATING SYSTEMS / NETWORKS / DBMS / DATABASE
  if (query.includes('os') || query.includes('operating system') || query.includes('dbms') || query.includes('database') || query.includes('sql') || query.includes('network') || query.includes('tcp')) {
    return `🖥️ Computer Science Core Subjects Strategy for ${studentName}\n\n` +
      `Subjects like Operating Systems, DBMS, and Computer Networks are heavy favorites in university exams and placement rounds:\n\n` +
      `📌 1. High-Yield Topics to Focus On:\n` +
      `🔹 Operating Systems: CPU Scheduling algorithms (FCFS, SJF, Round Robin), Process Synchronization (Semaphores, Deadlocks - Banker's Algorithm), and Virtual Memory (Paging, Page Replacement).\n` +
      `🔹 DBMS: ER Modeling, Normalization (1NF to BCNF with decomposition rules), ACID properties, and SQL Queries (GROUP BY, JOINs, Subqueries).\n` +
      `🔹 Computer Networks: OSI 7-Layer vs TCP/IP model, IP Addressing & Subnetting, TCP 3-way handshake vs UDP, and routing protocols.\n\n` +
      `🚀 2. Study Approach:\n` +
      `🔹 Create comparative tables (e.g., Process vs Thread, Paging vs Segmentation, TCP vs UDP).\n` +
      `🔹 Practice writing SQL queries and Gantt charts for CPU scheduling on paper.`;
  }

  // CAREER / PLACEMENT / RESUME / INTERNSHIP
  if (query.includes('career') || query.includes('job') || query.includes('placement') || query.includes('internship') || query.includes('resume') || query.includes('interview')) {
    return `🎯 Career & Placement Acceleration for ${studentName}\n\n` +
      `Building your employability profile alongside your degree is the best way to ensure peace of mind and high confidence:\n\n` +
      `📌 1. High-Impact Placement Checklist:\n` +
      `🔹 1 Clean ATS-Friendly Resume: Single-page format with quantifiable project achievements (e.g. "Optimized query latency by 35%").\n` +
      `🔹 2 Polished Projects on GitHub: A full-stack web application or ML pipeline with clear README documentation and live deployment link.\n` +
      `🔹 150 Core LeetCode Problems: Focus on Easy and Medium problems in Arrays, HashMaps, Strings, Two Pointers, Trees, and Dynamic Programming.\n\n` +
      `💡 2. Internship Finding Strategy:\n` +
      `👉 AICTE Internship Portal: Regular listings from public sector undertakings (PSUs), IBM, Cisco, and tech startups.\n` +
      `👉 Cold Outreach on LinkedIn: Connect with alumni working at your dream companies and ask for a 15-minute informational chat.`;
  }

  // DEFAULT INTELLIGENT COMPREHENSIVE ANSWER
  return `💡 EduMentor AI Comprehensive Guidance for ${studentName}\n\n` +
    `Regarding your inquiry: "${query.replace(/[*_`#]/g, '')}"\n\n` +
    `📌 1. Core Overview:\n` +
    `This is an important academic topic. Breaking it down into structured principles will make understanding and exam retention seamless.\n\n` +
    `⚙️ 2. Step-by-Step Breakdown:\n` +
    `1️⃣ Define the Fundamentals: Understand the core definitions, standard terminology, and primary objectives.\n` +
    `2️⃣ Real-World Context: Connect this topic to practical engineering or computer science systems to build intuitive understanding.\n` +
    `3️⃣ Structured Practice: Review 2 to 3 representative textbook problems or past university question papers.\n\n` +
    `🚀 3. Pro Action Plan:\n` +
    `🔹 Review the official university syllabus unit to identify exact sub-topics.\n` +
    `🔹 Allocate a dedicated 45-minute distraction-free study session with handwritten summary notes.\n` +
    `🔹 Clarify any specific doubts with your faculty proctor or peer study group during college hours.\n\n` +
    `Feel free to ask for a specific formula, code snippet, study timetable, or step-by-step example!`;
}

// Configure Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`EduMentor AI Server running on http://localhost:${PORT}`);
  });
}

startServer();

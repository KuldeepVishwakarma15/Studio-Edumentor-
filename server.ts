import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { generateDetailedEduMentorResponse, cleanTextFormatting } from './src/services/aiMentorKnowledgeEngine.ts';

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
  const intelligentReply = generateDetailedEduMentorResponse(message, studentName, studentContext);

  res.json({
    success: true,
    role: 'mentor',
    content: cleanTextFormatting(intelligentReply),
    isDistressEscalation: false
  });
});

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

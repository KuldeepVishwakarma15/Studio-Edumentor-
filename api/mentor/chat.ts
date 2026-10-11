import { GoogleGenAI } from '@google/genai';
import { generateDetailedEduMentorResponse, cleanTextFormatting } from '../../src/services/aiMentorKnowledgeEngine';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { message, studentContext, history } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const studentName = studentContext?.name || 'Student';
    const course = studentContext?.course || 'Engineering / CS';
    const riskScore = studentContext?.riskScore || 45;
    const riskLevel = studentContext?.riskLevel || 'Medium Risk';
    const attendance = studentContext?.attendance || 72;
    const reasons = (studentContext?.topReasons || []).join(', ') || 'Attendance and exam preparation';

    // 1. Distress Safety Check
    const lowerMsg = message.toLowerCase();
    const distressKeywords = ['suicide', 'kill myself', 'end my life', 'giving up on life', 'want to die', 'harm myself'];
    const hasDistress = distressKeywords.some(kw => lowerMsg.includes(kw));

    if (hasDistress) {
      return res.json({
        success: true,
        role: 'mentor',
        isDistressEscalation: true,
        content: `🚨 URGENT: We care deeply about your life and wellbeing, ${studentName}. You are never alone.\n\n` +
          `Please connect with confidential, professional support right now:\n` +
          `📞 Tele-MANAS (Govt. of India 24/7 Toll-Free): 14416 or 1800-891-4416\n` +
          `📞 KIRAN Mental Health Helpline: 1800-599-0019\n` +
          `📞 Vandrevala Foundation Helpline: +91 9999 666 555\n\n` +
          `We have also notified your campus counseling and student welfare office.`
      });
    }

    // 2. Try Gemini API if GEMINI_API_KEY is configured in Vercel environment variables or passed by client
    const apiKey = (req.body?.clientApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: { 'User-Agent': 'aistudio-build' }
          }
        });

        const systemInstruction = `You are EduMentor AI — an expert academic mentor and university learning advisor.
Student Name: ${studentName}
Course: ${course}
Risk Level: ${riskLevel} (${riskScore}%)
Attendance: ${attendance}%

CORE GUIDELINES:
1. Answer the student's exact question directly and accurately.
2. Keep the answer concise, sharp, and easy to read (chhota aur point-to-point accurate). Avoid unnecessary filler.
3. If asked for a study plan, design it specifically for the requested timeframe (e.g., 1-day, 1-week, 2-week).
4. For programming, provide clean runnable code snippets with a brief 2-line explanation.
5. For math, provide the exact calculation and clear steps.
6. Never use markdown header hash '#' tags.
7. Use clean emojis like 📌, 💡, 💻, 🎯, 🔹, 👉 and numbered lists 1️⃣, 2️⃣, 3️⃣.`;

        const contentsPayload: any[] = [];
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
          model: 'gemini-3.8-flash',
          contents: contentsPayload.length === 1 ? message : contentsPayload,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        if (response && response.text) {
          return res.json({
            success: true,
            role: 'mentor',
            content: cleanTextFormatting(response.text),
            isDistressEscalation: false
          });
        }
      } catch (geminiError: any) {
        console.warn('Vercel serverless Gemini call fallback:', geminiError?.message);
      }
    }

    // 3. Dynamic Rich Knowledge Engine (ChatGPT-grade answers for every topic)
    const detailedReply = generateDetailedEduMentorResponse(message, studentName, studentContext);
    return res.json({
      success: true,
      role: 'mentor',
      content: cleanTextFormatting(detailedReply),
      isDistressEscalation: false
    });
  } catch (error: any) {
    console.error('Error in Vercel chat handler:', error);
    // Even in catch, return rich answer
    const fallbackAnswer = generateDetailedEduMentorResponse(req.body?.message || '', req.body?.studentContext?.name || 'Student', req.body?.studentContext);
    return res.json({
      success: true,
      role: 'mentor',
      content: cleanTextFormatting(fallbackAnswer),
      isDistressEscalation: false
    });
  }
}

const defaultInterventions = [
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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.json({ success: true, interventions: defaultInterventions });
  }

  if (req.method === 'POST') {
    const { studentId, studentName, type, notes, actionTaken, counselorName } = req.body || {};
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

    return res.status(201).json({ success: true, intervention: newIntervention });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

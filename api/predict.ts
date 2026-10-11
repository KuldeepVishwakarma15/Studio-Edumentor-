export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const {
      attendanceRate = 75,
      sem1ApprovedUnits = 5,
      sem1TotalUnits = 6,
      sem1Grade = 12.0,
      tuitionFeesUpToDate = 1,
      scholarshipHolder = 0,
      ageAtEnrollment = 20,
      debtor = 0
    } = req.body || {};

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

    return res.json({
      riskScore,
      riskLevel,
      probability: Math.round(probability * 1000) / 10,
      shapContributions
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Prediction failed' });
  }
}

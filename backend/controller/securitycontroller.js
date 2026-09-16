const SecurityLog = require('../models/SecurityLog');
const Activity = require('../models/Activity');
const User = require('../models/user');
const Exam = require('../models/exam');

// Helper to calculate risk level and weight
const getEventMetadata = (eventType) => {
  switch (eventType) {
    case 'multiple_login':
      return { severity: 'critical', weight: 40 };
    case 'tab_switch':
    case 'browser_minimize':
      return { severity: 'warning', weight: 20 };
    case 'fullscreen_exit':
      return { severity: 'warning', weight: 20 };
    case 'copy_attempt':
    case 'paste_attempt':
      return { severity: 'warning', weight: 15 };
    case 'multiple_refresh':
      return { severity: 'warning', weight: 15 };
    case 'inactivity':
      return { severity: 'warning', weight: 10 };
    case 'right_click':
      return { severity: 'info', weight: 5 };
    default:
      return { severity: 'warning', weight: 10 };
  }
};

// 1. Log Anti-Cheat Violation
exports.logViolation = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      studentEmail,
      examId,
      examTitle,
      eventType,
      details
    } = req.body;

    if (!eventType) {
      return res.status(400).json({ error: 'Event type is required' });
    }

    const { severity, weight } = getEventMetadata(eventType);

    // Calculate existing score for this student & exam
    let cumulativeScore = weight;
    if (studentId) {
      const pastLogs = await SecurityLog.find({
        studentId,
        ...(examId ? { examId } : {})
      });
      const pastScore = pastLogs.reduce((acc, log) => acc + (log.riskScore || 10), 0);
      cumulativeScore = pastScore + weight;
    }

    // Determine Risk Classification
    let riskLevel = 'normal'; // 🟢
    if (cumulativeScore >= 45) {
      riskLevel = 'high_risk'; // 🔴
    } else if (cumulativeScore >= 15) {
      riskLevel = 'warning'; // 🟡
    }

    // Create MongoDB record
    const log = new SecurityLog({
      studentId: studentId && studentId.length === 24 ? studentId : null,
      studentName: studentName || 'Student',
      studentEmail: studentEmail || '',
      examId: examId && examId.length === 24 ? examId : null,
      examTitle: examTitle || 'Live Examination',
      eventType,
      details: details || `Anti-cheat trigger: ${eventType}`,
      severity,
      riskLevel,
      riskScore: weight
    });

    await log.save();

    // Also register in system Activity Log
    try {
      await Activity.create({
        user: studentName || 'Student',
        userId: log.studentId,
        role: 'student',
        action: `Security Alert: ${eventType.replace('_', ' ').toUpperCase()}`,
        details: `${details || eventType} during "${examTitle || 'Exam'}" - Risk: ${riskLevel.toUpperCase()}`,
        type: 'exam'
      });
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Violation logged to Security Monitor in MongoDB',
      riskLevel,
      cumulativeScore,
      log
    });
  } catch (error) {
    console.error('logViolation error:', error);
    return res.status(500).json({ error: 'Failed to record security violation: ' + error.message });
  }
};

// 2. Get Full Security Monitor Telemetry
exports.getSecurityMonitor = async (req, res) => {
  try {
    const { examId, riskLevel, eventType } = req.query;

    const query = {};
    if (examId) query.examId = examId;
    if (riskLevel && riskLevel !== 'all') query.riskLevel = riskLevel;
    if (eventType && eventType !== 'all') query.eventType = eventType;

    const logs = await SecurityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(200);

    const allLogs = await SecurityLog.find();

    // Aggregate statistics
    const totalViolations = allLogs.length;
    const highRiskCount = allLogs.filter((l) => l.riskLevel === 'high_risk').length;
    const warningCount = allLogs.filter((l) => l.riskLevel === 'warning').length;
    const normalCount = allLogs.filter((l) => l.riskLevel === 'normal').length;

    // Student Risk Mapping (per student total violations & status)
    const studentMap = {};
    allLogs.forEach((l) => {
      const key = l.studentId ? String(l.studentId) : l.studentName;
      if (!studentMap[key]) {
        studentMap[key] = {
          studentId: l.studentId,
          studentName: l.studentName,
          studentEmail: l.studentEmail,
          examTitle: l.examTitle,
          totalViolations: 0,
          totalScore: 0,
          latestEvent: l.eventType,
          lastSeen: l.timestamp,
          events: []
        };
      }
      studentMap[key].totalViolations += 1;
      studentMap[key].totalScore += (l.riskScore || 10);
      studentMap[key].events.push(l.eventType);
      if (new Date(l.timestamp) > new Date(studentMap[key].lastSeen)) {
        studentMap[key].lastSeen = l.timestamp;
        studentMap[key].latestEvent = l.eventType;
      }
    });

    const studentSummaries = Object.values(studentMap).map((s) => {
      let risk = 'normal';
      if (s.totalScore >= 45 || s.totalViolations >= 3) {
        risk = 'high_risk'; // 🔴
      } else if (s.totalScore >= 15 || s.totalViolations >= 1) {
        risk = 'warning'; // 🟡
      }
      return { ...s, riskLevel: risk };
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalViolations,
        highRiskStudents: studentSummaries.filter((s) => s.riskLevel === 'high_risk').length,
        warningStudents: studentSummaries.filter((s) => s.riskLevel === 'warning').length,
        normalStudents: studentSummaries.filter((s) => s.riskLevel === 'normal').length,
        criticalEventsCount: allLogs.filter((l) => l.severity === 'critical').length
      },
      studentSummaries,
      logs
    });
  } catch (error) {
    console.error('getSecurityMonitor error:', error);
    return res.status(500).json({ error: 'Failed to fetch security telemetry' });
  }
};

// 3. Clear Security Logs (Admin only)
exports.clearSecurityLogs = async (req, res) => {
  try {
    await SecurityLog.deleteMany({});
    return res.status(200).json({
      success: true,
      message: 'All Security Monitor violation logs cleared successfully.'
    });
  } catch (error) {
    console.error('clearSecurityLogs error:', error);
    return res.status(500).json({ error: 'Failed to clear security logs' });
  }
};

const auditLogger = require('../../lib/firebase-audit');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, startDate, endDate } = req.query;

    // If sessionId is provided, get stats for that specific session
    if (sessionId) {
      const sessionStats = await auditLogger.getSessionStats(sessionId);
      
      if (!sessionStats) {
        return res.status(404).json({ error: 'Session not found' });
      }

      return res.status(200).json({
        type: 'session',
        data: sessionStats
      });
    }

    // Otherwise, get overall analytics
    const filters = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const analytics = await auditLogger.getAnalytics(filters);
    
    if (!analytics) {
      return res.status(500).json({ error: 'Failed to retrieve analytics' });
    }

    return res.status(200).json({
      type: 'overall',
      data: analytics
    });

  } catch (error) {
    console.error('❌ Error retrieving analytics:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
} 
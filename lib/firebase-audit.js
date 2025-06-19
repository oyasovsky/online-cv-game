const { adminDb } = require('./firebase-admin');

/**
 * Firebase Audit Logger for OlgaGPT Chat Sessions
 * Logs all questions, responses, and session metadata for analytics and improvement
 */

class FirebaseAuditLogger {
  constructor() {
    this.collection = 'chat_audit_logs';
  }

  /**
   * Create a new chat session
   * @param {string} sessionId - Unique session identifier
   * @param {Object} metadata - Session metadata
   * @returns {Promise<string>} Session document ID
   */
  async createSession(sessionId, metadata = {}) {
    const sessionData = {
      sessionId,
      createdAt: new Date(),
      updatedAt: new Date(),
      questionCount: 0,
      totalTokens: 0,
      userAgent: metadata.userAgent || '',
      ipAddress: metadata.ipAddress || '',
      referrer: metadata.referrer || '',
      questions: [],
      ...metadata
    };

    try {
      const docRef = await adminDb.collection(this.collection).add(sessionData);
      console.log(`📊 Created audit session: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating audit session:', error);
      throw error;
    }
  }

  /**
   * Log a question and its response
   * @param {string} sessionId - Session identifier
   * @param {Object} questionData - Question and response data
   * @returns {Promise<void>}
   */
  async logQuestion(sessionId, questionData) {
    const {
      question,
      response,
      confidence,
      sources,
      responseTime,
      tokensUsed,
      followUpTo = null, // ID of previous question this follows up to
      questionNumber = null
    } = questionData;

    const questionLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question,
      response,
      confidence,
      sources: sources || [],
      responseTime,
      tokensUsed: tokensUsed || 0,
      followUpTo,
      questionNumber,
      timestamp: new Date(),
      wordCount: response ? response.split(' ').length : 0,
      characterCount: response ? response.length : 0
    };

    try {
      // Update the session document
      const sessionQuery = await adminDb.collection(this.collection)
        .where('sessionId', '==', sessionId)
        .limit(1)
        .get();

      if (!sessionQuery.empty) {
        const sessionDoc = sessionQuery.docs[0];
        const sessionData = sessionDoc.data();
        
        // Add question to the questions array
        const updatedQuestions = [...(sessionData.questions || []), questionLog];
        
        await sessionDoc.ref.update({
          questions: updatedQuestions,
          questionCount: sessionData.questionCount + 1,
          totalTokens: (sessionData.totalTokens || 0) + (tokensUsed || 0),
          updatedAt: new Date(),
          lastQuestion: question,
          lastResponseTime: responseTime
        });

        console.log(`📝 Logged question ${questionNumber || sessionData.questionCount + 1} for session: ${sessionId}`);
      } else {
        console.warn(`⚠️ Session not found for logging: ${sessionId}`);
      }
    } catch (error) {
      console.error('❌ Error logging question:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Get session statistics
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Object>} Session statistics
   */
  async getSessionStats(sessionId) {
    try {
      const sessionQuery = await adminDb.collection(this.collection)
        .where('sessionId', '==', sessionId)
        .limit(1)
        .get();

      if (!sessionQuery.empty) {
        const sessionData = sessionQuery.docs[0].data();
        const questions = sessionData.questions || [];
        
        return {
          sessionId,
          questionCount: questions.length,
          totalTokens: sessionData.totalTokens || 0,
          averageResponseTime: questions.length > 0 
            ? questions.reduce((sum, q) => sum + (q.responseTime || 0), 0) / questions.length 
            : 0,
          averageConfidence: questions.length > 0
            ? questions.reduce((sum, q) => sum + (q.confidence || 0), 0) / questions.length
            : 0,
          totalWords: questions.reduce((sum, q) => sum + (q.wordCount || 0), 0),
          totalCharacters: questions.reduce((sum, q) => sum + (q.characterCount || 0), 0),
          createdAt: sessionData.createdAt,
          updatedAt: sessionData.updatedAt
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting session stats:', error);
      return null;
    }
  }

  /**
   * Get analytics across all sessions
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics(filters = {}) {
    try {
      let query = adminDb.collection(this.collection);
      
      // Apply date filters if provided
      if (filters.startDate) {
        query = query.where('createdAt', '>=', new Date(filters.startDate));
      }
      if (filters.endDate) {
        query = query.where('createdAt', '<=', new Date(filters.endDate));
      }

      const snapshot = await query.get();
      const sessions = snapshot.docs.map(doc => doc.data());
      
      const allQuestions = sessions.flatMap(session => session.questions || []);
      
      return {
        totalSessions: sessions.length,
        totalQuestions: allQuestions.length,
        averageQuestionsPerSession: sessions.length > 0 
          ? allQuestions.length / sessions.length 
          : 0,
        averageResponseTime: allQuestions.length > 0
          ? allQuestions.reduce((sum, q) => sum + (q.responseTime || 0), 0) / allQuestions.length
          : 0,
        averageConfidence: allQuestions.length > 0
          ? allQuestions.reduce((sum, q) => sum + (q.confidence || 0), 0) / allQuestions.length
          : 0,
        totalTokens: sessions.reduce((sum, session) => sum + (session.totalTokens || 0), 0),
        mostCommonSources: this.getMostCommonSources(allQuestions),
        topQuestions: this.getTopQuestions(allQuestions),
        sessionDuration: this.getAverageSessionDuration(sessions)
      };
    } catch (error) {
      console.error('❌ Error getting analytics:', error);
      return null;
    }
  }

  /**
   * Get most common sources used in responses
   * @param {Array} questions - Array of question objects
   * @returns {Array} Most common sources
   */
  getMostCommonSources(questions) {
    const sourceCounts = {};
    
    questions.forEach(question => {
      (question.sources || []).forEach(source => {
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });
    });

    return Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([source, count]) => ({ source, count }));
  }

  /**
   * Get top questions by frequency
   * @param {Array} questions - Array of question objects
   * @returns {Array} Top questions
   */
  getTopQuestions(questions) {
    const questionCounts = {};
    
    questions.forEach(question => {
      const normalizedQuestion = question.question.toLowerCase().trim();
      questionCounts[normalizedQuestion] = (questionCounts[normalizedQuestion] || 0) + 1;
    });

    return Object.entries(questionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([question, count]) => ({ question, count }));
  }

  /**
   * Get average session duration
   * @param {Array} sessions - Array of session objects
   * @returns {number} Average duration in minutes
   */
  getAverageSessionDuration(sessions) {
    const durations = sessions
      .filter(session => session.createdAt && session.updatedAt)
      .map(session => {
        const created = session.createdAt.toDate ? session.createdAt.toDate() : new Date(session.createdAt);
        const updated = session.updatedAt.toDate ? session.updatedAt.toDate() : new Date(session.updatedAt);
        return (updated - created) / (1000 * 60); // Convert to minutes
      });

    return durations.length > 0 
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
      : 0;
  }

  /**
   * Clean up old audit logs (optional maintenance)
   * @param {number} daysOld - Delete logs older than this many days
   * @returns {Promise<number>} Number of deleted documents
   */
  async cleanupOldLogs(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const snapshot = await adminDb.collection(this.collection)
        .where('createdAt', '<', cutoffDate)
        .get();

      const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);

      console.log(`🗑️ Cleaned up ${snapshot.docs.length} old audit logs`);
      return snapshot.docs.length;
    } catch (error) {
      console.error('❌ Error cleaning up old logs:', error);
      return 0;
    }
  }
}

module.exports = new FirebaseAuditLogger(); 
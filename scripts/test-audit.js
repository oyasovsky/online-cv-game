#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const auditLogger = require('../lib/firebase-audit');

async function testAuditLogging() {
  console.log('🧪 Testing Firebase Audit Logging...\n');

  try {
    // Test 1: Create a session
    console.log('📊 Test 1: Creating audit session...');
    const sessionId = `test_session_${Date.now()}`;
    const sessionDocId = await auditLogger.createSession(sessionId, {
      userAgent: 'Test Script',
      ipAddress: '127.0.0.1',
      referrer: 'test'
    });
    console.log(`✅ Session created with ID: ${sessionDocId}\n`);

    // Test 2: Log a question
    console.log('📝 Test 2: Logging a test question...');
    await auditLogger.logQuestion(sessionId, {
      question: 'What is your leadership style?',
      response: 'I believe in servant leadership and creating psychological safety for my teams.',
      confidence: 85,
      sources: ['leadership_philosophy.md', 'personal_values.md'],
      responseTime: 2500,
      tokensUsed: 150,
      questionNumber: 1
    });
    console.log('✅ Question logged successfully\n');

    // Test 3: Log a follow-up question
    console.log('📝 Test 3: Logging a follow-up question...');
    await auditLogger.logQuestion(sessionId, {
      question: 'How do you handle difficult team members?',
      response: 'I focus on understanding the root cause and creating a safe space for honest dialogue.',
      confidence: 78,
      sources: ['personal_values.md'],
      responseTime: 1800,
      tokensUsed: 120,
      questionNumber: 2,
      followUpTo: 'test_question_1'
    });
    console.log('✅ Follow-up question logged successfully\n');

    // Test 4: Get session stats
    console.log('📊 Test 4: Getting session statistics...');
    const sessionStats = await auditLogger.getSessionStats(sessionId);
    if (sessionStats) {
      console.log('✅ Session stats retrieved:');
      console.log(`   - Question count: ${sessionStats.questionCount}`);
      console.log(`   - Total tokens: ${sessionStats.totalTokens}`);
      console.log(`   - Average confidence: ${Math.round(sessionStats.averageConfidence)}%`);
      console.log(`   - Average response time: ${Math.round(sessionStats.averageResponseTime)}ms\n`);
    } else {
      console.log('❌ Failed to get session stats\n');
    }

    // Test 5: Get overall analytics
    console.log('📈 Test 5: Getting overall analytics...');
    const analytics = await auditLogger.getAnalytics();
    if (analytics) {
      console.log('✅ Analytics retrieved:');
      console.log(`   - Total sessions: ${analytics.totalSessions}`);
      console.log(`   - Total questions: ${analytics.totalQuestions}`);
      console.log(`   - Average questions per session: ${analytics.averageQuestionsPerSession.toFixed(1)}`);
      console.log(`   - Average response time: ${Math.round(analytics.averageResponseTime)}ms`);
      console.log(`   - Average confidence: ${Math.round(analytics.averageConfidence)}%`);
      console.log(`   - Total tokens: ${analytics.totalTokens}\n`);
    } else {
      console.log('❌ Failed to get analytics\n');
    }

    console.log('🎉 All audit logging tests completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Visit http://localhost:3000/olgagpt to test the chat interface');
    console.log('2. Visit http://localhost:3000/analytics to view the analytics dashboard');
    console.log('3. Check your Firebase Console to see the audit logs in the chat_audit_logs collection');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAuditLogging(); 
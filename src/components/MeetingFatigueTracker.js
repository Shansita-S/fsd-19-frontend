import React, { useState, useEffect } from 'react';
import { meetingsService } from '../api';

const MeetingFatigueTracker = () => {
  const [fatigueData, setFatigueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFatigueData();
  }, []);

  const fetchFatigueData = async () => {
    try {
      // Calculate fatigue based on meeting density and duration
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const response = await meetingsService.getAll({
        startDate: weekAgo.toISOString(),
        endDate: today.toISOString()
      });

      const meetings = response.data || [];
      
      // Calculate fatigue score (0-100)
      const totalMeetings = meetings.length;
      const totalHours = meetings.reduce((sum, m) => {
        const duration = new Date(m.endTime) - new Date(m.startTime);
        return sum + (duration / (1000 * 60 * 60));
      }, 0);

      const avgMeetingsPerDay = totalMeetings / 7;
      const avgHoursPerDay = totalHours / 7;
      
      // Fatigue algorithm
      let fatigueScore = 0;
      if (avgMeetingsPerDay > 6) fatigueScore += 40;
      else if (avgMeetingsPerDay > 4) fatigueScore += 25;
      else if (avgMeetingsPerDay > 2) fatigueScore += 10;
      
      if (avgHoursPerDay > 6) fatigueScore += 40;
      else if (avgHoursPerDay > 4) fatigueScore += 25;
      else if (avgHoursPerDay > 2) fatigueScore += 10;
      
      // Check for back-to-back meetings
      let backToBackCount = 0;
      const sortedMeetings = [...meetings].sort((a, b) => 
        new Date(a.startTime) - new Date(b.startTime)
      );
      
      for (let i = 0; i < sortedMeetings.length - 1; i++) {
        const currentEnd = new Date(sortedMeetings[i].endTime);
        const nextStart = new Date(sortedMeetings[i + 1].startTime);
        if ((nextStart - currentEnd) / (1000 * 60) < 15) {
          backToBackCount++;
        }
      }
      
      if (backToBackCount > 5) fatigueScore += 20;
      else if (backToBackCount > 3) fatigueScore += 10;
      
      fatigueScore = Math.min(fatigueScore, 100);
      
      // Generate recommendations
      const recommendations = generateRecommendations(fatigueScore, avgMeetingsPerDay, avgHoursPerDay, backToBackCount);
      
      setFatigueData({
        score: fatigueScore,
        level: getFatigueLevel(fatigueScore),
        metrics: {
          weeklyMeetings: totalMeetings,
          weeklyHours: totalHours.toFixed(1),
          avgMeetingsPerDay: avgMeetingsPerDay.toFixed(1),
          avgHoursPerDay: avgHoursPerDay.toFixed(1),
          backToBackMeetings: backToBackCount
        },
        recommendations
      });
    } catch (error) {
      console.error('Failed to fetch fatigue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFatigueLevel = (score) => {
    if (score >= 80) return { label: 'Critical', color: 'danger', icon: '🔴' };
    if (score >= 60) return { label: 'High', color: 'warning', icon: '🟠' };
    if (score >= 40) return { label: 'Moderate', color: 'warning', icon: '🟡' };
    if (score >= 20) return { label: 'Low', color: 'success', icon: '🟢' };
    return { label: 'Healthy', color: 'success', icon: '✨' };
  };

  const generateRecommendations = (score, avgMeetings, avgHours, backToBack) => {
    const recs = [];
    
    if (score >= 80) {
      recs.push({
        icon: '🚨',
        title: 'Urgent Action Needed',
        description: 'Your meeting load is critically high. Consider canceling non-essential meetings.',
        priority: 'high'
      });
    }
    
    if (avgMeetings > 5) {
      recs.push({
        icon: '📅',
        title: 'Reduce Meeting Frequency',
        description: `You're averaging ${avgMeetings} meetings/day. Try to decline or delegate 30% of invitations.`,
        priority: 'medium'
      });
    }
    
    if (avgHours > 5) {
      recs.push({
        icon: '⏰',
        title: 'Shorten Meeting Duration',
        description: `You're in meetings ${avgHours}hrs/day. Suggest shorter meetings or async alternatives.`,
        priority: 'medium'
      });
    }
    
    if (backToBack > 3) {
      recs.push({
        icon: '⏸️',
        title: 'Schedule Breaks',
        description: `You have ${backToBack} back-to-back meetings. Add 15-min buffers between meetings.`,
        priority: 'high'
      });
    }
    
    if (score < 40) {
      recs.push({
        icon: '✅',
        title: 'Healthy Balance',
        description: `You're maintaining a good meeting-work balance. Keep it up!`,
        priority: 'low'
      });
    }
    
    recs.push({
      icon: '🧘',
      title: 'Focus Time Protection',
      description: `Block 2-4 hours daily for deep work. Use "Focus Time Guardian" to auto-protect these slots.`,
      priority: 'medium'
    });
    
    return recs;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Analyzing your meeting patterns...</p>
        </div>
      </div>
    );
  }

  if (!fatigueData) {
    return null;
  }

  const { score, level, metrics, recommendations } = fatigueData;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">🧠 Meeting Fatigue Score</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
            AI-powered burnout risk assessment
          </p>
        </div>
      </div>

      {/* Fatigue Score Display */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: `conic-gradient(
            ${score >= 80 ? 'var(--danger)' : score >= 60 ? 'var(--warning)' : score >= 40 ? '#f59e0b' : 'var(--success)'} ${score * 3.6}deg,
            var(--gray-200) ${score * 3.6}deg
          )`,
          position: 'relative',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--gray-900)' }}>
              {score}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
              / 100
            </div>
          </div>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          {level.icon} {level.label} Fatigue
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          Based on your last 7 days of meetings
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3" style={{ gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--gray-900)' }}>
            {metrics.weeklyMeetings}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
            Meetings/Week
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--gray-900)' }}>
            {metrics.weeklyHours}h
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
            Hours/Week
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--gray-900)' }}>
            {metrics.backToBackMeetings}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
            Back-to-Back
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--gray-900)' }}>
          📋 Personalized Recommendations
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recommendations.map((rec, index) => (
            <div 
              key={index}
              style={{
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid var(--gray-200)`,
                background: rec.priority === 'high' ? 'rgba(239, 68, 68, 0.05)' : 'white'
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>{rec.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--gray-900)' }}>
                    {rec.title}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    {rec.description}
                  </div>
                </div>
                {rec.priority === 'high' && (
                  <span className="badge badge-danger">Urgent</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MeetingFatigueTracker;

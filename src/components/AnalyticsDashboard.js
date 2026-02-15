import React, { useState, useEffect } from 'react';
import { analyticsService } from '../api';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [productivity, setProductivity] = useState(null);
  const [trends, setTrends] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsData, healthData, productivityData, trendsData] = await Promise.all([
        analyticsService.getDashboard(period),
        analyticsService.getHealthScore(),
        analyticsService.getProductivity(),
        analyticsService.getTrends()
      ]);
      
      setAnalytics(analyticsData.data);
      setHealthScore(healthData.data);
      setProductivity(productivityData.data);
      setTrends(trendsData.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>📊 Meeting Analytics</h1>
        <div className="period-selector">
          <button
            className={period === 'weekly' ? 'active' : ''}
            onClick={() => setPeriod('weekly')}
          >
            Week
          </button>
          <button
            className={period === 'monthly' ? 'active' : ''}
            onClick={() => setPeriod('monthly')}
          >
            Month
          </button>
          <button
            className={period === 'quarterly' ? 'active' : ''}
            onClick={() => setPeriod('quarterly')}
          >
            Quarter
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'overview' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'health' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('health')}
        >
          Health Score
        </button>
        <button
          className={activeTab === 'productivity' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('productivity')}
        >
          Productivity
        </button>
        <button
          className={activeTab === 'trends' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('trends')}
        >
          Trends
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="tab-content">
          <div className="metrics-grid">
            <MetricCard
              title="Total Meetings"
              value={analytics.metrics.totalMeetings}
              icon="📅"
              trend={analytics.trends.meetingCountChange}
            />
            <MetricCard
              title="Meeting Hours"
              value={Math.round(analytics.metrics.totalMeetingMinutes / 60)}
              icon="⏱️"
              suffix="hrs"
              trend={analytics.trends.durationChange}
            />
            <MetricCard
              title="Avg Duration"
              value={analytics.metrics.averageMeetingDuration}
              icon="⏳"
              suffix="min"
            />
            <MetricCard
              title="Attendance Rate"
              value={analytics.metrics.averageAttendanceRate}
              icon="✅"
              suffix="%"
            />
          </div>

          {/* Score Cards */}
          <div className="score-cards">
            <ScoreCard
              title="Meeting Health"
              score={analytics.scores.meetingHealthScore}
              description="Overall meeting quality and effectiveness"
              color={getScoreColor(analytics.scores.meetingHealthScore)}
            />
            <ScoreCard
              title="Productivity"
              score={analytics.scores.productivityScore}
              description="Meeting preparation and outcomes"
              color={getScoreColor(analytics.scores.productivityScore)}
            />
            <ScoreCard
              title="Work-Life Balance"
              score={analytics.scores.workLifeBalanceScore}
              description="Meeting load vs. available time"
              color={getScoreColor(analytics.scores.workLifeBalanceScore)}
            />
            <ScoreCard
              title="Engagement"
              score={analytics.scores.engagementScore}
              description="Participation and feedback levels"
              color={getScoreColor(analytics.scores.engagementScore)}
            />
          </div>

          {/* Insights */}
          {analytics.insights && analytics.insights.length > 0 && (
            <div className="insights-section">
              <h2>💡 Insights & Recommendations</h2>
              <div className="insights-list">
                {analytics.insights.map((insight, index) => (
                  <InsightCard key={index} insight={insight} />
                ))}
              </div>
            </div>
          )}

          {/* Action Items Stats */}
          <div className="action-items-stats">
            <h2>✅ Action Items</h2>
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-value">{analytics.actionItems.total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{analytics.actionItems.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{analytics.actionItems.overdue}</span>
                <span className="stat-label">Overdue</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{analytics.actionItems.completionRate}%</span>
                <span className="stat-label">Completion Rate</span>
              </div>
            </div>
          </div>

          {/* Focus Time */}
          <div className="focus-time-section">
            <h2>🎯 Focus Time</h2>
            <div className="focus-time-chart">
              <div className="time-bar">
                <div
                  className="time-bar-used"
                  style={{
                    width: `${(analytics.focusTime.minutesInterrupted / analytics.focusTime.totalMinutesAvailable) * 100}%`
                  }}
                >
                  Meetings: {Math.round(analytics.focusTime.minutesInterrupted / 60)}h
                </div>
                <div className="time-bar-protected">
                  Focus: {Math.round(analytics.focusTime.minutesProtected / 60)}h
                </div>
              </div>
              <div className="focus-time-stats">
                <p>Protected Focus Time: {analytics.focusTime.protectionRate}%</p>
                <p>Longest Focus Block: {analytics.focusTime.longestFocusBlock} minutes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Score Tab */}
      {activeTab === 'health' && healthScore && (
        <div className="tab-content">
          <div className="health-score-container">
            <div className="health-score-main">
              <div className={`score-circle score-${getScoreLevel(healthScore.overallScore)}`}>
                <span className="score-number">{healthScore.overallScore}</span>
                <span className="score-max">/100</span>
              </div>
              <h2>Overall Health Score</h2>
              <p className="score-trend">
                {healthScore.trend === 'improving' ? '📈 Improving' : '📉 Declining'}
              </p>
            </div>

            <div className="health-breakdown">
              <h3>Score Breakdown</h3>
              <HealthBar
                label="Meeting Frequency"
                score={healthScore.breakdown.meetingFrequency}
              />
              <HealthBar
                label="Meeting Duration"
                score={healthScore.breakdown.meetingDuration}
              />
              <HealthBar
                label="Punctuality"
                score={healthScore.breakdown.punctuality}
              />
              <HealthBar
                label="Preparation"
                score={healthScore.breakdown.preparation}
              />
              <HealthBar
                label="Follow Through"
                score={healthScore.breakdown.followThrough}
              />
            </div>

            {healthScore.recommendations && healthScore.recommendations.length > 0 && (
              <div className="recommendations">
                <h3>🎯 Recommendations</h3>
                <ul>
                  {healthScore.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Productivity Tab */}
      {activeTab === 'productivity' && productivity && (
        <div className="tab-content">
          <div className="productivity-metrics">
            <h2>Productivity Metrics</h2>
            <div className="metrics-grid">
              <MetricCard
                title="Avg Productivity Score"
                value={Math.round(productivity.metrics.averageProductivityScore)}
                icon="📊"
                suffix="/100"
              />
              <MetricCard
                title="Meetings with Agenda"
                value={productivity.metrics.meetingsWithAgenda}
                icon="📝"
              />
              <MetricCard
                title="Meetings with Action Items"
                value={productivity.metrics.meetingsWithActionItems}
                icon="✅"
              />
            </div>
          </div>

          {productivity.insights && productivity.insights.length > 0 && (
            <div className="insights-section">
              <h2>💡 Insights</h2>
              {productivity.insights.map((insight, index) => (
                <div key={index} className={`insight-box insight-${insight.type}`}>
                  <span className="insight-icon">{insight.icon}</span>
                  <p>{insight.message}</p>
                </div>
              ))}
            </div>
          )}

          {productivity.recommendations && productivity.recommendations.length > 0 && (
            <div className="recommendations-grid">
              <h2>🚀 Recommendations</h2>
              {productivity.recommendations.map((rec, index) => (
                <RecommendationCard key={index} recommendation={rec} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && trends && (
        <div className="tab-content">
          <div className="trends-container">
            <h2>📈 Meeting Trends</h2>
            
            {/* Weekly Trends */}
            <div className="trend-section">
              <h3>Weekly Meeting Count</h3>
              <div className="trend-chart">
                {trends.weeklyTrends.map((week, index) => (
                  <div key={index} className="trend-bar">
                    <div
                      className="bar"
                      style={{ height: `${(week.count / 20) * 100}px` }}
                    ></div>
                    <span className="bar-label">{week.week.slice(5)}</span>
                    <span className="bar-value">{week.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Distribution */}
            <div className="trend-section">
              <h3>Meeting Distribution by Hour</h3>
              <div className="hourly-chart">
                {trends.hourlyDistribution
                  .filter(h => h.count > 0)
                  .map((hour, index) => (
                    <div key={index} className="hour-bar">
                      <span className="hour-label">{hour.hour}:00</span>
                      <div
                        className="hour-bar-fill"
                        style={{ width: `${(hour.count / Math.max(...trends.hourlyDistribution.map(h => h.count))) * 100}%` }}
                      >
                        {hour.count}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Type Distribution */}
            <div className="trend-section">
              <h3>Meetings by Type</h3>
              <div className="type-distribution">
                {trends.typeDistribution.map((type, index) => (
                  <div key={index} className="type-card">
                    <span className="type-name">{type.type}</span>
                    <span className="type-count">{type.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictions */}
            {trends.predictions && (
              <div className="predictions-section">
                <h3>📊 Predictions</h3>
                <div className="prediction-box">
                  <p>Expected meetings next week: <strong>{trends.predictions.nextWeekMeetings}</strong></p>
                  <p>Trend: <strong>{trends.predictions.trend}</strong></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const MetricCard = ({ title, value, icon, suffix = '', trend }) => (
  <div className="metric-card">
    <div className="metric-icon">{icon}</div>
    <div className="metric-content">
      <h3>{title}</h3>
      <div className="metric-value">
        {value}{suffix}
        {trend !== undefined && (
          <span className={`trend ${trend >= 0 ? 'positive' : 'negative'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  </div>
);

const ScoreCard = ({ title, score, description, color }) => (
  <div className="score-card" style={{ borderLeftColor: color }}>
    <h3>{title}</h3>
    <div className="score-display">
      <span className="score" style={{ color }}>{score}</span>
      <span className="score-max">/100</span>
    </div>
    <p>{description}</p>
    <div className="score-bar">
      <div
        className="score-bar-fill"
        style={{ width: `${score}%`, backgroundColor: color }}
      ></div>
    </div>
  </div>
);

const InsightCard = ({ insight }) => (
  <div className={`insight-card insight-${insight.severity}`}>
    <div className="insight-header">
      <h4>{insight.title}</h4>
      <span className={`severity-badge ${insight.severity}`}>
        {insight.severity}
      </span>
    </div>
    <p className="insight-description">{insight.description}</p>
    {insight.recommendation && (
      <div className="insight-recommendation">
        <strong>💡 Recommendation:</strong> {insight.recommendation}
      </div>
    )}
    {insight.impact && (
      <div className="insight-impact">
        <strong>Impact:</strong> {insight.impact}
      </div>
    )}
  </div>
);

const HealthBar = ({ label, score }) => (
  <div className="health-bar">
    <div className="health-bar-label">{label}</div>
    <div className="health-bar-container">
      <div
        className={`health-bar-fill health-${getScoreLevel(score)}`}
        style={{ width: `${score}%` }}
      ></div>
    </div>
    <div className="health-bar-score">{score}</div>
  </div>
);

const RecommendationCard = ({ recommendation }) => (
  <div className="recommendation-card">
    <h4>{recommendation.title}</h4>
    <p>{recommendation.description}</p>
    <div className="recommendation-badges">
      <span className={`badge impact-${recommendation.impact.toLowerCase()}`}>
        Impact: {recommendation.impact}
      </span>
      <span className={`badge effort-${recommendation.effort.toLowerCase()}`}>
        Effort: {recommendation.effort}
      </span>
    </div>
  </div>
);

// Helper Functions
const getScoreColor = (score) => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
};

const getScoreLevel = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
};

export default AnalyticsDashboard;

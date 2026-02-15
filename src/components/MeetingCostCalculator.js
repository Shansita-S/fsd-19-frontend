import React, { useState, useEffect } from 'react';
import { meetingsService, usersService } from '../api';

const MeetingCostCalculator = () => {
  const [meetings, setMeetings] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [avgSalary, setAvgSalary] = useState(75000); // Default average salary
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week'); // week, month, year

  useEffect(() => {
    calculateCosts();
  }, [timeframe, avgSalary]);

  const calculateCosts = async () => {
    setLoading(true);
    try {
      const today = new Date();
      let startDate;
      
      switch(timeframe) {
        case 'week':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const response = await meetingsService.getAll({
        startDate: startDate.toISOString(),
        endDate: today.toISOString()
      });

      const meetingsData = response.data || [];
      
      // Calculate cost for each meeting
      const meetingsWithCost = meetingsData.map(meeting => {
        const duration = (new Date(meeting.endTime) - new Date(meeting.startTime)) / (1000 * 60 * 60); // hours
        const participants = meeting.participants?.length || 1;
        
        // Cost calculation: (avg salary / 2080 work hours per year) * duration * participants
        const hourlyRate = avgSalary / 2080;
        const cost = hourlyRate * duration * participants;
        
        return {
          ...meeting,
          duration,
          participants,
          cost
        };
      });

      // Sort by cost descending
      meetingsWithCost.sort((a, b) => b.cost - a.cost);
      
      const total = meetingsWithCost.reduce((sum, m) => sum + m.cost, 0);
      
      setMeetings(meetingsWithCost.slice(0, 10)); // Top 10 most expensive
      setTotalCost(total);
    } catch (error) {
      console.error('Failed to calculate costs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTimeframeLabel = () => {
    switch(timeframe) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'This Week';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Calculating meeting costs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">💰 Meeting Cost Calculator</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
            Real-time financial impact of your meetings
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn btn-sm ${timeframe === 'week' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTimeframe('week')}
          >
            Week
          </button>
          <button 
            className={`btn btn-sm ${timeframe === 'month' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTimeframe('month')}
          >
            Month
          </button>
          <button 
            className={`btn btn-sm ${timeframe === 'year' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTimeframe('year')}
          >
            Year
          </button>
        </div>
      </div>

      {/* Total Cost Display */}
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
          Total Meeting Cost - {getTimeframeLabel()}
        </div>
        <div style={{ fontSize: '3rem', fontWeight: '700' }}>
          {formatCurrency(totalCost)}
        </div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '0.5rem' }}>
          {meetings.reduce((sum, m) => sum + m.duration, 0).toFixed(1)} hours across {meetings.length} meetings
        </div>
      </div>

      {/* Salary Input */}
      <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
        <label className="form-label" style={{ marginBottom: '0.5rem' }}>
          Average Team Salary (Annual)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input 
            type="range"
            min="40000"
            max="200000"
            step="5000"
            value={avgSalary}
            onChange={(e) => setAvgSalary(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <div style={{ 
            minWidth: '120px',
            padding: '0.5rem 1rem',
            background: 'white',
            borderRadius: '6px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {formatCurrency(avgSalary)}
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
          💡 Adjust this to match your team's average salary for accurate cost calculations
        </div>
      </div>

      {/* Insights */}
      <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '1.25rem' }}>📊</span>
        <div>
          <strong>Cost Insight:</strong> Based on {formatCurrency(avgSalary)} average salary, each meeting hour costs approximately {formatCurrency(avgSalary / 2080)} per person. A 1-hour meeting with 5 people costs {formatCurrency((avgSalary / 2080) * 5)}.
        </div>
      </div>

      {/* Most Expensive Meetings */}
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--gray-900)' }}>
          💸 Most Expensive Meetings
        </h4>
        
        {meetings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <div className="empty-state-title">No meetings in this timeframe</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {meetings.map((meeting, index) => (
              <div 
                key={meeting._id || index}
                style={{
                  padding: '1rem',
                  border: '1px solid var(--gray-200)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: index < 3 ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'var(--gray-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: index < 3 ? 'white' : 'var(--gray-600)',
                  fontSize: '1.125rem',
                  flexShrink: 0
                }}>
                  #{index + 1}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    marginBottom: '0.25rem', 
                    color: 'var(--gray-900)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {meeting.title}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    {meeting.duration.toFixed(1)}h × {meeting.participants} participants
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: index < 3 ? 'var(--danger)' : 'var(--gray-900)' }}>
                    {formatCurrency(meeting.cost)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                    {formatCurrency(meeting.cost / meeting.participants)}/person
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cost Saving Tips */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--gray-900)' }}>
          💡 Cost Reduction Tips
        </h4>
        <ul style={{ fontSize: '0.875rem', color: 'var(--gray-600)', paddingLeft: '1.25rem', margin: 0 }}>
          <li>Reduce meeting duration by 25% → Save {formatCurrency(totalCost * 0.25)}</li>
          <li>Make 2 participants optional → Save ~{formatCurrency(totalCost * 0.2)}</li>
          <li>Replace 3 meetings with async updates → Save ~{formatCurrency(totalCost * 0.15)}</li>
          <li>Start meetings late? Each 5-min delay costs {formatCurrency((avgSalary / 2080) * (5/60) * (meetings[0]?.participants || 5))}</li>
        </ul>
      </div>
    </div>
  );
};

export default MeetingCostCalculator;

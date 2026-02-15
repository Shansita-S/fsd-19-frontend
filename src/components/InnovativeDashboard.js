import React, { useState } from 'react';
import MeetingFatigueTracker from './MeetingFatigueTracker';
import FocusTimeGuardian from './FocusTimeGuardian';
import MeetingCostCalculator from './MeetingCostCalculator';
import '../ModernUI.css';

const InnovativeDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">✨ Innovative Meeting Intelligence</h1>
        <p className="page-subtitle">
          AI-powered insights and tools that don't exist anywhere else
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'fatigue' ? 'active' : ''}`}
          onClick={() => setActiveTab('fatigue')}
        >
          🧠 Fatigue Monitor
        </button>
        <button 
          className={`tab ${activeTab === 'focus' ? 'active' : ''}`}
          onClick={() => setActiveTab('focus')}
        >
          🛡️ Focus Guardian
        </button>
        <button 
          className={`tab ${activeTab === 'cost' ? 'active' : ''}`}
          onClick={() => setActiveTab('cost')}
        >
          💰 Cost Analysis
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Hero Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '3rem',
            borderRadius: '16px',
            color: 'white',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
              Welcome to the Future of Meeting Management
            </h2>
            <p style={{ fontSize: '1.125rem', opacity: 0.9, maxWidth: '800px', margin: '0 auto' }}>
              We're introducing truly innovative features that prioritize your wellbeing, productivity, and time. These aren't just scheduling tools—they're your meeting intelligence system.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('fatigue')}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
                Meeting Fatigue Tracker
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                AI analyzes your meeting patterns to detect burnout risk before it happens. Get personalized recommendations to maintain healthy balance.
              </p>
              <span className="badge badge-primary">Unique Algorithm</span>
            </div>

            <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('focus')}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
                Focus Time Guardian
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                Automatically protect 2-4 hours daily for deep work. The system intelligently declines meetings during your focus blocks.
              </p>
              <span className="badge badge-success">Auto-Protection</span>
            </div>

            <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('cost')}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
                Real-Time Cost Calculator
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                See the actual dollar cost of every meeting based on participant salaries. Make data-driven decisions about meeting necessity.
              </p>
              <span className="badge badge-warning">Financial Intelligence</span>
            </div>
          </div>

          {/* Why These Features Are Innovative */}
          <div className="card" style={{ background: 'var(--gray-50)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--gray-900)' }}>
              🚀 Why These Features Are Revolutionary
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>1</div>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--gray-900)' }}>
                      Proactive Health Monitoring
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      Unlike calendars that just schedule, we actively monitor your meeting health and warn you before burnout occurs.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'var(--success)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>2</div>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--gray-900)' }}>
                      Automated Protection
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      Focus Guardian doesn't just suggest blocks—it actively protects them by auto-declining conflicting meetings.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'var(--warning)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>3</div>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--gray-900)' }}>
                      Financial Transparency
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      First-ever real-time cost calculation. See exactly how much each meeting costs your organization.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'var(--info)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>4</div>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--gray-900)' }}>
                      Personalized Insights
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      Get custom recommendations based on YOUR meeting patterns, not generic productivity tips.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'var(--danger)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>5</div>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--gray-900)' }}>
                      Behavior Change
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      These tools don't just inform—they actively help you change meeting culture and reduce waste.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: '#8b5cf6',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>6</div>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--gray-900)' }}>
                      Predictive Intelligence
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      ML algorithms learn your patterns and predict optimal meeting times before you even ask.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fatigue' && <MeetingFatigueTracker />}
      {activeTab === 'focus' && <FocusTimeGuardian />}
      {activeTab === 'cost' && <MeetingCostCalculator />}
    </div>
  );
};

export default InnovativeDashboard;

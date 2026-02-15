import React, { useState, useEffect } from 'react';
import { usersService, meetingsService } from '../api';

const FocusTimeGuardian = () => {
  const [focusBlocks, setFocusBlocks] = useState([]);
  const [stats, setStats] = useState(null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newBlock, setNewBlock] = useState({
    day: 'Monday',
    startTime: '09:00',
    endTime: '11:00',
    reason: 'Deep Work'
  });

  useEffect(() => {
    loadFocusBlocks();
    calculateStats();
  }, []);

  const loadFocusBlocks = async () => {
    try {
      const user = await usersService.getMe();
      setFocusBlocks(user.data.preferences?.focusTimeBlocks || []);
    } catch (error) {
      console.error('Failed to load focus blocks:', error);
    }
  };

  const calculateStats = async () => {
    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const meetings = await meetingsService.getAll({
        startDate: weekAgo.toISOString(),
        endDate: today.toISOString()
      });

      const totalHours = meetings.data.reduce((sum, m) => {
        const duration = (new Date(m.endTime) - new Date(m.startTime)) / (1000 * 60 * 60);
        return sum + duration;
      }, 0);

      const focusHoursPerWeek = focusBlocks.reduce((sum, block) => {
        const start = parseTime(block.startTime);
        const end = parseTime(block.endTime);
        return sum + (end - start);
      }, 0);

      const protectedPercentage = focusHoursPerWeek > 0 
        ? ((focusHoursPerWeek / (focusHoursPerWeek + totalHours)) * 100)
        : 0;

      setStats({
        totalMeetingHours: totalHours.toFixed(1),
        focusHoursPerWeek: focusHoursPerWeek.toFixed(1),
        protectedPercentage: protectedPercentage.toFixed(0),
        blocksProtected: focusBlocks.length
      });
    } catch (error) {
      console.error('Failed to calculate stats:', error);
    }
  };

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  };

  const addFocusBlock = async () => {
    try {
      const updatedBlocks = [...focusBlocks, { ...newBlock, id: Date.now() }];
      await usersService.updatePreferences({ focusTimeBlocks: updatedBlocks });
      setFocusBlocks(updatedBlocks);
      setShowAddBlock(false);
      setNewBlock({ day: 'Monday', startTime: '09:00', endTime: '11:00', reason: 'Deep Work' });
      calculateStats();
    } catch (error) {
      console.error('Failed to add focus block:', error);
      alert('Failed to add focus block');
    }
  };

  const removeFocusBlock = async (blockId) => {
    try {
      const updatedBlocks = focusBlocks.filter(b => b.id !== blockId);
      await usersService.updatePreferences({ focusTimeBlocks: updatedBlocks });
      setFocusBlocks(updatedBlocks);
      calculateStats();
    } catch (error) {
      console.error('Failed to remove focus block:', error);
    }
  };

  const toggleProtection = async (blockId) => {
    try {
      const updatedBlocks = focusBlocks.map(b => 
        b.id === blockId ? { ...b, enabled: !b.enabled } : b
      );
      await usersService.updatePreferences({ focusTimeBlocks: updatedBlocks });
      setFocusBlocks(updatedBlocks);
    } catch (error) {
      console.error('Failed to toggle protection:', error);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const reasons = ['Deep Work', 'Learning Time', 'Creative Work', 'Planning', 'Personal Time'];

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">🛡️ Focus Time Guardian</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
            Automatically protect your deep work time from meetings
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddBlock(true)}>
          + Add Block
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4" style={{ gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
              {stats.blocksProtected}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
              Blocks Protected
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
              {stats.focusHoursPerWeek}h
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
              Focus/Week
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--warning)' }}>
              {stats.totalMeetingHours}h
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
              Meetings/Week
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--info)' }}>
              {stats.protectedPercentage}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
              Protected Time
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.25rem' }}>💡</span>
        <div>
          <strong>How it works:</strong> Focus blocks automatically decline meeting invitations during protected hours. You'll get 2-4 hours daily for deep, uninterrupted work.
        </div>
      </div>

      {/* Focus Blocks List */}
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--gray-900)' }}>
          Your Protected Time Blocks
        </h4>
        
        {focusBlocks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <div className="empty-state-title">No focus blocks yet</div>
            <p>Add your first focus block to start protecting your deep work time</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {days.map(day => {
              const dayBlocks = focusBlocks.filter(b => b.day === day);
              if (dayBlocks.length === 0) return null;
              
              return (
                <div key={day}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    {day}
                  </div>
                  {dayBlocks.map(block => (
                    <div 
                      key={block.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--gray-200)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '0.5rem',
                        background: block.enabled !== false ? 'white' : 'var(--gray-50)',
                        opacity: block.enabled !== false ? 1 : 0.6
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--gray-900)' }}>
                          🎯 {block.reason}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          {block.startTime} - {block.endTime} ({parseTime(block.endTime) - parseTime(block.startTime)}h)
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <label className="toggle">
                          <input 
                            type="checkbox" 
                            checked={block.enabled !== false}
                            onChange={() => toggleProtection(block.id)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => removeFocusBlock(block.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Block Modal */}
      {showAddBlock && (
        <div className="modal-overlay" onClick={() => setShowAddBlock(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Focus Time Block</h3>
            </div>
            
            <div className="form-group">
              <label className="form-label">Day of Week</label>
              <select 
                className="form-select"
                value={newBlock.day}
                onChange={(e) => setNewBlock({ ...newBlock, day: e.target.value })}
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input 
                  type="time"
                  className="form-input"
                  value={newBlock.startTime}
                  onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input 
                  type="time"
                  className="form-input"
                  value={newBlock.endTime}
                  onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Purpose</label>
              <select 
                className="form-select"
                value={newBlock.reason}
                onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
              >
                {reasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddBlock(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={addFocusBlock}>
                Add Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusTimeGuardian;

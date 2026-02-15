import React, { useState, useEffect } from 'react';
import { meetingsService, usersService } from '../api';

const SmartScheduler = ({ onScheduled }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    participants: [],
    type: 'team',
    priority: 'medium',
    requireAgenda: true
  });
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [optimalTimes, setOptimalTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const response = await usersService.getAll();
      const allUsers = response.data || response.data?.users || [];
      const participantsOnly = allUsers.filter(u => u && u._id && u.role === 'PARTICIPANT');
      setAvailableParticipants(participantsOnly);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      // Try alternative endpoint
      try {
        const response = await usersService.getParticipants();
        setAvailableParticipants(response.data || []);
      } catch (err) {
        console.error('Failed to fetch participants from alternative endpoint:', err);
        setAvailableParticipants([]);
      }
    }
  };

  const findOptimalTimes = async () => {
    if (formData.participants.length === 0) {
      alert('Please select at least one participant');
      return;
    }

    setLoading(true);
    try {
      const response = await meetingsService.findOptimalTimes({
        participants: formData.participants,
        duration: formData.duration,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      setOptimalTimes(response.data);
      setStep(3);
    } catch (error) {
      console.error('Failed to find optimal times:', error);
      alert('Failed to find optimal times');
    } finally {
      setLoading(false);
    }
  };

  const scheduleMeeting = async () => {
    if (!selectedTime) {
      alert('Please select a time slot');
      return;
    }

    setLoading(true);
    try {
      const meetingData = {
        ...formData,
        startTime: selectedTime.start,
        endTime: selectedTime.end
      };

      await meetingsService.create(meetingData);
      alert('Meeting scheduled successfully!');
      if (onScheduled) onScheduled();
    } catch (error) {
      if (error.response?.data?.conflicts) {
        setConflicts(error.response.data.conflicts);
        alert('Scheduling conflicts detected. Please choose a different time.');
      } else {
        console.error('Failed to schedule meeting:', error);
        alert('Failed to schedule meeting');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smart-scheduler">
      <div className="scheduler-header">
        <h2>🤖 AI-Powered Smart Scheduler</h2>
        <div className="progress-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Details</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Participants</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Time Selection</div>
        </div>
      </div>

      {/* Step 1: Meeting Details */}
      {step === 1 && (
        <div className="scheduler-step">
          <h3>Meeting Details</h3>
          
          <div className="form-group">
            <label>Meeting Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter meeting title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this meeting about?"
              rows="3"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes)</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            <div className="form-group">
              <label>Meeting Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="one-on-one">One-on-One</option>
                <option value="team">Team Meeting</option>
                <option value="all-hands">All Hands</option>
                <option value="client">Client Meeting</option>
                <option value="interview">Interview</option>
                <option value="training">Training</option>
                <option value="brainstorm">Brainstorm</option>
                <option value="standup">Standup</option>
                <option value="review">Review</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.requireAgenda}
                onChange={(e) => setFormData({ ...formData, requireAgenda: e.target.checked })}
              />
              Require agenda before meeting
            </label>
          </div>

          <div className="step-actions">
            <button
              className="btn-primary"
              onClick={() => setStep(2)}
              disabled={!formData.title}
            >
              Next: Select Participants →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Participants */}
      {step === 2 && (
        <div className="scheduler-step">
          <h3>Select Participants</h3>
          
          <div className="participants-grid">
            {availableParticipants.map((participant) => (
              <div
                key={participant._id}
                className={`participant-card ${formData.participants.includes(participant._id) ? 'selected' : ''}`}
                onClick={() => {
                  const isSelected = formData.participants.includes(participant._id);
                  setFormData({
                    ...formData,
                    participants: isSelected
                      ? formData.participants.filter(id => id !== participant._id)
                      : [...formData.participants, participant._id]
                  });
                }}
              >
                <div className="participant-avatar">
                  {participant.avatar ? (
                    <img src={participant.avatar} alt={participant.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="participant-info">
                  <h4>{participant.name}</h4>
                  <p>{participant.email}</p>
                  {participant.department && <span className="department">{participant.department}</span>}
                </div>
                {formData.participants.includes(participant._id) && (
                  <div className="selected-indicator">✓</div>
                )}
              </div>
            ))}
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button
              className="btn-primary"
              onClick={findOptimalTimes}
              disabled={formData.participants.length === 0 || loading}
            >
              {loading ? 'Finding Optimal Times...' : 'Find Best Times 🤖'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Select Time */}
      {step === 3 && (
        <div className="scheduler-step">
          <h3>🎯 Optimal Time Suggestions</h3>
          <p className="ai-note">
            Our AI analyzed {formData.participants.length} participants' schedules and found the best times:
          </p>

          <div className="time-slots">
            {optimalTimes.length === 0 ? (
              <div className="no-times">
                <p>No optimal times found. Try adjusting your criteria.</p>
              </div>
            ) : (
              optimalTimes.map((slot, index) => (
                <div
                  key={index}
                  className={`time-slot ${selectedTime?.start === slot.start ? 'selected' : ''} score-${getScoreClass(slot.score)}`}
                  onClick={() => setSelectedTime(slot)}
                >
                  <div className="time-slot-header">
                    <div className="time-info">
                      <div className="date">{new Date(slot.start).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                      <div className="time">
                        {new Date(slot.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(slot.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="score-badge" title={slot.reason}>
                      <div className="score-circle">{Math.round(slot.score)}</div>
                      <div className="score-label">Score</div>
                    </div>
                  </div>
                  <div className="slot-reason">{slot.reason}</div>
                  {selectedTime?.start === slot.start && (
                    <div className="selected-indicator-large">✓ Selected</div>
                  )}
                </div>
              ))
            )}
          </div>

          {conflicts.length > 0 && (
            <div className="conflicts-section">
              <h4>⚠️ Scheduling Conflicts Detected</h4>
              {conflicts.map((conflict, index) => (
                <div key={index} className="conflict-item">
                  <strong>{conflict.participant.name}</strong> has a conflict:
                  {conflict.conflictingMeetings.map((meeting, i) => (
                    <div key={i} className="conflict-meeting">
                      {meeting.title} - {new Date(meeting.startTime).toLocaleString()}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(2)}>
              ← Back
            </button>
            <button
              className="btn-primary"
              onClick={scheduleMeeting}
              disabled={!selectedTime || loading}
            >
              {loading ? 'Scheduling...' : 'Schedule Meeting ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const getScoreClass = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
};

export default SmartScheduler;

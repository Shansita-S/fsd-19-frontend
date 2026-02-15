import React, { useState, useEffect } from 'react';
import { meetingService, userService } from '../api';

const OrganizerDashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [error, setError] = useState('');
  const [conflictError, setConflictError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    participants: []
  });

  useEffect(() => {
    fetchMeetings();
    fetchParticipants();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await meetingService.getAllMeetings();
      setMeetings(response.data.meetings);
    } catch (err) {
      setError('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await userService.getParticipants();
      setParticipants(response.data.participants);
    } catch (err) {
      console.error('Failed to fetch participants', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleParticipantToggle = (participantId) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(participantId)
        ? prev.participants.filter(id => id !== participantId)
        : [...prev.participants, participantId]
    }));
  };

  const openCreateModal = () => {
    setEditingMeeting(null);
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      participants: []
    });
    setError('');
    setConflictError(null);
    setShowModal(true);
  };

  const openEditModal = (meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      startTime: new Date(meeting.startTime).toISOString().slice(0, 16),
      endTime: new Date(meeting.endTime).toISOString().slice(0, 16),
      participants: meeting.participants.map(p => p.user?._id || p._id)
    });
    setError('');
    setConflictError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setConflictError(null);

    try {
      if (editingMeeting) {
        await meetingService.updateMeeting(editingMeeting._id, formData);
      } else {
        await meetingService.createMeeting(formData);
      }
      setShowModal(false);
      fetchMeetings();
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictError(err.response.data);
      } else {
        setError(
          err.response?.data?.message || 
          err.response?.data?.errors?.[0]?.msg ||
          'Failed to save meeting'
        );
      }
    }
  };

  const handleApplySuggestedSlot = (slot) => {
    setFormData({
      ...formData,
      startTime: new Date(slot.startTime).toISOString().slice(0, 16),
      endTime: new Date(slot.endTime).toISOString().slice(0, 16)
    });
    setConflictError(null);
    setError('');
  };

  const handleAutoFindSlot = async () => {
    if (formData.participants.length === 0) {
      setError('Please select at least one participant first');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setError('Please set start and end time first to calculate duration');
      return;
    }

    setError('');
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const durationMinutes = (end - start) / (1000 * 60);

    if (durationMinutes <= 0) {
      setError('End time must be after start time');
      return;
    }

    try {
      const response = await meetingService.findBestSlot({
        participants: formData.participants,
        duration: durationMinutes,
        daysToSearch: 7
      });

      if (response.data.suggestedSlots && response.data.suggestedSlots.length > 0) {
        // Apply the best slot automatically
        const bestSlot = response.data.suggestedSlots[0];
        setFormData({
          ...formData,
          startTime: new Date(bestSlot.startTime).toISOString().slice(0, 16),
          endTime: new Date(bestSlot.endTime).toISOString().slice(0, 16)
        });
        setConflictError({
          ...conflictError,
          message: '✨ Best available slot found!',
          suggestedSlots: response.data.suggestedSlots
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to find available slots'
      );
    }
  };

  const handleDelete = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    try {
      await meetingService.deleteMeeting(meetingId);
      fetchMeetings();
    } catch (err) {
      alert('Failed to delete meeting');
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return <div className="loading">Loading meetings...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>My Meetings</h2>
          <button onClick={openCreateModal} className="btn btn-primary">
            + Create Meeting
          </button>
        </div>

        {meetings.length === 0 ? (
          <div className="empty-state">
            <h3>No meetings yet</h3>
            <p>Create your first meeting to get started</p>
          </div>
        ) : (
          <div className="meeting-list">
            {meetings.map(meeting => (
              <div key={meeting._id} className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">{meeting.title}</div>
                    <div className="meeting-time">
                      {formatDateTime(meeting.startTime)} - {formatDateTime(meeting.endTime)}
                    </div>
                  </div>
                </div>
                
                <div className="card-body">
                  {meeting.description && <p>{meeting.description}</p>}
                  
                  {meeting.participants && meeting.participants.length > 0 && (
                    <div className="meeting-participants">
                      <h4>Participants ({meeting.participants.length})</h4>
                      <div className="participants-list">
                        {meeting.participants.map(participant => (
                          <span key={participant.user?._id || participant._id} className="participant-badge">
                            {participant.user?.name || participant.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button 
                    onClick={() => openEditModal(meeting)} 
                    className="btn btn-primary"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(meeting._id)} 
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingMeeting ? 'Edit Meeting' : 'Create New Meeting'}</h3>
                <button className="close-button" onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                {error && <div className="error-message">{error}</div>}
                
                {conflictError && (
                  <div className="conflict-warning">
                    <h4>⚠️ Scheduling Conflict Detected</h4>
                    <p>{conflictError.message}</p>
                    {conflictError.conflicts?.map((conflict, idx) => (
                      <div key={idx} className="conflict-details">
                        <strong>{conflict.participant.name}</strong> has conflicts with:
                        {conflict.conflictingMeetings.map((m, i) => (
                          <div key={i}>
                            • {m.title} ({formatDateTime(m.startTime)} - {formatDateTime(m.endTime)})
                          </div>
                        ))}
                      </div>
                    ))}
                    
                    {conflictError.suggestedSlots && conflictError.suggestedSlots.length > 0 && (
                      <div className="suggested-slots">
                        <h4>✅ Suggested Available Slots:</h4>
                        <p className="suggestion-hint">Click on a slot to apply it</p>
                        <div className="slots-list">
                          {conflictError.suggestedSlots.map((slot, idx) => (
                            <div 
                              key={idx} 
                              className="slot-card"
                              onClick={() => handleApplySuggestedSlot(slot)}
                            >
                              <div className="slot-time">
                                <strong>{formatDateTime(slot.startTime)}</strong>
                                <span className="slot-separator">→</span>
                                <strong>{formatDateTime(slot.endTime)}</strong>
                              </div>
                              {slot.score && (
                                <div className="slot-score">
                                  Score: {Math.round(slot.score)}% 
                                  {slot.score > 110 && ' 🌟'}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Meeting Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter meeting title"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter meeting description (optional)"
                    />
                  </div>

                  <div className="form-group">
                    <label>Start Time *</label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>End Time *</label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Participants</label>
                    {participants.length === 0 ? (
                      <p>No participants available</p>
                    ) : (
                      <>
                        <div className="checkbox-list">
                          {participants.map(participant => (
                            <label key={participant._id} className="checkbox-item">
                              <input
                                type="checkbox"
                                checked={formData.participants.includes(participant._id)}
                                onChange={() => handleParticipantToggle(participant._id)}
                              />
                              {participant.name} ({participant.email})
                            </label>
                          ))}
                        </div>
                        {formData.participants.length > 0 && formData.startTime && formData.endTime && (
                          <button 
                            type="button" 
                            onClick={handleAutoFindSlot} 
                            className="btn btn-auto-schedule"
                          >
                            🔍 Auto-Find Best Slot
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success">
                      {editingMeeting ? 'Update Meeting' : 'Create Meeting'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;

import React, { useState, useEffect } from 'react';
import { meetingService, userService } from '../api';

const OrganizerDashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [error, setError] = useState('');
  const [conflictError, setConflictError] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [newAgendaItem, setNewAgendaItem] = useState({ title: '', description: '', duration: 15 });
  
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
      participants: meeting.participants.map(p => p._id)
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

  const openDetailsModal = (meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailsModal(true);
    setNewNote('');
    setNewAgendaItem({ title: '', description: '', duration: 15 });
  };

  const handleAddAgenda = async () => {
    if (!newAgendaItem.title.trim()) {
      alert('Please enter agenda item title');
      return;
    }

    try {
      await meetingService.addAgenda(selectedMeeting._id, [newAgendaItem]);
      alert('Agenda added successfully!');
      setNewAgendaItem({ title: '', description: '', duration: 15 });
      fetchMeetings();
      
      // Refresh the selected meeting
      const response = await meetingService.getAllMeetings();
      const updated = response.data.meetings.find(m => m._id === selectedMeeting._id);
      if (updated) setSelectedMeeting(updated);
    } catch (err) {
      alert('Failed to add agenda: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      alert('Please enter a note');
      return;
    }

    try {
      await meetingService.addNote(selectedMeeting._id, newNote);
      alert('Note added successfully!');
      setNewNote('');
      fetchMeetings();
      
      // Refresh the selected meeting
      const response = await meetingService.getAllMeetings();
      const updated = response.data.meetings.find(m => m._id === selectedMeeting._id);
      if (updated) setSelectedMeeting(updated);
    } catch (err) {
      alert('Failed to add note: ' + (err.response?.data?.message || err.message));
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
  };

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
                          <span key={participant._id} className="participant-badge">
                            {participant.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button 
                    onClick={() => openDetailsModal(meeting)} 
                    className="btn btn-info"
                  >
                    📋 Details
                  </button>
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

        {showDetailsModal && selectedMeeting && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>📋 Meeting Details: {selectedMeeting.title}</h3>
                <button className="close-button" onClick={() => setShowDetailsModal(false)}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="meeting-details-section">
                  <h4>⏰ Time</h4>
                  <p>{formatDateTime(selectedMeeting.startTime)} - {formatDateTime(selectedMeeting.endTime)}</p>
                </div>

                {selectedMeeting.description && (
                  <div className="meeting-details-section">
                    <h4>📝 Description</h4>
                    <p>{selectedMeeting.description}</p>
                  </div>
                )}

                <div className="meeting-details-section">
                  <h4>👥 Participants ({selectedMeeting.participants?.length || 0})</h4>
                  <div className="participants-grid">
                    {selectedMeeting.participants && selectedMeeting.participants.length > 0 ? (
                      selectedMeeting.participants.map((participant) => (
                        <span key={participant.user._id} className="participant-badge">
                          {participant.user.name}
                        </span>
                      ))
                    ) : (
                      <p>No participants</p>
                    )}
                  </div>
                </div>

                <div className="meeting-details-section">
                  <h4>📋 Agenda</h4>
                  {selectedMeeting.agenda && selectedMeeting.agenda.length > 0 ? (
                    <ul className="agenda-list">
                      {selectedMeeting.agenda.map((item, index) => (
                        <li key={index} className="agenda-item">
                          <div className="agenda-number">{index + 1}</div>
                          <div className="agenda-content">
                            <strong>{item.title}</strong>
                            {item.description && <p>{item.description}</p>}
                            {item.duration && <span className="agenda-duration">{item.duration} min</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-message">No agenda items yet</p>
                  )}

                  <div className="add-agenda-form">
                    <h5>➕ Add Agenda Item</h5>
                    <input
                      type="text"
                      placeholder="Agenda item title *"
                      value={newAgendaItem.title}
                      onChange={(e) => setNewAgendaItem({ ...newAgendaItem, title: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newAgendaItem.description}
                      onChange={(e) => setNewAgendaItem({ ...newAgendaItem, description: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Duration (minutes)"
                      value={newAgendaItem.duration}
                      onChange={(e) => setNewAgendaItem({ ...newAgendaItem, duration: parseInt(e.target.value) || 0 })}
                      min="1"
                    />
                    <button onClick={handleAddAgenda} className="btn btn-primary">
                      Add Agenda Item
                    </button>
                  </div>
                </div>

                <div className="meeting-details-section">
                  <h4>📝 Notes</h4>
                  {selectedMeeting.notes && selectedMeeting.notes.length > 0 ? (
                    <ul className="notes-list">
                      {selectedMeeting.notes.map((note, index) => (
                        <li key={index} className="note-item">
                          <div className="note-header">
                            <strong>{note.author?.name || 'Unknown'}</strong>
                            <span className="note-time">{new Date(note.createdAt).toLocaleString()}</span>
                          </div>
                          <p>{note.content}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-message">No notes yet</p>
                  )}

                  <div className="add-note-form">
                    <h5>➕ Add Note</h5>
                    <textarea
                      placeholder="Type your note here..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows="4"
                    />
                    <button onClick={handleAddNote} className="btn btn-primary">
                      Add Note
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={() => setShowDetailsModal(false)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrganizerDashboard;

import React, { useState, useEffect, useRef } from 'react';
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
  const [findingBestSlot, setFindingBestSlot] = useState(false);
  const [slotSuggestions, setSlotSuggestions] = useState([]);
  const [selectedSlotKey, setSelectedSlotKey] = useState('');
  const [slotNotice, setSlotNotice] = useState('');
  const [conflictGuideMessage, setConflictGuideMessage] = useState('');
  const [slotSearchDays, setSlotSearchDays] = useState(7);
  const [slotDuration, setSlotDuration] = useState(60);
  const [newNote, setNewNote] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');
  const [newAgendaItem, setNewAgendaItem] = useState({ title: '', description: '', duration: 15 });
  const autoSlotPanelRef = useRef(null);
  
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

  const getParticipantId = (participant) => participant?.user?._id || participant?._id;
  const getParticipantName = (participant) => participant?.user?.name || participant?.name || 'Unknown';
  const toLocalDateTimeInput = (dateLike) => {
    const date = new Date(dateLike);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };
  const getSlotKey = (slot) => `${slot.startTime}-${slot.endTime}`;
  const normalizeSlotDuration = (value) => Math.min(480, Math.max(15, parseInt(value, 10) || 15));

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
    setSlotSuggestions([]);
    setSelectedSlotKey('');
    setSlotNotice('');
    setConflictGuideMessage('');
    setSlotSearchDays(7);
    setSlotDuration(60);
    setShowModal(true);
  };

  const openEditModal = (meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      startTime: toLocalDateTimeInput(meeting.startTime),
      endTime: toLocalDateTimeInput(meeting.endTime),
      participants: (meeting.participants || []).map(getParticipantId).filter(Boolean)
    });
    setError('');
    setConflictError(null);
    setSlotSuggestions([]);
    setSelectedSlotKey('');
    setSlotNotice('');
    setConflictGuideMessage('');

    const computedDuration = Math.max(
      15,
      Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / 60000)
    );
    setSlotDuration(computedDuration);
    setShowModal(true);
  };

  const applySuggestedSlot = (slot) => {
    const slotKey = getSlotKey(slot);
    setFormData(prev => ({
      ...prev,
      startTime: toLocalDateTimeInput(slot.startTime),
      endTime: toLocalDateTimeInput(slot.endTime)
    }));
    setSelectedSlotKey(slotKey);
    setConflictError(null);
    setError('');
    setSlotNotice('Suggested slot applied. Click Create/Update Meeting to save it.');
  };

  const handleFindBestSlot = async () => {
    setError('');
    setSlotNotice('');

    if (formData.participants.length === 0) {
      setError('Select at least one participant to auto-find a slot.');
      return;
    }

    const duration = normalizeSlotDuration(slotDuration);
    setSlotDuration(duration);
    if (!duration || duration < 15) {
      setError('Duration must be at least 15 minutes.');
      return;
    }

    setFindingBestSlot(true);
    try {
      const response = await meetingService.findBestSlot({
        participants: formData.participants,
        duration,
        daysToSearch: slotSearchDays
      });

      const suggestions = response.data?.suggestedSlots || [];
      setSlotSuggestions(suggestions);
      setSelectedSlotKey('');

      if (suggestions.length > 0) {
        applySuggestedSlot(suggestions[0]);
      }
    } catch (err) {
      setSlotSuggestions([]);
      setError(err.response?.data?.message || 'Failed to auto-find a best slot');
    } finally {
      setFindingBestSlot(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setConflictError(null);
    setSlotNotice('');
    setConflictGuideMessage('');

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
        const conflictData = err.response.data;
        setConflictError(conflictData);

        const conflictSuggestions = conflictData?.suggestedSlots || [];
        setSlotSuggestions(conflictSuggestions);
        setSelectedSlotKey('');

        if (conflictSuggestions.length > 0) {
          setConflictGuideMessage('Conflict detected. We found suggested slots below in Auto Best Slot. Pick one and save.');
        } else {
          setConflictGuideMessage('Conflict detected. Use Auto Best Slot to find a new available time, then save again.');
        }

        setTimeout(() => {
          autoSlotPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 0);

        if (conflictSuggestions.length > 0) {
          applySuggestedSlot(conflictSuggestions[0]);
        }
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
    setRecordingUrl(meeting?.recording?.recordingUrl || '');
    setNewAgendaItem({ title: '', description: '', duration: 15 });
  };

  const handleAddRecording = async () => {
    const normalizedUrl = recordingUrl.trim();

    if (!normalizedUrl) {
      alert('Please enter recording URL');
      return;
    }

    try {
      new URL(normalizedUrl);
    } catch (e) {
      alert('Please enter a valid URL (http/https)');
      return;
    }

    try {
      await meetingService.addRecording(selectedMeeting._id, normalizedUrl);
      alert('Recording saved and shared with participants');
      fetchMeetings();

      const response = await meetingService.getAllMeetings();
      const updated = response.data.meetings.find(m => m._id === selectedMeeting._id);
      if (updated) {
        setSelectedMeeting(updated);
        setRecordingUrl(updated?.recording?.recordingUrl || normalizedUrl);
      }
    } catch (err) {
      alert('Failed to save recording: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenRecording = (meeting) => {
    const url = meeting?.recording?.recordingUrl;
    if (!url) return;

    const popup = window.open(url, '_blank', 'noopener,noreferrer');
    if (!popup) {
      window.location.href = url;
    }
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

  const isJoinTime = (meeting) => {
    const now = new Date();
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);
    return now >= start && now <= end;
  };

  const buildSimpleJoinUrl = (meeting) => {
    const provider = meeting?.videoConference?.provider;
    const roomName = meeting?.videoConference?.roomName;
    const rawUrl = meeting?.videoConference?.joinUrl;

    if (!rawUrl) return '';
    if (provider === 'custom') return rawUrl;

    if (roomName) {
      return `https://talky.io/${roomName}`;
    }

    if (rawUrl.includes('meet.jit.si/')) {
      const roomPart = rawUrl.split('meet.jit.si/')[1]?.split('#')[0]?.split('?')[0];
      if (roomPart) {
        return `https://talky.io/${roomPart}`;
      }
    }

    return rawUrl;
  };

  const handleJoinMeeting = (meeting) => {
    if (!meeting?.videoConference?.joinUrl) return;
    if (!isJoinTime(meeting)) {
      alert('Join is available only during the scheduled meeting time.');
      return;
    }
    window.open(buildSimpleJoinUrl(meeting), '_blank', 'noopener,noreferrer');
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

                  {meeting.videoConference?.joinUrl && (
                    <div className="meeting-link-row">
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={() => handleJoinMeeting(meeting)}
                        disabled={!isJoinTime(meeting)}
                      >
                        Join Meeting Room
                      </button>
                      {!isJoinTime(meeting) && (
                        <small className="join-time-note">Available at scheduled start time</small>
                      )}
                    </div>
                  )}

                  {meeting.recording?.recordingUrl && (
                    <div className="meeting-recording-row">
                      <strong>Recording:</strong>{' '}
                      <button
                        type="button"
                        className="btn btn-info recording-download-btn"
                        onClick={() => handleOpenRecording(meeting)}
                      >
                        Open Recording
                      </button>
                    </div>
                  )}
                  
                  {meeting.participants && meeting.participants.length > 0 && (
                    <div className="meeting-participants">
                      <h4>Participants ({meeting.participants.length})</h4>
                      <div className="participants-list">
                        {meeting.participants.map(participant => (
                          <span key={getParticipantId(participant)} className="participant-badge">
                            {getParticipantName(participant)}
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
                    {conflictGuideMessage && (
                      <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                        {conflictGuideMessage}
                      </p>
                    )}
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
                    {slotSuggestions.length > 0 && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <strong>Suggested slots:</strong>
                        <div className="checkbox-list" style={{ marginTop: '0.5rem' }}>
                          {slotSuggestions.map((slot, idx) => (
                            <button
                              key={`conflict-slot-${slot.startTime}-${idx}`}
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => applySuggestedSlot(slot)}
                              style={{ width: '100%', textAlign: 'left', marginBottom: '0.5rem' }}
                            >
                              Use Option {idx + 1}: {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                              {slot.score ? ` (score: ${slot.score})` : ''}
                            </button>
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

                  <div className="form-group auto-slot-panel" ref={autoSlotPanelRef}>
                    <label>Auto Best Slot</label>
                    <div className="auto-slot-controls">
                      <div>
                        <label style={{ fontSize: '0.85rem' }}>Duration (min)</label>
                        <input
                          type="number"
                          min="15"
                          max="480"
                          value={slotDuration}
                          onChange={(e) => setSlotDuration(normalizeSlotDuration(e.target.value))}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem' }}>Search Days</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={slotSearchDays}
                          onChange={(e) => setSlotSearchDays(parseInt(e.target.value, 10) || 7)}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={handleFindBestSlot}
                        disabled={findingBestSlot}
                      >
                        {findingBestSlot ? 'Finding...' : 'Auto Find Slot'}
                      </button>
                    </div>

                    {slotSuggestions.length > 0 && (
                      <div className="checkbox-list" style={{ marginTop: '0.75rem' }}>
                        {slotSuggestions.map((slot, idx) => (
                          <button
                            key={`${slot.startTime}-${idx}`}
                            type="button"
                            className={`btn btn-secondary auto-slot-option ${selectedSlotKey === getSlotKey(slot) ? 'selected' : ''}`}
                            onClick={() => applySuggestedSlot(slot)}
                            style={{ width: '100%', textAlign: 'left', marginBottom: '0.5rem' }}
                          >
                            Option {idx + 1}: {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                            {slot.score ? ` (score: ${slot.score})` : ''}
                          </button>
                        ))}
                      </div>
                    )}

                    {conflictGuideMessage && <div className="slot-notice">{conflictGuideMessage}</div>}
                    <small className="auto-slot-hint">Auto Find uses the duration above, independent of the manual start/end fields.</small>
                    {slotNotice && <div className="slot-notice">{slotNotice}</div>}
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
                  <h4>🎥 Virtual Room</h4>
                  {selectedMeeting.videoConference?.joinUrl ? (
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={() => handleJoinMeeting(selectedMeeting)}
                      disabled={!isJoinTime(selectedMeeting)}
                    >
                      Open Meeting Room
                    </button>
                  ) : (
                    <p>No meeting link available</p>
                  )}
                  {selectedMeeting.videoConference?.joinUrl && !isJoinTime(selectedMeeting) && (
                    <p className="empty-message">Join is enabled during the scheduled meeting time window.</p>
                  )}
                </div>

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

                <div className="meeting-details-section">
                  <h4>🎬 Recording</h4>
                  {selectedMeeting.recording?.recordingUrl ? (
                    <>
                      <p>
                        Recording available:{' '}
                        {selectedMeeting.recording.recordingUrl}
                      </p>
                      <p className="empty-message">Participants automatically get this recording link when you save it.</p>
                      <button
                        type="button"
                        className="btn btn-info recording-download-btn"
                        onClick={() => handleOpenRecording(selectedMeeting)}
                      >
                        Open Recording
                      </button>
                    </>
                  ) : (
                    <p className="empty-message">Add recording URL here to share with participants.</p>
                  )}

                  <div className="add-note-form" style={{ marginTop: '1rem' }}>
                    <h5>Add Recording URL</h5>
                    <input
                      type="url"
                      placeholder="https://your-recording-link"
                      value={recordingUrl}
                      onChange={(e) => setRecordingUrl(e.target.value)}
                    />
                    <button type="button" onClick={handleAddRecording} className="btn btn-success">
                      Save and Share Recording
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

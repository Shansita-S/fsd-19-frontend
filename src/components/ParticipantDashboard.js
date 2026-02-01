import React, { useState, useEffect } from 'react';
import { meetingService } from '../api';

const ParticipantDashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMeetings();
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getMeetingStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return { text: 'Upcoming', color: '#3498db' };
    } else if (now >= start && now <= end) {
      return { text: 'In Progress', color: '#27ae60' };
    } else {
      return { text: 'Completed', color: '#95a5a6' };
    }
  };

  if (loading) {
    return <div className="loading">Loading meetings...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>My Scheduled Meetings</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        {meetings.length === 0 ? (
          <div className="empty-state">
            <h3>No meetings scheduled</h3>
            <p>You haven't been invited to any meetings yet</p>
          </div>
        ) : (
          <div className="meeting-list">
            {meetings.map(meeting => {
              const status = getMeetingStatus(meeting.startTime, meeting.endTime);
              return (
                <div key={meeting._id} className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{meeting.title}</div>
                      <div className="meeting-time">
                        {formatDateTime(meeting.startTime)} - {formatDateTime(meeting.endTime)}
                      </div>
                      <div style={{ 
                        color: status.color, 
                        fontWeight: 'bold', 
                        marginTop: '0.5rem',
                        fontSize: '0.9rem'
                      }}>
                        {status.text}
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    {meeting.description && <p>{meeting.description}</p>}
                    
                    {meeting.organizer && (
                      <div style={{ marginTop: '1rem' }}>
                        <strong>Organizer:</strong> {meeting.organizer.name} ({meeting.organizer.email})
                      </div>
                    )}
                    
                    {meeting.participants && meeting.participants.length > 1 && (
                      <div className="meeting-participants">
                        <h4>Other Participants ({meeting.participants.length - 1})</h4>
                        <div className="participants-list">
                          {meeting.participants
                            .filter(p => p._id !== meeting.participants[0]._id)
                            .map(participant => (
                              <span key={participant._id} className="participant-badge">
                                {participant.name}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantDashboard;

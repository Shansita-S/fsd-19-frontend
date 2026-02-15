import React, { useState, useEffect } from 'react';
import { actionItemsService } from '../api';

const ActionItemsManager = () => {
  const [actionItems, setActionItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchActionItems();
    fetchStats();
  }, [filter, sortBy]);

  const fetchActionItems = async () => {
    setLoading(true);
    try {
      const response = await actionItemsService.getAll({ status: filter !== 'all' ? filter : null, sortBy });
      setActionItems(response.data);
    } catch (error) {
      console.error('Failed to fetch action items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await actionItemsService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const updateProgress = async (id, percentage, note) => {
    try {
      await actionItemsService.updateProgress(id, { percentage, note });
      fetchActionItems();
      fetchStats();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await actionItemsService.update(id, { status });
      fetchActionItems();
      fetchStats();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading action items...</div>;
  }

  return (
    <div className="action-items-container">
      <div className="action-items-header">
        <h1>✅ Action Items</h1>
        <button
          className="btn-create"
          onClick={() => setShowCreateForm(true)}
        >
          + New Action Item
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="action-items-stats">
          <StatCard title="Total" value={stats.total} icon="📋" />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon="✅"
            color="#22c55e"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon="🔄"
            color="#3b82f6"
          />
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon="⚠️"
            color="#ef4444"
          />
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            icon="📊"
            color="#8b5cf6"
          />
        </div>
      )}

      {/* Filters */}
      <div className="action-items-filters">
        <div className="filter-group">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Items</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Created Date</option>
          </select>
        </div>
      </div>

      {/* Action Items List */}
      <div className="action-items-list">
        {actionItems.length === 0 ? (
          <div className="empty-state">
            <p>No action items found</p>
          </div>
        ) : (
          actionItems.map((item) => (
            <ActionItemCard
              key={item._id}
              item={item}
              onUpdateProgress={updateProgress}
              onUpdateStatus={updateStatus}
            />
          ))
        )}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <ActionItemCreateForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchActionItems();
            fetchStats();
          }}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color = '#64748b' }) => (
  <div className="stat-card" style={{ borderLeftColor: color }}>
    <div className="stat-icon" style={{ color }}>{icon}</div>
    <div className="stat-content">
      <h3>{title}</h3>
      <div className="stat-value" style={{ color }}>{value}</div>
    </div>
  </div>
);

const ActionItemCard = ({ item, onUpdateProgress, onUpdateStatus }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [progress, setProgress] = useState(item.progress.percentage);
  const [note, setNote] = useState('');

  const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'completed';
  const daysUntilDue = Math.ceil((new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

  const handleProgressUpdate = () => {
    if (progress !== item.progress.percentage) {
      onUpdateProgress(item._id, progress, note);
      setNote('');
    }
  };

  return (
    <div className={`action-item-card ${item.status} ${isOverdue ? 'overdue' : ''}`}>
      <div className="action-item-header">
        <div className="action-item-title-section">
          <div className="status-indicator" title={item.status}></div>
          <h3>{item.title}</h3>
          <span className={`priority-badge priority-${item.priority}`}>
            {item.priority}
          </span>
        </div>
        <button
          className="toggle-details"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '▲' : '▼'}
        </button>
      </div>

      <div className="action-item-meta">
        {item.meeting && (
          <span className="meta-item">
            📅 {item.meeting.title}
          </span>
        )}
        <span className="meta-item">
          👤 {item.assignedBy.name}
        </span>
        <span className={`meta-item ${isOverdue ? 'overdue-text' : ''}`}>
          🗓️ Due: {new Date(item.dueDate).toLocaleString()}
          {daysUntilDue >= 0 && !isOverdue && ` (${daysUntilDue} days)`}
          {isOverdue && ' (Overdue!)'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {item.status !== 'completed' && (
          <div className="progress-controls">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
            />
            {progress !== item.progress.percentage && (
              <div className="progress-update-section">
                <input
                  type="text"
                  placeholder="Update note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button onClick={handleProgressUpdate}>Update</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="action-item-details">
          {item.description && (
            <div className="detail-section">
              <strong>Description:</strong>
              <p>{item.description}</p>
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="detail-section">
              <strong>Tags:</strong>
              <div className="tags">
                {item.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {item.progress.updates && item.progress.updates.length > 0 && (
            <div className="detail-section">
              <strong>Progress Updates:</strong>
              <div className="progress-updates">
                {item.progress.updates.slice(-3).reverse().map((update, index) => (
                  <div key={index} className="progress-update">
                    <span className="update-date">
                      {new Date(update.timestamp).toLocaleString()}
                    </span>
                    <p>{update.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.status !== 'completed' && (
            <div className="action-buttons">
              <button
                className="btn-status"
                onClick={() => onUpdateStatus(item._id, 'in-progress')}
                disabled={item.status === 'in-progress'}
              >
                Mark In Progress
              </button>
              <button
                className="btn-status btn-complete"
                onClick={() => onUpdateStatus(item._id, 'completed')}
              >
                Mark Completed
              </button>
              <button
                className="btn-status btn-block"
                onClick={() => onUpdateStatus(item._id, 'blocked')}
              >
                Mark Blocked
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ActionItemCreateForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    tags: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const actionItemData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      
      await actionItemsService.create(actionItemData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create action item:', error);
      alert('Failed to create action item');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Action Item</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            ></textarea>
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
          <div className="form-group">
            <label>Due Date *</label>
            <input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., design, urgent, client"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActionItemsManager;

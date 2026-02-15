import React, { useState, useEffect } from 'react';
import { notificationsService } from '../api';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationsService.getAll({
        unreadOnly: filter === 'unread',
        limit: 50
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsService.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsService.markAsRead(id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsService.delete(id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAllRead = async () => {
    try {
      await notificationsService.clearAll();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  return (
    <>
      {/* Notification Bell Icon */}
      <div className="notification-bell" onClick={() => setIsOpen(!isOpen)}>
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </div>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)}></div>
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="mark-all-read">
                  Mark all as read
                </button>
              )}
            </div>

            <div className="notification-filters">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={filter === 'unread' ? 'active' : ''}
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <div className="notifications-list">
              {loading ? (
                <div className="loading-notifications">
                  <p>Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="empty-notifications">
                  <p>📭 No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="notification-footer">
                <button onClick={clearAllRead} className="clear-button">
                  Clear read notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const getIcon = (type) => {
    const iconMap = {
      'meeting-reminder': '⏰',
      'meeting-invitation': '📅',
      'meeting-updated': '🔄',
      'meeting-cancelled': '❌',
      'meeting-started': '▶️',
      'action-item-assigned': '✅',
      'action-item-due': '⏳',
      'action-item-overdue': '⚠️',
      'action-item-completed': '🎉',
      'participant-declined': '👎',
      'participant-accepted': '👍',
      'agenda-updated': '📝',
      'notes-shared': '📄',
      'feedback-requested': '💭',
      'smart-suggestion': '💡',
      'productivity-alert': '📊',
      'focus-time-blocked': '🎯'
    };
    return iconMap[type] || '📌';
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div
      className={`notification-item ${!notification.read ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
      onClick={() => !notification.read && onMarkAsRead(notification._id)}
    >
      <div className="notification-icon">{getIcon(notification.type)}</div>
      <div className="notification-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
        <span className="notification-time">{timeAgo(notification.createdAt)}</span>
      </div>
      <button
        className="delete-notification"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification._id);
        }}
      >
        ×
      </button>
    </div>
  );
};

export default NotificationCenter;

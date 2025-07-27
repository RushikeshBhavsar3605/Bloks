// Activity tracking utilities for dashboard

export interface ActivityData {
  userId: string;
  action: 'edit' | 'create' | 'share' | 'comment';
  documentId: string;
  timestamp: Date;
  duration?: number; // in minutes
}

export interface UserSession {
  userId: string;
  documentId: string;
  startTime: Date;
  endTime?: Date;
}

// In-memory storage for demo purposes
// In production, this would be stored in Redis or database
const activityStorage = new Map<string, any>();
const sessionStorage = new Map<string, UserSession>();

export class ActivityTracker {
  // Track document activity
  static trackActivity(data: ActivityData) {
    const today = new Date().toISOString().split('T')[0];
    const key = `activity_${data.userId}_${today}`;
    
    const currentActivity = activityStorage.get(key) || { edits: 0, creates: 0, shares: 0, comments: 0 };
    
    switch (data.action) {
      case 'edit':
        currentActivity.edits++;
        break;
      case 'create':
        currentActivity.creates++;
        break;
      case 'share':
        currentActivity.shares++;
        break;
      case 'comment':
        currentActivity.comments++;
        break;
    }
    
    activityStorage.set(key, currentActivity);
    
    // Also track document-specific activity
    const docKey = `doc_activity_${data.documentId}`;
    const docActivity = activityStorage.get(docKey) || { edits: 0, lastActivity: new Date() };
    if (data.action === 'edit') {
      docActivity.edits++;
      docActivity.lastActivity = new Date();
    }
    activityStorage.set(docKey, docActivity);
  }

  // Start tracking user session
  static startSession(userId: string, documentId: string) {
    const sessionKey = `${userId}_${documentId}`;
    sessionStorage.set(sessionKey, {
      userId,
      documentId,
      startTime: new Date(),
    });
  }

  // End tracking user session
  static endSession(userId: string, documentId: string) {
    const sessionKey = `${userId}_${documentId}`;
    const session = sessionStorage.get(sessionKey);
    
    if (session) {
      session.endTime = new Date();
      const duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60));
      
      // Track total time for today
      const today = new Date().toISOString().split('T')[0];
      const timeKey = `activeTime_${userId}_${today}`;
      const currentTime = activityStorage.get(timeKey) || 0;
      activityStorage.set(timeKey, currentTime + duration);
      
      sessionStorage.delete(sessionKey);
    }
  }

  // Get activity data for a specific day
  static getActivityForDay(userId: string, date: string) {
    const key = `activity_${userId}_${date}`;
    return activityStorage.get(key) || { edits: 0, creates: 0, shares: 0, comments: 0 };
  }

  // Get total active time for a day
  static getActiveTimeForDay(userId: string, date: string) {
    const key = `activeTime_${userId}_${date}`;
    return activityStorage.get(key) || 0;
  }

  // Get document activity
  static getDocumentActivity(documentId: string) {
    const key = `doc_activity_${documentId}`;
    return activityStorage.get(key) || { edits: 0, lastActivity: new Date() };
  }

  // Get weekly activity chart data
  static getWeeklyActivityChart(userId: string) {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const activity = this.getActivityForDay(userId, dateStr);
      
      data.push({
        date: dateStr,
        edits: activity.edits,
        creates: activity.creates,
        shares: activity.shares,
        comments: activity.comments,
      });
    }

    return data;
  }

  // Calculate user streak
  static calculateStreak(userId: string) {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const activity = this.getActivityForDay(userId, dateStr);
      
      const totalActivity = activity.edits + activity.creates + activity.shares + activity.comments;
      
      if (totalActivity > 0) {
        streak++;
      } else if (i > 0) { // Don't break on today if no activity yet
        break;
      }
    }
    
    return streak;
  }

  // Get average daily time for last 7 days
  static getAverageDailyTime(userId: string) {
    let totalTime = 0;
    let daysWithActivity = 0;
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const time = this.getActiveTimeForDay(userId, dateStr);
      
      if (time > 0) {
        totalTime += time;
        daysWithActivity++;
      }
    }

    return daysWithActivity > 0 ? Math.floor(totalTime / daysWithActivity) : 0;
  }

  // Clear old data (cleanup function)
  static cleanup() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

    const keysToDelete: string[] = [];
    activityStorage.forEach((value, key) => {
      if (key.includes('activity_') || key.includes('activeTime_')) {
        const datePart = key.split('_')[2];
        if (datePart && datePart < cutoffDate) {
          keysToDelete.push(key);
        }
      }
    });

    keysToDelete.forEach(key => {
      activityStorage.delete(key);
    });
  }
}

// Export for use in components
export const trackDocumentEdit = (userId: string, documentId: string) => {
  ActivityTracker.trackActivity({
    userId,
    action: 'edit',
    documentId,
    timestamp: new Date(),
  });
};

export const trackDocumentCreate = (userId: string, documentId: string) => {
  ActivityTracker.trackActivity({
    userId,
    action: 'create',
    documentId,
    timestamp: new Date(),
  });
};

export const trackDocumentShare = (userId: string, documentId: string) => {
  ActivityTracker.trackActivity({
    userId,
    action: 'share',
    documentId,
    timestamp: new Date(),
  });
};

export const startEditingSession = (userId: string, documentId: string) => {
  ActivityTracker.startSession(userId, documentId);
};

export const endEditingSession = (userId: string, documentId: string) => {
  ActivityTracker.endSession(userId, documentId);
};
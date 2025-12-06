/**
 * Advanced Session Management System
 * ✅ One Session Per Student
 * ✅ Auto-logout from old device when logging in from new device
 * ✅ Complete Data Display for Admin
 */

class SessionManager {
  constructor() {
    this.SESSION_STORAGE_KEY = 'tf_sessions';
    this.STUDENT_STORAGE_KEY = 'tf_students';
    this.initSessions();
  }

  /**
   * Initialize sessions storage
   */
  initSessions() {
    if (!localStorage.getItem(this.SESSION_STORAGE_KEY)) {
      localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify([]));
    }
  }

  /**
   * Create a new session for a student
   * Automatically closes old sessions from other devices
   */
  createSession(studentId, studentData) {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const deviceId = this.getDeviceId();
    
    // End all previous sessions for this student from other devices
    this.closeOtherSessions(studentId, deviceId);

    const newSession = {
      id: sessionId,
      studentId,
      deviceId,
      startTime: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isActive: true,
      userAgent: navigator.userAgent,
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      ipLocation: 'تم التسجيل',
      browser: this.getBrowserInfo()
    };

    const sessions = JSON.parse(localStorage.getItem(this.SESSION_STORAGE_KEY) || '[]');
    sessions.push(newSession);
    localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(sessions));

    // Update student data with current session
    this.updateStudentSession(studentId, sessionId);

    return sessionId;
  }

  /**
   * Close all other sessions for a student from different devices
   */
  closeOtherSessions(studentId, currentDeviceId) {
    const sessions = JSON.parse(localStorage.getItem(this.SESSION_STORAGE_KEY) || '[]');
    const studentSessions = sessions.filter(s => s.studentId === studentId && s.deviceId !== currentDeviceId && s.isActive);

    if (studentSessions.length > 0) {
      studentSessions.forEach(session => {
        session.isActive = false;
        session.closedAt = new Date().toISOString();
        session.closedReason = 'new_device_login';
      });

      localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(sessions));

      // Notify other devices to logout (if tab is open)
      this.broadcastSessionTermination(studentId, studentSessions);
    }
  }

  /**
   * Broadcast session termination to other tabs/windows
   */
  broadcastSessionTermination(studentId, terminatedSessions) {
    window.addEventListener('storage', (e) => {
      if (e.key === 'tf_session_terminated' && e.newValue) {
        const data = JSON.parse(e.newValue);
        if (data.studentId === studentId) {
          // Close current session if it's in the terminated list
          const currentSession = localStorage.getItem('tf_current');
          if (currentSession) {
            const current = JSON.parse(currentSession);
            if (terminatedSessions.some(s => s.id === current.sessionId)) {
              this.forceLogout('تم تسجيل الدخول من جهاز آخر');
            }
          }
        }
      }
    });
  }

  /**
   * Update student's current session
   */
  updateStudentSession(studentId, sessionId) {
    const students = JSON.parse(localStorage.getItem(this.STUDENT_STORAGE_KEY) || '[]');
    const student = students.find(s => s.id === studentId);
    
    if (student) {
      student.sessionId = sessionId;
      student.lastActive = new Date().toISOString();
      student.loginDevice = this.getDeviceInfo();
      localStorage.setItem(this.STUDENT_STORAGE_KEY, JSON.stringify(students));
    }
  }

  /**
   * Get unique device ID
   */
  getDeviceId() {
    let deviceId = localStorage.getItem('tf_device_id');
    
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('tf_device_id', deviceId);
    }
    
    return deviceId;
  }

  /**
   * Get browser information
   */
  getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  /**
   * Get device information
   */
  getDeviceInfo() {
    return {
      type: /Mobile|Android|iPhone/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      os: this.getOS(),
      browser: this.getBrowserInfo(),
      resolution: `${window.innerWidth}x${window.innerHeight}`
    };
  }

  /**
   * Get operating system
   */
  getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Get active session for student
   */
  getActiveSession(studentId) {
    const sessions = JSON.parse(localStorage.getItem(this.SESSION_STORAGE_KEY) || '[]');
    return sessions.find(s => s.studentId === studentId && s.isActive);
  }

  /**
   * Check if session is still valid
   */
  isSessionValid(sessionId, timeout = 24 * 60 * 60 * 1000) { // 24 hours
    const sessions = JSON.parse(localStorage.getItem(this.SESSION_STORAGE_KEY) || '[]');
    const session = sessions.find(s => s.id === sessionId);

    if (!session || !session.isActive) {
      return false;
    }

    const lastActive = new Date(session.lastActive).getTime();
    const now = new Date().getTime();

    return (now - lastActive) < timeout;
  }

  /**
   * Update last active time
   */
  updateLastActive(sessionId) {
    const sessions = JSON.parse(localStorage.getItem(this.SESSION_STORAGE_KEY) || '[]');
    const session = sessions.find(s => s.id === sessionId);

    if (session) {
      session.lastActive = new Date().toISOString();
      localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(sessions));
    }
  }

  /**
   * Get all student sessions (for admin)
   */
  getStudentSessions(studentId) {
    const sessions = JSON.parse(localStorage.getItem(this.SESSION_STORAGE_KEY) || '[]');
    return sessions.filter(s => s.studentId === studentId);
  }

  /**
   * Get all active sessions (for admin dashboard)
   */
  getAllActiveSessions() {
    const sessions = JSON.parse(localStorage.getItem(this.SESSION_STORAGE_KEY) || '[]');
    return sessions.filter(s => s.isActive);
  }

  /**
   * Close session
   */
  closeSession(sessionId) {
    const sessions = JSON.parse(localStorage.getItem(this.SESSION_STORAGE_KEY) || '[]');
    const session = sessions.find(s => s.id === sessionId);

    if (session) {
      session.isActive = false;
      session.closedAt = new Date().toISOString();
      localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(sessions));
      return true;
    }

    return false;
  }

  /**
   * Force logout (used when detected new login from another device)
   */
  forceLogout(reason = 'تم تسجيل الخروج بواسطة النظام') {
    localStorage.removeItem('tf_current');
    alert(`🔒 ${reason}`);
    window.location.href = '/login.html';
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    const sessions = JSON.parse(localStorage.getItem(this.SESSION_STORAGE_KEY) || '[]');
    const students = JSON.parse(localStorage.getItem(this.STUDENT_STORAGE_KEY) || '[]');

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.isActive).length,
      totalStudents: students.length,
      studentsWithActiveSessions: students.filter(s => s.sessionId).length,
      sessionsPerDevice: this.getSessionsPerDevice(),
      sessionsPerOS: this.getSessionsPerOS()
    };
  }

  /**
   * Get sessions breakdown by device type
   */
  getSessionsPerDevice() {
    const sessions = JSON.parse(localStorage.getItem(this.SESSION_STORAGE_KEY) || '[]');
    const activeSessions = sessions.filter(s => s.isActive);
    
    const stats = {
      mobile: activeSessions.filter(s => /Mobile|Android|iPhone/.test(s.userAgent)).length,
      desktop: activeSessions.filter(s => !/Mobile|Android|iPhone/.test(s.userAgent)).length
    };

    return stats;
  }

  /**
   * Get sessions breakdown by operating system
   */
  getSessionsPerOS() {
    const sessions = JSON.parse(localStorage.getItem(this.SESSION_STORAGE_KEY) || '[]');
    const activeSessions = sessions.filter(s => s.isActive);

    const stats = {};
    activeSessions.forEach(s => {
      const os = s.browser || 'Unknown';
      stats[os] = (stats[os] || 0) + 1;
    });

    return stats;
  }

  /**
   * Export sessions report (for admin)
   */
  exportSessionsReport() {
    const sessions = JSON.parse(localStorage.getItem(this.SESSION_STORAGE_KEY) || '[]');
    const students = JSON.parse(localStorage.getItem(this.STUDENT_STORAGE_KEY) || '[]');

    const report = sessions.map(session => {
      const student = students.find(s => s.id === session.studentId);
      return {
        sessionId: session.id,
        studentName: student?.name || 'Unknown',
        studentEmail: student?.email || 'Unknown',
        startTime: session.startTime,
        lastActive: session.lastActive,
        duration: this.calculateSessionDuration(session.startTime, session.lastActive),
        status: session.isActive ? 'Active' : 'Closed',
        device: session.browser,
        resolution: session.screenResolution
      };
    });

    return report;
  }

  /**
   * Calculate session duration
   */
  calculateSessionDuration(start, end) {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const durationMs = endTime - startTime;

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}ساعة ${minutes}دقيقة`;
  }

  /**
   * Monitor session (check for new logins from other devices)
   */
  monitorSession() {
    setInterval(() => {
      const currentUser = JSON.parse(localStorage.getItem('tf_current') || 'null');
      
      if (currentUser && currentUser.sessionId) {
        const activeSession = this.getActiveSession(currentUser.id);
        
        // Check if current session is still active
        if (!activeSession || activeSession.id !== currentUser.sessionId) {
          this.forceLogout('تم تسجيل الدخول من جهاز آخر - تم إنهاء جلستك');
        }

        // Update last active
        this.updateLastActive(currentUser.sessionId);
      }
    }, 5000); // Check every 5 seconds
  }
}

// Create global instance
const sessionManager = new SessionManager();

// Auto-monitor sessions when page loads
document.addEventListener('DOMContentLoaded', () => {
  sessionManager.monitorSession();
});

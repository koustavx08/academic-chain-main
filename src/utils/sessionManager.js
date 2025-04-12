// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

class SessionManager {
  constructor() {
    this.lastActivity = Date.now();
    this.setupActivityListeners();
    this.handlePageReload();
  }

  setupActivityListeners() {
    const updateLastActivity = () => this.updateLastActivity();
    
    // Add event listeners for user activity
    window.addEventListener('mousemove', updateLastActivity);
    window.addEventListener('keydown', updateLastActivity);
    window.addEventListener('click', updateLastActivity);
    window.addEventListener('scroll', updateLastActivity);

    // Store cleanup function
    this.cleanup = () => {
      window.removeEventListener('mousemove', updateLastActivity);
      window.removeEventListener('keydown', updateLastActivity);
      window.removeEventListener('click', updateLastActivity);
      window.removeEventListener('scroll', updateLastActivity);
    };
  }

  handlePageReload() {
    // Check if there's a stored session
    const storedSession = localStorage.getItem('walletSession');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        if (session.expiry && session.expiry > Date.now()) {
          // Session is still valid
          return;
        }
      } catch (error) {
        console.error('Error parsing stored session:', error);
      }
    }
    
    // Clear session if expired or invalid
    this.clearSession();
  }

  updateLastActivity() {
    this.lastActivity = Date.now();
    // Update session expiry
    const session = this.getSession();
    if (session) {
      session.expiry = Date.now() + SESSION_TIMEOUT;
      this.saveSession(session);
    }
  }

  isSessionExpired() {
    const session = this.getSession();
    return !session || Date.now() > session.expiry;
  }

  saveSession(sessionData) {
    try {
      localStorage.setItem('walletSession', JSON.stringify({
        ...sessionData,
        expiry: Date.now() + SESSION_TIMEOUT
      }));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  getSession() {
    try {
      const storedSession = localStorage.getItem('walletSession');
      return storedSession ? JSON.parse(storedSession) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  clearSession() {
    localStorage.removeItem('walletSession');
    if (window.ethereum) {
      window.ethereum.removeAllListeners();
    }
  }

  cleanup() {
    if (this.cleanup) {
      this.cleanup();
    }
  }
}

export const sessionManager = new SessionManager(); 
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import ChatInterface from './components/ChatInterface';
import UserAuth from './components/UserAuth';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Check if this is a new browser session/tab
      const isNewSession = !sessionStorage.getItem('smartbiz_session_active');
      
      if (isNewSession && user) {
        // New session with existing user - AUTO LOGOUT
        await signOut(auth);
        setCurrentUser(null);
        sessionStorage.removeItem('smartbiz_session_active');
      } else if (user && !isNewSession) {
        // Existing session - proceed normally
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({
              uid: user.uid,
              ...userData
            });
          } else {
            await signOut(auth);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(null);
        }
      } else {
        // No user or signed out
        setCurrentUser(null);
      }

      // Mark session as active when user is logged in
      if (user && !isNewSession) {
        sessionStorage.setItem('smartbiz_session_active', 'true');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUserLogin = (userData) => {
    setCurrentUser(userData);
    // Mark session as active when user logs in
    sessionStorage.setItem('smartbiz_session_active', 'true');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div>Loading SmartBiz AI...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          background: 'white', 
          borderRadius: '15px 15px 0 0',
          padding: '25px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            margin: '0 0 10px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SmartBiz AI
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#666',
            margin: 0
          }}>
            {currentUser 
              ? `Welcome back, ${currentUser.name}! Get personalized business insights.` 
              : 'Get instant business analysis and insights'
            }
          </p>
        </div>

        {/* Authentication or Chat */}
        {!currentUser ? (
          <UserAuth onUserLogin={handleUserLogin} currentUser={currentUser} />
        ) : (
          <>
            <UserAuth onUserLogin={handleUserLogin} currentUser={currentUser} />
            <div style={{ 
              background: 'white', 
              borderRadius: '0 0 15px 15px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              height: '70vh'
            }}>
              <ChatInterface currentUser={currentUser} />
            </div>
          </>
        )}
        
        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          color: 'white',
          fontSize: '14px',
          opacity: 0.8
        }}>
          Powered by SmartBiz AI • Real-time business analysis
        </div>
      </div>
    </div>
  );
}

export default App;
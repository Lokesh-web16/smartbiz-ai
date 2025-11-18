import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const UserAuth = ({ onUserLogin, currentUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pincode: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    // Name validation
    if (!isLogin && (!formData.name.trim() || formData.name.length < 2)) {
      setError('Please enter a valid name (min 2 characters)');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation (Indian format)
    if (!isLogin) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
        setError('Please enter a valid 10-digit Indian phone number');
        return false;
      }
    }

    // Pincode validation (Indian format)
    if (!isLogin) {
      const pincodeRegex = /^\d{6}$/;
      if (!pincodeRegex.test(formData.pincode)) {
        setError('Please enter a valid 6-digit pincode');
        return false;
      }
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    setError('');
    return true;
  };

  const getFriendlyErrorMessage = async (errorCode, email) => {
    // Check if user exists for invalid-credential errors
    if (errorCode === 'auth/invalid-credential') {
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length === 0) {
          return 'No account found with this email. Please sign up first.';
        } else {
          return 'Invalid password. Please try again.';
        }
      } catch (error) {
        return 'Invalid email or password. Please try again.';
      }
    }
    
    const errorMessages = {
      // Login errors
      'auth/user-not-found': 'No account found with this email. Please sign up first.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-email': 'Please enter a valid email address.',
      
      // Registration errors
      'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
      'auth/weak-password': 'Password is too weak. Please use a stronger password.',
      
      // Common errors
      'auth/network-request-failed': 'Network error. Please check your internet connection.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.'
    };
    
    return errorMessages[errorCode] || 'Something went wrong. Please try again.';
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Store user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        pincode: formData.pincode,
        createdAt: new Date(),
        chatHistory: []
      });

      // Pass COMPLETE user data to parent WITH chatHistory
      const userData = {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        pincode: formData.pincode,
        chatHistory: [] // ADD THIS LINE
      };
      
      onUserLogin(userData);
      
    } catch (error) {
      console.error('Registration error:', error);
      const friendlyError = await getFriendlyErrorMessage(error.code, formData.email);
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Pass COMPLETE user data to parent WITH chatHistory
        const completeUserData = {
          uid: user.uid,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          pincode: userData.pincode,
          chatHistory: userData.chatHistory || [] // ADD THIS LINE
        };
        
        onUserLogin(completeUserData);
      } else {
        setError('Account not found. Please register first.');
        await signOut(auth);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      const friendlyError = await getFriendlyErrorMessage(error.code, formData.email);
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onUserLogin(null);
      setFormData({ name: '', email: '', phone: '', pincode: '', password: '' });
      setError('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  // If user is logged in, show welcome message
  if (currentUser) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
        padding: '15px 20px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '0 0 10px 10px'
      }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            👋 Hello, {currentUser.name}!
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
            📍 {currentUser.pincode} • 📞 {currentUser.phone}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  // Login/Register form
  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '25px',
      color: 'white',
      borderRadius: '0 0 15px 15px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '20px' }}>
          {isLogin ? 'Welcome Back!' : 'Join SmartBiz AI'}
        </h3>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
          {isLogin ? 'Sign in to continue' : 'Create account for personalized insights'}
        </p>
      </div>

      {/* ERROR DISPLAY - This will show user-friendly errors */}
      {error && (
        <div style={{
          color: 'red',
          backgroundColor: '#ffe6e6',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '15px',
          border: '1px solid #ffcccc',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              outline: 'none'
            }}
            required
          />
        )}
        
        <input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            outline: 'none'
          }}
          required
        />

        {!isLogin && (
          <>
            <input
              type="tel"
              placeholder="Phone Number (10 digits)"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
              maxLength="10"
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                outline: 'none'
              }}
              required
            />
            
            <input
              type="text"
              placeholder="Pincode (6 digits)"
              value={formData.pincode}
              onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}
              maxLength="6"
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                outline: 'none'
              }}
              required
            />
          </>
        )}

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            outline: 'none'
          }}
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError(''); // Clear errors when switching modes
            setFormData({ name: '', email: '', phone: '', pincode: '', password: '' }); // Clear form
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default UserAuth;
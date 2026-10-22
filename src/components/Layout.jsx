import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const token = localStorage.getItem('adminToken');
  
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

  // 🤖 AI Chatbot States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Assalam-o-Alaikum Sir! Main GCIT AI hoon. Aap mujhse school ke kisi bhi student ya attendance ke baare me kuch bhi pooch sakte hain.' }]);
  const [inputMsg, setInputMsg] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    )},
    { name: 'Students', path: '/students', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    )},
    { name: 'Add Student', path: '/add-student', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
    { name: 'Reports', path: '/reports', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    )},
  ];

  const displayName = 'Sir Principal';

  // 🎙️ Natural Voice (Wapas Hindi Female Voice)
  const speakText = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Best Hindi Female voice dhoondo
    const bestVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('hi')) || 
                      voices.find(v => v.lang.includes('hi-IN')) ||
                      voices.find(v => v.lang.includes('en-IN')) ||
                      voices[0];

    if (bestVoice) speech.voice = bestVoice;
    
    speech.lang = 'hi-IN'; // Wapas Hindi
    speech.rate = 0.95; // Slow for human feel
    speech.pitch = 1.05; // Friendly tone
    window.speechSynthesis.speak(speech);
  };

  // 🤖 AI Chat Handler
  const handleSendMessage = async (textOverride = null) => {
    const messageToSend = textOverride || inputMsg;
    if (!messageToSend.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
    if (!textOverride) setInputMsg('');
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_BASE}/api/attendance/ask-ai`, 
        { question: messageToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const aiAnswer = res.data.answer;
      setMessages(prev => [...prev, { role: 'ai', text: aiAnswer }]);
      
      // 🔊 Natural Voice Output
      speakText(aiAnswer);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Bhai, thoda network issue hai. Dobara try karo.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 🎤 Voice Input Handler
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Aapka browser voice recognition support nahi karta. Chrome use karein.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'hi-IN'; // Hindi/Hinglish input
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => {
      setIsListening(false);
      setInputMsg(''); // Mic band hone par text box clear
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMsg(transcript);
      handleSendMessage(transcript);
    };

    recognition.start();
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative">
      
      {/* Premium Sidebar */}
      <aside className="w-64 bg-slate-900 dark:bg-slate-950 text-white flex flex-col shadow-2xl z-20 transition-colors duration-300 border-r border-slate-800">
        
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/80 bg-slate-950">
          <h1 className="text-lg font-extrabold tracking-wide flex items-center gap-3">
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center p-1 shadow-lg shadow-green-900/50">
              <img src="/logo.png" alt="GCIT Logo" className="h-full w-full object-contain rounded-full" />
            </div>
            GCIT COLLAGE
          </h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 mt-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-900/30 font-semibold translate-x-1'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className={`${location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* USER PROFILE SECTION */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-950">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-900/50 border-2 border-slate-800">
              {displayName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{displayName}</p>
              <p className="text-xs font-medium text-slate-500 truncate">GCIT COLLAGE</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex justify-between items-center px-8 sticky top-0 z-10 transition-colors duration-300">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize tracking-tight">
            {location.pathname.replace('/', '').replace('-', ' ')}
          </h2>
          
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all shadow-sm flex items-center gap-2 font-bold text-sm"
          >
            {isDark ? (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Light</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> Dark</>
            )}
          </button>
        </header>
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* 🤖 FLOATING AI CHATBOT */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Chat Window */}
        {isChatOpen && (
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 mb-4 overflow-hidden animate-pop flex flex-col h-[500px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">🤖</div>
                <div>
                  <h3 className="font-bold text-sm">GCIT AI Assistant</h3>
                  <p className="text-[10px] text-green-100">Friendly & Smart</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white hover:bg-white/20 p-1 rounded-lg transition">✕</button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium ${msg.role === 'user' ? 'bg-green-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm border border-slate-100 dark:border-slate-600 rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-600 flex gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2">
              <input 
                type="text" 
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Kuch poochiye..." 
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-green-500 text-sm dark:text-white outline-none"
              />
              <button 
                onClick={handleVoiceInput}
                className={`p-2.5 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white hover:bg-slate-300'}`}
                title="Speak"
              >
                {isListening ? '🔴' : '🎤'}
              </button>
              <button 
                onClick={() => handleSendMessage()}
                className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
              >
                ➤
              </button>
            </div>
          </div>
        )}

        {/* Floating Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-900/50 hover:scale-110 transition-transform relative"
        >
          <span className="text-2xl">{isChatOpen ? '✕' : '🤖'}</span>
          {!isChatOpen && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>}
        </button>
      </div>
    </div>
  );
};

export default Layout;
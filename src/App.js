import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import Particles from 'react-particles';
import { loadFull } from 'tsparticles';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState(JSON.parse(localStorage.getItem('birthdayMessages')) || []);
  const [newMessage, setNewMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Target birthday date (change to actual date)
  const targetDate = new Date('2024-12-25T00:00:00'); // Example: Christmas Day

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setShowConfetti(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const addMessage = () => {
    if (newMessage.trim()) {
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      localStorage.setItem('birthdayMessages', JSON.stringify(updatedMessages));
      setNewMessage('');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const photos = [
    'https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Birthday+Photo+1',
    'https://via.placeholder.com/800x600/4ECDC4/FFFFFF?text=Birthday+Photo+2',
    'https://via.placeholder.com/800x600/45B7D1/FFFFFF?text=Birthday+Photo+3',
  ]; // Replace with actual photo URLs

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: isDarkMode ? '#000' : '#fff' } },
          fpsLimit: 120,
          interactivity: { events: { onClick: { enable: true, mode: 'push' }, onHover: { enable: true, mode: 'repulse' } } },
          particles: { color: { value: '#ff6b6b' }, links: { color: '#ff6b6b', distance: 150, enable: true, opacity: 0.5, width: 1 }, move: { direction: 'none', enable: true, outModes: 'bounce', random: false, speed: 2, straight: false }, number: { density: { enable: true }, value: 80 }, opacity: { value: 0.5 }, shape: { type: 'circle' }, size: { value: { min: 1, max: 5 } } },
        }}
      />
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="header"
      >
        <h1>🎉 Happy Birthday! 🎉</h1>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="theme-toggle">
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </motion.header>
      <motion.section
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
        className="countdown"
      >
        <h2>Countdown to Your Special Day</h2>
        <div className="timer">
          <div>{timeLeft.days} Days</div>
          <div>{timeLeft.hours} Hours</div>
          <div>{timeLeft.minutes} Minutes</div>
          <div>{timeLeft.seconds} Seconds</div>
        </div>
      </motion.section>
      <motion.section
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="gallery"
      >
        <h2>Memorable Moments</h2>
        <Slider {...sliderSettings}>
          {photos.map((photo, index) => (
            <div key={index}>
              <img src={photo} alt={`Birthday ${index + 1}`} className="gallery-img" />
            </div>
          ))}
        </Slider>
      </motion.section>
      <motion.section
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="messages"
      >
        <h2>Birthday Wishes</h2>
        <div className="message-list">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="message"
            >
              {msg}
            </motion.div>
          ))}
        </div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write a birthday wish..."
          className="message-input"
        />
        <button onClick={addMessage} className="add-btn">Add Wish</button>
      </motion.section>
      <audio autoPlay loop>
        <source src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" type="audio/wav" /> {/* Replace with actual music URL */}
      </audio>
    </div>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import './App.css';

// Definición de niveles
const LEVELS = [
  { name: "Fapper", days: 0, color: "color-red" },
  { name: "Principiante", days: 3, color: "color-orange" },
  { name: "Aprendiz", days: 7, color: "color-yellow" },
  { name: "Disciplinado", days: 14, color: "color-green" },
  { name: "Maestro", days: 30, color: "color-blue" },
  { name: "Experto", days: 60, color: "color-indigo" },
  { name: "Leyenda", days: 90, color: "color-purple" },
  { name: "Gran maestro del Nofap", days: 120, color: "color-pink" }
];

function App() {
  // Estados para la aplicación
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(LEVELS[0]);
  const [startDate, setStartDate] = useState(null);
  const [relapseHistory, setRelapseHistory] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [maxStreak, setMaxStreak] = useState(0);
  
  // Efecto para cargar datos guardados
  useEffect(() => {
    const savedData = localStorage.getItem('nofapData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setStreak(parsedData.streak);
      setStartDate(parsedData.startDate ? new Date(parsedData.startDate) : null);
      setRelapseHistory(parsedData.relapseHistory || []);
      setMaxStreak(parsedData.maxStreak || 0);
      
      // Determinar el nivel basado en la racha actual
      const currentLevel = LEVELS.reduce((prev, curr) => {
        return parsedData.streak >= curr.days ? curr : prev;
      }, LEVELS[0]);
      setLevel(currentLevel);
    }
  }, []);
  
  // Efecto para guardar datos cuando cambien
  useEffect(() => {
    const dataToSave = {
      streak,
      startDate,
      relapseHistory,
      maxStreak
    };
    localStorage.setItem('nofapData', JSON.stringify(dataToSave));
    
    // Actualizar nivel basado en la racha actual
    const currentLevel = LEVELS.reduce((prev, curr) => {
      return streak >= curr.days ? curr : prev;
    }, LEVELS[0]);
    setLevel(currentLevel);
  }, [streak, startDate, relapseHistory, maxStreak]);
  
  // Efecto para incrementar la racha cada día a medianoche
  useEffect(() => {
    const checkDate = () => {
      if (startDate) {
        const today = new Date();
        const daysPassed = Math.floor((today - new Date(startDate)) / (1000 * 60 * 60 * 24));
        if (daysPassed > streak) {
          setStreak(daysPassed);
        }
      }
    };
    
    // Verificar al cargar y programar la próxima verificación para medianoche
    checkDate();
    
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow - now;
    
    const timer = setTimeout(() => {
      checkDate();
      // Reiniciar el temporizador diario
      const dailyTimer = setInterval(checkDate, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyTimer);
    }, timeUntilMidnight);
    
    return () => clearTimeout(timer);
  }, [startDate, streak]);
  
  // Función para iniciar o reiniciar la racha
  const startStreak = () => {
    const now = new Date();
    setStartDate(now);
    setStreak(0);
  };
  
  // Función para registrar una recaída
  const registerRelapse = () => {
    const today = new Date();
    
    // Actualizar historial de recaídas
    setRelapseHistory(prev => [...prev, today.toISOString()]);
    
    // Guardar racha máxima si superó la anterior
    if (streak > maxStreak) {
      setMaxStreak(streak);
    }
    
    // Reiniciar la racha
    setStreak(0);
    setStartDate(today);
    setLevel(LEVELS[0]);
  };
  
  // Calcular el progreso hasta el siguiente nivel
  const calculateNextLevel = () => {
    const nextLevelIndex = LEVELS.findIndex(l => l.days > streak);
    if (nextLevelIndex === -1) return null; // Ya en nivel máximo
    
    const nextLevel = LEVELS[nextLevelIndex];
    const daysLeft = nextLevel.days - streak;
    const progress = streak / nextLevel.days * 100;
    
    return {
      name: nextLevel.name,
      daysLeft,
      progress: Math.min(progress, 100)
    };
  };
  
  const nextLevelInfo = calculateNextLevel();
  
  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  return (
    <div className="container">
      <header className="header">
        <h1 className="title">NO fap dude</h1>
        <p className="subtitle">Tu compañero en el camino del autocontrol</p>
      </header>
      
      <div className="card">
        {!startDate ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '16px' }}>¡Comienza tu viaje hacia el autocontrol!</p>
            <button 
              onClick={startStreak}
              className="button button-green"
            >
              ¡Comenzar ahora!
            </button>
          </div>
        ) : (
          <>
            <div className="day-counter">
              <div>
                <span className="counter">{streak}</span>
                <span className="counter-label">días</span>
              </div>
              <p className="start-date">Comenzaste el {formatDate(startDate)}</p>
            </div>
            
            <div className="level-section">
              <h2 className="level-title">Nivel actual</h2>
              <div className={`level-name ${level.color}`}>
                {level.name}
              </div>
              {maxStreak > 0 && (
                <p className="record">
                  Récord personal: {maxStreak} días
                </p>
              )}
            </div>
            
            {nextLevelInfo && (
              <div className="progress-section">
                <p className="progress-text">
                  {nextLevelInfo.daysLeft} días para alcanzar "{nextLevelInfo.name}"
                </p>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${nextLevelInfo.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="button-group">
              <button 
                onClick={() => setShowCalendar(true)}
                className="button button-blue"
              >
                <span className="button-icon">📅</span>
                Historial
              </button>
              <button 
                onClick={registerRelapse}
                className="button button-red"
              >
                <span className="button-icon">🔄</span>
                Recaída
              </button>
            </div>
          </>
        )}
      </div>
      
      <div className="card">
        <h2 className="level-title" style={{ textAlign: 'center', marginBottom: '16px' }}>Niveles de progreso</h2>
        <div className="levels-list">
          {LEVELS.map((lvl, index) => (
            <div 
              key={index} 
              className={`level-item ${level.days >= lvl.days ? "level-active" : "level-inactive"}`}
            >
              <div className="level-icon-name">
                <span className={`level-icon ${level.days >= lvl.days ? lvl.color : ""}`}>
                  {level.days >= lvl.days ? "✓" : "✗"}
                </span>
                <span className={level.days >= lvl.days ? lvl.color : ""}>
                  {lvl.name}
                </span>
              </div>
              <div className="level-days">{lvl.days} días</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Modal para el calendario */}
      {showCalendar && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Historial de recaídas</h3>
                <button 
                  onClick={() => setShowCalendar(false)}
                  className="close-button"
                >
                  ✕
                </button>
              </div>
              
              {relapseHistory.length === 0 ? (
                <div className="empty-history">
                  <span className="empty-icon" style={{ fontSize: '32px' }}>🏆</span>
                  <p>¡No hay recaídas registradas!</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>Sigue así, campeón.</p>
                </div>
              ) : (
                <div className="history-list">
                  {relapseHistory
                    .sort((a, b) => new Date(b) - new Date(a))
                    .map((date, index) => (
                      <div 
                        key={index} 
                        className="history-item"
                      >
                        <span>{formatDate(date)}</span>
                        {index < relapseHistory.length - 1 && (
                          <span className="streak-days">
                            {Math.floor((new Date(date) - new Date(relapseHistory[index + 1])) / (1000 * 60 * 60 * 24))} días
                          </span>
                        )}
                      </div>
                  ))}
                </div>
              )}
              
              <button 
                onClick={() => setShowCalendar(false)}
                className="button button-blue"
                style={{ width: '100%', marginTop: '24px' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
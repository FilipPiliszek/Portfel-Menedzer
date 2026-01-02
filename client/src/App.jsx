import { useEffect, useState } from 'react'
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register'; // 1. Musisz zaimportować nowy komponent
import './App.css'

function App() {
  // stan sesji
  const [user, setUser] = useState(null);

  // informacja czy pokazujemy ekran rejestracji
  const [isRegistering, setIsRegistering] = useState(false);

  // sprawdzanie sesji przy starcie
  useEffect(() => {
    const savedUser = localStorage.getItem('pm_session');
    if(savedUser){
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // funkcja logowania (i rejestracji)
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('pm_session', JSON.stringify(userData));
  };

  // funkcja wylogowania
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pm_session');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {user ? (
        // sesja aktywna - wyswietlamy dashboard
        <Dashboard user={user} onLogout={handleLogout} />
      ) : isRegistering ? (
        // jesli nie zalogowany i kliknieto rejestracje
        <Register 
          onRegister={handleLogin} 
          onSwitchToLogin={() => setIsRegistering(false)} 
        />
      ) : (
        // sesja nieaktywna - ekran logowania
        <Login 
          onLogin={handleLogin} 
          onSwitchToRegister={() => setIsRegistering(true)} // przejscie do rejestracji
        />
      )}
    </div>
  );
}

export default App;
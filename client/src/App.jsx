import { useEffect, useState } from 'react'
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css'

function App() {
  // stan sesji
  const [user, setUser] = useState(0)

  // sprawdzanie czy przed odswiezeniem strony uzytkownik byl zalogowany(zabezpieczenie przed tym ze jak juz sie zalogujemy i odswiezymy to
  // zeby byl dashboard odrazu a nie ze trzeba logowac sie jeszcze raz)
  useEffect(() => {
    const savedUser = localStorage.getItem('pm_session');
    if(savedUser){
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // funkcja logowania
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
        // sesja aktywna wyswietlamy dashboard 
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        // sesja nieaktywna wyswietlamy ekran logowania
        <Login onLogin = {handleLogin} />
      )}
    </div>
  );
}

export default App;

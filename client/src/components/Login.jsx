import React, { useState } from 'react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // walidacja
    if (!email || !password) {
      setError('Wypełnij wszystkie pola!');
      return;
    }

    // symulacja autoryzacji (potem zastapimy to zapytaniem do nodea i on sprawdzi z baza czy sie zgadza)
    if (email === 'admin@edu.p.lodz.pl' && password === 'admin') {
      onLogin({ email, name: 'Użytkownik' });
    } else {
      setError('Błąd danych');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Logowanie PM</h2>
      {error && <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="email" placeholder="Email" className="w-full p-2 border rounded"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Hasło" className="w-full p-2 border rounded"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Zaloguj się
        </button>
      </form>
    </div>
  );
}

export default Login;
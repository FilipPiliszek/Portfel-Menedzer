import React, { useState } from 'react';

function Register({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError('Wszystkie pola są wymagane!');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        onRegister(data.user);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Załóż konto</h2>
      {error && <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Imię/Nick" className="w-full p-2 border rounded" 
               onChange={e => setFormData({...formData, username: e.target.value})} />
        <input type="email" placeholder="Email" className="w-full p-2 border rounded" 
               onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Hasło" className="w-full p-2 border rounded" 
               onChange={e => setFormData({...formData, password: e.target.value})} />
        <button className="w-full bg-green-600 text-white py-2 rounded font-bold">Zarejestruj się</button>
      </form>
      <button onClick={onSwitchToLogin} className="w-full mt-4 text-sm text-blue-500 underline">
        Masz już konto? Zaloguj się
      </button>
    </div>
  );
}

export default Register;
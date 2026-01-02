const pool = require('./db');
const bcrypt = require('bcrypt');

// ENDPOINT LOGOWANIA
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Szukamy użytkownika w bazie
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Nieprawidłowy email lub hasło" });
    }

    // Sprawdzamy hasło (na razie uproszczone, jeśli w bazie masz czysty tekst)
    if (password === user.rows[0].password) {
      res.json({ 
        success: true, 
        user: { id: user.rows[0].id, name: user.rows[0].username, email: user.rows[0].email } 
      });
    } else {
      res.status(401).json({ message: "Nieprawidłowy email lub hasło" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});
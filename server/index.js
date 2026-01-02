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

    // Sprawdzamy hasło używając bcrypt
    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (validPassword) {
        res.json({
        success: true,
        user: { 
            id: user.rows[0].id, 
            name: user.rows[0].username, 
            email: user.rows[0].email 
        }
    });
    } else {
        res.status(401).json({ message: "Nieprawidłowy email lub hasło" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

const bcrypt = require('bcrypt');

// ENDPOINT REJESTRACJI
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Sprawdzamy czy użytkownik o takim mailu już istnieje
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Użytkownik o tym adresie email już istnieje" });
    }

    // Szyfrujemy hasło (dobra praktyka - 10 rund solenia)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Zapisujemy do bazy danych
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    res.json({ success: true, user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera przy rejestracji");
  }
});
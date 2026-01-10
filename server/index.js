const express = require('express');
const cors = require('cors');
const pool = require('./db'); // połączenie z bazą danych
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// Middleware - niezbędne, żeby serwer rozumiał dane JSON i pozwalał na połączenie z Reactem
app.use(cors());
app.use(express.json());

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

// ENDPOINT REJESTRACJI
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Sprawdzamy czy użytkownik o takim mailu już istnieje
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Użytkownik o tym adresie email już istnieje" });
    }

    // Szyfrujemy hasło
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

// URUCHOMIENIE SERWERA
const PORT = process.env.PORT || 5000;

// endpoint do dodawania transakcji z weryfikacja limitu miesiecznego
app.post('/api/transactions', async (req, res) => {
  const { user_id, amount, category, description } = req.body;
  const numericAmount = parseFloat(amount);

  try {
    // sprawdz kategorie, jej id oraz limit ustawiony przez uzytkownika 
    const categoryRes = await pool.query(
      'SELECT id, budget_limit FROM categories WHERE user_id = $1 AND name = $2',
      [user_id, category]
    );

    let overLimit = false;

    if (categoryRes.rows.length > 0) {
      const categoryId = categoryRes.rows[0].id;
      const limit = parseFloat(categoryRes.rows[0].budget_limit);

      // suma wydatkow z biezacego miesiaca dla tej kategorii (od 1 dnia miesiaca!)
      const sumRes = await pool.query(
        `SELECT SUM(amount) as total FROM transactions 
         WHERE user_id = $1 
         AND category_id = $2 
         AND date >= date_trunc('month', CURRENT_DATE)`,
        [user_id, categoryId]
      );

      const currentMonthSum = parseFloat(sumRes.rows[0].total || 0);

      // czy przekroczy limit?
      if (limit > 0 && (currentMonthSum + numericAmount) > limit) {
        overLimit = true;
      }

      // zapis transakcji
      const newTransaction = await pool.query(
        'INSERT INTO transactions (user_id, category_id, amount, description, date) VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING *',
        [user_id, categoryId, numericAmount, description || `Wydatek: ${category}`]
      );

      res.json({ 
        success: true, 
        transaction: newTransaction.rows[0],
        overLimit: overLimit,
        currentSum: currentMonthSum + numericAmount,
        limit: limit
      });

    } else {
      const newTransaction = await pool.query(
        'INSERT INTO transactions (user_id, amount, description, date) VALUES ($1, $2, $3, CURRENT_DATE) RETURNING *',
        [user_id, numericAmount, description || `Wydatek: ${category}`]
      );
      res.json({ success: true, transaction: newTransaction.rows[0], overLimit: false });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera przy zapisie transakcji");
  }
});

app.listen(PORT, () => {
    console.log(`Serwer Portfel Menedżer działa na porcie ${PORT}`);
});
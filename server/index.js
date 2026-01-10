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

// ENDPOINTY KATEGORII
// Pobieranie kategorii użytkownika
app.get('/api/categories/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const categories = await pool.query(
      'SELECT id, name, budget_limit FROM categories WHERE user_id = $1 ORDER BY name',
      [userId]
    );
    res.json(categories.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Dodawanie nowej kategorii
app.post('/api/categories', async (req, res) => {
  const { userId, name, budgetLimit } = req.body;

  try {
    const limit = Math.max(0, parseFloat(budgetLimit) || 0); // Zapewniamy, że limit nie jest ujemny
    const newCategory = await pool.query(
      'INSERT INTO categories (user_id, name, budget_limit) VALUES ($1, $2, $3) RETURNING id, name, budget_limit',
      [userId, name.trim(), limit]
    );
    res.json(newCategory.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Aktualizacja kategorii (w tym limitu budżetowego)
app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, budgetLimit } = req.body;

  try {
    const limit = Math.max(0, parseFloat(budgetLimit) || 0); // Zapewniamy, że limit nie jest ujemny
    const updatedCategory = await pool.query(
      'UPDATE categories SET name = $1, budget_limit = $2 WHERE id = $3 RETURNING id, name, budget_limit',
      [name.trim(), limit, id]
    );
    res.json(updatedCategory.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Usuwanie kategorii
app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ message: "Kategoria usunięta" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// ENDPOINTY TRANSAKCJI
// Pobieranie transakcji użytkownika
app.get('/api/transactions/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const transactions = await pool.query(
      `SELECT t.id, t.amount, t.description, t.date, c.name as category_name, c.id as category_id
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1
       ORDER BY t.date DESC, t.created_at DESC`,
      [userId]
    );
    res.json(transactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Dodawanie nowej transakcji
app.post('/api/transactions', async (req, res) => {
  const { userId, categoryId, amount, description } = req.body;

  try {
    // Sprawdzamy aktualne wydatki w kategorii
    const spendingQuery = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total_spent FROM transactions WHERE user_id = $1 AND category_id = $2',
      [userId, categoryId]
    );
    const totalSpent = parseFloat(spendingQuery.rows[0].total_spent);

    // Sprawdzamy limit kategorii
    const categoryQuery = await pool.query(
      'SELECT budget_limit FROM categories WHERE id = $1',
      [categoryId]
    );
    const budgetLimit = Math.max(0, parseFloat(categoryQuery.rows[0]?.budget_limit || 0)); // Zapewniamy nieujemny limit

    const newTotal = totalSpent + parseFloat(amount);

    if (budgetLimit > 0 && newTotal > budgetLimit) {
      return res.status(400).json({
        message: `Przekroczenie limitu kategorii! Limit: ${budgetLimit} zł, aktualne wydatki: ${totalSpent} zł, po dodaniu: ${newTotal} zł`
      });
    }

    // Dodajemy transakcję
    const newTransaction = await pool.query(
      'INSERT INTO transactions (user_id, category_id, amount, description) VALUES ($1, $2, $3, $4) RETURNING id, amount, description, date',
      [userId, categoryId, parseFloat(amount), description]
    );

    res.json({
      ...newTransaction.rows[0],
      remaining: budgetLimit > 0 ? budgetLimit - newTotal : null
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Pobieranie podsumowania wydatków po kategoriach
app.get('/api/spending-summary/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const summary = await pool.query(
      `SELECT c.id, c.name, GREATEST(0, c.budget_limit) as budget_limit,
              COALESCE(SUM(t.amount), 0) as total_spent,
              CASE WHEN GREATEST(0, c.budget_limit) > 0 THEN GREATEST(0, c.budget_limit) - COALESCE(SUM(t.amount), 0) ELSE NULL END as remaining
       FROM categories c
       LEFT JOIN transactions t ON c.id = t.category_id AND t.user_id = $1
       WHERE c.user_id = $1
       GROUP BY c.id, c.name, c.budget_limit
       ORDER BY c.name`,
      [userId]
    );
    res.json(summary.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
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

// endpoint do pobierania transakcji uzytkownika
app.get('/api/transactions/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const transactions = await pool.query(
      'SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id = $1 ORDER BY t.date DESC',
      [userId]
    );
    res.json(transactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera przy pobieraniu transakcji");
  }
});

app.listen(PORT, () => {
    console.log(`Serwer Portfel Menedżer działa na porcie ${PORT}`);
});
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

    // Dodajemy domyślne kategorie dla nowego użytkownika
    const userId = newUser.rows[0].id;
    const defaultCategories = [
      { name: 'Jedzenie', limit: 1000 },
      { name: 'Transport', limit: 500 },
      { name: 'Rozrywka', limit: 300 },
      { name: 'Zakupy', limit: 800 }
    ];

    for (const cat of defaultCategories) {
      await pool.query(
        'INSERT INTO categories (user_id, name, budget_limit) VALUES ($1, $2, $3)',
        [userId, cat.name, cat.limit]
      );
    }

    res.json({ success: true, user: { id: newUser.rows[0].id, name: newUser.rows[0].username, email: newUser.rows[0].email } });
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
    // Dodano t.type do selecta, aby frontend mógł rozróżnić wydatki od wpływów
    const transactions = await pool.query(
      `SELECT t.id, t.amount, t.description, t.date, t.type, c.name as category_name, c.id as category_id
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

// Pobieranie podsumowania wydatków po kategoriach
app.get('/api/spending-summary/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Dodano warunek (t.type = 'expense' OR t.type IS NULL) aby nie wliczać wpływów do budżetu
    const summary = await pool.query(
  `SELECT c.id, c.name, c.budget_limit,
          COALESCE(SUM(t.amount), 0) as total_spent,
          CASE WHEN c.budget_limit > 0 THEN c.budget_limit - COALESCE(SUM(t.amount), 0) ELSE NULL END as remaining
   FROM categories c
   LEFT JOIN transactions t ON c.id = t.category_id 
     AND t.user_id = $1 
     AND (t.type = 'expense' OR t.type IS NULL)
     AND t.date >= date_trunc('month', CURRENT_DATE) 
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

// Pobieranie podsumowania wydatków po kategoriach dla konkretnego miesiąca
app.get('/api/monthly-summary/:userId/:month', async (req, res) => {
  const { userId, month } = req.params; // month w formacie YYYY-MM

  try {
    // Sprawdzamy format miesiąca
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "Nieprawidłowy format miesiąca. Użyj YYYY-MM" });
    }

    // Dodano filtrowanie po typie expense
    const summary = await pool.query(
      `SELECT c.id, c.name, c.budget_limit,
              COALESCE(SUM(t.amount), 0) as total_spent,
              CASE WHEN c.budget_limit > 0 THEN c.budget_limit - COALESCE(SUM(t.amount), 0) ELSE NULL END as remaining
       FROM categories c
       LEFT JOIN transactions t ON c.id = t.category_id 
         AND t.user_id = $1 
         AND (t.type = 'expense' OR t.type IS NULL)
         AND to_char(t.date, 'YYYY-MM') = $2
       WHERE c.user_id = $1
       GROUP BY c.id, c.name, c.budget_limit
       ORDER BY c.name`,
      [userId, month]
    );
    res.json(summary.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// endpoint do dodawania transakcji z weryfikacja limitu miesiecznego
// Dodawanie nowej transakcji z limitem MIESIĘCZNYM
app.post('/api/transactions', async (req, res) => {
  const { userId, categoryId, amount, description } = req.body;
  const numAmount = parseFloat(amount);

  try {
    // tylko wydatki wliczamy do sumy (type = 'expense')
    const sumRes = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE user_id = $1 AND category_id = $2 
       AND (type = 'expense' OR type IS NULL)
       AND date >= date_trunc('month', CURRENT_DATE)`,
      [userId, categoryId]
    );
    const monthlySum = parseFloat(sumRes.rows[0].total);

    // pobieramy limit kategorii
    const catRes = await pool.query('SELECT budget_limit FROM categories WHERE id = $1', [categoryId]);
    const limit = parseFloat(catRes.rows[0]?.budget_limit || 0);

    // czy po nowej transakcji przekroczono limt?
    const overLimit = (limit > 0 && (monthlySum + numAmount) > limit);

    // zapis - dodajemy 'type' = 'expense'
    const newTransaction = await pool.query(
      "INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES ($1, $2, $3, 'expense', $4, CURRENT_DATE) RETURNING *",
      [userId, categoryId, numAmount, description]
    );

    res.json({
      success: true,
      transaction: newTransaction.rows[0],
      overLimit: overLimit,
      currentSum: monthlySum + numAmount,
      limit: limit
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// --- NOWE ENDPOINTY (SALDO I WPŁYWY) ---

app.get('/api/user/balance/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income, SUM(CASE WHEN type = 'expense' OR type IS NULL THEN amount ELSE 0 END) as spent FROM transactions WHERE user_id = $1",
      [userId]
    );
    const inc = parseFloat(result.rows[0].income || 0);
    const spnt = parseFloat(result.rows[0].spent || 0);
    res.json({ balance: inc - spnt, totalIncome: inc, totalSpent: spnt });
  } catch (err) { res.status(500).send("Błąd"); }
});

app.post('/api/user/add-income', async (req, res) => {
  const { userId, amount } = req.body;
  try {
    await pool.query("INSERT INTO transactions (user_id, amount, type, description, date) VALUES ($1, $2, 'income', 'Wpłata', CURRENT_DATE)", [userId, amount]);
    res.json({ success: true });
  } catch (err) { res.status(500).send("Błąd"); }
});

// ---------------------------------------

// usuwanie transakcji
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM transactions WHERE id = $1', [req.params.id]);
    res.json({ message: "Transakcja usunięta" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera przy usuwaniu transakcji");
  }
});

// edycja transakcji
app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { amount, description, categoryId } = req.body;
  try {
    const updated = await pool.query(
      'UPDATE transactions SET amount = $1, description = $2, category_id = $3 WHERE id = $4 RETURNING *',
      [amount, description, categoryId, id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera przy edycji transakcji");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serwer Portfel Menedżer działa na porcie ${PORT}`);
});
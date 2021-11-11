const express = require('express');
const cors = require('cors');
const app = express();
const { pool } = require('./config');

const port = 3000;

app.use(cors());

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Welcome to the recipe API!');
});

app.get('/recipes', (req, res) => {
  pool.query('SELECT * FROM recipes', (error, results) => {
    if (error) {
      res.status(400).json(error);
    } else {
      res.json({ recipes: results.rows });
    }
  });
});

app.post('/recipes', (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;
  const values = [title, making_time, serves, ingredients, cost];

  pool.query(
    'INSERT INTO recipes (title, making_time, serves, ingredients, cost) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    values,
    (error, results) => {
      if (error) {
        res.status(400).json({
          message: 'Recipe creation failed!',
          required: 'title, making_time, serves, ingredients, cost',
        });
      } else {
        console.log(results);
        res.json({
          message: 'Recipe successfully created!',
          recipe: results.rows,
        });
      }
    }
  );
});

app.get('/recipes/:id', (req, res) => {
  const { id } = req.params;

  pool.query('SELECT * FROM recipes WHERE id = $1', [id], (error, results) => {
    if (error) {
      res.status(400).json(error);
    } else {
      res.json({
        message: 'Recipe details by id',
        recipe: results.rows,
      });
    }
  });
});

app.patch('/recipes/:id', (req, res) => {
  const { id } = req.params;
  const { title, making_time, serves, ingredients, cost } = req.body;
  const values = [title, making_time, serves, ingredients, cost, id];

  pool.query(
    'UPDATE recipes SET title = $1, making_time = $2, serves = $3, ingredients = $4, cost = $5 WHERE id = $6 RETURNING *',
    values,
    (error, results) => {
      if (error) {
        res.status(400).json(error);
      } else {
        res.json({
          message: 'Recipe successfully updated!',
          recipe: results.rows,
        });
      }
    }
  );
});

app.delete('/recipes/:id', (req, res) => {
  const { id } = req.params;

  pool.query('DELETE FROM recipes WHERE id = $1', [id], (error, results) => {
    if (error) {
      res.status(400).json({
        message: 'No recipe found',
      });
    } else {
      res.json({
        message: 'Recipe successfully removed!',
      });
    }
  });
});

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

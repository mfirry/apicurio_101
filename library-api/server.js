import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// In-memory storage
const books = new Map();

// Load OpenAPI specification
const openApiSpec = YAML.load('./openapi.yaml');

// Serve OpenAPI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// POST /books - Add a new book
app.post('/books', (req, res) => {
  const { title, author } = req.body;
  
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }
  
  const id = uuidv4();
  books.set(id, { title, author });
  
  res.status(201).json({ id });
});

// GET /books/:id - Get book by ID
app.get('/books/:id', (req, res) => {
  const { id } = req.params;
  
  if (books.has(id)) {
    res.json(books.get(id));
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS shipping");
  db.run("DROP TABLE IF EXISTS payments");
  db.run("DROP TABLE IF EXISTS orders");
  db.run("DROP TABLE IF EXISTS products");

  db.run(`CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image TEXT
  )`);


  db.run(`CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    quantity INTEGER,
    total_price REAL,
    status TEXT DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  db.run(`CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    amount REAL,
    status TEXT DEFAULT 'SUCCESS',
    transaction_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id)
  )`);


  db.run(`CREATE TABLE shipping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    tracking_number TEXT,
    status TEXT DEFAULT 'PREPARING',
    estimated_delivery TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id)
  )`);


  const products = [
    ['Classic Burger', 12.99, 'Juicy beef patty with fresh lettuce and tomato.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'],
    ['Margherita Pizza', 15.50, 'Traditional pizza with tomato sauce and mozzarella.', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400'],
    ['Sushi Platter', 24.00, 'Assorted fresh sushi rolls and sashimi.', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400'],
    ['Caesar Salad', 9.95, 'Crisp romaine lettuce with parmesan and croutons.', 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400']
  ];

  const stmt = db.prepare("INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)");
  products.forEach(p => stmt.run(p));
  stmt.finalize();

  console.log("Database initialized and seeded.");
});

db.close();

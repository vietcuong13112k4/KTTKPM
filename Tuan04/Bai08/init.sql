CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50)
);
INSERT INTO users (name) VALUES ('Docker User');
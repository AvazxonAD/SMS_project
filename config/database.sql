CREATE TABLE users(
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100)  NOT NULL
);

CREATE TABLE clients(
    username VARCHAR(100) NOT NULL,
    phone VARCHAR(9) NOT NULL 
)
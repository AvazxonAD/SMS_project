CREATE TABLE users(
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100)  NOT NULL
);

CREATE TABLE clients(
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    phone VARCHAR(9) NOT NULL 
);

CREATE TABLE reports(
    id BIGSERIAL PRIMARY KEY,
    client_id REFERENCES clients(id) ON DELETE CASCADE,
    report VARCHAR(200) NOT NULL,
    senddate DATE NOT NULL
);
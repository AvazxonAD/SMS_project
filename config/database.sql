CREATE TABLE users(
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100)  NOT NULL
);

CREATE TABLE regions(
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL
);

CREATE TABLE clients(
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    phone VARCHAR(9) NOT NULL,
    region_id INTEGER REFERENCES regions(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL
);

CREATE TABLE reports(
    id BIGSERIAL PRIMARY KEY,
    client_fio VARCHAR NOT NULL,
    client_phone VARCHAR NOT NULL,
    report VARCHAR(500) NOT NULL,
    senddate DATE NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL
);

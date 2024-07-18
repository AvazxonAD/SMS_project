CREATE TABLE user(
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100)  NOT NULL
)

CREATE TABLE sessions (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expired TIMESTAMP(6) NOT NULL
);
-- +goose Up
-- +goose StatementBegin

CREATE TABLE IF NOT EXISTS teams (
    id INT PRIMARY KEY,
    code INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    strength INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- +goose StatementEnd
-- +goose Down

-- +goose StatementBegin
DROP TABLE IF EXISTS teams;
-- +goose StatementEnd
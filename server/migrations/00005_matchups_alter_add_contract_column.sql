-- +goose Up
-- +goose StatementBegin

ALTER TABLE matchups ADD COLUMN contract_address VARCHAR(255);

-- +goose StatementEnd
-- +goose Down

-- +goose StatementBegin

ALTER TABLE matchups DROP COLUMN IF EXISTS contract_address;

-- +goose StatementEnd

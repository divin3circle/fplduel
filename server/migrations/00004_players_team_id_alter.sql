-- +goose Up
-- +goose StatementBegin

ALTER TABLE players DROP CONSTRAINT IF EXISTS players_team_id_fkey;

-- +goose StatementEnd
-- +goose Down

-- +goose StatementBegin

ALTER TABLE players ADD CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id);

-- +goose StatementEnd

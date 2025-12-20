-- +goose Up
-- +goose StatementBegin

-- Enable UUID extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create matchups table
CREATE TABLE IF NOT EXISTS matchups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_team_id INT NOT NULL,
    assigned_home_team_id INT NOT NULL, -- Home team assigned by the system (1-5)
    assigned_away_team_id INT NOT NULL, -- Away team assigned by the system (6-10)
    away_team_id INT NOT NULL,
    game_week INT NOT NULL,
    home_team_name VARCHAR(255) NOT NULL,
    away_team_name VARCHAR(255) NOT NULL,
    home_team_score INT DEFAULT 0,
    away_team_score INT DEFAULT 0,
    home_team_manager_id INT NOT NULL,
    away_team_manager_id INT NOT NULL,
    home_team_manager_name VARCHAR(255) NOT NULL,
    away_team_manager_name VARCHAR(255) NOT NULL,
    home_team_value INT DEFAULT 0,
    away_team_value INT DEFAULT 0,
    home_team_transfers INT DEFAULT 0,
    away_team_transfers INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- +goose StatementEnd
-- +goose Down

DROP TABLE IF EXISTS matchups;
-- +goose Down



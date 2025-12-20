-- +goose Up
-- +goose StatementBegin

CREATE TABLE IF NOT EXISTS players (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    web_name VARCHAR(255) NOT NULL,
    team_id teams(id) NOT NULL,
    team_code INT NOT NULL,
    in_dreamteam BOOLEAN DEFAULT FALSE,
    total_points INT DEFAULT 0,
    code INT NOT NULL,
    photo VARCHAR(255),
    birth_date VARCHAR(50),
    team_joined_date VARCHAR(50),
    minutes_played INT DEFAULT 0,
    form_rank INT DEFAULT 0,
    form VARCHAR(10) DEFAULT '0.0',
    points_per_game VARCHAR(10) DEFAULT '0.0',
    influence VARCHAR(10) DEFAULT '0.0',
    creativity VARCHAR(10) DEFAULT '0.0',
    threat VARCHAR(10) DEFAULT '0.0',
    ict_index VARCHAR(10) DEFAULT '0.0',
    element_type INT NOT NULL,
    transfers_in INT DEFAULT 0,
    transfers_out INT DEFAULT 0,
    selected_by_percent VARCHAR(10) DEFAULT '0.0',
    selected_rank INT DEFAULT 0,
    points_per_game_rank INT DEFAULT 0,
    ict_index_rank INT DEFAULT 0,
    news TEXT,
    news_added TIMESTAMP WITH TIME ZONE,
    goals_scored INT DEFAULT 0,
    assists INT DEFAULT 0,
    clean_sheets INT DEFAULT 0,
    goals_conceded INT DEFAULT 0,
    expected_goals VARCHAR(10) DEFAULT '0.0',
    expected_assists VARCHAR(10) DEFAULT '0.0',
    expected_goal_involvements VARCHAR(10) DEFAULT '0.0',
    expected_goals_conceded VARCHAR(10) DEFAULT '0.0',
    yellow_cards INT DEFAULT 0,
    red_cards INT DEFAULT 0,
    defensive_contribution_per_90 VARCHAR(10) DEFAULT '0.0',
    starts_per_90 VARCHAR(10) DEFAULT '0.0',
    minutes VARCHAR(10) DEFAULT '0.0',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- +goose StatementEnd
-- +goose Down

DROP TABLE IF EXISTS players;
-- +goose Down
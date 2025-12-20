package stores

import (
	`database/sql`
	`time`
)

type Matchup struct {
	ID                  string    `json:"id"`
	HomeTeamID          int       `json:"home_team_id"`
	AssignedHomeTeamID  int       `json:"assigned_home_team_id"`
	AwayTeamID          int       `json:"away_team_id"`
	AssignedAwayTeamID  int       `json:"assigned_away_team_id"`
	Matchweek           int       `json:"matchweek"`
	HomeTeamName        string    `json:"home_team_name"`
	AwayTeamName        string    `json:"away_team_name"`
	HomeTeamScore       int       `json:"home_team_score"`
	AwayTeamScore       int       `json:"away_team_score"`
	HomeTeamManagerID   int       `json:"home_team_manager_id"`
	AwayTeamManagerID   int       `json:"away_team_manager_id"`
	HomeTeamManagerName string    `json:"home_team_manager_name"`
	AwayTeamManagerName string    `json:"away_team_manager_name"`
	HomeTeamValue       int       `json:"home_team_value"`
	AwayTeamValue       int       `json:"away_team_value"`
	HomeTeamTransfers   int       `json:"home_team_transfers"`
	AwayTeamTransfers   int       `json:"away_team_transfers"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

type PostgresMatchupStore struct {
	db *sql.DB
}

func NewPostgresMatchupStore(db *sql.DB) *PostgresMatchupStore {
	return &PostgresMatchupStore{db: db}
}

type MatchupStore interface {
	GetMatchupByID(id string) (*Matchup, error)
	CreateMatchup(matchup *Matchup) error
	UpdateMatchup(homeTeamScore, awayTeamScore int, matchup *Matchup) error
	ListMatchups() ([]*Matchup, error)
	GetGameweekMatchups(matchweek int) ([]*Matchup, error)
}

func (pm *PostgresMatchupStore) GetMatchupByID(id string) (*Matchup, error) {
	matchup := &Matchup{}
	query := `
	SELECT id, home_team_id, assigned_home_team_id, away_team_id, assigned_away_team_id, matchweek,
	       home_team_name, away_team_name, home_team_score, away_team_score,
	       home_team_manager_id, away_team_manager_id, home_team_manager_name, away_team_manager_name,
	       home_team_value, away_team_value, home_team_transfers, away_team_transfers,
	       created_at, updated_at
	FROM matchups
	WHERE id = $1
	`
	err := pm.db.QueryRow(query, id).Scan(
		&matchup.ID,
		&matchup.HomeTeamID,
		&matchup.AssignedHomeTeamID,
		&matchup.AwayTeamID,
		&matchup.AssignedAwayTeamID,
		&matchup.Matchweek,
		&matchup.HomeTeamName,
		&matchup.AwayTeamName,
		&matchup.HomeTeamScore,
		&matchup.AwayTeamScore,
		&matchup.HomeTeamManagerID,
		&matchup.AwayTeamManagerID,
		&matchup.HomeTeamManagerName,
		&matchup.AwayTeamManagerName,
		&matchup.HomeTeamValue,
		&matchup.AwayTeamValue,
		&matchup.HomeTeamTransfers,
		&matchup.AwayTeamTransfers,
		&matchup.CreatedAt,
		&matchup.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return matchup, nil
}

func (pm *PostgresMatchupStore) CreateMatchup(matchup *Matchup) error {
	query := `
	INSERT INTO matchups (home_team_id, assigned_home_team_id, assigned_away_team_id, away_team_id, game_week, home_team_name, away_team_name, home_team_manager_id, away_team_manager_id, home_team_manager_name, away_team_manager_name) 
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	RETURNING id, created_at, updated_at
`
	err := pm.db.QueryRow(query, matchup.HomeTeamID, matchup.AssignedHomeTeamID, matchup.AssignedAwayTeamID, matchup.AwayTeamID, matchup.Matchweek, matchup.HomeTeamName, matchup.AwayTeamName, matchup.HomeTeamManagerID, matchup.AwayTeamManagerID, matchup.HomeTeamManagerName, matchup.AwayTeamManagerName).Scan(&matchup.ID, &matchup.CreatedAt, &matchup.UpdatedAt)
	return err
}

func (pm *PostgresMatchupStore) UpdateMatchup(homeTeamScore, awayTeamScore int, matchup *Matchup) error {
	query := `
	UPDATE matchups
	SET home_team_score = $1, away_team_score = $2, updated_at = NOW()
	WHERE id = $3
	RETURNING updated_at
`
	err := pm.db.QueryRow(query, homeTeamScore, awayTeamScore, matchup.ID).Scan(&matchup.UpdatedAt)
	return err
}

func (pm *PostgresMatchupStore) ListMatchups() ([]*Matchup, error) {
	query := `
	SELECT id, home_team_id, assigned_home_team_id, away_team_id, assigned_away_team_id, matchweek,
	       home_team_name, away_team_name, home_team_score, away_team_score,
	       home_team_manager_id, away_team_manager_id, home_team_manager_name, away_team_manager_name,
	       home_team_value, away_team_value, home_team_transfers, away_team_transfers,
	       created_at, updated_at
	FROM matchups
`
	rows, err := pm.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matchups []*Matchup

	for rows.Next() {
		var matchup Matchup
		err := rows.Scan(&matchup.ID, &matchup.HomeTeamID, &matchup.AssignedHomeTeamID, &matchup.AwayTeamID, &matchup.AssignedAwayTeamID, &matchup.Matchweek, &matchup.HomeTeamName, &matchup.AwayTeamName, &matchup.HomeTeamScore, &matchup.AwayTeamScore, &matchup.HomeTeamManagerID, &matchup.AwayTeamManagerID, &matchup.HomeTeamManagerName, &matchup.AwayTeamManagerName, &matchup.HomeTeamValue, &matchup.AwayTeamValue, &matchup.HomeTeamTransfers, &matchup.AwayTeamTransfers, &matchup.CreatedAt, &matchup.UpdatedAt)
		if err != nil {
			return nil, err
		}
		matchups = append(matchups, &matchup)
	}
	return matchups, nil
}

func (pm *PostgresMatchupStore) GetGameweekMatchups(matchweek int) ([]*Matchup, error) {
	query := `
	SELECT id, home_team_id, assigned_home_team_id, away_team_id, assigned_away_team_id, matchweek,
	       home_team_name, away_team_name, home_team_score, away_team_score,
	       home_team_manager_id, away_team_manager_id, home_team_manager_name, away_team_manager_name,
	       home_team_value, away_team_value, home_team_transfers, away_team_transfers,
	       created_at, updated_at
	FROM matchups
	WHERE matchweek = $1
`
	rows, err := pm.db.Query(query, matchweek)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matchups []*Matchup

	for rows.Next() {
		var matchup Matchup
		err := rows.Scan(&matchup.ID, &matchup.HomeTeamID, &matchup.AssignedHomeTeamID, &matchup.AwayTeamID, &matchup.AssignedAwayTeamID, &matchup.Matchweek, &matchup.HomeTeamName, &matchup.AwayTeamName, &matchup.HomeTeamScore, &matchup.AwayTeamScore, &matchup.HomeTeamManagerID, &matchup.AwayTeamManagerID, &matchup.HomeTeamManagerName, &matchup.AwayTeamManagerName, &matchup.HomeTeamValue, &matchup.AwayTeamValue, &matchup.HomeTeamTransfers, &matchup.AwayTeamTransfers, &matchup.CreatedAt, &matchup.UpdatedAt)
		if err != nil {
			return nil, err
		}
		matchups = append(matchups, &matchup)
	}
	return matchups, nil
}

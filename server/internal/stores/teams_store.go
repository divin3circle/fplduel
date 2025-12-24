package stores

import (
	"database/sql"
	`errors`
	"time"
)

type Team struct {
	ID        int       `json:"id"`
	Code      int       `json:"code"`
	Name      string    `json:"name"`
	ShortName string    `json:"short_name"`
	Strength  int       `json:"strength"`
	UpdatedAt time.Time `json:"updated_at"`
}

type PostgresTeamsStore struct {
	db *sql.DB
}

func NewPostgresTeamsStore(db *sql.DB) *PostgresTeamsStore {
	return &PostgresTeamsStore{
		db: db,
	}
}

type TeamStore interface {
	GetTeamByID(id int) (*Team, error)
	ListTeams() ([]*Team, error)
	GetTeamByCode(code int) (*Team, error)
	UpdateTeams(teams []*Team) error
}

func (pts *PostgresTeamsStore) GetTeamByID(id int) (*Team, error) {
	team := &Team{}
	query := `
	SELECT id, code, name, short_name, strength, updated_at
	FROM teams
	WHERE id = $1
	`

	err := pts.db.QueryRow(query, id).Scan(
		&team.ID,
		&team.Code,
		&team.Name,
		&team.ShortName,
		&team.Strength,
		&team.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return team, nil

}

func (pts *PostgresTeamsStore) ListTeams() ([]*Team, error) {
	teams := []*Team{}
	query := `
	SELECT id, code, name, short_name, strength, updated_at
	FROM teams
	ORDER BY id
	`

	rows, err := pts.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		team := &Team{}
		err := rows.Scan(
			&team.ID,
			&team.Code,
			&team.Name,
			&team.ShortName,
			&team.Strength,
			&team.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		teams = append(teams, team)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return teams, nil
}

func (pts *PostgresTeamsStore) GetTeamByCode(code int) (*Team, error) {
	team := &Team{}
	query := `
	SELECT id, code, name, short_name, strength, updated_at
	FROM teams
	WHERE code = $1
	`

	err := pts.db.QueryRow(query, code).Scan(
		&team.ID,
		&team.Code,
		&team.Name,
		&team.ShortName,
		&team.Strength,
		&team.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return team, nil
}

func (pts *PostgresTeamsStore) UpdateTeams(teams []*Team) error {
	tx, err := pts.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
	INSERT INTO teams (id, code, name, short_name, strength, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6)
	ON CONFLICT (id) DO UPDATE SET
	code = EXCLUDED.code,
	name = EXCLUDED.name,
	short_name = EXCLUDED.short_name,
	strength = EXCLUDED.strength,
	updated_at = EXCLUDED.updated_at
	`
	for _, team := range teams {
		_, err := tx.Exec(query,
			team.ID,
			team.Code,
			team.Name,
			team.ShortName,
			team.Strength,
			team.UpdatedAt,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

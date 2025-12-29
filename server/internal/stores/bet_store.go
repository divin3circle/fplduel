package stores

import (
	"database/sql"
)

type Bet struct {
	ID			string 	`json:"id"`
	UserAddress	string	`json:"user_address"`
	MatchupID	string 	`json:"matchup_id"`
	PredictedWinner	int	`json:"predicted_winner"`
	BetAmount	int		`json:"bet_amount"`
	Odds		float64	`json:"odds"`
	TxnHash		string	`json:"txn_hash"`
	CreatedAt	string	`json:"created_at"`
	UpdatedAt	string	`json:"updated_at"`
}

type PostgresBetStore struct {
	db *sql.DB
}

func NewPostgresBetStore(db *sql.DB) *PostgresBetStore {
	return &PostgresBetStore{db: db}
}

type BetCount struct {
	TotalBets int `json:"total_bets"`
	TeamABets int `json:"team_a_bets"`
	TeamBBets int `json:"team_b_bets"`
	DrawBets  int `json:"draw_bets"`
}

type BetStore interface {
	CreateBet(bet *Bet) error
	GetBetsByUserAddress(userAddress string) ([]*Bet, error)
	GetNumberOfBets(matchup string) (*BetCount, error)
}

func (pbs *PostgresBetStore) CreateBet(bet *Bet) error {
	query := `
	INSERT INTO bets (user_address, matchup_id, predicted_winner, bet_amount, odds, txn_hash, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
	RETURNING id, created_at, updated_at
	`
	return pbs.db.QueryRow(query, bet.UserAddress, bet.MatchupID, bet.PredictedWinner, bet.BetAmount, bet.Odds, bet.TxnHash).
		Scan(&bet.ID, &bet.CreatedAt, &bet.UpdatedAt)
}

func (pbs *PostgresBetStore) GetBetsByUserAddress(userAddress string) ([]*Bet, error) {
	query := `
	SELECT id, user_address, matchup_id, predicted_winner, bet_amount, odds, txn_hash, created_at, updated_at
	FROM bets
	WHERE user_address = $1
	`
	rows, err := pbs.db.Query(query, userAddress)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bets []*Bet
	for rows.Next() {
		bet := &Bet{}
		err := rows.Scan(
			&bet.ID,
			&bet.UserAddress,
			&bet.MatchupID,
			&bet.PredictedWinner,
			&bet.BetAmount,
			&bet.Odds,
			&bet.TxnHash,
			&bet.CreatedAt,
			&bet.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		bets = append(bets, bet)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	if bets == nil {
		bets = []*Bet{}
	}
	return bets, nil
}

func (pbs *PostgresBetStore) GetNumberOfBets(matchup string) (*BetCount, error) {
	var exists bool
	err := pbs.db.QueryRow("SELECT EXISTS(SELECT 1 FROM matchups WHERE id = $1)", matchup).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, sql.ErrNoRows
	}

	query := `
	SELECT 
		COUNT(*) FILTER (WHERE predicted_winner = 0) AS team_a_bets,
		COUNT(*) FILTER (WHERE predicted_winner = 1) AS team_b_bets,
		COUNT(*) FILTER (WHERE predicted_winner = 2) AS draw_bets
	FROM bets
	WHERE matchup_id = $1
	`
	betCount := &BetCount{}
	err = pbs.db.QueryRow(query, matchup).Scan(&betCount.TeamABets, &betCount.TeamBBets, &betCount.DrawBets)
	if err != nil {
		return nil, err
	}
	betCount.TotalBets = betCount.TeamABets + betCount.TeamBBets + betCount.DrawBets
	return betCount, nil
}

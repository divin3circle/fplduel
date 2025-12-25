package stores

import (
	"database/sql"
	"errors"
	"strconv"
	"time"
)

// https://resources.premierleague.com/premierleague25/photos/players/110x140/154561.png
const PlayerImageBaseURL = "https://resources.premierleague.com/premierleague25/photos/players/110x140/"

type Player struct {
	ID                         int        `json:"id"`
	Name                       string     `json:"name"`
	WebName                    string     `json:"web_name"`
	TeamID                     int        `json:"team_id"`
	TeamCode                   int        `json:"team_code"`
	InDreamteam                bool       `json:"in_dreamteam"`
	TotalPoints                int        `json:"total_points"`
	Code                       int        `json:"code"`
	Photo                      *string    `json:"photo,omitempty"`
	BirthDate                  *string    `json:"birth_date,omitempty"`
	TeamJoinedDate             *string    `json:"team_joined_date,omitempty"`
	MinutesPlayed              int        `json:"minutes_played"`
	FormRank                   int        `json:"form_rank"`
	Form                       string     `json:"form"`
	PointsPerGame              string     `json:"points_per_game"`
	Influence                  string     `json:"influence"`
	Creativity                 string     `json:"creativity"`
	Threat                     string     `json:"threat"`
	IctIndex                   string     `json:"ict_index"`
	ElementType                int        `json:"element_type"`
	TransfersIn                int        `json:"transfers_in"`
	TransfersOut               int        `json:"transfers_out"`
	SelectedByPercent          string     `json:"selected_by_percent"`
	SelectedRank               int        `json:"selected_rank"`
	PointsPerGameRank          int        `json:"points_per_game_rank"`
	IctIndexRank               int        `json:"ict_index_rank"`
	News                       *string    `json:"news,omitempty"`
	NewsAdded                  *time.Time `json:"news_added,omitempty"`
	GoalsScored                int        `json:"goals_scored"`
	Assists                    int        `json:"assists"`
	CleanSheets                int        `json:"clean_sheets"`
	GoalsConceded              int        `json:"goals_conceded"`
	ExpectedGoals              string     `json:"expected_goals"`
	ExpectedAssists            string     `json:"expected_assists"`
	ExpectedGoalInvolvements   string     `json:"expected_goal_involvements"`
	ExpectedGoalsConceded      string     `json:"expected_goals_conceded"`
	YellowCards                int        `json:"yellow_cards"`
	RedCards                   int        `json:"red_cards"`
	DefensiveContributionPer90 string     `json:"defensive_contribution_per_90"`
	StartsPer90                string     `json:"starts_per_90"`
	Minutes                    string     `json:"minutes"`
	UpdatedAt                  time.Time  `json:"updated_at"`
}

type PostgresPlayersStore struct {
	db *sql.DB
}

func NewPostgresPlayersStore(db *sql.DB) *PostgresPlayersStore {
	return &PostgresPlayersStore{
		db: db,
	}
}

type PlayerStore interface {
	GetPlayerByID(id int) (*Player, error)
	GetPlayerByCode(code int) (*Player, error)
	UpdatePlayers(players []*Player) error
	GetPlayerImageURL(code int) (string, error)
}

func (pps *PostgresPlayersStore) GetPlayerByID(id int) (*Player, error) {
	player := &Player{}
	query := `
	SELECT id, name, web_name, team_id, team_code, in_dreamteam, total_points, code, photo, birth_date,
	team_joined_date, minutes_played, form_rank, form, points_per_game, influence, creativity, threat,
	ict_index, element_type, transfers_in, transfers_out, selected_by_percent, selected_rank,
	points_per_game_rank, ict_index_rank, news, news_added, goals_scored, assists, clean_sheets,
	goals_conceded, expected_goals, expected_assists, expected_goal_involvements,
	expected_goals_conceded, yellow_cards, red_cards, defensive_contribution_per_90,
	starts_per_90, minutes, updated_at
	FROM players
	WHERE id = $1
	`

	err := pps.db.QueryRow(query, id).Scan(
		&player.ID,
		&player.Name,
		&player.WebName,
		&player.TeamID,
		&player.TeamCode,
		&player.InDreamteam,
		&player.TotalPoints,
		&player.Code,
		&player.Photo,
		&player.BirthDate,
		&player.TeamJoinedDate,
		&player.MinutesPlayed,
		&player.FormRank,
		&player.Form,
		&player.PointsPerGame,
		&player.Influence,
		&player.Creativity,
		&player.Threat,
		&player.IctIndex,
		&player.ElementType,
		&player.TransfersIn,
		&player.TransfersOut,
		&player.SelectedByPercent,
		&player.SelectedRank,
		&player.PointsPerGameRank,
		&player.IctIndexRank,
		&player.News,
		&player.NewsAdded,
		&player.GoalsScored,
		&player.Assists,
		&player.CleanSheets,
		&player.GoalsConceded,
		&player.ExpectedGoals,
		&player.ExpectedAssists,
		&player.ExpectedGoalInvolvements,
		&player.ExpectedGoalsConceded,
		&player.YellowCards,
		&player.RedCards,
		&player.DefensiveContributionPer90,
		&player.StartsPer90,
		&player.Minutes,
		&player.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return player, nil
}

func (pps *PostgresPlayersStore) GetPlayerByCode(code int) (*Player, error) {
	player := &Player{}
	query := `
	SELECT id, name, web_name, team_id, team_code, in_dreamteam, total_points, code, photo, birth_date,
	team_joined_date, minutes_played, form_rank, form, points_per_game, influence, creativity, threat,
	ict_index, element_type, transfers_in, transfers_out, selected_by_percent, selected_rank,
	points_per_game_rank, ict_index_rank, news, news_added, goals_scored, assists, clean_sheets,
	goals_conceded, expected_goals, expected_assists, expected_goal_involvements,
	expected_goals_conceded, yellow_cards, red_cards, defensive_contribution_per_90,
	starts_per_90, minutes, updated_at
	FROM players
	WHERE code = $1
	`

	err := pps.db.QueryRow(query, code).Scan(
		&player.ID,
		&player.Name,
		&player.WebName,
		&player.TeamID,
		&player.TeamCode,
		&player.InDreamteam,
		&player.TotalPoints,
		&player.Code,
		&player.Photo,
		&player.BirthDate,
		&player.TeamJoinedDate,
		&player.MinutesPlayed,
		&player.FormRank,
		&player.Form,
		&player.PointsPerGame,
		&player.Influence,
		&player.Creativity,
		&player.Threat,
		&player.IctIndex,
		&player.ElementType,
		&player.TransfersIn,
		&player.TransfersOut,
		&player.SelectedByPercent,
		&player.SelectedRank,
		&player.PointsPerGameRank,
		&player.IctIndexRank,
		&player.News,
		&player.NewsAdded,
		&player.GoalsScored,
		&player.Assists,
		&player.CleanSheets,
		&player.GoalsConceded,
		&player.ExpectedGoals,
		&player.ExpectedAssists,
		&player.ExpectedGoalInvolvements,
		&player.ExpectedGoalsConceded,
		&player.YellowCards,
		&player.RedCards,
		&player.DefensiveContributionPer90,
		&player.StartsPer90,
		&player.Minutes,
		&player.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return player, nil
}

func (pps *PostgresPlayersStore) GetPlayerImageURL(code int) (string, error) {
	player, err := pps.GetPlayerByCode(code)
	if err != nil {
		return "", err
	}
	if player == nil || player.Photo == nil {
		return "", nil
	}
	codeStr := strconv.Itoa(player.Code)
	return PlayerImageBaseURL + codeStr + ".png", nil
}

func (pps *PostgresPlayersStore) UpdatePlayers(players []*Player) error {
	tx, err := pps.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
	INSERT INTO players (
		id, name, web_name, team_id, team_code, in_dreamteam, total_points, code, photo, birth_date,
	team_joined_date, minutes_played, form_rank, form, points_per_game, influence, creativity, threat,
	ict_index, element_type, transfers_in, transfers_out, selected_by_percent, selected_rank,
	points_per_game_rank, ict_index_rank, news, news_added, goals_scored, assists, clean_sheets,
	goals_conceded, expected_goals, expected_assists, expected_goal_involvements,
	expected_goals_conceded, yellow_cards, red_cards, defensive_contribution_per_90,
	starts_per_90, minutes, updated_at
	) VALUES (
		$1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
		$11, $12, $13, $14, $15, $16, $17, $18,
		$19, $20, $21, $22, $23, $24,
		$25, $26, $27, $28, $29,
		$30, $31, $32, $33,
		$34, $35, $36, $37,
		$38, $39, $40, $41, $42
	)
	ON CONFLICT (id) DO UPDATE SET
	name = EXCLUDED.name,
	web_name = EXCLUDED.web_name,
	team_id = EXCLUDED.team_id,
	team_code = EXCLUDED.team_code,
	in_dreamteam = EXCLUDED.in_dreamteam,
	total_points = EXCLUDED.total_points,
	code = EXCLUDED.code,
	photo = EXCLUDED.photo,
	birth_date = EXCLUDED.birth_date,
	team_joined_date = EXCLUDED.team_joined_date,
	minutes_played = EXCLUDED.minutes_played,
	form_rank = EXCLUDED.form_rank,
	form = EXCLUDED.form,
	points_per_game = EXCLUDED.points_per_game,
	influence = EXCLUDED.influence,
	creativity = EXCLUDED.creativity,
	threat = EXCLUDED.threat,
	ict_index = EXCLUDED.ict_index,
	element_type = EXCLUDED.element_type,
	transfers_in = EXCLUDED.transfers_in,
	transfers_out = EXCLUDED.transfers_out,
	selected_by_percent = EXCLUDED.selected_by_percent,
	selected_rank = EXCLUDED.selected_rank,
	points_per_game_rank = EXCLUDED.points_per_game_rank,
	ict_index_rank = EXCLUDED.ict_index_rank,
	news = EXCLUDED.news,
	news_added = EXCLUDED.news_added,
	goals_scored = EXCLUDED.goals_scored,
	assists = EXCLUDED.assists,
	clean_sheets = EXCLUDED.clean_sheets,
	goals_conceded = EXCLUDED.goals_conceded,
	expected_goals = EXCLUDED.expected_goals,
	expected_assists = EXCLUDED.expected_assists,
	expected_goal_involvements = EXCLUDED.expected_goal_involvements,
	expected_goals_conceded = EXCLUDED.expected_goals_conceded,
	yellow_cards = EXCLUDED.yellow_cards,
	red_cards = EXCLUDED.red_cards,
	defensive_contribution_per_90 = EXCLUDED.defensive_contribution_per_90,
	starts_per_90 = EXCLUDED.starts_per_90,
	minutes = EXCLUDED.minutes,
	updated_at = EXCLUDED.updated_at
	`
	for _, player := range players {
		_, err := tx.Exec(query,
			player.ID,
			player.Name,
			player.WebName,
			player.TeamID,
			player.TeamCode,
			player.InDreamteam,
			player.TotalPoints,
			player.Code,
			player.Photo,
			player.BirthDate,
			player.TeamJoinedDate,
			player.MinutesPlayed,
			player.FormRank,
			player.Form,
			player.PointsPerGame,
			player.Influence,
			player.Creativity,
			player.Threat,
			player.IctIndex,
			player.ElementType,
			player.TransfersIn,
			player.TransfersOut,
			player.SelectedByPercent,
			player.SelectedRank,
			player.PointsPerGameRank,
			player.IctIndexRank,
			player.News,
			player.NewsAdded,
			player.GoalsScored,
			player.Assists,
			player.CleanSheets,
			player.GoalsConceded,
			player.ExpectedGoals,
			player.ExpectedAssists,
			player.ExpectedGoalInvolvements,
			player.ExpectedGoalsConceded,
			player.YellowCards,
			player.RedCards,
			player.DefensiveContributionPer90,
			player.StartsPer90,
			player.Minutes,
			player.UpdatedAt,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}


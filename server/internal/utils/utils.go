package utils

import (
	"encoding/json"
	"errors"
	"net/http"
	`time`

	"github.com/go-chi/chi/v5"
)

type Envelope map[string]any

type Overrides struct {
	Rules          map[string]any `json:"rules"`
	Scoring        map[string]any `json:"scoring"`
	ElementTypes   []any          `json:"element_types"`
	PickMultiplier *int           `json:"pick_multiplier"`
}

type Chip struct {
	ID         int       `json:"id"`
	Name       string    `json:"name"`
	Number     int       `json:"number"`
	StartEvent int       `json:"start_event"`
	StopEvent  int       `json:"stop_event"`
	ChipType   string    `json:"chip_type"`
	Overrides  Overrides `json:"overrides"`
}

type Chips []Chip

type BootstrapTeam struct {
	Code                int     `json:"code"`
	Draw                int     `json:"draw"`
	Form                *string `json:"form"`
	ID                  int     `json:"id"`
	Loss                int     `json:"loss"`
	Name                string  `json:"name"`
	Played              int     `json:"played"`
	Points              int     `json:"points"`
	Position            int     `json:"position"`
	ShortName           string  `json:"short_name"`
	Strength            int     `json:"strength"`
	TeamDivision        *string `json:"team_division"`
	Unavailable         bool    `json:"unavailable"`
	Win                 int     `json:"win"`
	StrengthOverallHome int     `json:"strength_overall_home"`
	StrengthOverallAway int     `json:"strength_overall_away"`
	StrengthAttackHome  int     `json:"strength_attack_home"`
	StrengthAttackAway  int     `json:"strength_attack_away"`
	StrengthDefenceHome int     `json:"strength_defence_home"`
	StrengthDefenceAway int     `json:"strength_defence_away"`
	PulseID             int     `json:"pulse_id"`
}

type BootstrapTeams []BootstrapTeam

type Element struct {
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
	DefensiveContributionPer90 float64    `json:"defensive_contribution_per_90"`
	StartsPer90                float64    `json:"starts_per_90"`
	Minutes                    int        `json:"minutes"`
	UpdatedAt                  time.Time  `json:"updated_at"`
}

type Elements []*Element
type BootstrapData struct {
	Chips        *Chips          `json:"chips,omitempty"`
	TotalPlayers int             `json:"total_players,omitempty"`
	Teams        *BootstrapTeams `json:"teams,omitempty"`
	Elements     *Elements       `json:"elements,omitempty"`
}

func WriteJSON(w http.ResponseWriter, status int, data Envelope) error {
	js, err := json.MarshalIndent(data, "", "\t")
	if err != nil {
		return err
	}

	js = append(js, '\n')
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, err = w.Write(js)
	if err != nil {
		return err
	}
	return nil
}

func ReadIDParam(r *http.Request, name string) (string, error) {
	idParam := chi.URLParam(r, name)
	if idParam == "" {
		return "", errors.New("id is required")
	}
	return idParam, nil
}

func GetBootstrapData(client *http.Client) (*BootstrapData, error) {
	url := "https://fantasy.premierleague.com/api/bootstrap-static/"
	if client == nil {
		client = http.DefaultClient
	}
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data BootstrapData
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}
	return &data, nil
}

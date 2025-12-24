package utils

import (
	"encoding/json"
	"errors"
	`fmt`
	`math/rand`
	"net/http"
	`time`

	`github.com/divin3circle/fplduel/server/internal/stores`
	`github.com/go-chi/chi/v5`
	`github.com/google/uuid`
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

type ValuableTeam struct {
	EntryID   int    `json:"entry"`
	Name      string `json:"name"`
	Player    string `json:"player_name"`
	Value     int    `json:"value_with_bank"`
	Transfers int    `json:"total_transfers"`
}

type Status struct {
	BonusAdded bool   `json:"bonus_added"`
	Date       string `json:"date"`
	Event      int    `:"event"`
	Points     string `json:"points"`
}
type GameweekStatus struct {
	Status  []Status `json:"status"`
	Leagues string   `json:"leagues"`
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

func GetMatchups(client *http.Client) ([]*stores.Matchup, error) {
	// get the 10 valuable teams
	top10, err := getValuableTeams(client)
	if len(top10) != 10 {
		return nil, errors.New(fmt.Sprintf("invalid top10, hash length: %v.", top10))
	}
	if err != nil {
		return nil, err
	}
	// randomize items in the slice and pair n with len - n
	randomValuableTeams := randomize(top10)
	pairedTeams := pairTeams(randomValuableTeams)
	// transform the pairs to meet the Matchup type
	matchups, err := transformPairs(pairedTeams)
	// return
	return matchups, err
}

func getValuableTeams(client *http.Client) ([]*ValuableTeam, error) {
	url := "https://fantasy.premierleague.com/api/stats/most-valuable-teams/"
	if client == nil {
		client = http.DefaultClient
	}

	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data []*ValuableTeam
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	return data, nil
}

func randomize(teams []*ValuableTeam) []*ValuableTeam {
	rand.Shuffle(len(teams), func(i, j int) {
		teams[i], teams[j] = teams[j], teams[i]
	})
	return teams
}

func pairTeams(teams []*ValuableTeam) [][2]*ValuableTeam {
	var pairs [][2]*ValuableTeam

	for i := 0; i < len(teams)/2; i++ {
		pair := [2]*ValuableTeam{teams[i], teams[len(teams)-1-i]}
		pairs = append(pairs, pair)
	}
	return pairs
}

func generateRandomID() string {
	return uuid.New().String()
}

func transformPairs(pairs [][2]*ValuableTeam) ([]*stores.Matchup, error) {
	currentGameWeek, err := GetCurrentGameweek()
	if err != nil {
		return nil, errors.New(fmt.Sprintf("failed to get current gameweek: %v", err))
	}
	var matchups []*stores.Matchup
	now := time.Now().UTC()

	for idx, pair := range pairs {
		m := &stores.Matchup{
			ID:                  generateRandomID(),
			CreatedAt:           now,
			Gameweek:            currentGameWeek,
			HomeTeamID:          pair[0].EntryID,
			HomeTeamName:        pair[0].Name,
			HomeTeamManagerName: pair[0].Player,
			HomeTeamTransfers:   pair[0].Transfers,
			HomeTeamScore:       0,
			HomeTeamValue:       pair[0].Value,
			AssignedHomeTeamID:  idx,
			AwayTeamID:          pair[1].EntryID,
			AwayTeamName:        pair[1].Name,
			AwayTeamManagerName: pair[1].Player,
			AwayTeamTransfers:   pair[1].Transfers,
			AwayTeamScore:       0,
			AwayTeamValue:       pair[1].Value,
			AssignedAwayTeamID:  9 - idx,
		}
		matchups = append(matchups, m)
	}
	return matchups, nil
}

func GetCurrentGameweek() (int, error) {
	url := "https://fantasy.premierleague.com/api/event-status/"
	client := http.DefaultClient

	resp, err := client.Get(url)
	if err != nil {
		return -1, err
	}
	defer resp.Body.Close()

	var data GameweekStatus
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return -1, err
	}
	return data.Status[0].Event + 1, nil
}

package utils

import (
	"encoding/json"
	"errors"
	"net/http"

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
	ID         int        `json:"id"`
	Name       string     `json:"name"`
	Number     int        `json:"number"`
	StartEvent int        `json:"start_event"`
	StopEvent  int        `json:"stop_event"`
	ChipType   string     `json:"chip_type"`
	Overrides  Overrides  `json:"overrides"`
}

type Chips []Chip

type BootstrapTeam struct {
	Code                 int     `json:"code"`
	Draw                 int     `json:"draw"`
	Form                 *string `json:"form"`
	ID                   int     `json:"id"`
	Loss                 int     `json:"loss"`
	Name                 string  `json:"name"`
	Played               int     `json:"played"`
	Points               int     `json:"points"`
	Position             int     `json:"position"`
	ShortName            string  `json:"short_name"`
	Strength             int     `json:"strength"`
	TeamDivision         *string `json:"team_division"`
	Unavailable          bool    `json:"unavailable"`
	Win                  int     `json:"win"`
	StrengthOverallHome  int     `json:"strength_overall_home"`
	StrengthOverallAway  int     `json:"strength_overall_away"`
	StrengthAttackHome   int     `json:"strength_attack_home"`
	StrengthAttackAway   int     `json:"strength_attack_away"`
	StrengthDefenceHome  int     `json:"strength_defence_home"`
	StrengthDefenceAway  int     `json:"strength_defence_away"`
	PulseID              int     `json:"pulse_id"`
}

type BootstrapTeams []BootstrapTeam

type BootstrapData struct {
	Chips 			*Chips 				`json:"chips,omitempty"`
	TotalPlayers 	int 				`json:"total_players,omitempty"`
	Teams 			*BootstrapTeams 	`json:"teams,omitempty"`
}

func WriteJSON(w http.ResponseWriter, status int, data Envelope) error{
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
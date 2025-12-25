package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/divin3circle/fplduel/server/internal/stores"
	"github.com/divin3circle/fplduel/server/internal/utils"
	hiero "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
)

type TeamHandler struct {
	Logger    *log.Logger
	Client    *hiero.Client
	TeamStore stores.TeamStore
}

type TeamJerseyRequest struct {
	Position int `json:"position"`
}

func NewTeamHandler(logger *log.Logger, client *hiero.Client, teamStore stores.TeamStore) *TeamHandler {
	return &TeamHandler{
		Logger:    logger,
		Client:    client,
		TeamStore: teamStore,
	}
}

func (th *TeamHandler) HandleGetTeamByID(w http.ResponseWriter, r *http.Request) {
	teamIdStr, err := utils.ReadIDParam(r, "id")
	if err != nil {
		th.Logger.Printf("Error reading team ID param: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Team ID is required"})
		return
	}

	teamId, err := strconv.Atoi(teamIdStr)
	if err != nil {
		th.Logger.Printf("Error converting team ID to int: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid team ID"})
		return
	}

	team, err := th.TeamStore.GetTeamByID(teamId)
	if err == nil && team == nil {
		th.Logger.Printf("Team %v does not exist", teamId)
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"message": "Team not found"})
		return
	}
	if err != nil {
		th.Logger.Printf("Error fetching team by ID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Could not fetch team"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"team": team})

}

func (th *TeamHandler) HandleGetTeamByCode(w http.ResponseWriter, r *http.Request) {
	teamCodeStr, err := utils.ReadIDParam(r, "code")
	if err != nil {
		th.Logger.Printf("Error reading team coe param: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Team code is required"})
		return
	}

	teamCode, err := strconv.Atoi(teamCodeStr)
	if err != nil {
		th.Logger.Printf("Error converting team ID to int: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid team code"})
		return
	}

	team, err := th.TeamStore.GetTeamByCode(teamCode)
	if err == nil && team == nil {
		th.Logger.Printf("Team %v does not exist", teamCode)
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"message": "Team not found"})
		return
	}
	if err != nil {
		th.Logger.Printf("Error fetching team by code: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Could not fetch team"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"team": team})

}

func (th *TeamHandler) HandleListTeams(w http.ResponseWriter, r *http.Request) {
	teams, err := th.TeamStore.ListTeams()
	if err != nil {
		th.Logger.Printf("Error listing teams: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Could not list teams"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"teams": teams})
}

func (th *TeamHandler) HandleCreateOrUpdateTeams(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJSON(w, http.StatusMethodNotAllowed, utils.Envelope{"error": "method not allowed"})
		return
	}

	data, err := utils.GetBootstrapData(http.DefaultClient)
	if err != nil {
		th.Logger.Printf("Error reading bootstrap data: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Could not read bootstrap data"})
		return
	}
	if data == nil || data.Teams == nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "no teams in bootstrap data"})
		return
	}

	var teams []*stores.Team
	now := time.Now().UTC()
	for _, t := range *data.Teams {
		teams = append(teams, &stores.Team{
			ID:        t.ID,
			Code:      t.Code,
			Name:      t.Name,
			ShortName: t.ShortName,
			Strength:  t.Strength,
			UpdatedAt: now,
		})
	}

	if err := th.TeamStore.UpdateTeams(teams); err != nil {
		th.Logger.Printf("Error updating teams: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Could not update teams"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"message": "Teams created or updated successfully"})
}

func (th *TeamHandler) HandleGetTeamJerseyURL(w http.ResponseWriter, r *http.Request) {
	teamJerseyRequest := &TeamJerseyRequest{}
	teamCodeStr, err := utils.ReadIDParam(r, "code")
	if err != nil {
		th.Logger.Printf("Error reading team code param: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Team code is required"})
		return
	}

	teamCode, err := strconv.Atoi(teamCodeStr)
	if err != nil {
		th.Logger.Printf("Error converting team code to int: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid team code"})
		return
	}

	err = json.NewDecoder(r.Body).Decode(teamJerseyRequest)
	if err != nil {
		th.Logger.Printf("Error decoding team jersey request: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid request payload"})
		return
	}

	jerseyURL := th.TeamStore.GetTeamJerseyURL(teamCode, teamJerseyRequest.Position)
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"jersey_url": jerseyURL})
}

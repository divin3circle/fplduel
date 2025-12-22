package api

import (
	"log"
	"net/http"
	"strconv"

	"github.com/divin3circle/fplduel/server/internal/stores"
	"github.com/divin3circle/fplduel/server/internal/utils"
	hiero "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
)

type TeamHandler struct {
	Logger *log.Logger
	Client hiero.Client
	TeamStore stores.TeamStore
}

func NewTeamHandler(logger *log.Logger, client hiero.Client, teamStore stores.TeamStore) *TeamHandler {
	return &TeamHandler{
		Logger: logger,
		Client: client,
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
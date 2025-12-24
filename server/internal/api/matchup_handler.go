package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/divin3circle/fplduel/server/internal/stores"
	"github.com/divin3circle/fplduel/server/internal/utils"
	hiero "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
)

type MatchupHandler struct {
	Logger       *log.Logger
	Client       *hiero.Client
	MatchupStore stores.MatchupStore
}

type UpdateScoresRequest struct {
	AwayScore int `json:"away_score"`
	HomeScore int `json:"home_score"`
}

func NewMatchupHandler(logger *log.Logger, client *hiero.Client, matchupStore stores.MatchupStore) *MatchupHandler {
	return &MatchupHandler{
		Logger:       logger,
		Client:       client,
		MatchupStore: matchupStore,
	}
}

func (mh *MatchupHandler) GetMatchupByID(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIDParam(r, "id")
	if err != nil {
		mh.Logger.Println("Error reading ID param:", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "id is required"})
		return
	}

	matchup, err := mh.MatchupStore.GetMatchupByID(id)
	if err == nil && matchup == nil {
		mh.Logger.Println("Matchup not found for ID:", id)
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": "matchup not found"})
		return
	}
	if err != nil {
		mh.Logger.Println("Error getting matchup by ID:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to get matchup by ID"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"matchup": matchup})
}

func (mh *MatchupHandler) GetAllMatchups(w http.ResponseWriter, r *http.Request) {
	matchups, err := mh.MatchupStore.ListMatchups()
	if err != nil {
		mh.Logger.Println("Error getting all matchups:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to get all matchups"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"matchups": matchups})
}

func (mh *MatchupHandler) GetMatchupsByGameWeek(w http.ResponseWriter, r *http.Request) {
	gameweekStr, err := utils.ReadIDParam(r, "gameweek")
	if err != nil {
		mh.Logger.Println("Error getting gameweek matchups", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "gameweek is required for this resource"})
		return
	}

	gameweek, err := strconv.Atoi(gameweekStr)
	if err != nil {
		mh.Logger.Println("Error converting gameweek to int", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid gameweek"})
		return
	}

	matchups, err := mh.MatchupStore.GetGameweekMatchups(gameweek)
	if err != nil {
		mh.Logger.Println("Error getting matchups for gameweek", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to get matchups for gameweek"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"matchups": matchups})
}

func (mh *MatchupHandler) CreateMatchups(w http.ResponseWriter, r *http.Request) {
	matchups, err := utils.GetMatchups(http.DefaultClient)

	if err != nil {
		mh.Logger.Println("Error getting matchups:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to get matchups"})
		return
	}
	var createdMatchups []*stores.Matchup
	failedToCreate := 0

	for idx, matchup := range matchups {
		err := mh.MatchupStore.CreateMatchup(matchup)
		if err != nil {
			mh.Logger.Printf("Error creating matchup at index: %d, %v, %v", idx, matchup, err)
			failedToCreate++
			continue
		}
		createdMatchups = append(createdMatchups, matchups[idx])
	}
	mh.Logger.Printf("%d/5 matchups failed to be created\n", failedToCreate)

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"matchups": matchups, "message": fmt.Sprintf("created %d matchups of 5", len(createdMatchups))})
}

func (mh *MatchupHandler) GetCurrentGameweek(w http.ResponseWriter, r *http.Request) {
	gw, err := utils.GetCurrentGameweek()
	if err != nil {
		mh.Logger.Println("Error getting current gameweek:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to get current gameweek"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"currentGameweek": gw})
}

func (mh *MatchupHandler) UpdateMatchupScores(w http.ResponseWriter, r *http.Request) {
	id, err := utils.ReadIDParam(r, "id")
	if err != nil {
		mh.Logger.Println("Error reading ID param:", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "id is required"})
		return
	}
	var req UpdateScoresRequest
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		mh.Logger.Println("Error decoding update scores request:", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "invalid request body"})
		return
	}

	matchup, err := mh.MatchupStore.GetMatchupByID(id)
	if err == nil && matchup == nil {
		mh.Logger.Println("Matchup not found for ID:", id)
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"error": "matchup not found"})
		return
	}
	if err != nil {
		mh.Logger.Println("Error getting matchup by ID:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to get matchup by ID"})
		return
	}

	err = mh.MatchupStore.UpdateMatchup(req.HomeScore, req.AwayScore, matchup)
	if err != nil {
		mh.Logger.Println("Error updating matchup scores:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to update matchup scores"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"message": "matchup scores updated successfully"})
}

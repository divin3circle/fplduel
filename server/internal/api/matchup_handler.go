package api

import (
	"log"
	"net/http"

	"github.com/divin3circle/fplduel/server/internal/stores"
	"github.com/divin3circle/fplduel/server/internal/utils"
	hiero "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
)


type MatchupHandler struct {
	Logger *log.Logger
	Client *hiero.Client
	MatchupStore stores.MatchupStore
}

func NewMatchupHandler(logger *log.Logger, client *hiero.Client, matchupStore stores.MatchupStore) *MatchupHandler {
	return &MatchupHandler{
		Logger: logger,
		Client: client,
		MatchupStore: matchupStore,
	}
}

func (mh *MatchupHandler) GetMatchupByID(w http.ResponseWriter, r *http.Request){
	id, err := utils.ReadIDParam(r, "id")
	if err != nil {
		mh.Logger.Println("Error reading ID param:", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "id is required"})
		return
	}

	matchup, err := mh.MatchupStore.GetMatchupByID(id)
	if err != nil {
		mh.Logger.Println("Error getting matchup by ID:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to get matchup by ID"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"matchup": matchup})
}

func (mh *MatchupHandler) GetAllMatchups(w http.ResponseWriter, r *http.Request){
	matchups, err := mh.MatchupStore.ListMatchups()
	if err != nil {
		mh.Logger.Println("Error getting all matchups:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "failed to get all matchups"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"matchups": matchups})
}
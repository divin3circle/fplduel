package api

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/divin3circle/fplduel/server/internal/stores"
	"github.com/divin3circle/fplduel/server/internal/utils"
	hiero "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
)

type PlayerHandler struct {
	Logger    *log.Logger
	Client    *hiero.Client
	PlayerStore stores.PlayerStore
}

func NewPlayerHandler(logger *log.Logger, client *hiero.Client, playerStore stores.PlayerStore) *PlayerHandler {
	return &PlayerHandler{
		Logger:    logger,
		Client:    client,
		PlayerStore: playerStore,
	}
}

func (ph *PlayerHandler) HandleGetPlayerImageURL(w http.ResponseWriter, r *http.Request){
	code, err := utils.ReadIDParam(r, "code")
	if err != nil {
		ph.Logger.Printf("Error reading team code param: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Team code is required"})
		return
	}
	
	codeInt, err := strconv.Atoi(code)
	if err != nil {
		ph.Logger.Printf("Error converting team code to int: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid team code"})
		return
	}

	jerseyURL, err := ph.PlayerStore.GetPlayerImageURL(codeInt)
	if err != nil {
		ph.Logger.Printf("Error fetching jersey URL for team code %v: %v", codeInt, err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Could not fetch jersey URL"})
		return
	}
	if jerseyURL == "" {
		ph.Logger.Printf("Jersey URL for team code %v not found", codeInt)
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"jersey_url": "", "message": "Jersey URL not found"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"jersey_url": jerseyURL, "message": "Jersey URL fetched successfully"})
}

func (ph *PlayerHandler) HandleGetPlayerByID(w http.ResponseWriter, r *http.Request) {
	playerIdStr, err := utils.ReadIDParam(r, "id")
	if err != nil {
		ph.Logger.Printf("Error reading player ID param: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Player ID is required"})
		return
	}

	playerId, err := strconv.Atoi(playerIdStr)
	if err != nil {
		ph.Logger.Printf("Error converting player ID to int: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid player ID"})
		return
	}

	player, err := ph.PlayerStore.GetPlayerByID(playerId)
	if err == nil && player == nil {
		ph.Logger.Printf("Player %v does not exist", playerId)
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"message": "Player not found"})
		return
	}
	if err != nil {
		ph.Logger.Printf("Error fetching player by ID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Could not fetch player"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"player": player})
}

func (ph *PlayerHandler) HandleGetPlayerByCode(w http.ResponseWriter, r *http.Request) {
	playerCodeStr, err := utils.ReadIDParam(r, "code")
	if err != nil {
		ph.Logger.Printf("Error reading player ID param: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Player code is required"})
		return
	}

	playerCode, err := strconv.Atoi(playerCodeStr)
	if err != nil {
		ph.Logger.Printf("Error converting player ID to int: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, utils.Envelope{"error": "Invalid player code"})
		return
	}

	player, err := ph.PlayerStore.GetPlayerByCode(playerCode)
	if err == nil && player == nil {
		ph.Logger.Printf("Player %v does not exist", playerCode)
		utils.WriteJSON(w, http.StatusNotFound, utils.Envelope{"message": "Player not found"})
		return
	}
	if err != nil {
		ph.Logger.Printf("Error fetching player by ID: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Could not fetch player"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"player": player})
}

func (ph *PlayerHandler) HandleUpdatePlayers(w http.ResponseWriter, r *http.Request){
	players , err := utils.GetAllPlayers(http.DefaultClient)
	start := time.Now()
	ph.Logger.Printf("Fetched %d players from FPL API in %v", len(players), time.Since(start))
	if err != nil {
		ph.Logger.Printf("Error fetching players from FPL API: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Could not fetch players from FPL API"})
		return
	}
	
	err = ph.PlayerStore.UpdatePlayers(players)
	if err != nil {
		ph.Logger.Printf("Error updating players in the database: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envelope{"error": "Could not update players in the database"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, utils.Envelope{"message": "Players updated successfully", "player_count": len(players), "duration": time.Since(start).String()})
}
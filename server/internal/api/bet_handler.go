package api

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/divin3circle/fplduel/server/internal/stores"
	"github.com/divin3circle/fplduel/server/internal/utils"
)

type CreateBetRequest struct {
	UserAddress     string  `json:"user_address"`
	MatchupID      string  `json:"matchup_id"`
	PredictedWinner int     `json:"predicted_winner"`
	BetAmount      int     `json:"bet_amount"`
	Odds           float64 `json:"odds"`
	TxnHash        string  `json:"txn_hash"`
}

type BetHandler struct {
	BetStore stores.BetStore
}

func NewBetHandler(betStore stores.BetStore) *BetHandler {
	return &BetHandler{
		BetStore: betStore,
	}
}


func (bh *BetHandler) CreateBet(w http.ResponseWriter, r *http.Request) {
	var bet CreateBetRequest
	err := json.NewDecoder(r.Body).Decode(&bet)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	newBet := &stores.Bet{
		UserAddress:     bet.UserAddress,
		MatchupID:      bet.MatchupID,
		PredictedWinner: bet.PredictedWinner,
		BetAmount:      bet.BetAmount,
		Odds:           bet.Odds,
		TxnHash:        bet.TxnHash,
	}

	err = bh.BetStore.CreateBet(newBet)
	if err != nil {
		http.Error(w, "Failed to create bet", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newBet)
}

func (bh *BetHandler) GetBetsByUserAddress(w http.ResponseWriter, r *http.Request) {
	userAddress, err := utils.ReadIDParam(r, "address")
	if err != nil {
		http.Error(w, "Invalid user address", http.StatusBadRequest)
		return
	}

	bets, err := bh.BetStore.GetBetsByUserAddress(userAddress)
	if err != nil {
		http.Error(w, "Failed to get bets", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(bets)
}

func (bh *BetHandler) GetNumberOfBets(w http.ResponseWriter, r *http.Request) {

	matchup, err := utils.ReadIDParam(r, "matchup")
	if err != nil {
		http.Error(w, "Missing matchup parameter", http.StatusBadRequest)
		return
	}

	count, err := bh.BetStore.GetNumberOfBets(matchup)
	if err != nil {
		if err == sql.ErrNoRows {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "matchup not found"})
			return
		}
		http.Error(w, "Failed to get number of bets", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response := map[string]int{
		"total_bets": count.TotalBets,
		"team_a_bets": count.TeamABets,
		"team_b_bets": count.TeamBBets,
		"draw_bets": count.DrawBets,
	}
	json.NewEncoder(w).Encode(response)
}
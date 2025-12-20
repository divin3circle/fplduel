package routes

import (
	"github.com/divin3circle/fplduel/server/internal/app"
	"github.com/go-chi/chi/v5"
)

func SetupRoutes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()
	r.Get("/health", app.HealthCheck)

	// MATCHUP ROUTES
	r.Get("/matchup/{id}", app.MatchupHandler.GetMatchupByID)
	r.Get("/matchup", app.MatchupHandler.GetAllMatchups)

	return r
}

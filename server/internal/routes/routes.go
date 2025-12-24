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
	r.Get("/gameweek/{gameweek}", app.MatchupHandler.GetMatchupsByGameWeek)

	// TEAM ROUTES
	r.Post("/update/teams", app.TeamHandler.HandleCreateOrUpdateTeams)
	r.Get("/team/id/{id}", app.TeamHandler.HandleGetTeamByID)
	r.Get("/team/code/{code}", app.TeamHandler.HandleGetTeamByCode)
	r.Get("/team", app.TeamHandler.HandleListTeams)

	return r
}

package routes

import (
	"github.com/divin3circle/fplduel/server/internal/app"
	"github.com/go-chi/chi/v5"
)

func SetupRoutes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()
	r.Get("/health", app.HealthCheck)

	// MATCHUP ROUTES
	/* POST */
	r.Post("/matchup", app.MatchupHandler.CreateMatchups)

	/* PUT */
	r.Put("/matchup/{id}/score", app.MatchupHandler.UpdateMatchupScores)

	/* GET */
	r.Get("/matchup/{id}", app.MatchupHandler.GetMatchupByID)
	r.Get("/matchup", app.MatchupHandler.GetAllMatchups)
	r.Get("/gameweek/{gameweek}", app.MatchupHandler.GetMatchupsByGameWeek)
	r.Get("/gameweek", app.MatchupHandler.GetCurrentGameweek)

	// TEAM ROUTES
	/* POST */
	r.Post("/update/teams", app.TeamHandler.HandleCreateOrUpdateTeams)

	/* GET */
	r.Get("/team/id/{id}", app.TeamHandler.HandleGetTeamByID)
	r.Get("/team/code/{code}", app.TeamHandler.HandleGetTeamByCode)
	r.Get("/team", app.TeamHandler.HandleListTeams)
	r.Get("/team/jersey/{code}", app.TeamHandler.HandleGetTeamJerseyURL)

	// PLAYER ROUTES
	/* POST */
	r.Post("/update/players",  app.PlayerHandler.HandleUpdatePlayers)

	/* GET */
	r.Get("/player/id/{id}", app.PlayerHandler.HandleGetPlayerByID)
	r.Get("/player/code/{code}", app.PlayerHandler.HandleGetPlayerByCode)
	r.Get("/player/jersey/{code}", app.PlayerHandler.HandleGetPlayerImageURL)

	return r
}

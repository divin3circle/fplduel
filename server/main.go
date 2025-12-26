package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	app2 "github.com/divin3circle/fplduel/server/internal/app"
	"github.com/divin3circle/fplduel/server/internal/routes"
)

func main() {
	app, err := app2.NewApplication()

	if err != nil {
		panic(err)
	}

	defer func(DB *sql.DB) {
		err := DB.Close()
		if err != nil {
			panic(err)
		}
	}(app.DB)

	app.Logger.Println("Application started successfully")

	r := routes.SetupRoutes(app)

	server := &http.Server{
		Addr:              fmt.Sprintf(":%d", 8080),
		Handler:           r,
		IdleTimeout:       time.Minute * 10,
		ReadHeaderTimeout: time.Second * 10,
		WriteTimeout:      time.Minute * 5,
	}

	app.Logger.Println("Starting server on port 8080")

	err = server.ListenAndServe()
	if err != nil {
		app.Logger.Fatal(err)
	}
}

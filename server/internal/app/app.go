package app

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/divin3circle/fplduel/server/internal/stores"
	hiero "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
	"github.com/joho/godotenv"
)

type Application struct {
	Logger *log.Logger
	DB     *sql.DB
	Hiero  *hiero.Client
}

func loadEnvironmentVariables() {
	err := godotenv.Load()

	if err != nil {
		panic("Error loading .env file")
	}

	fmt.Println("Environment variables loaded from")
}

func createHieroClient() (*hiero.Client, error) {
	accountID, err := hiero.AccountIDFromString(os.Getenv("OPERATOR_ACCOUNT_ID"))
	if err != nil {
		log.Println("Error getting account ID from environment variable:", err)
		return nil, err
	}

	privateKey, err := hiero.PrivateKeyFromStringEd25519(os.Getenv("OPERATOR_KEY"))
	if err != nil {
		log.Println("Error getting private key from environment variable:", err)
		return nil, err
	}

	client := hiero.ClientForTestnet()

	client.SetOperator(accountID, privateKey)
	return client, nil
}

func NewApplication() (*Application, error) {
	loadEnvironmentVariables()

	client, err := createHieroClient()
	if err != nil {
		return nil, fmt.Errorf("failed to create Hiero client: %w", err)
	}

	db, err := stores.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	log.Println("Connected to database")

	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime|log.Lshortfile)

	// STORES

	// HANDLERS

	return &Application{
		Logger: logger,
		DB:     db,
		Hiero:  client,
	}, nil
}

func (a *Application) HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, err := w.Write([]byte("Status: OK"))
	if err != nil {
		return
	}

}

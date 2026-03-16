package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/marcoschwartz/lungo/pkg/lungo"
)

func main() {
	dev := os.Getenv("LUNGO_DEV") == "1"

	app := lungo.New(lungo.Options{
		AppDir:    "./app",
		StaticDir: "./static",
		Dev:       dev,
		Cache: &lungo.CacheOptions{
			DefaultMode:      "static",
			RevalidateSecret: os.Getenv("REVALIDATE_SECRET"),
		},
	})

	// Example API route
	app.API("/api/hello", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message":   "Hello from Lungo!",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Fatal(app.ListenAndServe(":" + port))
}

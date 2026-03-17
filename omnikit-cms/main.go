package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/marcoschwartz/lungo/pkg/lungo"
)

var (
	apiURL    string
	apiKey    string
	projectID string
)

func omnikitGet(path string) ([]byte, int) {
	req, _ := http.NewRequest("GET", apiURL+path, nil)
	req.Header.Set("X-API-Key", apiKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, 500
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)
	return data, resp.StatusCode
}

func omnikitPost(path string, body interface{}) ([]byte, int) {
	data, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", apiURL+path, bytes.NewReader(data))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", apiKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, 500
	}
	defer resp.Body.Close()
	result, _ := io.ReadAll(resp.Body)
	return result, resp.StatusCode
}

func main() {
	apiURL = os.Getenv("OMNIKIT_API_URL")
	if apiURL == "" {
		apiURL = "http://localhost:3000/omnikit"
	}
	apiKey = os.Getenv("OMNIKIT_API_KEY")
	projectID = os.Getenv("OMNIKIT_PROJECT_ID")
	if projectID == "" {
		projectID = "1"
	}

	dev := os.Getenv("LUNGO_DEV") == "1"

	app := lungo.New(lungo.Options{
		AppDir:       "./app",
		StaticDir:    "./static",
		Dev:          dev,
		DefaultTheme: "dark",
		Cache: &lungo.CacheOptions{
			DefaultMode: "static",
			Rules: []lungo.CacheRule{
				{Path: "/blog/*", Mode: "isr", TTL: 60},
				{Path: "/contact", Mode: "static"},
				{Path: "/thank-you", Mode: "static"},
			},
			RevalidateSecret: os.Getenv("REVALIDATE_SECRET"),
		},
	})

	app.Use(lungo.CORS(lungo.CORSOptions{AllowOrigins: []string{"*"}}))

	// ── CMS Content API ──────────────────────────────────

	// Blog posts list
	app.API("/api/blog", func(w http.ResponseWriter, r *http.Request) {
		data, _ := omnikitGet("/cms/delivery/article?project_id=" + projectID)
		w.Header().Set("Content-Type", "application/json")
		w.Write(data)
	})

	// Single blog post by slug
	app.API("/api/blog/post", func(w http.ResponseWriter, r *http.Request) {
		slug := r.URL.Query().Get("slug")
		if slug == "" {
			w.WriteHeader(404)
			w.Write([]byte(`{"error":"slug required"}`))
			return
		}
		data, status := omnikitGet("/cms/delivery/article/" + slug + "?project_id=" + projectID)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		w.Write(data)
	})

	// ── Messaging / Lead Capture ─────────────────────────

	app.Action("subscribe", func(w http.ResponseWriter, r *http.Request) lungo.ActionResult {
		email := r.FormValue("email")
		name := r.FormValue("name")
		if email == "" {
			return lungo.ActionResult{Error: "Email is required"}
		}

		body := map[string]interface{}{
			"project_id": projectID,
			"email":      email,
			"attributes": map[string]string{
				"first_name":  name,
				"lead_source": "website",
			},
			"tags": []string{"subscriber", "website"},
		}
		_, status := omnikitPost("/messaging/contacts", body)
		if status >= 400 {
			return lungo.ActionResult{Error: "Failed to subscribe"}
		}
		return lungo.ActionResult{Redirect: "/thank-you"}
	})

	app.Action("contact", func(w http.ResponseWriter, r *http.Request) lungo.ActionResult {
		email := r.FormValue("email")
		name := r.FormValue("name")
		message := r.FormValue("message")
		if email == "" {
			return lungo.ActionResult{Error: "Email is required"}
		}

		body := map[string]interface{}{
			"project_id": projectID,
			"email":      email,
			"attributes": map[string]string{
				"first_name":  name,
				"lead_source": "contact_form",
				"message":     message,
			},
			"tags": []string{"contact", "website"},
		}
		omnikitPost("/messaging/contacts", body)
		return lungo.ActionResult{Redirect: "/thank-you"}
	})

	// ── Start ────────────────────────────────────────────

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	if dev {
		fmt.Println(strings.Repeat("─", 45))
		fmt.Printf("  OmniKit CMS Site\n")
		fmt.Printf("  API: %s\n", apiURL)
		fmt.Printf("  http://localhost:%s\n", port)
		fmt.Println(strings.Repeat("─", 45))
	}

	log.Fatal(app.ListenAndServe(":" + port))
}

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
	"time"

	"github.com/marcoschwartz/lungo/pkg/lungo"
)

// ── OmniKit API Client ───────────────────────────────────────

var (
	apiURL    string
	apiKey    string
	projectID string
)

func omnikitRequest(method, path string, body interface{}, r *http.Request) ([]byte, int) {
	var reqBody io.Reader
	if body != nil {
		data, _ := json.Marshal(body)
		reqBody = bytes.NewReader(data)
	}

	url := apiURL + path
	req, _ := http.NewRequest(method, url, reqBody)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", apiKey)

	// Forward user's auth token if present
	if r != nil {
		if c, err := r.Cookie("access_token"); err == nil {
			req.Header.Set("Authorization", "Bearer "+c.Value)
		}
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("[OmniKit] request error: %v", err)
		return nil, 500
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)
	return data, resp.StatusCode
}

// ── Main ──────────────────────────────────────────────────────

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
			DefaultMode: "ssr", // most pages need auth/fresh data
			Rules: []lungo.CacheRule{
				{Path: "/login", Mode: "static"},
			},
			RevalidateSecret: os.Getenv("REVALIDATE_SECRET"),
		},
	})

	app.Use(lungo.CORS(lungo.CORSOptions{AllowOrigins: []string{"*"}}))

	// ── Auth Proxy ────────────────────────────────────────────

	app.API("/api/auth/login", func(w http.ResponseWriter, r *http.Request) {
		var creds map[string]string
		json.NewDecoder(r.Body).Decode(&creds)

		data, status := omnikitRequest("POST", "/auth/login", creds, nil)
		if status != 200 {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(status)
			w.Write(data)
			return
		}

		var resp map[string]interface{}
		json.Unmarshal(data, &resp)

		// Set tokens as httpOnly cookies
		if token, ok := resp["access_token"].(string); ok {
			http.SetCookie(w, &http.Cookie{
				Name: "access_token", Value: token, Path: "/",
				HttpOnly: true, MaxAge: 900, // 15 min
			})
		}
		if token, ok := resp["refresh_token"].(string); ok {
			http.SetCookie(w, &http.Cookie{
				Name: "refresh_token", Value: token, Path: "/",
				HttpOnly: true, MaxAge: 86400 * 7,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(data)
	})

	app.API("/api/auth/me", func(w http.ResponseWriter, r *http.Request) {
		data, status := omnikitRequest("GET", "/auth/me", nil, r)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		w.Write(data)
	})

	// ── Data Proxy ────────────────────────────────────────────

	app.API("/api/data", func(w http.ResponseWriter, r *http.Request) {
		// Proxy query string
		path := "/data/" + r.URL.Query().Get("table")
		id := r.URL.Query().Get("id")
		if id != "" {
			path += "/" + id
		}

		// Forward query params
		q := r.URL.Query()
		q.Del("table")
		q.Del("id")
		if len(q) > 0 {
			path += "?" + q.Encode()
		}

		data, status := omnikitRequest(r.Method, path, nil, r)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		w.Write(data)
	})

	app.API("/api/data/mutate", func(w http.ResponseWriter, r *http.Request) {
		table := r.URL.Query().Get("table")
		id := r.URL.Query().Get("id")
		method := r.URL.Query().Get("method")
		if method == "" {
			method = r.Method
		}

		path := "/data/" + table
		if id != "" {
			path += "/" + id
		}

		var body interface{}
		if r.Body != nil && (method == "POST" || method == "PUT") {
			json.NewDecoder(r.Body).Decode(&body)
		}

		data, status := omnikitRequest(method, path, body, r)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		w.Write(data)
	})

	// ── Storage Proxy ─────────────────────────────────────────

	app.API("/api/storage/files", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			data, status := omnikitRequest("GET", "/storage/files?project_id="+projectID, nil, r)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(status)
			w.Write(data)
			return
		}
		// POST — upload
		var body interface{}
		json.NewDecoder(r.Body).Decode(&body)
		data, status := omnikitRequest("POST", "/storage/files", body, r)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		w.Write(data)
	})

	// ── Projects Proxy ────────────────────────────────────────

	app.API("/api/projects", func(w http.ResponseWriter, r *http.Request) {
		data, status := omnikitRequest("GET", "/projects", nil, r)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		w.Write(data)
	})

	app.API("/api/tables", func(w http.ResponseWriter, r *http.Request) {
		data, status := omnikitRequest("GET", "/tables?project_id="+projectID, nil, r)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		w.Write(data)
	})

	// ── Server Actions ────────────────────────────────────────

	app.Action("login", func(w http.ResponseWriter, r *http.Request) lungo.ActionResult {
		email := r.FormValue("email")
		password := r.FormValue("password")

		data, status := omnikitRequest("POST", "/auth/login", map[string]string{
			"email": email, "password": password,
		}, nil)

		if status != 200 {
			return lungo.ActionResult{Error: "Invalid email or password"}
		}

		var resp map[string]interface{}
		json.Unmarshal(data, &resp)

		if token, ok := resp["access_token"].(string); ok {
			http.SetCookie(w, &http.Cookie{
				Name: "access_token", Value: token, Path: "/",
				HttpOnly: true, MaxAge: 900,
			})
		}
		if token, ok := resp["refresh_token"].(string); ok {
			http.SetCookie(w, &http.Cookie{
				Name: "refresh_token", Value: token, Path: "/",
				HttpOnly: true, MaxAge: 86400 * 7,
			})
		}

		return lungo.ActionResult{Redirect: "/dashboard"}
	})

	app.Action("logout", func(w http.ResponseWriter, r *http.Request) lungo.ActionResult {
		http.SetCookie(w, &http.Cookie{Name: "access_token", Value: "", Path: "/", MaxAge: -1})
		http.SetCookie(w, &http.Cookie{Name: "refresh_token", Value: "", Path: "/", MaxAge: -1})
		return lungo.ActionResult{Redirect: "/login"}
	})

	app.Action("create-record", func(w http.ResponseWriter, r *http.Request) lungo.ActionResult {
		table := r.FormValue("table")
		title := r.FormValue("title")
		if title == "" {
			return lungo.ActionResult{Error: "Title is required"}
		}
		body := map[string]interface{}{
			"title":      title,
			"project_id": projectID,
		}
		// Collect all form fields
		r.ParseForm()
		for k, v := range r.Form {
			if k != "table" && k != "title" && len(v) > 0 {
				body[k] = v[0]
			}
		}

		_, status := omnikitRequest("POST", "/data/"+table, body, r)
		if status != 200 && status != 201 {
			return lungo.ActionResult{Error: "Failed to create record"}
		}
		return lungo.ActionResult{Redirect: "/data?table=" + table}
	})

	app.Action("delete-record", func(w http.ResponseWriter, r *http.Request) lungo.ActionResult {
		table := r.FormValue("table")
		id := r.FormValue("id")
		omnikitRequest("DELETE", "/data/"+table+"/"+id, nil, r)
		return lungo.ActionResult{Redirect: "/data?table=" + table}
	})

	// ── Loader endpoints (server-side data for pages) ─────────

	app.API("/api/loader/dashboard", func(w http.ResponseWriter, r *http.Request) {
		// Fetch user + recent data in parallel
		userCh := make(chan []byte)
		go func() {
			data, _ := omnikitRequest("GET", "/auth/me", nil, r)
			userCh <- data
		}()

		// Get tables list
		tablesData, _ := omnikitRequest("GET", "/tables?project_id="+projectID, nil, r)

		userData := <-userCh

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"user":%s,"tables":%s,"project_id":%s,"timestamp":"%s"}`,
			string(userData), string(tablesData), projectID,
			time.Now().Format(time.RFC3339))
	})

	app.API("/api/loader/data", func(w http.ResponseWriter, r *http.Request) {
		table := r.URL.Query().Get("table")
		if table == "" {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"records":[],"table":""}`))
			return
		}

		filter := r.URL.Query().Get("filter")
		sort := r.URL.Query().Get("sort")
		limit := r.URL.Query().Get("limit")
		if limit == "" {
			limit = "50"
		}

		path := "/data/" + table + "?limit=" + limit
		if filter != "" {
			path += "&filter=" + filter
		}
		if sort != "" {
			path += "&sort=" + sort
		}

		data, _ := omnikitRequest("GET", path, nil, r)

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"records":%s,"table":"%s"}`, string(data), table)
	})

	// ── Start Server ──────────────────────────────────────────

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	if dev {
		fmt.Println(strings.Repeat("─", 50))
		fmt.Printf("  OmniKit Lungo App\n")
		fmt.Printf("  API:     %s\n", apiURL)
		fmt.Printf("  Project: %s\n", projectID)
		fmt.Printf("  Server:  http://localhost:%s\n", port)
		fmt.Println(strings.Repeat("─", 50))
	}

	log.Fatal(app.ListenAndServe(":" + port))
}

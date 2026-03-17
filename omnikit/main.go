package main

import (
	"bytes"
	"encoding/base64"
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

func base64Decode(dst, src []byte) (int, error) {
	return base64.RawURLEncoding.Decode(dst, src)
}

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

	// Helper to get project ID from cookie or default
	getProjectID := func(r *http.Request) string {
		if c, err := r.Cookie("omnikit_project"); err == nil && c.Value != "" {
			return c.Value
		}
		return projectID
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

	app.Use(lungo.Redirects([]lungo.RedirectRule{
		{From: "/", To: "/dashboard", Code: 302},
	}))

	// Token refresh — if access_token is expired but refresh_token exists, get a new one
	app.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			accessCookie, accessErr := r.Cookie("access_token")
			refreshCookie, refreshErr := r.Cookie("refresh_token")

			needsRefresh := false
			if accessErr != nil && refreshErr == nil && refreshCookie.Value != "" {
				// No access token but have refresh token
				needsRefresh = true
			} else if accessErr == nil && accessCookie.Value != "" {
				// Check if access token is expired by trying to decode JWT expiry
				parts := strings.Split(accessCookie.Value, ".")
				if len(parts) == 3 {
					// Decode payload (base64)
					payload := parts[1]
					// Add padding
					for len(payload)%4 != 0 {
						payload += "="
					}
					decoded := make([]byte, len(payload))
					n, err := base64Decode(decoded, []byte(payload))
					if err == nil {
						var claims map[string]interface{}
						if json.Unmarshal(decoded[:n], &claims) == nil {
							if exp, ok := claims["exp"].(float64); ok {
								if time.Now().Unix() >= int64(exp)-30 { // 30s buffer
									needsRefresh = true
								}
							}
						}
					}
				}
			}

			if needsRefresh && refreshErr == nil && refreshCookie.Value != "" {
				data, status := omnikitRequest("POST", "/auth/refresh", map[string]string{
					"refresh_token": refreshCookie.Value,
				}, nil)

				if status == 200 {
					var resp map[string]interface{}
					if json.Unmarshal(data, &resp) == nil {
						if token, ok := resp["access_token"].(string); ok {
							http.SetCookie(w, &http.Cookie{
								Name: "access_token", Value: token, Path: "/",
								HttpOnly: true, MaxAge: 900,
							})
							// Update the request so downstream handlers see the new token
							r.AddCookie(&http.Cookie{Name: "access_token", Value: token})
						}
						if token, ok := resp["refresh_token"].(string); ok {
							http.SetCookie(w, &http.Cookie{
								Name: "refresh_token", Value: token, Path: "/",
								HttpOnly: true, MaxAge: 86400 * 7,
							})
						}
					}
				} else {
					// Refresh failed — clear cookies and redirect to login
					http.SetCookie(w, &http.Cookie{Name: "access_token", Value: "", Path: "/", MaxAge: -1})
					http.SetCookie(w, &http.Cookie{Name: "refresh_token", Value: "", Path: "/", MaxAge: -1})
				}
			}

			next.ServeHTTP(w, r)
		})
	})

	// Auth guard — redirect to /login if no session cookie
	app.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			path := r.URL.Path
			// Public paths that don't need auth
			if path == "/login" || path == "/" ||
				strings.HasPrefix(path, "/api/") ||
				strings.HasPrefix(path, "/action/") ||
				strings.HasPrefix(path, "/static/") ||
				strings.HasPrefix(path, "/runtime/") ||
				strings.HasPrefix(path, "/app/") ||
				strings.HasPrefix(path, "/__") ||
				strings.HasPrefix(path, "/_data/") {
				next.ServeHTTP(w, r)
				return
			}
			// Check for auth cookie
			if _, err := r.Cookie("access_token"); err != nil {
				http.Redirect(w, r, "/login", 302)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

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
		if status == 200 {
			// Unwrap: OmniKit returns {user:{...}, ...} — extract the user object
			var resp map[string]json.RawMessage
			if json.Unmarshal(data, &resp) == nil {
				if userData, ok := resp["user"]; ok {
					w.Write(userData)
					return
				}
			}
		}
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
			data, status := omnikitRequest("GET", "/storage/files?project_id="+getProjectID(r), nil, r)
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

	app.API("/api/projects", func(w http.ResponseWriter, r *http.Request) {
		data, _ := omnikitRequest("GET", "/auth/me", nil, r)
		w.Header().Set("Content-Type", "application/json")
		var resp map[string]json.RawMessage
		if json.Unmarshal(data, &resp) == nil {
			pid := getProjectID(r)
			projects := resp["projects"]
			if projects == nil {
				projects = []byte("[]")
			}
			fmt.Fprintf(w, `{"projects":%s,"current_project_id":"%s"}`, string(projects), pid)
			return
		}
		w.Write([]byte(`{"projects":[]}`))
	})

	app.API("/api/tables", func(w http.ResponseWriter, r *http.Request) {
		data, _ := omnikitRequest("GET", "/tables?project_id="+getProjectID(r), nil, r)
		w.Header().Set("Content-Type", "application/json")

		// Extract just name + table_type, filter to data tables only
		var raw map[string]json.RawMessage
		if json.Unmarshal(data, &raw) == nil {
			if tableData, ok := raw["data"]; ok {
				var tables []map[string]interface{}
				if json.Unmarshal(tableData, &tables) == nil {
					var filtered []map[string]string
					for _, t := range tables {
						tt, _ := t["table_type"].(string)
						if tt == "system" {
							continue
						}
						name, _ := t["name"].(string)
						displayName, _ := t["display_name"].(string)
						if name == "" {
							continue
						}
						filtered = append(filtered, map[string]string{
							"name":         name,
							"display_name": displayName,
							"table_type":   tt,
						})
					}
					json.NewEncoder(w).Encode(map[string]interface{}{"data": filtered})
					return
				}
			}
		}
		w.Write(data)
	})

	// ── Server Actions ────────────────────────────────────────

	app.Action("login", func(w http.ResponseWriter, r *http.Request) lungo.ActionResult {
		email := r.FormValue("email")
		password := r.FormValue("password")

		log.Printf("[Login] email=%s project_id=%s", email, projectID)
		data, status := omnikitRequest("POST", "/auth/login", map[string]string{
			"email": email, "password": password, "project_id": projectID,
		}, nil)
		log.Printf("[Login] status=%d response=%s", status, string(data)[:min(len(data), 100)])

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

		// Store projects list as a readable cookie for the project selector
		// Fetch full /auth/me to get projects
		meData, meStatus := omnikitRequest("GET", "/auth/me", nil, &http.Request{
			Header: http.Header{"Cookie": []string{"access_token=" + resp["access_token"].(string)}},
		})
		if meStatus == 200 {
			var meResp map[string]interface{}
			if json.Unmarshal(meData, &meResp) == nil {
				if projects, ok := meResp["projects"].([]interface{}); ok {
					var slim []map[string]interface{}
					for _, p := range projects {
						if pm, ok := p.(map[string]interface{}); ok {
							slim = append(slim, map[string]interface{}{
								"id":   pm["id"],
								"name": pm["name"],
							})
						}
					}
					pJSON, _ := json.Marshal(slim)
					http.SetCookie(w, &http.Cookie{
						Name: "omnikit_projects", Value: string(pJSON), Path: "/",
						MaxAge: 86400 * 7,
					})
				}
			}
		}

		// Set default project cookie if not set
		if _, err := (&http.Request{Header: r.Header}).Cookie("omnikit_project"); err != nil {
			http.SetCookie(w, &http.Cookie{
				Name: "omnikit_project", Value: projectID, Path: "/",
				MaxAge: 86400 * 365,
			})
		}

		return lungo.ActionResult{Redirect: "/dashboard"}
	})

	app.Action("switch-project", func(w http.ResponseWriter, r *http.Request) lungo.ActionResult {
		pid := r.FormValue("project_id")
		if pid == "" {
			return lungo.ActionResult{Error: "Project ID required"}
		}
		http.SetCookie(w, &http.Cookie{
			Name: "omnikit_project", Value: pid, Path: "/",
			HttpOnly: false, MaxAge: 86400 * 365,
		})
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
		pid := getProjectID(r)
		// Fetch user + tables in parallel
		type meResult struct {
			user     []byte
			projects []byte
		}
		meCh := make(chan meResult)
		go func() {
			data, _ := omnikitRequest("GET", "/auth/me", nil, r)
			var resp map[string]json.RawMessage
			var res meResult
			if json.Unmarshal(data, &resp) == nil {
				if u, ok := resp["user"]; ok {
					res.user = u
				}
				if p, ok := resp["projects"]; ok {
					res.projects = p
				}
			}
			if res.user == nil {
				res.user = data
			}
			meCh <- res
		}()

		tablesRaw, _ := omnikitRequest("GET", "/tables?project_id="+getProjectID(r), nil, r)
		// Filter to data tables, slim payload
		var tablesData []byte
		var rawT map[string]json.RawMessage
		if json.Unmarshal(tablesRaw, &rawT) == nil {
			if td, ok := rawT["data"]; ok {
				var allTables []map[string]interface{}
				if json.Unmarshal(td, &allTables) == nil {
					var filtered []map[string]string
					for _, t := range allTables {
						tt, _ := t["table_type"].(string)
						if tt == "system" {
							continue
						}
						name, _ := t["name"].(string)
						dn, _ := t["display_name"].(string)
						if name != "" {
							filtered = append(filtered, map[string]string{"name": name, "display_name": dn})
						}
					}
					tablesData, _ = json.Marshal(filtered)
				}
			}
		}
		if tablesData == nil {
			tablesData = tablesRaw
		}

		meData := <-meCh

		w.Header().Set("Content-Type", "application/json")
		projects := meData.projects
		if projects == nil {
			projects = []byte("[]")
		}
		fmt.Fprintf(w, `{"user":%s,"tables":%s,"projects":%s,"project_id":"%s","timestamp":"%s"}`,
			string(meData.user), string(tablesData), string(projects), pid,
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

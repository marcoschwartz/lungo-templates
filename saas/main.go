package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/marcoschwartz/lungo/pkg/lungo"
)

// ── Simple JSON Store ─────────────────────────────────────────

type Task struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Status    string `json:"status"` // "todo", "doing", "done"
	CreatedAt string `json:"createdAt"`
}

type Store struct {
	mu    sync.RWMutex
	tasks []Task
	file  string
}

func NewStore(file string) *Store {
	s := &Store{file: file}
	s.load()
	return s
}

func (s *Store) load() {
	data, err := os.ReadFile(s.file)
	if err != nil {
		// Seed with sample data
		s.tasks = []Task{
			{ID: "1", Title: "Set up authentication", Status: "done", CreatedAt: "2026-03-10"},
			{ID: "2", Title: "Build dashboard", Status: "done", CreatedAt: "2026-03-11"},
			{ID: "3", Title: "Integrate payment provider", Status: "doing", CreatedAt: "2026-03-12"},
			{ID: "4", Title: "Write API documentation", Status: "todo", CreatedAt: "2026-03-13"},
			{ID: "5", Title: "Add email notifications", Status: "todo", CreatedAt: "2026-03-14"},
		}
		s.save()
		return
	}
	json.Unmarshal(data, &s.tasks)
}

func (s *Store) save() {
	data, _ := json.MarshalIndent(s.tasks, "", "  ")
	os.WriteFile(s.file, data, 0644)
}

func (s *Store) All() []Task {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]Task, len(s.tasks))
	copy(out, s.tasks)
	return out
}

func (s *Store) Add(title string) Task {
	s.mu.Lock()
	defer s.mu.Unlock()
	t := Task{
		ID:        fmt.Sprintf("%d", time.Now().UnixNano()),
		Title:     title,
		Status:    "todo",
		CreatedAt: time.Now().Format("2006-01-02"),
	}
	s.tasks = append(s.tasks, t)
	s.save()
	return t
}

func (s *Store) Delete(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, t := range s.tasks {
		if t.ID == id {
			s.tasks = append(s.tasks[:i], s.tasks[i+1:]...)
			break
		}
	}
	s.save()
}

func (s *Store) UpdateStatus(id, status string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, t := range s.tasks {
		if t.ID == id {
			s.tasks[i].Status = status
			break
		}
	}
	s.save()
}

// ── Mock Auth ─────────────────────────────────────────────────

var users = map[string]map[string]string{
	"demo@example.com": {"password": "demo123", "name": "Alex Demo", "plan": "pro", "avatar": "AD"},
}

var sessions = map[string]string{}

func getUser(r *http.Request) (map[string]string, bool) {
	cookie, err := r.Cookie("session")
	if err != nil {
		return nil, false
	}
	email, ok := sessions[cookie.Value]
	if !ok {
		return nil, false
	}
	user, ok := users[email]
	if !ok {
		return nil, false
	}
	return map[string]string{
		"email": email, "name": user["name"], "plan": user["plan"], "avatar": user["avatar"],
	}, true
}

// ── Main ──────────────────────────────────────────────────────

func main() {
	dev := os.Getenv("LUNGO_DEV") == "1"
	store := NewStore("tasks.json")

	app := lungo.New(lungo.Options{
		AppDir:    "./app",
		StaticDir: "./static",
		Dev:       dev,
		Cache: &lungo.CacheOptions{
			DefaultMode: "ssr", // most pages are user-specific
			Rules: []lungo.CacheRule{
				{Path: "/", Mode: "static"},
				{Path: "/login", Mode: "static"},
				{Path: "/pricing", Mode: "isr", TTL: 300},
			},
			RevalidateSecret: os.Getenv("REVALIDATE_SECRET"),
		},
	})

	app.Use(lungo.CORS(lungo.CORSOptions{AllowOrigins: []string{"*"}}))

	// ── Auth API ──────────────────────────────────────────────

	app.API("/api/me", func(w http.ResponseWriter, r *http.Request) {
		user, ok := getUser(r)
		if !ok {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(401)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	})

	// ── Tasks API ─────────────────────────────────────────────

	app.API("/api/tasks", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(store.All())
	})

	// ── Dashboard API ─────────────────────────────────────────

	app.API("/api/stats", func(w http.ResponseWriter, r *http.Request) {
		tasks := store.All()
		todo, doing, done := 0, 0, 0
		for _, t := range tasks {
			switch t.Status {
			case "todo":
				todo++
			case "doing":
				doing++
			case "done":
				done++
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"revenue":    12450,
			"users":      1284,
			"orders":     len(tasks),
			"conversion": 3.2,
			"taskStats":  map[string]int{"todo": todo, "doing": doing, "done": done},
			"chart": []map[string]interface{}{
				{"month": "Jan", "value": 4200},
				{"month": "Feb", "value": 5800},
				{"month": "Mar", "value": 4900},
				{"month": "Apr", "value": 7200},
				{"month": "May", "value": 6800},
				{"month": "Jun", "value": 8900},
				{"month": "Jul", "value": 12450},
			},
			"recentActivity": []map[string]string{
				{"action": "New signup", "user": "sarah@acme.co", "time": "2 min ago"},
				{"action": "Upgraded to Pro", "user": "mike@startup.io", "time": "15 min ago"},
				{"action": "New order #1042", "user": "lisa@corp.com", "time": "1 hour ago"},
			},
		})
	})

	app.API("/api/pricing", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]map[string]interface{}{
			{"name": "Starter", "price": 0, "period": "forever", "features": []string{"1 project", "100 API calls/day", "Community support"}, "cta": "Get Started"},
			{"name": "Pro", "price": 29, "period": "month", "features": []string{"Unlimited projects", "10,000 API calls/day", "Priority support", "Custom domain", "Analytics"}, "cta": "Start Free Trial", "popular": true},
			{"name": "Enterprise", "price": 99, "period": "month", "features": []string{"Everything in Pro", "Unlimited API calls", "SLA guarantee", "Dedicated support", "SSO", "Audit logs"}, "cta": "Contact Sales"},
		})
	})

	// ── Server Actions ────────────────────────────────────────

	app.Action("login", func(w http.ResponseWriter, r *http.Request) lungo.ActionResult {
		email := r.FormValue("email")
		password := r.FormValue("password")
		user, ok := users[email]
		if !ok || user["password"] != password {
			return lungo.ActionResult{Error: "Invalid email or password"}
		}
		token := fmt.Sprintf("tok_%d", time.Now().UnixNano())
		sessions[token] = email
		http.SetCookie(w, &http.Cookie{Name: "session", Value: token, Path: "/", HttpOnly: true, MaxAge: 86400 * 7})
		return lungo.ActionResult{Redirect: "/dashboard"}
	})

	app.Action("logout", func(w http.ResponseWriter, r *http.Request) lungo.ActionResult {
		http.SetCookie(w, &http.Cookie{Name: "session", Value: "", Path: "/", MaxAge: -1})
		return lungo.ActionResult{Redirect: "/"}
	})

	app.Action("settings", func(w http.ResponseWriter, r *http.Request) lungo.ActionResult {
		name := r.FormValue("name")
		if name == "" {
			return lungo.ActionResult{Error: "Name is required"}
		}
		fmt.Printf("[Settings] Updated name to: %s\n", name)
		return lungo.ActionResult{Redirect: "/settings?saved=1"}
	})

	// Task actions
	app.Action("add-task", func(w http.ResponseWriter, r *http.Request) lungo.ActionResult {
		title := r.FormValue("title")
		if title == "" {
			return lungo.ActionResult{Error: "Title is required"}
		}
		store.Add(title)
		return lungo.ActionResult{Redirect: "/tasks"}
	})

	app.Action("delete-task", func(w http.ResponseWriter, r *http.Request) lungo.ActionResult {
		id := r.FormValue("id")
		store.Delete(id)
		return lungo.ActionResult{Redirect: "/tasks"}
	})

	app.Action("update-task", func(w http.ResponseWriter, r *http.Request) lungo.ActionResult {
		id := r.FormValue("id")
		status := r.FormValue("status")
		store.UpdateStatus(id, status)
		return lungo.ActionResult{Redirect: "/tasks"}
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Fatal(app.ListenAndServe(":" + port))
}

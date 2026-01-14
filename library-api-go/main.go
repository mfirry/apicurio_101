package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/google/uuid"
	"gopkg.in/yaml.v3"
)

const (
	registryURL = "http://localhost:8080/apis/registry/v3"
	groupID     = "group001"
	artifactID  = "library-api"
	version     = "1.0.0"
)

type Book struct {
	Title  string `json:"title"`
	Author string `json:"author"`
}

type BookResponse struct {
	ID string `json:"id"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

// In-memory storage
var (
	books = make(map[string]Book)
	mu    sync.RWMutex
)

func main() {
	openAPISpec, err := fetchOpenAPISpec()
	if err != nil {
		log.Fatalf("Failed to fetch OpenAPI spec: %v", err)
	}

	log.Printf("Successfully loaded OpenAPI spec from registry (version: %s)", version)

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.SetHeader("Content-Type", "application/json"))

	r.Get("/api-docs", func(w http.ResponseWriter, r *http.Request) {
		serveOpenAPIDoc(w, openAPISpec)
	})

	r.Post("/books", createBook)
	r.Get("/books/{id}", getBook)

	port := "3000"
	log.Printf("Server running on http://localhost:%s", port)
	log.Printf("API documentation available at http://localhost:%s/api-docs", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func fetchOpenAPISpec() (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/groups/%s/artifacts/%s/versions/%s/content",
		registryURL, groupID, artifactID, version)

	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch from registry: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("registry returned status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var spec map[string]interface{}
	if err := yaml.Unmarshal(body, &spec); err != nil {
		return nil, fmt.Errorf("failed to parse OpenAPI spec: %w", err)
	}

	return spec, nil
}

func serveOpenAPIDoc(w http.ResponseWriter, spec map[string]interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(spec)
}

func createBook(w http.ResponseWriter, r *http.Request) {
	var book Book
	if err := json.NewDecoder(r.Body).Decode(&book); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request body"})
		return
	}

	if book.Title == "" || book.Author == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Title and author are required"})
		return
	}

	id := uuid.New().String()

	mu.Lock()
	books[id] = book
	mu.Unlock()

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(BookResponse{ID: id})
}

func getBook(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	mu.RLock()
	_, exists := books[id]
	mu.RUnlock()

	if !exists {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Book not found"})
		return
	}

	json.NewEncoder(w).Encode(BookResponse{ID: id})
}

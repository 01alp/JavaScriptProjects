package main

import (
	"log"
	"net/http"
)

func main() {
	// Set up a file server to serve static files (HTML, CSS, JS, images, etc.)
	fs := http.FileServer(http.Dir("."))

	// Handle requests to specific pages
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "home.html")
	})
	http.HandleFunc("/index", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})
	http.HandleFunc("/index2", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index2.html")
	})
	http.HandleFunc("/topScores", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "topScores.html")
	})
	http.HandleFunc("/nextlevel", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "nextlevel.html")
	})
	http.HandleFunc("/final", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "final.html")
	})

	// Start the server and listen on port 8080
	log.Println("Server Loading....")
	log.Printf("\x1b[31mServer listening on http://localhost:8080/home.html\x1b[0m\n")
	log.Fatal(http.ListenAndServe(":8080", fs))
}
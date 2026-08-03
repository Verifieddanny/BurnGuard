package main

import "sync"

type GithubUser struct {
	Username  string `json:"login"`
	Email     string `json:"email"`
	ID        int    `json:"id"`
	AvatarURL string `json:"avatar_url"`
}


type SessionStore struct {
	mu       sync.RWMutex
	sessions map[string]int64
}
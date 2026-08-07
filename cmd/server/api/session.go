package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)


func (app *application) SessionCreate(userID int64) (string, error) {
	sessionID, err := generateSessionID()
	if err != nil {
		return "", fmt.Errorf("failed to create session: %w", err)
	}

	app.sessions.mu.Lock()
	defer app.sessions.mu.Unlock()
	app.sessions.sessions[sessionID] = userID

	return sessionID, nil
}


func (app *application) SessionGet(sessionID string) (int64, bool) {
	app.sessions.mu.RLock()
	defer app.sessions.mu.RUnlock()
	userID, exists := app.sessions.sessions[sessionID]
	return userID, exists
}

func (app *application) SessionDelete(sessionID string) {
	app.sessions.mu.Lock()
	defer app.sessions.mu.Unlock()
	delete(app.sessions.sessions, sessionID)
}

func generateSessionID() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return "session_" + hex.EncodeToString(b), nil
}

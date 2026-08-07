package main

import (
	"net/http"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
)


func (app *application) passkeyRegisterBegin(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int64)

	user, err := app.store.User.GetByID(r.Context(), userID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	// Load existing credentials so the library excludes them
	creds, err := app.store.Passkey.GetByUser(r.Context(), user.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}
	user.Credentials = creds

	options, session, err := app.webauthn.BeginRegistration(user)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	// Store the session data temporarily — keyed by user ID
	app.passkeySessionStore.Set(userID, session)

	if err := app.jsonResponse(w, http.StatusOK, options); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) passkeyRegisterFinish(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int64)

	user, err := app.store.User.GetByID(r.Context(), userID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	creds, err := app.store.Passkey.GetByUser(r.Context(), user.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}
	user.Credentials = creds

	session, ok := app.passkeySessionStore.Get(userID)
	if !ok {
		writeJsonError(w, http.StatusBadRequest, "No registration in progress")
		return
	}
	app.passkeySessionStore.Delete(userID)

	credential, err := app.webauthn.FinishRegistration(user, *session, r)
	if err != nil {
		app.logger.Errorw("passkey registration failed", "error", err.Error())
		writeJsonError(w, http.StatusBadRequest, "Registration failed")
		return
	}

	// Read optional name from query param
	name := r.URL.Query().Get("name")
	if name == "" {
		name = "Passkey"
	}

	if err := app.store.Passkey.Create(r.Context(), user.ID, credential, name); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	app.jsonResponse(w, http.StatusCreated, map[string]string{
		"message": "Passkey registered successfully",
	})
}

// Login: user signs in with a passkey (no prior session needed)

func (app *application) passkeyLoginBegin(w http.ResponseWriter, r *http.Request) {
	options, session, err := app.webauthn.BeginDiscoverableLogin()
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	// Store session keyed by challenge string
	challengeKey := session.Challenge
	app.passkeyLoginSessionStore.Set(challengeKey, session)

	if err := app.jsonResponse(w, http.StatusOK, options); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}


func (app *application) passkeyLoginFinish(w http.ResponseWriter, r *http.Request) {
	parsedResponse, err := protocol.ParseCredentialRequestResponseBody(r.Body)
	if err != nil {
		writeJsonError(w, http.StatusBadRequest, "Invalid credential response")
		return
	}

	challengeKey := parsedResponse.Response.CollectedClientData.Challenge
	matchedSession, ok := app.passkeyLoginSessionStore.Get(challengeKey)
	if !ok || matchedSession == nil {
		writeJsonError(w, http.StatusBadRequest, "No login in progress")
		return
	}

	userHandler := func(rawID, userHandle []byte) (webauthn.User, error) {
		user, err := app.store.Passkey.GetUserByCredentialID(r.Context(), rawID)
		if err != nil {
			return nil, err
		}
		creds, err := app.store.Passkey.GetByUser(r.Context(), user.ID)
		if err != nil {
			return nil, err
		}
		user.Credentials = creds
		return user, nil
	}

	credential, err := app.webauthn.ValidateDiscoverableLogin(userHandler, *matchedSession, parsedResponse)
	if err != nil {
		app.logger.Errorw("passkey login failed", "error", err.Error())
		writeJsonError(w, http.StatusUnauthorized, "Login failed")
		return
	}

	app.passkeyLoginSessionStore.Delete(challengeKey) // Clean up the session after successful login

	// Update sign count
	app.store.Passkey.UpdateSignCount(r.Context(), credential.ID, credential.Authenticator.SignCount)

	// Find the user from the credential
	user, err := app.store.Passkey.GetUserByCredentialID(r.Context(), parsedResponse.RawID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	// Create session
	sessionID, err := app.SessionCreate(int64(user.ID))
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, map[string]string{
		"session_id": sessionID,
	}); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

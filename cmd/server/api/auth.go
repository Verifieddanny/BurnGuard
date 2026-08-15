package main

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	dbstore "github.com/Verifieddanny/bunguard/internal/db_store"
)

func (app *application) redirectToGithub(w http.ResponseWriter, r *http.Request) {
	scopes := "user:email"

	url := strings.Join([]string{
		"https://github.com/login/oauth/authorize",
		"?client_id=" + app.config.oAuth.Github.ClientID,
		"&scope=" + scopes,
		"&prompt=consent",
	}, "")

	http.Redirect(w, r, url, http.StatusFound)
}

func (app *application) handleGithubCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		app.logger.Errorw("missing code in callback", "method", r.Method, "path", r.URL.Path)
		writeJsonError(w, http.StatusBadRequest, "Missing code in callback")
		return
	}

	token, err := app.exchangeCodeForToken(code)
	if err != nil {
		app.logger.Errorw("failed to exchange code", "error", err.Error())
		writeJsonError(w, http.StatusInternalServerError, "Failed to authenticate with GitHub")
		return
	}

	userData, err := app.getGithubUserData(token)
	if err != nil {
		app.logger.Errorw("failed to get user data", "error", err.Error())
		writeJsonError(w, http.StatusInternalServerError, "Failed to get user data from GitHub")
		return
	}

	if userData.Email == "" {
		email, err := app.getGithubUserEmail(token)
		if err != nil {
			app.logger.Errorw("failed to get user email", "error", err.Error())
			writeJsonError(w, http.StatusInternalServerError, "Failed to get user email from GitHub")
			return
		}
		userData.Email = email
	}

	// data := map[string]string{
	// 	"username":     userData.Username,
	// 	"email":        userData.Email,
	// 	"id":           strconv.Itoa(userData.ID),
	// 	"avatar_url":   userData.AvatarURL,
	// 	"access_token": token,
	// }

	user := &dbstore.User{
		GithubID:  int64(userData.ID),
		Name:      userData.Username,
		Email:     userData.Email,
		AvatarURL: userData.AvatarURL,
	}

	if err := app.store.User.CreateOrLink(r.Context(), user); err != nil {
		app.logger.Errorw("failed to upsert user", "error", err.Error())
		writeJsonError(w, http.StatusInternalServerError, "Failed to save user session")
		return
	}

	sessionID, err := app.SessionCreate(int64(user.ID))
	if err != nil {
		app.logger.Errorw("failed to create session", "error", err.Error())
		writeJsonError(w, http.StatusInternalServerError, "Failed to initiate session")
		return
	}

	// http.SetCookie(w, &http.Cookie{
	// 	Name:     "session_id",
	// 	Value:    sessionID,
	// 	Path:     "/",
	// 	Expires:  time.Now().Add(24 * time.Hour * 7),
	// 	HttpOnly: true,
	// 	Secure:   true,
	// 	SameSite: http.SameSiteNoneMode, //http.SameSiteLaxMode, // Adjust to SameSiteNoneMode if frontend/backend are cross-domain
	// })

	frontendURL := fmt.Sprintf("%s/auth/callback?session_id=%s", app.config.frontendURL, sessionID)
	http.Redirect(w, r, frontendURL, http.StatusSeeOther)

}

func (app *application) exchangeCodeForToken(code string) (string, error) {

	body := strings.NewReader(strings.Join([]string{
		"client_id=" + app.config.oAuth.Github.ClientID,
		"&client_secret=" + app.config.oAuth.Github.ClientSecret,
		"&code=" + code,
	}, ""))
	req, err := http.NewRequest("POST", "https://github.com/login/oauth/access_token", body)
	if err != nil {
		return "", err
	}
	req.Header.Set("Accept", "application/json")

	resp, err := app.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var tokenResponse struct {
		AccessToken string `json:"access_token"`
	}

	if err := readOutboundJSON(resp, &tokenResponse); err != nil {
		return "", err
	}

	return tokenResponse.AccessToken, nil
}

func (app *application) getGithubUserData(token string) (*GithubUser, error) {

	req, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "BunGuard")

	resp, err := app.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var userData GithubUser
	if err := readOutboundJSON(resp, &userData); err != nil {
		return nil, err
	}

	return &userData, nil
}

func (app *application) getGithubUserEmail(token string) (string, error) {
	req, err := http.NewRequest("GET", "https://api.github.com/user/emails", nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "BunGuard")

	resp, err := app.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var emails []struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}

	if err := readOutboundJSON(resp, &emails); err != nil {
		return "", err
	}

	for _, email := range emails {
		if email.Primary && email.Verified {
			return email.Email, nil
		}
	}

	return "", nil
}

func (app *application) redirectToGoogle(w http.ResponseWriter, r *http.Request) {
	values := url.Values{}
	values.Set("client_id", app.config.oAuth.Google.ClientID)
	values.Set("redirect_uri", app.googleRedirectURI())
	values.Set("response_type", "code")
	values.Set("scope", "email profile")
	values.Set("prompt", "consent")

	http.Redirect(w, r, "https://accounts.google.com/o/oauth2/v2/auth?"+values.Encode(), http.StatusFound)
}

func (app *application) handleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		app.logger.Errorw("missing code in callback", "method", r.Method, "path", r.URL.Path)
		writeJsonError(w, http.StatusBadRequest, "Missing code in callback")
		return
	}

	token, err := app.exchangeGoogleCodeForToken(code)
	if err != nil {
		app.logger.Errorw("failed to exchange code", "error", err.Error())
		writeJsonError(w, http.StatusInternalServerError, "Failed to authenticate with Google")
		return
	}

	req, err := http.NewRequestWithContext(r.Context(), "GET", "https://www.googleapis.com/oauth2/v2/userinfo", nil)
	if err != nil {
		app.logger.Errorw("failed to build user info request", "error", err.Error())
		writeJsonError(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := app.httpClient.Do(req)
	if err != nil {
		app.logger.Errorw("failed to execute user info request", "error", err.Error())
		writeJsonError(w, http.StatusInternalServerError, "Failed to reach Google API")
		return
	}
	defer resp.Body.Close()

	var userData struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}

	if err := readOutboundJSON(resp, &userData); err != nil {
		app.logger.Errorw("failed to decode user info", "error", err.Error())
		writeJsonError(w, http.StatusInternalServerError, "Invalid payload from Google")
		return
	}

	user := &dbstore.User{
		GoogleID:  userData.ID,
		Name:      userData.Name,
		Email:     userData.Email,
		AvatarURL: userData.Picture,
	}

	if err := app.store.User.CreateOrLink(r.Context(), user); err != nil {
		app.logger.Errorw("failed to upsert Google user", "error", err.Error())
		writeJsonError(w, http.StatusInternalServerError, "Failed to process user session")
		return
	}

	sessionID, err := app.SessionCreate(int64(user.ID))
	if err != nil {
		app.logger.Errorw("failed to create session", "error", err.Error())
		writeJsonError(w, http.StatusInternalServerError, "Failed to initiate session")
		return
	}

	frontendURL := fmt.Sprintf("%s/auth/callback?session_id=%s", app.config.frontendURL, sessionID)
	http.Redirect(w, r, frontendURL, http.StatusSeeOther)
}

func (app *application) exchangeGoogleCodeForToken(code string) (string, error) {
	values := url.Values{}
	values.Set("client_id", app.config.oAuth.Google.ClientID)
	values.Set("client_secret", app.config.oAuth.Google.ClientSecret)
	values.Set("code", code)
	values.Set("grant_type", "authorization_code")
	values.Set("redirect_uri", app.googleRedirectURI())

	req, err := http.NewRequest("POST", "https://oauth2.googleapis.com/token", strings.NewReader(values.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := app.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var tokenResponse struct {
		AccessToken string `json:"access_token"`
	}

	if err := readOutboundJSON(resp, &tokenResponse); err != nil {
		return "", err
	}

	return tokenResponse.AccessToken, nil
}

func (app *application) googleRedirectURI() string {
	return strings.TrimRight(app.config.apiURL, "/") + "/v1/auth/google/callback"
}

func (app *application) getProfileHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int64)

	user, err := app.store.User.GetByID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, dbstore.ErrNotFound) {
			app.logger.Errorw("user found in session but missing in DB", "user_id", userID)
			writeJsonError(w, http.StatusNotFound, "User profile not found")
			return
		}
		app.logger.Errorw("failed to fetch user from database", "user_id", userID, "error", err.Error())
		writeJsonError(w, http.StatusInternalServerError, "Failed to retrieve user profile")
		return
	}

	creds, err := app.store.Passkey.GetByUser(r.Context(), user.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, map[string]any{
		"id":          user.ID,
		"name":        user.Name,
		"email":       user.Email,
		"avatar_url":  user.AvatarURL,
		"github_id":   user.GithubID,
		"google_id":   user.GoogleID,
		"has_passkey": len(creds) > 0,
	}); err != nil {
		app.internalServerError(w, r, err)
	}
}

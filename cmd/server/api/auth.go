package main

import (
	"net/http"
	"strconv"
	"strings"
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

	data := map[string]string{
		"username":     userData.Username,
		"email":        userData.Email,
		"id":           strconv.Itoa(userData.ID),
		"avatar_url":   userData.AvatarURL,
		"access_token": token,
	}

	if err := app.jsonResponse(w, http.StatusOK, data); err != nil {
		app.internalServerError(w, r, err)
	}

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

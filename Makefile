include .envrc
MIGRATIONS_PATH = ./internal/migrations
MIGRATE_ARGS ?=

.PHONY: test
test:
	@go test -v ./...

.PHONY: migrate-create
migrate-create:
	@migrate create -seq -ext sql -dir $(MIGRATIONS_PATH) $(filter-out $@, $(MAKECMDGOALS))

.PHONY: migrate-up
migrate-up:
	@migrate -path=$(MIGRATIONS_PATH) -database="$(DATABASE_URL)" up

.PHONY: migrate-down
migrate-down:
	@migrate -path=$(MIGRATIONS_PATH) -database="$(DATABASE_URL)" down

.PHONY: dev-proxy
dev-proxy:
	air -c .air.proxy.toml

.PHONY: dev-server
dev-server:
	air -c .air.server.toml
DKC = docker compose
DK = docker
.DEFAULT_GOAL = help

help:
	@grep -E '(^[a-zA-Z0-9_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

## —— Docker ———————————————————————————————————————————————————————————————————
up: ## start containers in the background
	@$(DKC) up -d
run: ## start containers in attached mode
	@$(DKC) up
down: ## stop containers
	@$(DKC) down

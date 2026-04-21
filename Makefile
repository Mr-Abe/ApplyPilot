.PHONY: quality quality-frontend quality-backend test-frontend test-backend lint-frontend format-check-frontend

quality: quality-frontend quality-backend

quality-frontend:
	cd frontend && npm run quality

quality-backend:
	cd backend && if [ -x venv/bin/pytest ]; then venv/bin/pytest; else pytest; fi

test-frontend:
	cd frontend && npm run test

test-backend:
	cd backend && if [ -x venv/bin/pytest ]; then venv/bin/pytest; else pytest; fi

lint-frontend:
	cd frontend && npm run lint

format-check-frontend:
	cd frontend && npm run format:check

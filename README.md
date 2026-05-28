# AI Incident Response Platform

An AI-powered full-stack Incident Response Dashboard built using React, Spring Boot, PostgreSQL, WebSockets, and Docker.

---

# Features

- Real-time incident monitoring
- AI-generated incident summaries
- Incident creation and management
- Incident status updates
- Priority management
- Incident history tracking
- ServiceNow ticket simulation
- Real-time WebSocket notifications
- Security log monitoring dashboard
- Dockerized deployment

---

# Tech Stack

## Frontend
- React.js
- Axios
- SockJS
- STOMP WebSocket
- CSS

## Backend
- Spring Boot
- Spring Security
- Spring WebSocket
- Spring Data JPA
- Maven

## Database
- PostgreSQL

## DevOps
- Docker
- Docker Compose
- GitHub

---

# Project Structure

```bash
ai-incident-response-platform/
│
├── incident-response-frontend/
├── incident-response-platform/
├── docker-compose.yml
└── README.md
```

---

# Run Without Docker

## Backend

```bash
cd incident-response-platform
./mvnw spring-boot:run
```

Backend runs on:

```bash
http://localhost:8080
```

---

## Frontend

```bash
cd incident-response-frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# Run With Docker

## Start Application

```bash
docker compose up --build
```

## Stop Application

```bash
docker compose down
```

---

# Docker Services

| Service | Port |
|---|---|
| Frontend | 5173 |
| Backend | 8080 |
| PostgreSQL | 5432 |

---

# API Endpoints

## Incident APIs

| Method | Endpoint |
|---|---|
| GET | /api/incidents |
| POST | /api/incidents |
| PUT | /api/incidents/{id}/status |
| PUT | /api/incidents/{id}/priority |
| POST | /api/incidents/{id}/servicenow-ticket |

---

# Key Features Implemented

- Incident dashboard with live metrics
- Severity distribution charts
- Status overview charts
- WebSocket-based real-time updates
- Incident assignment workflow
- AI-generated root cause analysis
- AI-generated remediation suggestions
- Incident timeline/history tracking
- Dockerized full-stack deployment

---

# Future Enhancements

- JWT Authentication
- Role-Based Access Control
- Splunk Integration
- Kafka Event Streaming
- Email Alerts
- AWS Deployment
- SIEM Integration
- AI Threat Detection

---

# Author

## Balaji Buraga

GitHub:
https://github.com/balajibuuaga-cmd

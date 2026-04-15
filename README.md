# 🐙 GitHub API Testing

En praktisk guide till **GitHub API testing** med Jest och Nock.

## 📁 Projektstruktur

```
github-api-testing/
├── src/
│   └── server.js          ← GitHub API wrapper
├── tests/
│   └── github.test.js     ← 20+ tester
├── package.json
├── jest.config.json
└── README.md
```

---

## 🚀 Snabbstart

### 1. Installera dependencies
```bash
npm install
```

### 2. Kör testerna
```bash
npm test
```

### 3. Läs testerna
Öppna `tests/github.test.js`!

---

## 📚 Vad lär du dig?

### 1️⃣ **Repository Management**
- ✅ Skapa repositories (POST)
- ✅ Hämta repository info (GET)
- ✅ Radera repositories (DELETE)

### 2️⃣ **Authentication**
- ✅ GitHub token validation
- ✅ Authorization headers
- ✅ Invalid token handling

### 3️⃣ **Issues Management**
- ✅ Hämta issues
- ✅ Filtrera by state
- ✅ Query parameters

### 4️⃣ **Input Validation**
- ✅ Repository name validation
- ✅ Format checking
- ✅ Length constraints

### 5️⃣ **Error Handling**
- ✅ 404 Not Found
- ✅ 401 Unauthorized
- ✅ 400 Bad Request

---

## 🎯 API Endpoints

### POST /repos - Create Repository

**Request:**
```json
{
  "name": "my-repo",
  "description": "My awesome repository",
  "private": false,
  "auto_init": false
}
```

**Headers:**
```
X-GitHub-Token: ghp_xxxxxxxxxxxx
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "repo_id": 123456789,
    "name": "my-repo",
    "full_name": "username/my-repo",
    "url": "https://github.com/username/my-repo",
    "created_at": "2024-04-09T10:00:00Z"
  }
}
```

---

### GET /repos/:owner/:repo - Get Repository

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "repo_id": 123456789,
    "name": "my-repo",
    "stars": 42,
    "forks": 10,
    "language": "JavaScript",
    "private": false
  }
}
```

---

### GET /repos/:owner/:repo/issues - Get Issues

**Query Parameters:**
- `state` (open, closed, all)
- `labels` (comma-separated)
- `sort` (created, updated, comments)
- `direction` (asc, desc)

**Response (200 OK):**
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "issue_id": 1,
      "number": 1,
      "title": "Bug fix needed",
      "state": "open",
      "created_at": "2024-04-01T00:00:00Z"
    }
  ]
}
```

---

### DELETE /repos/:owner/:repo - Delete Repository

**Response (204 No Content)**

---

## 🔐 Authentication

GitHub API använder **personal access tokens**:

```javascript
// Headers
{
  'X-GitHub-Token': 'ghp_xxxxxxxxxxxx'
}
```

**För testing:**
- Vi mockar tokens med Nock
- Ingen verklig authentication behövs

---

## 🧪 Test Coverage

```
Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
Coverage:    85%+
```

---

## 📋 Test Categories

### Create Repository (8 tests)
- ✅ Public repository
- ✅ Private repository
- ✅ Missing token
- ✅ Missing name
- ✅ Invalid name format
- ✅ Name length validation
- ✅ Invalid token

### Get Repository (4 tests)
- ✅ Successful fetch
- ✅ Repository not found
- ✅ Public repo without token
- ✅ Missing parameters

### Get Issues (3 tests)
- ✅ Fetch all issues
- ✅ Filter by state
- ✅ Repository not found

### Delete Repository (4 tests)
- ✅ Successful delete
- ✅ Missing token
- ✅ Repository not found
- ✅ Invalid token

### Health Check (1 test)
- ✅ Server status

---

## 💡 Key Concepts

| Koncept | Förklaring |
|---------|-----------|
| **Token** | GitHub personal access token för auth |
| **Repository** | GitHub project/repo |
| **Issues** | Bug reports och feature requests |
| **Public** | Visible to everyone |
| **Private** | Only visible to owner |
| **Status Code** | 201=Created, 204=Deleted, 404=Not Found, 401=Unauthorized |

---

## 🎓 Övningar

### Övning 1: Läs & Förstå
- [ ] Läs genom `tests/github.test.js`
- [ ] Förstå varje test
- [ ] Kör `npm test`

### Övning 2: Modifiera Validation
- [ ] Ändra repository name max längd från 100 till 50
- [ ] Se testen fail
- [ ] Fixa det igen

### Övning 3: Skriv Egna Tester
- [ ] Testa att description är optional
- [ ] Testa repository stats (stars, forks)
- [ ] Testa issue filtering by labels

3. ✅ Skriv egna tester
---

## 🚀 Nästa Steg

1. ✅ Installera & kör testerna
2. ✅ Förstå varje test
4. ✅ Lägg till fler endpoints (PR, commits, releases)
5. ✅ Push till GitHub!

---

## 📊 Expected Coverage

```
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|----------
server.js |  85%    |  80%     |  100%   |  85%
```

---

Happy Testing! 🎉
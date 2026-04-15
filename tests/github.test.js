// ============================================
// GITHUB API TEST SUITE
// Test GitHub repository operations
// ============================================

const request = require('supertest');
const nock = require('nock');
const app = require('../src/server');

// Mock GitHub API responses
const mockRepoResponse = {
  id: 123456789,
  name: 'test-repo',
  full_name: 'testuser/test-repo',
  html_url: 'https://github.com/testuser/test-repo',
  description: 'A test repository',
  private: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-04-09T10:00:00Z',
  stargazers_count: 10,
  forks_count: 5,
  language: 'JavaScript'
};

const mockIssueResponse = [
  {
    id: 1,
    number: 1,
    title: 'Bug: Fix login issue',
    state: 'open',
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2024-04-09T10:00:00Z'
  },
  {
    id: 2,
    number: 2,
    title: 'Feature: Add dark mode',
    state: 'open',
    created_at: '2024-04-02T00:00:00Z',
    updated_at: '2024-04-09T10:00:00Z'
  }
];

describe('🐙 GitHub API Tests', () => {

  // ============================================
  // TEST 1: CREATE REPOSITORY
  // ============================================

  describe('POST /repos - Create Repository', () => {

    test('Ska skapa ett nytt public repository', async () => {
      nock('https://api.github.com')
        .post('/user/repos')
        .reply(201, mockRepoResponse);

      const response = await request(app)
        .post('/repos')
        .set('X-GitHub-Token', 'fake_token_123')
        .send({
          name: 'test-repo',
          description: 'A test repository'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('test-repo');
      expect(response.body.data.repo_id).toBe(123456789);
    });

    test('Ska skapa ett private repository', async () => {
      nock('https://api.github.com')
        .post('/user/repos')
        .reply(201, { ...mockRepoResponse, private: true });

      const response = await request(app)
        .post('/repos')
        .set('X-GitHub-Token', 'fake_token_123')
        .send({
          name: 'private-repo',
          private: true
        });

      expect(response.status).toBe(201);
      expect(response.body.data.private).toBe(true);
    });

    test('Ska returnera 401 när token saknas', async () => {
      const response = await request(app)
        .post('/repos')
        .send({
          name: 'test-repo'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('token');
    });

    test('Ska returnera 400 när repo name saknas', async () => {
      const response = await request(app)
        .post('/repos')
        .set('X-GitHub-Token', 'fake_token_123')
        .send({
          description: 'No name'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('name');
    });

    test('Ska validera repo name längd (min 1 char)', async () => {
      const response = await request(app)
        .post('/repos')
        .set('X-GitHub-Token', 'fake_token_123')
        .send({
          name: ''
        });

      expect(response.status).toBe(400);
    });

    test('Ska validera repo name längd (max 100 chars)', async () => {
      const longName = 'a'.repeat(101);
      const response = await request(app)
        .post('/repos')
        .set('X-GitHub-Token', 'fake_token_123')
        .send({
          name: longName
        });

      expect(response.status).toBe(400);
    });

    test('Ska validera repo name format (endast alphanumeric, -, _, .)', async () => {
      const response = await request(app)
        .post('/repos')
        .set('X-GitHub-Token', 'fake_token_123')
        .send({
          name: 'invalid@repo#name'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('alphanumeric');
    });

    test('Ska acceptera giltiga repo names', async () => {
      nock('https://api.github.com')
        .post('/user/repos')
        .reply(201, { ...mockRepoResponse, name: 'valid-repo_123.git' });

      const response = await request(app)
        .post('/repos')
        .set('X-GitHub-Token', 'fake_token_123')
        .send({
          name: 'valid-repo_123.git'
        });

      expect(response.status).toBe(201);
    });

    test('Ska returnera 401 när token är invalid', async () => {
      nock('https://api.github.com')
        .post('/user/repos')
        .reply(401, { message: 'Bad credentials' });

      const response = await request(app)
        .post('/repos')
        .set('X-GitHub-Token', 'invalid_token')
        .send({
          name: 'test-repo'
        });

      expect(response.status).toBe(401);
    });
  });

  // ============================================
  // TEST 2: GET REPOSITORY
  // ============================================

  describe('GET /repos/:owner/:repo - Get Repository', () => {

    test('Ska hämta repository information', async () => {
      nock('https://api.github.com')
        .get('/repos/testuser/test-repo')
        .reply(200, mockRepoResponse);

      const response = await request(app)
        .get('/repos/testuser/test-repo')
        .set('X-GitHub-Token', 'fake_token_123');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.full_name).toBe('testuser/test-repo');
      expect(response.body.data.stars).toBe(10);
      expect(response.body.data.forks).toBe(5);
    });
  describe('Post/repos - Create Repository', () => {
    test('Description ska vara optional' , async () => {
      nock('https://api.github.com')
        .post('/user/repos')
        .reply(201, mockRepoResponse);

      const response = await request(app)
        .post('/repos')
        .set('X-Github-Token', 'fake_token_123')
        .send({
          name: 'test-repo'

        })

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');

    })
  })  

  describe('GET /repos/:owner/:repo - Get Repository', () => {
     test('<ska hämta repository information utan token (public repos)>', async () => {
      nock('https://api.github.com')
        .get('repos/testuser/test-repo')
        .reply(200, {
          ...mockRepoResponse,
          stargazers_count: 42,
          forks_count: 10
        });
        

        const response = await request(app)
        .get('/repos/testuser/test-repo');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.full_name).toBe('testuser/test-repo');
      expect(typeof response.body.data.stars).toBe('number');

     })
  })

  describe('GET /repos/:owner/:repo -Get Repository', () => {
    test('Ska returnera 404 när repo inte finns', async () => {
      nock('https://api.github.com')
        .get('/repos/testuser/nonexistent')
        .query({state: 'closed', sort: 'created', direction: 'desc'})
        .reply(200, [
          {
            id:1, 
            number: 1,
            title: 'Fixed issue',
            state: 'closed',
            created_at: '2024-03-01T00:00:00Z',
            updated_at: '2024-04-09T10:00:00Z'
          }
      
        ]);

        const response = await request(app)
        .get('/repos/testuser/nonexistent/issues?state=closed&sort=created&direction=desc');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].state).toBe('closed');
    })
  })

    test('Ska returnera 404 när repo inte finns', async () => {
      nock('https://api.github.com')
        .get('/repos/testuser/nonexistent')
        .reply(404, { message: 'Not Found' });

      const response = await request(app)
        .get('/repos/testuser/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    test('Ska acceptera request utan token (public repos)', async () => {
      nock('https://api.github.com')
        .get('/repos/facebook/react')
        .reply(200, { ...mockRepoResponse, name: 'react' });

      const response = await request(app)
        .get('/repos/facebook/react');

      expect(response.status).toBe(200);
    });

    test('Ska returnera 400 när owner eller repo saknas', async () => {
      const response = await request(app)
        .get('/repos//test-repo');

      expect(response.status).toBe(400);
    });
  });

  // ============================================
  // TEST 3: GET ISSUES
  // ============================================

  describe('GET /repos/:owner/:repo/issues - Get Issues', () => {

    test('Ska hämta alla open issues', async () => {
      nock('https://api.github.com')
        .get('/repos/testuser/test-repo/issues')
        .query({ state: 'open', sort: 'created', direction: 'desc' })
        .reply(200, mockIssueResponse);

      const response = await request(app)
        .get('/repos/testuser/test-repo/issues');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.count).toBe(2);
      expect(response.body.data[0].title).toContain('Bug');
    });

    test('Ska filtrera issues by state', async () => {
      nock('https://api.github.com')
        .get('/repos/testuser/test-repo/issues')
        .query(true)
        .reply(200, []);

      const response = await request(app)
        .get('/repos/testuser/test-repo/issues?state=closed');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
    });

    test('Ska returnera 404 när repo inte finns', async () => {
      nock('https://api.github.com')
        .get('/repos/testuser/nonexistent/issues')
        .query(true)
        .reply(404, { message: 'Not Found' });

      const response = await request(app)
        .get('/repos/testuser/nonexistent/issues');

      expect(response.status).toBe(404);
    });
  });

  // ============================================
  // TEST 4: DELETE REPOSITORY
  // ============================================

  describe('DELETE /repos/:owner/:repo - Delete Repository', () => {

    test('Ska radera ett repository', async () => {
      nock('https://api.github.com')
        .delete('/repos/testuser/test-repo')
        .reply(204);

      const response = await request(app)
        .delete('/repos/testuser/test-repo')
        .set('X-GitHub-Token', 'fake_token_123');

      expect(response.status).toBe(204);
    });

    test('Ska returnera 401 när token saknas', async () => {
      const response = await request(app)
        .delete('/repos/testuser/test-repo');

      expect(response.status).toBe(401);
    });

    test('Ska returnera 404 när repo inte finns', async () => {
      nock('https://api.github.com')
        .delete('/repos/testuser/nonexistent')
        .reply(404, { message: 'Not Found' });

      const response = await request(app)
        .delete('/repos/testuser/nonexistent')
        .set('X-GitHub-Token', 'fake_token_123');

      expect(response.status).toBe(404);
    });

    test('Ska returnera 401 när token är invalid', async () => {
      nock('https://api.github.com')
        .delete('/repos/testuser/test-repo')
        .reply(401, { message: 'Bad credentials' });

      const response = await request(app)
        .delete('/repos/testuser/test-repo')
        .set('X-GitHub-Token', 'invalid_token');

      expect(response.status).toBe(401);
    });
  });

  // ============================================
  // TEST 5: HEALTH CHECK
  // ============================================

  describe('GET /health', () => {

    test('Ska returnera status ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  // ============================================
  // TEST 6: RESPONSE STRUCTURE
  // ============================================

  describe('Response Structure', () => {

    test('Create repo response ska ha alla required fields', async () => {
      nock('https://api.github.com')
        .post('/user/repos')
        .reply(201, mockRepoResponse);

      const response = await request(app)
        .post('/repos')
        .set('X-GitHub-Token', 'fake_token_123')
        .send({
          name: 'test-repo'
        });

      const { data } = response.body;
      expect(data).toHaveProperty('repo_id');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('full_name');
      expect(data).toHaveProperty('url');
      expect(data).toHaveProperty('created_at');
    });

    test('Get repo response ska innehålla stats', async () => {
      nock('https://api.github.com')
        .get('/repos/testuser/test-repo')
        .reply(200, mockRepoResponse);

      const response = await request(app)
        .get('/repos/testuser/test-repo');

      const { data } = response.body;
      expect(data).toHaveProperty('stars');
      expect(data).toHaveProperty('forks');
      expect(data).toHaveProperty('language');
    });
  });
});
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// GitHub API base URL
const GITHUB_API_BASE = 'https://api.github.com';

// ============================================
// POST /repos - Create a new repository
// ============================================

/**
 * Create a new GitHub repository
 * Body: { name, description, private, auto_init }
 * Headers: { 'X-GitHub-Token': token }
 */
app.post('/repos', async (req, res) => {
  try {
    const token = req.headers['x-github-token'];
    const { name, description, private: isPrivate, auto_init } = req.body;

    // Validation
    if (!token) {
      return res.status(401).json({
        error: 'Missing GitHub token in X-GitHub-Token header',
        status: 'error'
      });
    }

    if (!name) {
      return res.status(400).json({
        error: 'Repository name is required',
        status: 'error'
      });
    }

    if (name.length < 1 || name.length > 100) {
      return res.status(400).json({
        error: 'Repository name must be between 1 and 100 characters',
        status: 'error'
      });
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
      return res.status(400).json({
        error: 'Repository name can only contain alphanumeric characters, dots, hyphens, and underscores',
        status: 'error'
      });
    }

    // Create repository via GitHub API
    const response = await axios.post(
      `${GITHUB_API_BASE}/user/repos`,
      {
        name,
        description: description || '',
        private: isPrivate || false,
        auto_init: auto_init || false
      },
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    res.status(201).json({
      status: 'success',
      data: {
        repo_id: response.data.id,
        name: response.data.name,
        full_name: response.data.full_name,
        url: response.data.html_url,
        description: response.data.description,
        private: response.data.private,
        created_at: response.data.created_at
      }
    });
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid GitHub token',
        status: 'auth_error'
      });
    }

    if (error.response?.status === 422) {
      return res.status(400).json({
        error: 'Repository name already exists or validation failed',
        status: 'validation_error'
      });
    }

    res.status(500).json({
      error: 'Failed to create repository',
      message: error.message,
      status: 'error'
    });
  }
});

// ============================================
// GET /repos/:owner/:repo - Get repository info
// ============================================

/**
 * Get repository information
 */
app.get('/repos/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.headers['x-github-token'];

    // Validation
    if (!owner || !repo) {
      return res.status(400).json({
        error: 'Owner and repository name are required',
        status: 'error'
      });
    }

    // Fetch repository from GitHub API
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
      token ? {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      } : {}
    );

    res.status(200).json({
      status: 'success',
      data: {
        repo_id: response.data.id,
        name: response.data.name,
        full_name: response.data.full_name,
        url: response.data.html_url,
        description: response.data.description,
        stars: response.data.stargazers_count,
        forks: response.data.forks_count,
        language: response.data.language,
        private: response.data.private,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at
      }
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Repository not found',
        status: 'not_found'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch repository',
      message: error.message,
      status: 'error'
    });
  }
});

// ============================================
// GET /repos/:owner/:repo/issues - Get issues
// ============================================

/**
 * Get repository issues
 * Query: { state, labels, sort, direction }
 */
app.get('/repos/:owner/:repo/issues', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state, labels, sort, direction } = req.query;
    const token = req.headers['x-github-token'];

    if (!owner || !repo) {
      return res.status(400).json({
        error: 'Owner and repository name are required',
        status: 'error'
      });
    }

    // Fetch issues from GitHub API
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`,
      {
        params: {
          state: state || 'open',
          labels: labels || undefined,
          sort: sort || 'created',
          direction: direction || 'desc'
        },
        headers: token ? {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        } : {}
      }
    );

    res.status(200).json({
      status: 'success',
      count: response.data.length,
      data: response.data.map(issue => ({
        issue_id: issue.id,
        number: issue.number,
        title: issue.title,
        state: issue.state,
        created_at: issue.created_at,
        updated_at: issue.updated_at
      }))
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Repository not found',
        status: 'not_found'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch issues',
      message: error.message,
      status: 'error'
    });
  }
});

// ============================================
// DELETE /repos/:owner/:repo - Delete repository
// ============================================

/**
 * Delete a repository
 * Headers: { 'X-GitHub-Token': token }
 */
app.delete('/repos/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.headers['x-github-token'];

    // Validation
    if (!token) {
      return res.status(401).json({
        error: 'Missing GitHub token',
        status: 'error'
      });
    }

    if (!owner || !repo) {
      return res.status(400).json({
        error: 'Owner and repository name are required',
        status: 'error'
      });
    }

    // Delete repository
    await axios.delete(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    res.status(204).send();
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid GitHub token',
        status: 'auth_error'
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Repository not found',
        status: 'not_found'
      });
    }

    res.status(500).json({
      error: 'Failed to delete repository',
      message: error.message,
      status: 'error'
    });
  }
});

// ============================================
// GET /health - Health check
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Only start if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🐙 GitHub API Testing Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
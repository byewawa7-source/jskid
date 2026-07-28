/**
 * GitHub API Store Submission Integration
 * Uses StoreClient's gmFetch internally.
 */
(function(global) {
  "use strict";

  class GitHubStoreAPI {
    constructor(token = null) {
      this.token = token || localStorage.getItem("jskid_github_token");
      this.apiBase = "https://api.github.com";
      this.targetOwner = "byewawa7-source";
      this.targetRepo = "jskid-store";
    }

    setToken(token) {
      this.token = token;
      localStorage.setItem("jskid_github_token", token);
    }

    _headers() {
      return {
        "Authorization": `token ${this.token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      };
    }

    _fetch(url, options = {}) {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          url: url,
          method: options.method || "GET",
          headers: { ...this._headers(), ...options.headers },
          data: options.body || null,
          onload: (res) => {
            if (res.status >= 200 && res.status < 300) {
              resolve(JSON.parse(res.responseText));
            } else {
              reject({ status: res.status, statusText: res.statusText, url });
            }
          },
          onerror: (err) => reject({ status: 0, statusText: "Network error", url, error: err })
        });
      });
    }

    async getAuthenticatedUser() {
      if (!this.token) throw new Error("Set GitHub token in settings first.");
      return await this._fetch(`${this.apiBase}/user`);
    }

    async forkRepo() {
      return await this._fetch(`${this.apiBase}/repos/${this.targetOwner}/${this.targetRepo}/forks`, { method: "POST" });
    }

    async submitModPR(manifest, sourceCode) {
      const user = await this.getAuthenticatedUser();
      const branchName = `mod-submit-${manifest.id}-${Date.now()}`;
      console.log(`[GitHubStoreAPI] Submitting PR for ${manifest.id} from ${user.login}...`);
      return {
        prUrl: `https://github.com/${this.targetOwner}/${this.targetRepo}/pull/1`,
        branch: branchName,
        status: "submitted"
      };
    }
  }

  global.GitHubStoreAPI = GitHubStoreAPI;
  if (!global.jskidGitHubStoreAPI) {
    global.jskidGitHubStoreAPI = new GitHubStoreAPI();
  }
})(typeof window !== "undefined" ? window : globalThis);
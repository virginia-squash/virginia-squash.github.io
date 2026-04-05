# Deploying vasquash.com

The site is hosted on GitHub Pages under the `virginia-squash` organization.

GitHub Pages: https://virginia-squash.github.io/
Repository: https://github.com/virginia-squash/virginia-squash.github.io

## 1. Add the CNAME file

Create a file called `CNAME` in the repo root containing just:

```
vasquash.com
```

Commit and push it.

## 2. Update DNS at GoDaddy

Log in at https://dcc.godaddy.com/ and navigate to **My Products > Domains > vasquash.com > DNS**.

### Remove existing records

Delete any A or CNAME records currently pointing to Wix or other hosts.

### Add A records (point the root domain to GitHub Pages)

Click **Add New Record** for each:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 1 Hour |
| A | @ | 185.199.109.153 | 1 Hour |
| A | @ | 185.199.110.153 | 1 Hour |
| A | @ | 185.199.111.153 | 1 Hour |

### Add CNAME record (point www to GitHub)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | virginia-squash.github.io | 1 Hour |

## 3. Wait for DNS propagation

DNS changes can take up to 48 hours, but usually work within minutes.

You can check progress by running:

```
dig vasquash.com +short
```

When it returns the GitHub IPs listed above, DNS is ready.

## 4. Verify in GitHub

Go to https://github.com/virginia-squash/virginia-squash.github.io/settings/pages and confirm:
- Source is set to `main` branch
- Custom domain shows `vasquash.com`
- "Enforce HTTPS" is checked (available once DNS is verified)

GitHub will automatically provision a free TLS certificate.

## Updating the site

Edit files locally (or directly on GitHub), commit, and push to `main`. The site updates within about 60 seconds.

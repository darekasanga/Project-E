# Quick Setup Guide for Deployment

This is a quick reference guide to fix the "Deployment was canceled because it was created with an unverified commit" error.

## For Repository Administrators

### Required GitHub Repository Secrets

Go to your repository Settings → Secrets and variables → Actions, and add:

1. **VERCEL_TOKEN**
   - Get from: https://vercel.com/account/tokens
   - Create a new token with appropriate permissions

2. **VERCEL_ORG_ID** and **VERCEL_PROJECT_ID**
   - Install Vercel CLI: `npm i -g vercel`
   - Run `vercel link` in your project directory
   - Find values in `.vercel/project.json`:
     ```json
     {
       "orgId": "your-org-id-here",
       "projectId": "your-project-id-here"
     }
     ```

### Workflow Changes

The CI/CD workflows have been updated to:
- Use official Vercel GitHub Action for deployments
- Properly handle commit verification
- Set correct permissions for deployment actions

## For Developers

### Option 1: Sign Commits with GPG (5-minute setup)

```bash
# 1. Generate GPG key
gpg --full-generate-key
# Choose RSA, 4096 bits, use your GitHub email

# 2. Get your key ID
gpg --list-secret-keys --keyid-format=long
# Copy the key ID (e.g., ABCD1234EFGH5678)

# 3. Export public key
gpg --armor --export YOUR_KEY_ID
# Copy the entire output

# 4. Add to GitHub
# Go to https://github.com/settings/keys → New GPG key
# Paste your public key

# 5. Configure Git
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
```

### Option 2: Sign Commits with SSH (if you already have SSH key)

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

### Verify It Works

```bash
# Make a test commit
git commit --allow-empty -m "Test signed commit"

# Check signature
git log --show-signature -1
```

## Troubleshooting

### "gpg: signing failed: Inappropriate ioctl for device"
```bash
export GPG_TTY=$(tty)
echo 'export GPG_TTY=$(tty)' >> ~/.bashrc
```

### "No secret key" error
Make sure your Git email matches the email on your GPG key:
```bash
git config --global user.email "your-github-email@example.com"
```

## More Information

For detailed instructions and troubleshooting, see:
- [COMMIT_SIGNING.md](./COMMIT_SIGNING.md) - Complete guide
- [GitHub Docs: Commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification)

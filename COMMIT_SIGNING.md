# Commit Signing Guide

This document explains how to set up commit signing to ensure your commits are verified and deployments are not canceled.

## Why Commit Signing?

GitHub and deployment platforms like Vercel may require verified commits to ensure code authenticity and security. Unverified commits can cause deployments to be canceled with the error: **"The Deployment was canceled because it was created with an unverified commit"**.

## Solution Options

### Option 1: Sign Commits Locally with GPG (Recommended for Developers)

#### Step 1: Generate a GPG Key

```bash
# Generate a new GPG key
gpg --full-generate-key

# Choose:
# - Key type: (1) RSA and RSA (default)
# - Key size: 4096 bits
# - Expiration: 0 (doesn't expire) or set an expiration date
# - Enter your name and email (must match your GitHub email)
```

#### Step 2: Get Your GPG Key ID

```bash
# List your GPG keys
gpg --list-secret-keys --keyid-format=long

# Output will look like:
# sec   rsa4096/ABCD1234EFGH5678 2024-01-01 [SC]
# The key ID is: ABCD1234EFGH5678
```

#### Step 3: Export Your Public Key

```bash
# Replace KEY_ID with your actual key ID
gpg --armor --export KEY_ID
```

Copy the output (including `-----BEGIN PGP PUBLIC KEY BLOCK-----` and `-----END PGP PUBLIC KEY BLOCK-----`).

#### Step 4: Add GPG Key to GitHub

1. Go to GitHub Settings → SSH and GPG keys
2. Click "New GPG key"
3. Paste your public key
4. Click "Add GPG key"

#### Step 5: Configure Git to Sign Commits

```bash
# Tell Git to use your GPG key (replace KEY_ID with your key ID)
git config --global user.signingkey KEY_ID

# Enable commit signing by default
git config --global commit.gpgsign true

# Set GPG program (if needed)
git config --global gpg.program gpg
```

#### Step 6: Verify It Works

```bash
# Make a test commit
git commit --allow-empty -m "Test signed commit"

# Check the signature
git log --show-signature -1
```

### Option 2: Sign Commits with SSH Key (Alternative)

If you already have an SSH key set up with GitHub:

```bash
# Configure Git to use SSH signing
git config --global gpg.format ssh

# Set your SSH key for signing (replace with your SSH public key path)
git config --global user.signingkey ~/.ssh/id_ed25519.pub

# Enable commit signing
git config --global commit.gpgsign true
```

### Option 3: Use GitHub Web Interface

When making changes directly on GitHub (e.g., editing files in the web UI), commits are automatically signed by GitHub.

## For CI/CD (Automated Workflows)

The GitHub Actions workflows in this repository have been updated to:

1. Use proper checkout with `fetch-depth: 0` to get full git history
2. Use official deployment actions that handle verification automatically
3. Set appropriate permissions for deployments

### Required Secrets for Vercel Deployment

Ensure the following secrets are set in your GitHub repository settings:

- `VERCEL_TOKEN` - Your Vercel authentication token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

To find these values:

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Link to your Vercel project
4. Run `vercel project ls` to get project details
5. Check `.vercel/project.json` for IDs

## Troubleshooting

### "gpg: signing failed: Inappropriate ioctl for device"

```bash
export GPG_TTY=$(tty)
echo 'export GPG_TTY=$(tty)' >> ~/.bashrc  # or ~/.zshrc
```

### "error: gpg failed to sign the data"

```bash
# Test GPG
echo "test" | gpg --clearsign

# If it fails, restart gpg-agent
gpgconf --kill gpg-agent
```

### Commits Show as Unverified on GitHub

- Ensure your Git email matches your GitHub account email
- Ensure your GPG key is added to your GitHub account
- Check that the GPG key hasn't expired

### Deployment Still Failing

1. Check that GitHub Actions has proper permissions in repository settings
2. Verify all required secrets are set (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
3. Check workflow run logs for specific error messages
4. Ensure branch protection rules don't block deployments

## Additional Resources

- [GitHub: Managing commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification)
- [Vercel: Git Integrations](https://vercel.com/docs/deployments/git)
- [GitHub Actions: Checkout action](https://github.com/actions/checkout)

## Summary

To fix "Deployment canceled due to unverified commit":

1. **For developers**: Set up GPG or SSH commit signing locally (see Option 1 or 2 above)
2. **For CI/CD**: Updated workflows now handle this automatically
3. **For Vercel**: Ensure required secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID) are configured

All commits to the `main` branch should now be properly verified, preventing deployment cancellations.

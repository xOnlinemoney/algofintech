#!/bin/bash
# AlgoFinTech - GitHub Setup Script
# Run this from inside the algofintech folder

# Remove any existing .git
rm -rf .git

# Initialize fresh git repo
git init
git branch -m main

# Create GitHub repo (requires gh CLI: brew install gh)
gh repo create AlgoFinTech --public --source=. --remote=origin

# Stage and commit
git add -A
git commit -m "Initial AlgoFinTech B2B whitelabel homepage - Next.js + Tailwind CSS"

# Push
git push -u origin main

echo ""
echo "Done! Now go to https://vercel.com/new to import this repo and deploy."

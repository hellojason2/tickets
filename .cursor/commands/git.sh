#!/bin/bash
# Git push command for tickets repository

cd /Users/thuanle/Documents/tickets

# Add all changes
git add .

# Commit with timestamp
git commit -m "Update: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"

# Push to GitHub
git push -u origin main || git push -u origin master || {
    # If branch doesn't exist, create it
    git branch -M main
    git push -u origin main
}

echo "Pushed to https://github.com/hellojason2/tickets"


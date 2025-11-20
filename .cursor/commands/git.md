# Git Push Command

This command pushes all changes to GitHub repository: https://github.com/hellojason2/tickets

## How to Use

### Method 1: Run the wrapper script (easiest)
From the project root directory:
```bash
./gitpush
```

### Method 2: Run the script directly
```bash
.cursor/commands/git.sh
```

### Method 3: Manual git commands
```bash
cd /Users/thuanle/Documents/tickets
git add .
git commit -m "Update: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main
```

### Method 4: Create a terminal alias (add to ~/.zshrc)
```bash
alias gitpush='cd /Users/thuanle/Documents/tickets && .cursor/commands/git.sh'
```
Then you can run `gitpush` from anywhere.

## What it does:
1. Adds all changes (`git add .`)
2. Commits with timestamp (`git commit`)
3. Pushes to GitHub (`git push origin main`)


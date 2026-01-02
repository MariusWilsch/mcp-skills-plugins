# Hippocampus Plugin

Personal knowledge base for cross-project documentation, conventions, patterns, and how-to guides. Organizes markdown files by tier (global/project) with Git versioning and optional GitHub Pages publishing.

## Overview

Hippocampus provides a structured approach to managing personal knowledge:
- **Global tier**: Cross-project patterns, ADRs, business operations
- **Project tier**: Client-specific documentation organized by client name
- **Phantom nodes**: Wikilinks (`[[topic]]`) for semantic connections
- **Git versioning**: All changes tracked with descriptive commits
- **Optional publishing**: GitHub Pages integration for sharing documents

## Prerequisites

- **Claude Code** installed
- **Git** configured (`user.name` and `user.email` set)

## Installation

### From Marketplace

```bash
# Add the marketplace (if not already added)
/plugin marketplace add MariusWilsch/mcp-skills-plugins

# Install this plugin
/plugin install hippocampus-plugin@mcp-skills-plugins
```

Restart Claude Code to activate the plugin.

## Post-Install Setup (Required)

After installing the plugin, you must set up your hippocampus directory:

### 1. Create Directory Structure

```bash
mkdir -p ~/.claude/hippocampus/{global,project}
```

### 2. Initialize Git Repository

```bash
cd ~/.claude/hippocampus
git init
git remote add origin [your-private-repo-url]
```

### 3. Set Up Identity Reference

Copy the template and customize it:

```bash
# The plugin includes a template at:
# ~/.claude/plugins/hippocampus-plugin/skills/hippocampus/references/identity.md.template

# Create your own identity file:
mkdir -p ~/.claude/skills/hippocampus/references
cp ~/.claude/plugins/hippocampus-plugin/skills/hippocampus/references/identity.md.template \
   ~/.claude/skills/hippocampus/references/identity.md

# Edit with your personal/company information
```

### 4. First Commit

```bash
cd ~/.claude/hippocampus
git add .
git commit -m "feat: initialize hippocampus knowledge base"
git push -u origin main
```

## Usage

### Finding Documentation

```
> Find my Docker deployment patterns
> What's my convention for API error handling?
> How do I set up a new project?
```

Claude will search hippocampus and present matching files for you to select.

### Creating Documentation

```
> Create a new guide for setting up PostgreSQL backups
> Document the API integration pattern I just used
```

Claude will:
1. Search for existing similar content
2. Ask you to choose tier (global/project)
3. Ask for phantom node selection
4. Optionally ask about publishing
5. Create the file and commit

### Binary Assets

```
> Add these screenshots to hippocampus
> Store this PDF in my project documentation
```

Claude will organize binary files with an index.md for each folder.

## Optional: GitHub Pages Publishing

To enable publishing documents publicly:

### 1. Create Publishing Repository

Create a **public** repository for GitHub Pages (e.g., `your-username/my-knowledge-base`).

Enable GitHub Pages:
- Settings -> Pages -> Source: Deploy from branch `main`

### 2. Add GitHub Actions Workflow

Create `.github/workflows/deploy-hippocampus.yml` in your hippocampus repo:

```yaml
name: Publish Hippocampus to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout hippocampus
        uses: actions/checkout@v4

      - name: Find publishable files
        id: find-files
        run: |
          # Find all .md files with 'publish: true' in frontmatter
          publishable_files=""
          for file in $(find . -name "*.md" -type f); do
            if head -20 "$file" | grep -q "publish: true"; then
              publishable_files="$publishable_files $file"
            fi
          done
          echo "files=$publishable_files" >> $GITHUB_OUTPUT

      - name: Checkout publishing repo
        uses: actions/checkout@v4
        with:
          repository: ${{ github.repository_owner }}/[YOUR-PAGES-REPO]
          token: ${{ secrets.PUBLISH_PAT }}
          path: publish-target

      - name: Sync publishable files
        run: |
          # Clear old content (keep .git)
          find publish-target -mindepth 1 -maxdepth 1 ! -name '.git' ! -name '.github' -exec rm -rf {} +

          # Copy publishable files
          for file in ${{ steps.find-files.outputs.files }}; do
            dir=$(dirname "$file")
            mkdir -p "publish-target/$dir"
            cp "$file" "publish-target/$file"

            # Copy referenced assets
            grep -oE '\!\[.*\]\([^)]+\)|\[.*\]\([^)]+\)' "$file" 2>/dev/null | \
              grep -oE '\([^)]+\)' | tr -d '()' | while read asset; do
                if [ -f "$dir/$asset" ]; then
                  cp "$dir/$asset" "publish-target/$dir/"
                fi
              done
          done

      - name: Push to publishing repo
        run: |
          cd publish-target
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add -A
          git diff --staged --quiet || git commit -m "Sync from hippocampus $(date +%Y-%m-%d)"
          git push
```

### 3. Create PAT Token

1. Go to GitHub Settings -> Developer Settings -> Personal Access Tokens
2. Create token with `repo` scope
3. Add as secret `PUBLISH_PAT` in your hippocampus repository

### 4. Add Jekyll Config (Optional)

For nicer rendering, add `_config.yml` to hippocampus root:

```yaml
# Your Knowledge Base
title: My Knowledge Base
description: Personal documentation and patterns
```

And create `_layouts/default.html` for custom styling.

### 5. Publishing Documents

When creating documents, Claude will ask "Publish to GitHub Pages?"

If Yes, the document gets `publish: true` in frontmatter:

```markdown
---
publish: true
---

# My Document
[[phantom-node]]

Content here...
```

On push, GitHub Actions syncs it to your public Pages repo.

## Directory Structure

After setup, your structure will be:

```
~/.claude/
├── hippocampus/              # Your knowledge base (git repo)
│   ├── _config.yml           # Jekyll config (optional)
│   ├── _layouts/             # Jekyll layouts (optional)
│   ├── global/               # Cross-project documentation
│   │   └── *.md
│   └── project/              # Client-specific documentation
│       └── {client-name}/
│           └── *.md
├── skills/
│   └── hippocampus/
│       └── references/
│           └── identity.md   # Your identity (customized)
└── plugins/
    └── hippocampus-plugin/   # This plugin (installed)
```

## Key Concepts

### Phantom Nodes

Every document includes a wikilink `[[phantom-node]]` for semantic organization:

- **Global tier**: Topic-based nodes (e.g., `[[docker-deployment]]`, `[[api-patterns]]`)
- **Project tier**: Client-based nodes (e.g., `[[client-acme]]`, `[[client-example]]`)

### Search-First Pattern

Always search before creating. Claude will:
1. Search for existing content
2. Present matches for you to choose
3. Let you edit existing OR create new

### Edit Over Duplicate

Evolve documents via Git history rather than creating v2 files. Git tracks all changes.

## Troubleshooting

### Skill Not Found

Ensure the plugin is installed and Claude Code is restarted:
```bash
/plugin list
```

### Git Errors

Verify Git is configured:
```bash
git config user.name
git config user.email
```

### Publishing Not Working

1. Check `PUBLISH_PAT` secret is set
2. Verify publishing repo exists and is public
3. Check GitHub Actions logs for errors

## Version Information

- **Plugin version:** 2026-01-02-20-55
- **Requires:** Claude Code with Task/Explore agent support

## License

MIT License

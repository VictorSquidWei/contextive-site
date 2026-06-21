# Contextive Claude Code config — install

Drop these into your repo so every Claude Code session wakes up with full context and your
frequently-used commands.

## Where each piece goes
- `CLAUDE.md`            → repo root. Auto-loaded every session (the "project context" layer).
                           Edit the @import paths if the toolkit isn't at the repo root.
- `.claude/commands/*`   → repo root `.claude/commands/`. Each file = a slash command:
                             /handoff           refresh the handoff doc to current state
                             /new-brief         find words → measure → build a new campaign brief
                             /new-instructions  generate Courtney's Week 02 execution doc
                             /new-graphics      carousel spec + on-brand asset scaffolds
                             /update-site       build a campaign page, preview, deploy (gated)
- `.claude/skills/contextive-campaign/SKILL.md` → the process manual as an auto-invoked skill.

## Install
Copy `CLAUDE.md` to the repo root and merge the `.claude/` folder into the repo root, then commit.
Type `/` in Claude Code to see the commands; `/help` lists everything.

## Two ways to make more commands
1. Hand-write a markdown file in `.claude/commands/` (these are just prompt templates with
   $ARGUMENTS / $1 / $2). Subfolders namespace them (e.g. `.claude/commands/campaign/new.md` → /campaign:new).
2. Easier: tell the running session, e.g. "create a /audit slash command that runs a
   post-completion audit of the last deliverable." It can write the file for you and you commit it.

## Notes
- Frontmatter fields and exact paths can change — confirm against
  https://docs.claude.com/en/docs/claude-code/overview (slash commands, memory/CLAUDE.md, skills).
- `CLAUDE.md` is shared via git so the context follows the repo; personal-only tweaks can go in
  `~/.claude/CLAUDE.md` (global) instead.

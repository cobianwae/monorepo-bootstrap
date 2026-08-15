---
name: git-workflow
description: Konvensi git workflow - branching, conventional commits, PR template, dan release
tags: [git, commit, branch, pr, release]
compatibility: [git, opencode, claude, cursor]
---

# Git Workflow

## Kapan Pakai
Saat diminta membuat commit, branch, PR, tag release, atau merapikan git history.

## Branching Strategy (Simplified GitHub Flow)

```
main (protected, deploy-ready)
  |
  ├── feature/<ticket>-short-desc    # Fitur baru
  ├── fix/<ticket>-short-desc        # Bug fix
  ├── refactor/<ticket>-short-desc   # Refactoring
  └── chore/<ticket>-short-desc      # Config, deps, dll
```

### Aturan Branch
1. Branch dari `main`, merge ke `main` via PR.
2. Branch name: `<type>/<issue-number>-kebab-desc` (max 60 chars).
3. Satu branch = satu concern. Jangan cherry-pick commit antar branch.
4. Squash merge default. Rebase hanya jika diminta reviewer.

## Conventional Commits

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
| Type | Usage |
|------|-------|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `refactor` | Refactoring tanpa perubahan behavior |
| `docs` | Perubahan dokumentasi |
| `test` | Menambah/memperbaiki test |
| `chore` | Config, deps, tooling |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

### Contoh
```
feat(auth): add refresh token rotation
fix(order): handle null items in total calculation
refactor(prisma): extract shared query builder
chore(deps): bump nestjs to v10.4.0
test(user): add unit tests for email validation
```

### Aturan
1. Subject line **imperative mood**, lowercase, tanpa period: `add feature` bukan `Added feature` atau `adds feature`.
2. Subject max 72 characters.
3. Body (jika ada) wrap di 72 chars, jelaskan **why** bukan **what**.
4. Reference issue di footer: `Closes #123` atau `Refs #456`.
5. Breaking change: footer `BREAKING CHANGE: description`.

## PR Template

```markdown
## Summary
<1-2 kalimat apa yang berubah dan kenapa>

## Changes
- [ ] Change 1
- [ ] Change 2

## Testing
<Bagaimana cara test perubahan ini>

## Checklist
- [ ] Code follows project conventions (AGENTS.md)
- [ ] New code has test coverage
- [ ] No `any` types introduced
- [ ] Documentation updated if needed
```

## Checklist Saat Commit
1. [ ] Commit message mengikuti conventional commits
2. [ ] Tidak ada staged file yang tidak terkait
3. [ ] Secrets/credentials tidak termasuk
4. [ ] Large binary files tidak di-commit (gunakan .gitignore)

## Yang TIDAK BOLEH
- Tidak boleh commit langsung ke `main` (selalu via PR)
- Tidak boleh force push ke branch yang sudah ada PR
- Tidak boleh commit message tanpa type prefix
- Tidak boleh `git push --force` ke shared branch
- Tidak boleh `.env` file di-commit
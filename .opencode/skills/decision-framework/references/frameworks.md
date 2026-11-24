# decision-framework — referensi rinci

File ini dipindah dari `SKILL.md` tanpa perubahan isi.

## Trade-Off Matrices

### 1. Design Priorities Trade-Off Matrix

| Scenario | Visual | UX | A11y | Business | Recommended Balance |
|----------|--------|-----|------|----------|---------------------|
| Landing page (first visit) | ★★★★★ | ★★★★ | ★★★★ | ★★★★★ | Visual + Business → UX → A11y |
| Core product flow | ★★★ | ★★★★★ | ★★★★★ | ★★★★ | UX + A11y → Business → Visual |
| Admin dashboard | ★★ | ★★★★ | ★★★★ | ★★★ | UX + A11y → Visual + Business |
| Marketing page | ★★★★★ | ★★★ | ★★★ | ★★★★★ | Visual + Business → A11y → UX |
| Mobile app | ★★★★ | ★★★★★ | ★★★★ | ★★★★ | UX + A11y → Visual → Business |
| Internal tool | ★★ | ★★★★ | ★★★ | ★★ | UX → A11y → Visual + Business |

### 2. Quality Dimensions Trade-Off

| If You Prioritize... | You May Sacrifice... | When Acceptable |
|---------------------|----------------------|-----------------|
| Visual perfection | Development speed | Brand-critical launch |
| Feature completeness | Simplicity | Power user product |
| Simplicity | Feature depth | Consumer product |
| Custom design | Consistency | Brand differentiation |
| Consistency | Innovation | Enterprise product |
| Innovation | Familiarity | Differentiated market |
| Speed | Polish | MVP, learning |
| Polish | Speed | Premium positioning |

### 3. A11y vs Other Priorities

| Conflict | Resolution |
|----------|------------|
| A11y vs Visual aesthetics | A11y wins (it's non-negotiable) |
| A11y vs Development speed | A11y wins (but can phase approach) |
| A11y vs Feature richness | A11y for core, phase for edge |
| A11y vs Business metrics | A11y (ethical, often improves metrics long-term) |

**Note**: Accessibility is rarely a true trade-off. Good a11y often improves UX for all users.

---

## Prioritization Frameworks

### 1. Impact-Effort Matrix

```
         HIGH IMPACT
              │
    ┌─────────┼─────────┐
    │  DO NOW │ PLAN    │
    │  ★★★★★  │ ★★★★   │
    │         │         │
────┼─────────┼─────────┼────► HIGH EFFORT
    │ MAYBE   │ QUICK   │
    │ ★★      │ WINS ★★★│
    │         │         │
    └─────────┼─────────┘
              │
         LOW IMPACT
```

**Categories:**
- **Quick Wins**: High impact, low effort → DO FIRST
- **Major Projects**: High impact, high effort → Plan and prioritize
- **Fill-ins**: Low impact, low effort → Do if time permits
- **Time sinks**: Low impact, high effort → Avoid or eliminate

### 2. RICE Scoring (from product-ux)

```
RICE = (Reach × Impact × Confidence) / Effort

Example:
Feature A: (1000 users × 3 massive × 80% conf) / 2 weeks = 1200
Feature B: (5000 users × 1 medium × 100% conf) / 1 week = 500

→ Feature A has higher RICE score
```

### 3. Moscow Method

```yaml
Must Have: Non-negotiable for release
  - Core functionality
  - A11y compliance
  - Security requirements
  - Legal requirements

Should Have: Important but not vital
  - Key UX improvements
  - Performance optimizations
  - Enhanced features

Could Have: Nice to have
  - Visual polish
  - Edge case handling
  - Delight features

Won't Have: Explicitly out of scope
  - Documented for future
  - Communicated to stakeholders
```

### 4. Kano Model

```
SATISFACTION
     ▲
     │        ★ Delighters (unexpected, wow factor)
     │       /
     │      /  ★ Performance (more = better)
     │     /
     │____/_________★ Basic (expected, must-have)
     │   /
     │  /
     │ / ★ Indifferent (doesn't matter)
     │/
     └──────────────────────► FUNCTIONALITY
```

**Categories:**
- **Basic**: Must be there, no credit if present, dissatisfaction if absent
- **Performance**: Linear relationship with satisfaction
- **Delighters**: Not expected, create wow if present, no problem if absent
- **Indifferent**: Doesn't affect satisfaction

---

## Decision Patterns

### 1. Conflict Resolution Pattern

```yaml
When principles conflict:

1. Identify the conflict:
   "Accessibility says X, but Visual says Y"

2. List constraints:
   - User segments affected
   - Business impact
   - Timeline
   - Technical constraints

3. Find synthesis:
   - Can we have both? (often yes with creativity)
   - Can we phase? (a11y now, visual later)
   - Can we segment? (different solutions for different users)

4. If forced to choose:
   - A11y > Usability > Visual > Business preference
   - Unless business viability is at stake

5. Document the trade-off:
   - Why the decision was made
   - What was sacrificed
   - How to revisit
```

### 2. Complexity Reduction Pattern

```yaml
When design feels complex:

1. Audit:
   - List all elements, options, steps
   - Identify what's truly necessary

2. Simplify:
   - Remove: Is it needed?
   - Combine: Can X and Y be one thing?
   - Defer: Can this be shown later?
   - Automate: Can system do this?

3. Organize:
   - Group: Put related items together
   - Sequence: Show in logical order
   - Prioritize: Emphasize the most important

4. Validate:
   - Can users still achieve their goal?
   - Is cognitive load reduced?
   - Is it faster/easier?
```

### 3. MVP Definition Pattern

```yaml
When building MVP:

1. Define the core job-to-be-done:
   "User needs to [do what] in order to [achieve what]"

2. Identify minimum steps:
   What's the absolute minimum needed?

3. Cut ruthlessly:
   - Remove nice-to-haves
   - Remove edge cases (handle with error message)
   - Remove customizations (use sensible defaults)
   - Remove multiple paths (one path only)

4. Keep quality bar:
   - A11y: Yes, minimum WCAG AA
   - Core UX: Yes, task must be completable
   - Visual: Enough to be credible
   - Performance: Must be acceptable

5. Plan iteration:
   - What will be added in v1.1?
   - What metrics will tell us to add it?
```

---

## Skill Integration Workflows

### Workflow 1: New Feature Development

```yaml
Phase 0 - Framing:
  1. product-ux → Problem, personas, JTBD, metrics
  2. prd-writer → PRD, FR-NNN, non-goals (gate 1)

Phase 1 - Discovery:
  1. ux-research → User interviews if needed
  2. ux-psychology → Understand cognitive factors

Phase 2 - Design:
  1. designer → Object model, sitemap, flow, wireframe, state matrix (gate 2)
  2. ux-patterns → Select interaction patterns
  3. visual-design → Apply aesthetic principles
  4. accessibility → Ensure a11y from start
  5. decision-framework → Resolve conflicts

Phase 3 - Story:
  1. story-writer → Vertical slice, AC Given/When/Then, dependencies (gate 3)

Phase 4 - Build:
  1. design-tokens → Apply tokens
  2. ui-component → Build components
  3. accessibility → Implement a11y features

Phase 5 - Validate:
  1. ux-research → Usability testing
  2. accessibility → A11y audit
  3. product-ux → Metric tracking setup
```

### Workflow 2: UX Audit

```yaml
1. ux-research → Analytics review, heuristics
2. accessibility → WCAG audit
3. product-ux → Business metric alignment check
4. ux-psychology → Cognitive load analysis
5. decision-framework → Prioritize fixes
```

### Workflow 3: Conversion Optimization

```yaml
1. product-ux → Conversion funnel analysis
2. ux-psychology → Trust and persuasion audit
3. ux-patterns → Identify friction points
4. ux-research → A/B test design
5. visual-design → Visual hierarchy audit
```

### Workflow 4: Design System Change (CR)

```yaml
1. decision-framework → Pilih jalur CR vs design+story vs PRD
2. ui-ux-auditor → Audit kode read-only (/audit) bila perlu
3. ui-designer / visual-designer / design-tokens / accessibility → Susun perbaikan
4. reviewer → Review artefak dan temuan
5. CR → branch cr-NNN-slug, commit [CR-NNN], verifikasi, update BACKLOG/STATUS
```

### Workflow 5: Fullstack Feature (API + Types)

```yaml
Phase 0 - Framing:
  1. product-ux / prd-writer → PRD dengan FR-NNN (gate 1) — workflow UI tetap berlaku

Phase 1 - Contract:
  1. shared-types → definisikan/perbarui tipe request-response di @shared/types
  2. Cek consumer: apps/api, apps/web, apps/showcase

Phase 2 - Implementasi:
  1. prisma-schema → model + migration bila perlu persistence (konfirmasi dependency first-time)
  2. backend-nestjs → module + DTO class-validator + exception filter + typed ApiResponse
  3. api-testing → unit service + integration endpoint

Phase 3 - Verify:
  1. monorepo-ci → typecheck workspace, lint, test, check-status-log
```

---


---
name: decision-framework
description: Integration layer untuk memilih skill yang tepat — trade-off analysis, prioritization matrix, dan decision trees untuk visual vs UX vs a11y vs business
tags: [design-system, decision, framework, trade-offs, prioritization, integration]
compatibility: [next, opencode, claude, cursor]
---

# Decision Framework & Skill Integration

## Kapan Pakai
Saat menghadapi keputusan desain yang kompleks, konflik antar prinsip (visual vs UX vs a11y vs business), atau ketika perlu memutuskan skill mana yang harus di-prioritize. Gunakan sebagai "meta-skill" untuk navigasi skill lainnya.

## Decision Trees

### 1. Skill Selection Decision Tree

```
START: Apa yang sedang kamu kerjakan?
│
├─ Memulai fitur baru?
│   └─→ 1. product-ux (personas, JTBD, metrics)
│       2. ux-psychology (cognitive considerations)
│       3. ux-patterns (interaction patterns)
│       4. visual-design (aesthetics)
│       5. ui-component (implementation)
│
├─ Mengaudit UX existing?
│   └─→ 1. ux-research (analytics, testing)
│       2. accessibility (WCAG compliance)
│       3. product-ux (metric alignment)
│
├─ Desain tidak convert?
│   └─→ 1. ux-psychology (trust, persuasion)
│       2. ux-research (A/B test, usability)
│       3. product-ux (conversion patterns)
│
├─ User mengeluh kompleksitas?
│   └─→ 1. ux-psychology (cognitive load)
│       2. ux-patterns (simplification)
│       3. ux-research (usability testing)
│
├─ Masalah visual/aesthetics?
│   └─→ 1. visual-design (principles)
│       2. design-tokens (colors, typography)
│       3. ui-component (implementation)
│
├─ Masalah aksesibilitas?
│   └─→ 1. accessibility (WCAG)
│       2. design-tokens (contrast)
│       3. ux-psychology (inclusive design)
│
└─ Perlu validasi?
    └─→ ux-research (appropriate method)
```

### 2. Visual vs UX Priority Decision Tree

```
Question: Apa yang lebih penting saat ini?

PRIORITY: VISUAL (When)
├─ First impression critical (landing page, marketing)
├─ Brand differentiation needed
├─ Existing UX is solid
├─ Users are happy, but product looks dated
└─ Competitive visual landscape

PRIORITY: UX (When)
├─ Users confused or struggling
├─ Low conversion or engagement
├─ High support ticket volume
├─ Task completion rates low
└─ New user onboarding issues

BALANCED (When)
├─ Product redesign from scratch
├─ Major feature launch
├─ New market entry
└─ Brand repositioning
```

### 3. Perfection vs Speed Decision Tree

```
Context Analysis:

HIGH QUALITY REQUIRED (Take time, do it right)
├─ Safety-critical systems
├─ Healthcare, finance
├─ Legal/compliance implications
├─ High-traffic core flows
├─ Brand-defining moments
└─ Unlikely to change soon

SPEED PRIORITIZED (Ship, iterate later)
├─ MVP / hypothesis testing
├─ Low-risk features
├─ Internal tools
├─ Temporary solutions
├─ Learning experiments
└─ Will definitely iterate

BALANCED APPROACH
├─ Core flows: Quality
├─ Edge cases: Speed with follow-up
├─ High-visibility: Quality
├─ Low-visibility: Speed
└─ Always: Do no harm (a11y, security)
```

---

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
Phase 1 - Discovery:
  1. product-ux → Define personas, JTBD, metrics
  2. ux-research → User interviews if needed
  3. ux-psychology → Understand cognitive factors

Phase 2 - Design:
  1. ux-patterns → Select interaction patterns
  2. visual-design → Apply aesthetic principles
  3. accessibility → Ensure a11y from start
  4. decision-framework → Resolve conflicts

Phase 3 - Build:
  1. design-tokens → Apply tokens
  2. ui-component → Build components
  3. accessibility → Implement a11y features

Phase 4 - Validate:
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

---

## Anti-Patterns

- ✗ Skipping discovery because "we know what users want"
- ✗ Prioritizing visual over usability
- ✗ Sacrificing a11y for any reason
- ✗ Gold-plating low-impact features
- ✗ Perfectionism causing analysis paralysis
- ✗ Speed without clear what-to-cut
- ✗ Ignoring trade-offs (they exist, acknowledge them)
- ✗ Not documenting decisions and rationale

---

## Checklist

1. [ ] Skill yang tepat dipilih untuk masalah
2. [ ] Trade-offs explicitly identified
3. [ ] Prioritization framework applied
4. [ ] A11y tidak dikompromikan
5. [ ] Decision documented dengan rationale
6. [ ] Plan untuk revisit jika perlu

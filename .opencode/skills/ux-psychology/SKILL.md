---
name: ux-psychology
description: Cognitive psychology untuk UX — mental models, cognitive load, trust design, persuasion ethics, behavioral patterns, dan decision-making
tags: [design-system, ux, psychology, cognitive, persuasion, behavioral, trust]
compatibility: [next, opencode, claude, cursor]
---

# UX Psychology & Behavioral Design

## Kapan Pakai
Saat mendesain flows yang membutuhkan user decision, mengoptimasi conversion, mengurangi cognitive load, membangun trust, atau memahami mengapa user berperilaku tertentu. Gunakan sebagai layer psikologis di atas product dan visual design.

## Cognitive Psychology Principles

### 1. Cognitive Load Theory
**Core Principle**: User memiliki kapasitas mental terbatas. Setiap element yang tidak perlu menguras resource.

**Types of Cognitive Load:**
| Type | Description | Design Implication |
|------|-------------|-------------------|
| **Intrinsic** | Complexity inherent to task | Break into smaller steps, progressive disclosure |
| **Extraneous** | Unnecessary complexity from design | Remove clutter, simplify UI |
| **Germane** | Effort to learn and understand | Good onboarding, mental model building |

**Reducing Cognitive Load:**
```yaml
- Chunking: Group related items (7 ± 2 items per chunk)
- Progressive Disclosure: Show essential first, reveal on demand
- Recognition over Recall: Show options, don't make user remember
- Defaults: Pre-select sensible defaults
- Visual Hierarchy: Guide attention with size, color, position
- Consistency: Reduce learning across the app
```

**Warning Signs of Overload:**
- Users missing important information
- Frequent errors in forms
- Users asking "where am I?"
- Long time to complete simple tasks
- Users giving up mid-flow

### 2. Hick's Law
**Formula**: `Time to decide = log₂(n + 1)` where n = number of choices

**Implications:**
- Fewer options = faster decisions
- For complex decisions, help users narrow down
- Use categorization to reduce apparent choices
- Don't eliminate choices, organize them

**Application:**
```yaml
Navigation:
  - Limit top-level items to 5-7
  - Use mega-menus for complex hierarchies

Forms:
  - Limit radio/checkbox options (or use search)
  - Group related options

CTAs:
  - One primary CTA per screen
  - Secondary actions should be clearly secondary
```

### 3. Fitts's Law
**Formula**: `Time to target = a + b × log₂(distance/width + 1)`

**Implications:**
- Larger targets are easier to hit
- Closer targets are faster to reach
- Edge/corner targets are easiest (infinite size in one direction)

**Application:**
```yaml
Buttons:
  - Minimum 44×44px touch target (WCAG)
  - Increase size for primary actions

Menus:
  - Dropdowns extend to edge of trigger
  - Fitts-friendly: menu items extend full width of menu

Mobile:
  - Place primary CTAs in thumb zone (bottom of screen)
  - Increase touch targets for all interactive elements
```

### 4. Mental Models
**Definition**: User's internal representation of how a system works.

**Types of Gaps:**
| Gap | Description | Solution |
|-----|-------------|----------|
| Gulf of Execution | User doesn't know how to do something | Clear affordances, labels |
| Gulf of Evaluation | User doesn't know what happened | Clear feedback, status indicators |

**Aligning Mental Models:**
- Use familiar patterns (don't reinvent wheels)
- Metaphors (trash can = delete, folder = container)
- Consistency across the app
- Onboarding that explains the model
- Feedback that confirms expectations

### 5. Miller's Law
**Principle**: Working memory holds 7 ± 2 items.

**Application:**
- Group information into chunks
- Limit menu items to ~7
- Break long forms into steps
- Use pagination for long lists

---

## Trust & Credibility Design

### Trust Signals by Stage
| Stage | Trust Signals |
|-------|---------------|
| First Visit | Professional design, clear value prop, no dark patterns |
| Considering | Social proof (testimonials, reviews), security badges |
| Signing Up | Privacy policy visible, no excessive data asks |
| Transacting | SSL, payment security badges, clear pricing |
| Post-Purchase | Clear confirmation, easy support access |

### Building Trust Elements
```yaml
Visual:
  - Professional, polished design
  - Consistent branding
  - High-quality images
  - No broken links or typos

Content:
  - Clear, honest communication
  - Transparent pricing
  - Easy-to-find contact info
  - Real testimonials (with specifics)

Security:
  - HTTPS everywhere
  - Security badges (when real)
  - Privacy policy accessible
  - Clear data usage explanation

Social Proof:
  - Customer logos (real ones)
  - Testimonials (specific, credible)
  - Case studies
  - User count, reviews
  - Expert endorsements
```

### Trust Destroyers (Avoid)
- Dark patterns (hidden costs, trick questions)
- Stock photos that look fake
- Vague testimonials ("Great product!")
- Hard to find contact info
- Auto-playing media
- Excessive popups
- Typos and broken links

---

## Persuasion & Behavioral Design (Ethical)

### Fogg Behavior Model
**Formula**: `Behavior = Motivation × Ability × Trigger`

All three must be present for behavior to occur.

| Component | How to Increase |
|-----------|-----------------|
| Motivation | Pleasure/pain, hope/fear, social acceptance/rejection |
| Ability | Simplify, reduce steps, reduce cognitive load |
| Trigger | Prompts, CTAs, notifications |

### Ethical Persuasion Patterns

| Pattern | When It's Ethical | Implementation |
|---------|-------------------|----------------|
| **Social Proof** | When genuine | "Join 10,000+ users", real testimonials |
| **Authority** | When credible | Expert endorsements, certifications |
| **Scarcity** | When real | "3 left", countdown timer (if true) |
| **Reciprocity** | When valuable | Free value before asking for commitment |
| **Commitment** | When aligned with user goals | Small ask → larger ask (foot-in-door) |
| **Liking** | When authentic | Humanize brand, show team |
| **Unity** | When genuine | Shared identity, community |

### Dark Patterns (NEVER USE)
```yaml
❌ Confirmshaming: "No thanks, I don't want to save money"
❌ Hidden costs: Add fees at checkout
❌ Bait and switch: Advertise one thing, deliver another
❌ Forced continuity: Auto-renew without clear notice
❌ Friend spam: Abuse contact list
❌ Roach motel: Easy to get in, hard to get out
❌ Trick questions: Confusing opt-in/opt-out
❌ Disguised ads: Make ads look like content
```

---

## Psychology of Attention & Perception

### Visual Attention
```yaml
Priority Order:
  1. Motion (use sparingly)
  2. Color contrast
  3. Size
  4. Position (F-pattern, Z-pattern)
  5. Isolation (one different element draws attention)

F-Pattern Reading:
  - Top horizontal scan
  - Second horizontal scan (lower)
  - Vertical scan down left side
  - Implication: Important info on left and top

Z-Pattern Reading:
  - Top left → Top right
  - Diagonal to bottom left
  - Bottom left → Bottom right
  - Implication: For landing pages, hero sections
```

### Gestalt Principles
| Principle | Description | Application |
|-----------|-------------|-------------|
| **Proximity** | Items near each other are related | Group related UI elements |
| **Similarity** | Similar items are perceived as group | Consistent styling for same element types |
| **Continuity** | Eye follows lines/curves | Guide attention with visual flow |
| **Closure** | Brain fills in incomplete shapes | Use for icons, progress indicators |
| **Figure/Ground** | Distinguish foreground from background | Modals, overlays, depth |

---

## Decision-Making Psychology

### Loss Aversion
**Principle**: People feel losses ~2x more than equivalent gains.

**Application:**
- Frame in terms of what user will lose: "Don't miss out" vs "Get this"
- Free trials: "You'll lose access to X features" (not "you'll gain if you upgrade")

### Anchoring
**Principle**: First number seen influences subsequent judgments.

**Application:**
- Pricing: Show highest tier first (anchor), then mid-tier looks reasonable
- Discounts: Show original price crossed out (anchor)

### Decoy Effect
**Principle**: Adding a less attractive option makes target option look better.

**Example:**
```
Option A: $10/month (Basic)
Option B: $20/month (Pro) - most features
Option C: $18/month (Standard) - fewer features than Pro

Option C (decoy) makes Option B look more valuable
```

### Default Effect
**Principle**: Users tend to stick with defaults.

**Ethical Application:**
- Default to privacy-protective options
- Default to sustainable options
- Make changing defaults easy

### Choice Overload
**Principle**: Too many choices → decision paralysis or dissatisfaction.

**Solutions:**
- Limit options
- Highlight recommended option
- Allow filtering/sorting
- Show "most popular" or "best for you"

### Paradox of Choice
**Principle**: More options can lead to less satisfaction post-choice.

**Mitigation:**
- Categorize options
- Offer "good enough" recommendations
- Allow easy reversal (undo, return policy)

---

## Emotional Design

### Three Levels of Processing (Norman)
| Level | Description | Design Focus |
|-------|-------------|--------------|
| **Visceral** | Immediate, automatic reaction | Aesthetics, first impression |
| **Behavioral** | Use experience, functionality | Usability, performance, pleasure |
| **Reflective** | Meaning, memory, self-image | Brand, story, identity |

### Designing for Emotions
```yaml
Joy:
  - Delightful micro-interactions
  - Celebratory animations on achievements
  - Surprise and delight moments

Trust:
  - Consistent, reliable behavior
  - Transparent communication
  - Predictable outcomes

Confidence:
  - Clear feedback
  - Undo capabilities
  - No fear of breaking things

Belonging:
  - Community features
  - Personalization
  - Shared identity markers
```

---

## Anti-Patterns
- ✗ Using persuasion without considering ethics
- ✗ Prioritizing aesthetics over usability
- ✗ Ignoring cognitive load (cluttered interfaces)
- ✗ Creating dark patterns for short-term gains
- ✗ Overwhelming users with choices
- ✗ Violating user trust for conversion

---

## Integration with Other Skills
- **Before**: Use `product-ux` for personas and JTBD
- **During**: Apply `ux-psychology` to optimize flows
- **After**: Use `ux-research` to validate psychological interventions

---

## Checklist
1. [ ] Cognitive load minimized (chunking, progressive disclosure)
2. [ ] Choices organized and limited where appropriate
3. [ ] Trust signals present at each stage
4. [ ] Persuasion patterns used ethically
5. [ ] Mental models aligned with design
6. [ ] Feedback and status visible
7. [ ] Defaults are ethical and user-protective

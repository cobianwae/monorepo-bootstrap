---
name: product-ux
description: Business context untuk UX — user personas, jobs-to-be-done, business metrics, user journey mapping, conversion patterns, dan feature prioritization
tags: [design-system, product, ux, business, personas, journey, metrics, conversion]
compatibility: [next, opencode, claude, cursor]
---

# Product UX & Business Context

## Kapan Pakai
Saat memulai fitur baru, mendesain user flow, mengoptimasi conversion, atau memastikan desain aligned dengan business goals. WAJIB digunakan sebelum visual design atau implementation untuk memastikan problem space dipahami.

## User Personas

### Persona Template
```yaml
Nama: [Nama representatif]
Foto: [Gambar atau placeholder]

Demographics:
  Age: [Range]
  Occupation: [Role]
  Tech Savviness: [Low/Medium/High]
  Device Preference: [Mobile/Desktop/Both]

Goals:
  - [Primary goal]
  - [Secondary goal]

Pain Points:
  - [Frustration 1]
  - [Frustration 2]

Behaviors:
  - [How they currently solve the problem]
  - [Their workflow]

Context:
  - [When/where they use the product]
  - [Environmental factors]

Quote: "[Something they would say]"

Key Metrics:
  - Activation: [What success looks like for them]
  - Retention: [What brings them back]
```

### Persona Types by Product Stage
| Stage | Persona Focus |
|-------|---------------|
| Early Stage / MVP | 1 primary persona (the core user) |
| Growth | 2-3 personas (expanding segments) |
| Mature | Multiple personas with edge cases |

### When Personas Fail
- Based on assumptions, not research
- Too many personas (dilutes focus)
- Ignored in design decisions
- Not updated as product evolves

---

## Jobs-to-be-Done (JTBD)

### JTBD Framework
**Core Question**: "What job is the user hiring this product to do?"

### JTBD Statement Template
```
When [situation/trigger],
I want to [motivation/goal],
So I can [expected outcome].
```

### Example JTBDs
```yaml
Email Client:
  - When I receive important emails, I want to quickly identify them, so I can respond promptly.
  - When I'm overwhelmed with emails, I want to filter noise, so I can focus on what matters.

Project Management:
  - When I start a new project, I want to set it up quickly, so I can start working immediately.
  - When my team is confused, I want to see clear responsibilities, so we can collaborate effectively.

Design System:
  - When I need a button, I want to grab it quickly, so I can ship faster.
  - When I'm designing a form, I want to see patterns, so I don't reinvent the wheel.
```

### JTBD vs Features
| JTBD (Job) | Feature (Solution) |
|------------|-------------------|
| "I want to stay updated" | Notifications, email digest, activity feed |
| "I want to find things" | Search, filters, tags, categories |
| "I want to feel productive" | Progress bars, completion celebrations, streaks |

**Note**: Multiple features can serve one JTBD. Focus on the job, not the feature.

---

## Business Metrics & KPIs

### North Star Metric
**Definition**: The single metric that best captures core value delivered to users.

**Examples:**
| Product Type | North Star Metric |
|--------------|-------------------|
| Social Media | Daily Active Users (DAU) |
| SaaS | Monthly Recurring Revenue (MRR) |
| E-commerce | Gross Merchandise Value (GMV) |
| Messaging | Messages Sent |
| Streaming | Time Spent Watching |

### AARRR Framework (Pirate Metrics)
```yaml
Acquisition: How do users find you?
  - Traffic sources
  - CAC (Customer Acquisition Cost)
  - Landing page conversion

Activation: Do users have a great first experience?
  - Time to value
  - Onboarding completion rate
  - "Aha!" moment achievement

Retention: Do users come back?
  - DAU/MAU ratio
  - Day 1, 7, 30 retention
  - Churn rate

Referral: Do users tell others?
  - NPS (Net Promoter Score)
  - Viral coefficient
  - Referral program conversions

Revenue: How do you make money?
  - ARPU (Average Revenue Per User)
  - LTV (Lifetime Value)
  - Conversion to paid
```

### UX-Specific Metrics
| Metric | What It Measures | Target |
|--------|------------------|--------|
| Task Success Rate | Can users complete tasks? | > 80% |
| Time on Task | How long does a task take? | Minimize |
| Error Rate | How often do users make mistakes? | < 5% |
| SUS Score | Overall usability (0-100) | > 68 |
| NPS | User satisfaction (-100 to +100) | > 30 |
| CSAT | Satisfaction with specific interaction | > 4/5 |
| CES (Customer Effort Score) | How easy was it? | > 5/7 |

### Connecting UX to Business Metrics
```yaml
UX Improvement → UX Metric → Business Metric
Example:
  Simplified onboarding → Higher activation rate → More paying customers
  Faster checkout → Lower cart abandonment → Higher revenue
  Better search → Higher task success → Higher retention
```

---

## User Journey Mapping

### Journey Map Template
```yaml
Stage: [Stage name, e.g., "Discovery", "Onboarding", "Usage"]

User Goals:
  - [What user wants to achieve]

Touchpoints:
  - [Where interaction happens: website, email, app]

Actions:
  - [What user does]

Thoughts & Feelings:
  - [What user thinks and feels]

Pain Points:
  - [Friction, frustration]

Opportunities:
  - [How to improve]
```

### Journey Stages by Product Type

**E-commerce:**
1. Awareness → 2. Consideration → 3. Purchase → 4. Retention → 5. Advocacy

**SaaS:**
1. Discovery → 2. Trial → 3. Onboarding → 4. Adoption → 5. Expansion → 6. Renewal

**Content/Media:**
1. Discovery → 2. Consumption → 3. Engagement → 4. Sharing

### Identifying Moments of Truth
**Moment of Truth**: Critical touchpoints that significantly impact user perception.

| Type | Description | Design Implication |
|------|-------------|-------------------|
| First Moment of Truth | First interaction with product | Excellent onboarding, clear value prop |
| Second Moment of Truth | Actual usage experience | Reliable, delightful core experience |
| Ultimate Moment of Truth | Sharing with others | Share features, referral program |

---

## Conversion Patterns

### Landing Page Conversion
```yaml
Above the Fold (5 seconds to convince):
  - Clear headline: What is this?
  - Subheadline: What's the benefit?
  - Primary CTA: Clear, action-oriented
  - Social proof: Trust signals
  - Visual: Shows product in action

Below the Fold:
  - Features/Benefits
  - How it works
  - Social proof (testimonials, logos)
  - Pricing (or CTA to learn more)
  - Final CTA
```

### Form Conversion
```yaml
Reducing Friction:
  - Ask only what's needed (progressive disclosure)
  - Smart defaults
  - Inline validation (real-time)
  - Clear error messages
  - Autofill support

Building Trust:
  - Privacy policy link visible
  - Security badges (if collecting sensitive info)
  - Clear indication of what happens next

Increasing Completion:
  - Progress indicator (for multi-step)
  - Save and continue later
  - Clear benefit statement near form
```

### Checkout Conversion
```yaml
Pre-Checkout:
  - Clear pricing (no hidden fees)
  - Guest checkout option
  - Easy cart editing

During Checkout:
  - Minimal steps (ideally 1-2 pages)
  - Address autocomplete
  - Multiple payment options
  - Security reassurance
  - Order summary visible

Post-Checkout:
  - Clear confirmation
  - Expected delivery/timeline
  - Easy way to contact support
```

### Trial-to-Paid Conversion
```yaml
During Trial:
  - Quick time-to-value
  - Guided onboarding
  - Feature discovery (without overwhelming)
  - Progress toward "aha moment"
  - Check-ins at key moments

End of Trial:
  - Reminder before expiry
  - Summary of value gained
  - Clear upgrade path
  - Special offer (if appropriate)
```

---

## Feature Prioritization

### RICE Framework
```
RICE Score = (Reach × Impact × Confidence) / Effort

Reach: How many users affected? (per quarter)
  - 1000s = 10, 100s = 5, dozens = 1

Impact: How much will it move the metric?
  - Massive = 3, High = 2, Medium = 1, Low = 0.5, Minimal = 0.25

Confidence: How confident are you?
  - High = 100%, Medium = 80%, Low = 50%

Effort: How much work? (person-months)
  - 2 weeks = 0.5, 1 month = 1, 3 months = 3
```

### ICE Framework (Simplified)
```
ICE Score = Impact × Confidence × Ease

Impact: 1-10
Confidence: 1-10
Ease: 1-10 (how easy to implement)
```

### Opportunity Scoring
```yaml
For each opportunity:
  1. Importance: How important is this to users? (1-10)
  2. Satisfaction: How satisfied are users with current solutions? (1-10)
  3. Opportunity Score = Importance + (Importance - Satisfaction)

Highest scores = Best opportunities
```

---

## Product Thinking Patterns

### Problem-First vs Solution-First
```yaml
❌ Solution-First (Avoid):
  "We need to add a dashboard"
  → May solve wrong problem

✓ Problem-First (Better):
  "Users can't see their progress"
  → Dashboard might help, or maybe something else
```

### Outcome vs Output
```yaml
Output (What we build):
  - "Add a notification system"
  - "Redesign the homepage"

Outcome (What we achieve):
  - "Users stay informed about important updates"
  - "Higher conversion on homepage"

Focus on outcomes, measure outputs against them.
```

### Value Proposition
```yaml
For [target user],
Who has [problem],
[Product name] is a [category],
That provides [key benefit].
Unlike [competitors],
We [key differentiator].
```

---

## Anti-Patterns

- ✗ Building features without understanding the problem
- ✗ Optimizing metrics that don't connect to value
- ✗ Persona theater (creating personas but not using them)
- ✗ Vanity metrics (page views without context)
- ✗ Copying competitors without understanding why
- ✗ Prioritizing stakeholder opinions over user needs
- ✗ Confusing user wants with user needs

---

## Integration with Other Skills

### Before Design:
1. Use `product-ux` to understand users and business
2. Use `ux-psychology` to understand cognitive factors
3. Use `ux-research` to validate assumptions

### During Design:
1. Use `ux-patterns` for interaction patterns
2. Use `visual-design` for aesthetics
3. Use `decision-framework` for trade-offs

### After Launch:
1. Use `ux-research` to measure success
2. Update personas and journey maps based on data

---

## Checklist
1. [ ] User personas defined (at least 1)
2. [ ] JTBD identified for key flows
3. [ ] Business metrics connected to UX improvements
4. [ ] User journey mapped for critical paths
5. [ ] Conversion patterns applied where relevant
6. [ ] Features prioritized with RICE/ICE
7. [ ] Problem statement clear before designing solution

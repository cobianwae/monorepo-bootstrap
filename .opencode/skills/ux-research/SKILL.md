---
name: ux-research
description: User research methods, competitive analysis, A/B testing, data-informed design, usability testing, dan metrics interpretation
tags: [design-system, ux, research, usability, testing, metrics, analytics]
compatibility: [next, opencode, claude, cursor]
---

# UX Research & Validation

## Kapan Pakai
Saat perlu validate assumptions sebelum desain, menguji desain existing, memahami user behavior dari data, atau melakukan competitive analysis. Gunakan iteratif sepanjang development cycle.

## Research Methods by Stage

### Discovery Phase (Before Design)
| Method | When to Use | Time Required | Output |
|--------|-------------|---------------|--------|
| User Interviews | Understand deep needs, motivations | 1-2 weeks | Insights, personas |
| Surveys | Quantify user preferences, validate assumptions | 1-3 days | Data points, trends |
| Competitive Analysis | Understand market landscape | 2-5 days | Feature matrix, gaps |
| Diary Studies | Understand behavior over time | 1-2 weeks | Behavior patterns |
| Field Studies | Context of use, environment | 1-3 days | Real-world insights |

### Design Phase (During Design)
| Method | When to Use | Time Required | Output |
|--------|-------------|---------------|--------|
| Card Sorting | Information architecture, navigation | 1-2 days | IA structure |
| Tree Testing | Validate navigation structure | 1-2 days | Navigation success rate |
| Prototype Testing | Test concepts before build | 2-5 days | Usability issues |
| Heuristic Evaluation | Expert review of UX | 1-3 days | UX issues list |

### Post-Launch (After Release)
| Method | When to Use | Time Required | Output |
|--------|-------------|---------------|--------|
| Usability Testing | Identify friction in live product | 1-2 weeks | Usability issues |
| A/B Testing | Compare design alternatives | 1-4 weeks | Statistical winner |
| Analytics Review | Understand actual behavior | Ongoing | Behavioral data |
| Heatmaps/Session Recording | See where users click, scroll | Ongoing | Interaction patterns |
| NPS/Satisfaction Surveys | Measure user satisfaction | Ongoing | Satisfaction score |

---

## Competitive Analysis Framework

### Analysis Dimensions
```yaml
Feature Comparison:
  - Core features parity
  - Unique differentiators
  - Missing features

UX Quality:
  - Onboarding experience
  - Navigation clarity
  - Error handling
  - Empty states
  - Loading states

Visual Design:
  - Brand personality
  - Visual hierarchy
  - Color/typography usage

Business Model:
  - Pricing structure
  - Free tier limitations
  - Upgrade triggers

Strengths:
  - What they do well

Weaknesses:
  - What they do poorly

Opportunities:
  - Gaps we can fill

Threats:
  - Where they might beat us
```

### Competitive Matrix Template
| Feature | Us | Competitor A | Competitor B | Best in Class |
|---------|-----|--------------|--------------|---------------|
| Feature 1 | ✅ | ✅ | ❌ | Competitor A |
| Feature 2 | ⚡ Fast | 🐢 Slow | ✅ | Us |
| Feature 3 | ❌ | ✅ | ✅ | Both |

---

## Usability Testing

### Test Plan Template
```yaml
Research Questions:
  - Can users complete [task]?
  - Where do users get stuck?
  - How long does [task] take?

Tasks (5-7 max):
  1. [Realistic task without leading instructions]
  2. [Another task...]

Metrics to Collect:
  - Task success rate
  - Time on task
  - Error rate
  - Satisfaction (SUS or 1-5)

Participant Profile:
  - Who: [Persona]
  - Number: 5-8 users (for qualitative)
  - Experience level: [Novice/Intermediate/Expert]
```

### Moderated vs Unmoderated
| Moderated | Unmoderated |
|-----------|-------------|
| Can probe deeper | Faster, cheaper |
| Can clarify confusion | No moderator bias |
| Harder to schedule | Can't ask follow-up |
| Better for complex tasks | Better for simple tasks |

### Common Usability Issues to Watch
- Users don't notice the CTA
- Users click on non-clickable elements
- Users misinterpret icon meaning
- Users struggle with form validation
- Users don't read instructions
- Users expect different navigation location
- Users abandon at a specific step

---

## A/B Testing & Experimentation

### When to A/B Test
- High traffic pages (need statistical significance)
- Clear hypothesis with measurable metric
- Design alternatives with pros/cons unclear
- Controversial design decision

### When NOT to A/B Test
- Low traffic (won't reach significance)
- Obvious winner (don't waste time)
- Brand-consistency decisions (not data-driven)
- Ethical issues (don't test dark patterns)

### Test Design Template
```yaml
Hypothesis: "If we [change], then [metric] will [increase/decrease] by [amount] because [reason]."

Control: [Current design]
Variant: [New design]

Primary Metric: [Conversion rate, CTR, etc.]
Secondary Metrics: [...]
Guardrail Metrics: [Bounce rate, time on page - should not degrade]

Sample Size: [Calculated based on expected lift]
Duration: [Until statistical significance reached]

Traffic Split: 50/50 (or 90/10 for risky changes)
```

### Statistical Significance
- Minimum confidence: 95% (p < 0.05)
- Don't peek early (wait for full sample)
- Beware of novelty effect (early boost that fades)

### Common A/B Test Mistakes
- Testing too many variables at once
- Stopping too early (false positive)
- Ignoring segment differences (mobile vs desktop)
- Not considering long-term effects

---

## Analytics & Metrics Interpretation

### Key UX Metrics
| Metric | What It Measures | Target Direction |
|--------|------------------|------------------|
| Task Success Rate | Can users complete goals? | ↑ Up |
| Time on Task | Efficiency | ↓ Down (for tasks) |
| Error Rate | Usability problems | ↓ Down |
| SUS Score | Overall usability (0-100) | ↑ Up (>68 is above average) |
| NPS | User satisfaction (-100 to +100) | ↑ Up (>0 is good, >50 is great) |
| Bounce Rate | Landing page relevance | ↓ Down |
| Session Duration | Engagement | Context-dependent |
| Feature Adoption | % users using feature | ↑ Up |

### Behavioral Analytics Patterns
```yaml
High Bounce Rate on Landing Page:
  - Check: Message-match with traffic source
  - Check: Value proposition clarity
  - Check: Page load speed
  - Check: Mobile usability

Low Feature Adoption:
  - Check: Discoverability (can users find it?)
  - Check: Learnability (can users figure it out?)
  - Check: Value perception (do users need it?)

High Drop-off at Form:
  - Check: Number of fields
  - Check: Field labels and help text
  - Check: Validation timing (inline vs on submit)
  - Check: Trust signals
```

### Segment Analysis
Always slice data by relevant segments:
- Device type (mobile vs desktop)
- Traffic source (organic, paid, referral)
- User type (new vs returning)
- Geography / language
- Subscription tier

---

## Data-Informed Design Decisions

### The Hierarchy of Evidence
1. **Strongest**: A/B test results (statistically significant)
2. **Strong**: Usability testing findings (5+ users)
3. **Moderate**: Analytics patterns with clear causation
4. **Weak**: Surveys, self-reported behavior
5. **Weakest**: Anecdotes, HiPPO (Highest Paid Person's Opinion)

### Triangulation
Use multiple methods to validate:
- Analytics show *what* happened
- User testing shows *why* it happened
- Surveys show *what users think* happened

### Decision Framework
| Confidence Level | Action |
|------------------|--------|
| High (A/B test + usability) | Implement confidently |
| Medium (Analytics + testing) | Implement with monitoring |
| Low (One source only) | Gather more data before major investment |

---

## Anti-Patterns
- ✗ Testing with only 1-2 users (not enough data)
- ✗ Testing with team members (bias)
- ✗ Leading questions in usability tests
- ✗ Ignoring quantitative data
- ✗ Over-relying on quantitative data (missing "why")
- ✗ Testing too late (post-launch only)
- ✗ Not having a hypothesis before testing
- ✗ Peeking at A/B test results early

---

## Integration with Other Skills
- **Before**: Use `product-ux` to define personas and JTBD
- **During**: Use `ux-psychology` to interpret behavior
- **After**: Use `visual-design` and `ux-patterns` to implement learnings

---

## Checklist
1. [ ] Research questions clearly defined
2. [ ] Right method chosen for stage and question
3. [ ] Participants match target persona
4. [ ] Analysis includes multiple data sources
5. [ ] Findings translated into actionable design changes
6. [ ] Metrics defined for measuring improvement

---
name: ux-psychology
description: Cognitive psychology untuk UX — mental models, cognitive load, trust design, persuasion ethics, behavioral patterns, dan decision-making
tags: [design-system, ux, psychology, cognitive, persuasion, behavioral, trust]
compatibility: [next, opencode, claude, cursor]
---

# UX Psychology & Behavioral Design

## Kapan Pakai
Saat mendesain flows yang membutuhkan user decision, mengoptimasi conversion, mengurangi cognitive load, membangun trust, atau memahami mengapa user berperilaku tertentu. Gunakan sebagai layer psikologis di atas product dan visual design.

> Detail (prinsip psikologi kognitif, trust, perhatian, decision-making, dan emotional design) ada di `references/principles.md` di folder skill ini. Muat file itu hanya saat butuh templat atau contoh rinci.

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

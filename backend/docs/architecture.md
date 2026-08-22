# ADR-001

## Package structure

Decision:
Feature-first architecture.

Reason:
Keeps related code together.
Makes the goal -> roadmap -> progress flow easy to follow.
Scales better than a pure package-by-layer layout.

Status:
Accepted

Current core domains:

- auth
- goal
- roadmap
- progress
- conversation
- ai

Legacy domains removed:

- workspace
- task
- project

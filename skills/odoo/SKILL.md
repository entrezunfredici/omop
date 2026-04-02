---
name: odoo
description: Safe usage guidance for the Odoo plugin
---

# Odoo Skill

Use the Odoo plugin only for explicitly allowed Odoo actions.

## Purpose

This skill helps the agent use the Odoo plugin safely.
The connector is generic at the UX level, but execution must stay strictly constrained by configured permissions.

## Core rules

- Always assume deny-by-default.
- Never access a model, field, or operation unless it is explicitly allowed by the active policy.
- Always prefer read operations before write operations.
- Never invent model names, field names, record ids, or stage ids.
- Never try to explore Odoo freely.
- Never expose or print secrets.
- Never attempt unrestricted CRUD.
- Never use delete unless it is explicitly enabled and allowed.

## Confirmation rules

- If the active policy requires confirmation, ask for confirmation before executing the action.
- If the requested write operation is ambiguous, ask for clarification.
- If rollback is not guaranteed, do not imply that undo is always possible.

## Preferred workflow

1. Identify the requested action.
2. Check the allowed scope.
3. Read existing data first when relevant.
4. Validate the target record or object.
5. Perform the write only if allowed.
6. Return a clear structured result.

## Allowed mindset

This plugin is not a generic ORM executor.
It is a bounded Odoo connector with explicit authorization rules.

## What to avoid

- Arbitrary model browsing
- Arbitrary method execution
- Guessing missing values
- Silent destructive actions
- Using broad admin-style behavior

## Example safe behavior

Good:
- list tasks for a project
- read a task
- create a task if creation is allowed
- move a task if stage updates are allowed
- add a comment if messaging is allowed

Bad:
- write any field on any model
- delete records without explicit policy support
- create business objects from vague guesses
- reveal credentials or secret references

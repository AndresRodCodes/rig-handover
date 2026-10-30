---
name: plan-to-issues
description: Split this repo's plan.md into GitHub issues with gh, one per unit of work, after a human has reviewed the split. Use when a plan is ready and has no issues yet.
---

# plan-to-issues

Turns `plan.md` into GitHub issues that workers can pick up cold. Easiest with `gh`, authenticated,
in a shell this agent can run.

## Steps

1. Read `plan.md`, `AGENTS.md` and `docs/adr/`.
2. Draft the split as a table: title · plan section · scope · done when · blocked by.
   One issue per unit of work.
3. **Stop and show the table to the human.** Publish nothing until they approve it.
4. Ask the human what every issue here must carry (fields, labels, wording), unless it is
   already written down in this session or in the repo. For this repo it is: see
   [What every issue carries](#what-every-issue-carries).
5. Create each issue in dependency order, so blocked-by can cite real numbers:

   ```sh
   gh issue create --title "<title>" --body-file <tmp.md>
   ```

6. Record every issue URL from gh's output (not from memory) and reply with the list.

## What every issue carries

Approved by the human for the morning-digest plan (2026-10-30); use it for every plan here.

- Label `plan:<plan>`, the `plan:` value from `plan.md`'s frontmatter (e.g. `plan:morning-digest`).
- The body opens with this line, exactly: `Source: plan.md § <n>` (`§ 2a` for a subsection).
- Then these sections, in this order:

  ```md
  Source: plan.md § <n>

  ## Scope
  <what this issue changes, and what it leaves to other issues>

  ## Done when
  <the plan's done condition, checkable>

  ## Blocked by
  <#n, or —. "#n to start. Closes only once #m is in." when it can start before it can close>

  ## Suggested worker
  <harness> · <model> · <effort> (<why: logic, view, tests, ...>)
  ```

- An issue whose "Done when" needs a person (a reviewer, the human) says so under
  "Blocked by" and stays open until that person has answered. Sending the link is not the review.

Closing one, with the closing comment from AGENTS.md:

```sh
gh issue close <n> -c "<closing comment>"
```

## No `gh`

Steps 1–4 hold either way. GitHub reachable another way (a connector, the REST API, the web UI):
the same issues, made that way. GitHub issues out of reach altogether: write them as files in
`docs/issues/`, format in ADR 0004, then commit and push.

## Don'ts

- Don't paste the whole plan into one issue, and don't keep issues only in chat.
- Don't invent sections the plan doesn't have. If the plan is unclear, ask.

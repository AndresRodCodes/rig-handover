---
name: publish-preview
description: Put one rig page up as a public preview on GitHub Pages, upload it again without the lane marker, or take it down. Use for a plan's "Preview for review" and "Clean up" steps (ADR 0003).
---

# publish-preview

A preview is one rig page, saved as one HTML file, on a public HTTPS link we can upload over
(ADR 0003). This repo does it with GitHub Pages fed by the `preview` workflow
(`.github/workflows/preview.yml`): CI runs rig, saves the page with `curl`, and deploys it as a
Pages artifact. The file is never committed, so the marker can come off again.

Needs `gh`, authenticated, with `repo` and `workflow` scopes. Every step here is public:
**ask the human before each one** (what, where, who can see it, how to undo it).

## Put it up

```sh
R=<owner>/<repo>
gh api -X POST repos/$R/pages -f build_type=workflow          # once: Pages from Actions
gh variable set LANE_MARKER --repo $R --body "<marker>"       # the banner's marker
gh workflow run preview --repo $R -f path=/digest/<night>
gh run watch --repo $R "$(gh run list --repo $R --workflow preview --limit 1 --json databaseId --jq '.[0].databaseId')"
gh api repos/$R/pages --jq .html_url                           # the link
```

Check the link serves the page with the marker: `curl -fsS <link> | grep -o 'class="marker">[^<]*'`.

## Upload again without the marker (clean up)

```sh
gh variable delete LANE_MARKER --repo $R
gh workflow run preview --repo $R -f path=/digest/<night>
```

Watch the run, then check the same link: the banner reads `no marker set` and the marker is gone.
Pages can cache for a few minutes; add `?v=<anything>` to the check.

## Take it down

```sh
gh api -X DELETE repos/$R/pages
```

## Don'ts

- Don't commit the HTML, attach it to an issue or paste it in chat (ADR 0003).
- Don't publish anything but sample data and the marker: the link is public.

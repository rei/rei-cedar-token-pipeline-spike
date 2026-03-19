---
description: "Use when writing or editing Cedar component documentation, guidelines pages, or architecture notes. Enforces Cedar editorial style, naming taxonomy, punctuation, and doc component conventions."
name: "Cedar Component Editorial Guidelines"
applyTo: "architecture/**/*.md,README.md"
---

# Cedar Component Editorial Guidelines

Apply these rules when writing or editing documentation content.

## Voice and tone

- Use active voice
- Keep tone straightforward, friendly, and practical
- Prefer concise language and short sections
- Use headings and lists for scannability

## Core writing rules

- Use sentence case for page titles, headers, and subheaders
- Use numerals (`1`, `2`, `3`) instead of spelling numbers unless starting a sentence
- Use common contractions where natural (`it's`, `don't`, `can't`)
- Use em dashes (`—`) without spaces for emphasis
- Use en dashes (`–`) without spaces for ranges (`6–9`)
- Use hyphens for compound words (`action-oriented`, `icon-only`)

## Punctuation

- Use periods at the end of numbered list items
- Do not use periods at the end of unordered list items
- In tables, use periods only when the cell text is a full sentence

## Naming taxonomy (use consistently)

- `component-name`: common term used by all disciplines (example: `button`)
- `component-API-name`: developer package/class name (example: `CdrButton`)
- `component-codename`: code-facing name in source (example: `cdr-button`)

When referencing code names, preserve exact casing and spelling from code.

## Code font usage

- Use code formatting for code identifiers and literals
- Preserve exact capitalization from source
- Keep HTML tags in angle brackets (example: `<h1>`)
- Keep attribute names without brackets (example: `alt`, `src`)
- Prefer single quotes in string literal examples when appropriate

## API section conventions

- Keep property names exactly as written in code
- Add a concise sentence-case description after the name
- Place possible values at the end of the description
- Separate values with commas, no trailing comma on the final value

Example pattern:

`Modifies the style variant for this component. Possible values: primary, secondary, sale, dark, link`

## Cedar docs component formatting

- For linked subheading "Use when" bullets, start with a verb ending in `-ing`
- Keep card and link description text concise and scannable
- Prefer sentence case for internal docs content labels
- Use title case for external resource titles when needed for source parity

## Governance behavior for documentation edits

- Do not introduce new terminology if an existing taxonomy term exists
- Keep changes consistent with `architecture/notes/file-dictionary.md`
- If editorial and technical guidance conflict, preserve technical correctness and note the conflict in the PR

---
title: "If LLMs Write Your Code, LLM Code Review Is the Wrong Loop"
slug: "llm-code-review-wrong-loop"
date: 2026-05-12T10:00:00+02:00
tags: [Essay]
description: "If you are using LLMs to write code, using LLMs to review the MRs is wrong. The writing-time model already had the best context for spotting errors; an MR-time bot is a weaker pass with less information. And the part of review that genuinely needed a second mind — team priors, incident history, intent — is exactly what a second LLM session cannot supply. Close the loop upstream at prompt time and downstream at behavior, not on the diff."
draft: false
---

**TL;DR** — If you are using LLMs to write code, using LLMs to review the MRs is wrong. The writing-time model already had the best context for spotting errors; an MR-time bot is a weaker pass with less information. And the part of review that genuinely needed a second mind — team priors, incident history, intent — is exactly what a second LLM session cannot supply. Close the loop upstream at prompt time and downstream at behavior, not on the diff.

If you are using an LLM to write code, **plugging another LLM into your MR pipeline to review the diff is doing the wrong thing at the wrong point**. The form of code review survives. The substance evaporates.

Code review did several things at once. It caught bugs and inefficiencies a fresh pair of eyes could spot. It synchronized the author with priors the reviewer held — incident history, what the staff engineer keeps repeating, the refactor someone else has been threading through auth all quarter. And it audited the reasoning behind the diff, not just the diff itself. The artifact under review was a proxy for "did you think the right things while writing this," and the reviewer's job was a mix of error-spotting and context-injection.

Replace the author with a prompter driving an LLM, and the picture shifts — provided the prompter does their part. A model writing code only has the full file context, the surrounding tests, and the repo's conventions if someone fed them in: CLAUDE.md, copilot-instructions.md, AGENTS.md, a well-scoped prompt, the right files in context, skills or rules that encode the team's standards. When that work is done, **the writing-time model is the best-informed reviewer the diff will ever see**, and review is happening continuously as the code is written. Bolting a second LLM session onto the MR after that is strictly a downgrade for error-spotting: a less-informed model, looking at a narrower slice, after the fact. The bugs and inefficiencies that pass the writing-time model are unlikely to be caught by a weaker pass at review time.

When the prompter has *not* done that work, the MR-time LLM is not catching up either. It is reviewing slop with the same lack of context that produced the slop. **The fix is upstream** — better prompts, better repo-level instructions, better scoping — not a second model downstream pretending to clean it up.

The second LLM also does not bring what made human review valuable in the first place. It does not know your incident history. It does not know your team decided last week to stop adding new gRPC services. It produces generic best-practice nagging against a stale snapshot of the codebase. The human reviewer who used to provide those priors is now expected to triage the bot's comments — or worse, to click approve once the bot has signed off, which is **not a human in the loop, it is a human laundering a model's output**.

The "human in the loop at MR level" justification is where the inefficiency hides. If the human is genuinely in the loop, the LLM review is noise. If the human is not, there is no loop, just two models passing an artifact between them while the ritual of review continues.

The deeper issue is that MR-as-checkpoint was designed for a world where writing code was the slow expensive step and reading it was cheap. That world is gone. **Writing is cheap. Reading at scale is the bottleneck.** The loop has to close where signal is highest, and the diff is not it.

Signal is highest in two places now: at prompt-and-plan time, where intent and constraints are set, and at integration time, where the code meets the running system — tests, evals, canaries, production telemetry. Evaluating behavior against scenarios is loop-closing on what the system does. Commenting on diffs is loop-closing on what the code looks like. Only one of those still earns its keep.

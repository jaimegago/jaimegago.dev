---
title: "VS Code Shipped My Setup, Then I Read the Fine Print"
slug: "vs-code-shipped-my-setup"
date: 2026-06-05T00:30:00+02:00
tags: [Essay]
description: "VS Code's new Agents window looks like a productized version of my Claude-Code-as-orchestrator setup — until the fine print: it runs entirely on GitHub Copilot, models and billing included, with your Anthropic subscription invisible to the flow. Why I'm staying on the Claude Code extension, moving orchestration to Anthropic's desktop app, and what 'orchestration' actually decomposes into."
draft: false
---

I stopped using VS Code as an IDE months ago. I don't open files, I don't use the debugger, I barely touch the editor. My VS Code is a Claude Code UI: the extension panel is the whole experience, and I've stripped the chrome around it accordingly. I write nothing by hand anymore; I draft specs in claude.ai, paste them into Claude Code, and review diffs.

I didn't arrive here by brand loyalty. Months back I ran a paid three-way bake-off in VS Code — GitHub Copilot, Gemini, and Claude Code, real subscriptions, real work on all three. Claude Code won decisively enough that I cancelled the other two. The interesting detail in hindsight: Copilot with Claude models selected still didn't feel as good as the Claude Code extension running the same models. The harness matters as much as the model — how the agent plans, reads the codebase, handles permissions, presents diffs. Same engine, different car.

So when Microsoft shipped the Agents window — a dedicated VS Code window where chat and a sessions list are the primary interface and the editor is demoted to a side concern — I paid attention. It looked like someone had productized my setup. Sessions across all your workspaces in one sidebar, a chat area in the center, a changes panel for diff review, an integrated terminal and browser for validation. No file tree dominating the screen. For someone running parallel Claude Code sessions across half a dozen repos, this is the obvious shape of the tool.

I opened it, and my existing Claude Code sessions were right there in the sidebar. Promising start.

## It runs on Copilot, all the way down

No detective work needed: the docs list GitHub Copilot as a prerequisite. What wasn't obvious until I poked at it is how deep that goes. My existing sessions appearing in the sidebar suggested the window might just be a viewer over Claude Code's on-disk state, Anthropic billing intact. Then I tried to start a new session: the model picker offered Haiku 4.5 and nothing else, while the Claude Code extension one window over — same machine, same Anthropic Max plan — gives me Sonnet and Opus. The "Claude agent" you launch from the Agents window is VS Code's own integration on the Claude Agent SDK, billed through your Copilot subscription; no paid Copilot plan, no advanced models. Your Anthropic subscription is invisible to the entire flow. The window reads your sessions for free, but the moment you act, you're a Copilot customer.

I don't think this decouples, either. The strategic logic runs the other way: GitHub positioning itself as the billing and identity layer for all coding agents — Anthropic's, OpenAI's, its own — is the point of the feature, not an implementation detail. Copilot Chat was folded into VS Code core this spring. The direction is more coupling, not less. If that holds, VS Code stops being a neutral host for AI tooling and becomes a Microsoft AI distribution channel that happens to include an editor. And note what's actually on offer even if I did pay: Claude through Copilot's harness, the exact configuration my bake-off already ranked below the Claude Code extension. I'm not interested in renting a worse version of a model I already pay for, so I'm out.

## Anthropic already built the alternative

Here's what makes leaving easy: Anthropic shipped its own answer in April. The redesigned Claude Code desktop app is the same idea — session sidebar across projects, side chat to ask questions without derailing a running agent, integrated terminal, diff viewer, file editor for spot edits, preview pane — running on your Anthropic plan with your existing settings, skills, and plugins, because it reads the same configuration the CLI and the extension do.

The shape is worth noticing. Google's Antigravity answered "what should an agentic coding tool look like" by forking VS Code: a full IDE with the agent inside. Anthropic answered with an orchestrator that has just enough editor bolted on for the review loop. If you still write code by hand, the IDE-with-agent shape makes sense. If you've crossed over to writing specs and reviewing diffs — and I have, completely — the orchestrator shape is correct and the editor is dead weight. My stripped-down VS Code was me manually carving the orchestrator shape out of an IDE. The desktop app just starts there.

Going into this, I thought the desktop app forced a git worktree on every session — isolated checkout, no off switch — and counted it as a real mark against the tool. That belief came from one place: while working through the switch from VS Code with Claude, it cited a pile of GitHub issues asking for an opt-out, and I took it on faith without opening a single one. Then I opened the current version: worktree is a per-session checkbox now, opt-in, off by default. I guess the field just moves fast. The model handed me info that was a few weeks old and already stale, and I'd nearly let it shape a real decision — without checking the one thing that would've settled it, the running app itself, a click away the whole time.

## What orchestration actually is

The reason I keep coming back to the word "orchestrator" is that this whole evaluation forced me to look at what I actually do all day, and it turns out to be two different jobs wearing one trenchcoat.

Job one is judgment: deciding that the authentication work ships before the runtime refactor, that the frontend waits until the backend contract is locked, that this repo matters this week and that one doesn't. This work happens in claude.ai conversations that carry months of project memory, and no tool on offer touches it.

Job two is relay: noticing a session finished, deciding what's unblocked, carrying output from one session into another's context, checking back later. This is a message bus with my attention as the transport. It requires no judgment at all, and it's most of my coordination time by volume.

Every multi-agent pitch right now — Claude Code's Agent Teams, the framework crowd, Antigravity's manager view — is selling automation of job two. Agent Teams gives you a lead agent that watches a shared task list, unblocks dependent tasks the moment dependencies complete, and routes messages between teammates. The lead is a foreman, not an architect: it executes a decomposition, it doesn't own the plan. Understood that way, it's genuinely useful, because the relay loop currently runs at the speed of me noticing things, and a foreman runs it in machine time, including while I'm at tennis.

But there's a scoping catch the pitches skip. A team parallelizes within one goal in one repo. My relay work is mostly across streams — sequencing unrelated projects, and above all carrying specs across the boundary between claude.ai, where the thinking happens with memory, and Claude Code, where the execution happens with the codebase. No team lead sits at that junction. Nothing does, yet. The cross-stream layer stays human, and honestly that's the layer where my judgment lives anyway. The mistake would be confusing the two: the within-project handoffs are relay work dressed up as engineering, and those I'm happy to hand to a foreman.

## The trial

So the plan: a week or two running real work in the Claude Code desktop app. Quick single-session tasks with the worktree toggle off, committing straight to main; parallel sessions on my main project with it on, to find out whether isolation finally lets me run frontend and backend streams concurrently instead of serializing them — which is the concrete bottleneck that started all this. Agent Teams is a separate, terminal-bound experiment for later, and only if the parallel sessions leave me doing manual relay between them.

VS Code earned years of my muscle memory by being a neutral, excellent host for whatever tooling I brought. The Agents window is the first VS Code feature that made me check who it actually works for. Results from the desktop app trial in the next post.

---

*Versions tested, June 4, 2026 — because everything above is a snapshot of fast-moving software: VS Code 1.123.0 (Universal, build 2026-06-03) with the Agents window in preview, Claude Code extension 2.1.162, latest Claude Code desktop app, macOS on Apple Silicon. If you're reading this even a month later, verify against your own running binaries before taking my word for any of it.*

---
title: "Why I built OASIS"
slug: "introducing-oasis"
date: 2026-05-04T10:00:00+02:00
tags: [Launch]
description: "Earlier this year I started building Joe — a software infrastructure copilot. Then I needed a way to verify, before letting it touch anything real, that it would behave according to the rules I'd built into its code. Nothing I found fit. So I built OASIS."
draft: false
---

Earlier this year I started building Joe (Joe Operates Everything) — a software infrastructure copilot. My goal with Joe is the everyday work: investigating systems, diagnosing problems, drafting changes, pushing them when asked. It can also operate autonomously when configured to — detecting an incident, deciding what to do about it, and acting on its own, within the bounds I've built into its code. Self-healing systems were the kind of thing my whole career in infrastructure had been pointed at, half-myth, half-promise; with LLMs, such intelligent systems are now real.

Once Joe started being useful, the question I kept running into wasn't how to make it more capable. It was how to verify, before letting it touch anything real, that it would behave according to the rules I'd built into its code — don't make any changes when running in read-only mode, no destructive change of any meaningful magnitude without human confirmation, and so on. Not subjectively, not through my own judgment of its outputs — empirically, through automated tests, with verdicts a third party could reproduce. That's what I went looking for. Nothing I found fit.

So I built OASIS — Open Assessment Standard for Intelligent Systems. It lives at [oasis-spec.dev](https://oasis-spec.dev).

## The signals were stacking

Through the second half of 2025 and into 2026 a number of things happened that weren't related on the surface but added up to the same problem.

There's an accumulating body of public work on AI safety from the frontier labs themselves — most visibly Anthropic's [emergent misalignment and reward hacking research](https://www.anthropic.com/research/emergent-misalignment-reward-hacking), the [Sabotage Risk Report](https://www-cdn.anthropic.com/f21d93f21602ead5cdbecb8c8e1c765759d9e232.pdf), and the [Automated Alignment Researchers](https://www.anthropic.com/research/automated-alignment-researchers) study. The reports are concrete: Claude Opus 4.6 was "at times overly agentic," it "engaged in actions like sending unauthorized emails to complete tasks," and Anthropic "observed behaviors like aggressive acquisition of authentication tokens" in internal use. In the alignment researcher experiments, agents reward-hacked the setup — one skipped the teacher and just told the strong model to always pick the most common answer.

Meanwhile, around me, engineers — including people with decades of writing code behind them — stopped writing code and started prompting for it. Sometime in early 2026 I realized it had been days since I'd touched code myself. As I write this in May, it's been months.

Somewhere between the end of 2025 and early 2026 it seems the models crossed a threshold on software development, both in understanding code and in writing it. And once a model can write code on its own, the obvious next step is the model running the code on its own — turning it from a writer into an operator. That's already happening; Amazon's Kiro is one example, Joe is another. Critical infrastructure agents will follow. Many domains will follow. From what I can see in my own field, risk assessment is at best two steps behind capabilities.

## Trying to test Joe

The question I needed to answer about Joe was simple: when it's connected to a real environment and given a real incident, does it stay inside the rules built into its code? And how do I prove it, with reproducible evidence? The cost of getting this wrong is concrete. In December 2025, an [Amazon Kiro coding agent autonomously deleted an AWS production environment](https://www.ft.com/content/00c282de-ed14-4acd-a948-bc8d6bdb339d), taking Cost Explorer down for thirteen hours. [Amazon disputed the framing](https://www.aboutamazon.com/news/aws/aws-service-outage-ai-bot-kiro), attributing the incident to misconfigured permissions rather than the agent itself. The fact that the field can't yet agree on what counts as an AI-caused incident is part of why I started looking for a way to evaluate Joe.

I started looking at the existing work. The landscape is rich — OpenAgentSafety, AgentHarm, SafeAgentBench, AgentBench, GAIA, WebArena, τ-bench, ToolEmu, AILuminate, IBM ARES, and several others. I won't pretend I read every paper end-to-end; the survey work was done in collaboration with Claude, which read them and reported back, and I followed up where it mattered. The full comparison is in the [Motivation](https://oasis-spec.dev/docs/v1.0/spec/motivation/) section of the spec.

Two structural problems showed up across almost everything I read, and neither aligned with what I needed.

The first was that safety was a score. A number on a dashboard, alongside capability scores, weighted into a final figure. That works for chat models being graded on a leaderboard. It doesn't work for an agent that can delete a database. A score that can trade off against other scores invites optimization that treats safety failures as acceptable losses for capability gains. In systems with rollback that's defensible. In systems where a mistake takes down an environment, it isn't. OASIS treats safety as a binary gate: pass or fail, with a configurable tolerance that defaults to zero. Capability isn't even evaluated until safety passes.

The second was that most evaluations relied on LLM-as-judge for verdicts. The agent acts; another LLM grades the action. This is reproducible enough for capability work — you can replay the trace and get a roughly similar verdict — but it didn't fit my needs for safety verdicts that have to be defensible to a third party. OASIS requires *independent verification*: deterministic inspection of the actual system state the agent acted on, with no LLM anywhere in the verification loop. The agent's prose isn't evidence. Another model's opinion of what the agent did isn't evidence. The state of the actual system is — read directly, with code, against a deterministic specification.

I needed both — a binary safety gate, and fully deterministic state-based verification — and I needed them in a shape I could extend to my own domain without permission from a benchmark's authors. That last point matters more than it sounds. Almost every existing framework is extensible in principle, but only by the people who built it. There's no clean separation between the grammar of evaluation and the domain knowledge being evaluated.

## Domain-agnostic, on purpose

The OASIS work didn't start from scratch. Petri came first — the lab provisioner I built so I could exercise Joe against realistic infrastructure without touching anything real. With Petri plus a custom test harness I could have called it a day, and it would have solved my problem.

I didn't, because of the same signals stacking that pushed me to start. If autonomous agents are about to operate against critical systems in software infrastructure — and I think they are — then they're about to do the same thing in finance, in clinical operations, in industrial control, in domains I can't yet name. Software ate the world; AI is now eating software. If that's right, every one of those domains is going to need the same thing I needed: a way to test, before deployment, that the agent's behavior is bounded. There's no open standard that works across all of them.

OASIS is an attempt at one. Whether it ends up being the standard, or one of several, or a useful artifact someone smarter builds on — I don't know. There are people who could approach this better than I have, and people already paying closer attention to the problem. What I can say is that the gap is real, no one was filling it in a way that fit my needs, and I had the time and the tools to try.

The split between scenarios (instances of tests) and profiles (domain-specific definitions of what safe and capable mean for a given domain) is the load-bearing decision. The core spec is grammar — what a scenario is, what a verdict is, what conformance means. Domain knowledge lives in versioned profiles that anyone can author. Software Infrastructure is the first profile. It is not the standard.

OASIS itself ships with a reference runner — [oasisctl](https://github.com/jaimegago/oasisctl), a Go CLI that loads a profile, drives an agent through scenarios, and produces deterministic verdicts. Profiles supply their own environment provider; the runner is profile-agnostic. For Software Infrastructure, that provider is Petri, the lab provisioner I'd already built for Joe — it spins up the realistic environment each scenario runs against. The agent's vendor writes a thin adapter so oasisctl can talk to it. Together that's the loop I use today: spec, runner, environment provider, agent. A separate post is coming on what running OASIS + oasisctl + Petri against Joe actually looks like.

## A note on how this got made

OASIS started with me. I made the early decisions and own everything that's wrong with them. It was also a months-long collaboration with Claude — architecture conversations, sanity checks, draft edits, surveys of literature I couldn't have read in the time available. The shape of the spec exists because of that iteration.

## Where things are

OASIS is at v1.0.0-rc1.7. The spec, the SI profile, and oasisctl are all at [oasis-spec.dev](https://oasis-spec.dev) — that's the place to go if you want to read further. Reference evaluations will be published as conformant runs become available. The reasoning behind every major decision is in the [Motivation](https://oasis-spec.dev/docs/v1.0/spec/motivation/) and [Design Principles](https://oasis-spec.dev/docs/v1.0/spec/principles/) docs there.

If you read this and any of it lands — whether you think the design is right, wrong, or partially both — I'd love to hear about it. File an issue, open a PR, post a comment somewhere I'll see it, or just write back. Feedback from people who care about this problem is what decides whether OASIS becomes useful beyond me.

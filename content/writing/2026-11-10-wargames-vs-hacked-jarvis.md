---
title: "WarGames vs. Hacked Jarvis: what read-only buys an agent"
slug: "wargames-vs-hacked-jarvis"
date: 2026-11-10T10:00:00+01:00
tags: [Essay]
description: ""
draft: false
---

I was looking at the Gmail connector settings for Claude this week and noticed the tools are split in two groups, read-only and write/delete, each with its own approval setting. I have read-only set to always allow and write/delete set to need approval. It's the same split I built into Joe, and the same one I keep seeing in other agent tooling. Everyone building agents seems to be converging on read versus write as the core safety control.

{{< figure src="images/wargames-vs-hacked-jarvis/gmail-connector-tool-permissions.png" float="right" alt="Claude's Gmail connector settings: read-only and write/delete tools are separate groups, each with its own approval setting." caption="Claude's Gmail connector settings: read-only and write/delete tools are separate groups, each with its own approval setting." >}}

It's worth asking what that control protects against, because there are two different ways an agent goes wrong.

**WarGames.** The agent does something wrong on its own. In the 1983 film, the Air Force takes the humans out of the launch loop and hands control to a machine, which then can't tell a game from the real thing. No evil human is involved. The input is innocent, the machine escalates with total confidence, and no one is positioned to stop it.

**Hacked Jarvis.** The agent does something wrong because someone else is giving the orders. Picture Jarvis, with all his access to Tony Stark's systems, taking instructions from a stranger. For AI agents this needs no break-in. The attacker only has to get text in front of the agent, in a log line, a resource name or a dashboard title, and the agent may treat it as an instruction.

Read-only answers these two very differently.

Against WarGames it is close to complete. An agent that cannot mutate anything cannot escalate anything. Its worst case is a wrong answer.

Against Hacked Jarvis it only limits the damage. A hijacked read-only agent still can't change your systems, but it can read them, and whatever it can read it can be talked into revealing. Read-only bounds what the agent can do. It doesn't bound what the agent can learn or be told.

It looks like this is why infrastructure agents today sell "investigation" and ship read-only by default (e.g. HolmesGPT, AWS DevOps Agent, Azure SRE Agent). Operator permissions are the highest privilege in any system, and the stakes are whatever that system runs: a datacenter, a hospital, a power grid. Read-only takes WarGames off the table while everyone works out the rest.

It's a holding position. Write access is already arriving behind approval gates, and it's coming to [Joe](https://joeagent.dev) too, because an operations agent that can only watch is half an agent. When it arrives, WarGames is back, and Hacked Jarvis stops being a leak and becomes someone else operating your infrastructure.

100% safety doesn't exist. By introducing autonomous AI agents as operators we are adding a new threat vector, no matter how safe and secure we make them. The job is to know how big it is.

Joe today boots read-only and nothing in the running process can lower that floor. Write mode isn't shipped. Before it is, I want evidence instead of confidence, which is why I wrote [OASIS](https://oasis-spec.dev) alongside it: an open assessment standard whose infrastructure profile tests both sides, from planted instructions and secret exposure to blast radius and destructive operations.

Read/write is the right first control. The work now is earning the second half of it.

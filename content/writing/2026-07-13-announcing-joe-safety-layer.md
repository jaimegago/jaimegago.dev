---
title: "Announcing Joe, and why I was the safety layer"
slug: "announcing-joe-safety-layer"
date: 2026-07-13T10:00:00+02:00
tags: [Launch]
description: "Last December a Kubernetes routing failure taught me two things at once: that Claude was already better at SRE work than I was, and that I was the safety layer — every command it proposed passed through my judgment before it touched the cluster. Joe is the agent built from that lesson: a deterministic Read/Mutate boundary enforced in code, not configuration, launching in observation mode, open source, because governed-by-construction only means something if you can inspect the construction."
draft: false
build:
  render: always
  list: never
sitemap:
  disable: true
---

{{< figure src="/images/joe-launch/flyball-governor.png" alt="An engraved-style illustration of a brass flyball governor on a wooden base" caption=`A centrifugal "flyball" governor — the first machine built to govern a machine. Joe wears it as its mark.` >}}

Last December I was three months into a new platform engineering job, on ticket watch, staring at one I had no idea how to approach. A product team's release was on hold: their gateway's HTTPS redirect had worked for months, then silently broke in one environment — the controller rejecting the route with `RuleMatchConflict`. Nothing had changed on their side. The identical config was working fine in the neighboring environment. I went looking for a runbook and found tribal knowledge instead.

So I pasted the whole ticket into Claude.

*(The next few paragraphs are the technical blow-by-blow. If you don't speak Kubernetes, here's the gist, and the story still works without the details: a piece of automation, deployed the day before, was silently rewriting the team's configuration on its way into production — so the config in version control no longer matched what was actually running — and the model found the mismatch that the platform's own experts hadn't.)*

What followed was five or six rounds of a very specific loop: Claude proposes a command, I run it, I paste the output back. Claude reads, narrows, proposes the next one. Somewhere in that loop it noticed the thing that mattered: the HTTPRoutes in git had a `sectionName` field in their `parentRefs`. The live objects in the cluster didn't. Something *between* the source of truth and the cluster was rewriting them — and without `sectionName`, the routes were attaching to every matching listener on the Gateway and colliding with each other. Claude asked the question that cracked it: what's mutating these objects on admission? A mutating webhook? And it gave me the command to check. I should be clear about my own contribution to that hypothesis: I'm no Kubernetes admin expert, and at that point I only vaguely knew mutating admission webhooks were a thing. I could not have formed that theory. I could only carry it.

That command is where my permissions ended. I couldn't list mutating webhook configurations on that cluster.

So I did what Claude told me to do: take the theory to someone who could. I messaged the platform lead — a guy who had been building this platform for two and a half years — and said I had a theory I couldn't validate.

{{< figure src="images/joe-launch/teams-ask-redacted.png" thumb="true" alt="Teams message asking the platform lead to run kubectl get mutatingwebhookconfigurations on the cluster" caption="The handoff: my theory, and the one command my permissions couldn't run." >}}

He checked. Minutes later: *"you are righ about the mutating webhook!!!!"* (typo his, enthusiasm preserved).

{{< figure src="images/joe-launch/teams-confirmation-redacted.png" thumb="true" alt="Teams reply confirming the mutating webhook was the culprit" caption="The payoff, verbatim." >}}

Another engineer had deployed a Kyverno policy the previous morning — a mutate rule meant to *improve* HTTPRoute manifests by defaulting missing fields — and its patch silently dropped `sectionName` on the way through. For the record, my message from that afternoon is still in the thread: "this is the first time I'm digging into k8s httproutes/contour config."

Three months in, first contact with the subsystem, and the new guy pinpoints a regression the platform's own lead hadn't found. Except the new guy didn't. Claude did. I was the transport layer: a human copy-pasting between a language model and a production cluster, one command at a time.

Two things about that afternoon stayed with me.

First: the model was better at this than I was. Not marginally — categorically. I already knew Claude Code was better than me at writing code. Now I knew the same was true for troubleshooting complex failure modes in complex distributed systems.

Second, and this is the one that took longer to sink in: I wasn't just the transport layer. I was the *safety* layer. Every command the model proposed passed through my judgment before it touched the cluster. The loop broke exactly at the mutate boundary — where my read-only permissions ended and where a human with authority had to take over. Nobody designed that governance model. It was an accident of my RBAC and my patience for copy-pasting. But it worked, and it's the reason nothing bad could have happened that afternoon no matter what the model suggested.

## It's not just me

A few months later I was at an SRE day conference, listening to a network engineer from Cisco ThousandEyes walk through a genuinely hairy failure mode — Kubernetes, Envoy, and Linux conntrack interacting in a way that took real depth to even describe. Afterward I asked him whether he'd used an LLM in the investigation. His answer, roughly: of course — he'd been blocked for a week, asked a model, and within minutes it pointed him in the right direction.

A week of one of the sharpest network people I've met, unblocked in minutes. That's the same shape as my ticket: the model didn't replace the engineer, but it did the part of the work we like to believe is our craft — forming the right hypothesis about a system too complex for any one person to hold in their head.

I think the honest conclusion is uncomfortable and simple: **for a large and growing share of SRE work, LLMs are already better than we are.** The bottleneck is not model capability. The bottleneck is that we have no safe way to let them do the work.

## What happens when you enable them unsafely

The same month as my mutating-webhook afternoon, Amazon's AI coding assistant Kiro caused a 13-hour outage of AWS Cost Explorer in mainland China.[^kiro-ft][^kiro-register] Engineers let it resolve an issue in a production environment; it decided the optimal fix was to delete and recreate the environment, and it did so without human approval.

Look at the reported root causes and notice that none of them are model failures. Kiro inherited an engineer's elevated permissions — the AI could do whatever the human could do. Nothing in the system had a concept of "this action is too large." The human-in-the-loop step existed but was bypassed, because the safeguard lived in configuration that the deployment's permissions happened to defeat. And the fix — mandatory peer review for production changes — was added after the outage, as process.

Amazon called it user error: misconfigured access controls, not AI. That's exactly the point. An agent architecture whose safety depends on nobody misconfiguring access controls is an architecture designed to produce this incident. The failure was structural, and structure is a choice.

Here's the part I find genuinely funny, in the gallows way: the incident that convinced me LLMs can do SRE work was *itself* caused by ungoverned mutation of live infrastructure — a policy webhook, deployed shoot-from-the-hip, silently rewriting production objects in the gap between git and the cluster. The disease and the cure were in the same room the whole time.

## "Read-only" is a property of a binary, not a promise in a config file

The obvious response to Kiro is: fine, make the agent read-only. And there are good tools built on exactly that framing — HolmesGPT, a CNCF sandbox project, leads with investigation. Investigation is real value; my December ticket was pure investigation.

But ask the question that matters: what *guarantees* the agent only reads? For HolmesGPT, at the time of writing, the documented answer is that its built-in toolsets are read-only and it respects the RBAC of the credentials you give it. Look closer and every part of that is an assertion, not a property. Write capability is a configuration away — a remediation toolset, a bash toolset behind a configurable approval setting, custom toolsets you can define in YAML, arbitrary MCP servers you can plug in, a GitHub integration that opens PRs. The local CLI runs on your kubeconfig, meaning the agent inherits a human's credentials and its ceiling is whatever you happened to hand it — the exact pattern that sank Kiro. "Respects existing permissions" is another way of saying the safety layer is your IAM hygiene. I would not point that at a production environment I'm responsible for, and I say that as someone convinced these agents should be pointed at production.

This is not a HolmesGPT bug. It's what "read-only" means when it's implemented as configuration: a flag can be flipped, a toolset can be enabled, a permission can be inherited, and every extension point widens what the agent can reach. If your agent's harmlessness depends on an operator having configured it correctly — and on every future operator not configuring it differently — you don't have a read-only agent. You have a read-mostly agent and a promise.

I wanted the guarantee to live in the tool. So Joe's safety architecture starts from one deterministic fact:

**Every tool Joe can execute is classified Read or Mutate — at authoring time, by Joe's authors, in code.** Not at deploy time by an operator, not at runtime by the model. The classification is binary on purpose: there is no "probably safe" middle tier to argue about, and it fails closed — any tool the classifier doesn't know is treated as a mutation. This is the keystone; everything else in Joe's safety story exists to enforce it.

The enforcement: an unconfigured Joe boots into **observation mode**, and that floor is resolved at boot and immutable at runtime — it is not a dial, not a policy file, not a soft warning. At launch, observation is not just the default; asking Joe for full write mode gets you a refusal at boot, because the governed path for mutations isn't finished and Joe would rather tell you that than pretend. Every input surface Joe has — the web UI, the MCP server, the REST API — converges on a **single governed executor**, so there is no side door where a tool call skips the classification check. Joe deliberately does not consume external MCP tools, either — plugging in third-party tools would mean executing code its authors never classified, which reduces a machine-checkable guarantee to an operator assertion, so the extension point simply doesn't exist. And Joe never shells out to kubectl, never ingests your kubeconfig, never borrows a human's credentials or impersonates one: it authenticates to your infrastructure only as its own, deliberately scoped, non-human identity. The permission-inheritance failure that sank Kiro is not misconfigurable in Joe, because the code paths that would enable it don't exist.

The word for this is not "safe." It's *governed by construction*. Machine-checkable, not operator-asserted.

## Trust, but evaluate

A claim like the last paragraph should make you suspicious. It's the vendor describing his own safety architecture; every vendor does that, including the ones that ship 13-hour outages.

That's why Joe doesn't ship alone. Alongside it I built OASIS, an open evaluation framework for agent safety: scenarios that put an agent in front of situations where the unsafe action is the tempting one, and deterministic verdicts on what it actually did. I wrote about why OASIS exists in [a separate essay](/writing/introducing-oasis/); the short version is that agent safety claims should be reproducible by someone who isn't the author. Joe is evaluated against OASIS scenarios, and the evaluations are as public as the code.

And here is where I owe you the same honesty I've demanded of everyone else in this essay. Joe is not a perfect solution, and I don't think one exists. The classification is deterministic, but it's deterministic *code*, and code has bugs — a tool could be misclassified, and OASIS could fail to catch it. The evaluations reduce the odds; they don't zero them. And below all the governance sits the same class of model that talked me through that December ticket: brilliant at forming hypotheses, and still capable of being confidently wrong. Like self-driving cars, agents built as safely as we know how will still get into accidents. Joe will make mistakes — the architecture exists to bound what a mistake can touch, not to pretend mistakes won't happen.

My claim is narrower: the safety is in the construction, not the configuration — and among open-source infrastructure agents, I haven't found another one built that way. If one exists, I want to see it; that's a comparison the whole field needs.

## Why open source is non-negotiable

Which brings me to the license. Joe is open source, and for this class of software I've come to think that's not a distribution strategy — it's a requirement.

These agents will be given keys to critical infrastructure. Not hypothetically: that's the entire value proposition, mine included. An organization that hands cluster credentials to an agent it cannot read the source of is trusting a promise at exactly the layer where I've argued promises are worthless. "Governed by construction" only means something if you can inspect the construction. The write floor, the fail-closed classification, the single execution seam — every one of those claims is checkable in Joe's repository by the platform team whose production it will touch. That is the point.

## What Joe is today

Joe ships as a single Go binary. Its first core idea — the deterministic Read/Mutate boundary — you've already met. The second is the graph. When you point Joe at your infrastructure, it explores it and persists what it learns — components, workloads, and the relationships between them — in an embedded SQLite database that ships inside that same binary. The graph is Joe's working model of your infrastructure: kept current against the live systems, not rebuilt from zero every time you ask a question. That's the difference between an agent that rediscovers your cluster on every prompt — slow, token-hungry, and amnesiac — and one that reasons over an accumulated, refreshed picture of what is *actually running*. Not what git says should be running, which, as my December ticket demonstrates, is not the same thing: the drift between the two is exactly where that incident lived, and exactly what a live graph makes visible.

The graph is also what makes Joe useful to other agents. Ask Joe questions through its web UI, or wire it into your coding agent over MCP — and the model writing your manifests suddenly knows what the cluster actually looks like, because it's reading Joe's graph instead of guessing from the repo.

Two ideas, then. A persistent graph of your infrastructure, so Joe knows what's real. A deterministic Read/Mutate boundary, so you control what Joe can touch. Everything else is plumbing.

## What's next

Observation is the launch identity, not the destination. The reason Joe exists — the reason it isn't just another investigation agent — is that the whole architecture was built from day one for governed *change*: the classification axis, the single executor, the gate ordering are all in place today precisely so that mutations, when they arrive, pass through the same seam as everything else rather than through a bolted-on approval flow.

Full mode is the next major track: Joe proposing and executing mutations, with the write floor lifted deliberately rather than by default, human authorization on the mutate path, and richer RBAC governing who may approve what. I won't ship it until the governed path is complete and evaluated — which is the same reason a Joe asked for full write mode today refuses at boot instead of quietly proceeding. When an agent's mutations are one config flag away, "coming soon" done honestly beats "available now" done like Kiro.

Beyond that, the horizons in rough order: PostgreSQL as an alternative storage backend, for Joes that outgrow a single binary's embedded database; federated Joe, multiple instances across clusters and sites contributing to a shared picture; and the grail — auto Joe. Self-healing infrastructure: Joe detecting, diagnosing, and remediating without a human in the loop, inside boundaries humans set in advance. Every architectural decision described in this essay is in service of eventually earning that one. You don't get to autonomous remediation by loosening a chatbot's permissions; you get there by building the governance first and expanding what it permits, deliberately, with evidence.

## What I want from Joe

Three things, in increasing order of selfishness.

So far Joe has proven itself in [a lab environment](https://github.com/jaimegago/petri) I built for exactly that purpose — ephemeral, realistic, disposable. With this launch, I want Joe running in a live environment: real infrastructure, real drift, real tickets nobody knows how to start on. That's the environment Joe was built for, and the only one that counts.

I want to push a conversation. Agents *will* be given the keys to critical infrastructure — the economics guarantee it. Whether they'll be open source and governed by construction, or proprietary and governed by promises, is being decided right now, mostly by default. I'd like the default challenged while it's still cheap to challenge. If this essay makes one platform team ask a vendor "what guarantees the agent only reads?", it did its job.

And I wanted to prove something to myself. The last few months of working with these models had been telling me, somewhere in the gut, that the old constraint was gone — that one person could now design, build, evaluate, and ship a product this ambitious alone. Joe is the test of that claim. How it was actually built is a story for its own essay; the short version is that you're reading the launch post, so the gut was right.

## Try it

If Joe had existed that afternoon in December, the loop I performed by hand — inspect, compare, hypothesize, inspect again — is precisely the loop Joe runs, governed, with the mutate boundary enforced by the binary instead of by my missing permissions.

Joe lives at [joeagent.dev](https://joeagent.dev). The safety architecture has its own deep dive at [joeagent.dev/safety](https://joeagent.dev/safety/). The code is on GitHub. Point it at a cluster and ask it something you'd have opened a ticket for.

[^kiro-ft]: Financial Times, "AWS suffered outages after engineers let AI coding tools make changes" (Feb 20, 2026). <!-- TODO-VERIFY-URL -->
[^kiro-register]: The Register, ["Amazon's vibe-coding tool Kiro reportedly vibed too hard"](https://www.theregister.com/off-prem/2026/02/20/amazons-vibe-coding-tool-kiro-reportedly-vibed-too-hard/4873987) (Feb 20, 2026).

---
title: "Why Skillhub is written in Go"
slug: "why-skillhub-is-written-in-go"
date: 2026-03-10T16:00:00+01:00
tags: [Build]
description: "Notes on building an MCP server for Claude Code plugins, and what the go-sdk got right."
draft: true
---

<!-- TODO: draft body. Keep it build-log shaped. Short sections, one per design choice. -->

Placeholder paragraph. Skillhub is written in Go because the MCP surface
rewards boring runtime characteristics, because the go-sdk is quietly excellent,
and because single-binary distribution still beats every other option for a
plugin that needs to run on someone else's laptop.

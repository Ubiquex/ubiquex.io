---
title: "ubx is now in Public Preview"
pubDate: "2026-07-01"
description: "Today we're opening ubx to the public — a platform engineering toolchain that lets you provision infrastructure, deploy applications, and govern everything in one HCL-inspired language."
author: "Roozbeh"
category: "Announcement"
tags: ["ubx", "platform-engineering", "public-preview", "announcement"]
image: "/blog/markdown.webp"
---

# ubx is now in Public Preview

Today, we're opening ubx to the public.

For the past year, we've been building a platform engineering toolchain that does something no existing tool does: lets you provision infrastructure, deploy applications, sync GitOps, enforce policy, and run tests — all in a single `.iac` file, in one language, with a compiler that catches your mistakes before any cloud credentials are ever needed.

We call it ubx. And starting today, anyone can use it.

## What is ubx?

ubx is an HCL-inspired IaC compiler. You write `.iac` files that describe your entire stack — from an RDS instance to a Helm release to an ArgoCD application — and ubx compiles them to native Pulumi programs in TypeScript, Python, or Go.

```hcl
provider "aws" {
  version = "~> 6.0"
}

backend "s3" {
  bucket = "myorg-ubx-state"
  region = "us-east-1"
  key    = "prod/state.json"
}

component "database" {
  source         = "https://github.com/myorg/components-rds"
  identifier     = "myapp-prod-db"
  instance_class = "db.t3.micro"
  encrypted      = true
}

sync "argocd" "backend" {
  repo      = "https://github.com/myorg/app"
  path      = "k8s"
  namespace = "argocd"
  values = {
    db_host = ~component.database.endpoint
    db_port = 5432
    env     = "prod"
  }
}

output "db_endpoint" {
  value = ~component.database.endpoint
}
```

The `~` sigil on `component.database.endpoint` is the key idea. ubx knows that this value isn't available until the database is created, tracks it as a `Pending<T>` type through the entire compilation, and generates the correct `.apply()` chains in the output Pulumi program. No glue scripts. No manual copy-paste between tools. No drift.

## Why we built this

Platform engineering teams are drowning in glue. A Terraform module here, a Helm chart there, an ArgoCD application, a CI pipeline to sequence it all, a separate policy tool, a cost tool, a separate test harness. Each tool speaks a different language. Each requires context switching. Each introduces a new place for things to go wrong.

We wanted a single, coherent language for the entire delivery lifecycle. One that compiled to something proven (Pulumi), supported every cloud provider out of the box (+100 providers), and came with a type system that made broken cross-resource wiring a compile error rather than a production incident.

That's ubx.

## What's in the Public Preview

The Public Preview ships with everything we've built over the past year:

**Language features**
- `unit`, `component`, `deploy`, `sync`, `output`, `local`, `input`, `data` blocks
- `provider` and `backend` configuration
- `policy`, `check`, `exec`, `test` blocks for governance and testing
- `remote` for cross-stack references
- `extend` for multi-environment inheritance
- `Pending<T>` type system with `~` sigil
- `for_each`, `count`, `when`, `lifecycle`, `dynamic` meta-arguments
- Built-in functions: `secret()`, `file()`, `env()`, and more

**Compiler**
- Compilation targets: TypeScript, Python, Go
- `ubx validate` — offline type checking, no credentials needed
- `ubx plan` — full Pulumi plan with dependency resolution
- `ubx plan --cost` — cost estimation per resource
- `ubx apply`, `ubx destroy`, `ubx fmt`, `ubx output`

**AI features**
- `ubx plan` includes an AI Summary section: plain-English description of what the plan does, risk level, and what changes are destructive
- `ubx explain` — natural language explanation of any `.iac` file
- `ubx fix` — AI-assisted error resolution

**State & backends**
- S3, GCS, Azure Blob state backends
- KMS and passphrase encryption
- Shared apply history across backends

**Component registry**
- Git-sourced components (`https://github.com/org/repo`)
- Strata registry (coming soon)

## What's not in Public Preview yet

We're being honest about what's still in progress:

- **Workspace orchestration** — multi-repo, multi-stack coordination is partially implemented
- **Local non-`.iac` component source resolution** — TypeScript, Python, and Go component authoring works in the compiler, but local source resolution has a known gap (tracked as UBX-125)
- **SOPS integration** — encrypted `.iac` files via SOPS are designed, not yet shipped
- **Strata registry** — the component registry is in design; Git-sourced components work today

## Getting started

Install ubx:

```bash
curl -fsSL https://install.ubiquex.io | sh
```

Then initialize your first project:

```bash
ubx init my-stack
cd my-stack
ubx validate
ubx plan
```

The [documentation](https://docs.ubiquex.io) covers everything from installation to advanced features. The [tutorials](https://docs.ubiquex.io/v1/tutorials) start from hello world and go all the way to cross-stack references, AI plan summaries, and policy as code.

## Open source

ubx is open source under the Apache 2.0 license. No BSL, no usage caps, no enterprise tier required for core features. The source is at [github.com/ubiquex/ubx](https://github.com/ubiquex/ubx).

We built this because we needed it. We're opening it because we think the rest of the platform engineering community does too.

If you try it, we want to hear what you think. Open an issue, start a discussion, or reach out directly. Public Preview means we're ready for real feedback — and we intend to act on it.

Welcome to ubx.

— The Ubiquex team

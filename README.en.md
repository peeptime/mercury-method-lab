# Mercury Method Lab

**It keeps smart thoughts from becoming clean but useless waste.**

Version: `0.8.0`

---

## The Problem

You had an hour-long conversation with an AI. Generated some genuinely good ideas.

Then what?

They just sat in the chat history. Two weeks later you either can't find them, or you find them but can't remember why they seemed important.

Mercury Lab solves this.

---

## What It Is

A quality gate that checks AI-generated content before it goes into long-term memory.

It does not help you think more. It helps you decide which thoughts are worth keeping.

For systems like gbrain and Mercury Agent, Mercury Lab sits upstream as a checkpoint: filter first, then decide what deserves to be stored.

---

## The Pre-Audit Contract

See `docs/AUDIT-CONTRACT.md` for the full contract.

Before anything enters gbrain / Mercury Agent / OpenClaw memory, it must answer:

- Is this a fact or a guess?
- Are there counterexamples?
- Is it worth remembering?

If it cannot answer these, it does not go in.

---

## A Real Example

`DEMO.md` shows a complete walkthrough:

How a messy, half-formed idea gets processed and comes out as something you can actually reference later.

---

## What It Does NOT Do (this is the important part)

Most AI tools show you what they can do.
This project shows you what it refuses to do.

- ❌ Cannot store speculation as fact
- ❌ Cannot have the same person write material and audit it
- ❌ Cannot skip quality check before entering memory
- ❌ Cannot let an AI judge, audit, and approve its own conclusion

Why? Because that is exactly where "sounds right but falls apart under pressure" conclusions come from.

---

## Quick Start

```powershell
npm install
npm run doctor
npm run dashboard
```

Dashboard: `http://127.0.0.1:4788`

---

## Generate Pre-Audit Reports

```powershell
npm run index
npm run export:gbrain
```

These commands only generate reports. They do not write directly into any runtime database.

---

## How It Works

```
Received an idea
  -> What is it really? (fact / speculation / hypothesis)
  -> Did it pass the quality check?
  -> Passed -> goes into the sample library, can be called on later
  -> Not passed -> archived, but does not enter long-term memory

Not everything needs to be acted on. Sometimes writing it down is enough.
```

---

## Relationship to Mercury Agent

Mercury Lab is not a fork. It is a companion layer.

| Layer | Who owns it |
| --- | --- |
| Runtime, CLI, Telegram, daemon, scheduler, tools, Second Brain | Mercury Agent |
| Evidence, artifacts, method routing, audit, migration, public practice docs | Mercury Lab |

---

## Docs

- See a full example → `DEMO.md`
- See the pre-audit contract → `docs/AUDIT-CONTRACT.md`
- See a complete sample chain → `examples/`
- Understand why it is designed this way → `docs/GOVERNANCE.md`

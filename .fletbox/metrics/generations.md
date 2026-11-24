# Generations

The log of every `npm run verify` run in this app, newest last. One row per
run: when it happened, whether the gates were green, which gates failed and
which codes they reported.

A **generation** is a run of consecutive failing rows that ends at the first
green one — the rows before it are the corrections that were needed. A green
row that follows a green row is a generation that needed none.

**The north metric** is the share of generations whose *first* run was green:
the code that passed the gate with no correction at all. It is measured by
`npm run metrics`, which also prints the three failures that recurred most
often and the rule each one should belong to. That list is the loop: a code
that keeps coming back and has no rule behind it is a rule that has not been
written yet.

## Gate defects

A code listed here was reported by the gate, not by the code it checked. The
window is the first and the last day it accounts for, so the runs inside it
count as passed and never feed the rule loop: that is the framework's debt,
not a correction this app needed. `Fixed` empty (`—`) means the defect is
still open. A run after `Fixed` counts again — a defect that comes back is
this app's finding until the window is reopened. Remove a row to hand its
findings back.

| Code | Seen | Fixed | Where |
| --- | --- | --- | --- |

| When | Project | Result | Gates | Codes |
| --- | --- | --- | --- | --- |

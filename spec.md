# SIP & Investment Calculator

## Current State
New project — no existing code.

## Requested Changes (Diff)

### Add
- SIP Calculator: monthly investment, expected return rate, time period → maturity value with breakdown
- Lump Sum (One-Time) Calculator: single investment, return rate, duration → future value
- SWP (Systematic Withdrawal Plan) Calculator: corpus, monthly withdrawal, return rate → sustainability analysis
- Detailed explanations for each calculator with formula breakdown
- Visual charts showing investment growth over time
- Results breakdown: invested amount, estimated returns, total value
- Tabbed navigation between calculators

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Build tabbed UI with three calculators: SIP, Lump Sum, SWP
2. SIP: compound interest formula for monthly SIP (FV = P × [((1+r)^n - 1) / r] × (1+r))
3. Lump Sum: FV = PV × (1+r)^n
4. SWP: monthly corpus depletion simulation with withdrawal vs growth balance
5. Recharts line/donut charts for each result
6. Explanation sections with formula cards per calculator
7. All calculations done client-side in React

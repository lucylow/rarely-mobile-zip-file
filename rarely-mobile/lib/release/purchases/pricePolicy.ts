export function displayPeriod(period: string | undefined): string { if (period === "P1M") return "Monthly"; if (period === "P1Y") return "Yearly"; return "Subscription"; }

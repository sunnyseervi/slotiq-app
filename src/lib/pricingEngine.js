// ============================================================
//  SlotIQ Pricing Engine — v2.0
//  EXACT LOGIC (do not modify without re-reading the spec):
//
//  1 hr  @ ₹20/hr  → ₹20
//  5 hr  @ ₹20/hr  → ₹100
//  10 hr @ ₹20/hr  → ₹200 (daily cap hit)
//  15 hr @ ₹20/hr  → ₹200 (still capped)
//  30 hr @ ₹20/hr  → ₹320  (1 full day ₹200 + 6 hrs ₹120)
// ============================================================

/**
 * Core pricing calculation.
 *
 * @param {number} durationMins  - actual elapsed minutes
 * @param {{ hourly: number, daily: number }} rates
 * @param {{ gracePeriodMins: number, minChargeMins: number, minChargePrice: number }} config
 * @returns {{
 *   totalCost: number,
 *   appliedCap: 'grace'|'minimum'|'daily'|'multi-day'|null,
 *   message: string,
 *   breakdown: { fullDays: number, remainingHours: number, dayCost: number, remainingCost: number }
 * }}
 */
export function calculateDynamicPrice({
  durationMins,
  rates = { hourly: 20, daily: 200 },
  config = { gracePeriodMins: 10, minChargeMins: 30, minChargePrice: 20 },
}) {
  const { hourly: hourlyRate, daily: dailyRate } = rates
  const { gracePeriodMins, minChargeMins, minChargePrice } = config

  // ── Rule: Grace Period ────────────────────────────────────
  // Under 10 mins → completely free
  if (durationMins <= gracePeriodMins) {
    return {
      totalCost: 0,
      appliedCap: 'grace',
      message: `Free — within ${gracePeriodMins}-min grace period`,
      breakdown: { fullDays: 0, remainingHours: 0, dayCost: 0, remainingCost: 0 },
    }
  }

  // ── Rule: Minimum Billing ─────────────────────────────────
  // Under 30 mins → charge 1 hour minimum
  if (durationMins < minChargeMins) {
    return {
      totalCost: minChargePrice,
      appliedCap: 'minimum',
      message: `Minimum charge (under ${minChargeMins} mins → billed as 1 hr)`,
      breakdown: { fullDays: 0, remainingHours: 1, dayCost: 0, remainingCost: minChargePrice },
    }
  }

  // ── Step 1: Round up to nearest whole hour ─────────────────
  const totalHours = Math.ceil(durationMins / 60)

  // ── Step 2: Split into full days + remaining hours ─────────
  const fullDays = Math.floor(totalHours / 24)
  const remainingHours = totalHours % 24

  // ── Step 3: Cost for complete days ─────────────────────────
  const dayCost = fullDays * dailyRate

  // ── Step 4: Cost for remaining hours (with daily cap) ──────
  const remainingHourly = remainingHours * hourlyRate
  const remainingCost = Math.min(remainingHourly, dailyRate)

  // ── Step 5: Total ──────────────────────────────────────────
  const totalCost = dayCost + remainingCost

  // ── Determine cap label ────────────────────────────────────
  const dailyCapHit = remainingHourly > dailyRate || (fullDays === 0 && totalHours * hourlyRate >= dailyRate)
  const isMultiDay = fullDays > 0

  let appliedCap = null
  let message = `Billed hourly — ₹${hourlyRate}/hr`

  if (isMultiDay && dailyCapHit) {
    appliedCap = 'multi-day'
    message = `${fullDays} day${fullDays > 1 ? 's' : ''} (₹${dailyRate}/day) + daily cap on extra hours — max ₹${dailyRate}/day`
  } else if (isMultiDay) {
    appliedCap = 'multi-day'
    message = `${fullDays} day${fullDays > 1 ? 's' : ''} (₹${dailyRate}/day) + ${remainingHours} hr @ ₹${hourlyRate}/hr`
  } else if (dailyCapHit) {
    appliedCap = 'daily'
    message = `Daily cap applied — you will not be charged more than ₹${dailyRate} today`
  }

  return {
    totalCost,
    appliedCap,
    message,
    breakdown: { fullDays, remainingHours, dayCost, remainingCost },
  }
}

/**
 * Calculate price from real Date objects (start_time & end_time).
 * This is what gets called at checkout.
 */
export function calculateFromTimes({ startTime, endTime, rates, config }) {
  const durationMs = endTime - startTime
  const durationMins = durationMs / (1000 * 60)
  return calculateDynamicPrice({ durationMins, rates, config })
}

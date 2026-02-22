/**
 * College Card Component
 *
 * Standard card for displaying institution data across the dashboard.
 *
 * Always displayed:
 *   - Institution name + NCES link
 *   - Location, sector, locale, HBCU flag
 *   - Admission rate, 6-year graduation rate
 *   - Undergrad and graduate enrollment
 *   - % Pell recipients, % women
 *
 * Extended (expandable, linked to full NCES profile):
 *   - SAT/ACT averages
 *   - In-state and out-of-state tuition
 *   - Full racial/ethnic demographics
 *   - Link to NCES College Navigator
 */

import { html } from "npm:htl";

export function collegeCard(school) {
  if (!school) return html``;

  const grad = (school.enrollment_total ?? 0) - (school.enrollment_ug ?? 0);
  const pct  = (v) => v != null ? `${v}%` : "N/A";
  const num  = (v) => v != null ? Number(v).toLocaleString() : "N/A";
  const dollar = (v) => v != null ? `$${Number(v).toLocaleString()}` : "N/A";
  const ncesUrl = `https://nces.ed.gov/collegenavigator/?id=${school.UNITID}`;

  const badges = [school.sector_label, school.locale_group, school.HBCU === 1 ? "HBCU" : null]
    .filter(Boolean).join(" · ");

  return html`<div style="border: 1px solid #ddd; padding: 1rem 1.25rem; border-radius: 8px; font-size: 0.9rem; background: var(--theme-background, #fff);">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.2rem;">
      <strong style="font-size: 1rem; line-height: 1.3;">${school.INSTNM}</strong>
      <a href="${ncesUrl}" target="_blank" rel="noopener" style="font-size: 0.78rem; color: #888; white-space: nowrap; flex-shrink: 0;">NCES ↗</a>
    </div>
    <div style="color: #666; font-size: 0.82rem; margin-bottom: 0.75rem;">
      ${school.CITY}, ${school.STABBR} · ${badges}
    </div>
    <table style="border-collapse: collapse; width: 100%; font-size: 0.88rem;">
      <tr>
        <td style="padding: 0.15rem 0.75rem 0.15rem 0; white-space: nowrap; color: #444;"><strong>Admission rate</strong></td>
        <td style="padding: 0.15rem 1rem 0.15rem 0;">${pct(school.admission_rate)}</td>
        <td style="padding: 0.15rem 0.75rem 0.15rem 0; white-space: nowrap; color: #444;"><strong>6-yr grad rate</strong></td>
        <td>${pct(school.grad_rate_6yr)}</td>
      </tr>
      <tr>
        <td style="padding: 0.15rem 0.75rem 0.15rem 0; white-space: nowrap; color: #444;"><strong>Undergrad</strong></td>
        <td style="padding: 0.15rem 1rem 0.15rem 0;">${num(school.enrollment_ug)}</td>
        <td style="padding: 0.15rem 0.75rem 0.15rem 0; white-space: nowrap; color: #444;"><strong>Graduate</strong></td>
        <td>${grad > 0 ? num(grad) : "N/A"}</td>
      </tr>
      <tr>
        <td style="padding: 0.15rem 0.75rem 0.15rem 0; white-space: nowrap; color: #444;"><strong>Pell recipients</strong></td>
        <td style="padding: 0.15rem 1rem 0.15rem 0;">${pct(school.pct_pell)}</td>
        <td style="padding: 0.15rem 0.75rem 0.15rem 0; white-space: nowrap; color: #444;"><strong>Women</strong></td>
        <td>${pct(school.pct_women)}</td>
      </tr>
    </table>
    <details style="margin-top: 0.75rem;">
      <summary style="cursor: pointer; color: #555; font-size: 0.83rem; user-select: none;">Extended data &amp; full profile</summary>
      <div style="margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px solid #eee;">
        <table style="border-collapse: collapse; width: 100%; font-size: 0.85rem;">
          <tr>
            <td style="padding: 0.15rem 0.75rem 0.15rem 0; white-space: nowrap; color: #444;"><strong>SAT average</strong></td>
            <td style="padding: 0.15rem 1rem 0.15rem 0;">${num(school.sat_avg)}</td>
            <td style="padding: 0.15rem 0.75rem 0.15rem 0; white-space: nowrap; color: #444;"><strong>ACT average</strong></td>
            <td>${num(school.act_avg)}</td>
          </tr>
          <tr>
            <td style="padding: 0.15rem 0.75rem 0.15rem 0; white-space: nowrap; color: #444;"><strong>In-state tuition</strong></td>
            <td style="padding: 0.15rem 1rem 0.15rem 0;">${dollar(school.tuition_in_state)}</td>
            <td style="padding: 0.15rem 0.75rem 0.15rem 0; white-space: nowrap; color: #444;"><strong>Out-of-state tuition</strong></td>
            <td>${dollar(school.tuition_out_of_state)}</td>
          </tr>
        </table>
        <div style="margin-top: 0.6rem;">
          <div style="font-size: 0.83rem; font-weight: bold; color: #444; margin-bottom: 0.3rem;">Demographics</div>
          <table style="border-collapse: collapse; font-size: 0.83rem;">
            <tr>
              <td style="padding: 0.1rem 0.6rem 0.1rem 0; color: #555;">White</td>
              <td style="padding: 0.1rem 1rem 0.1rem 0;">${pct(school.pct_white)}</td>
              <td style="padding: 0.1rem 0.6rem 0.1rem 0; color: #555;">Black</td>
              <td style="padding: 0.1rem 1rem 0.1rem 0;">${pct(school.pct_black)}</td>
              <td style="padding: 0.1rem 0.6rem 0.1rem 0; color: #555;">Hispanic</td>
              <td style="padding: 0.1rem 1rem 0.1rem 0;">${pct(school.pct_hispanic)}</td>
            </tr>
            <tr>
              <td style="padding: 0.1rem 0.6rem 0.1rem 0; color: #555;">Asian</td>
              <td style="padding: 0.1rem 1rem 0.1rem 0;">${pct(school.pct_asian)}</td>
              <td style="padding: 0.1rem 0.6rem 0.1rem 0; color: #555;">Two or more</td>
              <td style="padding: 0.1rem 1rem 0.1rem 0;">${pct(school.pct_two_or_more)}</td>
              <td style="padding: 0.1rem 0.6rem 0.1rem 0; color: #555;">Nonresident</td>
              <td style="padding: 0.1rem 1rem 0.1rem 0;">${pct(school.pct_nonresident)}</td>
            </tr>
            <tr>
              <td style="padding: 0.1rem 0.6rem 0.1rem 0; color: #555;">AIAN</td>
              <td style="padding: 0.1rem 1rem 0.1rem 0;">${pct(school.pct_aian)}</td>
              <td style="padding: 0.1rem 0.6rem 0.1rem 0; color: #555;">NHPI</td>
              <td style="padding: 0.1rem 1rem 0.1rem 0;">${pct(school.pct_nhpi)}</td>
            </tr>
          </table>
        </div>
        <p style="margin: 0.6rem 0 0; font-size: 0.83rem;">
          <a href="${ncesUrl}" target="_blank" rel="noopener">Full profile on NCES College Navigator ↗</a>
        </p>
      </div>
    </details>
  </div>`;
}

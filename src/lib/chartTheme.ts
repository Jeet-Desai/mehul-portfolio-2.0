/* ----------------------------------------------------------------------------
   Theme-aware chart chrome for recharts.

   These values resolve via CSS variables (defined in index.css) that flip under
   `.dark`, so gridlines, axes, tooltips and reference lines re-theme live with
   the dark-mode toggle — no JS re-render needed.

   NOTE: data-series colours (the brand/mint/sun line & area fills) are kept
   hard-coded in each calculator on purpose — they read well on both themes and
   are part of the visual identity. Only the neutral chrome lives here.
---------------------------------------------------------------------------- */

export const chartGrid = 'var(--chart-grid)'
export const chartAxis = 'var(--chart-axis)'
export const chartRef = 'var(--chart-ref)'
/** outline for ReferenceDot / active dots — matches the card surface in both themes */
export const chartDotStroke = 'var(--chart-dot-stroke)'

/** spread onto <XAxis tick={axisTick}> / <YAxis tick={axisTick}> */
export const axisTick = { fontSize: 11, fill: 'var(--chart-axis-text)' } as const

/** colour for inline axis/reference labels (e.g. "Year", "Face") */
export const chartLabelFill = 'var(--chart-axis-text)'

/**
 * Spread onto <Tooltip {...tooltipProps} />. Themes the popover surface; item
 * text stays coloured by series (recharts default) which reads well on the dark
 * surface too, so we don't override itemStyle.
 */
export const tooltipProps = {
  contentStyle: {
    background: 'var(--chart-tooltip-bg)',
    border: '1px solid var(--chart-tooltip-border)',
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(2, 6, 23, 0.18)',
    color: 'var(--chart-tooltip-text)',
  },
  labelStyle: { color: 'var(--chart-tooltip-text)', fontWeight: 600 },
} as const

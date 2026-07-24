/**
 * The colour source for the glass design system.
 *
 * Every `.glass` surface in the app uses `backdrop-filter` to sample whatever
 * sits behind it. Over a flat dark ground that produces plain translucent
 * grey — so this drifting, saturated layer is what makes the glass read as
 * glass rather than as a dark panel. Purely decorative, hidden from a11y.
 */
export default function Aurora() {
  return (
    <>
      <div className="aurora" aria-hidden="true">
        <i className="b1" />
        <i className="b2" />
        <i className="b3" />
        <i className="b4" />
      </div>
      <div className="grain" aria-hidden="true" />
    </>
  )
}

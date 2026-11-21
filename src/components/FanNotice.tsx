/** Visible, always-on disclaimer strip right below the hero. */
export function FanNotice() {
  return (
    <div className="fan-notice" role="note">
      <div className="container fan-notice-inner">
        <span className="fan-notice-tag">FAN PROJECT</span>
        <p>
          Sitio independiente hecho por fans argentinos. <strong>Sin afiliación oficial</strong> con BABYMETAL ni con los organizadores del show.
        </p>
      </div>
    </div>
  );
}

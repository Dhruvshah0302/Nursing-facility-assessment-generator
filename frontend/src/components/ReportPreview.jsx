import jsPDF from "jspdf";
import logoImg from "../assets/logo.png";

export default function ReportPreview({ facility, manual }) {
  if (!facility) {
    return (
      <div className="report-empty">
        <p>🏥 Enter a CCN and click Fetch to generate a report.</p>
      </div>
    );
  }

  const fmt = (v, isPercent = false) => {
    if (v == null || v === "") return "—";
    const n = parseFloat(v);
    if (isNaN(n)) return "—";
    return isPercent ? n.toFixed(1) + "%" : n.toFixed(2);
  };

  const starColor = (n) => {
    const i = parseInt(n);
    if (i <= 1) return "#e53e3e";
    if (i <= 3) return "#d69e2e";
    return "#38a169";
  };

  function downloadPDF() {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const W = 612;
    const M = 40;
    let y = 0;

    // ── Header ──
    doc.setFillColor(13, 17, 23);
    doc.rect(0, 0, W, 90, "F");
    doc.setFillColor(0, 180, 216);
    doc.rect(0, 90, W, 3, "F");

  // Logo centered in PDF
  const logoWidth = 60;
  const logoHeight = 60;
  const logoX = (W - logoWidth) / 2;  // this centers it
  const img = new Image();
  img.src = logoImg;
  doc.addImage(img, "PNG", logoX, 12, logoWidth, logoHeight);

doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(0, 180, 216);
doc.text("FACILITY ASSESSMENT SNAPSHOT", W / 2, 82, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 180, 216);
    doc.text("FACILITY ASSESSMENT SNAPSHOT", W / 2, 68, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(136, 152, 170);
    doc.text(facility.state || "", W / 2, 82, { align: "center" });

    y = 110;

    // ── Helpers ──
    function sectionTitle(label) {
      doc.setFillColor(224, 247, 252);
      doc.rect(M, y, W - M * 2, 16, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(0, 119, 168);
      doc.text(label.toUpperCase(), M + 4, y + 11);
      y += 22;
    }

    function tableRow(label, value, shade) {
      if (shade) {
        doc.setFillColor(244, 247, 250);
        doc.rect(M, y, W - M * 2, 18, "F");
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(74, 85, 104);
      doc.text(label, M + 4, y + 12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(13, 17, 23);
      doc.text(String(value ?? "—"), M + 220, y + 12);
      doc.setDrawColor(237, 242, 247);
      doc.line(M, y + 18, W - M, y + 18);
      y += 18;
    }

    // ── Facility Info ──
    sectionTitle("Facility Information");
    tableRow("Name of Facility", manual.facilityName || facility.provider_name, false);
    tableRow("Location", `${facility.provider_address}, ${facility.city_town}, ${facility.state} ${facility.zip_code}`, true);
    tableRow("EMR", manual.emr || "—", false);
    tableRow("Census Capacity", facility.number_of_certified_beds, true);
    tableRow("Current Census", manual.currentCensus || "—", false);
    tableRow("Type of Patient", manual.patientType || "—", true);

    y += 8;

    // ── Medelite History ──
    sectionTitle("Medelite History");
    tableRow("Previous Coverage from Medelite", manual.prevCoverage || "—", false);
    tableRow("Previous Provider Performance", manual.prevPerformance || "—", true);
    tableRow("Medical Coverage", manual.medCoverage || "—", false);

    y += 8;

    // ── Star Ratings ──
    sectionTitle("CMS Star Ratings");
    const stars = [
      { label: "Overall", val: facility.overall_rating },
      { label: "Health Inspection", val: facility.health_inspection_rating },
      { label: "Staffing", val: facility.staffing_rating },
      { label: "Quality of Care", val: facility.qm_rating },
    ];

    const cardW = (W - M * 2 - 24) / 4;
    let cx = M;

    stars.forEach(s => {
      doc.setFillColor(244, 247, 250);
      doc.roundedRect(cx, y, cardW, 44, 4, 4, "F");
      doc.setDrawColor(209, 217, 224);
      doc.roundedRect(cx, y, cardW, 44, 4, 4, "S");

      const n = parseInt(s.val);
      const [r, g, b] = n <= 1 ? [229, 62, 62] : n <= 3 ? [214, 158, 46] : [56, 161, 105];
      doc.setTextColor(r, g, b);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(s.val?.toString() || "—", cx + cardW / 2, y + 16, { align: "center" });

      doc.setFontSize(6);
      doc.text("STARS", cx + cardW / 2, y + 26, { align: "center" });

      doc.setTextColor(136, 152, 170);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(s.label.toUpperCase(), cx + cardW / 2, y + 38, { align: "center" });

      cx += cardW + 8;
    });

    y += 54;
    y += 8;

    // ── Short Stay Metrics ──
    sectionTitle("Short-Stay Metrics");
    tableRow("Short Term Hospitalization", fmt(facility.str_hospitalization, true), false);
    tableRow("STR National Avg. for Hospitalization", fmt(facility.averages?.national?.str_hospitalization, true), true);
    tableRow("STR State Avg. for Hospitalization", fmt(facility.averages?.state?.str_hospitalization, true), false);
    tableRow("STR ED Visit", fmt(facility.str_ed_visit, true), true);
    tableRow("STR ED Visits National Avg.", fmt(facility.averages?.national?.str_ed_visit, true), false);
    tableRow("STR ED Visits State Avg.", fmt(facility.averages?.state?.str_ed_visit, true), true);

    y += 8;

    // ── Long Stay Metrics ──
    sectionTitle("Long-Stay Metrics (per 1,000 resident days)");
    tableRow("LT Hospitalization", fmt(facility.lt_hospitalization), false);
    tableRow("LT National Avg. for Hospitalization", fmt(facility.averages?.national?.lt_hospitalization), true);
    tableRow("LT State Avg. for Hospitalization", fmt(facility.averages?.state?.lt_hospitalization), false);
    tableRow("ED Visit", fmt(facility.lt_ed_visit), true);
    tableRow("LT ED Visits National Avg.", fmt(facility.averages?.national?.lt_ed_visit), false);
    tableRow("LT ED Visits State Avg.", fmt(facility.averages?.state?.lt_ed_visit), true);

    // ── Footer ──
    const pageH = doc.internal.pageSize.height;
    doc.setFillColor(237, 242, 247);
    doc.rect(0, pageH - 36, W, 36, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(136, 152, 170);
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    doc.text(`Generated ${today} · INFINITE — Managed by Medelite`, M, pageH - 14);

    const filename = `Facility_Assessment_${(manual.facilityName || facility.provider_name)?.replace(/[^a-z0-9]/gi, "_").slice(0, 30)}.pdf`;
    doc.save(filename);
  }

  return (
    <div className="report">

      {/* Header */}
      <div className="report-header">
        <div className="report-header-top">
          <img src={logoImg} alt="Infinite" className="report-logo" />
        </div>
        <div className="report-title">FACILITY ASSESSMENT SNAPSHOT</div>
        <div className="report-state">{facility.state || ""}</div>
      </div>

      {/* Facility Info */}
      <div className="report-section">
        <div className="section-title">Facility Information</div>
        <table className="report-table">
          <tbody>
            <tr><td>Name of Facility</td><td>{manual.facilityName || facility.provider_name || "—"}</td></tr>
            <tr><td>Location</td><td>{facility.provider_address}, {facility.city_town}, {facility.state} {facility.zip_code}</td></tr>
            <tr><td>EMR</td><td>{manual.emr || "—"}</td></tr>
            <tr><td>Census Capacity</td><td>{facility.number_of_certified_beds || "—"}</td></tr>
            <tr><td>Current Census</td><td>{manual.currentCensus || "—"}</td></tr>
            <tr><td>Type of Patient</td><td>{manual.patientType || "—"}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Medelite History */}
      <div className="report-section">
        <div className="section-title">Medelite History</div>
        <table className="report-table">
          <tbody>
            <tr><td>Previous Coverage from Medelite</td><td>{manual.prevCoverage || "—"}</td></tr>
            <tr><td>Previous Provider Performance</td><td>{manual.prevPerformance || "—"}</td></tr>
            <tr><td>Medical Coverage</td><td>{manual.medCoverage || "—"}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Star Ratings */}
      <div className="report-section">
        <div className="section-title">CMS Star Ratings</div>
        <div className="stars-row">
          {[
            { label: "Overall", val: facility.overall_rating },
            { label: "Health Inspection", val: facility.health_inspection_rating },
            { label: "Staffing", val: facility.staffing_rating },
            { label: "Quality of Care", val: facility.qm_rating },
          ].map(s => (
            <div className="star-card" key={s.label}>
              <div className="star-number" style={{ color: starColor(s.val) }}>
                {s.val}★
              </div>
              <div className="star-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Short Stay Metrics */}
      <div className="report-section">
        <div className="section-title">Short-Stay Metrics</div>
        <table className="report-table">
          <tbody>
            <tr><td>Short Term Hospitalization</td><td>{fmt(facility.str_hospitalization, true)}</td></tr>
            <tr><td>STR National Avg. for Hospitalization</td><td>{fmt(facility.averages?.national?.str_hospitalization, true)}</td></tr>
            <tr><td>STR State Avg. for Hospitalization</td><td>{fmt(facility.averages?.state?.str_hospitalization, true)}</td></tr>
            <tr><td>STR ED Visit</td><td>{fmt(facility.str_ed_visit, true)}</td></tr>
            <tr><td>STR ED Visits National Avg.</td><td>{fmt(facility.averages?.national?.str_ed_visit, true)}</td></tr>
            <tr><td>STR ED Visits State Avg.</td><td>{fmt(facility.averages?.state?.str_ed_visit, true)}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Long Stay Metrics */}
      <div className="report-section">
        <div className="section-title">Long-Stay Metrics (per 1,000 resident days)</div>
        <table className="report-table">
          <tbody>
            <tr><td>LT Hospitalization</td><td>{fmt(facility.lt_hospitalization)}</td></tr>
            <tr><td>LT National Avg. for Hospitalization</td><td>{fmt(facility.averages?.national?.lt_hospitalization)}</td></tr>
            <tr><td>LT State Avg. for Hospitalization</td><td>{fmt(facility.averages?.state?.lt_hospitalization)}</td></tr>
            <tr><td>ED Visit</td><td>{fmt(facility.lt_ed_visit)}</td></tr>
            <tr><td>LT ED Visits National Avg.</td><td>{fmt(facility.averages?.national?.lt_ed_visit)}</td></tr>
            <tr><td>LT ED Visits State Avg.</td><td>{fmt(facility.averages?.state?.lt_ed_visit)}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Download Button */}
      <div className="report-section">
        <button className="pdf-btn" onClick={downloadPDF}>
          ⬇ Download PDF Report
        </button>
      </div>

    </div>
  );
}
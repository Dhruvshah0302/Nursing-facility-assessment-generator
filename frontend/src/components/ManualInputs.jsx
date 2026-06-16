export default function ManualInputs({ onChange }) {
  function handle(e) {
    onChange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <div className="manual-inputs">
      <h3>Manual Inputs</h3>

      <label>EMR System</label>
      <input name="emr" placeholder="e.g. PCC" onChange={handle} />

      <label>Current Census</label>
      <input name="currentCensus" type="number" placeholder="e.g. 112" onChange={handle} />

      <label>Type of Patient</label>
      <input name="patientType" placeholder="e.g. Long-term & Short-term" onChange={handle} />

      <label>Previous Coverage from Medelite</label>
      <select name="prevCoverage" onChange={handle}>
        <option value="">— Select —</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>

      <label>Previous Provider Performance</label>
      <input name="prevPerformance" placeholder="e.g. About 30 patients/day" onChange={handle} />

      <label>Medical Coverage</label>
      <input name="medCoverage" placeholder="e.g. Optometry, PCP, Podiatry" onChange={handle} />
    </div>
  );
}
import { useState } from "react";
import SearchBar from "./components/SearchBar";
import ManualInputs from "./components/ManualInputs";
import ReportPreview from "./components/ReportPreview";
import { fetchProvider, fetchQuality, fetchAverages } from "./services/api";
import logoImg from "./assets/logo.png"
import "./index.css";

export default function App() {
  const [facility, setFacility] = useState(null);
  const [manual, setManual] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(ccn) {
    setLoading(true);
    setError(null);
    setFacility(null);
    try {
      const provider = await fetchProvider(ccn);
      const [quality, averages] = await Promise.all([
        fetchQuality(ccn),
        fetchAverages(provider.state),
      ]);
      setFacility({ ...provider, ...quality, averages });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <img src={logoImg} alt="Infinite logo" className="header-logo" /> 
        <div className="header-title">Facility Assessment Report Generator</div>
      </header>
      <div className="app-body">
        <div className="left-panel">
          <SearchBar onSearch={handleSearch} loading={loading} error={error} />
          <ManualInputs onChange={setManual}
            facilityName={facility?.provider_name} 
            />
        </div>
        <div className="right-panel">
          <ReportPreview facility={facility} manual={manual} />
        </div>
      </div>
    </div>
  );
}
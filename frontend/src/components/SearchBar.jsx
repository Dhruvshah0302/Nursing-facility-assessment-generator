export default function SearchBar({ onSearch, loading, error }) {
  function handleSubmit(e) {
    e.preventDefault();
    const ccn = e.target.ccn.value.trim();
    if (ccn) onSearch(ccn);
  }

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <input
          name="ccn"
          placeholder="Enter CCN (e.g. 686123)"
          maxLength={10}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Fetching..." : "Fetch Facility"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
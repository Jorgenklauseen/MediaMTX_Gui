function Recordings() {
  return (
    <div>
      <h1>Recordings Page</h1>
      <p>This is the recordings page</p>

      <div>
        <button
          onClick={async () => {
            const res = await fetch("/api/test-email", { method: "POST" });
            alert(res.ok ? "Sendt!" : "Feil");
          }}
        >
          Test epost
        </button>
      </div>
    </div>
  );
}
export default Recordings;

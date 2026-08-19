const EXAMPLE_TOPICS = [
  "AI Agent Governance",
  "Climate Adaptation",
  "Quantum Computing",
];

export default function Home() {
  return (
    <main className="home">
      <section className="home-hero">
        <h1 className="home-title">OpenGap</h1>
        <p className="home-tagline">Find what&apos;s missing in research.</p>

        <form className="home-form" action="/api/analyze" method="post">
          <label className="home-label" htmlFor="topic">
            Research topic
          </label>
          <div className="home-form-row">
            <input
              id="topic"
              name="topic"
              type="text"
              className="home-input"
              placeholder="e.g. AI Agent Governance"
              required
            />
            <button type="submit" className="home-submit">
              Find gaps
            </button>
          </div>
        </form>

        <p className="home-try">Try:</p>
        <ul className="home-examples">
          {EXAMPLE_TOPICS.map((topic) => (
            <li key={topic}>
              <a className="home-example" href={`/api/analyze?topic=${encodeURIComponent(topic)}`}>
                {topic}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

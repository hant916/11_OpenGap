import AnalysisForm from "./components/AnalysisForm";

export default function Home() {
  return (
    <main className="home">
      <section className="home-hero">
        <h1 className="home-title">OpenGap</h1>
        <p className="home-tagline">Find what&apos;s missing in research.</p>
        <p className="home-support">
          Detect measurable gaps across research, funding and reusable outputs
          using the OpenAIRE Graph.
        </p>

        <AnalysisForm />
      </section>
      <footer className="home-footer">Built with OpenAIRE Graph.</footer>
    </main>
  );
}

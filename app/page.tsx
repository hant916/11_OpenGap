import AnalysisForm from "./components/AnalysisForm";

export default function Home() {
  return (
    <main className="home">
      <section className="home-hero">
        <h1 className="home-title">OpenGap</h1>
        <p className="home-tagline">Find what&apos;s missing in research.</p>

        <AnalysisForm />
      </section>
    </main>
  );
}

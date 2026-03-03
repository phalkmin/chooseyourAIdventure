import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <main id="nescss">
        <div className="container">
          <section className="showcase">
            <section className="nes-container with-title is-centered">
              <section className="adventures item">
                <Link className="nes-btn is-primary" href="/medieval">
                  <h3>Medieval Adventure →</h3>
                </Link>
                <Link className="nes-btn is-warning" href="/scifi">
                  <h3>Sci-Fi Adventure →</h3>
                </Link>
              </section>
            </section>
          </section>
        </div>
      </main>
    </>
  );
}

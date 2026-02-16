import Link from 'next/link';
import Header from '../components/Header';

export default function HomePage() {
  return (
    <>
      <Header />
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

import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect } from "react";
import { useKonami } from 'react-konami-code';
import Header from "./components/header"

export const runtime = 'edge';


const HomePage: NextPage = () => {

  useEffect(() => {
    // This useEffect is used for other purposes, not for handling the Konami code
  }, []);

  return (
    <>
      <Head>
        <title>Choose Your Own Adventure</title>
      </Head>

      <Header/>

      <main id="nescss" className="is-dark">
      <div className="container">
        <section className="showcase">
            <section className="nes-container with-title is-centered">
                <section className="adventures item">
                <Link
                  className="nes-btn is-primary"
                  href="/medieval"
                >
                  <h3>Medieval Adventure →</h3>
                </Link>
                <Link
                  className="nes-btn is-warning"
                  href="/scifi"
                >
                  <h3>Sci-Fi Adventure →</h3>
                </Link>
              </section>
            </section>
        </section>
      </div>
      </main>

    </>
  );
};

export default HomePage;



import Head from "next/head";
import { Intersection } from "../components/Intersection";

export default function Home() {
  return (
    <>
      <Head>
        <title>Traffic Light Simulator</title>
        <meta name="description" content="A traffic light simulator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <h1 className="text-3xl font-bold text-white mb-8">Traffic Light Simulator</h1>
        <Intersection />
      </main>
    </>
  );
}

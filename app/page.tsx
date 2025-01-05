
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Lottery } from "./components/lotterySnow3";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]" style={{ marginTop: '-140px' }}>
      <main className="flex flex-col gap-4 row-start-2 items-center sm:items-start">
        <ConnectButton />
        <Lottery />

        <div className="flex gap-4 items-center flex-col sm:flex-row">
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useReadContracts } from 'wagmi';
import { useBlockNumber } from 'wagmi';
import { type BaseError, useWaitForTransactionReceipt } from 'wagmi'; 
import { parseEther, formatEther } from 'viem'; 
import { abi } from '../utils/lotteryAbi';

const lotteryAddress = '0x4068e924436a2f98947DB718BA00F8E5119FcbDf';

export function Lottery() {
  const { address, isConnected } = useAccount();

  const { 
    data: hash, 
    error: writeError,
    isPending: writeIsPending,
    writeContract,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }); 

  const { 
    data: readData,
    isPending: readIsPending,
    refetch,
  } = useReadContracts({ 
    contracts: [
      { 
        address: lotteryAddress as `0x${string}`,
        abi: abi,
        functionName: 'getTicketsOwned',
        args: [address],
      }, 
      { 
        address: lotteryAddress as `0x${string}`,
        abi: abi,
        functionName: 'totalParticipants',
      }, 
      { 
        address: lotteryAddress as `0x${string}`,
        abi: abi,
        functionName: 'timeUntilNextPick',
      }, 
      { 
        address: lotteryAddress as `0x${string}`,
        abi: abi,
        functionName: 'getBalance',
      }, 
      { 
        address: lotteryAddress as `0x${string}`,
        abi: abi,
        functionName: 'lastPrize',
      }, 
      { 
        address: lotteryAddress as `0x${string}`,
        abi: abi,
        functionName: 'lastWinner',
      },
    ],
  });

  const { data: blockNumber } = useBlockNumber({ watch: true });

  const [timeLeft, setTimeLeft] = useState(0);
  const [ownedTickets, setOwnedTickets] = useState(0);
  const [balance, setBalance] = useState(0);
  const [lastWinner, setLastWinner] = useState('');
  const [lastPrize, setLastPrize] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);

  useEffect(() => {
    refetch();
  }, [blockNumber]);


  useEffect(() => {
    if (readData?.[2]?.result) {
      setTimeLeft(Number(readData[2].result));
    }
    if (readData?.[0]?.result) {
      setOwnedTickets(Number(readData[0].result));
    }
    if (readData?.[3]?.result) {
      setBalance(Number(readData[3].result));
    }
    if (readData?.[4]?.result) {
      setLastPrize(Number(readData[4].result));
    }
    if (readData?.[5]?.result) {
      setLastWinner(readData[5].result as string);
    }
  }, [readData]);

  // Licznik
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 20000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes
      .toString()
      .padStart(2, '0')}m`;
  };

  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const buyTicket = () => {
    writeContract({
      address: lotteryAddress,
      abi,
      functionName: 'enter',
      value: parseEther('0.01'),
    });
  };

  const pickWinner = () => {
    writeContract({
      address: lotteryAddress,
      abi,
      functionName: 'pickWinner',
    });
  };

  useEffect(() => {
    const audio = new Audio('/cosmic-serenade-246437.mp3'); // Nowa ścieżka do muzyki kosmicznej
    audio.loop = true;
    audio.volume = 0.5;

    if (isMusicPlaying) {
      audio.play().catch((err) => console.error('Error playing audio:', err));
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [isMusicPlaying]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-indigo-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
       
        {/* Spadające gwiazdy */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`falling-${i}`}
            className="animate-fall"
            style={{
              width: `${Math.random() * 3 + 5}px`,
              height: `${Math.random() * 2 + 4}px`,
              backgroundColor: 'white',
              borderRadius: '50%',
              top: `${Math.random() * -100}vh`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 2 + 1}s`,
              animationDelay: `${Math.random() * 1}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md w-96 relative z-10 border border-indigo-400">
        <h1 className="text-2xl font-bold text-center mb-4 text-indigo-600">🌌 Kosmiczna Loteria 🌠</h1>
        {!isConnected ? (
          <p className="text-center text-gray-600">Please connect your wallet to use the app.</p>
        ) : (
          <>
            <p className="text-gray-700 text-center mb-4">
              Lottery ends in: <span className="font-bold text-blue-400">{timeLeft > 0 ? formatTime(timeLeft) : 'Lottery finished'}</span>
            </p>
            <p className="text-gray-700 text-center mb-4">Contract balance: <span className="font-bold text-blue-400">{!readIsPending && formatEther(BigInt(balance))} ETH</span>
            </p>
            <p className="text-gray-700 text-center mb-4">
              Tickets Owned: <span className="font-bold text-blue-400">{!readIsPending && ownedTickets}</span>
            </p>
            <p className="text-gray-700 text-center mb-4">
              Last Winner: <span className="font-bold text-purple-500">{formatAddress(lastWinner)}</span>
            </p>
            <p className="text-gray-700 text-center mb-4">
              Last Prize: <span className="font-bold text-purple-500">{formatEther(BigInt(lastPrize)) || '0'} ETH</span>
            </p>
            <button
              onClick={buyTicket}
              disabled={readIsPending || writeIsPending || isConfirming}
              className={`w-full py-2 rounded text-white ${writeIsPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'} shadow-md transition-transform transform hover:scale-105`}
            >
              {writeIsPending ? 'Processing...' : 'Buy Ticket (0.01 ETH)'}
            </button>
            {isConfirming && <div className="text-center mt-2 text-yellow-500">Waiting for confirmation...</div>}
            {isConfirmed && <div className="text-center mt-2 text-green-500">Transaction confirmed. 🎉</div>}
            {writeError && (
              <div className="text-center mt-2 text-red-500">Error: {(writeError as BaseError).shortMessage || writeError.message}</div>
            )}
            <button
              onClick={() => setIsMusicPlaying(!isMusicPlaying)}
              className="w-full bg-blue-500 text-white py-2 mt-4 rounded hover:bg-blue-600 shadow-md transition-transform transform hover:scale-105"
            >
              {isMusicPlaying ? 'Pause Music' : 'Play Music'}
            </button>
            <button
              disabled = {timeLeft > 0}
              onClick={() => pickWinner()}
              className={`w-full bg-green-500 text-white py-2 mt-4 rounded hover:bg-green-600  ${timeLeft > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} shadow-md transition-transform transform hover:scale-105`}
            >
              Pick Winner (when time ends)
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Dodaj animacje CSS
const styles = `
  @keyframes fall {
    0% {
      transform: translateY(-100vh) translateX(0);
    }
    100% {
      transform: translateY(100vh) translateX(10px);
    }
  }

  @keyframes twinkle {
    0% { opacity: 0.2; }
    50% { opacity: 1; }
    100% { opacity: 0.2; }
  }

  .animate-fall {
    position: absolute;
    animation-name: fall, twinkle;
    animation-timing-function: linear, ease-in-out;
    animation-iteration-count: infinite;
  }
`;

const styles1 = `
  @keyframes fall {
    0% {
      transform: translateY(-100vh) translateX(0);
    }
    100% {
      transform: translateY(100vh) translateX(10px);
    }
  }

  .animate-fall {
    position: absolute;
    animation-name: fall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}


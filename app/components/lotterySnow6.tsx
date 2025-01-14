'use client'

import * as React from 'react'
import { useState, useEffect } from "react";
import { useWriteContract, useAccount, useReadContracts } from 'wagmi'
import { useBlockNumber } from 'wagmi'
import { type BaseError, useWaitForTransactionReceipt } from 'wagmi' 
import { parseEther, formatEther } from 'viem' 
import { abi } from '../utils/lotteryAbi'

const lotteryAddress = '0x4068e924436a2f98947DB718BA00F8E5119FcbDf'
export function Lottery() {
  const { address, isConnected } = useAccount();

  const { 
    data: hash, 
    error: writeError,
    isPending: writeIsPending,
    writeContract
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 

  const { 
    data: readData,
    isPending: readIsPending,
    refetch
  } = useReadContracts({ 
    contracts: [
      
         { 
            address: lotteryAddress as `0x${string}`,
            abi: abi,
            functionName: 'getTicketsOwned',
            args: [address],
         }, { 
            address: lotteryAddress as `0x${string}`,
            abi: abi,
            functionName: 'totalParticipants',
         }, { 
          address: lotteryAddress as `0x${string}`,
          abi: abi,
          functionName: 'timeUntilNextPick',
         }
         , { 
          address: lotteryAddress as `0x${string}`,
          abi: abi,
          functionName: 'getBalance',
         }, { 
            address: lotteryAddress as `0x${string}`,
            abi: abi,
            functionName: 'lastPrize',
        }
        , { 
            address: lotteryAddress as `0x${string}`,
            abi: abi,
            functionName: 'lastWinner',
        }
   ],
  }) 

  const { data: blockNumber } = useBlockNumber({ watch: true })

  useEffect(() => {
    refetch()
  }, [blockNumber])

   const [timeLeft, setTimeLeft] = useState(0);
   const [ownedTickets, setOwnedTickets] = useState(0);
   const [balance, setBalance] = useState(0);
   const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  
  // Ustawiamy czas początkowy po załadowaniu danych
  useEffect(() => {
    if (readData?.[2]?.result) {
      setTimeLeft(Number(readData[2].result));
    }
  }, [readData]);

  useEffect(() => {
    if (readData?.[0]?.result) {
        setOwnedTickets(Number(readData[0].result));
    }
  }, [readData]);

  useEffect(() => {
    if (readData?.[3]?.result) {
        setBalance(Number(readData[3].result));
    }
  }, [readData]);

  // Aktualizujemy licznik co sekundę
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 20000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds:number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
  
    return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes
      .toString()
      .padStart(2, '0')}m`;
  };

  const buyTicket = () => {
    writeContract({
      address: lotteryAddress,
      abi,
      functionName: 'enter',
      value: parseEther('0.01'),
    })
  }

  // Muzyka świąteczna
  useEffect(() => {
    const audio = new Audio('/holiday-harmony.mp3'); // Ścieżka do pliku muzycznego
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
    <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-400 flex items-center justify-center relative overflow-hidden">
      {/* Falling Snowflakes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute top-0 bg-white rounded-full opacity-75 animate-fall`}
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>
      {/* Application Card */}
      <div className="bg-white p-8 rounded-xl shadow-md w-96 relative z-10 border border-red-200">
        <h1 className="text-2xl font-bold text-center mb-4 text-red-600">🎄 Loteria świąteczna 🎅</h1>
        {!isConnected ? (
          <p className="text-center text-gray-600">Please connect your wallet to use the app.</p>
        ) : (
          <>
            <p className="text-gray-700 text-center mb-4">
              Lottery ends in: <span className="font-bold text-green-600"><div>
              {timeLeft > 0 ? formatTime(timeLeft) : "Lotteria zakończona"}</div></span>
            </p>
            <p className="text-gray-700 text-center mb-4">             
              Contract balance: <span className="font-bold text-green-600">{
              !readIsPending && formatEther(BigInt(balance))}ETH</span>
            </p>
            <p className="text-gray-700 text-center mb-4">             
              Tickets Owned: <span className="font-bold text-green-600">{
              !readIsPending && <div>{ownedTickets}</div>}</span>
            </p>
            <button
              onClick={buyTicket}
              disabled={readIsPending || writeIsPending || isConfirming}
              className={`w-full py-2 rounded text-white ${writeIsPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} shadow-md transition-transform transform hover:scale-105`}
            >
              {writeIsPending ? 'Processing...' : 'Buy Ticket (0.01 ETH)'}
            </button>
            {isConfirming && <div className="text-center mt-2 text-yellow-500">Waiting for confirmation...</div>}
            {isConfirmed && <div className="text-center mt-2 text-green-500">Transaction confirmed. 🎉</div>}
            {writeError && (
              <div className="text-center mt-2 text-red-500">Error: {(writeError as BaseError).shortMessage || writeError.message}</div>
            )}
            <button
              onClick={() => refetch()}
              className="w-full bg-green-500 text-white py-2 mt-4 rounded hover:bg-green-600 shadow-md transition-transform transform hover:scale-105"
            >
              Refresh Tickets
            </button>
            <button
              onClick={() => setIsMusicPlaying(!isMusicPlaying)}
              className="w-full bg-blue-500 text-white py-2 mt-4 rounded hover:bg-blue-600 shadow-md transition-transform transform hover:scale-105"
            >
              {isMusicPlaying ? 'Pause Music' : 'Play Music'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// Add falling snow

// Add falling snowflake animation
const styles = `
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

// Inject styles into the document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
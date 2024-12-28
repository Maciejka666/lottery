'use client'

import * as React from 'react'
import { useState, useEffect } from "react";
import { useWriteContract, useAccount, useReadContracts } from 'wagmi'
import { useBlockNumber } from 'wagmi'
import { type BaseError, useWaitForTransactionReceipt } from 'wagmi' 
import { parseEther } from 'viem' 
import { abi } from '../utils/lotteryAbi'

const lotteryAddress = '0xbD840a597c01242e73C549270Eb4d58977483A69'

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
    error: readError,
    isPending: readIsPending,
    refetch
  } = useReadContracts({ 
    contracts: [{ 
        address: lotteryAddress as `0x${string}`,
        abi: abi,
        functionName: 'getTicketsOwned',
        args: [address],
    }, { 
        address: lotteryAddress as `0x${string}`,
        abi: abi,
        functionName: 'totalParticipants',
    }],
  }) 

  const { data: blockNumber } = useBlockNumber({ watch: true })

  useEffect(() => {
    refetch()
  }, [blockNumber])

  const buyTicket = () => {
    writeContract({
      address: lotteryAddress,
      abi,
      functionName: 'enter',
      value: parseEther('0.01'),
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-400 flex items-center justify-center relative overflow-hidden">
      {/* Śnieżynki w tle */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="animate-fall-slow absolute top-0 left-[20%] w-10 h-10 bg-white rounded-full opacity-50"></div>
        <div className="animate-fall-fast absolute top-0 left-[50%] w-8 h-8 bg-white rounded-full opacity-50"></div>
        <div className="animate-fall-slow absolute top-0 left-[80%] w-12 h-12 bg-white rounded-full opacity-50"></div>
      </div>
      {/* Karta aplikacji */}
      <div className="bg-white p-8 rounded-xl shadow-md w-96 relative z-10 border border-red-200">
        <h1 className="text-3xl font-bold text-center mb-4 text-red-600">🎄 Holiday Lottery 🎅</h1>
        {!isConnected ? (
          <p className="text-center text-gray-600">Please connect your wallet to use the app.</p>
        ) : (
          <>
            <p className="text-gray-700 text-center mb-4">
              Tickets Owned: <span className="font-bold text-green-600">{!readIsPending && readData?.[0]?.result}</span>
            </p>
            <button
              onClick={buyTicket}
              disabled={readIsPending || writeIsPending || isConfirming}
              className={`w-full py-2 rounded ${
                writeIsPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
              } text-white shadow-md transition-transform transform hover:scale-105`}
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
          </>
        )}
      </div>
    </div>
  )
}

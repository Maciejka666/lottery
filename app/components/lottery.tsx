

'use client'

import * as React from 'react'
import { useEffect} from "react";
import { useWriteContract,useAccount, useReadContracts} from 'wagmi'
import { useBlockNumber} from 'wagmi'
import { type BaseError, useWaitForTransactionReceipt } from 'wagmi' 

import { parseEther} from 'viem' 
import { abi } from '.././utils//lotteryAbi'

const lotteryAddress = '0xAB2a84Ba4f8D0FEE7968a32cD3a6f98FfcBF6559' 

 
export function Lottery() {


  const { address, isConnected } = useAccount();

  const { 
    data: hash, 
    error : writeError,
    isPending: writeIsPending,
    writeContract
  } = useWriteContract() 


  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 

  const { 
    data:readData,
    //error: readError,
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
    // want to refetch every `n` block instead? use the modulo operator!
    // if (blockNumber % 5 === 0) refetch() // refetch every 5 blocks
    refetch()
}, [blockNumber])

const buyTicket = () => {

    writeContract({

        address:lotteryAddress,
        abi,
        functionName: 'enter',
        value : parseEther('0.01'),

        }
     )
}

 
return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-4">Lottery DApp</h1>
        {!isConnected ? (
          <p className="text-center text-gray-600">Please connect your wallet to use the app.</p>
        ) : (
          <>
            <p className="text-gray-700 text-center mb-4">
              Tickets Owned: <span className="font-bold">{
               // eslint-disable-next-line @typescript-eslint/ban-ts-comment
               // @ts-ignore 
              !readIsPending && <div> {readData[0].result}</div>
              }</span>
            </p>
            <button
              onClick={buyTicket}
              disabled={readIsPending || writeIsPending || isConfirming }
              className={`w-full py-2 rounded ${
                writeIsPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              {writeIsPending ? 'Processing...' : 'Buy Ticket (0.01 ETH)'}
            </button>
            {isConfirming && <div>Waiting for confirmation...</div>} 
            {isConfirmed && <div>Transaction confirmed.</div>} 
            {writeError && (
                    <div>Error: {(writeError as BaseError).shortMessage || writeError.message}</div>
             )}
            <button
              //onClick={refreshTickets}
              className="w-full bg-gray-500 text-white py-2 mt-4 rounded hover:bg-gray-600"
            >
              Refresh Tickets
            </button>
           
          </>
        )}
      </div>
    </div>
  );

}
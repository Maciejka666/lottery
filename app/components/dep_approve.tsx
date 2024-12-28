'use client'

import * as React from 'react'
import { useState } from "react";
import { useWriteContract,useAccount, useReadContracts} from 'wagmi'
import {  type BaseError, useWaitForTransactionReceipt } from 'wagmi' 
import { config } from '../lib/config' // config z użyciem rainbowkit
import { useConfig } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";

import { parseEther,formatEther } from 'viem' 
import { abi } from '.././utils//myAuctionAbi'
const contractAbi = require('../utils/lojkenAbi.json');


const lojkenAddress = '0xeB34A7162379513695A0d4a85468c9e7738442a4' // <- lojken contract
const myauctionAddress = '0x929Edcc5Cb06825d45301F6b9BE3D7004A05D1A2' // <- myauction contract

 
export function Dep_approve() {

 
  const [isToSmallBallance, setBallanceFlag] = useState(false);
  const [valueTosend,setValue] = useState('0');

  const { address } = useAccount();  

  //const config = useConfig();

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
    error: readError,
    isPending: readIsPending
  } = useReadContracts({ 
    contracts: [{ 
        address: lojkenAddress as `0x${string}`,
        abi: contractAbi,
        functionName: 'balanceOf',
        args: [address],
    }, { 
        address: lojkenAddress as `0x${string}`,
        abi: contractAbi,
        functionName: 'allowance',
        args: [address, myauctionAddress],
    }] 
  }) 

  const handleTransactionSubmitted = async (txHash: string) => {
    const transactionReceipt = await waitForTransactionReceipt(config, {
      hash: txHash as `0x${string}`,
    });

    // at this point the tx was mined
    console.log(valueTosend)
    if (transactionReceipt.status === "success") {
      // execute your logic here
      

        writeContract({
        address: myauctionAddress,
        abi,
        functionName: 'deposit',
        args: [parseEther(valueTosend)],
        })
      

    }
  };


  async function submit(e: React.FormEvent<HTMLFormElement>) { 

    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    //const to = formData.get('address') as `0x${string}` 
    const value = formData.get('value') as string 
    console.log(parseEther(value))

    if (parseEther(value) > (readData[0].result)) {setBallanceFlag(true); return;}

    if (parseEther(value) > (readData[1].result)) {

        writeContract({

            address: lojkenAddress,
            abi: contractAbi,
            functionName: 'approve',
            args: [myauctionAddress, parseEther(value) - (readData[1].result)],
        }, {

            onSuccess: handleTransactionSubmitted,
        }
        );

    }

   
  } 

  const nameChangeHandler = (e:any) => {
    setValue(e.target.value)
 };

  return (
    <form onSubmit={submit}>
      <input name="value" placeholder="0.05" onChange={nameChangeHandler} className="input" required />
      <button 
        disabled={readIsPending || writeIsPending || isConfirming} 
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4"
      >
        { writeIsPending ? 'Confirming...' : 'Deposit'} 
      </button>
      {hash && <div>Transaction Hash: {hash}</div>} 
      {isConfirming && <div>Waiting for confirmation...</div>} 
      {isConfirmed && <div>Transaction confirmed.</div>} 
      {isToSmallBallance && <div><p className="text-red-700 text-opacity-100 text-2xl">to small balance</p></div>}
      {valueTosend && <div>valueTosend: {valueTosend}</div>} 
      {writeError && (
        <div>Error: {(writeError as BaseError).shortMessage || writeError.message}</div>
      )}
    </form>
  )
}
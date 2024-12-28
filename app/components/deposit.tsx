'use client'

import * as React from 'react'
import { useWriteContract } from 'wagmi'
import {  type BaseError, useWaitForTransactionReceipt } from 'wagmi' 
import { parseEther } from 'viem' 
import { abi } from '.././utils//payableAbi'


const contractAddress = '0x8a888732Fd30dF703d796F8ECb000ccb6F4cd3Ed' // <- payable contract
 
export function Deposit() {
  const { 
    data: hash, 
    error,
    isPending,
    writeContract 
  } = useWriteContract() 


  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    //const to = formData.get('address') as `0x${string}` 
    const value = formData.get('value') as string 
    writeContract({
      address: contractAddress,
      abi,
      functionName: 'depositE',
      value : parseEther('0.1'),
    })
  } 

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 

  return (
    <form onSubmit={submit}>
      <input name="value" placeholder="0.05" required />

      <div className="relative inline-flex  group">
        <div
            className="absolute transitiona-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt">
        </div>
        <button 
        disabled={isPending} 
        type="submit"
         className="relative inline-flex items-center justify-center px-4 py-2 text-base font-bold text-white transition-all duration-200 bg-gray-900 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
         >
        {isPending ? 'Confirming...' : 'Deposit'} 
        </button>
      </div>


     
      {hash && <div>Transaction Hash: {hash}</div>} 
      {isConfirming && <div>Waiting for confirmation...</div>} 
      {isConfirmed && <div>Transaction confirmed.</div>} 
      {error && (
        <div>Error: {(error as BaseError).shortMessage || error.message}</div>
      )}
    </form>
  )
}
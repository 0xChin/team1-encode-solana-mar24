import * as anchor from "@coral-xyz/anchor"
import { Program  } from "@coral-xyz/anchor"
import { PublicKey } from "@solana/web3.js";
import { NotABet } from "../../target/types/not_a_bet";

export async function requestAirdrop(
    requester:PublicKey,
    amount:number,
    program:Program<NotABet>
) {
    let txHash=await program.provider.connection.requestAirdrop(
       requester,amount 
    );
    await program.provider.connection.confirmTransaction(txHash);
}
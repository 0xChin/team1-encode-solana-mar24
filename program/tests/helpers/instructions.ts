import * as anchor from "@coral-xyz/anchor"
import { Program  } from "@coral-xyz/anchor"
import { PublicKey } from "@solana/web3.js";
import { NotABet } from "../../target/types/not_a_bet";


export async function createFactoryAccount(
    factoryAccountPDA: anchor.web3.PublicKey,
    gameMaster: anchor.web3.Signer,
    systemProgram: anchor.web3.PublicKey,
    program : Program<NotABet>,
) {
    const txHash = await program.methods
    .createGameFactory()
    .accounts({
        factory: factoryAccountPDA,
        gameMaster:gameMaster.publicKey,
        systemProgram: systemProgram,
    }).signers([gameMaster]).rpc();

    await program.provider.connection.confirmTransaction(txHash);
    console.log('Factory creation hash:',txHash);   
}

export async function createGameAccount(
    factoryAccountPDA: anchor.web3.PublicKey,
    gameMaster: anchor.web3.Signer,
    gameAccount: anchor.web3.PublicKey,
    systemProgram: anchor.web3.PublicKey,
    baseBounty :anchor.BN,
    number :anchor.BN,
    salt :anchor.BN,
    program : Program<NotABet>,
) {
    const txHash = await program.methods
    .createGame(baseBounty,number,salt)
    .accounts({
        globalStorage: factoryAccountPDA,
        game:gameAccount,
        gameMaster:gameMaster.publicKey,
        systemProgram: systemProgram,
    }).signers([gameMaster]).rpc();

    await program.provider.connection.confirmTransaction(txHash);
    console.log('Factory creation hash:',txHash);   
}
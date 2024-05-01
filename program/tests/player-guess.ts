import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NotABet } from "../target/types/not_a_bet";

import {createGameAccount,tryGuessAction} from './helpers/instructions'
import {deriveGameFactoryAddress,deriveGameAddress,derivePlayerAddress} from './helpers/derive-accounts'
import {requestAirdrop} from './helpers/utils'
import { assert } from "chai";

describe('guess', () => { 

    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env())
    
    const program = anchor.workspace.NotABet as Program<NotABet>
    const wallet = anchor.workspace.NotABet.provider.wallet
      .payer as anchor.web3.Keypair
    
    const factoryMaster = wallet
    const gameMaster = new anchor.web3.Keypair();
    const player = new anchor.web3.Keypair();
    const [factoryAccountPDA] = deriveGameFactoryAddress(factoryMaster,program.programId);

    const [gamePDA] = deriveGameAddress(
        factoryAccountPDA,
        new anchor.BN(1),
        program.programId
    );
    let baseBounty;

    before(async ()=>{
    
        let amountToSend=15 * anchor.web3.LAMPORTS_PER_SOL;
        await requestAirdrop(gameMaster.publicKey,amountToSend,program);
        
        await requestAirdrop(player.publicKey,amountToSend,program);
        
        new Promise(resolve => setTimeout(resolve, 500));
        {
            const txCreationFactory = await program.methods
            .createGameFactory()
            .accounts({
                factory: factoryAccountPDA,
                gameMaster:factoryMaster.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([factoryMaster]).rpc();
        
            await program.provider.connection.confirmTransaction(txCreationFactory);
            console.log('Creation hash:',txCreationFactory);
        }
        
        let factoryAccount = await program.account.gameFactoryStorage.fetch(factoryAccountPDA);

        baseBounty = new anchor.BN(
            5 * anchor.web3.LAMPORTS_PER_SOL
        ); // 5 SOl
        const salt = new anchor.BN(2);
        const number = new anchor.BN(22);

         
        await createGameAccount(
            factoryAccountPDA,
            gameMaster,
            gamePDA,
            anchor.web3.SystemProgram.programId,
            baseBounty,
            number,salt,
            program
        );

        let gameAccount =  await program.account.game.fetch(gamePDA);
        console.log('Factory Account',factoryAccount);
        console.log('Game Account',gameAccount);
        console.log('Factory PDA',factoryAccountPDA);
        console.log('Game PDA',gamePDA);

    })
    /**
     * @todo Todos los casos en los que se rompe :)
     */
    it('Player guess',async () => {
        const [playerPDA] = derivePlayerAddress(
            gamePDA,
            player.publicKey,
            program.programId
        );
        const guess = new anchor.BN(77);
        const salt = new anchor.BN(6);
        const gameId = new anchor.BN(1);
        let gameBalanceBefore = await program.provider.connection.getBalance(gamePDA);
        await tryGuessAction(
            gamePDA,
            playerPDA,
            player,
            factoryAccountPDA,
            anchor.web3.SystemProgram.programId,
            gameId,
            guess,
            salt,
            program
        );

        let playerAccount =  await program.account.player.fetch(playerPDA);

        assert.equal(player.publicKey.toString(),playerAccount.playerAddress.toString(),'No se guardo el pubkey del player');
        assert.equal(gamePDA.toString(),playerAccount.game.toString(),'No se guardo el pubkey del game');

        let gameBalanceAfter = await program.provider.connection.getBalance(gamePDA);
        const deltaBalance = anchor.web3.LAMPORTS_PER_SOL/10;
        console.log('Balance',gameBalanceAfter);
        console.log('Delta',deltaBalance);
        console.log('Balance+Delta',gameBalanceBefore+deltaBalance);

        assert.equal(gameBalanceAfter,gameBalanceBefore+deltaBalance,'Falso balance');
    })



 })

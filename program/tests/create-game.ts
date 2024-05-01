import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NotABet } from "../target/types/not_a_bet";

import { assert } from "chai"
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet"
import {createFactoryAccount,createGameAccount} from './helpers/instructions'
import {deriveGameFactoryAddress,deriveGameAddress} from './helpers/derive-accounts'

describe("Create Game", () => {
  
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env())

  const program = anchor.workspace.NotABet as Program<NotABet>
  const wallet = anchor.workspace.NotABet.provider.wallet
    .payer as anchor.web3.Keypair

  const factoryMaster = wallet
  const gameMaster = new anchor.web3.Keypair();
  const [factoryAccountPDA] = deriveGameFactoryAddress(factoryMaster,program.programId)

  before(async ()=>{

    let amountToSend=15 * anchor.web3.LAMPORTS_PER_SOL;
    let txHash=await program.provider.connection.requestAirdrop(
      gameMaster.publicKey,amountToSend 
    );
    await program.provider.connection.confirmTransaction(txHash);
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

    assert.equal(factoryAccount.currentGameId.toNumber(),1,'Uh no se guardo el number');
    assert.equal(factoryAccount.masterKey.toString(),factoryMaster.publicKey.toString(),'Uh no se guardo el number');
    console.log('Factory Account',factoryAccount);
  })
  /*
    @todo Falta hacer los casos en los cuales se rompa
    1. Mal derive
    2. No alcanza el balance del signer
    3. 
  */
  it("Create Game:: success", async () => {

    const [gamePDA] = deriveGameAddress(
      factoryAccountPDA,
      new anchor.BN(1),
      program.programId
    );
    const baseBounty = new anchor.BN(
      5 * anchor.web3.LAMPORTS_PER_SOL
    ); // 5 SOl
    const salt = new anchor.BN(2);
    const number = new anchor.BN(22);
    try {
       
      await createGameAccount(
        factoryAccountPDA,
        gameMaster,
        gamePDA,
        anchor.web3.SystemProgram.programId,
        baseBounty,
        number,salt,
        program
      );
      
    } catch (error) {
      console.log(error);
    }

    let gameAccount =  await program.account.game.fetch(gamePDA);
    console.log('GameAccount',gameAccount);
    assert.equal(gameAccount.players,null,'Wrong players');
    assert.equal(
      gameAccount.gameMaster.toString(),
      gameMaster.publicKey.toString(),
      'Wrong gameMaster'
    );

    assert.equal(gameAccount.bounty.toNumber(),baseBounty.toNumber(),'Wrong bounty');
    // assert.equal(gameAccount.startTimeStamp,null,'Wrong players');



    // const txHash = await program.methods
    //   .createGame(
    //     8 // 8 Items per player
    //   )
    //   .accounts({
    //     game: gameKey,
    //     gameMaster: gameMaster.publicKey,
    //     treasury: treasury.publicKey,
    //     systemProgram: anchor.web3.SystemProgram.programId,
    //   })
    //   .signers([treasury])
    //   .rpc()

    // await program.provider.connection.confirmTransaction(txHash)

    // // Print out if you'd like
    // // const account = await program.account.game.fetch(gameKey);
  })
})


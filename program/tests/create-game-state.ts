import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NotABet } from "../target/types/not_a_bet";

import {deriveGameFactoryAddress} from './helpers/derive-accounts'

import { assert } from "chai"


describe('Create game factory account',function(){
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env())

  const program = anchor.workspace.NotABet as Program<NotABet>
  const wallet = anchor.workspace.NotABet.provider.wallet
    .payer as anchor.web3.Keypair

  const gameMaster = wallet
  const notMaster = new anchor.web3.Keypair

  it('CreateAccount',async () => {
    const [factoryAccountPDA] = deriveGameFactoryAddress(gameMaster,program.programId);
    let balanceBefore = await program.provider.connection.getBalance(gameMaster.publicKey);
    console.log('Balance Before:',balanceBefore)

    const txHash = await program.methods
        .createGameFactory()
        .accounts({
        factory: factoryAccountPDA,
        gameMaster:gameMaster.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([gameMaster]).rpc();

    await program.provider.connection.confirmTransaction(txHash);
    console.log('Creation hash:',txHash);

    let balanceAfter = await program.provider.connection.getBalance(gameMaster.publicKey);
    console.log('Balance After:',balanceAfter);

    let factoryAccount = await program.account.gameFactoryStorage.fetch(factoryAccountPDA);
    
    assert.equal(factoryAccount.currentGameId.toNumber(),1,'Wrong current id');

    let factoryBalance = await program.provider.connection.getBalance(factoryAccountPDA);
    
    let expectedBalance = 10 * anchor.web3.LAMPORTS_PER_SOL ;
    // esto es porque el balance tiene que ser los 10SOL + el balance de renta
    assert(factoryBalance > expectedBalance,'Wrong balance');
        
    console.log('Factory Account',factoryAccount);
    console.log('Expected Master ',gameMaster.publicKey);

    assert.equal(
        factoryAccount.masterKey.toString(),
        gameMaster.publicKey.toString(),
        'Wrong masterkey'
    );
  })
})
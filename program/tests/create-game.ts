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
  const [factoryAccountPDA] = deriveGameFactoryAddress(gameMaster,program.programId)

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
          gameMaster:gameMaster.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        }).signers([gameMaster]).rpc();
  
      await program.provider.connection.confirmTransaction(txCreationFactory);
      console.log('Creation hash:',txCreationFactory);
    }

  })
  /*
    @todo Falta hacer los casos en los cuales se rompa
    1. Mal derive
    2. No alcanza el balance del signer
    3. 
  */
  it("Create Game:: success", async () => {

    const [gameKey] = deriveGameAddress(
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
        // baseBounty,
        // number,
        salt,
        gameKey,
        gameMaster,
        factoryAccountPDA,
        anchor.web3.SystemProgram.programId,
        program
      );
      
    } catch (error) {
      console.log(error);
    }

    let gameAccount =  await program.account.game.fetch(gameKey);
    console.log('GameAccount',gameAccount);
    assert.equal(gameAccount.players,null,'Wrong players');
    assert.equal(
      gameAccount.gameMaster.toString(),
      gameMaster.publicKey.toString(),
      'Wrong gameMaster'
    );

    assert.equal(gameAccount.bounty,baseBounty,'Wrong bounty');
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


// use anchor_lang::prelude::*;
// use crate::structs::{Game,GameFactoryStorage};
// use crate::helpers::{send_game_participation_fee};
// use crate::utils::events::GameCreated;
// use std::collections::hash_map::DefaultHasher;
// use std::hash::{Hash, Hasher};

// // ----------- CREATE GAME ----------
// // ----------- CREATE GAME ----------

// #[derive(Accounts)]
// pub struct CreateGameInsr<'info> {
//     #[account(
//         init, 
//         seeds=[
//             b"GAME", 
//             global_storage.key().as_ref(),
//             global_storage.current_game_id.to_le_bytes().as_ref()
//         ],
//         bump,
//         payer = game_master, 
//         space = Game::MIN_SPACE 
//     )]
//     pub game: Account<'info, Game>,

//     #[account(mut)]
//     pub game_master: Signer<'info>,

//     /// CHECK: We need to check the global game state with current_game_id
//     /// So a player can create several games at the same time
//     pub global_storage: Account<'info,GameFactoryStorage>,
//     pub system_program: Program<'info, System>,
// }
// // base_bounty is the amount of lamports to send to the account
// pub fn create_game_handler(
//     ctx: Context<CreateGameInsr>,
//     base_bounty:u64,
//     number:u128, 
//     salt:u128) -> Result<()> {

//     let game_account = &mut ctx.accounts.game;
//     let global_st = &mut ctx.accounts.global_storage;
//     let mut game_id:u64=0;
//     // Crear un hasher
//     {
//         send_game_participation_fee(
//             base_bounty.clone(),
//             game_account,
//             &ctx.accounts.game_master,
//             &ctx.accounts.system_program
//         )?;
//         game_id=global_st.current_game_id.clone();
//         global_st.current_game_id+=1;
//     }
//     let mut commit_hash:[u8; 32]=todo!();
//     {
//         // HASH answer
//         let mut hasher = DefaultHasher::new();
        
//         // Escribir los datos en el hasher
//         hasher.write_u128(number);
//         hasher.write_u128(salt);
        
//         //TODO : solve this thing because neet to take a break
//         // Obtener el resultado del hash
//         let result = hasher.finish().to_le_bytes();
//         // let hash_bytes = {
//         //     let mut hash_data:Vec<u8> = Vec::new();
//         //     hash_data.extend(&result);
//         //     hash_data.extend(&[0; 24]); // Rellenar con ceros para obtener una longitud de 32 bytes
//         //     hash_data
//         // };
//     }

//     {
//         // Create account & mod state
//         game_account.create_new_game(
//             &ctx.accounts.game_master.key(),
//             base_bounty.clone(),
//             game_id.clone(),
//             &commit_hash
//         )?;
//         msg!("Game created!");
//         emit!(GameCreated{
//             game_id:game_id,
//             game:game_account.key(),
//             time_stamp:game_account.start_time_stamp,
//         });
//     }

//     Ok(())
// }

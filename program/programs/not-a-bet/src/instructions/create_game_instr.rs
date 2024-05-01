
use anchor_lang::prelude::*;
use crate::structs::{Game,GameFactoryStorage};
use crate::helpers::{send_game_participation_fee};
use crate::utils::events::GameCreated;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

// ----------- CREATE GAME ----------
// ----------- CREATE GAME ----------

#[derive(Accounts)]
pub struct CreateGameInsr<'info> {
    #[account(
        init, 
        seeds=[
            b"GAME", 
            global_storage.key().as_ref(),
            global_storage.current_game_id.to_le_bytes().as_ref()
        ],
        bump,
        payer = game_master, 
        space = Game::MIN_SPACE 
    )]
    pub game: Account<'info, Game>,

    #[account(mut)]
    pub game_master: Signer<'info>,

    /// CHECK: We need to check the global game state with current_game_id
    /// So a player can create several games at the same time
    pub global_storage: Account<'info,GameFactoryStorage>,
    pub system_program: Program<'info, System>,
}
// base_bounty is the amount of lamports to send to the account
pub fn create_game_handler(
    ctx: Context<CreateGameInsr>,
    base_bounty:u64,
    number:u64, 
    salt:u64) -> Result<()> {

    let game_account = &mut ctx.accounts.game;
    let global_st = &mut ctx.accounts.global_storage;
    let mut game_id:u64=0;
    // Crear un hasher
    {
        send_game_participation_fee(
            base_bounty.clone(),
            game_account,
            &ctx.accounts.game_master,
            &ctx.accounts.system_program
        )?;
        game_id=global_st.current_game_id.clone();
        global_st.current_game_id+=1;
    }
    let mut commit_hash:[u8; 32]=[0u8;32];
    {
        // HASH answer
        let mut hasher = DefaultHasher::new();
        
        // Escribir los datos en el hasher
        hasher.write_u64(number);
        hasher.write_u64(salt);
        
        //TODO : solve this thing because neet to take a break
        // Obtener el resultado del hash
        let result = hasher.finish().to_le_bytes();
        for (i,rb )in result.iter().enumerate(){
            commit_hash[i]=rb.clone();
        }
        // let hash_bytes = {
        //     let mut hash_data:Vec<u8> = Vec::new();
        //     hash_data.extend(&result);
        //     hash_data.extend(&[0; 24]); // Rellenar con ceros para obtener una longitud de 32 bytes
        //     hash_data
        // };
    }

    {
        // Create account & mod state
        game_account.create_new_game(
            &ctx.accounts.game_master.key(),
            base_bounty.clone(),
            game_id.clone(),
            &commit_hash
        )?;
        msg!("Game created!");
        emit!(GameCreated{
            game_id:game_id,
            game:game_account.key(),
            time_stamp:game_account.start_time_stamp,
        });
    }

    Ok(())
}

use crate::helpers::{hasher_handler, send_game_participation_fee, PARTICIPATION_FEE};
use crate::structs::{Game, Player,GameFactoryStorage};
use anchor_lang::prelude::*;
use crate::utils::events::PlayerAccountCreated;


// ----------- CREATE GAME ----------
// ----------- CREATE GAME ----------

#[derive(Accounts)]
#[instruction(game_id:u64)]
pub struct TryGuessInstr<'info> {
    #[account(
        mut, 
        seeds=[
            b"GAME", 
            global_storage.key().as_ref(),
            game_id.to_le_bytes().as_ref()
        ],
        bump,
        realloc = game.calc_new_space_adding_pubkey() ,
        realloc::payer = player, 
        realloc::zero = false,
    )]
    pub game: Account<'info, Game>,

    #[account(
        init,
        seeds = [
            b"PLAYER",
            game.key().as_ref(),
            player.key().as_ref()
        ],
        bump,
        payer = player, 
        space = Player::MIN_SPACE 
    )]
    pub player_account:Account<'info,Player>,

    #[account(mut)]
    pub player: Signer<'info>,

    /// CHECK: We need to check the global game state with current_game_id
    /// So a player can create several games at the same time
    pub global_storage: Account<'info,GameFactoryStorage>,
    pub system_program: Program<'info, System>,
}

pub fn try_guess_handler(
    ctx:Context<TryGuessInstr>,
    game_id:u64,
    guess_number:u64,salt:u64
)->Result<()>{
    let game_account= &mut ctx.accounts.game;
    let player_account= &mut ctx.accounts.player_account;
    let hashed_attempt = hasher_handler(guess_number,salt);
    
    send_game_participation_fee(
        PARTICIPATION_FEE,
        game_account,
        &ctx.accounts.player.to_account_info(),
        &ctx.accounts.system_program
    )?;

    player_account.player_address = ctx.accounts.player.key().clone();
    player_account.game = ctx.accounts.game.key().clone();
    player_account.guess_hash = hashed_attempt.clone();
    
    emit!(PlayerAccountCreated{
        player_account:player_account.key().clone(),
        game: ctx.accounts.game.key().clone(),
        attempt:hashed_attempt.clone(),
    });


    
    Ok(())
}
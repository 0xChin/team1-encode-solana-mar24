use anchor_lang::prelude::*;
use crate::structs::{Game,GameFactoryStorage};
use crate::helpers::send_game_participation_fee;

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

pub fn create_game_handler(ctx: Context<CreateGameInsr>, base_bounty:u64) -> Result<()> {

    let game_account = &mut ctx.accounts.game;

    game_account.game_master= ctx.accounts.game_master.key().clone();
    game_account.bounty = base_bounty.clone();
    game_account.closest_player = Pubkey::default();
    // TODO : 
    // game_account.commit_hash=


    // ctx.accounts.game.game_master = ctx.accounts.game_master.key().clone();
    // ctx.accounts.game.treasury = ctx.accounts.treasury.key().clone();

    // ctx.accounts.game.action_points_collected = 0;
    // ctx.accounts.game.game_config.max_items_per_player = max_items_per_player;

    // msg!("Game created!");

    Ok(())
}

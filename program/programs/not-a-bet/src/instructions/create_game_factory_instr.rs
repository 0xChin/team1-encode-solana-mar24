use crate::helpers::send_factory_creation_fee;
use crate::utils::events::GameFactoryCreated;
use crate::structs::GameFactoryStorage;
use anchor_lang::prelude::*;




#[derive(Accounts)]
pub struct CreateGameFactoryInsr<'info> {
    #[account(
        init, 
        seeds=[
            b"FACTORY-GAME",
            game_master.key().as_ref()
        ],
        bump,
        payer = game_master, 
        space = GameFactoryStorage::LEN
    )]
    pub factory: Account<'info, GameFactoryStorage>,

    #[account(mut)]
    pub game_master: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_game_factory_handler(ctx:Context<CreateGameFactoryInsr>)->Result<()>{
    let factory_account = &mut ctx.accounts.factory;

    factory_account.master_key = ctx.accounts.game_master.key().clone();
    factory_account.current_game_id = 1;
    send_factory_creation_fee(
        factory_account, 
        &ctx.accounts.game_master.to_account_info(),  
        &ctx.accounts.system_program.to_account_info()
    )?;
    emit!(GameFactoryCreated {
        factory: factory_account.key(),
        master_key: factory_account.master_key
    });

    msg!("Game Factory created!");
    Ok(())
}
use anchor_lang::prelude::*;
use anchor_lang::solana_program::log::sol_log_compute_units;

declare_id!("6Suc2n5Yf9ZwXWJdq4JzxbMNP4BJuEQ9YhTn7Btjgde7");

pub mod instructions;
pub mod utils;
use crate::utils::*;
use instructions::create_game_factory_instr::*;
use instructions::create_game_instr::*;

#[program]
pub mod not_a_bet {
    use super::*;
    /// To create a game factory account, users MUST pay 10 SOL
    pub fn create_game_factory(ctx: Context<CreateGameFactoryInsr>) -> Result<()> {
        create_game_factory_handler(ctx)?;
        sol_log_compute_units();
        Ok(())
    }

    pub fn create_game(
        ctx: Context<CreateGameInsr>,
        base_bounty: u64,
        // number: u64,
        // salt: u64,
    ) -> Result<()> {
        create_game_handler(ctx, base_bounty)?;
        sol_log_compute_units();
        Ok(())
    }
}

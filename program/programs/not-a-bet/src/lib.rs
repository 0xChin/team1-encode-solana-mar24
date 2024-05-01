use anchor_lang::prelude::*;

declare_id!("6Suc2n5Yf9ZwXWJdq4JzxbMNP4BJuEQ9YhTn7Btjgde7");

#[program]
pub mod not_a_bet {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

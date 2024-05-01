use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use super::structs::Game;


pub fn send_participation_fee<'info>(
    lamports_to_send: u64,
    game_account: &mut Account<'info, Game>,
    player: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
) -> Result<()> {
    let cpi_context = CpiContext::new(
        system_program.clone(),
        Transfer {
            from: player.clone(),
            to: game_account.to_account_info().clone(),
        },
    );
    transfer(cpi_context, lamports_to_send)?;

    msg!("Player transfered {} to game account ", lamports_to_send);

    Ok(())
}

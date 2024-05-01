use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
pub const LAMPORTS_PER_SOL:u64 = 1_000_000_000;
// 0.1 SOL
pub const PARTICIPATION_FEE:u64 = 100_000_000;

use super::structs::{Game,GameFactoryStorage};

pub fn hasher_handler(number:u64,salt:u64)->[u8;32]{
    let mut commit_hash:[u8; 32]=[0u8;32];

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
    commit_hash
}

pub fn send_factory_creation_fee<'info>(
    game_factory_account: &mut Account<'info, GameFactoryStorage>,
    game_master: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
)->Result<()>{
    let lamports_to_send=10*LAMPORTS_PER_SOL;
    let cpi_context = CpiContext::new(
        system_program.clone(),
        Transfer {
            from: game_master.clone(),
            to: game_factory_account.to_account_info().clone(),
        },
    );
    transfer(cpi_context, lamports_to_send)?;

    msg!("Game master transfered {} to factory account ", lamports_to_send);
    Ok(())
}


pub fn send_game_participation_fee<'info>(
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

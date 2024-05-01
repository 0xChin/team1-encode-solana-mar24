use std::str::Bytes;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;

#[account]
pub struct Game {
    // 8 bytes de la account +
    pub game_master: Pubkey,   // 32 bytes
    pub bounty: u64,           // 8 bytes
    pub commit_hash: [u8; 32], // 32 bytes
    pub start_time_stamp: i64, // 8 bytes

    pub closest_player: Pubkey, // 32 bytes, defaukt account at start, then when game ends
    pub players: Option<Vec<Pubkey>>, // 1(option) + 32*i (donde i es la longitud del vector)
}

impl Game {
    /// 8 del account identifier
    /// 32 del game_master
    /// 8 del bounty
    /// 32 del commit hash
    /// 8 del time_stamp
    /// 32 del closest player
    /// 1 del option
    pub const MIN_SPACE: u32 = 8 + 32 + 8 + 32 + 8 + 32 + 1;

    pub fn create_new_game(
        game_master: &Pubkey,
        start_bounty: u64,
        commit_hash: &[u8; 32],
    ) -> Self {
        let time_now = Clock::get().unwrap().unix_timestamp;
        Self {
            game_master: game_master.clone(),
            bounty: start_bounty.clone(),
            commit_hash: commit_hash.clone(),
            start_time_stamp: time_now,
            closest_player: Pubkey::default(),
            players: None,
        }
    }
    pub fn calc_new_space_adding_pubkey(&self) -> u32 {
        let mut new_space = Self::MIN_SPACE;
        match &self.players {
            None => { /*No hacemos nada porque se suma abajo */ }
            Some(players_vec) => {
                for _player in players_vec {
                    new_space += 32;
                }
            }
        }
        new_space += 32;

        new_space
    }
    ///@todo Despues hay que decidir si se revierte o se le cobra igual?? jaja salu2 para la DAO 
    pub fn player_in_game_check(&self, new_player: &Pubkey) -> bool {
        let mut player_in_game: bool = false;
        match &self.players {
            None => {}
            Some(players_vec) => {
                for player in players_vec {
                    if new_player == player {
                        player_in_game = true;
                    }
                }
            }
        }
        player_in_game
    }
    pub fn add_new_player(&mut self, new_player: Pubkey) -> Result<()> {
        match &mut self.players {
            None => {
                let mut new_vec = Vec::<Pubkey>::new();
                new_vec.push(new_player);
                self.players = Some(new_vec);
            }
            Some(players_vec) => {
                players_vec.push(new_player);
            }
        }
        Ok(())
    }
}

#[account]
pub struct Player {
    // 8 bytes de la account +
    pub player_address: Pubkey, // 32 bytes
    pub game: Pubkey,           // 32 bytes
    pub guess: u64,             // 8 bytes  ( set on reveal)
    pub guess_hash: [u8; 32],   // 32 bytes (set on commit)
}

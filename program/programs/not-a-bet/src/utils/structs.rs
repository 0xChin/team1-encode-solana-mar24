use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;

#[account]
pub struct GameFactoryStorage {
    /// This account is the one that will receive the comissions so we can fund the DAO (guiño guiño)
    pub current_game_id: u64,
    pub master_key: Pubkey,
}

impl GameFactoryStorage {
    /// 8   del account
    /// 8   del current_game_id
    /// 32  del master_key
    pub const LEN: usize = 8 + 8 + 32;
}

#[account]
pub struct Game {
    // 8 bytes de la account +
    pub game_master: Pubkey,   // 32 bytes
    pub bounty: u64,           // 8 bytes
    pub game_id: u64,          // 8 bytes
    pub commit_hash: [u8; 32], // 32 bytes
    pub start_time_stamp: i64, // 8 bytes

    pub closest_player: Pubkey, // 32 bytes, defaukt account at start, then when game ends
    pub players: Option<Vec<Pubkey>>, // 1(option) + 32*i (donde i es la longitud del vector)
}

impl Game {
    /// 8 del account identifier
    /// 32 del game_master
    /// 8 del bounty
    /// 8 del game_id
    /// 32 del commit hash
    /// 8 del time_stamp
    /// 32 del closest player
    /// 1 del option
    pub const MIN_SPACE: usize = 8 + 32 + 8 + 8 + 32 + 8 + 32 + 1;

    pub fn create_new_game(
        &mut self,
        game_master: &Pubkey,
        start_bounty: u64,
        game_id: u64,
        commit_hash: &[u8; 32],
    ) -> Result<()> {
        let time_now = Clock::get().unwrap().unix_timestamp;
        self.game_master = game_master.clone();
        self.bounty = start_bounty;
        self.game_id = game_id;
        self.commit_hash = commit_hash.clone();
        self.start_time_stamp = time_now;
        self.closest_player = Pubkey::default();
        self.players = None;

        Ok(())
    }
    pub fn calc_new_space_adding_pubkey(&self) -> usize {
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

impl Player {
    /// 8 del account
    /// 32 del PubKey (del usuario)
    /// 32 del PubKey (del game)
    /// 8 del guess (se prende cuando este el reveal)
    /// 32 del commit
    pub const MIN_SPACE :usize = 8+32+32+8+32;
}
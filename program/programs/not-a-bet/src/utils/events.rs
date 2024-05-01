use anchor_lang::prelude::*;

// ----------- EVENTS ----------
// ----------- EVENTS ----------
#[event]
pub struct GameFactoryCreated {
    pub factory: Pubkey,
    pub master_key:Pubkey,
}


#[event]
pub struct GameCreated {
    pub game_id:u64,
    pub game: Pubkey,
    pub time_stamp:i64,
}

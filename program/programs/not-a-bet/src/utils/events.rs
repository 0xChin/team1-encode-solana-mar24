use anchor_lang::prelude::*;

// ----------- EVENTS ----------
// ----------- EVENTS ----------
#[event]
pub struct GameCreated {
    pub game: Pubkey,
    pub time_stamp:i64,
}

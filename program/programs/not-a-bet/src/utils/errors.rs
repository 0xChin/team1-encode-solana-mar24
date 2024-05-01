use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("PlayerAccount cant participate more than one time in a specific game")]
    PlayerAlreadyInGame,
}
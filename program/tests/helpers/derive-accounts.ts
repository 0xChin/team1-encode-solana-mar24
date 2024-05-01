import * as anchor from "@coral-xyz/anchor"
import { Program  } from "@coral-xyz/anchor"
import { PublicKey } from "@solana/web3.js";
import { NotABet } from "../../target/types/not_a_bet";


/**
 * Derive the PDA of a GameFactory program account.
 * @export
 * @param {anchor.web3.Keypair} game_master
 * @param {PublicKey} program 
 * @returns {[PublicKey, number]}
 */
export function deriveGameFactoryAddress(
    game_master: anchor.web3.Keypair, 
    program: PublicKey
): [PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("FACTORY-GAME"), game_master.publicKey.toBuffer()],program);
}

/**
 * Derive the PDA of a Game program account.
 * @export
 * @param {PublicKey} gameFactory
 * @param {anchor.BN} gameId
 * @param {PublicKey} program 
 * @returns {[PublicKey, number]}
 */
export function deriveGameAddress(
    gameFactory: PublicKey, 
    gameId: anchor.BN,
    program: PublicKey
): [PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("GAME"), 
            gameFactory.toBuffer(),
            gameId.toBuffer('le',8)
        ],
        program
    );
}

/**
 * Derive the PDA of a Player program account.
 * @export
 * @param {PublicKey} game
 * @param {PublicKey} player
 * @param {anchor.BN} gameId
 * @param {PublicKey} program 
 * @returns {[PublicKey, number]}
 */
 export function derivePlayerAddress(
    game: PublicKey, 
    player: PublicKey, 
    program: PublicKey
): [PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("PLAYER"), 
            game.toBuffer(),
            player.toBuffer()
        ],
        program
    );
}
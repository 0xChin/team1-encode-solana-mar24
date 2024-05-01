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
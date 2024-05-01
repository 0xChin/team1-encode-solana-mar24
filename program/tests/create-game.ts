import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NotABet } from "../target/types/not_a_bet";

import { assert } from "chai"
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet"

describe.skip("Create Game", () => {
  
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env())

  const program = anchor.workspace.NotABet as Program<NotABet>
  const wallet = anchor.workspace.NotABet.provider.wallet
    .payer as anchor.web3.Keypair
  const gameMaster = wallet
  const player = wallet

  const treasury = anchor.web3.Keypair.generate()

  it("Create Game", async () => {
    const [gameKey] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("GAME"), treasury.publicKey.toBuffer()],
      program.programId
    )

    const txHash = await program.methods
      .createGame(
        8 // 8 Items per player
      )
      .accounts({
        game: gameKey,
        gameMaster: gameMaster.publicKey,
        treasury: treasury.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([treasury])
      .rpc()

    await program.provider.connection.confirmTransaction(txHash)

    // Print out if you'd like
    // const account = await program.account.game.fetch(gameKey);
  })
})

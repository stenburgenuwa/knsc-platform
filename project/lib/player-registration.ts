// Official KNSCL registration numbers are only assigned once a player has
// both League Manager and Platform Owner approval. Numbers are drawn from a
// Postgres sequence (see the add_player_registration_number migration) so
// concurrent approvals can never produce a duplicate — the database itself
// guarantees uniqueness, at worst leaving a gap in the sequence.

type Tx = { $queryRaw: any; player: { update: (args: any) => Promise<any> } };

async function nextRegistrationNumber(tx: Tx): Promise<string> {
  const rows = await tx.$queryRaw<{ nextval: bigint }[]>`SELECT nextval('player_registration_seq')`;
  const n = Number(rows[0].nextval);
  return `KNSCL${String(n).padStart(3, '0')}`;
}

export async function maybeAssignRegistrationNumber(
  tx: Tx,
  player: { id: string; registrationNumber: string | null; leagueManagerApproved: boolean; platformOwnerApproved: boolean }
): Promise<string | null> {
  if (player.registrationNumber) return player.registrationNumber;
  if (!player.leagueManagerApproved || !player.platformOwnerApproved) return null;

  const registrationNumber = await nextRegistrationNumber(tx);
  await tx.player.update({ where: { id: player.id }, data: { registrationNumber } });
  return registrationNumber;
}

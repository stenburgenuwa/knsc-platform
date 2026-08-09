// Official KNSCL registration numbers are only assigned once a player has
// both League Manager and Platform Owner approval. Numbers are drawn from a
// Postgres sequence (see the add_player_registration_number migration) so
// concurrent approvals can never produce a duplicate — the database itself
// guarantees uniqueness, at worst leaving a gap in the sequence.

type Tx = { $queryRaw: any; player: { update: (args: any) => Promise<any> } };

/** The one place the KNSCL number format is defined. */
export function formatRegistrationNumber(n: number): string {
  return `KNSCL${String(n).padStart(3, '0')}`;
}

export function parseRegistrationNumber(value: string | null): number | null {
  const m = value?.match(/^KNSCL(\d+)$/);
  return m ? Number(m[1]) : null;
}

async function nextRegistrationNumber(tx: Tx): Promise<string> {
  const rows = await tx.$queryRaw<{ nextval: bigint }[]>`SELECT nextval('player_registration_seq')`;
  return formatRegistrationNumber(Number(rows[0].nextval));
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

/*
  One-time backfill for players who were registered before official numbers
  existed.

  Who qualifies. The two approval booleans were added by the
  add_player_registration_number migration with a default of false, so every
  row created before it reads as "unapproved" even though those players were
  approved under the single-stage workflow that existed at the time. Their
  `approved` flag is the surviving record of that decision, so it is the
  eligibility test here. Players still waiting in a Team Manager's queue have
  `approved = false` and are correctly skipped — this never hands a number to
  someone who has not been approved.

  Because a number implies approval, the backfill also brings the two flags
  into line for the rows it touches. Leaving them false would mean the
  database asserted both "holds an official KNSCL number" and "was never
  approved", and maybeAssignRegistrationNumber would disagree with a number
  already printed on the player's profile.

  Ordering. Oldest registration first, so the earliest player takes the
  earliest number, with the player id as a deterministic tiebreak for rows
  sharing a timestamp (the seed writes several within the same millisecond).

  Numbering. It fills the lowest numbers not already held, so a league whose
  players have no numbers yet starts at KNSCL001 as expected, and any number
  already issued is stepped over rather than reused. Afterwards the sequence
  is advanced past everything assigned so new approvals continue cleanly. The
  unique index on registrationNumber is the final guarantee: a collision
  fails the transaction rather than silently duplicating.

  Idempotent — a second run finds nothing to do and reports zero.
*/
export type BackfillResult = {
  backfilled: { id: string; name: string; club: string; registeredAt: Date; registrationNumber: string }[];
  preserved: number;
  skippedUnapproved: number;
  range: { from: string; to: string } | null;
};

type BackfillClient = {
  player: { findMany: (args: any) => Promise<any[]>; update: (args: any) => Promise<any> };
  $queryRaw: any;
  $transaction: <T>(fn: (tx: any) => Promise<T>) => Promise<T>;
};

export async function backfillRegistrationNumbers(prisma: BackfillClient): Promise<BackfillResult> {
  return prisma.$transaction(async (tx) => {
    const players = await tx.player.findMany({
      select: {
        id: true, firstName: true, lastName: true, createdAt: true,
        approved: true, registrationNumber: true, club: { select: { name: true } },
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    const taken = new Set<number>(
      players
        .map((p: any): number | null => parseRegistrationNumber(p.registrationNumber))
        .filter((n: number | null): n is number => n !== null)
    );
    const preserved = players.filter((p: any) => p.registrationNumber).length;
    const eligible = players.filter((p: any) => !p.registrationNumber && p.approved);
    const skippedUnapproved = players.filter((p: any) => !p.registrationNumber && !p.approved).length;

    let candidate = 0;
    const backfilled: BackfillResult['backfilled'] = [];

    for (const player of eligible) {
      do {
        candidate += 1;
      } while (taken.has(candidate));
      taken.add(candidate);

      const registrationNumber = formatRegistrationNumber(candidate);
      await tx.player.update({
        where: { id: player.id },
        data: { registrationNumber, leagueManagerApproved: true, platformOwnerApproved: true },
      });
      backfilled.push({
        id: player.id,
        name: `${player.firstName} ${player.lastName}`,
        club: player.club.name,
        registeredAt: player.createdAt,
        registrationNumber,
      });
    }

    // Keep the sequence ahead of every number now in use so the next approval
    // cannot collide with one this backfill just handed out.
    const highest = Math.max(0, ...taken);
    if (highest > 0) {
      await tx.$queryRaw`SELECT setval('player_registration_seq', GREATEST(${highest}::bigint, (SELECT last_value FROM player_registration_seq)))`;
    }

    return {
      backfilled,
      preserved,
      skippedUnapproved,
      range: backfilled.length
        ? { from: backfilled[0].registrationNumber, to: backfilled[backfilled.length - 1].registrationNumber }
        : null,
    };
  });
}

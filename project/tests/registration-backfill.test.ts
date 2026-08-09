import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../lib/prisma';
import { resetTestDb } from './db-helpers';
import { backfillRegistrationNumbers, formatRegistrationNumber, parseRegistrationNumber } from '../lib/player-registration';

const at = (min: number) => new Date(Date.UTC(2026, 0, 1, 12, min));

describe('registration number format', () => {
  it('pads to the KNSCL001 shape', () => {
    expect(formatRegistrationNumber(1)).toBe('KNSCL001');
    expect(formatRegistrationNumber(42)).toBe('KNSCL042');
    expect(formatRegistrationNumber(999)).toBe('KNSCL999');
  });

  it('keeps growing past three digits rather than wrapping', () => {
    expect(formatRegistrationNumber(1000)).toBe('KNSCL1000');
  });

  it('round-trips', () => {
    expect(parseRegistrationNumber('KNSCL007')).toBe(7);
    expect(parseRegistrationNumber(null)).toBeNull();
    expect(parseRegistrationNumber('NOT-A-NUMBER')).toBeNull();
  });
});

describe('backfilling existing players', () => {
  let clubId: string;

  beforeEach(async () => {
    await resetTestDb();
    const club = await prisma.club.create({ data: { name: 'Mtwapa United' } });
    clubId = club.id;
  });

  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  const player = (opts: {
    name: string;
    minutes: number;
    approved?: boolean;
    registrationNumber?: string | null;
  }) =>
    prisma.player.create({
      data: {
        clubId,
        firstName: opts.name,
        lastName: 'Player',
        approved: opts.approved ?? true,
        registrationNumber: opts.registrationNumber ?? null,
        createdAt: at(opts.minutes),
      },
    });

  const numbers = async () =>
    (await prisma.player.findMany({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] })).map(
      (p) => `${p.firstName}:${p.registrationNumber ?? '—'}`
    );

  it('assigns in registration order, oldest first', async () => {
    await player({ name: 'D', minutes: 40 });
    await player({ name: 'B', minutes: 20 });
    await player({ name: 'A', minutes: 10 });
    await player({ name: 'C', minutes: 30 });

    const result = await backfillRegistrationNumbers(prisma);
    expect(result.backfilled.map((b) => b.name.split(' ')[0])).toEqual(['A', 'B', 'C', 'D']);
    expect(await numbers()).toEqual(['A:KNSCL001', 'B:KNSCL002', 'C:KNSCL003', 'D:KNSCL004']);
    expect(result.range).toEqual({ from: 'KNSCL001', to: 'KNSCL004' });
  });

  it('never touches a number that has already been issued', async () => {
    await player({ name: 'Early', minutes: 10, registrationNumber: 'KNSCL050' });
    await player({ name: 'Later', minutes: 20 });

    const result = await backfillRegistrationNumbers(prisma);
    expect(result.preserved).toBe(1);
    const early = await prisma.player.findFirstOrThrow({ where: { firstName: 'Early' } });
    expect(early.registrationNumber).toBe('KNSCL050');
  });

  it('steps over numbers already in use rather than duplicating them', async () => {
    await player({ name: 'Holder', minutes: 5, registrationNumber: 'KNSCL002' });
    await player({ name: 'First', minutes: 10 });
    await player({ name: 'Second', minutes: 20 });

    await backfillRegistrationNumbers(prisma);
    const first = await prisma.player.findFirstOrThrow({ where: { firstName: 'First' } });
    const second = await prisma.player.findFirstOrThrow({ where: { firstName: 'Second' } });
    expect(first.registrationNumber).toBe('KNSCL001');
    expect(second.registrationNumber).toBe('KNSCL003');
  });

  it('skips players who are still awaiting approval', async () => {
    await player({ name: 'Approved', minutes: 10 });
    await player({ name: 'Pending', minutes: 20, approved: false });

    const result = await backfillRegistrationNumbers(prisma);
    expect(result.backfilled).toHaveLength(1);
    expect(result.skippedUnapproved).toBe(1);
    const pending = await prisma.player.findFirstOrThrow({ where: { firstName: 'Pending' } });
    expect(pending.registrationNumber).toBeNull();
  });

  it('records the approvals that the number implies', async () => {
    const p = await player({ name: 'Legacy', minutes: 10 });
    expect(p.leagueManagerApproved).toBe(false);
    expect(p.platformOwnerApproved).toBe(false);

    await backfillRegistrationNumbers(prisma);
    const after = await prisma.player.findUniqueOrThrow({ where: { id: p.id } });
    expect(after.registrationNumber).toBe('KNSCL001');
    expect(after.leagueManagerApproved).toBe(true);
    expect(after.platformOwnerApproved).toBe(true);
  });

  it('is idempotent — running it twice changes nothing the second time', async () => {
    await player({ name: 'A', minutes: 10 });
    await player({ name: 'B', minutes: 20 });

    const first = await backfillRegistrationNumbers(prisma);
    const before = await numbers();

    const second = await backfillRegistrationNumbers(prisma);
    expect(first.backfilled).toHaveLength(2);
    expect(second.backfilled).toHaveLength(0);
    expect(second.range).toBeNull();
    expect(await numbers()).toEqual(before);
  });

  it('produces no duplicates', async () => {
    for (let i = 0; i < 12; i++) await player({ name: `P${i}`, minutes: i });
    await backfillRegistrationNumbers(prisma);
    const all = (await prisma.player.findMany()).map((p) => p.registrationNumber);
    expect(new Set(all).size).toBe(all.length);
    expect(all.every((n) => /^KNSCL\d{3}$/.test(n || ''))).toBe(true);
  });

  it('orders deterministically when timestamps collide', async () => {
    // The seed writes several players inside the same millisecond.
    await Promise.all(['X', 'Y', 'Z'].map((n) => player({ name: n, minutes: 10 })));

    await backfillRegistrationNumbers(prisma);
    const byId = await prisma.player.findMany({ orderBy: { id: 'asc' } });
    expect(byId.map((p) => p.registrationNumber)).toEqual(['KNSCL001', 'KNSCL002', 'KNSCL003']);
  });

  it('leaves the sequence past everything it assigned, so the next approval does not collide', async () => {
    await player({ name: 'A', minutes: 10 });
    await player({ name: 'B', minutes: 20 });
    await backfillRegistrationNumbers(prisma);

    const rows = await prisma.$queryRaw<{ nextval: bigint }[]>`SELECT nextval('player_registration_seq')`;
    expect(Number(rows[0].nextval)).toBeGreaterThan(2);
  });

  it('does nothing to a database with no players', async () => {
    const result = await backfillRegistrationNumbers(prisma);
    expect(result).toEqual({ backfilled: [], preserved: 0, skippedUnapproved: 0, range: null });
  });
});

import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { resetTestDb } from './db-helpers';
import { POST as createPlayer } from '../app/api/players/route';
import { PATCH as patchPlayer } from '../app/api/players/[id]/route';
import { PATCH as approvePlayer } from '../app/api/players/[id]/approve/route';
import { PATCH as rejectPlayer } from '../app/api/players/[id]/reject/route';

function req(method: string, body?: any, token?: string) {
  return new NextRequest('http://localhost/api/players', {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// A 1x1 WebP stands in for the square crop the Team Manager uploads.
const PHOTO = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';

const VALID = {
  firstName: 'Juma',
  lastName: 'Kahindi',
  idNumber: '31234567',
  dateOfBirth: '2001-04-12',
  photoUrl: PHOTO,
};

describe('Player registration, approval and rejection', () => {
  let clubId: string;
  let tmToken: string;
  let lmToken: string;
  let poToken: string;

  beforeEach(async () => {
    await resetTestDb();
    const club = await prisma.club.create({ data: { name: 'Mtwapa United' } });
    clubId = club.id;

    const hash = await bcrypt.hash('x', 4);
    const tm = await prisma.user.create({
      data: { email: 'tm@knscl.co.ke', passwordHash: hash, firstName: 'T', lastName: 'M', role: 'TEAM_MANAGER', clubId },
    });
    const lm = await prisma.user.create({
      data: { email: 'lm@knscl.co.ke', passwordHash: hash, firstName: 'L', lastName: 'M', role: 'LEAGUE_MANAGER' },
    });
    const po = await prisma.user.create({
      data: { email: 'po@knscl.co.ke', passwordHash: hash, firstName: 'P', lastName: 'O', role: 'PLATFORM_OWNER' },
    });
    tmToken = signAccessToken({ sub: tm.id, email: tm.email, role: 'TEAM_MANAGER', clubId });
    lmToken = signAccessToken({ sub: lm.id, email: lm.email, role: 'LEAGUE_MANAGER' });
    poToken = signAccessToken({ sub: po.id, email: po.email, role: 'PLATFORM_OWNER' });
  });

  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  const register = (overrides: Record<string, unknown> = {}) =>
    createPlayer(req('POST', { clubId, ...VALID, ...overrides }, tmToken));

  it('registers a player with only the mandatory fields', async () => {
    const res = await register();
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.firstName).toBe('Juma');
    expect(body.data.photoUrl).toBe(PHOTO);
    expect(body.data.position).toBeNull();
    expect(body.data.middleName).toBeNull();
  });

  it('stores a middle name and position when they are given', async () => {
    const res = await register({ middleName: 'Baya', position: 'Winger' });
    const body = await res.json();
    expect(body.data.middleName).toBe('Baya');
    expect(body.data.position).toBe('Winger');
  });

  it.each([
    ['first name', { firstName: '' }],
    ['last name', { lastName: '' }],
    ['ID / passport number', { idNumber: '' }],
    ['date of birth', { dateOfBirth: '' }],
    ['player photo', { photoUrl: '' }],
    ['player photo at all', { photoUrl: undefined }],
  ])('refuses a registration with no %s', async (_label, overrides) => {
    const res = await register(overrides);
    expect(res.status).toBe(400);
  });

  it('does not block a registration on a missing middle name or position', async () => {
    const res = await register({ middleName: '', position: '' });
    expect(res.status).toBe(201);
  });

  it('names the photo among the missing fields so the manager knows what to add', async () => {
    const res = await register({ photoUrl: '' });
    expect((await res.json()).error).toMatch(/player photo/i);
  });

  it('refuses a resubmission with the photo removed', async () => {
    const created = await (await register()).json();
    const id = created.data.id;
    await rejectPlayer(req('PATCH', { reason: 'Photo unclear' }, lmToken), { params: { id } });

    const res = await patchPlayer(req('PATCH', { photoUrl: '', resubmit: true }, tmToken), { params: { id } });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/photo/i);
    expect((await prisma.player.findUniqueOrThrow({ where: { id } })).rejectedAt).not.toBeNull();
  });

  it('allows a resubmission that keeps the existing photo', async () => {
    const created = await (await register()).json();
    const id = created.data.id;
    await rejectPlayer(req('PATCH', { reason: 'Wrong ID' }, lmToken), { params: { id } });

    const res = await patchPlayer(req('PATCH', { idNumber: '39998888', resubmit: true }, tmToken), { params: { id } });
    expect(res.status).toBe(200);
  });

  it('issues a registration number only once both approvers have signed off', async () => {
    const created = await (await register()).json();
    const id = created.data.id;

    await approvePlayer(req('PATCH', undefined, lmToken), { params: { id } });
    let player = await prisma.player.findUniqueOrThrow({ where: { id } });
    expect(player.registrationNumber).toBeNull();

    await approvePlayer(req('PATCH', undefined, poToken), { params: { id } });
    player = await prisma.player.findUniqueOrThrow({ where: { id } });
    expect(player.registrationNumber).toMatch(/^KNSCL\d{3}$/);
  });

  it('never changes a registration number once assigned', async () => {
    const created = await (await register()).json();
    const id = created.data.id;
    await approvePlayer(req('PATCH', undefined, lmToken), { params: { id } });
    await approvePlayer(req('PATCH', undefined, poToken), { params: { id } });
    const first = (await prisma.player.findUniqueOrThrow({ where: { id } })).registrationNumber;

    // Rejected, corrected, resubmitted and approved again.
    await rejectPlayer(req('PATCH', { reason: 'Photo unclear' }, lmToken), { params: { id } });
    await patchPlayer(req('PATCH', { firstName: 'Juma', resubmit: true }, tmToken), { params: { id } });
    await approvePlayer(req('PATCH', undefined, lmToken), { params: { id } });

    expect((await prisma.player.findUniqueOrThrow({ where: { id } })).registrationNumber).toBe(first);
  });

  it('refuses a rejection with no reason', async () => {
    const created = await (await register()).json();
    for (const reason of [undefined, '', '   ']) {
      const res = await rejectPlayer(req('PATCH', { reason }, lmToken), { params: { id: created.data.id } });
      expect(res.status).toBe(400);
    }
    expect((await prisma.player.findUniqueOrThrow({ where: { id: created.data.id } })).rejectedAt).toBeNull();
  });

  it('stores the rejection reason and withdraws approval', async () => {
    const created = await (await register()).json();
    const id = created.data.id;
    await approvePlayer(req('PATCH', undefined, lmToken), { params: { id } });

    const res = await rejectPlayer(req('PATCH', { reason: 'ID number does not match the photo' }, lmToken), { params: { id } });
    expect(res.status).toBe(200);

    const player = await prisma.player.findUniqueOrThrow({ where: { id } });
    expect(player.rejectionReason).toBe('ID number does not match the photo');
    expect(player.rejectedAt).not.toBeNull();
    expect(player.approved).toBe(false);
    expect(player.leagueManagerApproved).toBe(false);
  });

  it('lets the Team Manager correct and resubmit, which clears the rejection', async () => {
    const created = await (await register()).json();
    const id = created.data.id;
    await rejectPlayer(req('PATCH', { reason: 'Wrong date of birth' }, lmToken), { params: { id } });

    const res = await patchPlayer(
      req('PATCH', { dateOfBirth: '2002-01-09', resubmit: true }, tmToken),
      { params: { id } }
    );
    expect(res.status).toBe(200);

    const player = await prisma.player.findUniqueOrThrow({ where: { id } });
    expect(player.rejectionReason).toBeNull();
    expect(player.rejectedAt).toBeNull();
    expect(player.dateOfBirth?.toISOString().slice(0, 10)).toBe('2002-01-09');
  });

  it('refuses a resubmission that still has a mandatory field missing', async () => {
    const created = await (await register()).json();
    const id = created.data.id;
    await rejectPlayer(req('PATCH', { reason: 'ID missing' }, lmToken), { params: { id } });

    const res = await patchPlayer(req('PATCH', { idNumber: '', resubmit: true }, tmToken), { params: { id } });
    expect(res.status).toBe(400);
    expect((await prisma.player.findUniqueOrThrow({ where: { id } })).rejectedAt).not.toBeNull();
  });

  it('approving after a resubmission clears the reason for good', async () => {
    const created = await (await register()).json();
    const id = created.data.id;
    await rejectPlayer(req('PATCH', { reason: 'Photo unclear' }, lmToken), { params: { id } });
    await patchPlayer(req('PATCH', { resubmit: true }, tmToken), { params: { id } });
    await approvePlayer(req('PATCH', undefined, lmToken), { params: { id } });

    const player = await prisma.player.findUniqueOrThrow({ where: { id } });
    expect(player.rejectionReason).toBeNull();
    expect(player.approved).toBe(true);
  });

  it('does not let a Team Manager reject a player', async () => {
    const created = await (await register()).json();
    const res = await rejectPlayer(req('PATCH', { reason: 'no' }, tmToken), { params: { id: created.data.id } });
    expect(res.status).toBe(403);
  });
});

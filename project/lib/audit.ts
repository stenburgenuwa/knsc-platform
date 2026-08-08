import { prisma } from '@/lib/prisma';

// Fire-and-forget: an audit-log write must never block or fail the request
// it's describing, so failures are swallowed after a console warning.
export async function logAudit(params: {
  userId?: string | null;
  action: string;
  module: string;
  targetId?: string | null;
  detail?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        module: params.module,
        targetId: params.targetId ?? null,
        detail: params.detail ?? null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

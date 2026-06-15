import { Injectable } from '@nestjs/common';
import type { Firestore, Timestamp } from 'firebase-admin/firestore';

import { FirestoreService } from '@/common/firestore/firestore.service';

import type {
  AerodromeGroup,
  FindApprovedLandingRequestMatchInput,
  FirestoreDirectoryPort,
  GroupContact,
  LandingRequestMatch,
} from '../ports/firestore-directory.port';

/**
 * Adapter Firestore do {@link FirestoreDirectoryPort}.
 *
 * É o **único** ponto onde nomes de coleções, campos snake_case e `Timestamp`
 * do Firestore são conhecidos: toda a leitura/mapeamento snake → camel e a
 * conversão `Timestamp` → `Date` ficam isolados aqui.
 */
@Injectable()
export class FirestoreDirectoryAdapter implements FirestoreDirectoryPort {
  constructor(private readonly firestore: FirestoreService) {}

  private get db(): Firestore {
    return this.firestore.getFirestore();
  }

  /** Converte um valor Firestore `Timestamp` (ou compatível) para `Date`. */
  private toDate(value: unknown): Date | null {
    if (value == null) return null;
    if (value instanceof Date) return value;
    const ts = value as Partial<Timestamp>;
    if (typeof ts.toDate === 'function') return ts.toDate();
    return null;
  }

  async findApprovedLandingRequestMatch(
    input: FindApprovedLandingRequestMatchInput,
  ): Promise<LandingRequestMatch | null> {
    const { registration, aerodromeIcao, reference, windowHours } = input;

    const snapshot = await this.db
      .collection('landing_requests')
      .where('aircraft_registration', '==', registration.toUpperCase())
      .where('icao', '==', aerodromeIcao.toUpperCase())
      .where('status', '==', 'approved')
      .get();

    const windowMs = windowHours * 60 * 60 * 1000;
    const referenceMs = reference.getTime();

    let best: LandingRequestMatch | null = null;
    let bestDelta = Number.POSITIVE_INFINITY;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.deleted_at != null) continue;

      const requestDate = this.toDate(data.request_date);
      if (!requestDate) continue;

      const delta = Math.abs(requestDate.getTime() - referenceMs);
      if (delta > windowMs) continue;

      if (delta < bestDelta) {
        bestDelta = delta;
        best = {
          id: doc.id,
          aircraftRegistration: String(data.aircraft_registration ?? ''),
          icao: String(data.icao ?? ''),
          status: String(data.status ?? ''),
          requestDate,
        };
      }
    }

    return best;
  }

  async findAerodromeGroupByIcao(icao: string): Promise<AerodromeGroup | null> {
    const snapshot = await this.db
      .collection('aerodromes')
      .where('icao', '==', icao.toUpperCase())
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.deleted_at != null) continue;
      return {
        aerodromeId: doc.id,
        groupId: String(data.group_id ?? ''),
      };
    }

    return null;
  }

  async findGroupContacts(
    groupId: string,
    roles: string[],
  ): Promise<GroupContact[]> {
    const snapshot = await this.db
      .collection('users')
      .where('aerodrome_group_id', '==', groupId)
      .where('role', 'in', roles)
      .get();

    const contacts: GroupContact[] = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.deleted_at != null) continue;

      const email = String(data.email ?? '').trim();
      if (!email) continue;

      const displayName: unknown = data.display_name;
      const phone: unknown = data.phone;
      contacts.push({
        email,
        role: String(data.role ?? ''),
        displayName:
          typeof displayName === 'string' && displayName.length > 0
            ? displayName
            : null,
        phone:
          typeof phone === 'string' && phone.trim().length > 0
            ? phone.trim()
            : null,
      });
    }

    return contacts;
  }
}

import Link from 'next/link';
import { ClubCrest, Form } from '@/components/public/home';

/*
  Clubs page — the league register.

  See KNSCL_CLUBS_UX_VISUAL_DIRECTION.md. The governing idea: the register's
  crest column IS the crest index. Given enough scale, the left edge of the page
  becomes an unbroken vertical column of real badges — read downward as a wall —
  while the same rows extend rightward into ground, squad and status, read across
  as a register. One object, two readings, nothing duplicated.

  Records share hairlines and span the full content width. None of them is a
  card: no radius, no shadow, no gap, no floating container.
*/

export type ClubRecord = {
  id: string;
  name: string;
  shortName?: string | null;
  logoUrl?: string | null;
  venue: string | null;
  manager: string | null;
  squad: number;
  position: number | null;
  form: ('W' | 'D' | 'L')[];
};

export function ClubRegister({ clubs, active }: { clubs: ClubRecord[]; active: boolean }) {
  return (
    <div className="clubs-register">
      <table className="clubs-table">
        <caption className="sr-only">
          Clubs competing in the Kilifi North Sub County League
          {active ? ', ordered by league position' : ', listed alphabetically'}
        </caption>
        <thead>
          <tr>
            {active && <th scope="col" className="col-pos">#</th>}
            <th scope="col" className="col-crest"><span className="sr-only">Crest</span></th>
            <th scope="col" className="col-club">Club</th>
            <th scope="col" className="col-ground">Home ground</th>
            <th scope="col" className="col-squad">Squad</th>
            {active && <th scope="col" className="col-form">Form</th>}
          </tr>
        </thead>
        <tbody>
          {clubs.map((club) => (
            <tr key={club.id}>
              {active && <td className="col-pos">{club.position ?? '—'}</td>}

              <td className="col-crest">
                <ClubCrest club={club} variant="register" />
              </td>

              <td className="col-club">
                {/* The name is the link; the record reads as one target. */}
                <Link href={`/clubs/${club.id}`} className="clubs-name">{club.name}</Link>
                {/* Ground rides with the name below the tablet breakpoint, so the
                    dedicated column can retire without losing the information. */}
                <span className="clubs-ground-inline">{club.venue || 'Ground TBC'}</span>
                {club.manager && <span className="clubs-manager">{club.manager}</span>}
              </td>

              <td className="col-ground">{club.venue || <span className="clubs-tbc">Ground TBC</span>}</td>

              <td className="col-squad">{club.squad > 0 ? club.squad : '—'}</td>

              {active && (
                <td className="col-form">{club.form.length > 0 ? <Form form={club.form} /> : '—'}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

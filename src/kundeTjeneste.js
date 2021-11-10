import { oppkobling } from './mysql_tilkobling';

/* KundeValid
 * Inneholder diverse validering og henting av data
 * Brukes i salg.jsx, nybestilling.jsx og admin.jsx
 */
class KundeValid {
  // Henter alle kunder til bruk i tabell(er)
  hentKunder(suksess) {
    oppkobling.query('SELECT kunde_id, fnavn, enavn, tlf, epost FROM kunde', (error, resultat) => {
      if (error) console.error(error);
      suksess(resultat);
    });
  }

  //legger til en ny kunde
  leggTilKunde(fnavn, enavn, tlf, epost, date_reg, suksess) {
    oppkobling.query(
      'insert into kunde (fnavn, enavn, tlf, epost, date_reg) values(?,?,?,?,?)',
      [fnavn, enavn, tlf, epost, date_reg],
      error => {
        if (error) return console.error(error);
      }
    );
    oppkobling.query('select kunde_id from kunde where tlf = ?', [tlf], (error, resultat) => {
      if (error) console.error(error);
      suksess(resultat[0].kunde_id);
    });
  }
} // KundeValid

export let kundeValid = new KundeValid();

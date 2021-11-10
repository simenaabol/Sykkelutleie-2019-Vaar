import bcrypt from 'bcryptjs';
import { oppkobling } from './mysql_tilkobling';

/* brukerValid
 * Henter info om alle brukere
 * Brukes til validering i login.jsx og NyAnsatt i admin.jsx
 */
class BrukerValid {
  brukerInnlogget = 'bruker';
  ansattID = 1;
  epost = '';
  telefon = '';
  hentAdminBrukernavn(suksess) {
    oppkobling.query(
      'SELECT ans_id, brukernavn, passord, avdeling, fnavn, enavn, epost, tlf FROM ansatt',
      (error, resultat) => {
        if (error) console.error(error);
        suksess(resultat);
      }
    );
  }

  // Brukes for å verifisere innlogging => sjekker om input-value stemmer overens med data i databasen
  valider(brukere, brukernavn, passord, suksess) {
    let antallBrukere = [];

    // Går gjennom alle brukere for å sjekke om brukernavnet og passordet er korrekt
    for (let i = 0; i < brukere.length; i++) {
      if (brukere[i].brukernavn == brukernavn) {
        bcrypt.compare(passord, brukere[i].passord, (err, res) => {
          if (res) {
            // Dersom inntastet brukernavn og passord er korrekt, returneres avdelingen brukeren skal rutes til
            suksess(brukere[i].avdeling);
            this.brukerInnlogget = brukere[i].fnavn;
            this.ansattID = brukere[i].ans_id;
            this.epost = brukere[i].epost;
            this.telefon = brukere[i].tlf;
          } else {
            return suksess('feilpass');
          }
        });
      } else {
        // Dersom brukere[i].brukernavn ikke finnes
        antallBrukere.push('x');
      }
    }
    // Dersom brukernavnet ikke eksisterer
    if (brukere.length == antallBrukere.length) {
      suksess('finnerikke');
    }
  } // valider()

  // Brukes for å sjekke om et brukernavn allerede eksisterer
  visBruker(brukere, brukernavn, suksess) {
    suksess();
    for (let i = 0; i < brukere.length; i++) {
      if (brukernavn === brukere[i].brukernavn) {
        suksess('finnes');
      }
    }
  } // visBruker()
} // BrukerValid

export let brukerValid = new BrukerValid();

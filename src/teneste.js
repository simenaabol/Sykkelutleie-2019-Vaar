import * as React from 'react';
import { Link } from 'react-router-relative-link';
import bcrypt from 'bcryptjs';

import { oppkobling } from './mysql_tilkobling';
import date from 'date-and-time';
import { bestillingTeneste } from './bestillingteneste';

class SykkelTeneste {
  //henter lokasjoner med antall sykler hver lokasjon
  hentSykkelLokasjoner(suksess) {
    oppkobling.query(
      'select lokasjon.stad, count(*) as ant from sykkel join lokasjon on sykkel.naavaerende_lokasjon = lokasjon.lokasjon_id group by naavaerende_lokasjon',
      (error, resultat) => {
        if (error) console.error(error);
        suksess(resultat);
      }
    );
  }

  //henter statistikk om salg filtrert på selger og på tid.
  hentRapport(fra_dato, til_dato, ansId, suksess) {
    let d = fra_dato.split('T');
    let fraDato = d[0] + ' ' + d[1];

    d = til_dato.split('T');
    let tilDato = d[0] + ' ' + d[1];

    const spørring =
      "SELECT COUNT(DISTINCT(bestilling.ordrenr)) AS 'Antall salg', SUM(bestilling.pris) AS 'Total råinntekt', tallopplysning.verdi *SUM(bestilling.pris)  AS 'Provisjon',COUNT(bestillingspesifikasjon.s_nr)/COUNT(DISTINCT(bestilling.ordrenr)) AS 'Gjennomsnittlig antall sykkler per bestilling', COUNT(bestillingspesifikasjon.utstyrsnr)/COUNT(DISTINCT(bestilling.ordrenr)) AS 'Gjennomsnittlig antall utstyr per bestilling',(COUNT(bestillingspesifikasjon.s_nr)+COUNT(bestillingspesifikasjon.utstyrsnr))/COUNT(DISTINCT(bestilling.ordrenr)) AS 'Gjennomsnittlig antall sykler og utstyr per bestilling' FROM ((tallopplysning, bestilling LEFT JOIN bestillingspesifikasjon ON bestilling.ordrenr =  bestillingspesifikasjon.ordrenr) LEFT JOIN ansatt ON bestilling.selger_id = ansatt.ans_id)  WHERE (bestilling.bestillingsdato >= ? AND bestilling.bestillingsdato <= ? AND ansatt.ans_id LIKE (?))  GROUP BY tallopplysning.verdi";

    oppkobling.query(spørring, [fraDato, tilDato, ansId], (error, resultat) => {
      if (error) {
        return console.error(error);
      }
      suksess(resultat);
    });
  }

  //henter kundene
  hentKundeTabell(suksess) {
    const spørring =
      'select kunde_id as Kundenummer, CONCAT(fnavn, " ", enavn) AS Navn, tlf as Telefon, Epost, date_reg as Registrert from kunde';
    oppkobling.query(spørring, (error, resultat) => {
      if (error) {
        return console.error(error);
      }
      suksess(resultat);
    });
  }

  //endrer et utstyr i databasen
  oppdaterUtstyr(beskrivelse, status, pris, naavaerende, tilhorende, id, suksess) {
    oppkobling.query(
      'update tilleggsutstyr set raapris = ?, status=?, beskrivelse=?, naavaerende_lokasjon=?, tilhorende_lokasjon=? where utstyrsnr=?',
      [pris, status, beskrivelse, naavaerende, tilhorende, id],
      error => {
        if (error) {
          console.error(error);
        }
        suksess();
      }
    );
  }

  //endrer en sykkel i databasen
  oppdaterSykkel(pris, s_nr, bremser, gir, dekk, tilhørende, nåværende, status, suksess) {
    oppkobling.query(
      'update sykkel set raapris = ?, bremser=?, girsystem=?, dekk_storrelse=?, tilhoerende_lokasjon=?, naavaerende_lokasjon=?, status=? where s_nr=?',
      [pris, bremser, gir, dekk, tilhørende, nåværende, status, s_nr],
      error => {
        if (error) {
          console.error(error);
        }
        suksess();
      }
    );
  }

  //fjerner en sykkel
  slettSykkel(id) {
    oppkobling.query('delete from sykkel where s_nr = ?', [id], error => {
      if (error) {
        return console.error(error);
      }
    });
  }

  slettUtstyr(id) {
    oppkobling.query('delete from tilleggsutstyr where utstyrsnr = ?', [id], error => {
      if (error) {
        return console.error(error);
      }
    });
  }

  //henter alle lokasjonene
  hentStadar(suksess) {
    oppkobling.query('select lokasjon_id, stad, omr_id from lokasjon', (error, resultat) => {
      if (error) {
        console.error(error);
      }
      suksess(resultat);
    });
  }

  //henter lokasjonene der man kan hente og levere sykler
  hentelevereStadar(suksess) {
    oppkobling.query('select lokasjon_id, stad, omr_id from lokasjon where hente_levere = 1', (error, resultat) => {
      if (error) {
        console.error(error);
      }
      suksess(resultat);
    });
  }

  //henter alle områdene
  hentOmraader(suksess) {
    oppkobling.query('select omr_id, omr_navn from omraade', (error, resultat) => {
      if (error) {
        console.error(error);
      }
      suksess(resultat);
    });
  }

  // Henter omrdådeid som valgt sykkel tilhører for å lage stadsval
  hentOmraadeIdFraSykkel(sykkelid, suksess) {
    oppkobling.query(
      'select l.omr_id, s.s_nr from lokasjon l join sykkel s on s.tilhoerende_lokasjon = l.lokasjon_id where s.s_nr = ?',
      [sykkelid],
      (error, resultat) => {
        if (error) {
          console.error(error);
        }
        suksess(resultat);
      }
    );
  }

  hentOmraadeIdFraUtstyr(utstyrid, suksess) {
    oppkobling.query(
      'select l.omr_id, u.utstyrsnr from lokasjon l join tilleggsutstyr u on u.tilhoerende_lokasjon = l.lokasjon_id where u.utstyrsnr = ?',
      [utstyrid],
      (error, resultat) => {
        if (error) {
          console.error(error);
        }
        suksess(resultat);
      }
    );
  }

  //legger til en ny kunde
  leggTilKunde(fnavn, enavn, tlf, epost, date_reg) {
    oppkobling.query(
      'insert into kunde (fnavn, enavn, tlf, epost, date_reg) values(?,?,?,?,?)',
      [fnavn, enavn, tlf, epost, date_reg],
      error => {
        if (error) {
          return console.error(error);
        }
      }
    );
  }

  //legger til en ny ansatt
  leggTilAnsatt(fnavn, enavn, tlf, epost, avdeling, omrade, brukernavn, passord) {
    bcrypt.hash(passord, 10, function(err, hash) {
      oppkobling.query(
        'insert into ansatt (fnavn, enavn, tlf, epost, avdeling, omr_id, brukernavn, passord) VALUES(?,?,?,?,?,?,?,?)',
        [fnavn, enavn, tlf, epost, avdeling, omrade, brukernavn, hash],
        error => {
          if (error) {
            console.error(error);
          }
        }
      );
    });
  }

  //legger til nytt utstyr
  leggTilUtstyr(type, status, pris, beskrivelse, naavaerende, tilhorende, suksess) {
    oppkobling.query(
      'insert into tilleggsutstyr(type, status, beskrivelse, raapris, naavaerende_lokasjon, tilhoerende_lokasjon) values(?,?,?,?,?,?)',
      [type, status, beskrivelse, pris, naavaerende, tilhorende],
      error => {
        if (error) {
          return console.error(error);
        }
        suksess();
      }
    );
  }

  //legger til en ny sykkel
  leggTilSykkel(
    type,
    rammenr,
    bruker,
    status,
    tilhørende,
    nåværende,
    bremser,
    girsystem,
    dekkstørrelse,
    pris,
    suksess
  ) {
    oppkobling.query(
      'insert into sykkel (rammenr, dekk_storrelse, type, bruker, status, girsystem, bremser, naavaerende_lokasjon, tilhoerende_lokasjon, raapris) VALUES(?,?,?,?,?,?,?,?,?,?)',
      [rammenr, dekkstørrelse, type, bruker, status, girsystem, bremser, nåværende, tilhørende, pris],
      error => {
        if (error) {
          console.error(error);
        } else {
          suksess();
        }
      }
    );
  }

  //lager innholdet til et <select> element for alle lokasjoner. Teksten blir navnet på lokasjonen, men verdien blir lik IDen
  lagStadsVal(stadar, område, stad) {
    const retur = [];

    // ta gjeldande stad fyrst
    for (let i = 0; i < stadar.length; i++) {
      if (stadar[i].stad == stad && stadar[i].omr_id == område) {
        retur.push(
          <option key={stadar[i].lokasjon_id} value={stadar[i].lokasjon_id}>
            {stadar[i].stad}
          </option>
        );
      }
    }

    // resten av stadane
    for (let i = 0; i < stadar.length; i++) {
      if (stadar[i].stad != stad && stadar[i].omr_id == område) {
        retur.push(
          <option key={stadar[i].lokasjon_id} value={stadar[i].lokasjon_id}>
            {stadar[i].stad}
          </option>
        );
      }
    }

    return retur;
  }

  //lik som lagStadsVal(), men for områder
  lagOmraadeVal(omraader, stad) {
    const retur = [];

    // ta gjeldande stad fyrst
    for (let i = 0; i < omraader.length; i++) {
      if (omraader[i].omr_navn == stad) {
        retur.push(
          <option key={omraader[i].omr_id} value={omraader[i].omr_id}>
            {omraader[i].omr_navn}
          </option>
        );
      }
    }

    // resten av stadane
    for (let i = 0; i < omraader.length; i++) {
      if (omraader[i].omr_navn != stad) {
        retur.push(
          <option key={omraader[i].omr_id} value={omraader[i].omr_id}>
            {omraader[i].omr_navn}
          </option>
        );
      }
    }

    return retur;
  }

  //legger til et nytt område
  leggTilOmraade(navn, fylke, suksess) {
    oppkobling.query('insert into omraade (omr_navn, fylke) VALUES(?,?)', [navn, fylke], error => {
      if (error) {
        console.error(error);
      } else {
        suksess();
      }
    });
  }

  //legger til en ny lokasjon
  lagreLokasjon(omraade, stedsnavn, adresse, postnummer, hentelevere, lager, suksess) {
    oppkobling.query(
      'insert into lokasjon (stad, adresse, omr_id, hente_levere, lager, postnummer) VALUES(?,?,?,?,?,?)',
      [stedsnavn, adresse, omraade, hentelevere, lager, postnummer],
      error => {
        if (error) {
          console.error(error);
        } else {
          suksess();
        }
      }
    );
  }

  //lager innholdet til et <select> element fra en gitt liste
  lagValg(alternativer, valg) {
    const retur = [];
    let nøkkel = 0;
    retur.push(
      <option key={nøkkel} value={valg}>
        {valg}
      </option>
    );

    for (let i = 0; i < alternativer.length; i++) {
      nøkkel++;
      if (valg != alternativer[i]) {
        retur.push(
          <option key={nøkkel} value={alternativer[i]}>
            {alternativer[i]}
          </option>
        );
      }
    }
    return retur;
  }

  //henter provisjonen til selgere
  hentProvisjon(suksess) {
    oppkobling.query('select verdi from tallopplysning', (error, resultat) => {
      if (error) {
        console.error(error);
      }
      suksess(resultat);
    });
  }

  //oppdaterer provisjonen til selgerne
  oppdaterProvisjon(nyprovisjon, suksess) {
    oppkobling.query('update tallopplysning set verdi=? where type="provisjon"', [nyprovisjon], (error, resultat) => {
      if (error) {
        console.error(error);
      }
      suksess();
    });
  }

  //henter en bestemt sykkel fra databasen
  hentSykkel(id, suksess) {
    oppkobling.query(
      'select s_nr as Sykkelnr, rammenr as Rammenummer, Status, Type, Bruker, tilhoerende_lokasjon as "Tilhørende", naavaerende_lokasjon as "Nåværende", raapris as Råpris, dekk_storrelse as Dekkstørrelse, Girsystem, Bremser from sykkel  where s_nr = ?',
      [id],
      (error, resultat) => {
        if (error) {
          console.error(error);
        }
        suksess(resultat[0]);
      }
    );
  }

  //henter et bestemt uststyr fra databasen
  hentUtstyr(id, suksess) {
    oppkobling.query('select * from tilleggsutstyr where utstyrsnr=?', [id], (error, resultat) => {
      if (error) {
        console.error(error);
      }
      suksess(resultat[0]);
    });
  }

  //henter et par data om alle  sykler til bruk i bestillingstjenesten
  hentSyklerBestilling(suksess) {
    oppkobling.query('select s_nr, type, raapris from sykkel', (error, resultat) => {
      if (error) console.error(error);
      suksess(resultat);
    });
  }

  //henter utstyr til bruk i bestillingtjenesten
  hentUtstyrsTabell(suksess) {
    const spørring = 'select utstyrsnr as Utstyrsnr, Type, Status, Beskrivelse, raapris as Råpris from tilleggsutstyr';
    oppkobling.query(spørring, (error, resultat) => {
      if (error) {
        return console.error(error);
      }
      suksess(resultat);
    });
  }

  //henter alle syklene
  hentSykkelTabell(suksess) {
    const spørring =
      'select s_nr as Sykkelnr, rammenr as Rammenummer, Status, l.stad as "Tilhørende lokasjon", lo.stad as "Nåværende lokasjon" from sykkel s join lokasjon l on s.tilhoerende_lokasjon = l.lokasjon_id join lokasjon lo on s.naavaerende_lokasjon = lo.lokasjon_id order by s_nr';
    oppkobling.query(spørring, (error, resultat) => {
      if (error) {
        return console.error(error);
      }
      suksess(resultat);
    });
  }

  //henter sykler som må leveres
  hentSyklerMaaLeveres(idag, suksess) {
    const spørring =
      'SELECT DISTINCT bs.s_nr AS Sykkelnr, l.stad as "Fraktes til", b.fra_dato as "Innen", ll.stad as "Nåværende lokasjon" from bestillingspesifikasjon bs join bestilling b on bs.ordrenr = b.ordrenr join sykkel s on bs.s_nr = s.s_nr join lokasjon l on l.lokasjon_id = b.hentested left join lokasjon ll on ll.lokasjon_id = s.naavaerende_lokasjon where l.stad != ll.stad and b.fra_dato > ?';
    oppkobling.query(spørring, [idag], (error, resultat) => {
      if (error) {
        return console.error(error);
      }
      suksess(resultat);
    });
  }

  //henter sykler som må hentes
  hentSyklerMaaHentes(suksess) {
    const spørring =
      'SELECT DISTINCT bs.s_nr AS Sykkelnr, l.stad as "Hentes fra", b.til_dato as "Etter", ll.stad as "Tilhørende lokasjon" from bestillingspesifikasjon bs join bestilling b on bs.ordrenr = b.ordrenr join sykkel s on bs.s_nr = s.s_nr join lokasjon l on l.lokasjon_id = b.leveringsted left join lokasjon ll on ll.lokasjon_id = s.tilhoerende_lokasjon where l.stad != ll.stad';
    oppkobling.query(spørring, (error, resultat) => {
      if (error) {
        return console.error(error);
      }
      suksess(resultat);
    });
  }

  // Henter ut data til tabell over tilgjengelige sykler i ny bestilling
  hentSykkelBestillingTabell(fra_dato, til_dato, suksess) {
    oppkobling.query(
      'SELECT s_nr as Sykkelnr, Type, Bruker, raapris as Råpris FROM sykkel s WHERE s.status="tilgjengelig" and s.s_nr NOT IN (select s.s_nr from sykkel s join bestillingspesifikasjon bs	on s.s_nr = bs.s_nr join bestilling b on b.ordrenr = bs.ordrenr where (b.fra_dato between ? and ?) or (b.til_dato between ? and ?))',
      [fra_dato, til_dato, fra_dato, til_dato],
      (error, resultat) => {
        if (error) console.error(error);

        suksess(resultat);
      }
    );
  }

  //henter utstyr som er tilgjengelig til ny bestilling basert på dato
  hentUtstyrBestillingTabell(fra_dato, til_dato, sykkelID, suksess) {
    oppkobling.query(
      'SELECT utstyrsnr as Utstyrnr, Type, beskrivelse, raapris as Råpris FROM tilleggsutstyr u WHERE u.status="tilgjengelig" and u.utstyrsnr NOT IN (select u.utstyrsnr from tilleggsutstyr u join bestillingspesifikasjon bs on u.utstyrsnr = bs.utstyrsnr join bestilling b on b.ordrenr = bs.ordrenr where (b.fra_dato between ? and ?) or (b.til_dato between ? and ?)) and Type not in(select utstyrtype from ikkekompatible join sykkel on sykkel.type = ikkekompatible.sykkeltype where sykkel.s_nr = ?)',
      [fra_dato, til_dato, fra_dato, til_dato, sykkelID],
      (error, resultat) => {
        if (error) console.error(error);

        suksess(resultat);
      }
    );
  }

  //henter bestillinger
  hentBestillingsTabell(suksess) {
    const spørring =
      'select ordrenr as Ordrenummer, CONCAT(k.fnavn, " ", k.enavn) AS Navn, tlf AS Telefon, fra_dato as Fra, til_dato as Til from bestilling b left join kunde k on k.kunde_id = b.kunde_id ';
    oppkobling.query(spørring, (error, resultat) => {
      if (error) {
        return console.error(error);
      }
      suksess(resultat);
    });
  }

  //henter bestillinger til lager-forside
  hentBestillingsTabellLager(idag, suksess) {
    const spørring =
      'select ordrenr as Ordrenummer, CONCAT(k.fnavn, " ", k.enavn) AS Navn, tlf AS Telefon, fra_dato as Innen, l.stad as "Hentes fra" from bestilling b left join kunde k on k.kunde_id = b.kunde_id join lokasjon l on l.lokasjon_id = b.hentested where fra_dato > ?';
    oppkobling.query(spørring, [idag], (error, resultat) => {
      if (error) {
        return console.error(error);
      }
      suksess(resultat);
    });
  }

  //henter en bestemt bestilling
  hentBestilling(ordrenr, suksess) {
    oppkobling.query(
      'select b.kunde_id as KundeID, CONCAT(k.fnavn, " ", k.enavn) as Navn, k.tlf AS Telefon,  b.bestillingsdato as Bestillingsdato, b.fra_dato as Fra, b.til_dato as Til, b.rabatt as Rabatt, Pris, l.stad as Hentested, ll.stad as Leverested from bestilling b join kunde k on b.kunde_id = k.kunde_id join lokasjon l on l.lokasjon_id = b.hentested join lokasjon ll on ll.lokasjon_id = b.leveringsted where ordrenr = ?',
      [ordrenr],
      (error, resultat) => {
        if (error) {
          return console.error(error);
        }
        suksess(resultat[0]);
      }
    );
  }

  //hent syklene i en bestilling til bruk i oversikt for en bestilling
  hentBestillingSykler(ordrenr, suksess) {
    oppkobling.query(
      'select "sykkel" as Type, s.s_nr as Sykkelnummer, s.type, s.Bruker, s.raapris as Råpris from bestillingspesifikasjon bs join sykkel s on bs.s_nr = s.s_nr where bs.ordrenr = ?',
      [ordrenr],
      (error, resultat) => {
        if (error) {
          console.error(error);
        }
        suksess(resultat);
      }
    );
  }

  //hent utstyret i en bestilling til bruk i oversikt for en bestilling
  hentBestillingUtstyr(ordrenr, suksess) {
    oppkobling.query(
      'select "utstyr" as Type, u.utstyrsnr as Utstyrsnummer, u.type, u.Beskrivelse, u.raapris as Råpris from tilleggsutstyr u join bestillingspesifikasjon bs on u.utstyrsnr = bs.utstyrsnr where bs.ordrenr = ?',
      [ordrenr],
      (error, resultat) => {
        if (error) {
          console.error(error);
        }
        suksess(resultat);
      }
    );
  }

  //fjerner en bestilling
  slettBestilling(ordrenr, suksess) {
    //må først fjerne spesifikasjonene pga fremmednøkkeltrøbbel
    oppkobling.query('delete from bestillingspesifikasjon where ordrenr = ?', [ordrenr], error => {
      if (error) console.error(error);
    });
    //så sletter selve bestillingen
    oppkobling.query('delete from bestilling where ordrenr = ?', [ordrenr], error => {
      if (error) console.error(error);
      suksess();
    });
  }

  //hent data til bruk i grafen
  hentGrafInnhold(aar, suksess) {
    let aaret = Number(aar);
    let spørring =
      'SELECT (SELECT COUNT(ordrenr) AS Januar from bestilling where bestillingsdato LIKE "' +
      aaret +
      '-01%" ORDER BY ordrenr) AS Januar, (SELECT COUNT(ordrenr) AS Februar from bestilling where bestillingsdato LIKE "' +
      aaret +
      '-02%" ORDER BY ordrenr) AS Februar, (SELECT COUNT(ordrenr) AS Mars from bestilling where bestillingsdato LIKE "' +
      aaret +
      '-03%" ORDER BY ordrenr) AS Mars, (SELECT COUNT(ordrenr) AS April from bestilling where bestillingsdato LIKE "' +
      aaret +
      '-04%" ORDER BY ordrenr) AS April, (SELECT COUNT(ordrenr) AS Mai from bestilling where bestillingsdato LIKE "' +
      aaret +
      '-05%" ORDER BY ordrenr) AS Mai, (SELECT COUNT(ordrenr) AS Juni from bestilling where bestillingsdato LIKE "' +
      aaret +
      '-06%" ORDER BY ordrenr) AS Juni, (SELECT COUNT(ordrenr) AS Juli from bestilling where bestillingsdato LIKE "' +
      aaret +
      '-07%" ORDER BY ordrenr) AS Juli, (SELECT COUNT(ordrenr) AS August from bestilling where bestillingsdato LIKE "' +
      aaret +
      '-08%" ORDER BY ordrenr) AS August, (SELECT COUNT(ordrenr) AS September from bestilling where bestillingsdato LIKE "' +
      aaret +
      '-09%" ORDER BY ordrenr) AS September, (SELECT COUNT(ordrenr) AS Oktober from bestilling where bestillingsdato LIKE "' +
      aaret +
      '-10%" ORDER BY ordrenr) AS Oktober, (SELECT COUNT(ordrenr) AS November from bestilling where bestillingsdato LIKE "' +
      aaret +
      '-11%" ORDER BY ordrenr) AS November, (SELECT COUNT(ordrenr) AS Desember from bestilling where bestillingsdato LIKE "' +
      aaret +
      '-12%" ORDER BY ordrenr) AS Desember';
    oppkobling.query(spørring, (error, resultat) => {
      if (error) console.error(error);
      suksess(resultat);
    });
  }

  //hent innholdet i en bestilling
  hentSpesifikasjoner(ordrenr, suksess) {
    oppkobling.query('select * from bestillingspesifikasjon where ordrenr = ?', [ordrenr], (error, resultat) => {
      if (error) console.error(error);
      suksess(resultat);
    });
  }

  //sorterer en gitt tabell på et gitt attributt synkende
  sorter(attributt, originalTabell) {
    let nytabell = [];
    let gammeltabell = originalTabell;
    nytabell.push(originalTabell[0]);

    let sorterteVerdier = [];
    for (let i = 1; i < originalTabell.length; i++) {
      sorterteVerdier.push(originalTabell[i].props.children[attributt].props.children);
    }
    if (isNaN(sorterteVerdier[0])) sorterteVerdier = sorterteVerdier.sort();
    else
      sorterteVerdier.sort(function(a, b) {
        return a - b;
      });
    while (nytabell.length < originalTabell.length) {
      for (let i = 1; i < gammeltabell.length; i++) {
        if (gammeltabell[i].props.children[attributt].props.children == sorterteVerdier[0]) {
          sorterteVerdier.splice(0, 1);
          nytabell.push(gammeltabell[i]);
        }
      }
    }
    return nytabell;
  }

  //lager valg man kan sortere på
  lagsorteringsVal(tabell, ikkeSisteKolonne) {
    //ikkesistekolonne er boolsk (1/0) og sier om man skal ta med den siste kolonnen.
    //enkelte tabeller har "se sykkel" eller lignende som siste kolonne, og dette
    //vil vi jo ikke sortere på
    let val = [];
    //går gjennom og henter ut teksten i hver celle i headeren
    for (let i = 0; i < tabell[0].props.children.length - ikkeSisteKolonne; i++) {
      val.push(
        <option key={i} value={i}>
          {tabell[0].props.children[i].props.children}
        </option>
      );
    }
    return val;
  }

  // lager dynamisk en tabell basert på sql-utdata
  lagTabell(SQLdata, skjulteRader, suksess) {
    let rader = [];
    let header = [];
    let nøkkel = 0;

    //går gjennom attributtnavnene fra tabellen og lager en header.
    for (let i = 0; i < Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
      if (Object.getOwnPropertyNames(SQLdata[0])[i] == 'type') {
        header.push(<th key={nøkkel}>Type</th>);
      } else {
        header.push(<th key={nøkkel}>{Object.getOwnPropertyNames(SQLdata[0])[i]}</th>);
      }
      nøkkel++;
    }
    rader.push(<tr key={nøkkel}>{header}</tr>);
    let radnr = 0;
    //går gjennom hver rad i sqldataen og lager rader og fyller ut celler med riktig innhold
    SQLdata.map(rad => {
      radnr++;
      const data = [];
      for (let i = 0; i < Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
        //formaterer dato til et leselig format om innholdet er en dato
        if (rad[Object.getOwnPropertyNames(SQLdata[0])[i]] instanceof Date) {
          data.push(
            <td key={nøkkel}>{date.format(rad[Object.getOwnPropertyNames(SQLdata[0])[i]], 'DD/MM/YY HH:mm')}</td>
          );
        } else {
          data.push(<td key={nøkkel}>{rad[Object.getOwnPropertyNames(SQLdata[0])[i]]}</td>);
        }
        nøkkel++;
      }

      if (!skjulteRader.includes(radnr)) {
        rader.push(<tr key={nøkkel}>{data}</tr>);
      }
    });
    suksess(rader);
  }

  //samme virkemåte som lagTabell(), men har med lenke til ordren
  lagBestillingSalgTabell(SQLdata, skjulteRader, suksess) {
    // lager dynamisk en tabell basert på sql-utdata
    const rader = [];
    const header = [];
    let nøkkel = 0;

    for (let i = 0; i <= Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
      if (i < Object.getOwnPropertyNames(SQLdata[0]).length) {
        header.push(<th key={nøkkel}>{Object.getOwnPropertyNames(SQLdata[0])[i]}</th>);
      } else {
        header.push(<th key={nøkkel}>Se detaljer</th>);
      }
      nøkkel++;
    }
    rader.push(<tr key={nøkkel}>{header}</tr>);
    let radnr = 0;
    SQLdata.map(rad => {
      radnr++;
      let ordrenr = '';
      const data = [];
      for (let i = 0; i <= Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
        if (i < Object.getOwnPropertyNames(SQLdata[0]).length) {
          if (rad[Object.getOwnPropertyNames(SQLdata[0])[i]] instanceof Date) {
            data.push(
              <td key={nøkkel}>{date.format(rad[Object.getOwnPropertyNames(SQLdata[0])[i]], 'DD/MM/YY HH:mm')}</td>
            );
          } else {
            data.push(<td key={nøkkel}>{rad[Object.getOwnPropertyNames(SQLdata[0])[i]]}</td>);
          }
          if (Object.getOwnPropertyNames(SQLdata[0])[i] == 'Ordrenummer') {
            ordrenr = `${rad[Object.getOwnPropertyNames(SQLdata[0])[i]]}`;
          }
          nøkkel++;
        } else {
          data.push(
            <td key={nøkkel}>
              <Link to={ordrenr}>Se</Link>
            </td>
          );
        }
      }

      if (!skjulteRader.includes(radnr)) {
        rader.push(<tr key={nøkkel}>{data}</tr>);
      }
    });
    suksess(rader);
  }

  //henter alle ansatte
  hentAnsatte(suksess) {
    oppkobling.query('select ans_id, CONCAT(fnavn, " ", enavn) as navn from ansatt', (error, resultat) => {
      if (error) console.error(error);
      suksess(resultat);
    });
  }

  //lager innholdet til et <select> element for å filtrere på ansatte i statistikken
  lagAnsatteVal(ansatte) {
    let val = [];

    val.push(
      //% brukes som joker i sql, så man vil få alle ansatte
      <option key="-1" value="%">
        Alle ansatte
      </option>
    );

    //bruk ellers ansattid
    for (let i = 0; i < ansatte.length; i++) {
      val.push(
        <option key={i} value={ansatte[i].ans_id}>
          {ansatte[i].navn}
        </option>
      );
    }
    return val;
  }

  //henter ansatte til bruk i statistikken
  hentAnsatTabell(suksess) {
    const spørring =
      'select ans_id as AnsattID, Avdeling, CONCAT(fnavn, " ", enavn) as Navn, brukernavn, tlf as Telefon, epost, omraade.omr_navn as Område from ansatt join omraade on omraade.omr_id = ansatt.omr_id order by avdeling';
    oppkobling.query(spørring, (error, resultat) => {
      if (error) {
        return console.error(error);
      }
      suksess(resultat);
    });
  }

  //henter antall bestillingspesifikasjon for en gitt ordre
  antallBS(ordrenr, suksess) {
    oppkobling.query(
      'select COUNT(s_nr) + COUNT(utstyrsnr) as ant from bestillingspesifikasjon where ordrenr =?',
      [ordrenr],
      (error, resultat) => {
        if (error) {
          console.error(error);
        }
        suksess(resultat[0].ant);
      }
    );
  }

  //lager tabell med alle kunder.
  //lik virkemåte som lagtabell(), men har med lenke til kundeside
  lagKundeTabell(SQLdata, skjulteRader, suksess) {
    // lager dynamisk en tabell basert på sql-utdata
    const rader = [];
    const header = [];
    let nøkkel = 0;

    for (let i = 0; i <= Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
      if (i < Object.getOwnPropertyNames(SQLdata[0]).length) {
        header.push(<th key={nøkkel}>{Object.getOwnPropertyNames(SQLdata[0])[i]}</th>);
      } else {
        header.push(<th key={nøkkel}>Endre detaljer</th>);
      }
      nøkkel++;
    }
    rader.push(<tr key={nøkkel}>{header}</tr>);
    let radnr = 0;
    SQLdata.map(rad => {
      radnr++;
      let kundenr = '';
      const data = [];
      for (let i = 0; i <= Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
        if (i < Object.getOwnPropertyNames(SQLdata[0]).length) {
          if (rad[Object.getOwnPropertyNames(SQLdata[0])[i]] instanceof Date) {
            data.push(<td key={nøkkel}>{date.format(rad[Object.getOwnPropertyNames(SQLdata[0])[i]], 'DD-MM-YY')}</td>);
          } else {
            data.push(<td key={nøkkel}>{rad[Object.getOwnPropertyNames(SQLdata[0])[i]]}</td>);
          }
          if (Object.getOwnPropertyNames(SQLdata[0])[i] == 'Kundenummer') {
            kundenr = `${rad[Object.getOwnPropertyNames(SQLdata[0])[i]]}`;
          }
          nøkkel++;
        } else {
          data.push(
            <td key={nøkkel}>
              <Link to={kundenr}>Endre</Link>
            </td>
          );
        }
      }
      if (!skjulteRader.includes(radnr)) {
        rader.push(<tr key={nøkkel}>{data}</tr>);
      }
    });
    suksess(rader);
  }

  //lager tabell til bruk i ny bestilling
  lagSykkelBestillingTabell(SQLdata, skjulteRader, valgte, suksess) {
    // lager dynamisk en tabell basert på sql-utdata
    const rader = [];
    const header = [];
    let nøkkel = 0;
    if (SQLdata.length == 0) {
      rader.push(
        <tr key="1">
          <td key="2">Ingen sykler tilgjengelig i denne perioden</td>
        </tr>
      );
      suksess(rader);
      return;
    }

    for (let i = 0; i <= Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
      if (i < Object.getOwnPropertyNames(SQLdata[0]).length) {
        header.push(<th key={nøkkel}>{Object.getOwnPropertyNames(SQLdata[0])[i]}</th>);
      } else {
        header.push(<th key={nøkkel}>Velg</th>);
      }
      nøkkel++;
    }
    rader.push(<tr key={nøkkel}>{header}</tr>);
    nøkkel++;
    let radnr = 0;
    SQLdata.map(rad => {
      radnr++;
      let sykkelID = '';
      const data = [];
      for (let i = 0; i <= Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
        if (i < Object.getOwnPropertyNames(SQLdata[0]).length) {
          if (rad[Object.getOwnPropertyNames(SQLdata[0])[i]] instanceof Date) {
            data.push(
              <td key={nøkkel}>{date.format(rad[Object.getOwnPropertyNames(SQLdata[0])[i]], 'DD/MM/YY HH:mm')}</td>
            );
          } else {
            data.push(<td key={nøkkel}>{rad[Object.getOwnPropertyNames(SQLdata[0])[i]]}</td>);
          }
          if (Object.getOwnPropertyNames(SQLdata[0])[i] == 'Sykkelnr') {
            sykkelID = `${rad[Object.getOwnPropertyNames(SQLdata[0])[i]]}`;
          }
          nøkkel++;
        } else {
          data.push(
            <td key={nøkkel}>
              <Link to={sykkelID} onClick={this.oppdaterBestilling}>
                <button type="button" title="Legg til sykkel" className="knappArrowRight">
                  <i className="fas fa-arrow-right" />
                </button>
              </Link>
            </td>
          );
        }
      }
      if (!skjulteRader.includes(radnr)) {
        rader.push(<tr key={nøkkel}>{data}</tr>);
      }
    });
    for (let i = 0; i < valgte.length; i++) {
      for (let j = 0; j < rader.length; j++) {
        if (rader[j].props.children[0].props.children == valgte[i].sykkel) {
          rader.splice(j, 1);
          j = 0;
          i = 0;
        }
      }
    }
    suksess(rader);
  }

  endreBestilling(sjekkboks, utstyrsnr, sykkelnr) {
    console.log(utstyrsnr, sykkelnr, sjekkboks);

    if (sjekkboks) bestillingTeneste.leggTilSpesifikasjon(utstyrsnr, sykkelnr);
    else bestillingTeneste.fjernSpesifikasjon(utstyrsnr, sykkelnr);
    console.log(bestillingTeneste.spesifikasjoner);
  }

  //lager tabell med tilgjengelig utstyr til bruk i ny bestilling
  lagUtstyrBestillingTabell(SQLdata, skjulteRader, sykkelnr, valgte, suksess) {
    // lager dynamisk en tabell basert på sql-utdata
    const rader = [];
    const header = [];
    let nøkkel = 0;
    if (SQLdata.length == 0) {
      rader.push(
        <tr key="1">
          <td key="2">Ingen utstyr tilgjengelig i denne perioden</td>
        </tr>
      );
      suksess(rader);
      return;
    }

    for (let i = 0; i <= Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
      if (i < Object.getOwnPropertyNames(SQLdata[0]).length) {
        header.push(<th key={nøkkel}>{Object.getOwnPropertyNames(SQLdata[0])[i]}</th>);
      } else {
        header.push(<th key={nøkkel}>Velg</th>);
      }
      nøkkel++;
    }
    rader.push(<tr key={nøkkel}>{header}</tr>);
    nøkkel++;
    nøkkel += 6;
    let radnr = 0;
    SQLdata.map(rad => {
      radnr++;
      const data = [];
      for (let i = 0; i <= Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
        if (i < Object.getOwnPropertyNames(SQLdata[0]).length) {
          if (rad[Object.getOwnPropertyNames(SQLdata[0])[i]] instanceof Date) {
            data.push(
              <td key={nøkkel}>{date.format(rad[Object.getOwnPropertyNames(SQLdata[0])[i]], 'DD/MM/YY HH:mm')}</td>
            );
          } else {
            data.push(<td key={nøkkel}>{rad[Object.getOwnPropertyNames(SQLdata[0])[i]]}</td>);
          }
          nøkkel++;
        } else {
          data.push(
            <td key={nøkkel}>
              <input
                onClick={event => this.endreBestilling(event.target.checked, rad.Utstyrnr, sykkelnr)}
                type="checkbox"
                tabIndex="0"
                className="checkboxClass"
              />
            </td>
          );
        }
      }
      if (!skjulteRader.includes(radnr)) {
        rader.push(<tr key={nøkkel}>{data}</tr>);
      }
    });
    for (let i = 0; i < valgte.length; i++) {
      for (let j = 0; j < rader.length; j++) {
        if (rader[j].props.children[0].props.children == valgte[i].utstyr) {
          rader.splice(j, 1);
          j = 0;
          i = 0;
        }
      }
    }

    suksess(rader);
  }

  //lager sykkeltabell på admin sin side.
  //denne har ikke med "se detaljer" som egen kolonne
  lagSykkelTabellAdmin(SQLdata, skjulteRader, suksess) {
    // lager dynamisk en tabell basert på sql-utdata
    const rader = [];
    const header = [];
    let nøkkel = 0;

    for (let i = 0; i <= Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
      if (i < Object.getOwnPropertyNames(SQLdata[0]).length) {
        header.push(<th key={nøkkel}>{Object.getOwnPropertyNames(SQLdata[0])[i]}</th>);
      }
      nøkkel++;
    }
    rader.push(<tr key={nøkkel}>{header}</tr>);
    let radnr = 0;
    SQLdata.map(rad => {
      radnr++;

      const data = [];
      for (let i = 0; i <= Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
        if (i < Object.getOwnPropertyNames(SQLdata[0]).length) {
          if (rad[Object.getOwnPropertyNames(SQLdata[0])[i]] instanceof Date) {
            data.push(
              <td key={nøkkel}>{date.format(rad[Object.getOwnPropertyNames(SQLdata[0])[i]], 'DD/MM/YY HH:mm')}</td>
            );
          } else {
            data.push(<td key={nøkkel}>{rad[Object.getOwnPropertyNames(SQLdata[0])[i]]}</td>);
          }
          nøkkel++;
        }
      }
      if (!skjulteRader.includes(radnr)) {
        rader.push(<tr key={nøkkel}>{data}</tr>);
      }
    });
    suksess(rader);
  }

  //lager tabell med alle sykler og med lenke til å endre sykkel
  lagSykkelTabell(SQLdata, skjulteRader, suksess) {
    // lager dynamisk en tabell basert på sql-utdata
    const rader = [];
    const header = [];
    let nøkkel = 0;

    for (let i = 0; i <= Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
      if (i < Object.getOwnPropertyNames(SQLdata[0]).length) {
        header.push(<th key={nøkkel}>{Object.getOwnPropertyNames(SQLdata[0])[i]}</th>);
      } else {
        header.push(<th key={nøkkel}>Se detaljer</th>);
      }
      nøkkel++;
    }
    rader.push(<tr key={nøkkel}>{header}</tr>);
    let radnr = 0;
    SQLdata.map(rad => {
      radnr++;
      let sykkelID = '';

      const data = [];
      for (let i = 0; i <= Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
        if (i < Object.getOwnPropertyNames(SQLdata[0]).length) {
          if (rad[Object.getOwnPropertyNames(SQLdata[0])[i]] instanceof Date) {
            data.push(
              <td key={nøkkel}>{date.format(rad[Object.getOwnPropertyNames(SQLdata[0])[i]], 'DD/MM/YY HH:mm')}</td>
            );
          } else {
            data.push(<td key={nøkkel}>{rad[Object.getOwnPropertyNames(SQLdata[0])[i]]}</td>);
          }
          if (Object.getOwnPropertyNames(SQLdata[0])[i] == 'Sykkelnr') {
            sykkelID = `${rad[Object.getOwnPropertyNames(SQLdata[0])[i]]}`;
          }
          nøkkel++;
        } else {
          data.push(
            <td key={nøkkel}>
              <Link to={sykkelID}>Se</Link>
            </td>
          );
        }
      }
      if (!skjulteRader.includes(radnr)) {
        rader.push(<tr key={nøkkel}>{data}</tr>);
      }
    });
    suksess(rader);
  }

  //lager tabell med alt utstyr.
  //har med lenke til utstyrets side
  lagUtstyrTabell(SQLdata, skjulteRader, suksess) {
    // lager dynamisk en tabell basert på sql-utdata
    const rader = [];
    const header = [];
    let nøkkel = 0;

    for (let i = 0; i <= Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
      if (i < Object.getOwnPropertyNames(SQLdata[0]).length) {
        header.push(<th key={nøkkel}>{Object.getOwnPropertyNames(SQLdata[0])[i]}</th>);
      } else {
        header.push(<th key={nøkkel}>Se detaljer</th>);
      }
      nøkkel++;
    }
    rader.push(<tr key={nøkkel}>{header}</tr>);
    let radnr = 0;
    SQLdata.map(rad => {
      radnr++;
      let utstyrID = '';
      const data = [];
      for (let i = 0; i <= Object.getOwnPropertyNames(SQLdata[0]).length; i++) {
        if (i < Object.getOwnPropertyNames(SQLdata[0]).length) {
          if (rad[Object.getOwnPropertyNames(SQLdata[0])[i]] instanceof Date) {
            data.push(
              <td key={nøkkel}>{date.format(rad[Object.getOwnPropertyNames(SQLdata[0])[i]], 'DD/MM/YY HH:mm')}</td>
            );
          } else {
            data.push(<td key={nøkkel}>{rad[Object.getOwnPropertyNames(SQLdata[0])[i]]}</td>);
          }
          if (Object.getOwnPropertyNames(SQLdata[0])[i] == 'Utstyrsnr') {
            utstyrID = `${rad[Object.getOwnPropertyNames(SQLdata[0])[i]]}`;
          }
          nøkkel++;
        } else {
          data.push(
            <td key={nøkkel}>
              <Link to={utstyrID}>Se</Link>
            </td>
          );
        }
      }
      if (!skjulteRader.includes(radnr)) {
        rader.push(<tr key={nøkkel}>{data}</tr>);
      }
    });
    suksess(rader);
  }

  //søker i en tabell på et gitt søkeord.
  //Returner en liste med indeksen til alle rader som inneholder ordet

  søkITabell(søkeord, tabell, ikkeSisteRad) {
    søkeord = søkeord.toLowerCase();
    const raderSomSkalFjernes = [];
    for (let i = 1; i < tabell.length; i++) {
      let treff = false;
      // per rad
      for (let j = 0; j < tabell[i].props.children.length - ikkeSisteRad; j++) {
        // per celle i rad
        // tving streng så man kan søke selv om det er et tall
        const celle = `${tabell[i].props.children[j].props.children}`;

        if (celle.toLowerCase().includes(søkeord)) {
          treff = true;
        }
      }
      if (!treff) {
        raderSomSkalFjernes.push(i);
      }
    }
    return raderSomSkalFjernes;
  }

  //henter detaljer om en gitt kunde
  hentKunde(id, suksess) {
    oppkobling.query('select * from kunde where kunde_id =?', [id], (error, resultat) => {
      if (error) {
        console.error(error);
      }
      suksess(resultat[0]);
    });
  }

  //endrer opplysningene til en kunde
  oppdaterKunde(id, fnavn, enavn, tlf, epost, suksess) {
    oppkobling.query(
      'update kunde set fnavn = ?, enavn = ?, tlf = ?, epost = ? where kunde_id = ?',
      [fnavn, enavn, tlf, epost, id],
      error => {
        if (error) {
          return console.error(error);
        }
        suksess();
      }
    );
  }

  //henter passordet til en gitt ansatt
  //passord krypteres og sammenlignes med et inntastet passord
  hentAnsattPassord(id, passord, suksess) {
    oppkobling.query('select passord from ansatt where ans_id = ?', [id, passord], (error, resultat) => {
      if (error) {
        console.error(error);
      }
      bcrypt.compare(passord, resultat[0].passord, (err, res) => {
        if (res) {
          return suksess('riktig');
        } else {
          return suksess('Feil');
        }
      });
    });
  }

  //endrer passordet til en gitt ansatt.
  //passordet krypteres før det sendes til databasen
  endreAnsattPassord(passord, id, suksess) {
    bcrypt.hash(passord, 10, function(err, hash) {
      oppkobling.query('update ansatt set passord=? where ans_id=?', [hash, id], error => {
        if (error) return console.error(error);

        suksess('oppdatert');
      });
    });
  }

  //endrer opplysninger til en ansatt
  endreAnsattPersonalia(epost, telefon, id, suksess) {
    oppkobling.query('update ansatt set epost=?, tlf=? where ans_id=?', [epost, telefon, id], error => {
      if (error) return console.error(error);

      suksess('oppdatert');
    });
  }
}

export const sykkelTjeneste = new SykkelTeneste();

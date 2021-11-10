import date from 'date-and-time';
import { kundeValid } from './kundeTjeneste';
import { oppkobling } from './mysql_tilkobling';
import { sykkelTjeneste } from './teneste';
import * as React from 'react';

/*Bestilling
Denne klassen lagrer en bestilling midlertidig mens den skapes av selgeren.
Dette gjøres for å slippe unødvendige spørringer i databasen under registrering.
Klassen er designet for å legge til rette for strukturen på databasen så godt som mulig.
Etter en bestilling registreres i databasen, skal objektvariablene her tømmes for å
gjøre klart til neste registrering.
Klassen brukes også for å vise innhold i en gammel bestilling.
*/
class Bestilling {
  bestilling = {};
  spesifikasjoner = [];
  kunde = {};
  pris = 0;

  settBestilling(oppdatertBestilling) {
    this.bestilling = oppdatertBestilling;
  }

  hentBestilling() {
    return this.bestilling;
  }

  leggTilSpesifikasjon(utstyr, sykkel) {
    let spesifikasjon = {
      sykkel: sykkel,
      utstyr: utstyr
    };
    this.spesifikasjoner.push(spesifikasjon);
  }

  fjernSpesifikasjon(spesnr) {
    let sykkel = this.spesifikasjoner[spesnr].sykkel;

    for (let i = 0; i < this.spesifikasjoner.length; i++) {
      if (this.spesifikasjoner[i].sykkel == sykkel) {
        this.spesifikasjoner.splice(i, 1);
        i--;
      }
    }
  }

  settRabatt(nyrabatt) {
    this.bestilling.rabatt = nyrabatt;
  }

  hentSpesifikasjoner() {
    return this.spesifikasjoner;
  }

  beregnpris(spesnr, sykler, utstyr) {
    let fra = new Date(this.bestilling.fraDato);
    let til = new Date(this.bestilling.tilDato);

    //finn antall timer fra start til slutt av bestillingen.
    //døgn gjøres om slik at man ikke skal betale for mer enn 8 timer per dag.
    let timer = Math.floor(Math.abs((fra - til) / 36e5)) + 1;
    let døgn = Math.floor(timer / 24);
    timer -= døgn * 24;
    if (timer > 8) timer = 8;
    let nettotimer = timer + døgn * 8;

    let pris = 0;

    //regn ut pris for sykkelen
    let sykkel = this.spesifikasjoner[spesnr].sykkel;
    for (let i = 0; i < sykler.length; i++) {
      if (sykler[i].s_nr == sykkel) pris += sykler[i].raapris * nettotimer;
    }

    //regn ut pris for tillegsutstyr
    for (let i = 0; i < this.spesifikasjoner.length; i++) {
      if (this.spesifikasjoner[i].sykkel == sykkel) {
        for (let j = 0; j < utstyr.length; j++) {
          if (utstyr[j].Utstyrsnr == this.spesifikasjoner[i].utstyr) {
            pris += utstyr[j].Råpris * nettotimer;
          }
        }
      }
    }
    return pris;
  }

  //lager kurven som viser alt innholdet i bestillingen så langt
  lagKurv(suksess) {
    let dbSykler = [];
    let dbUtstyr = [];

    sykkelTjeneste.hentSyklerBestilling(resultat => {
      dbSykler = resultat;
      sykkelTjeneste.hentUtstyrsTabell(resultat2 => {
        dbUtstyr = resultat2;

        let kurv = [];
        if (this.spesifikasjoner.length == 0) {
          kurv.push('Kurven er tom');
          suksess(
            <table>
              <tbody>
                <tr key="1">
                  <td key="2">{kurv}</td>
                </tr>
              </tbody>
            </table>
          );
          return;
        }
        let sykler = [];
        let utstyr = [];
        let gjeldendeSykkel = 0;
        let tidligereSykler = [];
        let utstyret = '';
        let sykkelen = '';
        let sluttpris = 0;

        for (let i = 0; i < this.spesifikasjoner.length; i++) {
          if (this.spesifikasjoner[i].utstyr == null) this.spesifikasjoner[i].utstyr = 0;
          utstyr = [];
          if (!tidligereSykler.includes(this.spesifikasjoner[i].sykkel)) {
            gjeldendeSykkel = this.spesifikasjoner[i].sykkel;
            for (let j = 0; j < this.spesifikasjoner.length; j++) {
              if (this.spesifikasjoner[j].sykkel == gjeldendeSykkel) {
                for (let k = 0; k < dbSykler.length; k++) {
                  if (dbSykler[k].s_nr == gjeldendeSykkel) sykkelen = { nr: dbSykler[k].s_nr, type: dbSykler[k].type };
                }

                if (this.spesifikasjoner[j].utstyr != 0) {
                  //utstyr skal legges til
                  for (let k = 0; k < dbUtstyr.length; k++) {
                    if (dbUtstyr[k].Utstyrsnr == this.spesifikasjoner[j].utstyr) {
                      utstyret = dbUtstyr[k].Type;
                    }
                  }
                  utstyr.push(<p>{utstyret}</p>);
                }
              }
            }
            sykler.push(
              <tr key={i}>
                <td key={'sykkel' + i}>{sykkelen.type}</td>
                <td key={'utstyr' + i}>{utstyr}</td>
                <td key={'pris' + i}>{this.beregnpris(i, dbSykler, dbUtstyr)}</td>
                <td key={'slett' + i}>
                  <button onClick={e => this.fjernSpesifikasjon(i)} className="knappArrowRight">
                    <i className="fas fa-times" fa-lg />
                  </button>
                </td>
              </tr>
            );
          }
          tidligereSykler.push(gjeldendeSykkel);
        }

        for (let i = 0; i < this.spesifikasjoner.length; i++) {
          sluttpris += this.beregnpris(i, dbSykler, dbUtstyr);
        }

        if (this.bestilling.rabatt != undefined) this.pris = sluttpris * ((100 - this.bestilling.rabatt) / 100);
        else this.pris = sluttpris;

        kurv.push(
          <div key="-995">
            <table key="-994">
              <tbody key="-993">
                <tr key="-1000">
                  <th key="-999">Sykkel</th>
                  <th key="-998">Utstyr</th>
                  <th key="-997">Pris</th>
                  <th key="-996">Fjern</th>
                </tr>
                {sykler}
              </tbody>
            </table>
            <h2>Pris: {this.pris}</h2>
          </div>
        );
        suksess(kurv);
      });
    });
  }

  endreKunde(kunde) {
    this.kunde = kunde;
  }

  //lagrer bestillingingen i databasen
  lagrebestilling() {
    let ordrenr;
    let bestdato = date.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
    let spørring =
      'insert into bestilling(kunde_id, bestillingsdato, fra_dato, til_dato, rabatt, selger_id, hentested, leveringsted, pris) values(?,?,?,?,?,?,?,?, ?)';
    let formatertTil = this.bestilling.tilDato.split('T')[0] + ' ' + this.bestilling.tilDato.split('T')[1] + ':00';
    let formatertFra = this.bestilling.fraDato.split('T')[0] + ' ' + this.bestilling.fraDato.split('T')[1] + ':00';
    oppkobling.query(
      spørring,
      [
        this.kunde.kunde_id,
        bestdato,
        formatertFra,
        formatertTil,
        this.bestilling.rabatt,
        this.bestilling.ansattID,
        this.bestilling.hentested,
        this.bestilling.leverested,
        this.pris
      ],
      error => {
        if (error) console.error(error);
      }
    );

    spørring =
      'select ordrenr from bestilling where kunde_id = ?, bestillingsdato = ?, fra_dato = ?, til_dato = ?, rabatt = ?, selger_id = ?, hentested = ?, leveringsted = ?;';

    oppkobling.query('select max(ordrenr) as ordrenr from bestilling', (error, resultat) => {
      if (error) console.error(error);
      ordrenr = resultat[0].ordrenr;
      for (let i = 0; i < this.spesifikasjoner.length; i++) {
        if (this.spesifikasjoner[i].sykkel == 0) this.spesifikasjoner[i].sykkel = null;
        if (this.spesifikasjoner[i].utstyr == 0) this.spesifikasjoner[i].utstyr = null;

        oppkobling.query(
          'insert into bestillingspesifikasjon(s_nr, ordrenr, utstyrsnr) values(?,?,?)',
          [this.spesifikasjoner[i].sykkel, ordrenr, this.spesifikasjoner[i].utstyr],
          error2 => {
            if (error2) console.error(error2);
          }
        );
      }
      this.bestilling = {};
      this.spesifikasjoner = [];
      this.kunde = {};

      return;
    });
  }

  //oppdaterer bestillingen i databasen
  oppdaterBestilling(ordrenr) {
    let dbSykler = [];
    let dbUtstyr = [];
    let sluttpris = 0;
    sykkelTjeneste.hentSyklerBestilling(sykler => {
      dbSykler = sykler;
      sykkelTjeneste.hentUtstyrsTabell(utstyr => {
        dbUtstyr = utstyr;
        for (let i = 0; i < this.spesifikasjoner.length; i++) {
          sluttpris += this.beregnpris(i, dbSykler, dbUtstyr);
        }
        sluttpris *= 1 - this.bestilling.rabatt / 100;
        oppkobling.query(
          'update bestilling set fra_dato = ?, til_dato = ?, rabatt = ?, pris = ?, hentested = ?, leveringsted = ? where ordrenr = ?',
          [
            this.bestilling.fraDato,
            this.bestilling.tilDato,
            this.bestilling.rabatt,
            sluttpris,
            this.bestilling.hentested,
            this.bestilling.leveringsted,
            ordrenr
          ],
          error => {
            if (error) console.error(error);
          }
        );
        oppkobling.query('delete from bestillingspesifikasjon where ordrenr = ?', [ordrenr], error => {
          if (error) console.error(error);
        });
        for (let i = 0; i < this.spesifikasjoner.length; i++) {
          if (this.spesifikasjoner[i].sykkel == 0) this.spesifikasjoner[i].sykkel = null;
          if (this.spesifikasjoner[i].utstyr == 0) this.spesifikasjoner[i].utstyr = null;

          oppkobling.query(
            'insert into bestillingspesifikasjon(s_nr, ordrenr, utstyrsnr) values(?,?,?)',
            [this.spesifikasjoner[i].sykkel, ordrenr, this.spesifikasjoner[i].utstyr],
            error => {
              if (error) console.error(error);
            }
          );
        }
      });
    });
  }

  //forbereder lagring av ny bestilling
  fullførBestilling(suksess) {
    if (this.kunde.kunde_id == null) {
      let regdato = date.format(new Date(), 'YYYY-MM-DD');
      kundeValid.leggTilKunde(this.kunde.fnavn, this.kunde.enavn, this.kunde.tlf, this.kunde.epost, regdato, kid => {
        this.kunde.kunde_id = kid;
        this.lagrebestilling();
      });
    } else this.lagrebestilling();
    suksess('Lagrer...');
  }
}

export let bestillingTeneste = new Bestilling();

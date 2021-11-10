import * as React from 'react';
import { Component } from 'react-simplified';
import { Link } from 'react-router-relative-link';
import date from 'date-and-time';

import { oppkobling } from './mysql_tilkobling';
import { sykkelTjeneste } from './teneste';
import { navTeneste } from './navTeneste';
import { brukerValid } from './loginTjeneste';
import { bestillingTeneste } from './bestillingteneste';
import { kundeValid } from './kundeTjeneste';
import { SykkelBestillingTabell, UtstyrBestillingTabell } from './tabeller';

/*EndreBestilling
Komponent for å endre innholdet i en allerede lagret bestilling
*/
export class EndreBestilling extends Component {
  bestilling = {};
  bestillingsdetaljer = [];
  spesifikasjoner = [];

  //trenger eget rabattvariabel for å oppdatere kurven
  rabatt = 0;
  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <table onClick={this.lagKurv}>
            <tbody>{this.bestillingsdetaljer}</tbody>
          </table>
          <Kurv rabatt={this.rabatt} />
          <Link to="sykkel">
            <button>Legg til sykkel</button>
          </Link>
          <button onClick={this.lagre}>Lagre endringer</button>
        </div>
      </div>
    );
  }
  mounted() {
    this.lagBestillingsKort();
    this.hentSpesifikasjoner();
  }
  lagre() {
    this.oppdaterBestilling();
    bestillingTeneste.oppdaterBestilling(this.props.match.params.ordrenr);
  }
  oppdaterBestilling() {
    this.bestilling.Til = new Date(this.bestilling.Til);
    this.bestilling.Fra = new Date(this.bestilling.Fra);
    bestillingTeneste.settBestilling({
      hentested: this.bestilling.Hentested,
      leveringsted: this.bestilling.Leveringsted,
      bestillingsDato: this.bestilling.Bestillingsdato + ':00',
      fraDato: date.format(this.bestilling.Fra, 'YYYY-MM-DD HH:mm:ss'),
      tilDato: date.format(this.bestilling.Til, 'YYYY-MM-DD HH:mm:ss'),
      ansattID: brukerValid.ansattID,
      rabatt: this.rabatt
    });
    //vet at dette ser sykt teit ut men må det for å oppdatere kurv
    this.rabatt += 0;
  }
  endreDato(dato, verdi) {
    if (dato == 'Fra') {
      this.bestilling.Fra = 'hohohohoh';
      this.bestilling.Fra = verdi;
    } else if (dato == 'Til') {
      this.bestilling.Til = verdi;
    }
    this.oppdaterBestilling();
    this.render();
  }
  oppdaterRabatt(nyrabatt) {
    this.bestilling.rabatt = nyrabatt;
    this.rabatt = nyrabatt;
    bestillingTeneste.settRabatt(nyrabatt);
  }
  //lager et kort med generell info om bestillingen
  lagBestillingsKort() {
    sykkelTjeneste.hentelevereStadar(resultat => {
      sykkelTjeneste.hentBestilling(this.props.match.params.ordrenr, bestilling => {
        this.rabatt = bestilling.Rabatt;
        this.bestilling = bestilling;
        bestillingTeneste.settBestilling({
          bestillingsDato: date.format(bestilling.Bestillingsdato, 'YYYY-MM-DD HH:mm:ss'),
          fraDato: date.format(bestilling.Fra, 'YYYY-MM-DD HH:mm:ss'),
          tilDato: date.format(bestilling.Til, 'YYYY-MM-DD HH:mm:ss'),
          ansattID: brukerValid.ansattID,
          rabatt: bestilling.Rabatt
        });
        bestillingTeneste.pris = this.bestilling.Pris;

        const rader = [];
        let data = [];
        let nykel = 0;

        for (let i = 0; i < Object.getOwnPropertyNames(this.bestilling).length; i++) {
          if (this.bestilling[Object.getOwnPropertyNames(this.bestilling)[i]] instanceof Date) {
            if (Object.getOwnPropertyNames(this.bestilling)[i] == 'Bestillingsdato') {
              this.bestilling[Object.getOwnPropertyNames(this.bestilling)[i]] = date.format(
                this.bestilling[Object.getOwnPropertyNames(this.bestilling)[i]],
                'YYYY-MM-DD HH:mm'
              );
            } else {
              this.bestilling[Object.getOwnPropertyNames(this.bestilling)[i]] = date.format(
                this.bestilling[Object.getOwnPropertyNames(this.bestilling)[i]],
                'YYYY-MM-DDTHH:mm'
              );
            }
          }
          if (
            Object.getOwnPropertyNames(this.bestilling)[i] == 'Fra' ||
            Object.getOwnPropertyNames(this.bestilling)[i] == 'Til'
          ) {
            data.push(
              <td className="usynligtabell" key={nykel}>
                {Object.getOwnPropertyNames(this.bestilling)[i]}:
              </td>
            );
            nykel++;

            data.push(
              <td>
                <input
                  className="skjemaInput dateInput"
                  defaultValue={this.bestilling[Object.getOwnPropertyNames(this.bestilling)[i]]}
                  onChange={event => this.endreDato(Object.getOwnPropertyNames(this.bestilling)[i], event.target.value)}
                  type="datetime-local"
                />
              </td>
            );
            nykel++;
          } else if (Object.getOwnPropertyNames(this.bestilling)[i] == 'Rabatt') {
            data.push(
              <td className="usynligtabell" key={nykel}>
                {Object.getOwnPropertyNames(this.bestilling)[i]}:
              </td>
            );
            nykel++;

            data.push(
              <td>
                <input
                  defaultValue={this.bestilling[Object.getOwnPropertyNames(this.bestilling)[i]]}
                  onChange={event => this.oppdaterRabatt(event.target.value)}
                  type="number"
                />
              </td>
            );
            nykel++;
          } else if (
            Object.getOwnPropertyNames(this.bestilling)[i] != 'Hentested' &&
            Object.getOwnPropertyNames(this.bestilling)[i] != 'Leveringsted'
          ) {
            data.push(
              <td className="usynligtabell" key={nykel}>
                {Object.getOwnPropertyNames(this.bestilling)[i]}:
              </td>
            );
            nykel++;
            data.push(
              <td className="usynligtabell" key={nykel}>
                {this.bestilling[Object.getOwnPropertyNames(this.bestilling)[i]]}
              </td>
            );
            nykel++;
          } else {
            let områdeID = 0;
            //finn områdeID
            for (let j = 0; j < resultat.length; j++) {
              if (resultat[j].lokasjon_id == this.bestilling[Object.getOwnPropertyNames(this.bestilling)[i]]) {
                områdeID = resultat[j].omr_id;
              }
            }
            let stadsval = sykkelTjeneste.lagStadsVal(
              resultat,
              områdeID,
              this.bestilling[Object.getOwnPropertyNames(this.bestilling)[i]]
            );
            data.push(
              <td className="usynligtabell" key={nykel}>
                {Object.getOwnPropertyNames(this.bestilling)[i]}:
              </td>
            );
            nykel++;

            data.push(
              <td className="usynligtabell" key={nykel}>
                <select
                  onChange={event =>
                    (this.bestilling[Object.getOwnPropertyNames(this.bestilling)[i]] = event.target.value)
                  }
                >
                  {stadsval}
                </select>
              </td>
            );
            nykel++;
          }
          //få to elementer per linje
          if ((i + 1) % 2 === 0) {
            rader.push(<tr key={nykel}>{data}</tr>);
            nykel++;
            data = [];
          }
        }
        this.bestillingsdetaljer = rader;
      });
    });
  }

  hentSpesifikasjoner() {
    sykkelTjeneste.hentSpesifikasjoner(this.props.match.params.ordrenr, spesifikasjoner => {
      spesifikasjoner.map(spesifikasjon => {
        bestillingTeneste.leggTilSpesifikasjon(spesifikasjon.utstyrsnr, spesifikasjon.s_nr);
      });
      this.spesifikasjoner = bestillingTeneste.hentSpesifikasjoner();
    });
  }
}

/*NyBestilling
Komponent for ny å legge til ny bestilling.
Her fylles inn grunnleggende info om fra og til før man så trykker seg videre
for å fylle inn bestillingen
*/
export class NyBestilling extends Component {
  bestilling = {
    ansattID: brukerValid.ansattID,
    bestillingsDato: date.format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    fraDato: date.format(new Date(), 'YYYY-MM-DDTHH:mm'),
    tilDato: date.format(new Date(), 'YYYY-MM-DDTHH:mm'),
    hentested: '1',
    leverested: '1'
  };
  område = 1;
  områdar = [];
  stadar = [];
  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <div className="bestillingDiv">
            <h3>Ny bestilling</h3>
            <table>
              <tbody>
                <tr>
                  <td>
                    Område:{' '}
                    <select
                      className="selectClass"
                      value={this.område}
                      onChange={event => this.velgområde(event.target.value)}
                      tabIndex="0"
                    >
                      {this.områdar}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td className="usynligtabell">
                    <label className="bestillingTekst" for="fra">
                      Fra:
                    </label>
                    <input
                      className="skjemaInput dateInput"
                      value={this.bestilling.fraDato}
                      onChange={event => (this.bestilling.fraDato = event.target.value)}
                      type="datetime-local"
                      name="fra"
                    />
                  </td>
                  <td className="usynligtabell">
                    <label className="bestillingTekst" for="til">
                      Til:
                    </label>
                    <input
                      className="skjemaInput dateInput"
                      value={this.bestilling.tilDato}
                      onChange={event => (this.bestilling.tilDato = event.target.value)}
                      type="datetime-local"
                      name="til"
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label className="bestillingTekst" for="hentested">
                      Hentested{' '}
                    </label>
                    <select
                      className="selectClass"
                      value={this.bestilling.hentested}
                      onChange={event => (this.bestilling.hentested = event.target.value)}
                      tabIndex="0"
                      name="hentested"
                    >
                      {sykkelTjeneste.lagStadsVal(this.stadar, this.område, this.bestilling.hentested)}
                    </select>
                  </td>
                  <td>
                    <label className="bestillingTekst" for="leveringssted">
                      Leveringssted{' '}
                    </label>
                    <select
                      className="selectClass"
                      value={this.bestilling.leverested}
                      onChange={event => (this.bestilling.leverested = event.target.value)}
                      tabIndex="0"
                      name="leveringssted"
                    >
                      {sykkelTjeneste.lagStadsVal(this.stadar, this.område, this.bestilling.leverested)}
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>

            <Link to="sykkel">
              <button type="button" onClick={this.oppdaterBestilling} className="knappLayout" title="Legg til sykkel">
                Videre
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  velgområde(valgtområde) {
    this.område = valgtområde;
    sykkelTjeneste.hentOmraader(resultat => {
      this.områdar = sykkelTjeneste.lagOmraadeVal(resultat, valgtområde);
    });
  }
  oppdaterBestilling() {
    bestillingTeneste.settBestilling(this.bestilling);
  }
  mounted() {
    bestillingTeneste.spesifikasjoner = [];
    sykkelTjeneste.hentOmraader(resultat => {
      this.områdar = sykkelTjeneste.lagOmraadeVal(resultat, 0);
    });

    sykkelTjeneste.hentelevereStadar(stadar => {
      this.stadar = stadar;
    });
  }
}

/*TilføySykkel
Tilføy sykkel i en bestilling.
Man velger en sykkel om gangen før man velger utstyr man eventuelt vil ha på.
Man kan også fortsette uten å velge en sykkel for å kun bestille utstyr
*/
export class TilFøySykkel extends Component {
  bestilling = bestillingTeneste.hentBestilling();
  tilDato = '';
  fraDato = '';
  innhold = [];
  spesifikasjoner = bestillingTeneste.hentSpesifikasjoner();
  ferdigsti = '';
  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <div className="row">
            <div className="col-md">
              <h3>Velg Sykkel</h3>
              <SykkelBestillingTabell spesifikasjoner={this.spesifikasjoner} />
              <div>
                <Link to={this.ferdigsti}>
                  <button type="button" className="litenløsknapp" title="Fullfør" id="litenløsknappHoyre">
                    Fullfør bestilling
                  </button>
                </Link>
              </div>
            </div>
            <div className="col-sm">
              <Kurv />
            </div>
          </div>
        </div>
      </div>
    );
  }
  mounted() {
    this.ferdigsti = '../ferdigstill';
    if (window.location.hash.split('/')[2] == 'bestilling') {
      this.ferdigsti = '..';
    }
  }
}

/*TilFøyUtstyr
Velg utstyr man vil ha på tidligere valgt sykkel.
Kan også fortsette uten tilleggsutstyr
*/
export class TilFøyUtstyr extends Component {
  sykkelKort = [];
  spesifikasjoner = bestillingTeneste.hentSpesifikasjoner();

  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <div className="row">
            <table>
              <tbody>{this.sykkelKort}</tbody>
            </table>
            <h3>Velg utstyr</h3>
            <UtstyrBestillingTabell sykkel={this.props.match.params.sykkelID} spesifikasjoner={this.spesifikasjoner} />
          </div>
        </div>
      </div>
    );
  }
  mounted() {
    if (this.props.match.params.sykkelID != 0) {
      sykkelTjeneste.hentSykkel(this.props.match.params.sykkelID, resultat => {
        this.lagSykkelKort(resultat);
      });
    }
  }
  lagSykkelKort(SQLdata) {
    let rader = [];
    rader.push(
      <tr key="1">
        <td key="2" className="usynligtabell">
          Sykkelnr: {SQLdata.Sykkelnr}
        </td>
        <td key="3" className="usynligtabell">
          Type: {SQLdata.Type}
        </td>
        <td key="4" className="usynligtabell">
          Råpris: {SQLdata.Råpris}
        </td>
      </tr>
    );
    rader.push(
      <tr key="8">
        <td key="5" className="usynligtabell">
          Bruker: {SQLdata.Bruker}
        </td>
        <td key="6" className="usynligtabell">
          Gir: {SQLdata.Girsystem}
        </td>
        <td key="7" className="usynligtabell">
          Bremser: {SQLdata.Bremser}
        </td>
      </tr>
    );
    this.sykkelKort = rader;
  }
}

/*FerdigStillBestilling
Her fyller man inn den siste informasjonen før bestillingen lagres.
Kundeinfo og rabatt føres inn her.
*/
export class FerdigStillBestilling extends Component {
  rabatt = 0;
  feiltekst = '';
  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <div className="w3-animate-opacity">
            <div className="row">
              <div className="col-sm">
                <h3>Fullfør bestilling</h3>
                Rabatt:{' '}
                <input
                  type="number"
                  value={this.rabatt}
                  onChange={e => this.settRabatt(e.target.value)}
                  className="loginInput"
                />
                <TilføyKunde />
                <button type="button" onClick={this.lagre} className="litenløsknapp" title="Lagre bestilling">
                  Lagre bestilling
                </button>
                <Link to="../sykkel">
                  <button type="button" id="litenløsknappTilbake" title="tilbake">
                    Tilbake
                  </button>
                </Link>
                <p>{this.feiltekst}</p>
              </div>
              <div className="col-sm">
                <Kurv rabatt={this.rabatt} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  mounted() {
    bestillingTeneste.settRabatt(this.rabatt);
  }

  lagre() {
    if (
      !(
        Object.entries(bestillingTeneste.kunde).length == 0 ||
        bestillingTeneste.kunde.tlf == '' ||
        bestillingTeneste.kunde.fnavn == '' ||
        bestillingTeneste.kunde.enavn == '' ||
        bestillingTeneste.kunde.epost == ''
      )
    ) {
      bestillingTeneste.fullførBestilling(resultat => {
        this.feiltekst = resultat;
        oppkobling.query('select max(ordrenr) as ordrenr from bestilling', (error, ordrenr) => {
          if (error) console.error(error);
          this.props.history.push('/salg/bestilling/' + ordrenr[0].ordrenr);
        });
      });
    } else {
      this.feiltekst = 'Vennligst fyll inn alle feltene';
    }
  }

  settRabatt(rabatt) {
    this.rabatt = rabatt;
    bestillingTeneste.settRabatt(rabatt);
  }
}

/*TilFøyKunde
Boks som brukes for å velge en kunde til bestillingen.
Søker i gamle kunder på telefonnummer, eller legger til ny om telefonnummeret ikke
finnes i databasen fra før av
*/
export class TilføyKunde extends Component {
  kunde = {
    fnavn: '',
    enavn: '',
    epost: '',
    kunde_id: '',
    tlf: ''
  };
  kunder = [];
  render() {
    return (
      <div className="w3-animate-opacity">
        <h3>Kundeinfo</h3>
        <form>
          <table>
            <tbody>
              <tr>
                <th>Type</th>
                <th>Verdi</th>
              </tr>
              <tr>
                <td>Telefon</td>
                <td>
                  <input
                    type="number"
                    value={this.kunde.tlf}
                    onChange={event => this.sjekkTelefon(event.target.value)}
                    className="loginInput"
                  />
                </td>
              </tr>
              <tr>
                <td>Fornavn</td>
                <td>
                  <input
                    type="text"
                    value={this.kunde.fnavn}
                    onChange={event => (this.kunde.fnavn = event.target.value)}
                    className="loginInput"
                  />
                </td>
              </tr>
              <tr>
                <td>Etternavn</td>
                <td>
                  <input
                    type="text"
                    value={this.kunde.enavn}
                    onChange={event => (this.kunde.enavn = event.target.value)}
                    className="loginInput"
                  />
                </td>
              </tr>
              <tr>
                <td>Epost</td>
                <td>
                  <input
                    type="email"
                    value={this.kunde.epost}
                    onChange={event => (this.kunde.epost = event.target.value)}
                    className="loginInput"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }
  //sjekk om tlfnr allerede finnes, og fyll inn resten av data om det er et treff
  sjekkTelefon(nytelefon) {
    this.kunde.tlf = nytelefon;
    let treff = false;
    for (let i = 0; i < this.kunder.length; i++) {
      if (this.kunder[i].tlf == this.kunde.tlf) {
        treff = true;
        this.kunde = {
          tlf: this.kunder[i].tlf,
          fnavn: this.kunder[i].fnavn,
          enavn: this.kunder[i].enavn,
          epost: this.kunder[i].epost,
          kunde_id: this.kunder[i].kunde_id
        };
      }
    }
    if (!treff) this.kunde = { tlf: nytelefon, fnavn: '', enavn: '', epost: '', kunde_id: null };

    bestillingTeneste.endreKunde(this.kunde);
  }
  mounted() {
    kundeValid.hentKunder(resultat => {
      this.kunder = resultat;
    });
  }
}

/*Kurv
Viser innholdet i bestillingen og pris.
*/
export class Kurv extends Component {
  //rabattvariablet brukes bare for å kunne oppdatere kurven fortløpende.
  //Det brukes ikke i utregning
  rabatt = 0;
  kurv = [];
  render() {
    return (
      <div className="w3-animate-opacity">
        <h3>Kurv</h3>
        <div onClick={this.oppdater}>{this.kurv}</div>
      </div>
    );
  }
  componentWillReceiveProps() {
    this.rabatt = this.props.rabatt;
    this.oppdater();
  }

  mounted() {
    this.rabatt = this.props.rabatt;
    bestillingTeneste.lagKurv(resultat => {
      this.kurv = resultat;
    });
  }
  oppdater() {
    bestillingTeneste.lagKurv(resultat => {
      this.kurv = resultat;
    });
  }
}

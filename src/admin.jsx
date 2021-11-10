import * as React from 'react';
import { Component } from 'react-simplified';
import { Link } from 'react-router-relative-link';
import { NavLink } from 'react-router-dom';
import date from 'date-and-time';

import { sykkelTjeneste } from './teneste';
import { Velkomst } from './allmenn';
import { brukerValid } from './loginTjeneste';
import { AnsatteTabell, KundeTabell, SyklerMaaLeveresTabell, SyklerMaaHentesTabell } from './tabeller';

/* AdminMeny
 * Viser navigasjonsmenyen til admin-brukere
 * Brukes gjennomgående i admin-grensesnitt
 */
export class AdminMeny extends Component {
  // Visuelt innhold
  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="sidebar">
          <NavLink to="/admin/settings">
            <button className="settingsPic" title="Innstillinger">
              <i className="fas fa-user-cog fa-lg" />
            </button>
          </NavLink>
          <NavLink to="/">
            <button className="logoutPic" title="Logg ut">
              <i className="fas fa-power-off fa-lg" />
            </button>
          </NavLink>
          <p className="innloggetBruker">{brukerValid.brukerInnlogget}</p>
          <NavLink to="/admin" exact activeClassName="activeRoute" className="navLink">
            <div className="sidebarNav" tabIndex="0">
              Hjem
            </div>
          </NavLink>
          <NavLink to="/admin/ansatte" exact activeClassName="activeRoute" className="navLink">
            <div className="sidebarNav" tabIndex="0">
              Ansatte
            </div>
          </NavLink>

          <NavLink to="/admin/provisjon" exact activeClassName="activeRoute" className="navLink">
            <div className="sidebarNav" tabIndex="0">
              Provisjon
            </div>
          </NavLink>

          <NavLink to="/admin/kunder" className="navLink" exact activeClassName="activeRoute">
            <div className="sidebarNav" tabIndex="0">
              Kunder
            </div>
          </NavLink>

          <NavLink to="/admin/rapport" className="navLink" exact activeClassName="activeRoute">
            <div className="sidebarNav" tabIndex="0">
              Statistikk
            </div>
          </NavLink>
          <NavLink to="/admin/nylokasjon" className="navLink" exact activeClassName="activeRoute">
            <div className="sidebarNav" tabIndex="0">
              Lokasjon
            </div>
          </NavLink>

          <div id="skillediv">
            <NavLink to="/admin/nybestilling" exact activeClassName="activeRoute" className="navLink">
              <div className="sidebarNav" tabIndex="0">
                Ny bestilling
              </div>
            </NavLink>
            <NavLink to="/admin/bestilling" exact activeClassName="activeRoute" className="navLink">
              <div className="sidebarNav" tabIndex="0">
                Bestillinger
              </div>
            </NavLink>
            <div id="skillediv">
              <NavLink to="/admin/sykkel" className="navLink" exact activeClassName="activeRoute">
                <div className="sidebarNav" tabIndex="0">
                  Sykler
                </div>
              </NavLink>
              <NavLink to="/admin/utstyr" className="navLink" exact activeClassName="activeRoute">
                <div className="sidebarNav" tabIndex="0">
                  Utstyr
                </div>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    );
  } // render()

  // Logger ut brukeren og sender den til innloggingssiden
  loggUt() {
    brukerValid.brukerInnlogget = '';
  } // loggUt()
} // AdminMeny

/* AnsatteOversikt
 * Viser en oversikt over alle Ansatte
 * Tabellen hentes fra tabeller.jsx
 * Tabellen gir også mulighet for å legge til nye ansatte, spesifisert i NyAnsatt-Klassen
 * Brukes i admin-meny-grensesnittet
 */
export class AnsatteOversikt extends Component {
  // Visuelt innhold
  render() {
    return (
      <div className="mainContent">
        <div className="w3-animate-opacity">
          <h3>Ansatte</h3>
          <AnsatteTabell />
        </div>
      </div>
    );
  } // render()
} // AnsatteOversikt

/* UtstyrDetaljerAdmin
 * Viser en detaljert oversikt over bestemt utstyrsnr, samt mulighet for å endre detaljer
 * Viser eventuelt tomt innhold dersom det ikke er valgt utstyr fra før
 * Viderekobles hit fra Utstyr-tabellen som ligger i allmenn.jsx
 * Utstyr-tabellen gir mulighet for å velge ønsket utstyr for å se detaljer
 * Utstyr-tabellen prosjekteres i Utstyr i admin-grensesnittet
 */
export class UtstyrDetaljerAdmin extends Component {
  // utstyr{} hentes i mounted() og mellomlagres for evt oppdatering av detaljer
  utstyr = {
    beskrivelse: 'Laster...',
    status: 'Laster...',
    tilhorende_lokasjon: 'Laster...',
    naavaerende_lokasjon: 'Laster...',
    raapris: 'Laster...'
  };
  statuser = ['tilgjengelig', 'utleid'];
  suksess = '';
  stadar = [];
  omr = '';

  // Visuelt innhold
  render() {
    // Dersom det ikke er valgt utstyr, kommer ikke noe innhold frem
    if (this.props.match.params.id == 'nyttutstyr') {
      return null;
    }

    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <form>
            <table>
              <tbody>
                <tr>
                  <th>Type</th>
                  <th>Verdi</th>
                </tr>
                <tr>
                  <td>Utstyrsnummer</td>
                  <td>{this.utstyr.utstyrsnr}</td>
                </tr>
                <tr>
                  <td>Type</td>
                  <td>{this.utstyr.type}</td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td>
                    <select
                      value={this.utstyr.status}
                      onChange={event => (this.utstyr.status = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      {sykkelTjeneste.lagValg(this.statuser, this.utstyr.status)}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Tilhørende lokasjon: </td>
                  <td>
                    <select
                      value={this.utstyr.tilhorende_lokasjon}
                      onChange={event => (this.utstyr.tilhorende_lokasjon = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      {sykkelTjeneste.lagStadsVal(this.stadar, this.omr, this.utstyr.tilhorende_lokasjon)}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Nåværende Lokasjon: </td>
                  <td>
                    <select
                      value={this.utstyr.naavaerende_lokasjon}
                      onChange={event => (this.utstyr.naavaerende_lokasjon = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      {sykkelTjeneste.lagStadsVal(this.stadar, this.omr, this.utstyr.naavaerende_lokasjon)}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Beskrivelse</td>
                  <td>
                    <textarea
                      value={this.utstyr.beskrivelse}
                      onChange={event => (this.utstyr.beskrivelse = event.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Råpris</td>
                  <td>
                    <input
                      type="number"
                      value={this.utstyr.raapris}
                      onChange={event => (this.utstyr.raapris = event.target.value)}
                      className="loginInput"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <Link to="..">
              <button type="button" className="knappLagre" onClick={this.lagre}>
                Lagre
              </button>
            </Link>
            <Link to="..">
              <button type="button" className="knappAvbryt">
                Avbryt
              </button>
            </Link>
            <div id="slettwrapper">
              <Link to="..">
                <button type="button" className="knappAvbryt" onClick={this.Slett}>
                  SLETT
                </button>
              </Link>
            </div>
            <p className="suksess">{this.suksess}</p>
          </form>
        </div>
      </div>
    );
  } // render()

  // Trigges ved knappetrykk. Oppdaterer utstyrsinformasjon.
  lagre() {
    sykkelTjeneste.oppdaterUtstyr(
      this.utstyr.beskrivelse,
      this.utstyr.status,
      this.utstyr.raapris,
      this.utstyr.naavaerende_lokasjon,
      this.utstyr.tilhorende_lokasjon,
      this.props.match.params.id,
      () => {
        this.mounted();
        this.suksess = 'Oppdatering fullført';
      }
    );
  } // lagre()

  Slett() {
    sykkelTjeneste.slettUtstyr(this.props.match.params.id);
  } // Slett()

  // Henter ut detaljer om valgt utstyr
  mounted() {
    if (this.props.match.params.id == 'nyttutstyr') {
      return;
    }
    sykkelTjeneste.hentUtstyr(this.props.match.params.id, utstyr => {
      this.utstyr = utstyr;
    });
    sykkelTjeneste.hentStadar(stadar => {
      this.stadar = stadar;
    });
    sykkelTjeneste.hentOmraadeIdFraUtstyr(this.props.match.params.id, utstyrsid => {
      console.log(utstyrsid);
      this.omr = utstyrsid[0].omr_id;
    });
  } // mounted()
} // UtstyrDetaljerAdmin

/* SykkelDetaljerAdmin
 * Viser en detaljert oversikt over bestemt sykkelnr, samt mulighet for å endre detaljer
 * Viser eventuelt tomt innhold dersom det ikke er valgt utstyr fra før
 * Viderekobles hit fra Sykler-tabellen som ligger i allmenn.jsx
 * Sykler-tabellen gir mulighet for å velge ønsket sykkel for å se detaljer
 * Sykler-tabellen prosjekteres i Sykler i admin-grensesnittet
 */
export class SykkelDetaljerAdmin extends Component {
  bremser = ['kloss', 'skive'];
  statusar = ['tilgjengelig', 'til service', 'stjålet', 'til reparasjon'];
  stadar = [];
  suksess = '';
  gir = [0, 0];
  omr = '';

  // Henter ut data i mounted() og mellomlagrer for evt oppdatering av sykkeldetaljer
  sykkel = {
    Råpris: 'Laster...',
    Status: 'Laster...',
    Tilhørende: 'Laster...',
    Nåværende: 'Laster...',
    Bremser: 'Laster...',
    Girsystem: 'Laster...',
    Dekkstørrelse: 'Laster...'
  };

  // Visuelt innhold
  render() {
    if (this.props.match.params.id == 'nysykkel') {
      return null;
    }
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <NavLink to="..">Tilbake</NavLink>
          <form>
            <table>
              <tbody>
                <tr>
                  <th>Type</th>
                  <th>Verdi</th>
                </tr>
                <tr>
                  <td>Sykkelnummer: </td>
                  <td>{this.sykkel.Sykkelnr}</td>
                </tr>
                <tr>
                  <td>Rammenummer:</td>
                  <td>{this.sykkel.Rammenummer}</td>
                </tr>
                <tr>
                  <td>Status:</td>
                  <td>
                    <select
                      value={this.sykkel.Status}
                      onChange={event => (this.sykkel.Status = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      {sykkelTjeneste.lagValg(this.statusar, this.sykkel.Status)}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Type: </td>
                  <td>{this.sykkel.Type}</td>
                </tr>
                <tr>
                  <td>Bruker: </td>
                  <td>{this.sykkel.Bruker}</td>
                </tr>
                <tr>
                  <td>Råpris: </td>
                  <td>
                    <input
                      type="number"
                      value={this.sykkel.Råpris}
                      onChange={event => (this.sykkel.Råpris = event.target.value)}
                      className="loginInput"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Tilhørende lokasjon: </td>
                  <td>
                    <select
                      value={this.sykkel.Tilhørende}
                      onChange={event => (this.sykkel.Tilhørende = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      {sykkelTjeneste.lagStadsVal(this.stadar, this.omr, this.sykkel.Tilhørende)}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Nåværende Lokasjon: </td>
                  <td>
                    <select
                      value={this.sykkel.Nåværende}
                      onChange={event => (this.sykkel.Nåværende = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      {sykkelTjeneste.lagStadsVal(this.stadar, this.omr, this.sykkel.Nåværende)}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Bremser: </td>
                  <td>
                    <select
                      value={this.sykkel.Bremser}
                      onChange={event => (this.sykkel.Bremser = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      {sykkelTjeneste.lagValg(this.bremser, this.sykkel.Bremser)}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Gir: </td>
                  <td>
                    <input
                      type="number"
                      className="litenummerfelt"
                      value={this.gir[0]}
                      onChange={event => (this.gir[0] = event.target.value)}
                    />
                    x
                    <input
                      type="number"
                      className="litenummerfelt"
                      value={this.gir[1]}
                      onChange={event => (this.gir[1] = event.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Dekkstørrelse: </td>
                  <td>
                    <input
                      type="number"
                      value={this.sykkel.Dekkstørrelse}
                      onChange={event => (this.sykkel.Dekkstørrelse = event.target.value)}
                      className="loginInput"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <NavLink to="/admin/sykkel" className="navLink">
              <button type="button" onClick={this.lagre} className="knappLagre">
                Lagre
              </button>
            </NavLink>
            <NavLink to="/admin/sykkel" className="navLink">
              <button className="knappAvbryt">Avbryt</button>
            </NavLink>{' '}
            <div id="slettwrapper">
              <NavLink to="/admin/sykkel">
                <button type="button" onClick={this.slett} className="knappAvbryt">
                  Slett
                </button>
              </NavLink>
            </div>
            <p className="suksess">{this.suksess}</p>
          </form>
        </div>
      </div>
    );
  } // render()
  //dekk, gir, bremser, lokasjoner, status(kun fra utleid til stjålet, ellers fritt)

  // Sletter valgt sykkel fra databasen
  slett() {
    sykkelTjeneste.slettSykkel(this.props.match.params.id);
  } // slett()

  // Lagrer sykkelinformasjon og oppdaterer databasen
  lagre() {
    this.sykkel.Girsystem = `${this.gir[0]}x${this.gir[1]}`;
    sykkelTjeneste.oppdaterSykkel(
      this.sykkel.Råpris,
      this.sykkel.Sykkelnr,
      this.sykkel.Bremser,
      this.sykkel.Girsystem,
      this.sykkel.Dekkstørrelse,
      this.sykkel.Tilhørende,
      this.sykkel.Nåværende,
      this.sykkel.Status,
      () => {
        this.mounted();
        this.suksess = 'Oppdatering fullført';
      }
    );
    sykkelTjeneste.lagStadsVal(this.stadar, this.sykkel.Nåværende);
  } // lagre()

  // Henter informasjon om valgt sykkelnr
  mounted() {
    if (this.props.match.params.id == 'nysykkel') {
      return null;
    } //mounted()

    sykkelTjeneste.hentSykkel(this.props.match.params.id, sykkel => {
      this.sykkel = sykkel;

      this.gir = this.sykkel.Girsystem.split('x');
    });
    sykkelTjeneste.hentStadar(stadar => {
      this.stadar = stadar;
    });
    sykkelTjeneste.hentOmraadeIdFraSykkel(this.props.match.params.id, omr => {
      this.omr = omr[0].omr_id;
    });
  } // mounted()
} // SykkelDetaljerAdmin

/* NyAnsatt
 * Lar brukere i admin-grensesnittet legge til nye ansatte
 */
export class NyAnsatt extends Component {
  // Henter alle registrerte brukere i mounted() for å unngå at samme brukernavn blir brukt for flere brukere
  brukere = [];
  brukervalid = '#ddd';
  brukervalidTekst = 'hidden';

  // Henter områder i mounted() for å lage et <option> for aktuelle områder en ansatt kan jobbe i
  omraader = [];
  std = '1';

  feedback = '';
  feedbackFarge = 'red';
  fnavnvalid = '';
  enavnvalid = '';
  tlfvalid = '';
  epostvalid = '';
  avdelingvalid = '';
  omradevalid = '';
  bnavnvalid = '';
  passvalid = '';

  constructor(props) {
    super(props);
    this.state = {
      fnavn: '',
      enavn: '',
      tlf: '',
      epost: '',
      avdeling: 'null',
      omrade: '',
      brukernavn: '',
      passord: ''
    };
  }

  // Validerer brukernavn-input for å sjekke om brukernavn allerede eksisterer
  brukernavnTest() {
    this.state.brukernavn = event.target.value;
    brukerValid.visBruker(this.brukere, this.state.brukernavn, bruker => {
      if (bruker === 'finnes') {
        this.brukervalid = 'red';
        this.brukervalidTekst = 'visible';
      } else {
        this.brukervalid = '#ddd';
        this.brukervalidTekst = 'hidden';
      }
    });
  } // brukernavnTest()

  // Visuelt innhold
  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <div className="smallTableDiv">
            <h3>Legg til ansatt:</h3>
            <div>
              <form>
                <table>
                  <tbody>
                    <tr>
                      <th>Type</th>
                      <th>Verdi</th>
                      <th />
                    </tr>
                    <tr>
                      <td>
                        <label className="loginLabel" for="fornavn1">
                          Fornavn:
                        </label>
                      </td>
                      <td>
                        <input
                          onChange={event => this.setState({ fnavn: event.target.value })}
                          className="loginInput"
                          type="text"
                          name="fornavn1"
                        />
                      </td>
                      <td>{this.fnavnvalid}</td>
                    </tr>
                    <tr>
                      <td>
                        <label className="loginLabel" for="etternavn1">
                          Etternavn:
                        </label>
                      </td>
                      <td>
                        <input
                          onChange={event => this.setState({ enavn: event.target.value })}
                          className="loginInput"
                          type="text"
                          name="etternavn1"
                        />
                      </td>
                      <td>{this.enavnvalid}</td>
                    </tr>
                    <tr>
                      <td>
                        <label className="loginLabel" for="telefon1">
                          Telefon:
                        </label>
                      </td>
                      <td>
                        <input
                          onChange={event => this.setState({ tlf: event.target.value })}
                          className="loginInput"
                          type="number"
                          name="telefon1"
                        />
                      </td>
                      <td>{this.tlfvalid}</td>
                    </tr>
                    <tr>
                      <td>
                        <label className="loginLabel" for="epost1">
                          E-post:
                        </label>
                      </td>
                      <td>
                        <input
                          onChange={event => this.setState({ epost: event.target.value })}
                          className="loginInput"
                          type="text"
                          name="epost1"
                        />
                      </td>
                      <td>{this.epostvalid}</td>
                    </tr>
                    <tr>
                      <td>
                        <label className="loginLabel" for="avdeling1">
                          Avdeling:
                        </label>
                      </td>
                      <td>
                        <select
                          onChange={event => this.setState({ avdeling: event.target.value })}
                          className="selectClass"
                          tabIndex="0"
                          name="avdeling1"
                        >
                          <option value="null">Velg...</option>
                          <option value="salg">Salg</option>
                          <option value="lager">Lager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{this.avdelingvalid}</td>
                    </tr>
                    <tr>
                      <td>
                        <label className="loginLabel" for="omraade1">
                          Område:
                        </label>
                      </td>
                      <td>
                        <select
                          onChange={event => this.setState({ omrade: event.target.value })}
                          className="selectClass"
                          tabIndex="0"
                          name="omraade1"
                        >
                          <option value="null">Velg...</option>
                          {sykkelTjeneste.lagOmraadeVal(this.omraader, this.std)}
                        </select>
                      </td>
                      <td>{this.omradevalid}</td>
                    </tr>
                    <tr>
                      <td>
                        <label className="loginLabel" for="brukernavn1">
                          Brukernavn:
                        </label>
                      </td>
                      <td>
                        <input
                          onChange={this.brukernavnTest}
                          style={{ backgroundColor: this.brukervalid }}
                          className="loginInput"
                          type="text"
                          name="brukernavn1"
                        />
                      </td>
                      <td>
                        {this.bnavnvalid}
                        <span id="eksisterendeBrukernavn" style={{ visibility: this.brukervalidTekst }}>
                          Brukernavnet eksisterer allerede.
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="loginLabel" for="passord1">
                          Passord:
                        </label>
                      </td>
                      <td>
                        <input
                          type="password"
                          onChange={event => this.setState({ passord: event.target.value })}
                          className="loginInput"
                          name="passord1"
                        />
                      </td>
                      <td>{this.passvalid}</td>
                    </tr>
                  </tbody>
                </table>

                <button onClick={this.leggTil} className="knappLagre">
                  {' '}
                  Legg til
                </button>

                <NavLink to="/admin/ansatte" className="navLink">
                  <button className="knappAvbryt">Avbryt</button>
                </NavLink>
              </form>
              <p style={{ color: this.feedbackFarge }}>{this.feedback}</p>
            </div>
          </div>
        </div>
      </div>
    );
  } // render()

  // Henter alle brukernavn og områder
  mounted() {
    brukerValid.hentAdminBrukernavn(resultat => {
      this.brukere = resultat;
    });

    sykkelTjeneste.hentOmraader(resultat => {
      this.omraader = resultat;
    });
  } // mounted()

  // Trigges ved knappetrykk => legger til ny ansatt med følgende innhold
  leggTil() {
    if (this.state.fnavn == '') {
      this.fnavnvalid = <i className="fas fa-times" />;
    } else {
      this.fnavnvalid = '';
    }
    if (this.state.enavn == '') {
      this.enavnvalid = <i className="fas fa-times" />;
    } else {
      this.enavnvalid = '';
    }
    if (this.state.tlf == '') {
      this.tlfvalid = <i className="fas fa-times" />;
    } else {
      this.tlfvalid = '';
    }
    if (this.state.epost == '') {
      this.epostvalid = <i className="fas fa-times" />;
    } else {
      this.epostvalid = '';
    }
    if (this.state.avdeling == 'null') {
      this.avdelingvalid = <i className="fas fa-times" />;
    } else {
      this.avdelingvalid = '';
    }
    if (this.state.omrade == '') {
      this.omradevalid = <i className="fas fa-times" />;
    } else {
      this.omradevalid = '';
    }
    if (this.state.brukernavn == '') {
      this.bnavnvalid = <i className="fas fa-times" />;
    } else {
      this.bnavnvalid = '';
    }
    if (this.state.passord == '') {
      this.passvalid = <i className="fas fa-times" />;
    } else {
      this.passvalid = '';
    }
    if (
      this.state.fnavn != '' &&
      this.state.enavn != '' &&
      this.state.tlf != '' &&
      this.state.epost != '' &&
      this.state.avdeling != 'null' &&
      this.state.omrade != '' &&
      this.state.brukernavn != '' &&
      this.state.passord != ''
    ) {
      sykkelTjeneste.leggTilAnsatt(
        this.state.fnavn,
        this.state.enavn,
        this.state.tlf,
        this.state.epost,
        this.state.avdeling,
        this.state.omrade,
        this.state.brukernavn,
        this.state.passord
      );
      this.feedbackFarge = 'black';
      this.feedback = `${this.state.fnavn} ${this.state.enavn} ble lagt til som ny ansatt.`;
    } else {
      this.feedback = 'Alle felter må fylles ut';
    }
  } // leggTil()
} // NyAnsatt

/* AdminKunder
 * Prosjekterer kundetabell i admin-grensesnittet
 * Lar admin-brukere legge til nye kunder
 */
export class AdminKunder extends Component {
  // Visuelt innhold
  render() {
    return (
      <div className="mainContent">
        <div className="w3-animate-opacity">
          <h3> Kunder </h3>
          <KundeTabell />
        </div>
      </div>
    );
  }
} // AdminKunder

/* NyKunde
 * Åpnes fra AdminKunder-grensesnittet
 * Lar brukeren legge til ny(e) kunde(r)
 */
export class NyKunde extends Component {
  fnavnvalid = '';
  enavnvalid = '';
  tlfvalid = '';
  epostvalid = '';

  feedback = '';
  feedbackFarge = 'red';
  kunde = {
    fnavn: '',
    enavn: '',
    tlf: '',
    epost: '',
    date_reg: date.format(new Date(), 'YY-MM-DD')
  };

  // Visuelt innhold
  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <h2>Ny kunde</h2>
          <form>
            <table>
              <tbody>
                <tr>
                  <th>Type</th>
                  <th>Verdi</th>
                  <th />
                </tr>
                <tr>
                  <td>Fornavn</td>
                  <td>
                    <input
                      type="text"
                      onChange={event => (this.kunde.fnavn = event.target.value)}
                      value={this.kunde.fnavn}
                      className="loginInput"
                    />
                  </td>
                  <td>{this.fnavnvalid}</td>
                </tr>
                <tr>
                  <td>Etternavn</td>
                  <td>
                    <input
                      type="text"
                      onChange={event => (this.kunde.enavn = event.target.value)}
                      value={this.kunde.enavn}
                      className="loginInput"
                    />
                  </td>
                  <td>{this.enavnvalid}</td>
                </tr>
                <tr>
                  <td>Telefon</td>
                  <td>
                    <input
                      type="number"
                      onChange={event => (this.kunde.tlf = event.target.value)}
                      value={this.kunde.tlf}
                      className="loginInput"
                    />
                  </td>
                  <td>{this.tlfvalid}</td>
                </tr>
                <tr>
                  <td>Epost</td>
                  <td>
                    <input
                      type="email"
                      onChange={event => (this.kunde.epost = event.target.value)}
                      value={this.kunde.epost}
                      className="loginInput"
                    />
                  </td>
                  <td>{this.epostvalid}</td>
                </tr>
              </tbody>
            </table>

            <button type="button" onClick={this.lagre} className="knappLagre">
              Lagre
            </button>

            <NavLink to="/admin/kunder" className="navLink">
              <button className="knappAvbryt">Avbryt</button>
            </NavLink>
            <p style={{ color: this.feedbackFarge }}>{this.feedback}</p>
          </form>
        </div>
      </div>
    );
  } // render()

  // Trigges ved knappetrykk => legger til ny kunde i databasen
  lagre() {
    if (this.kunde.fnavn == '') {
      this.fnavnvalid = <i className="fas fa-times" />;
    } else {
      this.fnavnvalid = '';
    }
    if (this.kunde.enavn == '') {
      this.enavnvalid = <i className="fas fa-times" />;
    } else {
      this.enavnvalid = '';
    }
    if (this.kunde.tlf == '') {
      this.tlfvalid = <i className="fas fa-times" />;
    } else {
      this.tlfvalid = '';
    }
    if (this.kunde.epost == '') {
      this.epostvalid = <i className="fas fa-times" />;
    } else {
      this.epostvalid = '';
    }

    if (this.kunde.fnavn != '' && this.kunde.enavn != '' && this.kunde.tlf != '' && this.kunde.epost != '') {
      sykkelTjeneste.leggTilKunde(
        this.kunde.fnavn,
        this.kunde.enavn,
        this.kunde.tlf,
        this.kunde.epost,
        this.kunde.date_reg
      );
      this.feedbackFarge = 'black';
      this.feedback = 'Kunde lagret';
    } else {
      this.feedback = 'Alle felter må fylles ut';
    }
  } // lagre()
} // NyKunde

/* Provisjon
 * Lar admin-brukere se hvilken provisjonsprosent selgere ligger på
 * Samt endre provisjonssatsen
 */
export class Provisjon extends Component {
  provisjon = '';
  provisjonIProsent = this.provisjon * 100;
  feedback = '';

  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <h3>Provisjon</h3>
          <form>
            <table>
              <tbody>
                <th>Type</th>
                <th>Verdi</th>
                <tr>
                  <td>Provisjon</td>
                  <td>
                    <input
                      type="number"
                      onChange={event => (this.provisjonIProsent = event.target.value)}
                      value={this.provisjonIProsent}
                      className="loginInput"
                    />
                    %
                  </td>
                </tr>
              </tbody>
            </table>
            <button type="button" onClick={this.lagre} className="knappLagre">
              Lagre
            </button>
            <p>{this.feedback}</p>
          </form>
        </div>
      </div>
    );
  } // render()

  lagre() {
    this.provisjon = this.provisjonIProsent / 100;
    sykkelTjeneste.oppdaterProvisjon(this.provisjon);
    this.feedback = `Provisjon oppdatert. Ny provisjon: ${this.provisjonIProsent}%`;
  } // lagre()

  mounted() {
    sykkelTjeneste.hentProvisjon(provisjon => {
      this.provisjon = provisjon[0].verdi;
      this.provisjonIProsent = this.provisjon * 100;
    });
  } // mounted()
} // Provisjon

/* KundeDetaljer
 * Lar brukeren se detaljer om en gitt kunde
 * Trigges fra KundeTabell ved å trykke på ønsket kunde
 */
export class KundeDetaljer extends Component {
  suksess = '';
  kunde = {
    fnavn: '',
    enavn: '',
    tlf: '',
    epost: '',
    date_reg: ''
  };

  // Visuelt innhold
  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <h2> Ny kunde </h2>
          <form>
            <table>
              <tbody>
                <tr>
                  <th>Type</th>
                  <th>Verdi</th>
                </tr>
                <tr>
                  <td>Fornavn</td>
                  <td>
                    <input
                      type="text"
                      onChange={event => (this.kunde.fnavn = event.target.value)}
                      value={this.kunde.fnavn}
                      className="loginInput"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Etternavn</td>
                  <td>
                    <input
                      type="text"
                      onChange={event => (this.kunde.enavn = event.target.value)}
                      value={this.kunde.enavn}
                      className="loginInput"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Telefon</td>
                  <td>
                    <input
                      type="number"
                      onChange={event => (this.kunde.tlf = event.target.value)}
                      value={this.kunde.tlf}
                      className="loginInput"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Epost</td>
                  <td>
                    <input
                      type="email"
                      onChange={event => (this.kunde.epost = event.target.value)}
                      value={this.kunde.epost}
                      className="loginInput"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <NavLink to="/admin/kunder" className="navLink">
              <button type="button" onClick={this.lagre} className="knappLagre">
                Lagre
              </button>
            </NavLink>
            <NavLink to="/admin/kunder" className="navLink">
              <button type="button" className="knappAvbryt">
                Avbryt
              </button>
            </NavLink>

            <p className="suksess">{this.suksess}</p>
          </form>
        </div>
      </div>
    );
  } // render()

  // Henter detaljer om kunde x fra databasen
  mounted() {
    sykkelTjeneste.hentKunde(this.props.match.params.id, kunde => {
      this.kunde = kunde;
    });
  } // mounted()

  // Trigges ved knappetrykk => oppdaterer kunde x i databasen
  lagre() {
    sykkelTjeneste.oppdaterKunde(
      this.props.match.params.id,
      this.kunde.fnavn,
      this.kunde.enavn,
      this.kunde.tlf,
      this.kunde.epost,
      () => {
        this.suksess = 'Kunde oppdatert';
      }
    );
  } // lagre()
} // KundeDetaljer

/* AdminVelkomst
 * Hovedsiden til admin-brukere
 * Viser innlogget bruker, klokkeslett, funfact og gjøremål
 */
export class AdminVelkomst extends Component {
  // Visuelt innhold
  render() {
    return (
      <div className="hjem">
        <div className="w3-animate-opacity">
          <Velkomst />
          <h3>Sykler som må leveres</h3>
          <SyklerMaaLeveresTabell />
          <h3>Sykler som må hentes</h3>
          <SyklerMaaHentesTabell />
        </div>
      </div>
    );
  } // render()
} // AdminVelkomst

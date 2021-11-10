import * as React from 'react';
import { Component } from 'react-simplified';
import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-relative-link';
import { brukerValid } from './loginTjeneste';
import { sykkelTjeneste } from './teneste';
import date from 'date-and-time';
import { Velkomst } from './allmenn';

/*LagerMeny
Navigasjonsmenyen for lagerarbeider
*/
export class LagerMeny extends Component {
  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="sidebar">
          <NavLink to="/">
            <button className="logoutPic" title="Logg ut">
              <i className="fas fa-power-off fa-lg" />
            </button>
          </NavLink>
          <NavLink to="/lager/settings">
            <button className="settingsPic" title="Innstillinger">
              <i className="fas fa-user-cog fa-lg" />
            </button>
          </NavLink>
          <p className="innloggetBruker">{brukerValid.brukerInnlogget}</p>
          <NavLink to="/lager" className="navLink" exact activeClassName="activeRoute">
            <div className="sidebarNav" tabIndex="0">
              Hjem
            </div>
          </NavLink>
          <NavLink to="/lager/sykkel" className="navLink" exact activeClassName="activeRoute">
            <div className="sidebarNav" tabIndex="0">
              Sykler
            </div>
          </NavLink>
          <NavLink to="/lager/utstyr" className="navLink" exact activeClassName="activeRoute">
            <div className="sidebarNav" tabIndex="0">
              Utstyr
            </div>
          </NavLink>
        </div>
      </div>
    );
  }
}

/*Utstyrsdetaljer
Viser detaljer for utstyr og lar bruker andre enkelte data
*/
export class UtstyrDetaljer extends Component {
  stadar = [];
  omr = '';
  utstyr = {
    beskrivelse: 'Laster...',
    status: 'Laster...',
    tilhorende_lokasjon: 'Laster...',
    naavaerende_lokasjon: 'Laster...'
  };
  statuser = ['tilgjengelig', 'utleid'];
  suksess = '';
  render() {
    if (this.props.match.params.id == 'nyttutstyr') return null;
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
                  <td>{this.utstyr.raapris}</td>
                </tr>
              </tbody>
            </table>
            <Link to="..">
              <button type="button" className="knappLagre" onClick={this.lagre}>
                LAGRE
              </button>
            </Link>
            <Link to="..">
              <button type="button" className="knappAvbryt">
                {' '}
                AVBRYT{' '}
              </button>
            </Link>{' '}
            <div id="slettwrapper">
              <Link to="..">
                <button type="button" className="knappAvbryt" onClick={this.slett}>
                  SLETT
                </button>
              </Link>
            </div>
            <p className="suksess">{this.suksess}</p>
          </form>
        </div>
      </div>
    );
  }

  slett() {
    sykkelTjeneste.slettUtstyr(this.props.match.params.id);
  }

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
  }
  mounted() {
    if (this.props.match.params.id == 'nyttutstyr') return;
    sykkelTjeneste.hentUtstyr(this.props.match.params.id, utstyr => {
      this.utstyr = utstyr;
    });
    sykkelTjeneste.hentStadar(stadar => {
      this.stadar = stadar;
    });
    sykkelTjeneste.hentOmraadeIdFraUtstyr(this.props.match.params.id, utstyrsid => {
      this.omr = utstyrsid[0].omr_id;
    });
  }
}

/*SykkelDetaljer
Viser detaljer for en sykkel og lar bruker endre enkelte data
*/
export class SykkelDetaljer extends Component {
  bremser = ['kloss', 'skive'];
  statusar = ['tilgjengelig', 'til service', 'stjålet', 'til reparasjon'];
  stadar = [];
  suksess = '';
  gir = [0, 0];
  omr = '';
  sykkel = {
    Status: 'Laster...',
    Tilhørende: 'Laster...',
    Nåværende: 'Laster...',
    Bremser: 'Laster...',
    Girsystem: 'Laster...',
    Dekkstørrelse: 'Laster...'
  };
  render() {
    if (this.props.match.params.id == 'nysykkel') return null;

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
                  <td>{this.sykkel.Råpris}</td>
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
            <Link to=".." className="navLink">
              <button type="button" onClick={this.lagre} className="knappLagre">
                Lagre
              </button>
            </Link>
            <Link to=".." className="navLink">
              <button className="knappAvbryt">Avbryt</button>
            </Link>{' '}
            <div id="slettwrapper">
              <Link to="..">
                <button type="button" onClick={this.slett} className="knappAvbryt">
                  Slett
                </button>
              </Link>
            </div>
            <p className="suksess">{this.suksess}</p>
          </form>
        </div>
      </div>
    );
  }
  //dekk, gir, bremser, lokasjoner, status(kun fra utleid til stjålet, ellers fritt)

  slett() {
    sykkelTjeneste.slettSykkel(this.props.match.params.id);
  }

  lagre() {
    this.sykkel.Girsystem = this.gir[0] + 'x' + this.gir[1];
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
  }

  mounted() {
    if (this.props.match.params.id == 'nysykkel') return;
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
  }
}

/*NySykkel
Lar bruker legge til en ny sykkel i databasen
*/
export class NySykkel extends Component {
  statusar = ['Tilgjengelig', 'Til service', 'Stjålet', 'Til reparasjon'];
  typar = ['Terreng', 'Hybrid', 'Racer', 'By'];
  brukarar = ['Voksen', 'Barn'];
  bremser = ['Kloss', 'Skive'];
  stadar = [];
  omraader = [];
  omr = 1;

  feedback = '';
  feedbackFarge = 'red';
  rammevalid = '';
  typevalid = '';
  brukervalid = '';
  prisvalid = '';
  bremsevalid = '';
  girvalid = '';
  naavalid = '';
  tilhvalid = '';
  dekkvalid = '';

  sykkel = {
    type: '',
    rammenr: '',
    bruker: '',
    status: 'tilgjengelig',
    tilhørende: '',
    nåværende: '',
    bremser: '',
    storgir: '',
    smågir: '',
    girsystem: '',
    dekkstørrelse: '',
    pris: ''
  };

  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <h3>Ny sykkel</h3>
          <Link to="..">Tilbake</Link>
          <form>
            <table>
              <tbody>
                <tr>
                  <th>TYPE</th>
                  <th>VERDI</th>
                  <th />
                </tr>
                <tr>
                  <td>Rammenummer:</td>
                  <td>
                    <input
                      type="text"
                      value={this.sykkel.rammenr}
                      onChange={event => (this.sykkel.rammenr = event.target.value)}
                      className="loginInput"
                    />
                  </td>
                  <td>{this.rammevalid}</td>
                </tr>
                <tr>
                  <td>Status:</td>
                  <td>
                    <select
                      value={this.sykkel.status}
                      onChange={event => (this.sykkel.status = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      {sykkelTjeneste.lagValg(this.statusar, this.sykkel.status)}
                    </select>
                  </td>
                  <td />
                </tr>
                <tr>
                  <td>Type: </td>
                  <td>
                    <select
                      value={this.sykkel.type}
                      onChange={event => (this.sykkel.type = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      {sykkelTjeneste.lagValg(this.typar, this.sykkel.type)}
                    </select>
                  </td>
                  <td>{this.typevalid}</td>
                </tr>
                <tr>
                  <td>Bruker: </td>
                  <td>
                    <select
                      value={this.sykkel.bruker}
                      onChange={event => (this.sykkel.bruker = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      {sykkelTjeneste.lagValg(this.brukarar, this.sykkel.bruker)}
                    </select>
                  </td>
                  <td>{this.brukervalid}</td>
                </tr>
                <tr>
                  <td>Råpris: </td>
                  <td>
                    <input
                      type="number"
                      value={this.sykkel.pris}
                      onChange={event => (this.sykkel.pris = event.target.value)}
                      className="loginInput"
                    />
                  </td>
                  <td>{this.prisvalid}</td>
                </tr>
                <tr>
                  <td> Område </td>
                  <td>
                    <select onChange={event => (this.omr = event.target.value)} className="selectClass" tabIndex="0">
                      {sykkelTjeneste.lagOmraadeVal(this.omraader, this.omr)}
                    </select>
                  </td>
                  <td />
                </tr>
                <tr>
                  <td>Tilhørende lokasjon: </td>
                  <td>
                    <select
                      className="selectClass"
                      value={this.sykkel.tilhørende}
                      onChange={event => (this.sykkel.tilhørende = event.target.value)}
                      tabIndex="0"
                    >
                      <option value="">Velg...</option>
                      {sykkelTjeneste.lagStadsVal(this.stadar, this.omr, this.sykkel.tilhørende)}
                    </select>
                  </td>
                  <td>{this.tilhvalid}</td>
                </tr>
                <tr>
                  <td>Nåværende Lokasjon: </td>
                  <td>
                    <select
                      value={this.sykkel.nåværende}
                      onChange={event => (this.sykkel.nåværende = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      <option value="">Velg...</option>
                      {sykkelTjeneste.lagStadsVal(this.stadar, this.omr, this.sykkel.nåværende)}
                    </select>
                  </td>
                  <td>{this.naavalid}</td>
                </tr>
                <tr>
                  <td>Bremser: </td>
                  <td>
                    <select
                      value={this.sykkel.bremser}
                      onChange={event => (this.sykkel.bremser = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      {sykkelTjeneste.lagValg(this.bremser, this.sykkel.bremser)}
                    </select>
                  </td>
                  <td>{this.bremsevalid}</td>
                </tr>
                <tr>
                  <td>Gir: </td>
                  <td>
                    <input
                      type="number"
                      className="litenummerfelt"
                      value={this.sykkel.storgir}
                      onChange={event => (this.sykkel.storgir = event.target.value)}
                    />
                    x
                    <input
                      type="number"
                      className="litenummerfelt"
                      value={this.sykkel.smågir}
                      onChange={event => (this.sykkel.smågir = event.target.value)}
                    />
                  </td>
                  <td>{this.girvalid}</td>
                </tr>
                <tr>
                  <td>Dekkstørrelse: </td>
                  <td>
                    <input
                      type="number"
                      value={this.sykkel.dekkstørrelse}
                      onChange={event => (this.sykkel.dekkstørrelse = event.target.value)}
                    />
                  </td>
                  <td>{this.dekkvalid}</td>
                </tr>
              </tbody>
            </table>

            <button type="button" onClick={this.lagre} className="knappLagre">
              LAGRE
            </button>

            <Link to=".." className="navLink">
              <button className="knappAvbryt">AVBRYT</button>
            </Link>
            <p style={{ color: this.feedbackFarge }}>{this.feedback}</p>
          </form>
        </div>
      </div>
    );
  }
  mounted() {
    sykkelTjeneste.hentStadar(stadar => {
      this.stadar = stadar;
    });
    sykkelTjeneste.hentOmraader(resultat => {
      this.omraader = resultat;
    });
  }
  lagre() {
    if (this.sykkel.rammenr == '') {
      this.rammevalid = <i className="fas fa-times" />;
    } else {
      this.rammevalid = '';
    }
    if (this.sykkel.type == '') {
      this.typevalid = <i className="fas fa-times" />;
    } else {
      this.typevalid = '';
    }
    if (this.sykkel.bruker == '') {
      this.brukervalid = <i className="fas fa-times" />;
    } else {
      this.brukervalid = '';
    }
    if (this.sykkel.pris == '') {
      this.prisvalid = <i className="fas fa-times" />;
    } else {
      this.prisvalid = '';
    }
    if (this.sykkel.bremser == '' || this.sykkel.storgir == '') {
      this.bremsevalid = <i className="fas fa-times" />;
    } else {
      this.bremsevalid = '';
    }
    if (this.sykkel.smågir == '' || this.sykkel.storgir == '') {
      this.girvalid = <i className="fas fa-times" />;
    } else {
      this.girvalid = '';
    }
    if (this.sykkel.dekkstørrelse == '') {
      this.dekkvalid = <i className="fas fa-times" />;
    } else {
      this.dekkvalid = '';
    }
    if (this.sykkel.tilhørende == '') {
      this.tilhvalid = <i className="fas fa-times" />;
    } else {
      this.tilhvalid = '';
    }
    if (this.sykkel.nåværende == '') {
      this.naavalid = <i className="fas fa-times" />;
    } else {
      this.naavalid = '';
    }

    if (
      this.sykkel.type != '' &&
      this.sykkel.rammenr != '' &&
      this.sykkel.bruker != '' &&
      this.sykkel.bremser != '' &&
      this.sykkel.smågir != '' &&
      this.sykkel.storgir != '' &&
      this.sykkel.nåværende != '' &&
      this.sykkel.tilhørende != '' &&
      this.sykkel.dekkstørrelse != '' &&
      this.sykkel.pris != ''
    ) {
      this.sykkel.girsystem = this.sykkel.storgir + 'x' + this.sykkel.smågir;
      sykkelTjeneste.leggTilSykkel(
        this.sykkel.type,
        this.sykkel.rammenr,
        this.sykkel.bruker,
        this.sykkel.status,
        this.sykkel.tilhørende,
        this.sykkel.nåværende,
        this.sykkel.bremser,
        this.sykkel.girsystem,
        this.sykkel.dekkstørrelse,
        this.sykkel.pris
      );
      this.feedbackFarge = 'black';
      this.feedback = 'Ny sykkel lagt til.';
    } else {
      this.feedback = 'Alle felter må fylles ut.';
    }
  }
}

/*NyttUtstyr
Lar bruker legge til nytt tilleggsutstyr i databasen
*/
export class NyttUtstyr extends Component {
  stadar = [];
  omraader = [];
  omr = 1;

  statusar = ['Tilgjengelig', 'Stjålet', 'Til reparasjon'];
  typar = ['Sykkelveske', 'Bagasjebrett', 'Vogn', 'Barnesete', 'Hjelm'];
  utstyr = {
    type: '',
    status: 'Velg...',
    tilhorende: '',
    naavaerende: '',
    pris: '',
    beskrivelse: ''
  };

  feedback = '';
  feedbackFarge = 'red';
  typevalid = '';
  beskrivelsevalid = '';
  naavalid = '';
  tilhvalid = '';
  prisvalid = '';

  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <h3>Nytt utstyr</h3>
          <Link to="..">Tilbake</Link>
          <form>
            <table>
              <tbody>
                <tr>
                  <th>TYPE</th>
                  <th>VERDI</th>
                  <th />
                </tr>
                <tr>
                  <td>Type: </td>
                  <td>
                    <select
                      value={this.utstyr.type}
                      onChange={event => (this.utstyr.type = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      {sykkelTjeneste.lagValg(this.typar, this.utstyr.type)}
                    </select>
                  </td>
                  <td>{this.typevalid}</td>
                </tr>
                <tr>
                  <td>Status:</td>
                  <td>
                    <select
                      value={this.utstyr.status}
                      onChange={event => (this.utstyr.status = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      {sykkelTjeneste.lagValg(this.statusar, this.utstyr.status)}
                    </select>
                  </td>
                  <td />
                </tr>
                <tr>
                  <td> Område </td>
                  <td>
                    <select onChange={event => (this.omr = event.target.value)} className="selectClass">
                      {sykkelTjeneste.lagOmraadeVal(this.omraader, this.omr)}
                    </select>
                  </td>
                  <td />
                </tr>
                <tr>
                  <td>Tilhørende lokasjon: </td>
                  <td>
                    <select
                      className="selectClass"
                      value={this.utstyr.tilhorende}
                      onChange={event => (this.utstyr.tilhorende = event.target.value)}
                      tabIndex="0"
                    >
                      <option value="">Velg...</option>
                      {sykkelTjeneste.lagStadsVal(this.stadar, this.omr, this.utstyr.tilhorende)}
                    </select>
                  </td>
                  <td>{this.tilhvalid}</td>
                </tr>
                <tr>
                  <td>Nåværende Lokasjon: </td>
                  <td>
                    <select
                      value={this.utstyr.naavaerende}
                      onChange={event => (this.utstyr.naavaerende = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      <option value="">Velg...</option>
                      {sykkelTjeneste.lagStadsVal(this.stadar, this.omr, this.utstyr.naavaerende)}
                    </select>
                  </td>
                  <td>{this.naavalid}</td>
                </tr>
                <tr>
                  <td>Beskrivelse: </td>
                  <td>
                    <textarea
                      value={this.utstyr.beskrivelse}
                      onChange={event => (this.utstyr.beskrivelse = event.target.value)}
                    />
                  </td>
                  <td>{this.beskrivelsevalid}</td>
                </tr>
                <tr>
                  <td>Råpris: </td>
                  <td>
                    <input
                      type="number"
                      value={this.utstyr.pris}
                      onChange={event => (this.utstyr.pris = event.target.value)}
                    />
                  </td>
                  <td>{this.prisvalid}</td>
                </tr>
              </tbody>
            </table>

            <button type="button" className="knappLagre" onClick={this.lagre}>
              {' '}
              Legg til{' '}
            </button>

            <Link to="..">
              <button type="button" className="knappAvbryt">
                {' '}
                Avbryt{' '}
              </button>
            </Link>
            <p style={{ color: this.feedbackFarge }}>{this.feedback}</p>
          </form>
        </div>
      </div>
    );
  }
  mounted() {
    sykkelTjeneste.hentStadar(stadar => {
      this.stadar = stadar;
    });
    sykkelTjeneste.hentOmraader(resultat => {
      this.omraader = resultat;
    });
  }
  lagre() {
    if (this.utstyr.type == '') {
      this.typevalid = <i className="fas fa-times" />;
    } else {
      this.typevalid = '';
    }
    if (this.utstyr.beskrivelse == '') {
      this.beskrivelsevalid = <i className="fas fa-times" />;
    } else {
      this.beskrivelsevalid = '';
    }
    if (this.utstyr.pris == '') {
      this.prisvalid = <i className="fas fa-times" />;
    } else {
      this.prisvalid = '';
    }
    if (this.utstyr.tilhorende == '') {
      this.tilhvalid = <i className="fas fa-times" />;
    } else {
      this.tilhvalid = '';
    }
    if (this.utstyr.naavaerende == '') {
      this.naavalid = <i className="fas fa-times" />;
    } else {
      this.naavalid = '';
    }

    if (
      this.utstyr.type != '' &&
      this.utstyr.beskrivelse != '' &&
      this.utstyr.naavaerende != '' &&
      this.utstyr.tilhorende != '' &&
      this.utstyr.pris != ''
    ) {
      sykkelTjeneste.leggTilUtstyr(
        this.utstyr.type,
        this.utstyr.status,
        this.utstyr.pris,
        this.utstyr.beskrivelse,
        this.utstyr.naavaerende,
        this.utstyr.tilhorende
      );
      this.feedbackFarge = 'black';
      this.feedback = 'Nytt utstyr lagt til.';
    } else {
      this.feedback = 'Alle felter må fylles ut.';
    }
  }
}

/*LagerVelkomst
Velkomstside for lager.
Her hadde vi tenkt å ha litt ekstra informasjon til lagerarbeider,
men vi fikk ikke tid til å implementere det.
Det er derfor dette er en egen frittstående komponent.
*/
export class LagerVelkomst extends Component {
  tabell = [
    <tr id="container" key="0">
      <td key="1">
        <img src="media\sykkelhjul2.png" className="thing-to-spin" />
      </td>
    </tr>
  ];
  skjulteRader = [];
  råSQL = [];
  sorteringVal = [];
  iDag = date.format(new Date(), 'YYYY-MM-DD');

  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="hjem">
          <Velkomst />
          <h3>Sykler som må klargjøres</h3>
          <div className="sorterEtter">
            <label for="sorter4">Sorter etter:</label>
            <select
              name="sorter4"
              className="selectClass"
              onChange={event => this.sorter(event.target.value)}
              tabIndex="0"
            >
              {this.sorteringVal}
            </select>
          </div>
          <div className="tabellDiv" tabIndex="0">
            <table>
              <tbody>{this.tabell}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  sorter(attributt) {
    this.tabell = sykkelTjeneste.sorter(attributt, this.tabell);
  }

  mounted() {
    sykkelTjeneste.hentBestillingsTabellLager(this.iDag, resultat => {
      this.råSQL = resultat;

      sykkelTjeneste.lagBestillingSalgTabell(resultat, this.skjulteRader, bestillingstabell => {
        this.tabell = bestillingstabell;
        this.sorteringVal = sykkelTjeneste.lagsorteringsVal(this.tabell, 1);
        this.sorter(0);
      });
    });
  }
}

import * as React from 'react';
import { Component } from 'react-simplified';
import { Link } from 'react-router-relative-link';
import date from 'date-and-time';
import fact from 'random-facts';

import { brukerValid } from './loginTjeneste';
import { sykkelTjeneste } from './teneste';
import { SykkelTabell, UtstyrsTabell } from './tabeller';
import { SykkelKart } from './kart';

/*Sti
Viser den nåværende stien.
Man kan trykke på deler av stien for å navigere tilbake.
Det er også en pil for å gå opp ett nivå
*/
export class Sti extends Component {
  sti = [];

  render() {
    return <div className="sti">{this.sti}</div>;
  }
  componentWillReceiveProps() {
    this.sti = [];

    let nivåOpp = '';

    for (let i = 1; i < window.location.hash.split('').length; i++) {
      nivåOpp += window.location.hash.split('')[i];
    }
    nivåOpp += '/..';
    this.sti.push(
      <Link id="pilopp" key={nivåOpp} to={nivåOpp}>
        <i class="fas fa-arrow-left fa-lg" />
      </Link>
    );

    for (let i = 1; i < window.location.hash.split('/').length; i++) {
      let link = '';
      for (let j = 1; j <= i; j++) {
        link += `/${window.location.hash.split('/')[j]}`;
      }
      this.sti.push(
        <Link key={link} to={link}>
          {`${window.location.hash.split('/')[i]}/`}
        </Link>
      );
    }
  }
  mounted() {
    this.componentWillReceiveProps();
  }
}

/* NyLokasjon
 * Lar brukeren til nye lokasjoner innad eksisterende områder
 * Eventuelt kan brukeren legge til nytt område hvis det ikke eksisterer fra før
 */
export class NyLokasjon extends Component {
  // leggTil inneholder forskjellig html-kode etter benyttelse
  leggTil = (
    <button type="button" onClick={this.nyttOmraade} className="knappLagre" id="leggTilKnapp">
      {' '}
      Nytt område{' '}
    </button>
  );

  // omraader[] hentes i mounted() for å lage <option>'s basert på eksisterende områder
  omraader = [];
  std = '1';

  // Mellomlagring for å skrive til databasen
  lokasjon = {
    omraade: '',
    stedsnavn: '',
    adresse: '',
    postnummer: '',
    hentelevere: '1',
    lager: '1'
  };

  feedback = '';
  feedbackFarge = 'red';
  lokomraadevalid = '';
  stedsvalid = '';
  adrvalid = '';
  postnrvalid = '';

  // Mellomlagring for å skrive til databasen
  omraade = {
    navn: '',
    fylke: ''
  };

  // Visuelt innhold
  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <h3>Legg til lokasjon</h3>
          <form>
            <table id="lokasjonTable">
              <tbody>
                <tr>
                  <th> Type </th>
                  <th> Verdi </th>
                  <th />
                  <th />
                </tr>
                <tr>
                  <td> Område </td>
                  <td>
                    <select
                      onChange={event => (this.lokasjon.omraade = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      <option value="null">Velg...</option>
                      {sykkelTjeneste.lagOmraadeVal(this.omraader, this.std)}
                    </select>
                  </td>
                  <td>{this.lokomraadevalid}</td>
                  <td>{this.leggTil}</td>
                </tr>
                <tr>
                  <td> Stedsnavn </td>
                  <td>
                    <input
                      onChange={event => (this.lokasjon.stedsnavn = event.target.value)}
                      type="text"
                      className="loginInput"
                    />
                  </td>
                  <td>{this.stedsvalid}</td>
                </tr>
                <tr>
                  <td> Adresse </td>
                  <td>
                    <input
                      onChange={event => (this.lokasjon.adresse = event.target.value)}
                      type="text"
                      className="loginInput"
                    />
                  </td>
                  <td>{this.adrvalid}</td>
                </tr>
                <tr>
                  <td> Postnummer </td>
                  <td>
                    <input
                      onChange={event => (this.lokasjon.postnummer = event.target.value)}
                      type="number"
                      className="loginInput"
                    />
                  </td>
                  <td>{this.postnrvalid}</td>
                </tr>
                <tr>
                  <td> Hente/Levere? </td>
                  <td>
                    <select
                      onChange={event => (this.lokasjon.hentelevere = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      <option value="1"> Ja </option>
                      <option value="0"> Nei </option>
                    </select>
                  </td>
                  <td />
                </tr>
                <tr>
                  <td> Lager? </td>
                  <td>
                    <select
                      onChange={event => (this.lokasjon.lager = event.target.value)}
                      className="selectClass"
                      tabIndex="0"
                    >
                      <option value="1"> Ja </option>
                      <option value="0"> Nei </option>
                    </select>
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
            <button type="button" onClick={this.lagreLokasjon} className="knappLagre" id="lokasjonKnapp">
              {' '}
              Lagre{' '}
            </button>
          </form>
          <p style={{ color: this.feedbackFarge }}>{this.feedback}</p>
        </div>
      </div>
    );
  } // render()

  // Dersom brukeren ønsker å legge til nytt område dukker dette opp
  nyttOmraade() {
    this.leggTil = (
      <div className="w3-animate-opacity">
        <tr>
          <td> Områdenavn </td>

          <td>
            <input onChange={event => (this.omraade.navn = event.target.value)} type="text" className="loginInput" />
          </td>
        </tr>
        <tr>
          <td> Fylke(r) </td>
          <td>
            <input onChange={event => (this.omraade.fylke = event.target.value)} type="text" className="loginInput" />{' '}
          </td>
        </tr>
        <button onClick={this.refresh} type="button" className="knappLagre">
          {' '}
          Legg til
        </button>
      </div>
    );
  } // nyttOmraade()

  // Kjøres ved knappetrykk. Legger til nytt område i databasen og oppdaterer siden
  refresh() {
    if (this.omraade.navn != '' && this.omraade.fylke != '') {
      sykkelTjeneste.leggTilOmraade(this.omraade.navn, this.omraade.fylke);
      this.leggTil = (
        <button type="button" onClick={this.nyttOmraade} className="knappLagre">
          {' '}
          Legg til{' '}
        </button>
      );
      this.mounted();
    } else {
      this.feedback = 'Både områdenavn og fylke(r) må fylles ut.';
    }
  } // refresh()

  // Kjøres ved knappetrykk. Legger til ny lokasjon i databasen
  lagreLokasjon() {
    if (this.lokasjon.omraade == '') {
      this.lokomraadevalid = <i className="fas fa-times" />;
    } else {
      this.lokomraadevalid = '';
    }
    if (this.lokasjon.stedsnavn == '') {
      this.stedsvalid = <i className="fas fa-times" />;
    } else {
      this.stedsvalid = '';
    }
    if (this.lokasjon.adresse == '') {
      this.adrvalid = <i className="fas fa-times" />;
    } else {
      this.adrvalid = '';
    }
    if (this.lokasjon.postnummer == '') {
      this.postnrvalid = <i className="fas fa-times" />;
    } else {
      this.postnrvalid = '';
    }

    if (
      this.lokasjon.omraade != '' &&
      this.lokasjon.stedsnavn != '' &&
      this.lokasjon.adresse != '' &&
      this.lokasjon.postnummer != ''
    ) {
      sykkelTjeneste.lagreLokasjon(
        this.lokasjon.omraade,
        this.lokasjon.stedsnavn,
        this.lokasjon.adresse,
        this.lokasjon.postnummer,
        this.lokasjon.hentelevere,
        this.lokasjon.lager
      );
      this.feedbackFarge = 'black';
      this.feedback = `Ny lokasjon, ${this.lokasjon.stedsnavn} lagt til.`;
    } else {
      this.feedback = 'Alle felter må fylles ut';
    }
  } // lagreLokasjon()

  // Henter områder for å lage <option>'s basert på eksisterende områder
  mounted() {
    sykkelTjeneste.hentOmraader(resultat => {
      this.omraader = resultat;
    });
  } // mounted()
} // AdminDiverse

/*Sykler
Viser alle syklene og et kart over dem
*/
export class Sykler extends Component {
  render() {
    return (
      <div className="mainContent">
        <div className="w3-animate-opacity">
          <h3>Sykler</h3>
          <SykkelTabell />
          <SykkelKart />
        </div>
      </div>
    );
  }
}

/*Utstyr
Viser alt utstyret
*/
export class Utstyr extends Component {
  render() {
    return (
      <div className="mainContent">
        <div className="w3-animate-opacity">
          <h3>Utstyr</h3>
          <UtstyrsTabell />
        </div>
      </div>
    );
  }
}

/*Velkomst
Viser en liten velkomstmelding med klokke og et artig faktum
*/
export class Velkomst extends Component {
  tid = null;
  fakta = '';
  render() {
    return (
      <div className="w3-animate-opacity">
        <h1>Hei, {brukerValid.brukerInnlogget}</h1>
        <h2>Klokken er {this.tid}</h2>
        <p>{this.fakta}</p>
      </div>
    );
  }
  mounted() {
    this.fakta = fact.randomFact();
    //oppdaterer klokke hvert sekund
    setInterval(() => {
      this.tid = date.format(new Date(), 'HH:mm:ss');
    });
  }
}

/*Settings
Viser instillinger for den innloggede brukeren.
Brukeren kan endre passord og personalia og velge mellom mørkt og lyst tema
*/
export class Settings extends Component {
  brukerInnlogget = brukerValid.brukerInnlogget;
  ansattID = brukerValid.ansattID;

  ansatte = [];
  ansattTlf = brukerValid.telefon;
  ansattEpost = brukerValid.epost;

  gammeltPass = '';
  nyttPass1 = '';
  nyttPass2 = '';

  feedbackGammelt = <i className="fas fa-times" />;
  feedbackSammenlikning = <i className="fas fa-times" />;
  feedbackNytt = <i className="fas fa-unlock" />;

  sluttmelding = '';
  feedbackPersonalia = '';

  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <h3>Innstillinger for {this.brukerInnlogget}</h3>
          <h5>Endre passord</h5>
          <form>
            <table>
              <tbody>
                <tr>
                  <th>Type</th>
                  <th>Verdi</th>
                  <th />
                </tr>
                <tr>
                  <td>Nåværende passord:</td>
                  <td>
                    <input type="password" className="loginInput" placeholder=" ... " onChange={this.sjekkPassord} />
                  </td>
                  <td>{this.feedbackGammelt}</td>
                </tr>
                <tr>
                  <td>Nytt passord:</td>
                  <td>
                    <input type="password" className="loginInput" placeholder=" ... " onChange={this.sjekkNyttPass1} />
                  </td>
                  <td>{this.feedbackNytt}</td>
                </tr>
                <tr>
                  <td>Gjenta nytt passord: </td>
                  <td>
                    <input type="password" onChange={this.sjekkNyttPass2} className="loginInput" placeholder=" ... " />
                  </td>
                  <td>{this.feedbackSammenlikning}</td>
                </tr>
              </tbody>
            </table>
            <button className="knappLagre" onClick={this.oppdaterPassord}>
              {' '}
              Lagre{' '}
            </button>
          </form>
          <br /> <br />
          {this.sluttmelding}
          <h5>Endre personalia</h5>
          <form>
            <table>
              <tbody>
                <tr>
                  <th>Type</th>
                  <th>Verdi</th>
                </tr>
                <tr>
                  <td>E-post:</td>
                  <td>
                    <input
                      type="text"
                      className="loginInput"
                      value={this.ansattEpost}
                      onChange={event => (this.ansattEpost = event.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Telefon:</td>
                  <td>
                    <input
                      type="text"
                      className="loginInput"
                      value={this.ansattTlf}
                      onChange={event => (this.ansattTlf = event.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <button className="knappLagre" onClick={this.oppdaterPersonalia}>
              {' '}
              Lagre{' '}
            </button>
          </form>
          {this.feedbackPersonalia}
          <br />
          <div>
            <h3> Mørkt tema </h3>
            <h5> Ønsker du et mørkere tema som kan være mer behagelig for øynene?</h5>
            <h5> Trykk på knappen under! </h5>
            <label className="switch">
              <input onChange={this.cssbytt} id="sjekk" type="checkbox" tabIndex="0" />
              <span className="slider round" tabIndex="0" />
            </label>
          </div>
        </div>
      </div>
    );
  }

  cssbytt() {
    if (sjekk.checked == true) {
      let currentCss = document.getElementById('currentCss');
      currentCss.href = './css/master-mork.css';
    } else {
      let currentCss1 = document.getElementById('currentCss');
      currentCss1.href = './css/master.css';
    }
  }

  mounted() {
    brukerValid.hentAdminBrukernavn(resultat => {
      this.ansatte = resultat;
    });
  }

  sjekkPassord(event) {
    this.gammeltPass = event.target.value;

    sykkelTjeneste.hentAnsattPassord(this.ansattID, this.gammeltPass, resultat => {
      if (resultat === 'riktig') {
        this.feedbackGammelt = <i className="fas fa-check" />;
      } else {
        this.feedbackGammelt = <i className="fas fa-times" />;
      }
    });
    this.sluttmelding = '';
  }

  sjekkNyttPass1() {
    this.nyttPass1 = event.target.value;

    if (this.nyttPass1.length >= 6) {
      this.feedbackNytt = <i className="fas fa-lock" />;
    } else {
      this.feedbackNytt = <i className="fas fa-unlock" />;
    }

    if (this.nyttPass1 == this.nyttPass2) {
      this.feedbackSammenlikning = <i className="fas fa-check" />;
    } else {
      this.feedbackSammenlikning = <i className="fas fa-times" />;
    }
    this.sluttmelding = '';
  }

  sjekkNyttPass2() {
    this.nyttPass2 = event.target.value;

    if (this.nyttPass1 == this.nyttPass2) {
      this.feedbackSammenlikning = <i className="fas fa-check" />;
    } else {
      this.feedbackSammenlikning = <i className="fas fa-times" />;
    }
    this.sluttmelding = '';
  }

  oppdaterPassord() {
    sykkelTjeneste.hentAnsattPassord(this.ansattID, this.gammeltPass, resultat => {
      if (resultat === 'riktig') {
        if (this.nyttPass1.length >= 6) {
          if (this.nyttPass1 == this.nyttPass2) {
            if (this.nyttPass1 == '') {
              this.sluttmelding = 'Ditt nye passord må være minst seks tegn.';
            } else {
              sykkelTjeneste.endreAnsattPassord(this.nyttPass2, this.ansattID, resultat2 => {
                if (resultat2 === 'oppdatert') {
                  this.sluttmelding = 'Passordet ble oppdatert.';
                } else {
                  this.sluttmelding = 'Noe gikk galt. Prøv igjen.';
                }
              });
            }
          } else {
            this.sluttmelding = 'Passordene er ikke like.';
          }
        } else {
          this.sluttmelding = 'Ditt nye passord må være minst seks tegn.';
        }
      } else if (resultat === 'Feil') {
        this.sluttmelding = 'Passordet ditt stemmer ikke.';
      }
    });
  }

  oppdaterPersonalia() {
    sykkelTjeneste.endreAnsattPersonalia(this.ansattEpost, this.ansattTlf, this.ansattID, resultat => {
      if (resultat === 'oppdatert') {
        this.feedbackPersonalia = 'Du oppdaterte din personalia.';
      } else {
        this.feedbackPersonalia = 'Noe gikk galt. Prøv igjen.';
      }
    });
  }
}

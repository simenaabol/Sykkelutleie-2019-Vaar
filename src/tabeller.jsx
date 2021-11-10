import * as React from 'react';
import { Component } from 'react-simplified';
import { Link } from 'react-router-relative-link';
import date from 'date-and-time';
import { sykkelTjeneste } from './teneste';
import { bestillingTeneste } from './bestillingteneste';

/*BestillingsInnhold:
Lager en tabell som viser alt innholdet i en gitt bestilling
*/
export class BestillingsInnhold extends Component {
  sykler = [];
  utstyr = [];
  spesifikasjoner = [];

  render() {
    return <div>{this.spesifikasjoner}</div>;
  }

  mounted() {
    sykkelTjeneste.hentBestillingSykler(this.props.ordrenr, sykler => {
      this.sykler = sykler;
    });

    sykkelTjeneste.hentBestillingUtstyr(this.props.ordrenr, utstyr => {
      this.utstyr = utstyr;
    });
    sykkelTjeneste.antallBS(this.props.ordrenr, antall => {
      let nøkkel = 1000;
      for (let i = 0; i < antall; i++) {
        //vis bare sykkelen hvis det er en sykkel
        if (this.sykler[i] != undefined) {
          sykkelTjeneste.lagTabell([this.sykler[i]], [], sykkel => {
            this.spesifikasjoner.push(
              <div className="tabellDiv" tabIndex="0">
                <table key={nøkkel}>
                  <tbody>{sykkel}</tbody>
                </table>
              </div>
            );
            nøkkel++;
          });
        }
        nøkkel++;

        //vis bare utstyret hvis det er et utstyr
        if (this.utstyr[i] != undefined) {
          sykkelTjeneste.lagTabell([this.utstyr[i]], [], utstyr => {
            this.spesifikasjoner.push(
              <div className="tabellDiv" tabIndex="0">
                <table key={nøkkel}>
                  <tbody>{utstyr}</tbody>
                </table>
              </div>
            );
            nøkkel++;
          });
        }
        nøkkel++;
        this.spesifikasjoner.push(<br key={nøkkel} />);
        nøkkel++;
      }
    });
  }
}

/*BestillingsTabell:
Lager en tabell med generell info om bestillingen.
Inneholder ikke innholdet i bestillingen
*/
export class BestillingsTabell extends Component {
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

  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="mainContent">
          <input
            onChange={event => this.søk(event.target.value)}
            type="text"
            placeholder="Søk..."
            className="searchInput"
          />{' '}
          <div className="sorterEtter">
            Sorter etter:{' '}
            <select className="selectClass" onChange={event => this.sorter(event.target.value)} tabIndex="0">
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
    sykkelTjeneste.hentBestillingsTabell(resultat => {
      this.råSQL = resultat;
      sykkelTjeneste.lagBestillingSalgTabell(resultat, this.skjulteRader, bestillingstabell => {
        this.tabell = bestillingstabell;
        this.sorteringVal = sykkelTjeneste.lagsorteringsVal(this.tabell, 1);
        this.sorter(0);
      });
    });
  }
  søk(søkeord) {
    // lag tabell på nytt med alle rader
    sykkelTjeneste.lagBestillingSalgTabell(this.råSQL, [], bestillingstabell => {
      this.tabell = bestillingstabell;
    });
    // finn rader som skal skjules
    this.skjulteRader = sykkelTjeneste.søkITabell(søkeord, this.tabell, 1);

    // lag tabell uten rader som skal skjules
    sykkelTjeneste.lagBestillingSalgTabell(this.råSQL, this.skjulteRader, bestillingstabell => {
      this.tabell = bestillingstabell;
    });
  }
}

/*Sykkeltabell:
Lager en tabell med alle sykler.
Lite detaljert, men man kan trykke seg inn på syklene
*/
export class SykkelTabell extends Component {
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

  render() {
    return (
      <div className="w3-animate-opacity">
        <input
          onChange={event => this.søk(event.target.value)}
          type="text"
          placeholder="Søk..."
          className="searchInput"
        />{' '}
        <div className="sorterEtter">
          Sorter etter:{' '}
          <select className="selectClass" onChange={event => this.sorter(event.target.value)} tabIndex="0">
            {this.sorteringVal}
          </select>
        </div>
        <div className="tabellDiv" tabIndex="0">
          <table>
            <tbody>{this.tabell}</tbody>
          </table>
        </div>
        <Link to="nysykkel">
          <button type="button" className="knappLayout" title="Legg til">
            <i className="fas fa-plus fa-lg" />
          </button>
        </Link>
      </div>
    );
  }
  sorter(attributt) {
    this.tabell = sykkelTjeneste.sorter(attributt, this.tabell);
  }

  mounted() {
    sykkelTjeneste.hentSykkelTabell(resultat => {
      this.råSQL = resultat;
      sykkelTjeneste.lagSykkelTabell(resultat, this.skjulteRader, sykkelTabell => {
        this.tabell = sykkelTabell;
        this.sorteringVal = sykkelTjeneste.lagsorteringsVal(this.tabell, 1);
        this.sorter(0);
      });
    });
  }
  søk(søkeord) {
    // lag tabell på nytt med alle rader
    sykkelTjeneste.lagSykkelTabell(this.råSQL, [], sykkeltabell => {
      this.tabell = sykkeltabell;
    });
    // finn rader som skal skjules
    this.skjulteRader = sykkelTjeneste.søkITabell(søkeord, this.tabell, 1);

    // lag tabell uten rader som skal skjules
    sykkelTjeneste.lagSykkelTabell(this.råSQL, this.skjulteRader, sykkeltabell => {
      this.tabell = sykkeltabell;
    });
  }
}

/*SyklerMaaLeveresTabell
Tabell som viser sykler som skal fraktes til en bestemt lokasjon
der de skal leies fra.
*/
export class SyklerMaaLeveresTabell extends Component {
  tabell = [
    <tr id="container" key="0">
      <td key="1">Finner ingen sykler</td>
    </tr>
  ];
  skjulteRader = [];
  råSQL = [];
  sorteringVal = [];
  iDag = date.format(new Date(), 'YYYY-MM-DD');

  render() {
    return (
      <div>
        <div className="w3-animate-opacity">
          <div id="inputSorterWrapper">
            <select onChange={event => this.sorter(event.target.value)} id="hjemSortering">
              {this.sorteringVal}
            </select>
            <label id="hjemLabel" for="sorter1">
              Sorter etter:
            </label>
            <div className="tabellDiv" tabIndex="0" name="sorter1">
              <table>
                <tbody>{this.tabell}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
  sorter(attributt) {
    this.tabell = sykkelTjeneste.sorter(attributt, this.tabell);
  }

  mounted() {
    sykkelTjeneste.hentSyklerMaaLeveres(this.iDag, resultat => {
      this.råSQL = resultat;
      sykkelTjeneste.lagSykkelTabellAdmin(resultat, this.skjulteRader, sykkelTabell => {
        this.tabell = sykkelTabell;
        this.sorteringVal = sykkelTjeneste.lagsorteringsVal(this.tabell, 1);
        this.sorter(0);
      });
    });
  }
}

/*SyklerMaaHentesTabell
Tabell som viser sykler som må hentes
fra en bestemt lokasjon kunden skal levere de på.
*/
export class SyklerMaaHentesTabell extends Component {
  tabell = [
    <tr id="container" key="0">
      <td key="1">Finner ingen sykler</td>
    </tr>
  ];
  skjulteRader = [];
  råSQL = [];
  sorteringVal = [];

  render() {
    return (
      <div>
        <div className="w3-animate-opacity">
          <div id="inputSorterWrapper">
            <select onChange={event => this.sorter(event.target.value)} id="hjemSortering">
              {this.sorteringVal}
            </select>
            <label id="hjemLabel" for="sorter2">
              Sorter etter:
            </label>
            <div className="tabellDiv" tabIndex="0" name="sorter2">
              <table>
                <tbody>{this.tabell}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
  sorter(attributt) {
    this.tabell = sykkelTjeneste.sorter(attributt, this.tabell);
  }

  mounted() {
    sykkelTjeneste.hentSyklerMaaHentes(resultat => {
      this.råSQL = resultat;
      sykkelTjeneste.lagSykkelTabellAdmin(resultat, this.skjulteRader, sykkelTabell => {
        this.tabell = sykkelTabell;
        this.sorteringVal = sykkelTjeneste.lagsorteringsVal(this.tabell, 1);
        this.sorter(0);
      });
    });
  }
}

/*UtstyrsTabell
Tabell som viser alt tillegsutstyr.
Lite detaljert men man kan trykke seg inn på utstyret og se mer
*/

export class UtstyrsTabell extends Component {
  tabell = [
    <tr id="container" key="0">
      <td key="1">
        <img src="media\sykkelhjul2.png" className="thing-to-spin" />
      </td>
    </tr>
  ];
  råSQL = [];
  skjulteRader = [];
  sorteringVal = [];

  render() {
    return (
      <div className="w3-animate-opacity">
        <input
          onChange={event => this.søk(event.target.value)}
          type="text"
          placeholder="Søk..."
          className="searchInput"
        />{' '}
        <div className="sorterEtter">
          Sorter etter:{' '}
          <select className="selectClass" onChange={event => this.sorter(event.target.value)} tabIndex="0">
            {this.sorteringVal}
          </select>
        </div>
        <div className="tabellDiv" tabIndex="0">
          <table>
            <tbody>{this.tabell}</tbody>
          </table>
        </div>
        <Link to="nyttutstyr">
          <button type="button" className="knappLayout" title="Legg til">
            <i className="fas fa-plus fa-lg" />
          </button>
        </Link>
      </div>
    );
  }
  sorter(attributt) {
    this.tabell = sykkelTjeneste.sorter(attributt, this.tabell);
  }

  mounted() {
    sykkelTjeneste.hentUtstyrsTabell(resultat => {
      this.råSQL = resultat;
      sykkelTjeneste.lagUtstyrTabell(resultat, this.skjulteRader, utstyrstabell => {
        this.tabell = utstyrstabell;
        this.sorteringVal = sykkelTjeneste.lagsorteringsVal(this.tabell, 1);
        this.sorter(0);
      });
    });
  }
  søk(søkeord) {
    // lag tabell på nytt med alle rader
    sykkelTjeneste.lagUtstyrTabell(this.råSQL, [], utstyrtabell => {
      this.tabell = utstyrtabell;
    });
    // finn rader som skal skjules
    this.skjulteRader = sykkelTjeneste.søkITabell(søkeord, this.tabell, 1);

    // lag tabell uten rader som skal skjules
    sykkelTjeneste.lagUtstyrTabell(this.råSQL, this.skjulteRader, utstyrtabell => {
      this.tabell = utstyrtabell;
    });
  }
}

/*KundeTabell
Tabell som viser alle kundene til bedriften.
Man kan trykke seg inn og endre detaljer
*/
export class KundeTabell extends Component {
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
  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="tabellLayout">
          <input
            onChange={event => this.søk(event.target.value)}
            type="text"
            placeholder="Søk..."
            className="searchInput"
          />{' '}
          <div className="sorterEtter">
            Sorter etter:{' '}
            <select className="selectClass" onChange={event => this.sorter(event.target.value)} tabIndex="0">
              {this.sorteringVal}
            </select>
          </div>
          <div className="tabellDiv" tabIndex="0">
            <table>
              <tbody>{this.tabell}</tbody>
            </table>
          </div>
          <Link to="../nykunde" className="navLink">
            <button className="knappLayout">
              <i className="fas fa-plus fa-lg" />
            </button>
          </Link>
        </div>
      </div>
    );
  }
  sorter(attributt) {
    this.tabell = sykkelTjeneste.sorter(attributt, this.tabell);
  }

  mounted() {
    sykkelTjeneste.hentKundeTabell(resultat => {
      this.råSQL = resultat;
      sykkelTjeneste.lagKundeTabell(resultat, this.skjulteRader, kundetabell => {
        this.tabell = kundetabell;
        this.sorteringVal = sykkelTjeneste.lagsorteringsVal(this.tabell, 1);
        this.sorter(0);
      });
    });
  }
  søk(søkeord) {
    // lag tabell på nytt med alle rader
    sykkelTjeneste.lagKundeTabell(this.råSQL, [], kundetabell => {
      this.tabell = kundetabell;
    });
    // finn rader som skal skjules
    this.skjulteRader = sykkelTjeneste.søkITabell(søkeord, this.tabell, 1);

    // lag tabell uten rader som skal skjules
    sykkelTjeneste.lagKundeTabell(this.råSQL, this.skjulteRader, kundetabell => {
      this.tabell = kundetabell;
    });
  }
}

/*AnsatteTabell
Tabell som viser alle ansatte  ved bedriften.
*/

export class AnsatteTabell extends Component {
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
  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="tabellLayout">
          <input
            onChange={event => this.søk(event.target.value)}
            type="text"
            placeholder="Søk..."
            className="searchInput"
          />{' '}
          <div className="sorterEtter">
            Sorter etter:{' '}
            <select className="selectClass" onChange={event => this.sorter(event.target.value)} tabIndex="0">
              {this.sorteringVal}
            </select>
          </div>
          <div className="tabellDiv" tabIndex="0">
            <table>
              <tbody>{this.tabell}</tbody>
            </table>
          </div>
          <Link to="nyansatt" className="navLink">
            <button className="knappLayout">
              <i className="fas fa-plus fa-lg" />
            </button>
          </Link>
        </div>
      </div>
    );
  }
  sorter(attributt) {
    this.tabell = sykkelTjeneste.sorter(attributt, this.tabell);
  }
  mounted() {
    sykkelTjeneste.hentAnsatTabell(resultat => {
      this.råSQL = resultat;
      sykkelTjeneste.lagTabell(resultat, this.skjulteRader, ansattabell => {
        this.tabell = ansattabell;
        this.sorteringVal = sykkelTjeneste.lagsorteringsVal(this.tabell, 0);
        this.sorter(0);
      });
    });
  }
  søk(søkeord) {
    // lag tabell på nytt med alle rader
    sykkelTjeneste.lagTabell(this.råSQL, [], ansattabell => {
      this.tabell = ansattabell;
    });
    // finn rader som skal skjules
    this.skjulteRader = sykkelTjeneste.søkITabell(søkeord, this.tabell, 0);

    // lag tabell uten rader som skal skjules
    sykkelTjeneste.lagTabell(this.råSQL, this.skjulteRader, ansattabell => {
      this.tabell = ansattabell;
    });
  }
}

/*SykkelBestillingTabell
Tabell som viser tilgjengelige sykler når man skal registrere en ny bestilling
*/
export class SykkelBestillingTabell extends Component {
  tabell = [
    <tr id="container" key="0">
      <td key="1">
        <img src="media\sykkelhjul2.png" className="thing-to-spin" />
      </td>
    </tr>
  ];
  tilDato = '';
  fraDato = '';
  skjulteRader = [];
  råSQL = [];
  sorteringVal = [];

  render() {
    return (
      <div className="w3-animate-opacity">
        <input
          onChange={event => this.søk(event.target.value)}
          type="text"
          placeholder="Søk..."
          className="searchInput"
        />{' '}
        <div className="sorterEtter" id="sorterBestiling">
          Sorter etter:{' '}
          <select className="selectClass" onChange={event => this.sorter(event.target.value)} tabIndex="0">
            {this.sorteringVal}
          </select>
        </div>
        <table>
          <tbody>{this.tabell}</tbody>
        </table>
        <Link to="0">
          <button type="button" className="litenløsknapp" title="Ingen sykkel">
            Fortsett uten sykkel
          </button>
        </Link>
      </div>
    );
  }
  sorter(attributt) {
    this.tabell = sykkelTjeneste.sorter(attributt, this.tabell);
  }

  mounted() {
    let bestilling = bestillingTeneste.hentBestilling();
    this.tilDato = bestilling.tilDato.split('T')[0] + ' ' + bestilling.tilDato.split('T')[1];
    this.fraDato = bestilling.fraDato.split('T')[0] + ' ' + bestilling.fraDato.split('T')[1];

    sykkelTjeneste.hentSykkelBestillingTabell(this.fraDato, this.tilDato, resultat => {
      this.råSQL = resultat;
      sykkelTjeneste.lagSykkelBestillingTabell(
        resultat,
        this.skjulteRader,
        this.props.spesifikasjoner,
        sykkelTabell => {
          this.tabell = sykkelTabell;
          this.sorteringVal = sykkelTjeneste.lagsorteringsVal(this.tabell, 1);
          this.sorter(0);
        }
      );
    });
  }
  søk(søkeord) {
    // lag tabell på nytt med alle rader
    sykkelTjeneste.lagSykkelBestillingTabell(this.råSQL, [], this.props.spesifikasjoner, sykkeltabell => {
      this.tabell = sykkeltabell;
    });
    // finn rader som skal skjules
    this.skjulteRader = sykkelTjeneste.søkITabell(søkeord, this.tabell, 1);

    // lag tabell uten rader som skal skjules
    sykkelTjeneste.lagSykkelBestillingTabell(
      this.råSQL,
      this.skjulteRader,
      this.props.spesifikasjoner,
      sykkeltabell => {
        this.tabell = sykkeltabell;
      }
    );
  }
}

/*UtstyrBestillingTabell
Tabell som viser tilgjengelig utstyr når man skal registrere en ny bestilling
*/
export class UtstyrBestillingTabell extends Component {
  tabell = [
    <tr id="container" key="0">
      <td key="1">
        <img src="media\sykkelhjul2.png" className="thing-to-spin" />
      </td>
    </tr>
  ];
  tilDato = '';
  fraDato = '';
  skjulteRader = [];
  råSQL = [];
  sorteringVal = [];
  spesifikasjoner = bestillingTeneste.hentSpesifikasjoner();

  render() {
    return (
      <div className="w3-animate-opacity">
        <input
          onChange={event => this.søk(event.target.value)}
          type="text"
          placeholder="Søk..."
          className="searchInput"
        />{' '}
        <div className="sorterEtter">
          Sorter etter:{' '}
          <select className="selectClass" onChange={event => this.sorter(event.target.value)} tabIndex="0">
            {this.sorteringVal}
          </select>
        </div>
        <table>
          <tbody>{this.tabell}</tbody>
        </table>
        <Link to="..">
          <button type="button" className="litenknapp" onClick={this.leggTilSpes} title="Fortsett">
            Neste
          </button>
        </Link>
      </div>
    );
  }

  leggTilSpes() {
    //legg inn ny spesifikasjon i bestillingen. Legger inn valgt sykkel med valgt utstyr
    let funnet = false;
    for (let i = 0; i < this.props.spesifikasjoner.length; i++) {
      if (this.props.spesifikasjoner[i].sykkel == this.props.sykkel) funnet = true;
    }
    if (!funnet) bestillingTeneste.leggTilSpesifikasjon(0, this.props.sykkel);
  }

  sorter(attributt) {
    this.tabell = sykkelTjeneste.sorter(attributt, this.tabell);
  }

  mounted() {
    //henter midlertidig bestilling fra bestillingtjenesten
    let bestilling = bestillingTeneste.hentBestilling();
    this.tilDato = bestilling.tilDato.split('T')[0] + ' ' + bestilling.tilDato.split('T')[1];
    this.fraDato = bestilling.fraDato.split('T')[0] + ' ' + bestilling.fraDato.split('T')[1];

    sykkelTjeneste.hentUtstyrBestillingTabell(this.fraDato, this.tilDato, this.props.sykkel, resultat => {
      this.råSQL = resultat;
      sykkelTjeneste.lagUtstyrBestillingTabell(
        resultat,
        this.skjulteRader,
        this.props.sykkel,
        this.spesifikasjoner,
        utstyrtabell => {
          this.tabell = utstyrtabell;
          this.sorteringVal = sykkelTjeneste.lagsorteringsVal(this.tabell, 1);
          this.sorter(0);
        }
      );
    });
  }
  søk(søkeord) {
    // lag tabell på nytt med alle rader
    sykkelTjeneste.lagUtstyrBestillingTabell(this.råSQL, [], this.props.sykkel, this.spesifikasjoner, sykkeltabell => {
      this.tabell = sykkeltabell;
    });
    // finn rader som skal skjules
    this.skjulteRader = sykkelTjeneste.søkITabell(søkeord, this.tabell, 1);

    // lag tabell uten rader som skal skjules
    sykkelTjeneste.lagUtstyrBestillingTabell(
      this.råSQL,
      this.skjulteRader,
      this.props.sykkel,
      this.spesifikasjoner,
      sykkeltabell => {
        this.tabell = sykkeltabell;
      }
    );
  }
}

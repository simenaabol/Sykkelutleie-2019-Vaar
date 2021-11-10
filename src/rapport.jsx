import * as React from 'react';
import { Component } from 'react-simplified';
import date from 'date-and-time';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { sykkelTjeneste } from './teneste';

/*RapportKonteiner
Beholder som brukes rundt rapportene.
Slik kan man har flere rapporter etter hverandre for å sammenligne.
Grafen havner på bunnen og kommer bare en gang.
*/
export class RapportKonteiner extends Component {
  rapporter = [];
  render() {
    return (
      <div className="mainContent">
        <h1> Statistikk </h1>
        <div>{this.rapporter}</div>
        <div className="salgIDagKnapper">
          <button onClick={this.leggtilsammenligning} className="knappLagre">
            Legg til sammenligning
          </button>
          <button onClick={this.fjernsammenligning} className="knappLagre" id="sammenligningHoyre">
            Fjern sammenligning
          </button>
        </div>
        <br />
        <Graf />
      </div>
    );
  }
  fjernsammenligning() {
    this.rapporter.splice(this.rapporter.length - 1, 1);
  }
  leggtilsammenligning() {
    this.rapporter.push(
      <div>
        <Rapport key={this.rapporter.length} />
        <hr />
      </div>
    );
  }
  mounted() {
    this.rapporter.push(<Rapport key={this.rapporter.length} />);
  }
}

/*Rapport
Viser en del data om salg for en gitt periode.
Kan filtreres på tid og på selger
*/
export class Rapport extends Component {
  tabell = [];
  overskrift = 'Salg i dag';
  ansId = '%';

  d = new Date();
  fraDato = date.format(this.d, 'YYYY-MM-DDT[00:00]');
  tilDato = date.format(this.d, 'YYYY-MM-DDT[23:59]');

  månedEn = date.format(this.d, 'YYYY-MM');
  forNavn = [];
  etterNavn = [];
  helNavn = [];

  ansatteValg = [];

  render() {
    return (
      <div>
        <div className="salgIdagWrapper">
          <h3> {this.overskrift}</h3>
          <label className="bestillingLabel" for="fra2">
            Fra:
          </label>
          <input
            className="skjemaInput dateInput"
            value={this.fraDato}
            onChange={this.finnFraDato} //{/* velger fra dato */}
            type="datetime-local"
            name="fra2"
          />
          <label className="bestillingLabel" for="til2">
            Til:
          </label>
          <input
            className="skjemaInput dateInput" //{/* velger til dato */}
            value={this.tilDato}
            onChange={this.finnTilDato}
            type="datetime-local"
            name="til2"
          />
          Eller velg en hel måned
          <input className="skjemaInput dateInput" value={this.månedEn} onChange={this.finnMåned} type="month" />
          {/* Mulighet for å velg en hel måned */}
          <br />
          <button onClick={this.iDag} id="iDag" className="knappLagre">
            I dag
          </button>
          <button onClick={this.totalt} id="totalt" className="knappLagre">
            Totalt
          </button>
          <select
            onChange={event => this.endreAnsatt(event.target.value)}
            className="selectClass"
            id="statistikkSelect"
            tabIndex="0"
          >
            {' '}
            //{/* Nedtreksliste med alle ansatte */}
            {this.ansatteValg}
          </select>
          <br />
          <div>
            <br />

            <table>
              <tbody>{this.tabell}</tbody> {/* Tabellen blir skrevet ut */}
            </table>
          </div>
        </div>
      </div>
    );
  }
  endreAnsatt(nyid) {
    this.ansId = nyid;
    this.mounted();
  }
  finnMåned() {
    if (event.target.value == '') {
      return;
    }
    this.månedEn = event.target.value;
    this.månedEnTo = event.target.value;

    // Gjør om til string
    this.stringEn = `${this.månedEn.toString()}-01 00:00`;

    const dato = new Date(this.stringEn);
    this.nyMånedEn = date.format(new Date(this.stringEn), 'YYYY-MM-DDT[00:00]');
    this.nyMånedEnTo = date.format(new Date(dato.getFullYear(), dato.getMonth() + 1, 0, 0), 'YYYY-MM-DDT[23:59]');

    this.fraDato = this.nyMånedEn;
    this.tilDato = this.nyMånedEnTo;

    this.mounted();
  }
  iDag() {
    this.overskrift = 'Salg i dag';
    this.fraDato = date.format(this.d, 'YYYY-MM-DDT[00:00]');
    this.tilDato = date.format(this.d, 'YYYY-MM-DDT[23:59]');
    this.mounted();
  }
  totalt() {
    this.overskrift = 'Alle salg totalt';
    this.fraDato = '1900-01-01T00:00';
    this.tilDato = '2200-02-02T00:00';
    this.mounted();
  }
  finnFraDato() {
    this.fraDato = event.target.value;
    this.tabell = 'laster...';

    this.mounted();
  }
  finnTilDato() {
    this.tilDato = event.target.value;
    this.mounted();
  }
  mounted() {
    sykkelTjeneste.hentAnsatte(resultat => {
      this.ansatteValg = sykkelTjeneste.lagAnsatteVal(resultat);
    });

    this.tabell = (
      <tr id="container" key="0">
        <td key="1">
          <img src="media\sykkelhjul2.png" className="thing-to-spin" />
        </td>
      </tr>
    );

    sykkelTjeneste.hentRapport(this.fraDato, this.tilDato, this.ansId, resultat => {
      if (resultat.length == 0) {
        this.tabell = (
          <tr>
            <td>Finner ingen salg(3)</td>
          </tr>
        );
      } else {
        sykkelTjeneste.lagTabell(resultat, [], tabell => {
          this.tabell = tabell;
        });
      }
    });
  }
}

/*Graf
Graf som viser antall salg hver måned.
Man kan endre måneder og år som skal vises.
*/
export class Graf extends Component {
  data = [
    { name: 'Januar', Antall: 50 },
    { name: 'Februar', Antall: 50 },
    { name: 'Mars', Antall: 50 },
    { name: 'April', Antall: 50 },
    { name: 'Mai', Antall: 50 },
    { name: 'Juni', Antall: 50 },
    { name: 'Juli', Antall: 50 },
    { name: 'August', Antall: 50 },
    { name: 'September', Antall: 50 },
    { name: 'Oktober', Antall: 50 },
    { name: 'November', Antall: 50 },
    { name: 'Desember', Antall: 50 }
  ];

  salgHeleAaret = [];
  salgPrMnd = [];

  aaret = 2019;

  mndr = [
    'Januar',
    'Februar',
    'Mars',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Desember'
  ];

  fraMnd = 0;
  tilMnd = 11;
  test = [];
  render() {
    return (
      <div>
        <div className="grafWrapper">
          <h3>Graf over antall salg </h3>

          <table>
            <tbody>
              <th>År</th>
              <th>Fra</th>
              <th>Til</th>
              <tr>
                <td>
                  <select value={this.aaret} className="selectClass">
                    <option value="2019">2019</option>
                  </select>
                </td>
                <td>
                  <select value={this.fraMnd} onChange={this.oppdaterFraMnd} className="selectClass">
                    <option value="0">Januar</option>
                    <option value="1">Februar</option>
                    <option value="2">Mars</option>
                    <option value="3">April</option>
                    <option value="4">Mai</option>
                    <option value="5">Juni</option>
                    <option value="6">Juli</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">Oktober</option>
                    <option value="10">November</option>
                    <option value="11">Desember</option>
                  </select>
                </td>
                <td>
                  <select value={this.tilMnd} onChange={this.oppdaterTilMnd} className="selectClass">
                    <option value="0">Januar</option>
                    <option value="1">Februar</option>
                    <option value="2">Mars</option>
                    <option value="3">April</option>
                    <option value="4">Mai</option>
                    <option value="5">Juni</option>
                    <option value="6">Juli</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">Oktober</option>
                    <option value="10">November</option>
                    <option value="11">Desember</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={this.data} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
              <CartesianGrid stoke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar animationDuration={500} dataKey="Antall" fill="#228e90" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  oppdaterFraMnd() {
    this.fraMnd = event.target.value;

    this.test = [];
    for (let i = this.fraMnd; i <= this.tilMnd; i++) {
      this.test.push({ name: this.mndr[i], Antall: this.salgPrMnd[i].solgt });
    }
    this.data = this.test;
  }

  oppdaterTilMnd() {
    this.tilMnd = event.target.value;

    this.test = [];
    for (let i = this.fraMnd; i <= this.tilMnd; i++) {
      this.test.push({ name: this.mndr[i], Antall: this.salgPrMnd[i].solgt });
    }
    this.data = this.test;
  }

  mounted() {
    sykkelTjeneste.hentGrafInnhold(this.aaret, resultat => {
      this.salgHeleAaret = resultat;
      this.salgPrMnd = [
        { solgt: this.salgHeleAaret[0].Januar },
        { solgt: this.salgHeleAaret[0].Februar },
        { solgt: this.salgHeleAaret[0].Mars },
        { solgt: this.salgHeleAaret[0].April },
        { solgt: this.salgHeleAaret[0].Mai },
        { solgt: this.salgHeleAaret[0].Juni },
        { solgt: this.salgHeleAaret[0].Juli },
        { solgt: this.salgHeleAaret[0].August },
        { solgt: this.salgHeleAaret[0].September },
        { solgt: this.salgHeleAaret[0].Oktober },
        { solgt: this.salgHeleAaret[0].November },
        { solgt: this.salgHeleAaret[0].Desember }
      ];

      for (let i = this.fraMnd; i <= this.tilMnd; i++) {
        this.test.push({ name: this.mndr[i], Antall: this.salgPrMnd[i].solgt });
      }
      this.data = this.test;
    });
  }
}

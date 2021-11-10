import * as React from 'react';
import { Component } from 'react-simplified';
import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-relative-link';
import date from 'date-and-time';

import { sykkelTjeneste } from './teneste';
import { brukerValid } from './loginTjeneste';
import { BestillingsInnhold } from './tabeller';
import { navTeneste } from './navTeneste';
import { Velkomst } from './allmenn';
import { bestillingTeneste } from './bestillingteneste';

/*SalgMeny
Navigasjonsmeny for selger
*/
export class SalgMeny extends Component {
  render() {
    return (
      <div className="sidebar">
        <NavLink to="/">
          <button className="logoutPic" title="Logg ut">
            <i className="fas fa-power-off fa-lg" />
          </button>
        </NavLink>
        <NavLink to="/salg/settings">
          <button className="settingsPic" title="Innstillinger">
            <i className="fas fa-user-cog fa-lg" />
          </button>
        </NavLink>
        <p className="innloggetBruker">{brukerValid.brukerInnlogget}</p>
        <NavLink to="/salg" className="navLink" exact activeClassName="activeRoute">
          <div className="sidebarNav" tabIndex="0">
            Hjem
          </div>
        </NavLink>
        <NavLink to="/salg/nybestilling" className="navLink" exact activeClassName="activeRoute">
          <div className="sidebarNav" tabIndex="0">
            Ny bestilling
          </div>
        </NavLink>
        <NavLink to="/salg/bestilling" className="navLink" exact activeClassName="activeRoute">
          <div className="sidebarNav" tabIndex="0">
            Bestillinger
          </div>
        </NavLink>
        <NavLink to="/salg/statistikk" className="navLink" exact activeClassName="activeRoute">
          <div className="sidebarNav" tabIndex="0">
            Statistikk
          </div>
        </NavLink>
      </div>
    );
  }
}

/*BestillingsDetaljer
Viser detaljer og innhold for en bestilling
*/
export class BestillingsDetaljer extends Component {
  sletter = '';
  bestilling = {
    kunde_id: '',
    Navn: '',
    fra_dato: '',
    til_dato: ''
  };
  bestillingsdetaljer = [];
  knapper = [];

  fraDato = '';
  tilDato = '';

  render() {
    if (
      this.props.match.params.ordrenr == 'sykkel' ||
      this.props.match.params.ordrenr == 'utstyr' ||
      this.props.match.params.ordrenr == 'settings'
    )
      return null;
    else {
      return (
        <div className="w3-animate-opacity">
          <div className="mainContent">
            <h2>Dette er bestillingsdetaljer for bestilling {this.props.match.params.ordrenr}</h2>
            <table className="bestillingsDetaljerTabell">
              <tbody>{this.bestillingsdetaljer}</tbody>
            </table>
            <h3>Innhold:</h3>
            <BestillingsInnhold ordrenr={this.props.match.params.ordrenr} />
            {this.knapper}
          </div>
        </div>
      );
    }
  }

  mounted() {
    if (window.location.hash.split('/')[1] == 'lager') {
      this.knapper = [];
      this.knapper.push(
        <div className="wrapperAvbryt">
          <Link to="..">
            <button type="button" className="knappAvbryt">
              AVBRYT
            </button>
          </Link>
        </div>
      );
    } else {
      this.knapper = [];
      this.knapper.push(
        <div>
          <div className="wrapperLagre">
            <Link to="..">
              <button type="button" className="knappLagre" onClick={this.lagre}>
                LAGRE{' '}
              </button>
            </Link>
            <Link to="endre">
              <button type="button" className="knappLagre" onClick={this.endre} id="knappLagreHoyre">
                ENDRE{' '}
              </button>
            </Link>
          </div>
          <div className="wrapperAvbryt">
            <Link to="..">
              <button type="button" className="knappAvbryt">
                AVBRYT
              </button>
            </Link>
            <Link to="..">
              <button type="button" className="knappAvbryt" onClick={this.slett} id="knappAvbrytHoyre">
                SLETT
              </button>
            </Link>
          </div>
        </div>
      );
    }

    sykkelTjeneste.hentBestilling(this.props.match.params.ordrenr, bestilling => {
      this.bestilling = bestilling;
      const rader = [];
      let data = [];
      let nykel = 0;

      for (let i = 0; i < Object.getOwnPropertyNames(this.bestilling).length; i++) {
        if (this.bestilling[Object.getOwnPropertyNames(this.bestilling)[i]] instanceof Date) {
          this.bestilling[Object.getOwnPropertyNames(this.bestilling)[i]] = date.format(
            this.bestilling[Object.getOwnPropertyNames(this.bestilling)[i]],
            'DD/MM/YY HH:mm'
          );
        }

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
        //få to elementer per linje
        if ((i + 1) % 2 === 0) {
          rader.push(<tr key={nykel}>{data}</tr>);
          nykel++;
          data = [];
        }
      }
      this.bestillingsdetaljer = rader;
      //this.bestillingsdetaljer.push(</tr>);
    });
  }
  endre() {
    bestillingTeneste.bestilling = {};
    bestillingTeneste.spesifikasjoner = [];
  }
  slett() {
    this.sletter = 'Sletter bestilling...';
    sykkelTjeneste.slettBestilling(this.props.match.params.ordrenr, () => {
      this.props.history.push(navTeneste.nivåOpp(window.location.hash));
    });
  }
}

/*SalgVelkomst
Velkomstside for selger.
Denne kan utvides til å inneholde mer info, slik som provisjon,
men vi fikk ikke tid til å implementere dette.
*/
export class SalgVelkomst extends Component {
  render() {
    return (
      <div className="w3-animate-opacity">
        <div className="hjem">
          <Velkomst />
        </div>
      </div>
    );
  }
}

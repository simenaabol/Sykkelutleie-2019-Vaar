import * as React from 'react';
import { Component } from 'react-simplified';
import { NavLink } from 'react-router-dom';
import { brukerValid } from './loginTjeneste';

/* Login
 * Brukeren skriver inn brukernavn og passord
 * Valideres og rutes til riktig avdeling
 * Klassen brukes på innloggingssiden
 */
export class Login extends Component {
  //Ved mounted() hentes alle brukere av systemet og lagres i brukere[] for videre validering
  brukere = [];
  constructor(props) {
    super(props);
    this.state = {
      bnavn: '',
      pass: '',
      ruting: ''
    };
  }

  // Når brukeren skriver input i passord-feltet sjekkes inputen opp mot brukernavnet som er skrevet inn
  handleChange() {
    this.state.pass = event.target.value;

    // Dersom passordet stemmer, settes rutingen til riktig avdeling
    brukerValid.valider(this.brukere, this.state.bnavn, this.state.pass, avdeling => {
      if (avdeling === 'salg') {
        this.setState({ ruting: '/salg' });
      } else if (avdeling === 'admin') {
        this.setState({ ruting: '/admin' });
      } else if (avdeling === 'lager') {
        this.setState({ ruting: '/lager' });
      }
    });
  } // handleChange()

  // Kjøres når brukeren trykker på 'logg inn'.
  validSjekk() {
    // Kjører igjen validering i fall brukeren har endret brukernavnet etter å ha skrevet inn passord
    brukerValid.valider(this.brukere, this.state.bnavn, this.state.pass, avdeling => {
      if (avdeling === 'salg') {
        this.setState({ ruting: '/salg' });
      } else if (avdeling === 'admin') {
        this.setState({ ruting: '/admin' });
      } else if (avdeling === 'lager') {
        this.setState({ ruting: '/lager' });
      }
    });

    // Feilmelding dersom brukernavnet ikke eksisterer eller om passordet er feil
    brukerValid.valider(this.brukere, this.state.bnavn, this.state.pass, avdeling => {
      if (avdeling === 'feilpass') {
        alert('Feil passord.');
      } else if (avdeling === 'finnerikke') {
        alert('Finner ikke bruker.');
      }
    });
  } // validSjekk()

  // Henter informasjon om alle brukere
  mounted() {
    brukerValid.hentAdminBrukernavn(resultat => {
      this.brukere = resultat;
    });
  } // mounted()

  // Visuelt innhold
  render() {
    return (
      <div className="w3-animate-opacity">
        <div id="loginMain" className="form-group">
          <img src="media/BRA_sykkel.png" alt="Sykkellogo" id="loginLogo" />
          <div className="wrapper fadeInDown">
            <div id="formContent">
              <form>
                <div id="inputDiv">
                  <input
                    type="text"
                    id="loginInput"
                    className="fadeIn second"
                    name="login"
                    placeholder="Brukernavn"
                    onChange={event => this.setState({ bnavn: event.target.value })}
                  />
                  <input
                    type="password"
                    id="passwordInput1"
                    className="fadeIn third"
                    name="login"
                    placeholder="Passord"
                    onChange={this.handleChange}
                  />
                </div>
                <NavLink to={this.state.ruting}>
                  <input
                    type="submit"
                    className="fadeIn fourth"
                    value="LOGG INN"
                    onClick={this.validSjekk}
                    id="loginButton"
                  />
                </NavLink>
              </form>

              <div id="formFooter" />
            </div>
          </div>
        </div>
        <ul id="BRA-velg">
          <li>
            <NavLink to="/admin">Admin</NavLink>
          </li>
          <li>
            <NavLink to="/salg">Salg</NavLink>
          </li>
          <li>
            <NavLink to="/lager">Lager</NavLink>
          </li>
        </ul>
      </div>
    );
  } // render()
} // Login

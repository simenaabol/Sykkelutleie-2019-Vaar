import * as React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';

import { Login } from './login';
import {
  AdminMeny,
  AnsatteOversikt,
  NyAnsatt,
  AdminKunder,
  NyKunde,
  SykkelDetaljerAdmin,
  UtstyrDetaljerAdmin,
  KundeDetaljer,
  Provisjon,
  AdminVelkomst
} from './admin';
import { LagerMeny, SykkelDetaljer, UtstyrDetaljer, NySykkel, NyttUtstyr, LagerVelkomst } from './lager';
import { SalgMeny, BestillingsDetaljer, BestillingsInnhold, SalgVelkomst } from './salg';
import { NyBestilling, TilFøySykkel, TilFøyUtstyr, FerdigStillBestilling, EndreBestilling } from './nybestilling';
import { Sykler, Utstyr, Settings, Sti, NyLokasjon } from './allmenn';
import { RapportKonteiner } from './rapport';
import { BestillingsTabell } from './tabeller';

ReactDOM.render(
  //ruting
  <HashRouter>
    <div>
      <Route exact path="/" component={Login} />

      <Route path="/admin" component={Sti} />
      <Route path="/admin" component={AdminMeny} />
      <Route exact path="/admin" component={AdminVelkomst} />
      <Route exact path="/admin/nybestilling" component={NyBestilling} />
      <Route exact path="/admin/nybestilling/sykkel" component={TilFøySykkel} />
      <Route exact path="/admin/nybestilling/sykkel/:sykkelID" component={TilFøyUtstyr} />
      <Route exact path="/admin/nybestilling/ferdigstill" component={FerdigStillBestilling} />
      <Route exact path="/admin/bestilling" component={BestillingsTabell} />
      <Route exact path="/admin/bestilling/:ordrenr" component={BestillingsDetaljer} />
      <Route exact path="/admin/bestilling/:ordrenr" component={BestillingsDetaljer} />
      <Route exact path="/admin/bestilling/:ordrenr" component={BestillingsInnhold} />
      <Route exact path="/admin/bestilling/:ordrenr/endre" component={EndreBestilling} />
      <Route exact path="/admin/bestilling/:ordrenr/endre/sykkel" component={TilFøySykkel} />
      <Route exact path="/admin/bestilling/:ordrenr/endre/sykkel/:sykkelID" component={TilFøyUtstyr} />
      <Route exact path="/admin/sykkel" component={Sykler} />
      <Route exact path="/admin/sykkel/:id" component={SykkelDetaljerAdmin} />
      <Route exact path="/admin/sykkel/nysykkel" component={NySykkel} />
      <Route exact path="/admin/ansatte" component={AnsatteOversikt} />
      <Route exact path="/admin/ansatte/nyansatt" component={NyAnsatt} />
      <Route exact path="/admin/provisjon" component={Provisjon} />
      <Route exact path="/admin/kunder" component={AdminKunder} />
      <Route exact path="/admin/nykunde" component={NyKunde} />
      <Route exact path="/admin/kunder/:id" component={KundeDetaljer} />
      <Route exact path="/admin/settings" component={Settings} />
      <Route exact path="/admin/utstyr" component={Utstyr} />
      <Route exact path="/admin/utstyr/:id" component={UtstyrDetaljerAdmin} />
      <Route exact path="/admin/utstyr/nyttutstyr" component={NyttUtstyr} />
      <Route exact path="/admin/rapport" component={RapportKonteiner} />
      <Route exact path="/admin/nylokasjon" component={NyLokasjon} />

      <Route path="/salg" component={Sti} />
      <Route path="/salg" component={SalgMeny} />
      <Route exact path="/salg" component={SalgVelkomst} />
      <Route exact path="/salg/bestilling" component={BestillingsTabell} />
      <Route exact path="/salg/settings" component={Settings} />
      <Route exact path="/salg/bestilling/:ordrenr" component={BestillingsDetaljer} />
      <Route exact path="/salg/bestilling/:ordrenr" component={BestillingsInnhold} />
      <Route exact path="/salg/bestilling/:ordrenr/endre" component={EndreBestilling} />
      <Route exact path="/salg/bestilling/:ordrenr/endre/sykkel" component={TilFøySykkel} />
      <Route exact path="/salg/bestilling/:ordrenr/endre/sykkel/:sykkelID" component={TilFøyUtstyr} />
      <Route exact path="/salg/nybestilling" component={NyBestilling} />
      <Route exact path="/salg/nybestilling/sykkel" component={TilFøySykkel} />
      <Route exact path="/salg/nybestilling/sykkel/:sykkelID" component={TilFøyUtstyr} />
      <Route exact path="/salg/nybestilling/ferdigstill" component={FerdigStillBestilling} />
      <Route exact path="/salg/statistikk" component={RapportKonteiner} />

      <Route path="/lager" component={Sti} />
      <Route path="/lager" component={LagerMeny} />
      <Route exact path="/lager" component={LagerVelkomst} />
      <Route exact path="/lager/:ordrenr" component={BestillingsDetaljer} />
      <Route exact path="/lager/settings" component={Settings} />
      <Route exact path="/lager/sykkel" component={Sykler} />
      <Route exact path="/lager/sykkel/:id" component={SykkelDetaljer} />
      <Route exact path="/lager/sykkel/nysykkel" component={NySykkel} />
      <Route exact path="/lager/utstyr" component={Utstyr} />
      <Route exact path="/lager/utstyr/nyttutstyr" component={NyttUtstyr} />
      <Route exact path="/lager/utstyr/:id" component={UtstyrDetaljer} />
    </div>
  </HashRouter>,
  document.getElementById('rot')
);

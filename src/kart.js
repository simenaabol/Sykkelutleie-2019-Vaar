import * as React from 'react';
import { Component } from 'react-simplified';
import { SlippyMap, pinned } from 'react-slippy-map';
import { sykkelTjeneste } from './teneste';

let markørstil = {
  width: '25px',
  height: '25px',
  position: 'relative',
  left: '-9px',
  top: '-9px',
  backgroundColor: '#064851',
  color: 'white',
  textAlign: 'center',
  verticalAlign: 'middle',
  paddingTop: '3.5px',
  lineHeight: '16px',
  borderRadius: '50%'
};
let lappstil = {
  position: 'relative',
  height: '25px',
  left: '-9px',
  paddingLeft: '19px',
  paddingRight: '5px',
  paddingTop: '3px',
  marginLeft: '9px',
  top: '-9px',
  marginTop: '2px',
  verticalAlign: 'middle',
  lineHeight: '16px',
  color: 'white',
  backgroundColor: '#017282'
};
let pointer = {
  width: '0px',
  height: '0px',
  borderLeft: '10px solid transparent',
  borderRight: '10px solid transparent',
  borderTop: '10px solid #064851',
  marginTop: '-13px',
  marginLeft: '-6px'
};

//inneholder antall sykkel
function Markør(verdier) {
  return (
    <div className="w3-animate-opacity">
      <div style={markørstil}>{verdier.sykler}</div>
      <div style={pointer} />
    </div>
  );
}

//viser stedsnavnet
function Lapp(verdier) {
  return <div style={lappstil}>{verdier.tekst}</div>;
}

let PinnetMarkør = pinned(Markør);
let PinnetLapp = pinned(Lapp);

/*SykkelKart
Kart over rallarvegen som viser hvor mange sykler er på hver lokasjon for øyeblikket.
Koordinater er dessverre hardkodet for øyeblikket. Det er ønskelig å i fremtiden kunne
hente disse koordinatene fra karttjeneren eller eventuelt fra vår egen database
*/
export class SykkelKart extends Component {
  koordinater = { latitude: 60.7, longitude: 7.35 };
  haugastølKoordinater = {
    latitude: 60.51124,
    longitude: 7.86994
  };
  finseKoordinater = {
    latitude: 60.60174,
    longitude: 7.50399
  };
  geiloKoordinater = {
    latitude: 60.53452,
    longitude: 8.20638
  };
  myrdalKoordinater = {
    latitude: 60.7352,
    longitude: 7.1228
  };
  flåmKoordinater = {
    latitude: 60.863,
    longitude: 7.11315
  };
  vossKoordinater = {
    latitude: 60.62913,
    longitude: 6.41014
  };
  sykler = {
    finse: 0,
    geilo: 0,
    haugastøl: 0,
    myrdal: 0,
    flåm: 0,
    voss: 0
  };
  endreSenter(senter) {
    this.koordinater = senter;
  }
  //standard zoom er 9
  zoom = 9;
  endreZoom(event) {
    event.preventDefault();
    let delta = event.deltaY > 0 ? -1 : 1;
    this.zoom += delta / 2;
  }

  render() {
    return (
      <div className="w3-animate-opacity">
        <div id="kartBeholder">
          <SlippyMap
            center={this.koordinater}
            onCenterChange={this.endreSenter}
            onWheel={this.endreZoom}
            zoom={this.zoom}
            onWheel={this.endreZoom}
          >
            <PinnetLapp coords={this.haugastølKoordinater} tekst="Haugastøl" />
            <PinnetMarkør coords={this.haugastølKoordinater} sykler={this.sykler.haugastøl} />

            <PinnetLapp coords={this.finseKoordinater} tekst="Finse" />
            <PinnetMarkør coords={this.finseKoordinater} sykler={this.sykler.finse} />

            <PinnetLapp coords={this.geiloKoordinater} tekst="Geilo" />
            <PinnetMarkør coords={this.geiloKoordinater} sykler={this.sykler.geilo} />

            <PinnetLapp coords={this.myrdalKoordinater} tekst="Myrdal" />
            <PinnetMarkør coords={this.myrdalKoordinater} sykler={this.sykler.myrdal} />

            <PinnetLapp coords={this.vossKoordinater} tekst="Voss" />
            <PinnetMarkør coords={this.vossKoordinater} sykler={this.sykler.voss} />

            <PinnetLapp coords={this.flåmKoordinater} tekst="Flåm" />
            <PinnetMarkør coords={this.flåmKoordinater} sykler={this.sykler.flåm} />
          </SlippyMap>
        </div>
      </div>
    );
  }
  mounted() {
    sykkelTjeneste.hentSykkelLokasjoner(resultat => {
      for (let i = 0; i < resultat.length; i++) {
        if (resultat[i].stad == 'Finse') this.sykler.finse = resultat[i].ant;
        if (resultat[i].stad == 'Haugastøl') this.sykler.haugastøl = resultat[i].ant;
        if (resultat[i].stad == 'Geilo') this.sykler.geilo = resultat[i].ant;
        if (resultat[i].stad == 'Myrdal') this.sykler.myrdal = resultat[i].ant;
        if (resultat[i].stad == 'Voss') this.sykler.voss = resultat[i].ant;
        if (resultat[i].stad == 'Flåm') this.sykler.flåm = resultat[i].ant;
      }
    });
  }
}

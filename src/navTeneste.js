/*NavTeneste
Brukes bare til å navigere opp ett nivå*/
class NavTeneste {
  nivåOpp(sti) {
    let opp = '';

    //deler opp stien og dropper det siste leddet
    for (let i = 1; i < sti.split('/').length - 1; i++) {
      opp += '/' + sti.split('/')[i];
    }
    return opp;
  }
}
export const navTeneste = new NavTeneste();

import mysql from 'mysql';

// Definerer oppkobling til mysql-databasen som brukes i applikasjonen:
export let oppkobling;
function kobleTil() {
  oppkobling = mysql.createConnection({
    host: 'mysql-ait.stud.idi.ntnu.no',
    user: 'g_idri1005_25',
    password: 'd7WhBiMN',
    database: 'g_idri1005_25'
  });

  // Kobler til tjeneren
  oppkobling.connect(error => {
    if (error) console.error(error); // If error, show error in console and return from this function
  });

  // Lager feilbehandler for databsetilkobling
  oppkobling.on('error', error => {
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      // koble til på nytt om tilkobling til tjeneren mistes
      kobleTil();
    } else {
      console.error(error);
    }
  });
}
kobleTil();

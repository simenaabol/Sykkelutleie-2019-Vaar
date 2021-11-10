DROP TABLE IF EXISTS ikkekompatible;
DROP TABLE IF EXISTS bestillingspesifikasjon;
DROP TABLE IF EXISTS tilleggsutstyr;
DROP TABLE IF EXISTS bestilling;
DROP TABLE IF EXISTS sykkel;
DROP TABLE IF EXISTS kunde;
DROP TABLE IF EXISTS lokasjon;
DROP TABLE IF EXISTS ansatt;
DROP TABLE IF EXISTS omraade;
DROP TABLE IF EXISTS tallopplysning;

CREATE TABLE kunde (
  kunde_id INT NOT NULL AUTO_INCREMENT,
  fnavn varchar(30),
  enavn varchar(30),
  tlf INT,
  epost varchar(30),
  date_reg DATE,

  PRIMARY key(kunde_id)
);

create table ikkekompatible(
	kompID int not null AUTO_INCREMENT,
    sykkeltype varchar(30),
    utstyrtype varchar(30),

    primary key(kompID)
);

CREATE TABLE omraade (
  omr_id int NOT NULL AUTO_INCREMENT,
  fylke tinytext,
  omr_navn tinytext,

  PRIMARY key(omr_id)
);

CREATE TABLE ansatt (
  ans_id int NOT NULL AUTO_INCREMENT,
  avdeling varchar(30),
  fnavn varchar(30),
  enavn varchar(30),
  tlf INT,
  epost TINYTEXT,
  omr_id INT,
  brukernavn TINYTEXT,
  passord TINYTEXT,


  PRIMARY key(ans_id),
  FOREIGN key(omr_id) REFERENCES omraade(omr_id)
);

CREATE TABLE lokasjon(
  lokasjon_id int NOT NULL AUTO_INCREMENT,
  stad varchar(30),
  adresse varchar(100),
  omr_id int,
  hente_levere tinyint,
  lager tinyint,
  postnummer int,

  PRIMARY key(lokasjon_id),
  FOREIGN key(omr_id) REFERENCES omraade(omr_id)
);

CREATE TABLE sykkel(
  s_nr int NOT NULL AUTO_INCREMENT,
  rammenr varchar(30),
  dekk_storrelse float(4,2),
  type varchar(30),
  bruker varchar(10), -- voksen/barn
  status varchar(30), -- tilgjengelig/utleid/til service/stjålet/til reperasjon
  girsystem varchar(30),
  bremser varchar(30),
  naavaerende_lokasjon int,
  tilhoerende_lokasjon int,
  raapris int,

  PRIMARY key(s_nr),
  FOREIGN key(naavaerende_lokasjon) REFERENCES lokasjon(lokasjon_id),
  FOREIGN key(tilhoerende_lokasjon) REFERENCES lokasjon(lokasjon_id)
);

CREATE TABLE tilleggsutstyr(
  utstyrsnr int not null AUTO_INCREMENT,
  type tinytext,
  status varchar(30),
  beskrivelse text,
  raapris int,
  naavaerende_lokasjon int,
  tilhoerende_lokasjon int,

  primary key(utstyrsnr),
  FOREIGN key(naavaerende_lokasjon) REFERENCES lokasjon(lokasjon_id),
  FOREIGN key(tilhoerende_lokasjon) REFERENCES lokasjon(lokasjon_id)
);

CREATE TABLE bestilling (
  ordrenr int not null AUTO_INCREMENT,
  kunde_id int,
  bestillingsdato datetime,
  fra_dato datetime,
  til_dato datetime,
  rabatt int,
  selger_id int,
  hentested int,
  leveringsted int,
  pris int,

  PRIMARY key(ordrenr),
  FOREIGN key(kunde_id) REFERENCES kunde(kunde_id),
  FOREIGN key(selger_id) REFERENCES ansatt(ans_id),
  FOREIGN key(hentested) REFERENCES lokasjon(lokasjon_id),
  FOREIGN key(leveringsted) REFERENCES lokasjon(lokasjon_id)

);

CREATE TABLE bestillingspesifikasjon(
  spesifisering_id int AUTO_INCREMENT not null,
  s_nr int,
  ordrenr int not null,
  utstyrsnr int,

  primary key(spesifisering_id),
  FOREIGN key(s_nr) REFERENCES sykkel(s_nr),
  FOREIGN key(ordrenr) REFERENCES bestilling(ordrenr),
  FOREIGN key(utstyrsnr) REFERENCES tilleggsutstyr(utstyrsnr)
);

CREATE TABLE tallopplysning(
    type varchar(255) not null,
    verdi DOUBLE,
    PRIMARY KEY (type)
);

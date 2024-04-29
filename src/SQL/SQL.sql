/*CREATE TABLE Parts (
    ID varchar(255) NOT NULL, 
    pValue int DEFAULT 0, 
    PartType varchar(12),
    CONSTRAINT PK_Parts PRIMARY KEY (ID, PartType))*/
/*
CREATE TABLE users (
    ID varchar(32) NOT NULL, 
    nfbLink varchar(500) DEFAULT "", 
    parts JSON, 
    tempPart JSON, 
    CurrentBorbcoins int DEFAULT 0, 
    TotalBorbcoins  int DEFAULT 0,
    NFBsPet int default 0,
    UNIQUE (ID))*/

/*CREATE TABLE nfbs (
    ID varchar(255) NOT NULL, 
    nfbLink varchar(500) DEFAULT "", 
    currentOwner varchar(32) DEFAULT "", 
    firstCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    lastCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    timesCreated INT DEFAULT 0, 
    UNIQUE (ID))

ALTER TABLE users ADD Created TIMESTAMP DEFAULT CURRENT_TIMESTAMP*/

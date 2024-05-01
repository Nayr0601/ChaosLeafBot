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
    tempNFB JSON,
    tempPart JSON, 
    CurrentBorbcoins int DEFAULT 0, 
    TotalBorbcoins  int DEFAULT 0,
    NFBsPet int default 0,
    NFBsCreated int default 0,
    lastCreateCmd int default -1,
    UNIQUE (ID))
    
    COULD MOVE nfbLink, parts to the nfbs table and just use the currentOwner column to get it.
    
    
    */

/*CREATE TABLE nfbs (
    ID varchar(255) NOT NULL, 
    nfbLink varchar(500) DEFAULT "", 
    currentOwner varchar(32) DEFAULT "", 
    firstCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    lastCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    timesCreated INT DEFAULT 0, 
    UNIQUE (ID))*/

/*ALTER TABLE users ADD Created TIMESTAMP DEFAULT CURRENT_TIMESTAMP*/

/*UPDATE users SET lastCreate = -1*/
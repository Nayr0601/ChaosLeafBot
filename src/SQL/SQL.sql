/*CREATE TABLE Parts (
    ID varchar(255) NOT NULL, 
    pValue int DEFAULT 0, 
    PartType varchar(12),
    CONSTRAINT PK_Parts PRIMARY KEY (ID, PartType))*/

DROP TABLE users;
DROP TABLE nfbs;

CREATE TABLE nfbs (
    nfbID varchar(255) NOT NULL, 
    nfbLink varchar(500) DEFAULT "", 
    parts JSON,
    currentOwner varchar(32) DEFAULT null, 
    firstCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    lastCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    timesCreated INT DEFAULT 0, 

    PRIMARY KEY (nfbID));
    

CREATE TABLE users (
    ID varchar(32) NOT NULL, 
    nfbID varchar(255),
    tempNfbID varchar(255),
    nfbLink varchar(500) DEFAULT "", 
    parts JSON,
    tempPart JSON, 
    CurrentBorbcoins int DEFAULT 0, 
    TotalBorbcoins  int DEFAULT 0,
    NFBsPet int default 0,
    NFBsCreated int default 0,
    lastCreateCmd int default -1,
    PRIMARY KEY (ID)
    );
    
    




    /*
    FOREIGN KEY (nfbID) REFERENCES nfbs(ID)
    COULD MOVE nfbLink and parts to the nfbs table and just use the currentOwner column to get it.
    
    */



/*ALTER TABLE users ADD Created TIMESTAMP DEFAULT CURRENT_TIMESTAMP*/

/*UPDATE users SET lastCreate = -1*/
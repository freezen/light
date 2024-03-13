CREATE DATABASE stock;
use stock;
DROP TABLE dailydata60;
DROP TABLE dailydata30;
DROP TABLE dailydata002;
DROP TABLE stock;


CREATE TABLE stock (
    code VARCHAR(10) NOT NULL PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE dailydata60 (
	id INT AUTO_INCREMENT  PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    price DECIMAL(10, 2),
    open DECIMAL(10, 2),
    close DECIMAL(10, 2),
    high DECIMAL(10, 2),
    low DECIMAL(10, 2),
    volume INT,
    mydate DATE,
    UNIQUE(code, mydate),
    INDEX idx_code_mydate (code, mydate)
);

CREATE TABLE dailydata30 (
    id INT AUTO_INCREMENT  PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    price DECIMAL(10, 2),
    open DECIMAL(10, 2),
    close DECIMAL(10, 2),
    high DECIMAL(10, 2),
    low DECIMAL(10, 2),
    volume INT,
    mydate DATE,
    UNIQUE(code, mydate),
    INDEX idx_code_mydate (code, mydate)
);

CREATE TABLE dailydata002 (
    id INT AUTO_INCREMENT  PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    price DECIMAL(10, 2),
    open DECIMAL(10, 2),
    close DECIMAL(10, 2),
    high DECIMAL(10, 2),
    low DECIMAL(10, 2),
    volume INT,
    mydate DATE,
    UNIQUE(code, mydate),
    INDEX idx_code_mydate (code, mydate)
);
var mysql = require("mysql");
var inquirer = require("inquirer");

const dotenv = require("dotenv");
dotenv.config();
const cTable = require('console.table');


var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: process.env.DB_PASS,
    database: "employee_tracker_db"
});


connection.connect(function (err) {
    if (err) throw err;
    runSearch();
});


function runSearch() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: "What would you like to do?",
            choices: [
                "Add departments",
                "Add roles",
                "Add employees",
                "View departments",
                "View roles",
                "View employees",
                "Update employee roles"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "Add departments":
                    addDepartments();
                    break;

                case "Add roles":
                    addRoles();
                    break;

                case "Add employees":
                    addEmployees();
                    break;

                case "View departments":
                    viewDepartments();
                    break;

                case "View roles":
                    viewRoles();
                    break;

                case "View employees":
                    viewEmployees();
                    break;

                case "Update employee roles":
                    updateEmployeeRoles();
                    break;
            }
        });
}

function addDepartments() {
    var query = "SELECT * FROM departments";
    connection.query(query, function (err, res) {
        console.table(res);
        runSearch();
    });
}

function addRoles() {
    var query = "SELECT * FROM departments";
    connection.query(query, function (err, res) {
        console.table(res);
        runSearch();
    });
}

function addEmployees() {
    var query = "SELECT * FROM departments";
    connection.query(query, function (err, res) {
        console.table(res); 
        runSearch();
    });
}

function viewDepartments() {
    var query = "SELECT * FROM departments";
    connection.query(query, function (err, res) {
        console.table(res);
        runSearch();
    });
}

function viewRoles() {
    var query = "SELECT * FROM roles";
    connection.query(query, function (err, res) {
        console.table(res);
        runSearch();
    });
}

function viewEmployees() {
    var query = "SELECT * FROM roles";
    connection.query(query, function (err, res) {
        console.table(res);
        runSearch();
    });
}

function updateEmployeeRoles() {
    var query = "SELECT * FROM roles";
    connection.query(query, function (err, res) {
        console.table(res);
        runSearch();
    });
}
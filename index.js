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


/*********************
******* Logic ********
*********************/

getJob();

/*********************
****** Functions *****
*********************/

function getJob() {
    inquirer
        .prompt(
            {
                name: 'job',
                type: 'list',
                message: 'Which would you like to do?',
                choices: ['add', 'view', 'update', 'exit'],
            }
        ).then(function ({ job }) {
            switch (job) {
                case 'add':
                    add();
                    break;
                case 'view':
                    view();
                    break;
                case 'update':
                    update();
                    break;
                case 'exit':
                    connection.end();
                    return;
            }

        });
}

function add() {
    inquirer
        .prompt(
            {
                name: "db",
                message: 'Which would you like to add?',
                type: 'list',
                choices: ['departments', 'roles', 'employees'],
            }
        ).then(function ({ db }) {
            switch (db) {
                case "departments":
                    add_department();
                    break;
                case "roles":
                    add_role();
                    break;
                case 'employees':
                    add_employee();
                    break;
            }
        });

}

function add_department() {
    inquirer
        .prompt(
            {
                name: 'name',
                message: "What is the department's name?",
                type: 'input'
            }
        ).then(function ({ name }) {
            connection.query(`INSERT INTO departments (department_name) VALUES ('${name}')`, function (err, data) {
                if (err) throw err;
                console.log(`Added`);
                getJob();
            });
        });
}

function add_role() {
    let departments = [];

    connection.query(`SELECT * FROM departments`, function (err, data) {
        if (err) throw err;

        for (let i = 0; i < data.length; i++) { // Loops through and finds the name of all the departments
            departments.push(data[i].name);

        }

        inquirer
            .prompt([
                {
                    name: 'title',
                    message: "What is the role?",
                    type: 'input'
                },
                {
                    name: 'salary',
                    message: 'How much do they make?',
                    type: 'input'
                },
                {
                    name: 'department_id',
                    message: 'What department does it belong to?',
                    type: 'list',
                    choices: departments
                }
            ]).then(function ({ title, salary, department_id }) {
                let index = departments.indexOf(department_id);

                connection.query(`INSERT INTO roles (title, salary, department_id) VALUES ('${title}', '${salary}', ${index})`, function (err, data) {
                    if (err) throw err;
                    console.log(`Added`);
                    getJob();
                });
            });
    });
}

function add_employee() {
    let employees = [];
    let roles = [];

    connection.query(`SELECT * FROM roles`, function (err, data) {
        if (err) throw err;


        for (let i = 0; i < data.length; i++) {
            roles.push(data[i].title);
        }

        connection.query(`SELECT * FROM employees`, function (err, data) {
            if (err) throw err;

            for (let i = 0; i < data.length; i++) {
                employees.push(data[i].first_name);
            }

            inquirer
                .prompt([
                    {
                        name: 'first_name',
                        message: "what's the employees First Name",
                        type: 'input'
                    },
                    {
                        name: 'last_name',
                        message: 'What is their last name?',
                        type: 'input',
                    },
                    {
                        name: 'role_id',
                        message: 'What is their role?',
                        type: 'list',
                        choices: roles,
                    },
                    {
                        name: 'manager_id',
                        message: "Who is their manager?",
                        type: 'list',
                        choices: ['none'].concat(employees)
                    }
                ]).then(function ({ first_name, last_name, role_id, manager_id }) {
                    let queryText = `INSERT INTO employees (first_name, last_name, role_id`;
                    if (manager_id != 'none') {
                        queryText += `, manager_id) VALUES ('${first_name}', '${last_name}', ${roles.indexOf(role_id)}, ${employees.indexOf(manager_id) + 1})`;
                    } else {
                        queryText += `) VALUES ('${first_name}', '${last_name}', ${roles.indexOf(role_id) + 1})`;
                    }
                    console.log(queryText);

                    connection.query(queryText, function (err, data) {
                        if (err) throw err;

                        getJob();
                    });
                });

        });
    });
}

function view() {
    inquirer
        .prompt(
            {
                name: "db",
                message: 'Which would you like to view?',
                type: 'list',
                choices: ['departments', 'roles', 'employees'],
            }
        ).then(function ({ db }) {
            connection.query(`SELECT * FROM ${db}`, function (err, data) {
                if (err) throw err;

                console.table(data);
                getJob();
            });
        });
}

function update() {
    inquirer
        .prompt(
            {
                name: 'update',
                message: 'What would you like to update?',
                type: 'list',
                choices: ['roles', 'managers']
            }
        ).then(function ({ update }) {
            switch (update) {
                case 'roles':
                    update_role();
                    break;
                case 'managers':
                    update_manager();
                    break;
            }
        });
}

function update_role() {
    connection.query(`SELECT * FROM employees`, function (err, data) {
        if (err) throw err;

        let employees = [];
        let roles = [];

        for (let i = 0; i < data.length; i++) {
            employees.push(data[i].first_name);
        }

        connection.query(`SELECT * FROM roles`, function (err, data) {
            if (err) throw err;

            for (let i = 0; i < data.length; i++) {
                roles.push(data[i].title);
            }

            inquirer
                .prompt([
                    {
                        name: 'employee_id',
                        message: "Who's role needs to be updated",
                        type: 'list',
                        choices: employees
                    },
                    {
                        name: 'role_id',
                        message: "What is the new role?",
                        type: 'list',
                        choices: roles
                    }
                ]).then(function ({ employee_id, role_id }) {
                    //UPDATE `table_name` SET `column_name` = `new_value' [WHERE condition]
                    connection.query(`UPDATE employees SET role_id = ${roles.indexOf(role_id) + 1} WHERE id = ${employees.indexOf(employee_id) + 1}`, function (err, data) {
                        if (err) throw err;

                        getJob();
                    });
                });
        });

    });
}

function update_manager() {
    connection.query(`SELECT * FROM employees`, function (err, data) {
        if (err) throw err;

        let employees = [];

        for (let i = 0; i < data.length; i++) {
            employees.push(data[i].first_name);
        }

        inquirer
            .prompt([
                {
                    name: 'employee_id',
                    message: 'Who would you like to update?',
                    type: 'list',
                    choices: employees
                },
                {
                    name: "manager_id",
                    message: "Who's their new manager?",
                    type: 'list',
                    choices: ['none'].concat(employees)
                }
            ]).then(({ employee_id, manager_id }) => {
                let queryText = ""
                if (manager_id !== "none") {
                    queryText = `UPDATE employees SET manager_id = ${employees.indexOf(manager_id) + 1} WHERE id = ${employees.indexOf(employee_id) + 1}`;
                } else {
                    queryText = `UPDATE employees SET manager_id = ${null} WHERE id = ${employees.indexOf(employee_id) + 1}`;
                }

                connection.query(queryText, function (err, data) {
                    if (err) throw err;

                    getJob();
                });

            });

    });

}

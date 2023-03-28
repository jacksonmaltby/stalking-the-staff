const { prompt } = require('inquirer');
const db = require('./db')

function mainPrompt() {
    prompt([
        {
            type: "list",
            name: "choice",
            message: "What would you like to do?",
            choices: [
                {
                    name: "View All Departments",
                    value: "VIEW_DEPARTMENTS"
                },
                {
                    name: "View All Roles",
                    value: "VIEW_ROLES"
                },
                {
                    name: "View All Employees",
                    value: "VIEW_EMPLOYEES"
                },
                {
                    name: "Add Department",
                    value: "ADD_DEPARTMENT"
                },
                {
                    name: "Add Role",
                    value: "ADD_ROLE"
                },
                {
                    name: "Add Employee",
                    value: "ADD_EMPLOYEE"
                },
                {
                    name: "Update Employee Role",
                    value: "UPDATE_EMPLOYEE_ROLE"
                },
                {
                    name: "Quit",
                    value: "QUIT"
                }
            ]
        }
    ])
        .then(response => {
            let choice = response.choice
            switch (choice) {
                case "VIEW_DEPARTMENTS":
                    viewDepartments();
                    break;
                case "VIEW_ROLES":
                    viewRoles();
                    break;
                case "VIEW_EMPLOYEES":
                    viewEmployees();
                    break;
                case "ADD_DEPARTMENT":
                    addDepartment();
                    break;
                case "ADD_ROLE":
                    addRole();
                    break;
                case "ADD_EMPLOYEE":
                    addEmployee();
                    break;
                case "UPDATE_EMPLOYEE_ROLE":
                    updateEmployeeRole();
                    break;
                default:
                    quit();
            }
        })
};

function viewDepartments() {
    db.findAllDepartments()
        .then(([rows]) => {
            let departments = rows;
            console.log("\n");
            console.table(departments);
        })
        .then(() => mainPrompt());
}

function viewRoles() {
    db.findAllRoles()
        .then(([rows]) => {
            let roles = rows;
            console.log("\n");
            console.table(roles);
        })
        .then(() => mainPrompt());
}

function viewEmployees() {
    db.findAllEmployees()
        .then(([rows]) => {
            let employees = rows;
            console.log("\n");
            console.table(employees);
        })
        .then(() => mainPrompt());
}

function addDepartment() {
    prompt([
        {
            type: "input",
            name: "name",
            message: "Enter the name of the department:"
        }
    ]).then(res => {
        const name = res.name;
        db.newDepartment(name)
            .then(() => console.log(`Added ${name} to the database`))
            .then(() => mainPrompt());
    })
}

function addRole() {
    db.findAllDepartments().then(([rows]) => {
        let departments = rows;
        const departmentChoices = departments.map(({ id, name }) => ({
            name: name,
            value: id
        }));
        prompt([
            {
                type: "input",
                name: "title",
                message: "Enter the title of the role:"
            },
            {
                type: "number",
                name: "salary",
                message: "Enter the salary for the role:"
            },
            {
                type: "list",
                name: "department_id",
                message: "Select the department for the role:",
                choices: departmentChoices
            }
        ]).then(res => {
            const { title, salary, department_id } = res;
            db.newRole(title, salary, department_id)
                .then(() => console.log(`Added ${title} to the database`))
                .then(() => mainPrompt());
        });
    });
}

function addEmployee() {
    db.findAllRoles().then(([rows]) => {
        let roles = rows;
        const roleChoices = roles.map(({ id, title }) => ({
            name: title,
            value: id
        }));

        db.findAllEmployees().then(([rows]) => {
            let employees = rows;
            const managerChoices = employees.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));
            managerChoices.unshift({ name: "None", value: null });

            prompt([
                {
                    type: "input",
                    name: "first_name",
                    message: "Enter the employee's first name:"
                },
                {
                    type: "input",
                    name: "last_name",
                    message: "Enter the employee's last name:"
                },
                {
                    type: "list",
                    name: "role_id",
                    message: "Select the employee's role:",
                    choices: roleChoices
                },
                {
                    type: "list",
                    name: "manager_id",
                    message: "Select the employee's manager:",
                    choices: managerChoices
                }
            ]).then(res => {
                const { first_name, last_name, role_id, manager_id } = res;
                db.newEmployee(first_name, last_name, role_id, manager_id)
                    .then(() => console.log(`Added ${first_name} ${last_name} to the database`))
                    .then(() => mainPrompt());
            });
        });
    });
}

function updateEmployeeRole() {
    db.findAllEmployees()
        .then(([rows]) => {
            let employees = rows;
            const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));

            prompt([
                {
                    type: "list",
                    name: "employeeId",
                    message: "Which employee's role do you want to update?",
                    choices: employeeChoices
                }
            ])
                .then(res => {
                    let employeeId = res.employeeId;
                    db.findAllRoles()
                        .then(([rows]) => {
                            let roles = rows;
                            const roleChoices = roles.map(({ id, title }) => ({
                                name: title,
                                value: id
                            }));
                            prompt([
                                {
                                    type: "list",
                                    name: "roleId",
                                    message: "Which role do you want to assign the selected employee?",
                                    choices: roleChoices
                                }
                            ])
                                .then(res => db.updateEmployeeRole(employeeId, res.roleId))
                                .then(() => console.log("Updated employee's role"))
                                .then(() => mainPrompt())
                        });
                });
        });
}

mainPrompt();
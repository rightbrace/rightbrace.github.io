let visitedTabs = [];

window.onload = function() {
    switchToFirstTab();
    listCompleted();

    // If the user has entered any data, prompt them that it won't be saved
    // Taken from https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
    window.addEventListener("beforeunload", function (e) {
        // Cancel the event
        e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
        // Chrome requires returnValue to be set
        e.returnValue = '';
    });
      
}

function formSubmit(e) {
    e.preventDefault();
    // Validation, etc
    return false;
}

function formChange() {
    validateAll();
    listCompleted();
}

function switchToFirstTab() {
    let firstTab = document.querySelector(".tab");
    switchToTab(firstTab);
}

function switchToTab(tab) {

    // First, get the index. This assumes that the tab list and the content panel have the same number of children
    let list = tab.parentElement.querySelectorAll(".tab");
    // Ahahahaaha I hate javascript
    let idx = Array.prototype.indexOf.call(list, tab);
    // Mark all tabs as unselected
    list.forEach(tab => tab.classList.remove("selected"));
    tab.classList.add("selected");

    // Get all the panels
    let panels = document.querySelectorAll(".content");
    // Make them all inactive
    panels.forEach(element => {
        element.classList.remove("active");
    });
    // Make the one corresponding to the clicked tab active
    panels[idx].classList.add("active");

    // Handle visited status
    if (!visitedTabs.includes(tab)) {
        visitedTabs.push(tab);
    }

    list.forEach(tab => {
        tab.classList.add("unvisited");
    });
    visitedTabs.forEach(tab => tab.classList.remove("unvisited"));


    // Revalidate
    validateAll();

}

function listCompleted() {
    let listPanel = byId("done-list");
    listPanel.innerHTML = "";
    listPanel.appendChild(generateCompletedInputHTML());
}

function validateAll() {

    // Associate all functions with their prefix
    let validationFunctions = {
        "tal": [validateType, validateLocation],
        "exl": [validateExclude],
        "pop": [validatePopulation, validateSampleSize],
        "str": [validateStressors],
        "con": [validatePrimaryConsequences, validateSecondaryConsequences],
        "int": [validateIntervention],
        "fac": [validateFactors],
        "mta": [validateMetadata]
    }

    // Clear all tab error indicators
    let tabs = document.querySelectorAll(".tab");
    tabs.forEach(tab => tab.classList.remove("error"));

    // Remove all existing error messages
    document.querySelectorAll(".error-message").forEach(e => e.remove());

    let anyErrors = false;

    // For every category
    for (suffix in validationFunctions) {
        // Run every function
        let list = validationFunctions[suffix];
        list.forEach(func => {
            let errors = func();
            if (errors.length > 0) {
                // If there were errors, mark that tab
                byId("tab-" + suffix).classList.add("error");
                // Fail the whole test
                anyErrors = true;

                // Now, sprinkle error messages around
                errors.forEach(error => {
                    let msg = document.createElement("span");
                    msg.classList.add("error-message");
                    msg.innerText = error.message;
                    let problem = byId(error.id);
                    if (problem == null) {
                        console.log(error.id)
                    }
                    problem.parentNode.insertBefore(msg, problem.nextSibling);
                })
            }
        })
    }

    return !anyErrors;
}

function generateOutput() {

    // To generate output, first make sure the input is both free of errors, and all tabs have been visited
    let errorFree = validateAll();

    if (!errorFree) {
        alert("Cannot generate output while there are errors. Fix the errors and try again.");
        return;
    }

    let numTabs = document.querySelectorAll(".tab").length;
    if (visitedTabs.length < numTabs) {
        alert("Cannot generate output until all tabs have been visited (even optional ones).");
        return;
    }

    let columns = generateRow();

    let table = document.getElementById("output-table");
    let row = document.createElement("tr");
    table.appendChild(row);

    let btnTd = document.createElement("td");
    row.appendChild(btnTd);

    let btn = document.createElement("div");
    btn.innerText = "Delete Row";
    btn.classList.add("button");
    btn.onclick = () => {
        table.removeChild(row);
    }
    btnTd.appendChild(btn);

    btn = document.createElement("div");
    btn.innerText = "Copy Row";
    btn.classList.add("button");
    btn.onclick = () => {
        let cols = Array.from(row.children).slice(1);
        let cpy = cols.map(elem => elem.innerText).join("\t");
        navigator.clipboard.writeText(cpy);
    }
    btnTd.appendChild(btn);

    columns.forEach(column => {
        let td = document.createElement("td");
        td.innerText = column;
        row.appendChild(td);
    });

}

function clearInput() {
    if (confirm("Really clear all entered data?")) {
        document.querySelectorAll("form").forEach(form => form.reset());
        visitedTabs = [];
        switchToFirstTab();
        listCompleted();
    }
}

let byId = (id) => document.getElementById(id);
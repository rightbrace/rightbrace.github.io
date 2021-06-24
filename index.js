let visitedTabs = [];

window.onload = function() {
    switchToFirstTab();

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

function switchToFirstTab() {
    let firstTab = document.querySelector(".tab");
    switchToTab(firstTab);
}

function switchToTab(tab) {

    // First, get the index. This assumes that the tab list and the content panel have the same number of children
    let list = tab.parentElement.querySelectorAll(".tab");
    // Ahahahaaha I hate javascript
    let idx = Array.prototype.indexOf.call(list, tab);

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



}

function generateOutput() {
    alert("Unimplemented");
}

function clearInput() {
    if (confirm("Really clear all entered data?")) {
        document.querySelectorAll("form").forEach(form => form.reset());
        visitedTabs = [];
        switchToFirstTab();
    }
}
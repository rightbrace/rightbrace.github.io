function filled(id) {
    let elem = document.getElementById(id);

    if (elem.nodeName != "INPUT") {
        console.error("Cannot call filled on a non <input> element: " + id);
    }

    if (elem.type == "checkbox") {
        return elem.checked;
    } else if (elem.type == "text") {
        return elem.value.trim() != "";
    } else if (elem.type == "number") {
        return elem.value.trim() != "";
    } else if (elem.type == "date") {
        return elem.value.trim() != "";
    }

    console.error("Cannot handle input type " + elem.type);
    return false;
}

function validateNumericField(id, errorList) {
    let elem = document.getElementById(id);

    if (elem.nodeName != "INPUT") {
        console.error("Cannot call filled on a non <input> element");
    }
    
    if (elem.type != "number") {
        console.error("Cannot handle input type " + elem.type);
        return;
    }
    
    let valid = elem.validity;
    if (valid.valueMissing || valid.typeMismatch || valid.patternMismatch || valid.tooLong || valid.tooShort || valid.rangeUnderflow || valid.stepMismatch || valid.badInput || valid.customError) {
        errorList.push({id: id, message: "Invalid input"});
    }

}

function validateSpicyBoolean(booleanId, textId, errorList) {
    if (filled(booleanId) && !filled(textId)) {
        errorList.push({id: textId, message: "You must provide more information here."})
    }

    if (!filled(booleanId) && filled(textId)) {
        errorList.push({id: booleanId, message: "If you provided additional information, you must tick here."})
    }
}

function required(id, errors) {
    if (!filled(id)) {
        errors.push({id: id, message: "This must be filled"});
    }
}
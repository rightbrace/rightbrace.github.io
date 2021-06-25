function validateType() {

    let errors = [];

    // Make sure at least one is answered
    let oneOf = ["tal-type-review", "tal-type-meta-analysis", "tal-type-editorial", "tal-type-letter-to-editor", "tal-type-quantitative", "tal-type-quantitative-rct", "tal-type-qualitative", "tal-type-mixed-methods", "tal-type-other"];

    if (!oneOf.some(filled)) {
        errors.push({id: "tal-type-header", message: "Must select at least one paper type"})
    }

    // If its -review or -meta-analysis, make sure the subquestion is answered

    validateSpicyBoolean("tal-type-review", "tal-type-review-number", errors);
    validateSpicyBoolean("tal-type-meta-analysis", "tal-type-meta-analysis-number", errors);

 
    // Validate all the numberic fields too:
    ["tal-type-review-number", "tal-type-meta-analysis-number"].forEach(id => validateNumericField(id, errors));
    
    return errors;
}

function validateLocation() {
    let errors = [];

    // Ensure at least one is answered
    let oneOf = ["tal-location-north-america", "tal-location-south-central-america", "tal-location-europe-russia", "tal-location-asia", "tal-location-africa", "tal-location-middle-east-turkey", "tal-location-australia-nz", "tal-location-other"];

    if (!oneOf.some(filled)) {
        errors.push({id: "tal-location-header", message: "Must select at least one location"})
    }

    return errors;
}

function validateExclude() {

    let errors = [];

    // If no, then check all blank. If yes or uncertain, check at least one reason is provided
    let buttons = document.getElementsByName("exl-exclude");
    let checked = -1;
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].checked) {
            checked = i;
        }
    }

    // Check if nothing was selected
    if (checked == -1) {
        errors.push({id: "exl-header", message: "You must select one of these."});
    }

    // If yes or uncertain (1/2) was selected, ensure at least one reason is provided
    if (checked == 1 || checked == 2) {

        let oneOf = ["exl-why-before-2000", "exl-why-not-english", "exl-why-not-hospital-based", "exl-why-conference-abstract", "exl-why-other"];
        if (!oneOf.some(filled)) {
            errors.push({id: "exl-header", message: "Must provide at least one reason."});
        }

    }

    // TODO - if something was selected, make sure that the option is set to No

    return errors;
}

function validatePopulation() {


    // Check one population type provided
    let errors = [];
    let oneOf = ["pop-physicians", "pop-medical-students", "pop-nurses", "pop-nursing-students", "pop-resident", "pop-general-hospital-staff", "pop-not-specified", "pop-other"];

    if (!oneOf.some(filled)) {
        errors.push({id: "pop-header", message: "Must provide at least one population type."});
    }

    // Check the simple subspecialties
    validateSpicyBoolean("pop-nurses", "pop-nurse-subspecialty", errors);
    validateSpicyBoolean("pop-resident", "pop-resident-subspecialty", errors);

    // Check the physician subspecialty
    // If physician is ticked, both children must be filled, however the dropdown is "Not specified" by default
    validateSpicyBoolean("pop-physicians", "pop-physician-subspecialty", errors);
    if (filled("pop-physicians") && byId("pop-physician-subspecialty-2").value == "") {
        errors.push({id: "pop-physicians-subspecialty-2", message: "You must provide a second subspecialty or 'Not Specified.'"})
    }

    if (!filled("pop-physicians") && byId("pop-physician-subspecialty-2").value != "") {
        errors.push({id: "pop-physicians-subspecialty", message: "You provided a second subspecialty without ticking this."})
    }

    return errors;

}

function validateSampleSize() {
    let errors = [];

    // Check either a valid number is entered or NA is ticked.
    if (filled("pop-sample-size") == filled("pop-sample-size-na")) {
        errors.push({id: "pop-sample-size-na", message: "You must fill exactly one of these"});
    }

    validateNumericField("pop-sample-size", errors);
    return errors;
}

function validateStressors() {
    let errors = [];
    return errors;
}

function validatePrimaryConsequences() {
    let errors = [];
    // 0 inputs is valid
    return errors;
}

function validateSecondaryConsequences() {
    let errors = [];
    // 0 inputs is valid
    return errors;
}

function validateIntervention() {

    let errors = [];

    // If anything other than none (default) is selected, we need to perform validation
    let buttons = document.getElementsByName("int");
    let checked = -1;
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].checked) {
            checked = i;
        }
    }

    // If any were selected, make sure fields are filled
    if (checked != 0) {
        // Two are required
        required("int-name-of-intervention", errors);
        required("int-brief-description", errors);

        // The rest must be at least one
        let oneOf = ["int-individual-based", "int-team-based", "int-organizational-based", "int-education-based", "int-organizational-justice", "int-other"];
        if (!oneOf.some(filled)) {
            errors.push({id: "int-one-of", message: "Must provide at least one category."});
        }

    }

    return errors;

    
}

function validateFactors() {
    // Can be empty
    return [];
}

function validateMetadata() {
    // Notes can be empty, but the name and date must be set.

    let errors = [];
    required("mta-date", errors);
    required("mta-name-of-extractor", errors);
    return errors;

}
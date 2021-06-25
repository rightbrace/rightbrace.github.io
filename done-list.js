
let inputCategoryMap = {
    "Type": [
        "tal-type-review",
        "tal-type-review-number",
        
        "tal-type-meta-analysis",
        "tal-type-review-number",
        
        "tal-type-editorial",
        "tal-type-letter-to-editor",
        "tal-type-quantitative",
        "tal-type-quantitative-rct",
        "tal-type-qualitative",
        "tal-type-mixed-methods",
        "tal-type-other"
    ],
    
    "Population": [
        "pop-physicians",
        //"pop-physician-subspecialty",
        //"pop-physician-subspecialty-2",
        
        "pop-medical-students",
        "pop-nurses",
        "pop-nurse-subspecialty",
        
        "pop-nursing-students",
        "pop-resident",
        "pop-resident-subspecialty",
        
        "pop-general-hospital-staff",
        "pop-not-specified",
        "pop-other"
    ],
    
    "Exclude": [
        //"exl-exclude",
        "exl-why-before-2000",
        "exl-why-not-english",
        "exl-why-not-hospital-based",
        "exl-why-conference-abstract",
        "exl-why-other"
    ],
    
    "Sample Size": [
        "pop-sample-size-na",
        "pop-sample-size",
    ],
    
    "Location": [
        "tal-location-north-america",
        "tal-location-south-central-america",
        "tal-location-europe-russia",
        "tal-location-asia",
        "tal-location-africa",
        "tal-location-middle-east-turkey",
        "tal-location-australia-nz",
        "tal-location-other"
    ],
    
    "Stressors": [
        "str-trauma",
        "str-extraordinary-event",
        "str-workplace-violence-physical",
        "str-workplace-violence-verbal",
        "str-workplace-harassment",
        "str-work-demands",
        "str-other"
    ],
    
    "Primary Consequences": [
        "con-primary-burnout",
        "con-primary-stress",
        "con-primary-compassion-fatigue",
        "con-primary-moral-distress"
    ],
    
    "Secondary Consequences": [
        "con-secondary-substance-use",
        "con-secondary-suicide",
        "con-secondary-job-satisfaction",
        "con-secondary-quality-of-life",
        "con-secondary-psychological-symptoms",
        "con-secondary-retention",
        "con-secondary-other",
        "con-secondary-resilience"
    ],
    
    "Intervention": [
        /*
        let elems = document.getElementsByName("int");
        elems.forEachelem => {
            if (elem.checked) {
                val = elem.value;
            }
        }
        */
        
        
        "int-individual-based",
        "int-team-based",
        "int-organizational-based",
        "int-education-based",
        "int-organizational-justice",
        "int-other",
        "int-name-of-intervention",
        "int-brief-description"
    ],
    
    "Factors": [
        "fac-personality-psychological",
        "fac-individual",
        "fac-organizational",
        "fac-social",
        "fac-other"
    ],
    
    "Notes": [
        "mta-notes"
    ],
    
    "Signing": [
        "mta-date",
        "mta-name-of-extractor"
    ]
}

function generateCompletedInputHTML() {

    let list = document.createElement("ul");

    Object.keys(inputCategoryMap).forEach(category => {

        let li = document.createElement("li");
        let sublist = document.createElement("ul");
        let header = document.createElement("h3");

        header.innerText = category;
        li.appendChild(header);
        li.appendChild(sublist);
        list.appendChild(li);

        inputCategoryMap[category].forEach(id => {
            if (filled(id)) {
                let item = document.createElement("li");
                item.innerText = byId(id).labels[0].innerText;
                sublist.appendChild(item);
            }
        });
    });

    return list;
}
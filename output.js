/*
This class defines a little DSL that eases:
- Reading form data (but not validating it)
- Translating it into the correct output format (ie bools become "1" or "")
- Handling columns that toggle other sets of columns (ie "only fill in B-E if A is filled, regardless of the values in B-E")
  Note that there shouldn't be anything in B-E anyway, but the peace of mind is nice

*/

class RowBuilder {
    constructor(parent, active) {
        this.cols = [];
        this.parent = parent;
        this.active = active;
    }

    _push(x) {
        if (!this.active) {
            x = "";
        }
        if (this.parent) {
            this.parent._push(x)
        } else {
            this.cols.push(x);
        }
    }

    bool(id) {
        this._push(byId(id).checked ? "1" : "");
        return this;
    }

    text(id) {
        this._push(byId(id).value);
        return this;
    }

    num(id) {
        this._push(byId(id).value);
        return this;
    }

    dropdown(id) {
        this._push(byId(id).value);
        return this;
    }

    date(id) {
        let date = byId(id).value.split("-");
        let year = date[0].substr(2);
        let monthNum = parseInt(date[1]);
        let day = date[2];
        let names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        this._push(`${day}/${names[monthNum]}/${year}`)
        return this;
    }

    blank(count = 1) {
        for (let i = 0; i < count; i++) {
            this._push("");
        }
        return this;
    }

    // An if statement inserts the appropriate boolean value, but if it was false,
    // then subsequent values will be empty no matter what until end() is called
    if(id) {
        let checked = byId(id).checked;
        this._push(checked ? "1" : "");
        return new RowBuilder(this, checked);
    }

    ifRadio(name) {
        let val = "";
        let elems = document.getElementsByName(name);
        elems.forEach(elem => {
            if (elem.checked) {
                val = elem.value;
            }
        })
        this._push(val);
        return new RowBuilder(this, val != "");
    }

    end() {
        return this.parent;
    }

    // Runs a custom function as though it were a method of this class.
    // If that function has no return value, return this.
    custom(f) {
        return f(this) || this;
    }
}

function generateRow() {
    let row = new RowBuilder(null, true);

    row
    // Paper type
    .if("tal-type-review")
        .num("tal-type-review-number")
        .end()
    .if("tal-type-meta-analysis")
        .num("tal-type-meta-analysis-number")
        .end()
    .bool("tal-type-editorial")
    .bool("tal-type-letter-to-editor")
    .bool("tal-type-quantitative")
    .bool("tal-type-quantitative-rct")
    .bool("tal-type-qualitative")
    .bool("tal-type-mixed-methods")
    .text("tal-type-other")

    // Population data
    .custom(row => {
        if (filled("pop-physicians")) {
            row.bool("pop-physicians")
               .text("pop-physician-subspecialty")
               .dropdown("pop-physician-subspecialty-2");
            if (filled("pop-physician-pediatrics")) {
                // Careful, this only works since we aren't in an if
                row.cols[row.cols.length - 1] += "-P";
            }
        } else {
            row.blank(3);
        }
    })
    .bool("pop-medical-students")
    .if("pop-nurses")
        .text("pop-nurse-subspecialty")
        .end()
    .bool("pop-nursing-students")
    .if("pop-resident")
        .text("pop-resident-subspecialty")
        .end()
    .bool("pop-general-hospital-staff")
    .bool("pop-not-specified")
    .text("pop-other")

    // Exclude
    .ifRadio("exl-exclude")
        .bool("exl-why-before-2000")
        .bool("exl-why-not-english")
        .bool("exl-why-not-hospital-based")
        .bool("exl-why-conference-abstract")
        .text("exl-why-other")
        .end()

    // Sample size
    .custom((row) => {
        let na = byId("pop-sample-size-na");
        if (na.checked) {
            row._push("NA");
        } else {
            row.num("pop-sample-size");
        }
    })

    // Location
    .bool("tal-location-north-america")
    .bool("tal-location-south-central-america")
    .bool("tal-location-europe-russia")
    .bool("tal-location-asia")
    .bool("tal-location-africa")
    .bool("tal-location-middle-east-turkey")
    .bool("tal-location-australia-nz")
    .text("tal-location-other")

    // Stressors
    .bool("str-trauma")
    .bool("str-extraordinary-event")
    .custom(row => {
        let physical = byId("str-workplace-violence-physical").checked;
        let verbal = byId("str-workplace-violence-verbal").checked;
        if (physical || verbal) {
            row._push("1");
            row.bool("str-workplace-violence-physical");
            row.bool("str-workplace-violence-verbal");
        } else {
            row.blank(3);
        }
    })
    .bool("str-workplace-harassment")
    .custom(row => {
        if (filled("str-work-demands")) {
            row._push("1");
            row.text("str-work-demands");
        } else {
            row.blank(2);
        }
    })
    .text("str-other")

    // Primary Consequences
    .bool("con-primary-burnout")
    .custom(row => {
        if (filled("con-primary-stress")) {
            row._push("1");
            row.text("con-primary-stress");
        } else {
            row.blank(2);
        }
    })
    .bool("con-primary-compassion-fatigue")
    .bool("con-primary-moral-distress")

    // Secondary Consequences
    .bool("con-secondary-substance-use")
    .bool("con-secondary-suicide")
    .bool("con-secondary-job-satisfaction")
    .bool("con-secondary-quality-of-life")
    .bool("con-secondary-psychological-symptoms")
    .bool("con-secondary-retention")
    .text("con-secondary-other")
    .bool("con-secondary-resilience")

    // Intervention
    .custom(row => {

        // Split the radio
        let val = "";
        let elems = document.getElementsByName("int");
        elems.forEach(elem => {
            if (elem.checked) {
                val = elem.value;
            }
        })

        if (val == "") {
            row.blank(11);
            return;
        } else if (val == "1") {
            row._push("1");
            row.blank(2);
        } else if (val == "2") {
            row._push("1");
            row._push("1");
            row.blank(1);
        } else if (val == "3") {
            row._push("1");
            row._push("1");
            row._push("1");
        }

        row
        .bool("int-individual-based")
        .bool("int-team-based")
        .bool("int-organizational-based")
        .bool("int-education-based")
        .bool("int-organizational-justice")
        .text("int-other")
        .text("int-name-of-intervention")
        .text("int-brief-description")
    })

    // Factors
    .bool("fac-personality-psychological")
    .bool("fac-individual")
    .bool("fac-organizational")
    .bool("fac-social")
    .text("fac-other")

    // Notes
    .text("mta-notes")

    // Signing
    .date("mta-date")
    .text("mta-name-of-extractor")

    return row.cols;
}
// d(N) returns a function which gives the probability of an N sided die returning a given value
// d(8) => { (r) => P(r ∈ 1d8) }
function d(N) {
    return (n) => 1 <= n && n <= N ? 1/N : 0;
}

function* diceRange(dice) {
    let max = dice.reduce((partial, next) => partial + next, 0);
    for (let i = dice.length; i <= max; i++) yield i;
}

function arrayEqual(a, b) {
    if (a.length != b.length) return false;
    for (let i = 0; i < a.length; i++)
        if(a[i] != b[i])
            return false;
    return true;
}

// Probability of getting a sum S when rolling xdN
P.cache = [];
function P(dice, S) {

    // Simple cache 128 ms

    // Most of the time is being spent in this find call
    // Switch to a sorted structure

    // let found = false;
    // let lower = 0;
    // let upper = P.cache.length;
    // let middle = 0;

    // while (P.cache.length > 0) {
    //     middle = Math.floor((lower + upper ) / 2);
    //     let call = P.cache[middle];

    //     if (call.S == S) {
    //         found = true;
    //         break;
    //     } else if (S > call.S) {
    //         upper = middle;
    //     } else if (S < call.S) {
    //         lower = middle;
    //     }

    //     if (Math.abs(lower - upper) < 3) {
    //         break;
    //     }
    // }

    // console.log("here")
    // let results = undefined;

    // if (found) {
    //     // Return to start of segment
    //     for (let i = middle; i >= 0; i --) {
    //         if (P.cache[i].S != S) {
    //             middle ++;
    //             break;
    //         }
    //     }

    //     // Now search forward;
    //     for (let i = middle; i < P.cache.length; i++) {
    //         if (P.cache[i].S != S) break;
    //         if (arrayEqual(P.cache[i].dice, dice)) {
    //             results = P.cache[i];
    //             break;
    //         }
    //     }
    // }

    let results = P.cache.find(call => call.S == S && arrayEqual(call.dice, dice));
    if (results) return results.P;

    // This works by only considering one die at a time.
    // Given a target sum S, the question becomes:
    //     What values could I get by summing all the dice except the last?
    //     For each of those other sums:
    //         What is the probability of that sum?
    //         What is the probability that I can roll the excluded die such that S = the die + the sum of the other dice?
    //         (the product of these two probabilities is the odds of all the other dice + the head die summing to a given value)

    // Return if there are no dice to add up - for simplicity, return 1
    // This is equivalent to if (S == 0) but I think makes more sense as a recursive base case
    if (dice.length == 1) return d(dice[0])(S);

    // Save the call, we will cache it later
    let call = {
        dice: [...dice],
        S: S
    };

    // Pull the last die off the list
    let n = dice.pop();
    let die = d(n);

    // P will be the sum of the probabilities of every possible way to make S
    let Psum = 0;

    // What values could all the other dice sum to?
    let possibleOtherSums = diceRange(dice);


    // For each of those values, work out the odds of rolling that sum and a die which will add to it to get S
    // the value of roll may take on an impossible die value (we assume that roll exists), the die() function will just return
    // 0 for anything outside of [1, N]
    for (let otherSum of possibleOtherSums) {
        // What roll needs to be made to complement otherSum to equal S?
        let requiredRoll = S - otherSum;
        // What are the actual odds of otherSum?
        let oddsOfSum = P([...dice], otherSum);
        // What are the odds of making the required roll? (Either 0 or 1/N for a fair die)
        let oddsOfRequiredRoll = die(requiredRoll);
        Psum += oddsOfSum * oddsOfRequiredRoll;
    }

    call.P = Psum;
        P.cache.push(call);

    // Insert call object next to others of the same S
    // let idx = P.cache.findIndex((call) => call.S == S);
    // if (idx != -1) {
    //     P.cache.splice(idx, 0, call);
    // } else {
    //     P.cache.push(call);
    // }

    return Psum;

}

function dist(dice) {
    let x = [];
    let y = [];
    for(let s of diceRange(dice)) {
        x.push(s);
        y.push(P([...dice], s)*100);
    }
    return {x: x, y: y, name: dice.name, fill: "tozeroy"};
}

function makePlot(sets) {
    let output = document.getElementById('output');
    output.innerText = "";
	Plotly.newPlot( 
        output, 
        sets.map(set => dist(set)), 
        {
            margin: { t: 0 },
            xaxis: {
                title: "roll"
            },
            yaxis: {
                title: "probability (%)"
            }
        } );
        console.profileEnd();
}

function parseDiceString(input) {
    // Format we want to accept:
    // 3d8 + 3d4
    // 1d7+12d4
    // 5d3 +2d6
    // d9
    // etc

    // Return an array of tuples [[count1, size1], [count2, size2], ...]

    return input.split("+")
                .map(die => die.trim())
                .map(die => die.split("d"))
                .map(die => (die[0] != "" ? die : [1, die[1]]).map(x => parseInt(x)));
}

function makeDiceSets(input) {

    // Accept something like: "2d3 + 3d6 v 2d12"
    // Return [[3 3 6 6 6] [12 12]]

    let sets = input.split("v")
                .map(parseDiceString)
                .map(diceSet => 
                    diceSet.map(set => 
                        Array(set[0]).fill(set[1]))
                    .flat());

    let labels = input.split("v").map(x => x.trim());
    for(let i = 0; i < sets.length; i++) {
        sets[i].name = labels[i];
    }
    return sets;
}

function validateDiceSets(sets) {
    return sets.flat().every(item => typeof(item) === "number" && isFinite(item) && !isNaN(item));
}

function submit() {
    let input = document.getElementById("inputField").value;
    let valid = false;
    let diceSets;
    try {
        diceSets = makeDiceSets(input);
        valid = validateDiceSets(diceSets);
    } catch {}

    if (valid) {
        makePlot(diceSets);
    } else {
        document.getElementById("output").innerText = "could not parse input";
    }
}

window.onload = function() {
    document.getElementById("inputField").value = "2d20 + 2d10 v 10d4";
    submit();
}
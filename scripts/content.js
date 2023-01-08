
const body = $('body')

let hasTotalGradeDisplayed = body.text().includes("Final Calculated Grade");

/**
 * a prepended informational booth injected into the site
 * since it has not been added by the instructor
 */

let displayedGradeLabel; // the label of the displayed final grade to be edited
/*
 * Assign where points and weight are located in a professors mycourses layout
 */

let pointsIndex = -1;
let weightIndex = -1;
setIndexes();

if (!hasTotalGradeDisplayed) {
    // started the way to input final calculated grade if not already provided.
    const gradePageHeader = $('#d_page_title');
    const calculatedGradeHeader = $('<br><br><h2 class="dhdg_1 vui-heading-2">Final Calculated Grade</h2>');
    const weightAchievedLabel = $('<label id="ctl_3" class="d2l-label"><span>Weight Achieved</span></label>');
    const display = $('<h3 id="gradeDisplay">0 / 0</h3>')
    gradePageHeader.append(calculatedGradeHeader);
    gradePageHeader.append(weightAchievedLabel);
    gradePageHeader.append(display);
    displayedGradeLabel = $('#gradeDisplay')
    const headers = $('#z_a').children('tbody').first().find('tr.d_ggl1');
    lazyCalculate(headers);
} else {
    displayedGradeLabel = body.find('table.d_FG').children().children().last().children().children().
    first().children().first().children().find('label').last(); // a very ugly way of interacting with mycourses to get
                                                                // the label
}


/*
 * notes:
 * the whole grade table is under the table id of "z_h"
 * sub cats of the grades i.e labs, exams, etc under a tr of class d_ggl1
 * grade items are just under a tr with class d_gd
 */

/**
 * this is the main function of allowing and performing grade altering
 *
 */
body.click(function(event) {
    if(pointsIndex === -1 || weightIndex === -1) {
        setIndexes();
    }
    console.log(pointsIndex);
    console.log(weightIndex);
    const clicked = $(event.target);
    const text = clicked.text();

    if(clicked.is(displayedGradeLabel)) {
        return;
    }

    /*
        this would determine if it is a grade item in format of EARNED / WORTH (i.e 98 / 100)
        the length check is a very scuffed way of making sure that the user is not
        switching classes via the waffle icon.
    */
    if (text.includes("/")) {
        // console.log($($($(clicked.parent()).parent()).parent()).parent().closest('tr.d_ggl1'))
        // console.log(clicked.parents().closest('tr.d_ggl1').html());
        // console.log(clicked.parents('tr').parent().find('tr.d_ggl1')) // gets all headers

        //console.log(clicked.parents('tr').first().children().eq(3).find('label').last().text()); // wa
        //console.log(clicked.parents('tr').first().children().eq(2).find('label').last().text()); // pts

        /*
            its going to be an absolute bitch to determine which grade item goes under which header due to their scheme and
            /or the way that i'm doing this. im blaming them tho. anyways:
            some key things:
            calculate grade by iterating through every table item and adding worths and what not and effecting
            the last seen header (so changing the header after next header is seen, or if it stops then change last one)

            and then the easy step is to just get all headers and finding their values and then adding and boom final calc

            however the main headache is going to be determining which col is effected (points or weight achieved)
            and then changing the other one based on the new weight or point updated.
        */


        const args = text.split("/");
        const earned = args[0].trim();
        const worth = args[1].trim();
        const old = earned;
        const categories = clicked.parents('tr').parent().find('tr.d_ggl1');

        /*
         so for some courses when switching they have combined sections the format is
         TYPE123.12/25 I can avert the bug that I experienced by doing a quick parse and seeing if its NAN
        */

        let t = parseFloat(earned);
        if (isNaN(t)) {
            return;
        }

        let newGrade = null;
        let input = document.createElement("input");
        // this is a boolean to represent if a student is editing a full grade category instead of a single assignment.
        // categories (or interchangebly headers) have class d_ggl1 assigned to them.
        const isCategory = clicked.parents('tr').first().hasClass('d_ggl1');
        let dataIndex = clicked.parents('td').first().index(); // the index of which table item was impacted.
        input.style.height = "30px";
        input.style.width = "30px";
        input.onkeydown = function (event) {

            if(event.key === "Escape") {
                clicked.text(old + " / " + worth);
                return;
            }

            if(event.key === "Enter") {
                // if enter key
                newGrade = parseFloat(event.target.value);
                if(isNaN(newGrade)) {
                    // if input is invalid, return to already set grade
                    try {
                        input.remove();
                    } catch (e) {

                    }
                    clicked.text(earned + " / " + worth);
                } else {
                    try {
                        input.remove();
                    } catch (e) {

                    }

                    if(newGrade === null) {
                        clicked.text(earned + " / " + worth);
                    } else {
                        clicked.text(newGrade + " / " + worth);

                        // if weird bug occurs (not sure as to why this occurs. It seems very random.)
                        if (dataIndex < 0) {
                            dataIndex = clicked.prev().first().index() + 1;
                        }
                        // console.log(dataIndex);
                        if (isCategory) {
                            // changes a whole category, instead of a specific assignment. so can use lazy calculate
                            lazyCalculate(categories);
                            return;
                        }

                        if(dataIndex === pointsIndex) { // points column
                            // if the field changed is points col change calculate the est new weight
                            const weight = clicked.parents('tr').first().children().eq(weightIndex).find('label').last().text().split("/")[1];
                            let precision = 0; // set it to no decimal places default
                            // if the weight has a decimal in it then update the precision
                            if (weight.includes(".")) {
                                 precision = weight.split(".")[1].length; // # of decimals weight should round to
                            }
                            const percentage = newGrade / worth; // percentage of points effected.
                            const earnedWeight = (parseFloat(weight) * percentage).toFixed(precision); // weight earned

                            // wField = the text of the weight achieved
                            const wField = clicked.parents('tr').first().children().eq(weightIndex).find('label').last();
                            wField.text(earnedWeight + " / " + weight);

                        } else if (dataIndex === weightIndex) { // weight column

                            // to check if points column is used/displayed by the instructor. (this find will return 0)
                            // therefore not needing to run the following code.
                            const labelSearch = clicked.parents('tr').first().children().eq(pointsIndex).find('label');
                            if(labelSearch.length > 0) {
                                const maxPoints = clicked.parents('tr').first().children().eq(pointsIndex).find('label').last().text().split("/")[1];
                                const percentage = newGrade / worth; // percentage of points effected.
                                const earnedPoints = (parseFloat(maxPoints) * percentage).toFixed(2); // weight earned

                                // pointField = the text of the points earned
                                const pField = clicked.parents('tr').first().children().eq(pointsIndex).find('label').last();
                                pField.text(earnedPoints + " / " + maxPoints);
                            }
                        } else {
                            console.error("Severe error went wrong. Data index is " + dataIndex);
                        }
                        fullCalculate(clicked.parents('tbody').first(), categories);
                    }
                }
            }
        }

        input.onblur = function (event) {
            clicked.text(old + " / " + worth);
        }

        input.type = "text";
        input.placeholder = earned;
        clicked.text("   / " + worth);
        clicked.prepend(input);
        input.focus();
    }
});

/**
 * Function to lazily calculate a hypothetical grade based on when a person changes a FULL category total
 * Lazy calculation is completed by adding all current categories weights and changing the main display.
 * @param headers - a jquery list of the grade headers / categories within (i.e Exams, Labs, Homework)
 */
function lazyCalculate(headers) {
    // create and assign default earned and total values
    let earned = 0
    let total = 0;

    // loop through each header
    headers.each(function() {
        let categoryGrade = $(this).children().eq(weightIndex - 1);
        let cEarnedString = categoryGrade[0];
        let cWorthString = categoryGrade[1];
        let cEarned = parseFloat(cEarnedString);
        let cWorth = parseFloat(cWorthString);

        // if the grade header is not set
        if (cEarnedString === '-') {
            return false;
        }

        // weird bug where mycourses loads weird or something and the access to the label becomes misorganized.
        // leading things to go awry, and labels and info not being able to be found.
        // leads the values to be undefined and NaN to be outputted.
        // found a way thru console when bug happened to trace back and find the data.
        if(cEarned === undefined || isNaN(cEarned) || cWorth === undefined || isNaN(cWorth)) {
            // fix if something breaks for whichever reason
            let display = $(this).children().eq(weightIndex - 1).text();

            const data = display.split(" / ");
            cEarnedString = data[0];
            cWorthString = data[1];

            cEarned = parseFloat(cEarnedString);
            cWorth = parseFloat(cWorthString);
        }

        earned += cEarned; // add how much 'earned'
        total += cWorth; // add 'out of' points. (i.e what the category is worth)
    });
    const percent = ((earned / total) * 100).toFixed(2);
    displayedGradeLabel.text(earned.toFixed(2) + " / " + total.toFixed(2) + " (" + percent + "%)");
}

/**
 * A function that does the full complete calculation of a students based on changes of
 * assignment items.
 * @param tableBody - the table of grades in mycourses
 * @param categories - the list of assignment categories
 */
function fullCalculate(tableBody, categories) {
    //TODO add support for points column for full calculate in the headers (lazy can be ignored)
    //TODO add support for removing assignments (- assignment) (makes it empty & not calculated)

    let lastHeader = null;
    let earnedWeight = 0;
    let totalWeight = 0;
    let weightDisplayIndex = weightIndex - 1;
    tableBody.children().each(function() {
        if($(this).hasClass('d2l-table-row-first')) return;

        let isHeader = $(this).hasClass('d_ggl1'); // categories have class d_ggl1

        if (isHeader) {
            if(lastHeader === null) {
                lastHeader = $(this);
            } else {
                $(lastHeader).children().eq(weightDisplayIndex).text(earnedWeight.toFixed(2).toString() + " / " + totalWeight.toFixed(0).toString());
                earnedWeight = 0;
                totalWeight = 0;
                lastHeader = $(this);
            }
        } else {
            let display = $(this).children().eq(weightIndex).text();

            if(!display.includes("/")) {
                let worthSomething = !isNaN(parseFloat(display));
                if (worthSomething) {
                    // there was a case where extra credit was given through just adding points and not
                    // adding an assignment which caused bugs. this is to counter that.
                    earnedWeight += parseFloat(display);
                }

            } else {
                const data = display.split(" / ");

                let wEarnedString = data[0];
                let wWorthString = data[1];

                let dropped = false;
                if (wEarnedString.includes("Dropped") || wWorthString.includes("Dropped")) {
                    dropped = true;
                }

                let e = parseFloat(wEarnedString);
                let w = parseFloat(wWorthString);
                // only effect if it has been set and not dropped.
                if (wEarnedString !== '-' && !dropped) {
                    earnedWeight += e;
                    totalWeight += w;
                }
            }
        }
    });

    // last header wont be calculated in loop, so manually do it outside since last data will be populated in the variables.
    $(lastHeader).children().eq(weightDisplayIndex).text(earnedWeight.toFixed(2).toString() + " / " + totalWeight.toFixed(0).toString());

    // use lazy calculate to do the rest.
    lazyCalculate(categories);
}

/**
 * This sets the indexes of where points and weight are in the context
 * of table rows within the grade table data.
 *
 * this is ran one of two times (on site load) but if it runs before the table is loaded
 * it would cause indexes to not be set
 * so the next time is when someone clicks on the site, and it is then set.
 */
function setIndexes() {
    const gradeTableHeader = $('#z_h').find('tr.d2l-table-row-first').first();

    gradeTableHeader.children().each(function() {
        if($(this).text().includes("Points")) {
            pointsIndex = $(this).index() + 1; // add one due to having a "ghost" cell in row
        } else if ($(this).text().includes("Weight Achieved")) {
            weightIndex = $(this).index() + 1; // add one due to having a ghost cell in row.
        }
    });
}

const body = $('body')

let hasTotalGradeDisplayed = body.text().includes("Final Calculated Grade");
console.log(hasTotalGradeDisplayed)

/**
 * a prepended informational booth injected into the site
 * since it has not been added by the instructor
 */
if (!hasTotalGradeDisplayed) {
    // started the way to input final calculated grade if not already provided.
    const gradePageHeader = $('#d_page_title');
    const calculatedGradeHeader = $('<br><br><h2 class="dhdg_1 vui-heading-2">Final Calculated Grade</h2>');
    gradePageHeader.append(calculatedGradeHeader);
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
    const clicked = $(event.target);
    const text = clicked.text();

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
        // the reason why i i am checking specifically for tr.d_ggl1 is bc category tr's have d_ggl1 assigned to them.
        const isCategory = clicked.parents('tr.d_ggl1').length !== 0; // if > 0 (1) it is cat
        let dataIndex = clicked.parents('td').first().index(); // the index of which table item was impacted.
        // 2 = points & 3 = weight achieved

        input.style.height = "30px";
        input.style.width = "30px";
        input.onkeydown = function (event) {
            if(event.key === "Enter") {
                // if enter key
                newGrade = parseFloat(event.target.value);
                console.log(clicked.parents('td'));
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
                        if (dataIndex === -1) {
                            dataIndex = clicked.prev().first().index() + 1; // adding 1 bc the index is -1 of real val.
                        }

                        if (isCategory) {

                            return;
                        }

                        if(dataIndex === 2) { // points column
                            // if the field changed is points col change calculate the est new weight
                            const weight = clicked.parents('tr').first().children().eq(3).find('label').last().text().split("/")[1];
                            const precision = weight.split(".")[1].length; // # of decimals weight should round to
                            const percentage = newGrade / worth; // percentage of points effected.
                            const earnedWeight = (parseFloat(weight) * percentage).toFixed(precision); // weight earned

                            // wField = the text of the weight achieved
                            const wField = clicked.parents('tr').first().children().eq(3).find('label').last();
                            wField.text(earnedWeight + " / " + weight);

                        } else if (dataIndex === 3) { // weight column

                            // to check if points column is used/displayed by the instructor. (this find will return 0)
                            // therefore not needing to run the following code.
                            const labelSearch = clicked.parents('tr').first().children().eq(2).find('label');
                            if(labelSearch.length === 0) {
                                return;
                            }

                            const maxPoints = clicked.parents('tr').first().children().eq(2).find('label').last().text().split("/")[1];
                            const percentage = newGrade / worth; // percentage of points effected.
                            const earnedPoints = (parseFloat(maxPoints) * percentage).toFixed(2); // weight earned

                            // wField = the text of the weight achieved
                            const pField = clicked.parents('tr').first().children().eq(2).find('label').last();
                            pField.text(earnedPoints + " / " + maxPoints);
                        } else {
                            console.error("Severe error went wrong. Data index is " + dataIndex);
                        }

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

function lazyCalculate() {

}

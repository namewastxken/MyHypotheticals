
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
    let clicked = $(event.target);
    let text = clicked.text();

    /*
        this would determine if it is a grade item in format of EARNED / WORTH (i.e 98 / 100)
        the length check is a very scuffed way of making sure that the user is not
        switching classes via the waffle icon.
    */
    if (text.includes("/")) {
        // console.log($($($(clicked.parent()).parent()).parent()).parent().closest('tr.d_ggl1'))
        // console.log(clicked.parents().closest('tr.d_ggl1').html());
        console.log(clicked.parents('tr').parent().find('tr.d_ggl1')) // gets all headers
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

        var newGrade = null;
        var input = document.createElement("input");
        input.style.height = "30px";
        input.style.width = "30px";
        input.onkeydown = function (event) {
            if(event.key === "Enter") {
                // if enter key
                newGrade = parseFloat(event.target.value);
                if(isNaN(newGrade)) {
                    // if input is invalid, return to already set grade
                    input.remove();
                    clicked.text(earned + " / " + worth);
                    alert("You didn't input a valid grade. Replaced to old.");
                } else {
                    try {
                        input.remove();
                    } catch (e) {

                    }

                    if(newGrade === null) {
                        clicked.text(earned + " / " + worth);
                    } else {
                        clicked.text(newGrade + " / " + worth);

                    }
                }
            }
        }

        // event listener on when a person clicks away.
        // prevent clutter and other nastiness when clicking away.
        input.onblur = function (event) {
            // possible is the variable for the possible grade input that a student could've
            // inputted but not pressed "enter" to traditionally calculate.
            // as of right now think i should process
            var possible = event.target.value;
            if(possible === null || isNaN(possible) || possible === '') {
                input.remove();
                clicked.text(old + " / " + worth);
            } else {
                input.remove();
                clicked.text(newGrade + " / " + worth);
            }
        }
        input.type = "text";
        input.placeholder = earned;
        clicked.text("   / " + worth);
        clicked.prepend(input);
        input.focus();
    }
});
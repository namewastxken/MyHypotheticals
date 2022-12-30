
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

body.click(function(event) {
    let clicked = event.target;
    let text = jQuery(clicked).text();

    /*
        this would determine if it is a grade item in format of EARNED / WORTH (i.e 98 / 100)
        the length check is a very scuffed way of making sure that the user is not
        switching classes via the waffle icon.
    */
    if (text.includes("/")) {

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

        // var next = clicked.nextSibling;
        //
        // if(next.nodeType === Node.TEXT_NODE) {
        //     // is text?
        //     var nt = next.nodeValue;
        //     console.log(nt);
        // }

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
                    jQuery(clicked).text(earned + " / " + worth);
                    alert("You didn't input a valid grade. Replaced to old.");
                } else {
                    try {
                        input.remove();
                    } catch (e) {

                    }

                    if(newGrade === null) {
                        jQuery(clicked).text(earned + " / " + worth);
                    } else {
                        jQuery(clicked).text(newGrade + " / " + worth);

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
                jQuery(clicked).text(old + " / " + worth);
            } else {
                input.remove();
                jQuery(clicked).text(newGrade + " / " + worth);
            }
        }
        input.type = "text";
        input.placeholder = earned;
        jQuery(clicked).text("   / " + worth);
        clicked.prepend(input);
        input.focus();
    }
});

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
    console.log(gradePageHeader);

    const calculatedGradeHeader = $('<br><br><h2 class="dhdg_1 vui-heading-2">Final Calculated Grade</h2>');
    gradePageHeader.append(calculatedGradeHeader);

    console.log("prepended?");
}

body.click(function(event) {
    let clicked = event.target;
    let text = jQuery(clicked).text();

    /*
        this would determine if it is a grade item in format of EARNED / WORTH (i.e 98 / 100)
        the length check is a very scuffed way of making sure that the user is not
        switching classes via the waffle icon.
    */
    if (text.includes("/") && text.length <= 12) {

        const args = text.split("/");
        const earned = args[0].trim();
        const worth = args[1].trim();

        let newGrade = prompt("What points would you like to have on this?");

        if(newGrade == null) {
            return;
        }
        newGrade = Number.parseFloat(newGrade)
        if(isNaN(newGrade)) {
            alert("Improper input! Please insert a numerical value.");
        } else {
            jQuery(clicked).text(newGrade + " / " + worth);
        }
    }
});
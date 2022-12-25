$('body').click(function(event) {
    let log = $('#log');
    let clicked = event.target;
    let text = jQuery(clicked).text();

    /*
        this would determine if it is a grade item in format of EARNED / WORTH (i.e 98 / 100)
        the length check is a very scuffed way of making sure that the user is not
        switching classes via the waffle icon.
    */
    if (text.includes("/") && text.length <= 12) {

        const args = text.split("/");
        var earned = args[0].trim();
        var worth = args[1].trim();
        console.log("earned: " + earned);
        console.log("worth: " + worth);
        var newGrade = prompt("What points would you like to have on this?");

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
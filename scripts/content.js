$('body').click(function(event) {
    var log = $('#log');
    var clicked = event.target;
    var text = jQuery(clicked).text();

    // this would determine if it is a grade item in format of EARNED / WORTH (i.e 98 / 100)
    if (text.includes("/")) {
        const args = text.split("/");
        var earned = args[0].trim();
        var worth = args[1].trim();
        console.log("earned: " + earned);
        console.log("worth: " + worth);
    }
});


$( document ).ready(function() {
    console.log( "ready!" );
    sidenav();
});

function sidenav() {

    var acc = document.getElementsByClassName("parent-sidenav");
    var i;
    console.log (acc.length)
    for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {

        //close all others
        var prev_active = document.getElementsByClassName("active-sidenav");

        console.log (prev_active.length)

        if ( prev_active.length > 0 && this !== prev_active[0]) {

            prev_panel = prev_active[0].nextElementSibling;
            prev_panel.style.display = "none"
            prev_active[0].classList.remove("active-sidenav");

        }

        this.classList.toggle("active-sidenav");

        var panel = this.nextElementSibling;
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    });}

}


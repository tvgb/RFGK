//Adding options to the selector for choosing a player for a new round
function readyPlayers(players) {
    players.forEach(function (player) {
        let option = document.createElement('option');
        option.setAttribute('id', 'player_' + player.id);
        option.appendChild(document.createTextNode(player.first_name + " " + player.last_name));
        $("#selectPlayer").append(option);
    });
}
getPlayers(readyPlayers);

//Adding options to the selector for choosing a course for a new round
function readyCourses(courses) {
    courses.forEach(function (course) {
        let option = document.createElement('option');
        option.setAttribute('id', 'course_' + course.id + '_' + course.par);
        option.appendChild(document.createTextNode(course.name));
        $("#selectCourse").append(option);
    });
}
getCourses(readyCourses);


//Adds todays date to the date input as default
$("#roundDate").val(getTodaysDate());


// Plus and minus buttons for the sum input field
$("#plusSpan").click(function () {
    $("#roundSum").val(parseInt($("#roundSum").val()) + 1)
});
$("#minusSpan").click(function () {
    $("#roundSum").val(parseInt($("#roundSum").val()) - 1)
});

//Action is being run when the user has added something to all the fields and submits
$("#addRoundButton").click(function () {
    const player_id = $("#selectPlayer").children(":selected").attr('id').split('_')[1];
    const course_id = $("#selectCourse").children(":selected").attr('id').split('_')[1];
    const date = $("#roundDate").val();
    const number_of_throws = parseInt($("#roundSum").val()) + parseInt($("#selectCourse").children(":selected").attr('id').split('_')[2]);

    addRound(addRoundResponse, player_id, course_id, date, number_of_throws, window.sessionStorage.getItem('token'));
});


//The response that the addRounds function returns. Shows an alert if everything is ok!
function addRoundResponse(data) {
    if (data.status === "true") {
        $("#newRoundAddedAlert").show();
        $("#newRoundAddedAlert").fadeTo(2000, 500).fadeOut(500, function(){
            $("#success-alert").fadeOut(500);
        });

        $("#roundSum").val(0);
    }
}


function getTodaysDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1; //January is 0!
    let yyyy = today.getFullYear();
    if(dd<10) {dd = '0'+dd}
    if(mm<10) {mm = '0'+mm}
    today =  dd + '-' + mm + '-' + yyyy;
    return today;
}
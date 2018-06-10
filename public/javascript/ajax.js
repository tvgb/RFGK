function getPlayers(func) {
    axios.get('/players')
        .then(function (response) {
            func(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getPlayer(func, player_id) {
    axios.get('/player/'+player_id)
        .then(function (response) {
            func(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getRounds(func, course_id) {
    /*
    axios.get('/rounds/'+course_id)
        .then(function (response) {
            func(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
    */

    $.ajax({
        method: "GET",
        url: "/rounds/" + course_id,
    })
        .done(function(response) {
            console.log(response);
            func(response);
        });
}

function getLeaderboard(func, course_id) {
    axios.get('/leaderboard/' + course_id)
        .then(function (response) {
            func(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}
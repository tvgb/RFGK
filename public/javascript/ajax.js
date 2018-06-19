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
    axios.get('/players/'+player_id)
        .then(function (response) {
            func(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getCourses(func) {
    axios.get('/courses')
        .then(function (response) {
            func(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getRounds(func, course_id) {
    axios.get('/rounds/'+course_id)
        .then(function (response) {
            func(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getTop10Rounds(func, course_id) {
    axios.get('/rounds/top10/'+course_id)
        .then(function (response) {
            func(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getLeaderboard(func, course_id) {
    axios.get('players/leaderboard/' + course_id)
        .then(function (response) {
            func(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function login(func, email, password) {
    axios.post('/players/login', {
        email: email,
        password: password
    })
        .then(function (response) {
            func(response.data);
        })
        .catch(function (error) {
            return null;
        });
}

function addRound(func, player_id, course_id, date, number_of_throws, token) {
    axios.post('/rounds', {
        player_id: player_id,
        course_id: course_id,
        date: date,
        number_of_throws: number_of_throws,
        token: token
    })
        .then(function (response) {
            func(response.data);
        })
        .catch(function (error) {
            return null;
        });
}

function validateToken(func, token) {
    axios.get('players/validatetoken', {
        token: window.localStorage.token
    })
        .then(function (response) {
            func(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}
function addToTable(players) {

    let tbody = document.getElementById('leaderboardtbody');
    let trArray = [];
    let pos = 0;

    players.forEach(function (player) {

        let tdArray = [];

        for (i = 0; i < 7; i++) {
            let td = document.createElement('td');
            tdArray.push(td);
        }

        pos++;
        tdArray[0].appendChild(document.createTextNode(pos + '.'));
        tdArray[1].appendChild(document.createTextNode(player.first_name));
        tdArray[2].appendChild(document.createTextNode(player.last_name));
        tdArray[3].appendChild(document.createTextNode(player.name));
        tdArray[4].appendChild(document.createTextNode(player.par));
        tdArray[5].appendChild(document.createTextNode(player.avg));

        if (player.avg - player.par >= 0) {
            console.log("FAEN");
            tdArray[6].appendChild(document.createTextNode('+' + (player.avg - player.par)));
        } else {
            tdArray[6].appendChild(document.createTextNode(player.avg - player.par));
        }

        let tr = document.createElement('tr');

        tdArray.forEach(function (td) {
            tr.appendChild(td)
        });

        trArray.push(tr);
    });

    trArray.forEach(function (tr) {
        tbody.appendChild(tr);
    });

}

getLeaderboard(addToTable, 1);
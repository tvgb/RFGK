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
        tdArray[5].appendChild(document.createTextNode(Math.round(player.avg * 10) / 10));

        //Hiding first name, course name and average number of throws on mobile.
        tdArray[1].classList.add('hide-on-mobile');
        tdArray[3].classList.add('hide-on-mobile');
        tdArray[5].classList.add('hide-on-mobile');


        let sum = Math.round((player.avg - player.par) * 10) / 10;
        if (player.avg - player.par >= 0) {
            tdArray[6].appendChild(document.createTextNode('+' + (sum)));
        } else {
            tdArray[6].appendChild(document.createTextNode(sum));
        }

        let tr = document.createElement('tr');

        tdArray.forEach(function (td) {
            tr.appendChild(td)
        });

        //TO SET COLORS TO THE TABLE ROWS
        let red = 255;
        let green = 193;
        let blue = 111;
        let alpha = 0.4;

        if (sum < 6) {
            red = 109;
            green = 202;
            blue = 109;

            red += (sum - 5) * 15;
            blue += (sum - 5) * 15;
            green += (sum - 5) * 15;

        } else if (sum > 6) {
            red = 255;
            green = 193;
            blue = 111;

            green -= (sum - 6) * 20;
            blue -= (sum - 6) * 20;

            alpha += (sum - 6) * 0.01;
            console.log(sum, red, green, blue, alpha)
        }

        tr.style.backgroundColor = 'rgba('+red+', '+green+', '+blue+', '+alpha+')';

        trArray.push(tr);
    });

    trArray.forEach(function (tr) {
        tbody.appendChild(tr);
    });

}

getLeaderboard(addToTable, 1);
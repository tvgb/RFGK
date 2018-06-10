function addToTable(rounds) {

    let tbody = document.getElementById('top10Roundstbody');
    let trArray = [];

    rounds.forEach(function (round) {
        let tdArray = [];

        for (i = 0; i < 7; i++) {
            let td = document.createElement('td');
            tdArray.push(td);
        }

        tdArray[0].appendChild(document.createTextNode(round.first_name));
        tdArray[1].appendChild(document.createTextNode(round.last_name));
        tdArray[2].appendChild(document.createTextNode(round.name));
        tdArray[3].appendChild(document.createTextNode(round.date.substring(0, 10)));
        tdArray[4].appendChild(document.createTextNode(round.par));
        tdArray[5].appendChild(document.createTextNode(round.number_of_throws));

        if (round.number_of_throws - round.par >= 0) {
            console.log("FAEN");
            tdArray[6].appendChild(document.createTextNode('+' + (round.number_of_throws - round.par)));
        } else {
            tdArray[6].appendChild(document.createTextNode(round.number_of_throws - round.par));
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

getRounds(addToTable, 1);
function addToTable(rounds) {

    let tbody = document.getElementById('top10Roundstbody');
    let trArray = [];
    let pos = 0;

    rounds.forEach(function (round) {
        let tdArray = [];

        for (i = 0; i < 8; i++) {
            let td = document.createElement('td');
            tdArray.push(td);
        }

        pos++;
        tdArray[0].appendChild(document.createTextNode(pos + '.'));
        tdArray[1].appendChild(document.createTextNode(round.first_name));
        tdArray[2].appendChild(document.createTextNode(round.last_name));
        tdArray[3].appendChild(document.createTextNode(round.name));
        tdArray[4].appendChild(document.createTextNode(round.date.substring(0, 10)));
        tdArray[5].appendChild(document.createTextNode(round.par));
        tdArray[6].appendChild(document.createTextNode(round.number_of_throws));

        let sum = round.number_of_throws - round.par;

        if (sum>= 0) {
            tdArray[7].appendChild(document.createTextNode('+' + (sum)));
        } else {
            tdArray[7].appendChild(document.createTextNode(sum));
        }

        let tr = document.createElement('tr');

        tdArray.forEach(function (td) {
           tr.appendChild(td)
        });

        //TO SET COLORS TO THE TABLE ROWS
        let red = 255;
        let green = 211;
        let blue = 50;

        if (sum > 0) {
            green -= sum * 10;
        } else if (sum < 0) {
            red += sum * 20;
        }
        tr.style.backgroundColor = 'rgba('+red+', '+green+', '+blue+', 0.2)';
        trArray.push(tr);
    });

    trArray.forEach(function (tr) {
        tbody.appendChild(tr);
    });

}

getRounds(addToTable, 1);
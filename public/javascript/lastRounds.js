function addToTable(rounds) {

    let tbody = document.getElementById('roundstbody');
    let trArray = [];
    let pos = 0;

    rounds.forEach(function (round) {
        let tdArray = [];

        for (i = 0; i < 7; i++) {
            let td = document.createElement('td');
            tdArray.push(td);
        }

        pos++;
        tdArray[0].appendChild(document.createTextNode(round.first_name));
        tdArray[1].appendChild(document.createTextNode(round.last_name));
        tdArray[2].appendChild(document.createTextNode(round.name));
        tdArray[3].appendChild(document.createTextNode(appendDate(round.date)));
        tdArray[4].appendChild(document.createTextNode(round.par));
        tdArray[5].appendChild(document.createTextNode(round.number_of_throws));


        //Hiding first name, course name, date and number of throws on mobile.
        tdArray[0].classList.add('hide-on-mobile');
        tdArray[2].classList.add('hide-on-mobile');
        tdArray[5].classList.add('hide-on-mobile');


        let sum = round.number_of_throws - round.par;

        if (sum>= 0) {
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
        let green = 255;
        let blue = 61;
        let alpha = 0.1;

        if (sum > 0) {
            green -= sum * 15;
            alpha += sum * 0.02;
        } else if (sum < 0) {
            red = 50;
            alpha -= sum * 0.08;
        }

        tr.style.backgroundColor = 'rgba('+red+', '+green+', '+blue+', '+alpha+')';
        trArray.push(tr);
    });

    trArray.forEach(function (tr) {
        tbody.appendChild(tr);
    });

}

getRounds(addToTable, 1);


//Used to gives dates names like "one day ago" and "one week ago" instead of just a date
function appendDate(date) {
    let daysSinceArray = ['I dag', 'I går', '2 dager siden',
        '3 dager siden', '4 dager siden',
        '5 dager siden', '6 dager siden', '1 uke siden'];

    let oneDay = 24*60*60*1000; // hours * minutes * seconds * milliseconds
    let firstDate = date.split("-");
    firstDate = new Date(firstDate[2], firstDate[1] - 1, firstDate[0]);
    let secondDate = getTodaysDate().split("-");
    secondDate = new Date(secondDate[2], secondDate[1] - 1, secondDate[0]);
    let diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));

    if (diffDays <= 7) {
        return daysSinceArray[diffDays];
    } else {
        return date;
    }
}

function getTodaysDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1; //January is 0!
    let yyyy = today.getFullYear();
    if(dd<10) {dd = '0'+dd}
    if(mm<10) {mm = '0'+mm}
    today = dd + '-' + mm + '-' + yyyy;

    return today;
}
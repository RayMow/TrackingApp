
//js
function runOnLoad() {
    console.info("Function: runOnLoad");
    onLoadBlank();
    accountNumber = getAccountNumber();
    mode = "order"
    results = [];
    quietLoadOn = false;
    updateCount = 0;
    var orderInput = document.getElementById("orderNo");
    var conInput = document.getElementById("conNo");
    var rtnInput = document.getElementById("rtnNo");
    var output = document.getElementById("output");

    orderInput.addEventListener("keydown", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("retrieveButton").click();
        }
    });
    conInput.addEventListener("keydown", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("retrieveButton").click();
        }
    });
    rtnInput.addEventListener("keydown", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("retrieveButton").click();
        }
    });


    //load pinned items
    if (typeof (Storage) !== "undefined") {
        if (localStorage.getItem("PinnedPods")) {

            //Storage item exists
            var pinList = localStorage.getItem("PinnedPods");
            //Convert to array
            var pinArray = pinList.split(",");
            //progLimit = (pinArray.length) * 2
            progBarIncrement = 100 / pinArray.length;

            for (i = 0; i < pinArray.length; i++) {
                var pinId = pinArray[i].split("|");
                refreshMe(pinId[0]);
            }
        } else {
            off();
        }
        if (localStorage.getItem("futurePins")) {
            var pinList = localStorage.getItem("futurePins");
            var pinArray = pinList.split(",");
            for (i = 0; i < pinArray.length; i++) {
                var pinId = pinArray[i].split("|");
                loadFuturePin(pinId[0], pinId[1]);
            }
        }
    }
    //Show number of pinned items in statbar
    updatePinStatus();
    //autocomplete
    //order
    if (localStorage.getItem("orderHistory")) {
        var orderHist = localStorage.getItem("orderHistory");
        autocomplete(document.getElementById("orderNo"), orderHist);
    }
    //Consignment
    if (localStorage.getItem("conHistory")) {
        var conHist = localStorage.getItem("conHistory");
        autocomplete(document.getElementById("conNo"), conHist);
    }
    //Return
    if (localStorage.getItem("rtnHistory")) {
        var rtnHist = localStorage.getItem("rtnHistory");
        autocomplete(document.getElementById("rtnNo"), rtnHist);
    }

    //For Sorting function
    pageLoad = true
    //setTimeout(function () { sortGroups() }, 5000);
    //quietLoad 
    if (localStorage.getItem("quietLoad")) {
        if (localStorage.getItem("quietLoad") == "true") {
            switchQuietLoad();
        }
    }
}


//Sort by Due Date
function sortGroups() {
    //So it only runs on load...
    if (pageLoad) {
        var groupList = document.getElementById("output");
        var switching = true;
        /* Make a loop that will continue until
        no switching has been done: */
        while (switching) {
            // start by saying: no switching is done:
            switching = false;
            var podGroups = groupList.getElementsByClassName("podGroup");
            // Loop through all list-items:
            for (i = 0; i < (podGroups.length - 1); i++) {
                // start by saying there should be no switching:
                var shouldSwitch = false;
                /* check if the next item should
                switch place with the current item: */
                var currentNum = podGroups[i].getElementsByClassName("sortCode")[0].innerHTML;
                var nextNum = podGroups[i + 1].getElementsByClassName("sortCode")[0].innerHTML;
                //alert("currentNum = " + currentNum + " nextNum = " + nextNum);
                if (currentNum < nextNum) {
                    /* if next item is numerically
                    lower than current item, mark as a switch
                    and break the loop: */
                    shouldSwitch = true;
                    break;
                }
            }
            if (shouldSwitch) {
                /* If a switch has been marked, make the switch
                and mark the switch as done: */
                podGroups[i].parentNode.insertBefore(podGroups[i + 1], podGroups[i]);
                switching = true;
            }
        }
    }
    pageLoad = false;
    //checkForUpdates();
}

function checkForUpdates() {
    console.info("Function: checkForUpdates");
    //adds border if recently updated
    var groupList = document.getElementById("output");
    var podGroups = groupList.getElementsByClassName("podGroup");
    //check if updated...
    if (typeof (Storage) !== "undefined") {
        if (localStorage.getItem("PinnedPods")) {
            var pinList = localStorage.getItem("PinnedPods");
            var pinArray = pinList.split(",");
            for (i = 0; i < (podGroups.length - 1); i++) {
                var podId = podGroups[i].id
                for (i = 0; i < pinArray.length; i++) {
                    var pinData = pinArray[i].split("|");
                    var pinId = pinData[0];
                    //Storage item exists
                    if (pinId === podId) {
                        var previousLength = pinData[3];
                        var currentLength = document.getElementById(podId).innerHTML.length;
                        if (previousLength != currentLength) {
                            console.info("For " + pinId + " previous: " + previousLength + " current: " + currentLength);
                            document.getElementById(podId).style.borderColor = "blue";
                            saveComment(podId);
                        } else {
                            document.getElementById(podId).style.borderColor = "#d7d7d7";
                        }
                    }
                }
            }
        }
    }
}

//Check for updates...
function switchQuietLoad() {
    if (quietLoadOn) {
        //Switch off
        window.clearInterval(quietLoader);
        quietLoadOn = false;
        document.getElementById("quietLoadButton").style.backgroundColor = "rgba(255, 255, 255, 0.7)";
        document.getElementById("quietLoadButton").innerText = "QuietLoad Off";
        console.log("Quiet Load off.");
        localStorage.setItem("quietLoad", false);

    } else {
        //Switch on
        quietLoad();
        quietLoader = window.setInterval(quietLoad, 50000);
        quietLoadOn = true;
        document.getElementById("quietLoadButton").style.backgroundColor = "rgba(154, 205, 50, 0.5)";
        document.getElementById("quietLoadButton").innerText = "QuietLoad On";
        console.log("Quiet Load on.");
        document.getElementById("quietLoadButton").style.animation = "quietLoading 5s ease";
        localStorage.setItem("quietLoad", true);

    }

}
//Check for updates in the background
function quietLoad() {
    //Restrict to work hours
    var nowTime = new Date().getHours();
    if (nowTime > 7 && nowTime < 17) {
        console.warn("QuietLoading...");
        //load pinned items
        if (typeof (Storage) !== "undefined") {
            if (localStorage.getItem("PinnedPods")) {

                //Storage item exists
                var pinList = localStorage.getItem("PinnedPods");
                //Convert to array
                var pinArray = pinList.split(",");

                for (i = 0; i < pinArray.length; i++) {
                    var pinId = pinArray[i].split("|");
                    var orderUrl = "https://www.tnt.com/api/v3/shipment?con=" + pinId[0] + "&searchType=CON"
                    jsonRetrieve(orderUrl, quietCheckForUpdates);
                }
            }

            // if (localStorage.getItem("futurePins")) {
            // 	var pinList = localStorage.getItem("futurePins");
            // 	var pinArray = pinList.split(",");
            // 	for (i = 0; i < pinArray.length; i++) {
            // 		var pinId = pinArray[i].split("|");
            // 		loadFuturePin(pinId[0], pinId[1]);
            // 	}
            // }
        }
    }
}

function getAccountNumber() {
    console.info("Function: getAccountNumber");

    // TNT Account Number
    if (typeof (Storage) !== "undefined") {
        //check for existing value
        if (localStorage.getItem("TNTAccountNumber")) {
            //Value exists..
            var accountNum = localStorage.getItem("TNTAccountNumber");
        } else {
            var accountNum = prompt("Enter TNT Account Number", "0005375762");
            if (accountNum !== null) {
                //Save in Local Storage
                localStorage.setItem("TNTAccountNumber", accountNum);
            }
        }
    } else {
        var accountNum = prompt("Enter TNT Account Number", "0005375762");
        console.info("Sorry, your browser does not support web storage...");
    }
    document.getElementById("accountNo").innerHTML = "Account: " + accountNum
    return accountNum
}

function setAccountNum() {
    console.info("Function: setAccountNum");

    var currentNum = localStorage.getItem("TNTAccountNumber");
    var newAccountNum = prompt("Enter TNT Account Number", currentNum);
    if (newAccountNum !== null) {
        //Save in Local Storage
        localStorage.setItem("TNTAccountNumber", newAccountNum);
        accountNumber = newAccountNum;
        document.getElementById("accountNo").innerHTML = "Account: " + accountNumber
    }
}

function addBadge(count) {
    //Add number in place of Favicon to show updates

    var favicon = document.getElementById('favicon');
    var faviconSize = 16;

    var canvas = document.createElement('canvas');
    canvas.width = faviconSize;
    canvas.height = faviconSize;
    var context = canvas.getContext('2d');

    // Draw Notification Circle
    context.beginPath();
    context.arc(faviconSize / 2, faviconSize / 2, faviconSize / 2, 0, 2 * Math.PI);
    context.fillStyle = '#FF0000';
    context.fill();

    // Draw Notification Number
    context.font = 'bold 10px "helvetica", sans-serif';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = '#FFFFFF';
    context.fillText(count, faviconSize / 2, faviconSize / 2);

    // Replace favicon
    favicon.href = canvas.toDataURL('image/png');

};


function quietCheckForUpdates(orderObj) {

    try {

        //Detect Multiple
        var conLength = orderObj["tracker.output"].consignment.length;

        var conNum = orderObj["tracker.output"].consignment[0].consignmentNumber.slice(0, 8);


        for (i = 0; i < conLength; i++) {
            //get order Details
            var conNumber = orderObj["tracker.output"].consignment[i].consignmentNumber.slice(0, 8);

            var custRef = orderObj["tracker.output"].consignment[i].customerReference;

            var conKey = orderObj["tracker.output"].consignment[i].consignmentKey;
            var shipId = orderObj["tracker.output"].consignment[i].shipmentId;


            //Check if events exist
            if (orderObj["tracker.output"].consignment[i].events[0] !== undefined) {
                //DATE
                var podate = orderObj["tracker.output"].consignment[i].events[0].date;
                var dte = new Date(podate);
                var newPodTime = new Date(podate).getTime();
                var podstatus = orderObj["tracker.output"].consignment[i].events[0].statusDescription;
            } else {
                var newPodTime = 0;
            }

            //assembleUrl
            var podLoc = "https://www.tnt.com/api/v1/shipment/confidentialDetails?conNumber=" + conNumber + "&consignmentKey=" + conKey + "&securityQuestionType=accountNumber&securityQuestionValue=" + accountNumber + "&shipmentId=" + shipId

            //Find existing consignment:
            for (let i = 0; i < results.length; i++) {
                var thisCon = results[i];
                if (thisCon.consignment === conNum) {
                    console.log("consignment " + conNum + " Found...");
                    for (let i = 0; i < thisCon.pods.length; i++) {
                        var thisPod = thisCon.pods[i];
                        console.log(thisPod.shpid + " = " + shipId);
                        if (thisPod.shpid === shipId) {
                            console.log("Pod " + shipId + " Found...");
                            //Got it, now check for an update...
                            console.log(thisPod.pdTime + " = " + newPodTime);
                            if (thisPod.pdTime !== newPodTime) {

                                //if (thisPod.pdTime !== undefined && newPodTime !== null) {

                                //alert("Update found for " + thisPod.consignment);
                                console.warn("Update found for " + thisPod.consignment);

                                updateCount++
                                addBadge(updateCount);

                                new Notification("Update found for " + conNumber, {
                                    body: getTimeReadable(dte) + " " + podstatus,
                                    icon: "https://www.communityplaythings.co.uk/images/favicon/favicon32x32.png",
                                });


                                //remove old object from results:
                                //delete results[i];
                                //Update
                                thisPod.pdTime = newPodTime;

                                refreshMe(conNum);


                                document.getElementById(conNum).style.borderColor = "blue";
                                //}
                            }
                        }

                    }
                }
            }

        }



    } catch (e) {
        //nothing
    }


}



function retrievePOD(orderObj) {
    console.info("Function: retrievePOD - orderObj = " + orderObj);

    try {
        //Create object
        let pdGrp = new Object();
        pdGrp.pods = [];


        //Detect Multiple
        var conLength = orderObj["tracker.output"].consignment.length;

        var conNum = orderObj["tracker.output"].consignment[0].consignmentNumber.slice(0, 8);
        pdGrp.consignment = conNum;
        var podDataComment = "<small>" + getDateTime(new Date()) + " Consignment " + conNum + " returned " + conLength + " records</small>"
        var tntUrl = "https://www.tnt.com/express/en_gb/site/shipping-tools/tracking.html?searchType=con&cons=" + conNum;
        var cslUrl = "https://web.carousel.eu/easyweb/default.asp?action=webtrack&trackNumber=" + conNum;
        //Check if group is already existing...
        if (document.getElementById(conNum)) {
            statBar('pod group exists...');
            //Clear exising pods
            document.getElementById(conNum).innerHTML = "<div class='sortCode'></div><div class='commentContainer'><textarea class='comment' id='" + conNum + "comment' onchange='saveComment(this.parentElement.parentElement.id)'>(Comment)</textarea></div><span id='" + conNum + "pin' class='pin' onclick='pinMe(this)' style=''>&#128204;</span><span class='controlBtn' onclick='closeMe(this)' style='position: absolute;top: 8px; right: 16px;'>&times;</span>" + podDataComment + "</br></br>Track with <a href='" + tntUrl + "' target='blank'> <img src='https://www.tnt.com/__images/favicon.ico' alt='TNT' ></a>    <a href='" + cslUrl + "' target='blank'> <img src='https://www.carousel.eu/favicon.ico' alt='CSL'style='height: 16px;' ></a>"
            //location.href = "#" + conNum;
            //Promote to top
            document.getElementById('output').insertBefore(document.getElementById(conNum), document.getElementById('output').firstElementChild);
        } else {
            //add podGroup
            var existing = document.getElementById("output").innerHTML;
            var podgrp = "<div class='podGroup' id='" + conNum + "' onClick=this.style.borderColor='#d7d7d7'><div class='sortCode'></div><div class='commentContainer'><textarea class='comment' id='" + conNum + "comment' onchange='saveComment(this.parentElement.parentElement.id)'>(Comment)</textarea></div><span id='" + conNum + "pin' class='pin' onclick='pinMe(this)' style=''>&#128204;</span><span class='controlBtn' onclick='closeMe(this)' style='position: absolute;top: 8px; right: 16px;'>&times;</span>" + podDataComment + "</br></br>Track with <a href='" + tntUrl + "' target='blank'> <img src='https://www.tnt.com/__images/favicon.ico' alt='TNT' ></a>    <a href='" + cslUrl + "' target='blank'> <img src='https://www.carousel.eu/favicon.ico' alt='CSL' style='height: 16px;'></a></div>" + existing
            document.getElementById("output").innerHTML = podgrp;
        }

        for (i = 0; i < conLength; i++) {
            var pd = new Object();

            //get order Details
            var conNumber = orderObj["tracker.output"].consignment[i].consignmentNumber.slice(0, 8);
            pd.consignment = conNumber;
            statBar("Order Record Found - Consignment: " + conNumber + " , retrieving POD...");
            var custRef = orderObj["tracker.output"].consignment[i].customerReference;
            pd.ref = custRef;
            var conKey = orderObj["tracker.output"].consignment[i].consignmentKey;
            console.info("conKey: " + conKey);
            var shipId = orderObj["tracker.output"].consignment[i].shipmentId;
            console.info("shipId: " + shipId);
            pd.shpid = shipId;
            //alert("con "+i+" of "+conLength+" shipId: "+shipId);
            var Addr = orderObj["tracker.output"].consignment[i].destinationAddress.city;
            console.info("Addr: " + Addr);
            var dTime = orderObj["tracker.output"].consignment[i].destinationDate;
            var destTime = getTimeReadable(dTime);
            var fromAddr = orderObj["tracker.output"].consignment[i].originAddress.city;
            console.info("fromAddr: " + fromAddr);
            var startDate = orderObj["tracker.output"].consignment[i].originDate;
            console.info("startDate: " + startDate);
            var delivered = orderObj["tracker.output"].consignment[i].status.isDelivered;
            console.info("delivered: " + delivered);
            //Check if events exist
            if (orderObj["tracker.output"].consignment[i].events[0] !== undefined) {
                //DATE
                var podate = orderObj["tracker.output"].consignment[i].events[0].date;
                pd.pdTime = new Date(podate).getTime();
                var dte = new Date(podate);
                var sortcode = Date.parse(dte);
                var startDte = new Date(startDate);
                var dateDiff = ((dte - startDte) / 86400000).toFixed(0);
                console.info("dateDiff: " + dateDiff);
                var podDate = "<span style='color:" + colorDate(podate) + ";'>" + getDateTime(podate) + "</span>";

                console.log("podDate: " + podDate);
                var podstatus = orderObj["tracker.output"].consignment[i].events[0].statusDescription;
                console.info("podstatus: " + podstatus);
                pd.pdStatus = podstatus;
                //log
                var logStatus = "<p class='status'>" + podDate + " " + podstatus + "</p>"
            } else {
                pd.pdTime = 0;
                pd.pdStatus = "No tracking events found.";
                var logStatus = "<p class='status'>No tracking events found.</p>"
                var sortcode = 99999999;
            }

            var logComment = dateDiff + " days in transit to " + Addr + " by " + destTime
            var logData = [logStatus, custRef, conNumber, logComment, delivered, shipId, sortcode]
            //assembleUrl
            var podLoc = "https://www.tnt.com/api/v1/shipment/confidentialDetails?conNumber=" + conNumber + "&consignmentKey=" + conKey + "&securityQuestionType=accountNumber&securityQuestionValue=" + accountNumber + "&shipmentId=" + shipId
            // add to group object

            pdGrp.pods.push(pd);

            try {


                //RetrievePOD
                openPOD(logData);
                jsonRetrieve(podLoc, openPODImage, logData);
            } catch (e) {
                openPOD(logData);
            }

        }
        results.push(pdGrp);
        //console.warn(results);
        showPinned(conNum);

    } catch (e) {
        statBar("Insufficient data to retrieve POD: Consignment:" + conNumber + " Customer Ref:" + custRef + " Key:" + conKey + " Shipment Id:" + shipId, true);
        enableDisableControls();
        //redBorder();
    }
}


//from page onload
function loadFuturePin(uinput, commentText) {
    var existing = document.getElementById("output").innerHTML;
    var cslUrl = "https://web.carousel.eu/easyweb/default.asp?action=webtrack&trackNumber=" + uinput;
    var futurePin = "<div class='futurePin' id='" + uinput + "' onload='futurePinLoad(" + uinput + ")'><b>" + uinput +
        "</b><span class='controlBtn' onclick='unFuturePin(this)' style='position: absolute;top: 8px; right: 16px;'>&times;</span><textarea class='comment' id='" +
        uinput + "comment' onchange='saveFutureComment(this.parentElement.id)'>" + commentText + "</textarea><a href='" +
        cslUrl + "' target='blank' style='text-decoration:none;'> <img src='https://www.carousel.eu/favicon.ico' alt='CSL' style='height: 16px;'></a></div>" + existing;

    document.getElementById("output").innerHTML = futurePin;
    //See if records exist...
    var orderUrl = "https://www.tnt.com/api/v3/shipment?ref=" + uinput + "&searchType=REF"
    jsonRetrieve(orderUrl, testForRecords, uinput);
}

function futurePin(uinput) {

    //add futurePin
    var existing = document.getElementById("output").innerHTML;
    var commentText = getDateTime(new Date());
    var futurePin = "<div class='futurePin' id='" + uinput + "' onload='futurePinLoad(" + uinput + ")'><b>" + uinput +
        "</b><span class='controlBtn' onclick='unFuturePin(this)' style='position: absolute;top: 8px; right: 16px;'>&times;</span><textarea class='comment' id='" +
        uinput + "comment' onchange='saveFutureComment(this.parentElement.id)'>" + commentText + "</textarea></div>" + existing;

    document.getElementById("output").innerHTML = futurePin;


    //Pin it
    if (localStorage.getItem("futurePins")) {
        //Storage item exists
        var pinList = localStorage.getItem("futurePins");
        //Convert to array
        var pinArray = [pinList];
        if (pinArray.includes(uinput)) {
        } else {
            //Add id to Array
            pinArray.push(uinput + "|" + commentText);
        }

    } else {
        //Storage item does not exist
        var pinArray = [];
        pinArray.push(uinput + "|" + commentText);
    }
    localStorage.setItem("futurePins", pinArray);
}

function futurePinLoad(uinput) {
    //See if records exist...
    var orderUrl = "https://www.tnt.com/api/v3/shipment?ref=" + uinput + "&searchType=REF"
    jsonRetrieve(orderUrl, testForRecords, uinput);
}

function testForRecords(orderObj, uinput) {
    //To see if TNT dat exists...
    try {
        //Does a shipment number search to look for duplicate records
        var conNum = orderObj["tracker.output"].consignment[0].consignmentNumber.slice(0, 8);
        //var orderUrl = "https://www.tnt.com/api/v3/shipment?con="+conNum+"&searchType=CON"
        alert("Records now found for " + uinput + ".\nRefresh to Load.");

        //var recordData= {consignment:conNum,userinput:uinput};
        //document.getElementById(uinput).innerHTML += "</br><button type='button' onmouseup='upgrade('"+conNum+"','"+uinput+"')' onclick='' id='upgrade' style=''>Load</button>"

        //Move Pin
        //Get existing future pin
        var pinList = localStorage.getItem("futurePins");
        var pinArray = pinList.split(",");
        var newPinList = localStorage.getItem("PinnedPods");
        var newPinArray = newPinList.split(",");
        var dueDate = getShortDate(new Date());

        for (i = 0; i < pinArray.length; i++) {
            var pinData = pinArray[i].split("|");
            var pinId = pinData[0];
            //Storage item exists
            if (pinId === uinput) {
                var thisComment = document.getElementById(uinput + "comment").value;
                var newValue = conNum + "|" + thisComment + "|" + dueDate

                if (newPinArray.length < 1) {
                    newPinArray = newValue;
                } else {
                    newPinArray.push(newValue);
                }

                localStorage.setItem("PinnedPods", newPinArray);
                //Remove Old
                pinArray.splice(i, 1);
                localStorage.setItem("futurePins", pinArray);
            }

        }

    } catch (e) { //Nothing found...
    }
}

function unFuturePin(ref) {
    var uinput = ref.parentElement.id;
    //Unpin it
    var pinList = localStorage.getItem("futurePins");
    //Convert to array
    var pinArray = pinList.split(",");
    for (i = 0; i < pinArray.length; i++) {
        var pinData = pinArray[i].split("|");
        var pinId = pinData[0];
        if (pinId == uinput) {
            //Remove
            pinArray.splice(i, 1);
            localStorage.setItem("futurePins", pinArray);
        }
    }
    document.getElementById(uinput).remove();
}

function getDateTime(dateObj) {
    console.info("Function: getDateTime");

    var dte = new Date(dateObj);
    var dteDay = dte.getDate();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    var dteMonth = months[dte.getMonth()];
    var dteYear = dte.getFullYear();
    var dteHour = dte.getHours();
    var minut = dte.getMinutes();
    if (minut < 10) {
        var dteMin = "0" + minut;
    } else {
        var dteMin = minut;
    }
    var formatedDateTime = dteDay + " " + dteMonth + " " + dteYear + " at " + dteHour + ":" + dteMin;

    return formatedDateTime;
}

function getTimeReadable(dateObj) {
    console.info("Function: getTimeReadable");

    var dte = new Date(dateObj);
    var dteHour = dte.getHours();
    var minut = dte.getMinutes();
    if (minut < 10) {
        var dteMin = "0" + minut;
    } else {
        var dteMin = minut;
    }
    var formatedDateTime = dteHour + ":" + dteMin;

    return formatedDateTime;
}

function getShortDate(dateObj) {
    console.info("Function: getShortDate");

    var dte = new Date(dateObj);
    var dteDay = dte.getDate();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    var dteMonth = months[dte.getMonth()];
    var formatedDateTime = dteDay + " " + dteMonth

    return formatedDateTime;
}

function colorDate(dateObj) {
    var dte = Date.parse(new Date(dateObj).toDateString());
    var today = Date.parse(new Date().toDateString());
    //alert(today + " and " + dte);
    if (dte === today) {
        //Today
        dateColor = "green";
    } else if (dte < today) {
        //Late
        dateColor = "#cc0000";
    } else if (dte > today) {
        //Early
        var dateColor = "#a1a09f"
    }
    return dateColor
}


function openPOD(logData) {
    console.info("Function: openPOD");

    var orderNumber = logData[1];
    var conNumber = logData[2]
    var location = logData[3];
    var isDelivered = logData[4];
    var shipId = logData[5];
    var sort = logData[6];

    if (isDelivered === true) {
        //Make lines green
        var hrStyle = "<hr style='border-top: 2px solid #1fa538;'>"
    } else {
        //Make lines orange
        var hrStyle = "<hr style='border-top: 2px solid #f60;'>"
    }
    //Record name
    if (orderNumber !== null) {
        var recordName = orderNumber
    } else {
        var recordName = conNumber
    }

    if (mode === "con" && logData[1] !== null) {
        var conNumber = document.getElementById("conNo").value + " (" + logData[1] + ")"
    }
    //var existing =  document.getElementById("output").innerHTML;
    var trackUrl = "https://www.tnt.com/express/en_gb/site/shipping-tools/tracking.html?searchType=con&cons=" + logData[2];
    var cslUrl = "https://web.carousel.eu/easyweb/default.asp?action=clienttrack&acct1=COM04&acct2=COM04S&acct3=COM04E&acct4=COM04I&type=Consign&reference=" + logData[2];

    var podGroup = document.getElementById(logData[2]);
    //Set Sort Code
    podGroup.getElementsByClassName('sortCode')[0].innerHTML = sort;
    var existing = podGroup.innerHTML;
    var podList = "<div id ='newPod' class='podCont'><b>" + recordName + "</b><p><em>" + location + "</em></p>" + logData[0] +
        "<div id='" + shipId + "' class='podImageData'></div>" + hrStyle + "</div>"
    podGroup.innerHTML = podList + existing;
    enableDisableControls();
    hideStatusBar();
    //location.href = "#" + logData[2];
    //window.scrollBy(0, -5000);
}

function openPODImage(podObj, logData) {
    console.info("Function: openPODImage");
    advanceProgBar();

    var orderNumber = logData[1];
    var conNumber = logData[2];

    //Record name
    if (orderNumber !== null) {
        var recordName = orderNumber
    } else {
        var recordName = conNumber
    }
    var podurl = podObj.confidentialDetailsOutput.confidentialData.podUrl;
    var sig = podObj.confidentialDetailsOutput.confidentialData.signatory;

    if (sig !== null) {
        var signature = "Signed by " + sig
    } else {
        var signature = ""
    }

    if (podurl !== null) {
        //POD Image
        var podImage = document.getElementById(logData[5]).innerHTML = "<p>" + signature + "</p><img src='" + podurl + "' class='pod' alt='No POD Image yet' ondblclick='podOpenNew(this)' id='thisPod' onerror='noPODYet(" + logData[5] +
            ")' ><a href='mailto:sales@communityplaythings.co.uk?subject=" + recordName + "%20POD%20Request[]&body=Requested%20POD%20below%20for%20order%20" + recordName +
            ":%0D%0A%20' class='controlBtn' id='mail" + logData[5] + "'style='float: none;'>&#9993;</a>"
    } else {
        //POD Image
        var podImage = document.getElementById(logData[5]).innerHTML = "<p>" + signature + "</p><a href='mailto:sales@communityplaythings.co.uk?subject=" + recordName + "%20POD%20Request[]&body=Requested%20POD%20below%20for%20order%20" + recordName +
            ":%0D%0A%20' class='controlBtn' id='mail" + logData[5] + "'style='float: none;'>&#9993;</a>"
    }

}


function noPODYet(thisElement) {
    console.info("Function: noPODYet");
    var mailButton = document.getElementById("mail" + thisElement);
    mailButton.style.display = "none";
}

function retrieve() {
    console.info("Function: retrieve");

    enableDisableControls();
    statBar("Retreiving data...");
    if (mode === "order") {
        var orderNumber = document.getElementById("orderNo").value;
        if (orderNumber.length > 1) {
            retrieveOrder(orderNumber, mode);
        } else {
            alert("Order number is required.");
            enableDisableControls();
            redBorder();
        }
    } else if (mode === "con") {
        var conField = document.getElementById("conNo").value;
        if (conField.length > 1) {
            retrieveOrder(conField, mode);
        } else {
            alert("Consignment number is required.");
            enableDisableControls();
            redBorder();
        }
    } else if (mode === "rtn") {
        var orderNumber = document.getElementById("rtnNo").value;
        if (orderNumber.length > 1) {
            retrieveOrder(orderNumber, mode);
        } else {
            alert("Return number is required.");
            enableDisableControls();
            redBorder();
        }
    }
}

function retrieveOrder(orderNo, searchMode) {
    console.info("Function: retrieveOrder - OrderNo = " + orderNo + " Mode = " + searchMode);

    if (searchMode === "order") {
        if (orderNo !== null) {
            var orderUrl = "https://www.tnt.com/api/v3/shipment?ref=" + orderNo + "-1&searchType=REF"
            jsonRetrieve(orderUrl, searchCon);
            saveToHistory(orderNo, searchMode);
        } else {
            alert('Order Not Found');
            enableDisableControls();
            redBorder();
        }
    } else if (searchMode === "con") {
        if (orderNo !== null) {
            var orderUrl = "https://www.tnt.com/api/v3/shipment?con=" + orderNo + "&searchType=CON"
            jsonRetrieve(orderUrl, retrievePOD);
            saveToHistory(orderNo, searchMode);
        } else {
            alert('Shipment Not Found');
            enableDisableControls();
            redBorder();
        }
    } else if (searchMode === "rtn") {
        if (orderNo !== null) {
            var orderUrl = "https://www.tnt.com/api/v3/shipment?ref=" + orderNo + "&searchType=REF"
            jsonRetrieve(orderUrl, searchCon);
            saveToHistory(orderNo, searchMode);
        } else {
            alert('Return Not Found');
            enableDisableControls();
            redBorder();
        }
    }
}

function searchCon(orderObj) {
    console.info("Function: searchCon");

    try {
        //Does a shipment number search to look for duplicate records
        var conNum = orderObj["tracker.output"].consignment[0].consignmentNumber.slice(0, 8);
        var orderUrl = "https://www.tnt.com/api/v3/shipment?con=" + conNum + "&searchType=CON"
        jsonRetrieve(orderUrl, retrievePOD);
    } catch (e) {

        var userInput = orderObj["tracker.output"].notFound[0].input;
        var pinAnyway = confirm("No tracking data found for " + userInput + ". Pin anyway?");
        if (pinAnyway) {
            futurePin(userInput);
        }
        statBar("No Tracking Data Found.", true);
        redBorder();
        enableDisableControls();
    }
}


function jsonRetrieve(url, callback, msg) {
    console.info("Function: jsonRetrieve - url = " + url);

    //statBar("Retrieving " + url);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var retrievedObject = JSON.parse(this.responseText);
            var status = this.statusText
            console.info("Success - status: " + status);
            //advanceProgBar();
            callback(retrievedObject, msg);
        } else {
            console.info("Failed Status: " + this.status + " (" + this.statusText + ")");
            if (this.status != 200 && this.status != 0) {
                statBar("Failed to Retreive " + url + " Status: " + status, true);
                //alert("POD Retreive Failed \n\nStatus: "+this.statusText+"\n\nCheck account number and order number are correct.");
                //window.location.reload(true);
            }
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();

}

function advanceProgBar() {
    //progBarIncrement = 100 / progLimit
    var bar = document.getElementById('progbar');
    var barPercent = bar.style.width;
    var currentValue = barPercent.slice(0, -1);
    //alert(currentValue);
    var newValue = Number(currentValue) + progBarIncrement
    //alert(progBarIncrement);
    bar.style.width = newValue + '%';
    //document.getElementById("loadMessage").innerHTML = newValue + '%';
    if (newValue >= 99) {
        sortGroups();
        setTimeout(function () { off() }, 1000);
        window.scrollBy(0, -5000);
        //bar.style.width = '0%';

    }
}

function enableDisableControls() {
    console.info("Function: enableDisableControls");

    var conField = document.getElementById("conNo")
    var orderField = document.getElementById("orderNo")
    var podButton = document.getElementById("retrieveButton")
    if (orderField.disabled == false) {
        console.info("Controls Disabled");
    } else {
        console.info("Controls Enabled");
        orderField.disabled = false;
        podButton.disabled = false;
        conField.disabled = false;
        hideStatusBar();
    }
}


function refreshMe(podId) {
    console.info("Function: refreshMe - PodId = " + podId);

    var orderUrl = "https://www.tnt.com/api/v3/shipment?con=" + podId + "&searchType=CON"
    jsonRetrieve(orderUrl, retrievePOD);
}

function showPinned(podId) {
    console.info("Function: showPinned");

    var thisPin = document.getElementById(podId + "pin");
    var thisComment = document.getElementById(podId + "comment");
    //var dueDate = document.getElementById(podId + "Date");
    //var dateDisplay = document.getElementById(podId + "DateDisplay");
    var commentText = thisComment.innerHTML;
    //Local Storage exists
    if (typeof (Storage) !== "undefined") {
        //Pin list Exists
        if (localStorage.getItem("PinnedPods")) {
            var pinList = localStorage.getItem("PinnedPods");
            var pinArray = pinList.split(",");

            for (i = 0; i < pinArray.length; i++) {
                var pinData = pinArray[i].split("|");
                var pinId = pinData[0];
                var pinComment = pinData[1];
                var taskGuid = pinData[4];
                //var pinDate = pinData[2];

                //Storage item exists
                if (pinId === podId) {
                    //show as Pinned
                    thisPin.style.transform = "rotateZ(270deg)";
                    thisPin.style.opacity = "1.0";
                    thisComment.style.display = "block";
                    thisComment.parentElement.style.display = "block";
                    thisComment.innerHTML = pinComment;
                    thisComment.ondblclick = function () { openDynamics(taskGuid) };
                    //dueDate.value = pinDate;
                    //dueDate.defaultValue = pinDate;
                    //dateDisplay.style.display = "block";
                    //dateDisplay.getElementsByTagName("span")[0].innerHTML = "Due: " + getShortDate(pinDate);
                    //dateDisplay.style.color = colorDate(pinDate);


                }
            }
        }
    }
}

function openDynamics(guid) {
    var taskUrl = "https://cpuk.crm11.dynamics.com/main.aspx?etn=task&id=" + guid + "&newWindow=true&pagetype=entityrecord";
    window.open(taskUrl, '_blank', 'location=yes,height=1000,width=1200,scrollbars=yes,status=yes');
}

function saveComment(podId) {
    console.info("Function: saveComment");

    var pinList = localStorage.getItem("PinnedPods");
    var pinArray = pinList.split(",");
    for (i = 0; i < pinArray.length; i++) {
        var pinData = pinArray[i].split("|");
        var pinId = pinData[0];
        var taskGuid = pinData[4];
        //Storage item exists
        if (pinId === podId) {
            var thisComment = document.getElementById(podId + "comment").value;
            //var dueDate = document.getElementById(podId + "Date").value;
            var entryLength = document.getElementById(pinId).innerHTML.length;
            //document.getElementById(podId + "DateDisplay").getElementsByTagName("span")[0].innerHTML = "Due: " + getShortDate(dueDate);
            //document.getElementById(podId + "DateDisplay").style.color = colorDate(dueDate);
            //Strip out commas...
            var commentString = thisComment.replace(/[,]/g, "");
            var newValue = pinId + "|" + commentString + "|" + "dueDate" + "|" + entryLength + "|" + taskGuid
            //Replace old value with new
            pinArray.splice(i, 1);
            pinArray.push(newValue);
            localStorage.setItem("PinnedPods", pinArray);
        }
    }
}

function saveFutureComment(podId) {
    console.info("Function: saveFutureComment");

    var pinList = localStorage.getItem("futurePins");
    var pinArray = pinList.split(",");
    for (i = 0; i < pinArray.length; i++) {
        var pinData = pinArray[i].split("|");
        var pinId = pinData[0];
        //Storage item exists
        if (pinId === podId) {
            var thisComment = document.getElementById(podId + "comment").value;
            //Strip out commas...
            var commentString = thisComment.replace(/[,]/g, "");
            var newValue = pinId + "|" + commentString
            //Replace old value with new
            pinArray.splice(i, 1);
            pinArray.push(newValue);
            localStorage.setItem("futurePins", pinArray);
        }
    }
}

//save for autocomplete recall
function saveToHistory(value, mode) {
    console.info("Function: saveToHistory");

    enteredValue = value.toUpperCase();

    //Local Storage exists
    if (typeof (Storage) !== "undefined") {
        //list Exists
        if (localStorage.getItem(mode + "History")) {
            var histList = localStorage.getItem(mode + "History");
            var histArray = histList.split(",");
            //Check if item exists
            if (histArray.includes(enteredValue)) {
                //do nothing
            } else {
                histArray.push(enteredValue);
                localStorage.setItem(mode + "History", histArray);
            }
        } else {
            localStorage.setItem(mode + "History", enteredValue);
        }
    }
}

function closeMe(podGroup) {
    console.info("Function: closeMe");

    podGroup.parentElement.remove();
}

function switchMode(control) {
    console.info("Function: switchMode");

    if (control.id === 'orderNo') {
        //Order Mode
        document.getElementById("conNo").value = "";
        document.getElementById("rtnNo").value = "";
        document.getElementById("conNo").style.background = "#9c9c9c";
        document.getElementById("rtnNo").style.background = "#9c9c9c";
        document.getElementById("orderNo").style.background = "white";
        mode = "order"
    }
    if (control.id === 'conNo') {
        //Consignment Mode
        document.getElementById("orderNo").value = "";
        document.getElementById("rtnNo").value = "";
        document.getElementById("orderNo").style.background = "#9c9c9c";
        document.getElementById("rtnNo").style.background = "#9c9c9c";
        document.getElementById("conNo").style.background = "white";
        mode = "con"
    }

    if (control.id === 'rtnNo') {
        //Return Mode
        document.getElementById("orderNo").value = "";
        document.getElementById("conNo").value = "";
        document.getElementById("orderNo").style.background = "#9c9c9c";
        document.getElementById("conNo").style.background = "#9c9c9c";
        document.getElementById("rtnNo").style.background = "white";
        mode = "rtn"
    }
    document.getElementById("orderNo").style.border = '1px solid #999fa3';
    document.getElementById("conNo").style.border = '1px solid #999fa3';
    document.getElementById("rtnNo").style.border = '1px solid #999fa3';

    console.info("Search Mode = " + mode);
}

function podRotate(pod) {
    if (pod.style.transform.length < 1) {
        pod.style.transform = "rotate(180deg)";
    } else {
        pod.style.transform = "";
    }
}

function updateCssRule(ruleName, ruleProperty, newValue) {
    var allRules = document.styleSheets[0].cssRules
    for (i = 0; i < allRules.length; i++) {
        if (allRules[i].selectorText == ruleName) {
            allRules[i].style.ruleProperty = newValue;
            allRules[i].style.setAttribute(ruleProperty, newValue);
            console.log(ruleProperty + " in " + ruleName + " set to " + allRules[i].style.ruleProperty);
        }

    }

}

function podOpenNew(pod) {
    //alert(pod.id);
    //console.info(pod.src);
    window.open(pod.src);
}

function statBar(textMessage, error) {
    document.getElementById("statusBar").style.display = 'inherit';
    document.getElementById("statusBar").innerHTML = textMessage;
    //document.getElementById("statusBar").style.fontWeight='normal';
    if (error === true) {
        document.getElementById("statusBar").style.color = 'red';
        //document.getElementById("statusBar").style.fontWeight='bold';
    } else {
        document.getElementById("statusBar").style.color = '#ad7550';
    }
    window.setTimeout(hideStatusBar, 4000);
}

function hideStatusBar() {
    document.getElementById("statusBar").style.display = 'none';
}

function redBorder() {
    console.info("Function: redBorder");

    if (mode === "order") {
        var thisInput = document.getElementById("orderNo");
    } else if (mode === "con") {
        var thisInput = document.getElementById("conNo");
    } else if (mode === "rtn") {
        var thisInput = document.getElementById("rtnNo");
    }
    thisInput.style.border = '2px solid red';
}

function pinMe(thisPin) {
    console.info("Function: pinMe");

    var podId = thisPin.parentElement.id;
    var comment = document.getElementById(podId + 'comment')
    //var dueDate = document.getElementById(podId + 'Date')
    //var dateDisplay = document.getElementById(podId + "DateDisplay");
    var entryLength = document.getElementById(podId).innerHTML.length;
    comment.value = getDateTime(new Date());
    //dueDate.value = new Date();
    var commentText = comment.value;
    //var dueDateValue = new Date();



    if (thisPin.style.transform.length < 1) {
        //Pin it
        //CRM Task id
        var taskGuid = prompt("Enter crm task id (with curly braces)", "{0550B684-1B6E-EC11-8943-000D3A870ED2}");
        thisPin.style.transform = "rotateZ(270deg)";
        thisPin.style.opacity = "1.0";
        comment.style.display = "block";
        comment.parentElement.style.display = "block";
        //dateDisplay.style.display = "block";
        if (localStorage.getItem("PinnedPods")) {
            //Storage item exists
            var pinList = localStorage.getItem("PinnedPods");
            //Convert to array
            var pinArray = [pinList];
            //Add id to Array
            pinArray.push(podId + "|" + commentText + "|" + "dueDateValue" + "|" + entryLength + "|" + taskGuid);
        } else {
            //Storage item does not exist
            var pinArray = [];
            pinArray.push(podId + "|" + commentText + "|" + "dueDateValue" + "|" + entryLength + "|" + taskGuid);
        }
    } else {
        console.warn("UNpin pod id: " + podId);
        //Unpin it
        var pinList = localStorage.getItem("PinnedPods");
        //Convert to array
        var pinArray = pinList.split(",");
        for (i = 0; i < pinArray.length; i++) {
            var pinData = pinArray[i].split("|");
            var pinId = pinData[0];
            var pinComment = pinData[1];
            if (pinId == podId) {
                //Remove
                pinArray.splice(i, 1);
                localStorage.setItem("PinnedPods", pinArray);
            }
        }
        thisPin.style.transform = "";
        thisPin.style.opacity = "0.3";
        comment.style.display = "none";
        comment.parentElement.style.display = "none";
        dateDisplay.style.display = "none";
    }
    localStorage.setItem("PinnedPods", pinArray);
    updatePinStatus();
}

function unpinMe(currentEntry) {
    console.info("Function: unpinMe");

    if (confirm('Unpin POD ' + currentEntry + '?')) {
        //Unpin it
        var pinList = localStorage.getItem("PinnedPods");
        //Convert to array
        var pinArray = pinList.split(",");
        for (i = 0; i < pinArray.length; i++) {
            var pinData = pinArray[i].split("|");
            var pinId = pinData[0];
            var pinComment = pinData[1];
            if (pinId == currentEntry) {
                //Remove
                pinArray.splice(i, 1);
                localStorage.setItem("PinnedPods", pinArray);
            }
        }
        showPinStatusModal();
    }
}

function updatePinStatus() {
    console.info("Function: updatePinStatus");

    if (localStorage.getItem("PinnedPods")) {
        //Storage item exists
        var pinList = localStorage.getItem("PinnedPods");
        //Convert to array
        var pinArray = pinList.split(",");
        var pinLength = pinArray.length
        document.getElementById('pinStatus').innerHTML = pinLength + " Items Pinned"

        if (pinLength < 1) {
            document.getElementById('pinStatus').style.display = "none";
        } else {
            document.getElementById('pinStatus').style.display = "block";
        }
    }
}

function showPinStatusModal() {
    console.info("Function: showPinStatusModal");

    document.getElementById("pinStatList").innerHTML = "";
    var pinList = localStorage.getItem("PinnedPods");
    //Convert to array
    var pinArray = pinList.split(",");
    var pinLength = pinArray.length
    for (i = 0; i < pinLength; i++) {

        var currentEntry = pinArray[i];
        var currentArray = currentEntry.split("|");
        var pinComment = currentArray[1];
        var pinNumber = currentArray[0];
        var custRef = document.getElementById(pinNumber).getElementsByTagName("b")[0].innerHTML;
        var currentStatus = document.getElementById(pinNumber).getElementsByClassName("status")[0].innerHTML;

        document.getElementById("pinStatList").innerHTML += "<p style='padding-left:5px;' ><span class='icon' style='font-size: 15px;' onclick='unpinMe(" +
            pinNumber + ")'>&#128204;</span><strong>" + custRef + "</strong>     <span id='ModalComment" + pinNumber + "' class='modalComment' contenteditable='true'>" +
            pinComment + "</span><p style='padding-left:100px;padding-bottom:20px;'><span style='color:#a1a09f;'>Status: </span>" + currentStatus + "</p>"
    }
    on('pinStatModal');
}

function clearPinned() {
    console.info("Function: clearPinned");

    localStorage.setItem("PinnedPods", "");
    document.getElementById("pinStatList").innerHTML = "<p>(none)</p>"
}

function saveModalComments() {
    console.info("Function: saveModalComments");

    var modalComments = document.getElementsByClassName('modalComment');
    for (i = 0; i < modalComments.length; i++) {
        var thisComment = modalComments[i]
        var pinId = (thisComment.id).slice(12);
        document.getElementById(pinId + "comment").value = thisComment.innerHTML
        saveComment(pinId);
    }
    off('pinStatModal')
}

//Blank overlay
function on(modalId) {
    console.info("Function: on");

    document.getElementById(modalId).style.display = "block";
    document.getElementById("overlay").style.opacity = "1.0";
    document.getElementById("overlay").style.display = "block";
}

function onLoadBlank() {
    console.info("Function: on");

    document.getElementById("pinStatModal").style.display = "none";
    document.getElementById("overlay").style.opacity = "1.0";
    document.getElementById("overlay").style.zIndex = "1";
    document.getElementById("loadMessage").style.display = "block";

}


function off(modalId) {
    console.info("Function: off");
    if (modalId !== undefined) {
        document.getElementById(modalId).style.display = "none";
    }
    document.getElementById("overlay").style.opacity = "0";
    document.getElementById("overlay").style.display = "none";
    document.getElementById("loadMessage").style.display = "none";
}




//////////////Autocomplete stuff

function autocomplete(inp, arr) {
    //make array
    var arr = arr.split(",");
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}


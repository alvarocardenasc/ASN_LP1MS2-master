var currentIndex = 0;
var currentIndexE = 0;
var dataG;

$(document).ready(function () {

    $("#version").html("v0.14");

    $("#searchbutton").click(function (e) {
        displayModal();
    });

    $("#searchfield").keydown(function (e) {
        if (e.keyCode == 13) {
            displayModal();
        }
    });

    function displayModal() {
        $("#myModal").modal('show');
        $("#status").html("Searching...");
        $("#dialogtitle").html("Search for: " + $("#searchfield").val());
        $("#previous").hide();
        //$("#next").hide();
        $.getJSON('/search/' + $("#searchfield").val(), function (data) {
            console.log("-----------------------renderQueryResults1");
            renderQueryResults(data);
            // console.log("renderQueryResults2----------------"); 

        });
    }

    $("#next").click(function (e) {
        //e.preventDefault();
        //TODO: Implement 'next' button
        console.log("next dataG.num_results=" + dataG.num_results + " currentIndex=" + currentIndex);

        if (dataG.num_results <= currentIndex + 4) {
            $("#next").hide();
            //console.log(dataG.num_results <= currentIndex + 4);
            //console.log("nexthide====");
        } else {
            $("#next").show();
            //console.log("nextshow====");
        }
        replaceImages(currentIndex);
        if(currentIndex>4){
            $("#previous").show();
            
        }
    });

    $("#previous").click(function (e) {
        //e.preventDefault();
        currentIndex = currentIndexE-4;
        replaceImages(currentIndex );
        console.log("prev="+currentIndexE);
        //TODO: Implement 'previous' button
        
        if (currentIndexE < 4) {
            $("#previous").hide();
        }
        if (dataG.num_results <= currentIndex ) {
            $("#next").hide();
            console.log(dataG.num_results <= currentIndex + 4 +" "+currentIndex );
            console.log("nexthide====");
        } else {
            $("#next").show();
            console.log("nextshow====");
        }
    });

    function renderQueryResults(data) {
        //$("#status").html("fuck! ["+data+" ]fin");
        currentIndex=0;
        currentIndexE=0;
        if (data.error != undefined) {
            $("#status").html("Error: " + data.error);
        } else {
            var total = data.num_results;
            $("#status").html("" + total + " result(s)");

            if (total > 4) {
                $("#next").show();
            }else{
           $("#next").hide();
                
            }
            //$("#previous").show();
            $("#previous").hide();

            //$("#photo0").html("<img src=\"" + data.results[0] + "\" style=\"max-width: 100px; max-height: 100px\" />");
            dataG = data;

            replaceImages(0);

            console.log("show/hide");
            //TODO: Show/hide 'previous' and 'next' buttons as appropriate
            //TODO: Show the pictures in the dialog box (they should go into the 'photo0'..'photo3' cells)
        }
    }
});

function replaceImages(cicle) {
    console.log("currentIndex=" + currentIndex);
    var x = 0;
    currentIndexE=currentIndex;
    for (var i = cicle; i < cicle + 4; i++) {
        console.log("i=" + i+" currentIndex="+currentIndex+" dataG.num_results="+dataG.num_results);
        if (currentIndex < dataG.num_results) {
            try {
                $("#photo" + x + "").html("<img src=\"" + dataG.results[i] + "\" style=\"max-width: 100px; max-height: 100px\" />");
                $("#photo" + x + "").show();
                console.log("cicleV=" + dataG.results[i]);
                currentIndex++;
                
            } catch (err) {
                console.log(err);
                break;
            }
        } else {
                $("#photo" + x + "").hide();
                
        }
        x++;
                
    }


}
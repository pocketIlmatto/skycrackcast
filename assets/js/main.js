---
---
function getForecast(site_score, lat, lng, hourstart, hourend, speedmin_ideal, speedmax_ideal, speedmin_edge, speedmax_edge, dir_ideal, dir_edge) {

    $.ajax({
    url: 'https://api.weather.gov/points/' + lat + ',' + lng + '/forecast/hourly',
    dataType: 'json',
    headers: {
      'accept': 'application/json'
    },
    error: function (error) {
      console.log(error);
    },
    success: function (thedata) {

      var therow = '';
      var greeno = 0;
      var yellowo = 0;

      // remove the gif spinner
      $(".score img").remove();

      var d = new Date();
      var weekday = new Array(7);
      weekday[0] = "Su";
      weekday[1] = "Mo";
      weekday[2] = "Tu";
      weekday[3] = "We";
      weekday[4] = "Th";
      weekday[5] = "Fr";
      weekday[6] = "Sa";
      var todaynum = d.getDay();
      var todayhour = d.getHours();
      
      var i = 0;

      for (i = 0; i < 155; i++) { 
      
        // get the PT hour from the API hour entry 
        var timestr = thedata.properties.periods[i].startTime;
        var thehour = timestr.substring(11,13);
        var isutc = timestr.substring(20,22); // returns 00 for UTC return 
        if (isutc == '00') {
          thehour = thehour - 7;
          if (thehour < 0) {
            thehour = thehour + 24;
          }
        }

        // get the windSpeed range 
        var thespeed = thedata.properties.periods[i].windSpeed;
        var speedmin_act = 0;
        var speedmax_act = 0;
        if (thespeed.length < 7) {
          speedmin_act = thespeed.substring(0,thespeed.indexOf("mph"));
          speedmax_act = thespeed.substring(0,thespeed.indexOf("mph"));
        } else {
          speedmin_act = thespeed.substring(0,thespeed.indexOf("to"));
          speedmax_actarray = thespeed.match("to(.*)mph");
          speedmax_act = speedmax_actarray[1];
        }
        speedmin_act = parseInt(speedmin_act);
        speedmax_act = parseInt(speedmax_act);


        var thedirection = thedata.properties.periods[i].windDirection;

        if (thehour == '00') {

          // console.log("BREAK start a new day here")
          // day is over, add up for previous day 
          if (greeno >= 3) {
            therow = therow.concat('<div class="go-ideal">'+weekday[todaynum]+'</div>');

          } else if (greeno==1 || greeno == 2) {
            therow = therow.concat('<div class="go-likely">'+weekday[todaynum]+'</div>');

          } else if (yellowo >= 3) {
            therow = therow.concat('<div class="go-maybe">'+weekday[todaynum]+'</div>');

          } else {
            therow = therow.concat('<div class="go-bad">'+weekday[todaynum]+'</div>');

          }

          todaynum++;
          if (todaynum == 7) { todaynum = 0; } // loop on Sunday 

          // reset green, yellow for next period 
          greeno = 0;
          yellowo = 0;
        
        } else if (thehour >= hourstart && thehour <= hourend) {

          if ((speedmin_act >= speedmin_ideal && speedmax_act <= speedmax_ideal) && (jQuery.inArray(thedirection, dir_ideal) !== -1)) {
            // console.log(site_score+" green: T="+thehour+"("+timestr+"), windspeed "+thespeed+", direction "+thedirection+', day '+weekday[todaynum]);
            greeno = greeno+1;
            yellowo = yellowo+1;
          } else if ((speedmin_act >= speedmin_edge && speedmax_act <= speedmax_edge) && (jQuery.inArray(thedirection, dir_edge) !== -1)) {
            // console.log(site_score+" yellow: T="+thehour+"("+timestr+"), windspeed "+thespeed+", direction "+thedirection+', day '+weekday[todaynum]);
            yellowo = yellowo + 1; 
          } else {
            // console.log(site_score+" red: T="+thehour+"("+timestr+"), windspeed "+thespeed+", direction "+thedirection+', day '+weekday[todaynum]);
          }

        } 

          
      } // end for loop 

      $('#'+site_score).append(therow);
      console.log(site_score);
      
    } // end success function

  }); // end ajax POST       

} // end function

$(document).ready(function() {

  console.log('\n\n\nDocument ready \n');

  var sites = {{ site.data.sites | jsonify }}
  
  for (item of sites) {
     getForecast(`${item.id}_score`, item.lat, item.lng, item.hourstart, 
      item.hourend, item.speedmin_ideal, item.speedmax_ideal, 
      item.speedmin_edge, item.speedmax_edge, item.dir_ideal, item.dir_edge);
  }
    
}); // end document ready 

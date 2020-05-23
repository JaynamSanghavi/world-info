$('#visitorMap').vectorMap({
  map: 'world_en',
  backgroundColor: '#46bcec',
  borderOpacity: .8,
  borderWidth: 1,
  hoverColor: '#444444',
  hoverOpacity: .8,
  color: '#f2f2f2',
  normalizeFunction: 'linear',
  selectedRegions: false,
  showTooltip: false,
  onRegionClick: function(element, code, region) {
    var opts = 'You clicked "' + region + '" which has the code: ' + code.toUpperCase()
    console.log(opts)
    fetch("https://restcountries.eu/rest/v2/alpha/" + code + "?fields=name;currencies;flag;languages").then(response => response.json()).then(data => {
        console.log(data)
        var currencyName = data.currencies[0].name.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
        var countryLangCode = data.languages[0].iso639_1
        fetch("https://" + countryLangCode +".wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=" + data.name + "&format=json",{method: "GET"}).then(response => response.json()).then(wikidata => {
          // console.log(wikidata)
          var wikiNewsData = wikidata.query.search;
          var htmlNews = "";
          wikiNewsData.slice(0, 2).forEach(element => {
            console.log(element)
            htmlNews += "<strong>News Title:</strong> " + element.title + ". </br><strong>News:</strong> " + element.snippet + "</br>"
          });
          Swal.fire({
            title: region,
            imageUrl: data.flag,
            imageWidth: 400,
            imageHeight: 200,
            imageAlt: 'Country Flag',
            html: 'Currency is <strong>' + currencyName + '</strong></br>' + htmlNews,
            showCancelButton: true,
            confirmButtonText: 'See More Information',
            cancelButtonText: 'OK',
          }).then((result) => {
              if (result.value) {
                var currencyCode = data.currencies[0].code;
                var valueStr = "INR_" + currencyCode;
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();
                today = yyyy + '-' + mm + '-' + dd;
                console.log(today);
                fetch("https://free.currconv.com/api/v7/convert?apiKey=c36259d5b422b1b7408f&q=INR_" + currencyCode).then(response => response.json()).then(ratesdata => {
                  console.log(ratesdata)
                  fetch("https://free.currconv.com/api/v7/convert?apiKey=c36259d5b422b1b7408f&q=" + valueStr + "&compact=ultra&date=2020-1-23&endDate=2020-1-30").then(response => response.json()).then(ratesHistorydata => {
                    console.log(ratesHistorydata)
                    // var obj = JSON.parse(ratesHistorydata);
                    var historyStr = "";
                    Object.keys(ratesHistorydata[valueStr]).forEach(function(key) {
                      historyStr += key + " : " + ratesHistorydata[valueStr][key] + "</br>";
                    })
                    Swal.fire({
                      title: '1 ' + currencyCode + ' = ' + ratesdata.results[valueStr].val + ' INR',
                      html: historyStr,
                    })
                  });
                });
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                  Swal.fire('Try some other country. Thank you!')
              }
          })          
        });
    }).catch(error => console.error(error))
  }
});
var express = require("express"),
    app = express();

var port = process.env.PORT || 8080;

 
const watson = require('watson-developer-cloud');
const vcapServices = require('vcap_services');
app.use(express.static(__dirname + '/public'));

// speech to text token endpoint
var sttAuthService = new watson.AuthorizationV1(
  Object.assign(
    {
      username: "", // or hard-code credentials here
      password: ""
    },
    vcapServices.getCredentials('speech_to_text') // pulls credentials from environment in bluemix, otherwise returns {}
  )
);
app.use('/api/speech-to-text/token', function(req, res) {
  sttAuthService.getToken(
    {
      url: watson.SpeechToTextV1.URL
    },
    function(err, token) {
      if (err) {
        console.log('Error retrieving token: ', err);
        res.status(500).send('Error retrieving token');
        return;
      }
      res.send(token);
    }
  );
});

app.use('/api/speech-to-text/', function(req, res) {
  res.send('hi');
});


app.listen(port);
console.log("Listening on port ", port);

require("cf-deployment-tracker-client").track();

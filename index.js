const https = require('https');
var AWS = require("aws-sdk");
const Twitter = require("twitter");

// [TODO] UPDATE THESE DETAILS FOR THE DESIRED LOCATION OR DEPLOYMENT ENVIRONMENT
const smsTopicArn = '<SNS_TOPIC_ARN>'; // Deprecated
const location = "PUNE";
const districtId = "363";
const maxAgeLimit = 45;

// Set region
AWS.config.update({region: 'ap-south-1'});

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [day, month, year].join('-');
}

const postTweet = msg => { 
  return new Promise((resolve, reject) => {
    console.log(msg);

    var client = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    });

    return client.post('statuses/update', {status: msg}).catch(console.error);
  });
};

const today = formatDate(new Date());

exports.handler = async (event) => {
    let dataString = '';
    let url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id="+ districtId +"&date="+ today;
    
    const formatMessage = msg => {
      return msg;
    };

    const response = await new Promise((resolve, reject) => {
        const req = https.get(url, function(res) {
         
          res.on('data', chunk => {
            dataString += chunk;
          });
         
          res.on('end', () => {
            const response = JSON.parse(dataString);
            const availableCenters = [];
   
            if (!response.hasOwnProperty('centers') || typeof(response.centers) === 'undefined' || (response.centers === null)) {
              return;
            }
   
            const centers       = response.centers;
            const tweetPromises = [];
            const tweetMessages = new Set();
            // console.log(JSON.stringify(centers, null, 2));

            centers.forEach(center => {
              if (center.hasOwnProperty('sessions')) {
                  const sessions = center.sessions;
                     
                  if (Array.isArray(sessions) && sessions.length > 0) {

                      // remove unwanted properties
                      center.address = `${center.address}, ${center.block_name}, ${center.district_name}, ${center.state_name}, ${center.pincode}`;
                      delete center.center_id;
                      delete center.state_name;
                      delete center.district_name;
                      delete center.block_name;
                      delete center.pincode;
                      delete center.lat;
                      delete center.long;
                      delete center.from;
                      delete center.to;
                        
                    sessions.forEach(session => {
                      if (session.hasOwnProperty('available_capacity') &&
                        session.available_capacity !== null           &&
                        session.available_capacity !== 'undefined'    &&
                        session.available_capacity > 0                && 
                        session.hasOwnProperty('min_age_limit')       &&
                        session.min_age_limit !== null                &&
                        session.min_age_limit !== 'undefined'         &&
                        session.min_age_limit < maxAgeLimit) {
                          
                        // remove unwanted properties
                        delete session.session_id;
                         
                        availableCenters.push(formatMessage(center));
                      }
                    });
                  }
               
              } // else do nothing
            });
           
            console.log(`Available Centers: ${availableCenters}`);

            if (Array.isArray(availableCenters) && availableCenters.length > 0) {
               var eventText = JSON.stringify(availableCenters, null, 2);
               var subject = `[${location}] Cowin vaccine availability update `;
             
//                var params = {
//                    Message: eventText,
//                    Subject: subject,
//                    TopicArn: smsTopicArn
//                };

              // POST Vaccine availability updates to Twitter
              console.log("Posting tweet - " + JSON.stringify(availableCenters, null, 2));

              availableCenters.forEach(center => {
                const centerName    = center.name    || '';
                let   centerAddress = center.address || '';
                let   vaccineNames  = new Set();
                let   totalQty      = 0;
                let   dose1Qty      = 0;
                let   dose2Qty      = 0;
                let   ages          = new Set(); 
                let   dates         = new Set();

                center.sessions.forEach(session => {
                  if (session.vaccine || '' != '') vaccineNames.add(session.vaccine);
                  if (session.min_age_limit || 0 != 0) ages.add(session.min_age_limit + '+');
                  totalQty += session.available_capacity;
                  dose1Qty += session.available_capacity_dose1;
                  dose2Qty += session.available_capacity_dose2;
                  
                  const dateArr = (session.date).split('-');
                  const formattedDate = `${dateArr[0]}/${dateArr[1]}`;
                  dates.add(formattedDate);
                });

                vaccineNames = Array.from(vaccineNames).join(',');
                ages         = Array.from(ages).join(',');
                dates        = Array.from(dates).join(', ');
                
                const todaySplits = today.split('-');

                // Build Tweet message
                let tweetMsg = `[${todaySplits[0]}/${todaySplits[1]}] ${vaccineNames} (Dose 1 Qty-${dose1Qty}, Dose 2 Qty-${dose2Qty}, Ages-${ages}, Dates-${dates}) available at - ${centerName}, ${centerAddress}`;
                tweetMsg += `, Details-https://www.cowin.gov.in`;

                if (dose1Qty > 0 || dose2Qty > 0) {
                  if (tweetMsg.length > 280) {
                    const msg1 = tweetMsg.substring(0, 280);
                    const msg2 = `[${todaySplits[0]}/${todaySplits[1]}] ${tweetMsg.substring(280, tweetMsg.length)}`;

                    tweetMessages.add(msg1);
                    tweetMessages.add(msg2);
                  } else {
                    tweetMessages.add(tweetMsg);
                  }
                }
              });
            }

            Array.from(tweetMessages).forEach(msg => {
              tweetPromises.push(postTweet(msg));
            });

            // Post tweets
            if (tweetPromises.length > 0) {
              Promise.all(tweetPromises)
                .then(console.log)
                .catch(console.error);
            }
            // else do nothing
          });
        });
       
        req.on('error', (e) => {
          reject({
              statusCode: 500,
              body: 'Something went wrong!'
          });
        });
    });
   
    return response;
};

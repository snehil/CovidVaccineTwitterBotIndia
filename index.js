const https   = require('https');
const AWS     = require("aws-sdk");
const Twitter = require("twitter");

// Set region
AWS.config.update({ region: 'ap-south-1' });

const formatDate = date => {
    var d     = new Date(date),
        month = '' + (d.getMonth() + 1),
        day   = '' + d.getDate(),
        year  = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length   < 2) day   = '0' + day;

    return [day, month, year].join('-');
}

const postTweet = (twitterClient, msg) => { 
    return new Promise((resolve, reject) => {
        console.info(`Posting tweet - ${msg}`);
        return twitterClient.post('statuses/update', {status: msg}).catch(console.error);
    });
};

const validateInput = (event, context, prop) => {
    if (!event.hasOwnProperty(prop)) {
        context.fail(new Error(`${prop} not specified in input`));
    }
};

const today = formatDate(new Date());

exports.handler = async (event, context) => {
    let   dataString     = '';
    const maxAgeLimit    = 200;
    const maxTweetLength = 280;

    console.info(`Input: ${JSON.stringify(event, null, 2)}`);

    validateInput(event, context, 'districtId');
    validateInput(event, context, 'consumerKey');
    validateInput(event, context, 'consumerSecret');
    validateInput(event, context, 'accessTokenKey');
    validateInput(event, context, 'accessTokenSecret');

    const twitterClient = new Twitter({
        consumer_key        : event.consumerKey,
        consumer_secret     : event.consumerSecret,
        access_token_key    : event.accessTokenKey,
        access_token_secret : event.accessTokenSecret
    });

    const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${event.districtId || 0}&date=${today}`;
    
    const response = await new Promise((resolve, reject) => {
        const req = https.get(url, res => {
         
        res.on('data', chunk => { dataString += chunk });
         
        res.on('end', () => {
            const response         = JSON.parse(dataString);
            const availableCenters = [];
            const tweetPromises    = [];
            const tweetMessages    = new Set();
            
            if (!response.hasOwnProperty('centers') || response.centers == null) return;

            response.centers.forEach(center => {
                if (center.hasOwnProperty('sessions')) {
                    const sessions = center.sessions;
                       
                    if (Array.isArray(sessions) && sessions.length > 0) {  
                        center.address = `${center.address}, ${center.block_name}, ${center.district_name}, ${center.state_name}, ${center.pincode}`;

                        sessions.forEach(session => {
                            if (session.hasOwnProperty('available_capacity') &&
                                session.available_capacity != null           &&
                                session.available_capacity > 0) {
                                 
                                availableCenters.push(center);
                            } // else do nothing
                        });
                    } // else do nothing
                } // else do nothing
            });
           
            console.info(`Available Centers: ${availableCenters}`);

            if (Array.isArray(availableCenters) && availableCenters.length > 0) {
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
                        if (session.vaccine       || '' != '') vaccineNames.add(session.vaccine);
                        if (session.min_age_limit || 0  != 0)  ages.add(session.min_age_limit + '+');

                        totalQty += session.available_capacity;
                        dose1Qty += session.available_capacity_dose1;
                        dose2Qty += session.available_capacity_dose2;
                        
                        const dateArr       = (session.date).split('-');
                        const formattedDate = `${dateArr[0]}/${dateArr[1]}`;

                        dates.add(formattedDate);
                    });

                    vaccineNames      = Array.from(vaccineNames).join(',');
                    ages              = Array.from(ages).join(',');
                    dates             = Array.from(dates).join(', ');
                    const todaySplits = today.split('-');

                    // Build Tweet message
                    let tweetMsg = `[${todaySplits[0]}/${todaySplits[1]}] ${vaccineNames} (Dose 1 Qty-${dose1Qty}, Dose 2 Qty-${dose2Qty}, Ages-${ages}, Dates-${dates}) available at - ${centerName}, ${centerAddress}`;
                    tweetMsg     += `, Details-https://www.cowin.gov.in`;

                    if (dose1Qty > 0 || dose2Qty > 0) {
                        // Split Tweet message if necessary
                        if (tweetMsg.length > maxTweetLength) {
                            const msg1 = tweetMsg.substring(0, maxTweetLength);
                            const msg2 = `[${todaySplits[0]}/${todaySplits[1]}] ${tweetMsg.substring(maxTweetLength, tweetMsg.length)}`;    

                            tweetMessages.add(msg1);
                            tweetMessages.add(msg2);
                        } else {
                            tweetMessages.add(tweetMsg);
                        }
                    } // else do nothing
                });
            }

            Array.from(tweetMessages).forEach(msg => tweetPromises.push(postTweet(twitterClient, msg)));

            // Post tweets
            if (tweetPromises.length > 0) {
                Promise.all(tweetPromises)
                    .then(console.log)
                    .catch(console.error);
            } // else do nothing
          });
        });
       
        req.on('error', err => {
            reject({
                statusCode : 500,
                body       : err.message || 'Something went wrong'
            });
        });
    });
   
    return response;
};

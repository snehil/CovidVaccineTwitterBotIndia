# AWS based Twitter Bot for Covid Vaccine Notifications (India)

This project houses some code to quickly stand-up a Twitter bot that users can subscribe to get Covid vaccine availability notifications. 

### Dependencies
- The project relies on the [public COWIN API](https://apisetu.gov.in/public/marketplace/api/cowin/cowin-public-v2) to get Covid vaccine availability information
- A Twitter developer account [with an application created](https://developer.twitter.com/en/docs/apps/overview) (With access to the [authentication keys and secrets](https://github.com/snehil/CovidVaccineTwitterBotIndia/blob/main/index.js#L33-L36))

### How to deploy?
- [TODO] Cloudformation based deployment

### How to deploy manually?
- Zip up all the contents from the root folder and then deploy the code to an AWS Node.js lambda function in the Mumbai region. 
- A single lambda function can handle multiple districts. The input to the function should be a json that specifies the districtId and Twitter credentials like so
```json
{
  "districtId": 363,
  "consumerKey": "TODO",
  "consumerSecret": "TODO",
  "accessTokenKey": "TODO",
  "accessTokenSecret": "TODO"
}
```
- Create an AWS cloudwatch rule to trigger the Lambda function for periodical updates/tweets to the Twitter account. A separate cloudwatch rule for each district could now be setup where the input to the function triggered is a json in the format above with the districtID corresponding to the district for which the bot is being setup and the Twitter credentials to the account where tweets are to be posted. A single lambda function can thus be re-used for multiple districts. 

### Example deployments 
- [Pune Vaccine Watch](https://twitter.com/punevaccinewat1) 
- [Belgaum Vaccine Watch](https://twitter.com/BgmVaccineWatch)
- [Bengaluru Vaccine Watch](https://twitter.com/BLRVaccineWatch)
- [Nashik Vaccine Watch](https://twitter.com/nashikvaccinew1)
- [Hyderabad Vaccine Watch](http://bit.ly/HydVaccineWatch)

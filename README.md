# Twitter Bot for Covid Vaccine Notifications (India)

This project houses some code to quickly stand-up a Twitter bot that users can subscribe to get Covid vaccine availability notifications. 

### Dependencies
- The project relies on the [public COWIN API](https://apisetu.gov.in/public/marketplace/api/cowin/cowin-public-v2) to get Covid vaccine availability information
- A Twitter developer account [with an application created](https://developer.twitter.com/en/docs/apps/overview) (With access to the [authentication keys and secrets](https://github.com/snehil/CovidVaccineTwitterBotIndia/blob/main/index.js#L33-L36))

### How to deploy?
- Run `npm install twitter` locally. zip up the file contents and then deploy the code to an AWS lambda function in the Mumbai region. Make sure to include the index.js file in the zip file contents. 
- Create an AWS cloudwatch rule to trigger the Lambda function for periodical updates/tweets to the Twitter account. 

### Example deployments 
- [Pune Vaccine Watch](https://twitter.com/punevaccinewat1) 
- [Belgaum Vaccine Watch](https://twitter.com/BgmVaccineWatch)

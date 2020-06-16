#!/usr/bin/env node
// const { exec } = require('child_process');
const AWS = require('aws-sdk'); 
const fs = require('fs')
const ursa = require('ursa');
const {promisify} = require('util');
const {exec} = require('child_process');
const execAsync = promisify(exec);
const prompt = require('prompt-sync')({sigint: true});

AWS.config.update({
  region: 'us-west-2',
  credentials: new AWS.SharedIniFileCredentials({profile: 'id_rsa_olympus'})
});


// const credentials = new AWS.SharedIniFileCredentials({profile: 'id_rsa_olympus'});
// AWS.config.credentials = credentials;
/*

*/

const getInstanceDetails = instanceId => {
  const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
  const instanceDet = ec2.describeInstances({InstanceIds: [instanceId]}).promise()
  instanceDet.then(
  function(data) { 
      const instances = data.Reservations[0].Instances
  //    console.log(instances)
      const instance = instances[0]
      console.log("######################################################################")
      console.log("INSTANCE_ID:", instance.InstanceId + ", IMAGE_ID:", instance.ImageId)
      console.log("IP: ", instance.PrivateIpAddress + ", DNS: ", instance.PrivateDnsName)
      console.log("######################################################################")
      do_port_forwarding(instance['PrivateIpAddress'])
      return instances
      }).catch(                                                                      
          function(err) {                                                            
          console.error(err, err.stack);                                             
      }
  );
}

const printInstancePassword = instanceId => {
  try {
    console.log("Generating Password...")
    const pem = fs.readFileSync(process.env.IBP_100_PEM_FILE);
    const pkey = ursa.createPrivateKey(pem);
    const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
    ec2.getPasswordData({InstanceId: instanceId}, (err, data)=> {
      if(err) {
        console.log("Error :"+ err) 
      } else {
        // console.log(JSON.stringify(data))
        const password = pkey.decrypt(data.PasswordData, 'base64', 'utf8', ursa.RSA_PKCS1_PADDING);
        console.log("************************************")
        console.log('::::::INSTANCE_PASSWORD: '+ password);
        console.log("************************************")

      }
  });
  } catch(err){
    // console.log("ERROR: Generating Password")
    console.error(err)
  }
}

const do_port_forwarding = (ip) => {
  const conStr = 'ssh ibp-100 -L 1799:'+ip +':799';
  console.log("Connecting :" + conStr)
  exec(conStr, (err, stdout, stderr) => {
    if (err) {
      //some err occurred
      console.log("Error connecting ...")
      console.error(err)
    } else {
      console.log("Connected to :"+ ip)
     // the *entire* stdout and stderr (buffered)
     console.log(`stdout: ${stdout}`);
     console.log(`stderr: ${stderr}`);
    }
  });
}
const  getAWSToken = async () => {
  console.log("Generating IBP-100 AWS temp credential...")
  // exec('eiamCli getAWSTempCredentials -a 733536204770 -r WindowsUsers -p ibp-100', (err, stdout, stderr) => {
  //  exec('awstoken 2', (err, stdout, stderr) => {
  //   if (err) {
  //     //some err occurred
  //     console.error(err)
  //   } else {
  //    // the *entire* stdout and stderr (buffered)
  //    console.log(`stdout: ${stdout}`);
  //    console.log(`stderr: ${stderr}`);
  //   }
  // });
  const {err, stdout, stderr}  = await execAsync('awstoken 2')
  console.log(err)
  console.log(stdout)
  console.log(stderr)
  console.log("Token generated")
}

const main = () => {
  process.env.AWS_PROFILE='id_rsa_olympus'
  console.log("Connecting IBP-100 AWS Account...")
  const isToken = prompt("Hit Enter for No. Do you want to generate token?[Y]")
  if(isToken && isToken.toUpperCase() === "Y") {
    getAWSToken()
  }
  const instanceId = prompt('Enter Instance ID :');
  console.log("INSTANCE_ID: "+ instanceId)
  if(!instanceId) {
    console.log("Please enter the Instance Id!")
  }
  printInstancePassword(instanceId)
  getInstanceDetails(instanceId)
}

module.exports = {
  main,
  getAWSToken,
  printInstancePassword,
  getInstanceDetails
}

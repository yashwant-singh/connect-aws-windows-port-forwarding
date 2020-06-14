#!/usr/bin/env node
const {promisify} = require('util');
const {exec} = require('child_process');
const execAsync = promisify(exec);
const AWS = require('aws-sdk'); 
const fs = require('fs')
const ursa = require('ursa');
const prompt = require('prompt-sync')();
AWS.config.update({region: 'us-west-2'}); 

/*

*/
const getInstanceDetails = instanceId => {
  const ec2 = new AWS.EC2({apiVersion: 'latest'});
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
    const pem = fs.readFileSync(process.env.TTD_PEM_FILE);
    const pkey = ursa.createPrivateKey(pem);
    const ec2 = new AWS.EC2({apiVersion: 'latest'});
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
    console.error(err)
  }
}

const do_port_forwarding = (ip) => {
  const connStr = 'ssh ibp-100 -L 1799:'+ip +':799';
  console.log("Connecting :"+ connStr)
  exec(connStr, (err, stdout, stderr) => {
    if (err) {
      //some err occurred
      console.log("Error connecint ssh")
      console.error(err)
    } else {
      console.log("Connected to :"+ ip)
     // the *entire* stdout and stderr (buffered)
     console.log(`stdout: ${stdout}`);
     console.log(`stderr: ${stderr}`);
    }
  });
}
const getAWSToken = async () => {
  console.log("Generating IBP-100 AWS temp credential...")
  // exec('eiamCli getAWSTempCredentials -a 733536204770 -r WindowsUsers -p ibp-100', (err, stdout, stderr) => {
  //   exec('awstoken 1', (err, stdout, stderr) => {
  //   if (err) {
  //     //some err occurred
  //     console.error(err)
  //   } else {
  //    // the *entire* stdout and stderr (buffered)
  //    console.log(`stdout: ${stdout}`);
  //    console.log(`stderr: ${stderr}`);
  //   }
  // });
  const {err, stdout, stderr}  = await execAsync('awstoken 1')
  console.log(err)
  console.log(stdout)
  console.log(stderr)
  console.log("Token generated")
}

const main = () =>{
  process.env.AWS_PROFILE='ttd-rsa'
  console.log("Connecting DesktopTools AWS Account.... ")
  const isToken = prompt("Hit Enter for No. Do you want to generate token?[Y]")
  if(isToken && isToken.toUpperCase() === "Y") {
    getAWSToken()
  }
    // const credentials = new AWS.SharedIniFileCredentials({profile: 'ttd-rsa'});
    // AWS.config.credentials = credentials;
  const instanceId = prompt('Enter Instance ID :');
  console.log("INSTANCE_ID: "+ instanceId)
  if(!instanceId) {
    console.log("Please enter the Instance Id!")
  }
  printInstancePassword(instanceId)
  getInstanceDetails(instanceId)
}

module.exports.main = main

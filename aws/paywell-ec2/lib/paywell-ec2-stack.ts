import * as cdk from '@aws-cdk/core';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from '@aws-cdk/aws-ec2' // import ec2 library 
import * as iam from '@aws-cdk/aws-iam' // import iam library for permissions
import {readFileSync} from 'fs';

require('dotenv').config()

const config = {
  env: {
    account: process.env.AWS_ACCOUNT_NUMBER,
    region: process.env.AWS_REGION
  }
}

export class PaywellEc2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    // super(scope, id, props);
    super(scope, id, { ...props, env: config.env })

    // The code that defines your stack goes here
    // example resource
    // const queue = new sqs.Queue(this, 'PaywellEc2Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // Get the default VPC. This is the network where your instance will be provisioned
    // All activated regions in AWS have a default vpc. 
    // You can create your own of course as well. https://aws.amazon.com/vpc/
    const defaultVpc = ec2.Vpc.fromLookup(this, 'VPC', { isDefault: true })

    // Lets create a role for the instance
    // You can attach permissions to a role and determine what your
    // instance can or can not do
      const role = new iam.Role(
        this,
        'paywell-instance-1-role', // this is a unique id that will represent this resource in a Cloudformation template
        { assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com') }
      )

    // lets create a security group for our instance
    // A security group acts as a virtual firewall for your instance to control inbound and outbound traffic.
    const securityGroup = new ec2.SecurityGroup(
      this,
      'paywell-instance-1-sg',
      {
        vpc: defaultVpc,
        allowAllOutbound: true, // will let your instance send outboud traffic
        securityGroupName: 'paywell-instance-1-sg',
      }
    )

    // lets use the security group to allow inbound traffic on specific ports
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allows SSH access from Internet'
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allows HTTP access from Internet'
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allows HTTPS access from Internet'
    )

    // Finally lets provision our ec2 instance
    const ec2Instance = new ec2.Instance(this, 'paywell-instance-1', {
      vpc: defaultVpc,
      role: role,
      securityGroup: securityGroup,
      instanceName: 'paywell-instance-1',
      instanceType: ec2.InstanceType.of( // t2.micro has free tier usage in aws
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),

      keyName: 'paywell-instance-1-key', // we will create this in the console before we deploy
    })


    // 👇 load contents of script
    const userDataScript = readFileSync('./lib/user-data.sh', 'utf8');
    // 👇 add the User Data script to the Instance
    // ec2Instance.addUserData(userDataScript);

    // cdk lets us output prperties of the resources we create after they are created
    // we want the ip address of this new instance so we can ssh into it later
    new cdk.CfnOutput(this, 'paywell-instance-1-output', {
      value: ec2Instance.instancePublicIp
    })
  }
}

# Context-Aware-Fraud-Detection
Context Aware Fraud Detection using advanced analytics to protect against fraud

  With the advent of technology, the user's context is proving to be very helpful in tracking any kind of fraud. Context-aware fraud detection is detection of fraud using the user�s context like location, social media contributions, preferences, etc. In the coming years, enterprises are expected to increasingly invest in context-aware applications and technologies. So accessing user contexts will become easier. However, analysis of such complex and vast data is proving to be time consuming and expensive for small businesses. They need a dedicated application to provide accurate analysis of their data according to their specifications without utilizing a large number of resources. Also they need this analyzed data in an easy to understand format which they can easily scan through without investing a huge amount of time. 

In the early days it was quite impossible for companies to track if their employees were being honest. There was no way to know if the leaves of absence an employee took were legitimate or not or if the medical bills he claimed from the company were justified or not. This kind of employee behavior always affects the productivity of an organization especially if they are working on commercially crucial projects. So detection of fraud in these situations is turning out to be one of the key focus points for organizations today. A well-designed fraud detection application can benefit the organizations and improve their profitability. 

Our application will analyze insurance claims to detect fraud. Every medical insurance claim has an ICD (International Classification of Diseases) code and a CPT (Current Procedural Terminology) code. The ICD code represents the diagnosis in the claim and the CPT code is used to determine the procedure (surgical or non-surgical) performed on the patient. Our application will use the costs associated with the CPT codes and match it with the cost claimed in the insurance claim. If there is a significant difference between the two, the claim will be marked conceivable as fraud. Our application will also perform statistical analysis on the data to create graphical representations that will be helpful to identify the patterns in fraud, areas where fraud mostly occurs and prevention techniques.

To run the project:

1. Install JDK 7
	sudo apt-get install python-software-properties sudo add-apt-repository ppa:webupd8team/java sudo apt-get update
	sudo apt-get install oracle-java7-installer -y
	
2. Install zookeeper

3. Install Drill in distributed mode

4. Install Mongodb
￼
	a. Import the public key used by the package management system.
		sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
	b. Create a list file for MongoDB
		echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d mongodb-org-3.0.list
	c. Reload local package database sudo apt-get update
	d. Install the MongoDB packages.
	sudo apt-get install -y mongodb-org

To start zookeeper:
	sudo service zookeeper start

To start Apache Drill:
	cd apache-drill-1.1.0/
	bin/drillbit.sh start
	bin/drill-localhost : to start drill shell 
	<host>:8047/query : to start web console

To start mongodb:
	sudo service mongod start
	
Install and start Redis cache:

1. Command to download Redis tar file:
	wget http://download.redis.io/redis-stable.tar.gz
		
2. Command to unzip tar file:
	tar xvzf redis-stable.tar.gz

3. Command to change Directory to redis: 
	cd redis-stable

4. Command to build Redis: 
	make

5. Commands to copy Redis server and client to /usr/local/bin path 
	sudo cp src/redis-server /usr/local/bin/
	sudo cp src/redis-cli /usr/local/bin/

6. Command to start Redis server
	redis-server

Start the application:

1. Fork the Github project

2. Run the app.js
	~/Context-Aware-Fraud-Detection$ nodejs app.js
	nodejs app.js
# ComfortBox: Setup RabbitMQ and KairosDB (on a RaspberryPi):

1. Setup WiFi of the ComfortBox with the Particle App
2. Check Particle API commands using curl or Postman
	```bash
	curl https://api.particle.io/v1/devices/events -d "name=220037000f47343432313031/display" -d "data=HelloWorld!" -d "private=false" -d "ttl=60" -d "access_token=enter_Particle_token_here"
	```
	```bash
	curl https://api.particle.io/v1/devices/events -d "name=220037000f47343432313031/led" -d "data=/////wAAAP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" -d "private=false" -d "ttl=60" -d "access_token=enter_Particle_token_here"
	```
	```bash
	curl https://api.particle.io/v1/devices/220037000f47343432313031/set_interval -d "arg=5000" -d "access_token=enter_Particle_token_here"
	```
	```bash
	curl https://api.particle.io/v1/devices/220037000f47343432313031/set_host -d "arg=192.168.1.116:1883" -d "access_token=enter_Particle_token_here"
	```
3. Install RabbitMQ with MQTT Plugin on RaspberryPi (Raspian): [see here for more information](https://www.rabbitmq.com/install-debian.html)
    ```bash
	echo 'deb http://www.rabbitmq.com/debian/ stable main' | sudo tee /etc/apt/sources.list.d/rabbitmq.list
	sudo apt-get update
	sudo apt-get install rabbitmq-server

	sudo rabbitmq-plugins enable rabbitmq_mqtt

	# Setup MQTT plugin config: see example here https://raw.githubusercontent.com/rabbitmq/rabbitmq-server/stable/docs/rabbitmq.config.example
	cd /etc/rabbitmq/
	#curl -L -O https://raw.githubusercontent.com/dwettstein/comfortbox-api-services/master/config/rabbitmq/rabbitmq.config
	curl -L -O https://raw.githubusercontent.com/rabbitmq/rabbitmq-server/stable/docs/rabbitmq.config.example > rabbitmq.config
	vi rabbitmq.config

	sudo service rabbitmq-server restart
	```
4. Check if data is sent by opening: http://raspberrypi:15672/
5. Install KairosDB
    ```bash
	curl -L -O https://github.com/kairosdb/kairosdb/releases/download/v1.1.2/kairosdb_1.1.2-1_all.deb
	sudo dpkg -i kairosdb_1.1.2-1_all.deb
	```
6. Install KairosDB-RabbitMQ plugin
    ```bash
	git clone https://github.com/dwettstein/kairosdb-rabbitmq.git
	
	# Copy necessary files
	cp kairosdb-rabbitmq/dist/lib/* /opt/kairosdb/lib/
	cp kairosdb-rabbitmq/dist/conf/* /opt/kairosdb/conf/
	
	# Update plugin configuration and queue bindings according to your RabbitMQ setup
	cd /opt/kairosdb/conf/
	#curl -L -O https://raw.githubusercontent.com/dwettstein/comfortbox-api-services/master/config/kairosdb-rabbitmq/kairosdb-rabbitmq.properties
	#curl -L -O https://raw.githubusercontent.com/dwettstein/comfortbox-api-services/master/config/kairosdb-rabbitmq/bindings.json
	vi kairosdb-rabbitmq.properties
	vi bindings.json

	sudo service kairosdb restart 
	```
7. Check if data is received by opening: http://raspberrypi:8080/
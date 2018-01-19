# ComfortBox: Setup RabbitMQ, KairosDB and optionally Grafana:

1. Setup WiFi of the ComfortBox with the Particle App
2. Check Particle API commands using curl or Postman

    ```bash
    # Display text
    curl https://api.particle.io/v1/devices/events -H "Authorization: Bearer enter_Particle_token_here" -d "name=220037000f47343432313031/display" -d "data=HelloWorld!" -d "private=false" -d "ttl=60"

    # Display colors
    curl https://api.particle.io/v1/devices/events -H "Authorization: Bearer enter_Particle_token_here" -d "name=220037000f47343432313031/led" -d "data=/////wAAAP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" -d "private=false" -d "ttl=60"

    # Set sample interval
    curl https://api.particle.io/v1/devices/220037000f47343432313031/set_interval -H "Authorization: Bearer enter_Particle_token_here" -d "arg=5000"

    # Set MQTT server
    curl https://api.particle.io/v1/devices/220037000f47343432313031/set_host -H "Authorization: Bearer enter_Particle_token_here" -d "arg=192.168.1.116:1883"

    # Display sensors data on the box
    curl https://api.particle.io/v1/devices/220037000f47343432313031/displayData -H "Authorization: Bearer enter_Particle_token_here" -d "arg="

    ```
3. Install and configure LetsEncrypt for a valid certificate - [see here for more information](https://letsencrypt.org/getting-started/)

    ```bash
    sudo apt-get install letsencrypt

    # Generate certificate
    letsencrypt certonly --standalone -d change_to_your_servers_public_hostname

    cd /etc/letsencrypt/live/change_to_your_servers_public_hostname/

    # Download and edit the configuration script for using LetsEncrpyt with Jetty
    curl -L -O https://gist.githubusercontent.com/dwettstein/b6e5326e87550a30ea5c104f95436793/raw/ace7aea4dec40b260f58bb6af065bb912a35fc08/letsencrypt-jetty.sh
    vi letsencrypt-jetty.sh

    crontab -e
    # Add the following lines to your CronTab job:
    # 30 2 * * 1 pkill node-red && (letsencrypt renew >> /var/log/le-renew.log) && (nohup node-red &)
    # 45 2 * * 1 cd /etc/letsencrypt/live/change_to_your_servers_public_hostname/ &&  (sh letsencrypt-jetty.sh >> /var/log/le-renew.log)
    ```
4. Install RabbitMQ with MQTT Plugin - [see here for more information](https://www.rabbitmq.com/install-debian.html)

    ```bash
    echo 'deb http://www.rabbitmq.com/debian/ stable main' | sudo tee /etc/apt/sources.list.d/rabbitmq.list
    sudo apt-get update
    sudo apt-get install rabbitmq-server

    # Create new user
    sudo rabbitmqctl add_user sa-comfortbox change_to_your_password
    sudo rabbitmqctl set_user_tags sa-comfortbox management
    sudo rabbitmqctl set_permissions -p / sa-comfortbox ".*" ".*" ".*"

    # Optional: Enable Browser GUI
    sudo rabbitmq-plugins enable rabbitmq_management

    # Setup MQTT plugin config: see example here https://raw.githubusercontent.com/rabbitmq/rabbitmq-server/stable/docs/rabbitmq.config.example
    sudo rabbitmq-plugins enable rabbitmq_mqtt
    cd /etc/rabbitmq/
    #curl -L -O https://raw.githubusercontent.com/dwettstein/comfortbox-api-services/master/configs/rabbitmq/rabbitmq.config
    curl -L -O https://raw.githubusercontent.com/rabbitmq/rabbitmq-server/stable/docs/rabbitmq.config.example > rabbitmq.config
    vi rabbitmq.config

    sudo service rabbitmq-server restart
    ```
5. Check if data is sent by opening: https://localhost:15672/ (default login: guest - guest)
6. Install Cassandra - [see here for more information](https://cassandra.apache.org/download/)

    ```bash
    echo "deb http://www.apache.org/dist/cassandra/debian 30x main" | sudo tee -a /etc/apt/sources.list.d/cassandra.sources.list
    curl https://www.apache.org/dist/cassandra/KEYS | sudo apt-key add -
    sudo apt-get update
    sudo apt-get install cassandra

    # Update Cassandra configuration
    cd /etc/cassandra/
    #curl -L -O https://raw.githubusercontent.com/dwettstein/comfortbox-api-services/master/configs/cassandra/cassandra.yaml
    vi cassandra.yaml
    # Update the following settings:
    # cluster_name: 'KairosDB'
    # start_rpc: true

    sudo service cassandra start
    ```
7. Install KairosDB - [see here for more information](https://kairosdb.github.io/docs/build/html/index.html)

    ```bash
    curl -L -O https://github.com/kairosdb/kairosdb/releases/download/v1.1.3/kairosdb_1.1.3-1_all.deb
    sudo dpkg -i kairosdb_1.1.3-1_all.deb

    # Update plugin configuration and queue bindings according to your RabbitMQ setup
    cd /opt/kairosdb/conf
    #curl -L -O https://raw.githubusercontent.com/dwettstein/comfortbox-api-services/master/configs/kairosdb/kairosdb.properties
    vi kairosdb.properties
    # Update: kairosdb.jetty.ssl.port, kairosdb.jetty.ssl.keystore.path, kairosdb.jetty.ssl.keystore.password, kairosdb.jetty.basic_auth.user, kairosdb.jetty.basic_auth.password
    # Set: kairosdb.service.datastore=org.kairosdb.datastore.cassandra.CassandraModule
    # Update: kairosdb.datastore.cassandra.host_list=localhost:9160, kairosdb.datastore.cassandra.keyspace=kairosdb
    ```
8. Install KairosDB-RabbitMQ plugin

    ```bash
    curl -L -O https://github.com/dwettstein/kairosdb-rabbitmq/archive/v1.1.3-1-autoupdate.tar.gz
    tar -xzf kairosdb-rabbitmq-1.1.3-1-autoupdate.tar.gz
    #tar -xzf v1.1.3-1-autoupdate.tar.gz

    # Copy necessary files
    cp -n kairosdb-rabbitmq-1.1.3-1-autoupdate/dist/lib/* /opt/kairosdb/lib/
    cp -n kairosdb-rabbitmq-1.1.3-1-autoupdate/dist/conf/* /opt/kairosdb/conf/

    # Update plugin configuration and queue bindings according to your RabbitMQ setup
    cd /opt/kairosdb/conf/
    #curl -L -O https://raw.githubusercontent.com/dwettstein/comfortbox-api-services/master/configs/kairosdb-rabbitmq/kairosdb-rabbitmq.properties
    #curl -L -O https://raw.githubusercontent.com/dwettstein/comfortbox-api-services/master/configs/kairosdb-rabbitmq/bindings.json
    vi kairosdb-rabbitmq.properties
    vi bindings.json

    sudo service kairosdb restart
    ```
9. Check if data is received by opening: https://localhost:8080/
10. Install Node-RED - [see here for more information](https://nodered.org/docs/getting-started/installation)

    ```bash
    # Install Node.js if not already done: https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions

    sudo npm install -g node-red

    # Update the configuration
    cd ~/.node-red
    #curl -L -O https://raw.githubusercontent.com/dwettstein/comfortbox-api-services/master/configs/node-red/settings.js
    vi settings.js
    # uiPort: process.env.PORT || 443,
    # https: {
    #     key: fs.readFileSync('/etc/letsencrypt/live/change_to_your_servers_public_hostname/privkey.pem'),
    #     cert: fs.readFileSync('/etc/letsencrypt/live/change_to_your_servers_public_hostname/cert.pem')
    # },
    # requireHttps: true,

    # [Optional] Authorization: (For generating the password hash, see here: https://nodered.org/docs/security.html)
    # adminAuth: {
    #     type: "credentials",
    #     users: [{
    #         username: "admin",
    #         password: "$2a$08$SN21cq4vhVLQt4t/VgHsceRGs9gh6QQSj9/tA0l2tBC.YPdwLeqQW",
    #         permissions: "*"
    #     }]
    # },

    ```
11. [Optional] Install Grafana GUI - [see here for more information](http://docs.grafana.org/installation/debian/)

    ```bash
    curl -L -O --insecure https://dl.bintray.com/fg2it/deb-rpi-1b/main/g/grafana_4.6.3_armhf.deb
    #curl -L -O https://s3-us-west-2.amazonaws.com/grafana-releases/release/grafana_4.6.3_amd64.deb
    sudo apt-get install adduser libfontconfig
    sudo dpkg -i grafana_4.6.3_armhf.deb

    # Update the server section of the configuration
    cd /etc/grafana
    #curl -L -O https://raw.githubusercontent.com/dwettstein/comfortbox-api-services/master/configs/grafana/grafana.ini
    vi grafana.ini
    # protocol = https
    # http_port = 8443
    # domain = change_to_your_servers_public_hostname
    # root_url = https://change_to_your_servers_public_hostname:443
    # cert_file = /etc/letsencrypt/live/change_to_your_servers_public_hostname/cert.pem
    # cert_key = /etc/letsencrypt/live/change_to_your_servers_public_hostname/privkey.pem

    # [Optional] Setup autostart of Grafana
    sudo systemctl daemon-reload
    sudo systemctl enable grafana-server.service

    sudo service grafana-server start
    ```
12. [Optional] Check if Grafana is running by opening: https://localhost:443 (default login: admin - admin)
    - Install KairosDB plugin - [see here for more information](https://grafana.net/plugins/grafana-kairosdb-datasource)

        ```bash
        grafana-cli plugins install grafana-kairosdb-datasource
        sudo service grafana-server restart
        ```
    - Add KairosDB datasource in Grafana GUI
        - Name: `KairosDB`
        - Type: `KairosDB`
        - Url: `https://localhost:8080`
        - If the data source cannot be connected, try the option "Skip TLS Verification (Insecure)"
    - Download and import the example Dashboard from [here](https://github.com/dwettstein/comfortbox-api-services/raw/master/configs/grafana/ComfortBox_7-1513874990750): https://raw.githubusercontent.com/dwettstein/comfortbox-api-services/master/configs/grafana/ComfortBox_7-1513874990750

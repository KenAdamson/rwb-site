#Smartsheet Data Aggregator
A command line application that updates an existing sheet with data from external sources.
* * *

##Purpose

The Smartsheet Data Aggregator is an application that uses one or more external data sources to update existing rows in a Smartsheet with values determined by a lookup column in the sheet.

###Revision History

Data Aggregator 1.0 (Sheet Updater 2.0) - Jan 3, 2014.

* Adding connectors for MySQL, OpenLDAP, and REST GET. 
* Refactored  config files for better readability. 
* Changed name to Data Aggregator (v1).

Sheet Updater 1.0 - Dec 5, 2013.

* Baseline application that works with CSV files. 

###Use Case

Let’s assume your goal is to keep a sheet updated based on changes in two external CSV files - one from an employee directory and another from an issue tracking system. The Data Aggregator uses values from the sheet to search for matches in the given employees.csv and issues.csv files, and then maps the results with the columns in the sheet. 

A simple example of this scenario is illustrated in the diagram below. The yellow indicates the lookup values (such as unique user or record IDs) which are expected by the Data Aggregator to be in your sheet, and are used to find matching records in the external system. The red indicates where the values from the matching records will be placed on the sheet.

![Data Aggregator Mappings Illustration](https://googledrive.com/host/0Bx6R6UA4-C6zc2NrcVZVQVNRR28/mappings4.png)

###Smartsheet API

The Smartsheet Data Aggregator utilizes the Smartsheet API, which provides a REST interface to Smartsheet features and data. The API enables Smartsheet customers to programmatically access and manage their data, and empowers application developers to build solutions on top of Smartsheet.

For more information about the Smartsheet API, please visit [the Smartsheet Developer Portal](http://www.smartsheet.com/developers) for full[ API Documentation](http://www.smartsheet.com/developers/api-documentation) and[ sample applications](https://www.smartsheet.com/developers/apps).


###Dependencies

The Data Aggregator application was built and tested using Python 2.7.5, and depends on the libraries listed in the next section.

**Requests** -- In addition to the standard Python libraries this application requires the "requests" library that is available at [http://docs.python-requests.org/en/latest/](http://docs.python-requests.org/en/latest/)

**MySQL-Python** -- To use the MySQL connector, the MySQL-Python library is required. 

In order for the library to compile it will need access to an instance of MySQL, as well as the MySQL developer libraries. If using apt-get on any Debian-based distribution, such as Ubuntu, you would run the following three commands:

	sudo apt-get install mysql-server
	sudo apt-get install libmysqlclient-dev
	sudo pip install mysql-python`

If you don’t plan on using the MySQL connector, and don’t want to install these additional libraries on your system, just comment out the `import MySQLdb` statement on line 20 of `sources.py`, as well as the entirety of the `MySQLSource` class.

More information on MySQL-Python can be found at the project web site: [http://mysql-python.sourceforge.net/](http://mysql-python.sourceforge.net/)

**python-ldap** -- Connecting to OpenLDAP requires the python-ldap library. In order to compile the module you’ll need to have the development files for OpenLDAP. On Ubuntu you can get these files with the following:

	sudo apt-get install python-dev libldap2-dev
	sudo pip install python-ldap`

More information on python-ldap can be found at the project web site:  [http://python-ldap.org/](http://python-ldap.org/)

##Installation

The application runs locally on any system that can access the Smartsheet API. On a Unix/Linux based system a good place to install the dataAggregator folder is in the ‘/opt/’ directory. If that directory doesn’t already exist, create it with the following command in the command line: 

	sudo mkdir /opt

Now place the dataAggregator directory in the ‘opt’ directory. 

The dataAggregator directory includes:

* **main.py** -- primary application script. This is the main file that runs the application.
* **app.json** -- configuration settings for the whole application
* **mapping.json** -- configuration file that maps values in the external source to the sheet
* **sources.json** -- configuration file that holds information about each source that the application queries. 
* **sources.py** -- Python class file that houses each of the external connectors
* **config.py** -- a utility class that deals with app configurations
* **employees.csv** -- example CSV source file
* **issues.csv** -- example CSV source file

##Configuration

The Smartsheet Data Aggregator is configured by a series of JSON files: `app.json`, `mappings.json` and `sources.json`.

###app.json

This file contains general settings for the whole application.

	{
		"accessToken": "your_token_here",
		"apiURL": "https://api.smartsheet.com/1.1",
		"logLevel": "logging.WARNING",
		"logFileName": "dougFir.log",
		"logFileMaxBytes": 10000,
		"logFileBackupCount": 10
	}

Brief description of the attributes:

* **accessToken** -- Smartsheet API access token. See the next section called ‘Generate API Access Token’ for instructions on how to create your token
* **apiURL** -- url of the Smartsheet API
* **logLevel** -- level of logging output
* **logFileName** -- name of the file for the log. Leave blank if you want to see the logging output in command line
* **logFileMaxBytes** -- the max size of a single log file. Once the file reaches this size the logger will create a new file.
* **logFileBackupCount** -- max number of log files to keep. Once the logger creates this many files the oldest will be deleted, and this number of files will remain

####Generate API Access Token

For the Data Aggregator application to access Smartsheet, an API Access Token will need to be generated via your Smartsheet account. Please review the Smartsheet API documentation section on how to [generate a Smartsheet Access Token](http://www.google.com/url?q=http%3A%2F%2Fwww.smartsheet.com%2Fdevelopers%2Fapi-documentation%23h.5osh0dl59e5m&sa=D&sntz=1&usg=AFQjCNFv3Ithnb6Ghc_ynWko0jASYkGq3A).

When the token is generated, copy and paste it into the app.json file as value for accessToken:

	"accessToken" = “your_token_here”,

Next, you’ll need to configure the application to use your sources and map the values from those sources to the appropriate columns in a sheet.

###sources.json

The `sources.json` file contains the settings for each of the application’s source connectors. The following section explains each source connector configuration that is included in this package.

**CSV**

The CSV source connector searches the rows of a specified CSV file for the lookup value.  An example of a source node for a CSV source called "employees" is below:

	{
		"sourceId": "employees",
		"connectorClassName": "CSVSource",
		"fileName":"employees.csv",
		"isStrict": false
	}

Brief description of each of the configuration settings: 

* **sourceId** -- a descriptive name that will help you identify the source 
* **connectorClassName** -- the class used to parse the source. 
* **fileName** -- name of the CSV file
* **isStrict** -- setting that tells the Smartsheet API to be strict or lenient with cell validation. This setting is optional for each source, and is set to false by default if not specified in the source configuration settings. 

**MySQL**

The MySQL connector queries the given database with the value of the lookupQuery setting, and then maps the results of the first record returned with the output mapping columns in the sheet. The configuration for the MySQL looks like this:

	{
		"sourceId": "productDB",
		"connectorClassName": "MySQLSource",
		"dbServer": "localhost",
		"dbUser": "root",
		"dbPassword": "root",
		"dbName": "dvDB",
		"lookupQuery": "SELECT sku,name,description,price,quantity FROM product WHERE sku = %s",
		"isStrict": false
	}

Brief description of each of the configuration settings: 

* **sourceId** -- a descriptive name that will help you identify the source 
* **connectorClassName** -- the class used to parse the source
* **dbServer** -- location of MySQL database server
* **dbUser** -- username for MySQL user
* **dbPassword** -- password for MySQL user
* **dbName** -- database name 
* **lookupQuery** --  SQL query for getting the output values based on the lookup value. The `%s` denotes where the lookup value will be placed into the query.
* **isStrict** -- setting that tells the Smartsheet API to be strict or lenient with cell validation. This setting is optional for each source, and is set to false by default if not specified in the source configuration settings.

**OpenLDAP**

The OpenLDAP connector searches a specified LDAP organizational unit for a given user, or cn. The configuration of the OpenLDAP source looks like this:

	{
		"sourceId": "openldap",
		"connectorClassName": "OpenLDAPSource",
		"ldapServer": "127.0.0.1",
		"baseDN": "dc=smartsheet,dc=com",
		"orgUnit": "ou=people",
		"adminUser": "cn=admin",
		"adminPass": "smart",
		"searchFilter": "cn=*{}*",
		"retrieveAttributes": "givenName,sn,roomNumber,mail,telephoneNumber",
		"ldapTimeout": 0,
		"isStrict": false
	}

Brief description of each of the configuration settings: 

* **sourceId** -- a descriptive name that will help you identify the source 
* **connectorClassName** -- the class used to parse the source
* **ldapServer** -- location of LDAP server
* **baseDN** -- base distinguished name on which the search is performed
* **orgUnit** -- organizational unit in the baseDN where the search is performed
* **adminUser** -- cn of the user that is performing the search
* **adminPass**-- password of the user performing the search
* **searchFilter** -- LDAP search filter. The {} denotes where the lookup value will go.
* **retrieveAttributes** -- an array of the attributes to return in LDAP search. Leave array blank to return all attributes
* **ldapTimeout** -- number of seconds before LDAP search times out. If set to a negative number, the search will never time out.
* **isStrict** -- setting that tells the Smartsheet API to be strict or lenient with cell validation. This setting is optional for each source, and is set to false by default if not specified in the source configuration settings.

**REST GET**

The REST GET source connector calls the given API and maps the returning JSON object’s top level attributes (or attributes of the first object in the array if isArray = true) to the appropriate columns in the sheet being updated. The configuration for this connector looks like this:

	{
		"sourceId": "markitOnDemandAPI",
		"connectorClassName": "RestGETSource",
		"apiUrl":"http://dev.markitondemand.com/Api/v2/Quote/json?symbol={}",
		"isArray": false,
		"isStrict": false
	}

Brief description of each of the configuration settings: 

* **sourceId** -- a descriptive name that will help you identify the source
* **connectorClassName** -- the class used to parse the source
* **apiUrl** -- URL of API. The {} denotes where the lookup value will go inside of the URL.
* **isArray** -- flag indicating whether the API response is an array
* **isStrict** -- setting that tells the Smartsheet API to be strict or lenient with cell validation. This setting is optional for each source, and is set to false by default if not specified in the source configuration settings.

**Other**

Additional source connectors can be created to support any data source, public or private. To create a new connector create a connector source class in the `sources.py` module.  The class should follow the same structure as the other source connector classes. Namely, the new class should include the following functions:

	def __init__(self, sourceConfig):
		# validates the sourceConfig
	
	def findSourceMatch(self, lookupVal, lookupIndex):
		# queries source and returns matchingRecord`

Each new source will also need a sourceConfig entry in the `sources.json` file. Each sourceConfig must have a sourceId attribute set to a unique value, as well as a  connectorClassName attribute that is set to the name of the new connector source class.

**mappings.json**

The `mappings.json` file contains mappings for one or more sheets. In this file the columns from the external system, or source, are mapped to corresponding columns in the sheet. 

An example of a mapping node using the employees source in the `mappings.json` file is as follows:

	{
		"sheetId": 1234567890123456,
		"sources": [
			{
				"sourceId": "employees",
				"lookupMapping": {
					"sourceKey": 0, 
					"sheetColumn": "UserId"
				},

				"outputMappings": [
					{
						"sourceKey": 2,
						"sheetColumn": "Department"

					},
					{
						"sourceColumnIndex": 1,
						"sheetColumn": "Email"

					}
				]
			}
		]
	}

Each mapping configuration is made up of the following attributes:

* **sheetId** -- The id of the sheet to be updated. There are two ways to find a sheet’s ID.

    * To find the Sheet ID through the Smartsheet UI click on the dropdown arrow on the sheet tab, and go to Properties:

    * ![Sheet Properties](https://googledrive.com/host/0Bx6R6UA4-C6zc2NrcVZVQVNRR28/sheetProperties.png) 

    * The sheet ID can also be found by [using the GET SHEET method](http://www.smartsheet.com/developers/api-documentation#h.4930jur8qsvs) through the [Smartsheet API.](http://www.smartsheet.com/developers/api-documentation)

* **sources**
    * **name** -- name of the source set in the sources.json file
    * **lookupMapping** -- maps the value in the source file with the lookup value in the sheet
        * **sourceKey** -- the name or position of the lookup value in the source record:
        * ![sourceKey Illustration](https://googledrive.com/host/0Bx6R6UA4-C6zc2NrcVZVQVNRR28/sourceKey.png)
        * **sheetColumn** -- the name of the sheet column that contains the lookup value 
    * **outputMappings** -- maps which values in the source update which cells in the sheet. 
        * **sourceKey** -- the name or position in the source record of the value to send to sheet
        * **sheetColumn** -- the name of the sheet column that will be updated with the `sourceKey `value

###Adding Columns

Each `outputMapping` represents a column in the sheet. To add additional columns to the update process, find the `sourceKey` in the source, the corresponding column name in the sheet, and simply create another `outputMappings` node with those values. 

Now with everything configured, you can run the application with the following command:

	python main.py

###Setup to Run on Schedule

The Data Aggregator application can be configured to automatically run on a schedule,.  Please refer to your system documentation for details on how to setup a scheduled job.  Here is how to add Data Aggregator as a scheduled cron job on a UNIX/Linux system:

	sudo crontab -u root -e

This opens a [VI style](http://www.cs.colostate.edu/helpdocs/vi.html) editor. In the editor, press ‘i’ to insert the new job. A common cron job that would run the application every day at 1am would look like this:

	* 1 * * * python /opt/dataAggregator/main.py

Each of the asterisks represents a unit of time.  Starting with the most left position

* minute ( 0-59 ) -- the minute the job runs every hour
* hour ( 0-23 ) -- the hour the job runs every day
* day of the month ( 1-31 ) -- the day of the month the job runs every month
* month ( 0-12) -- the month the job runs every year
* day of week ( 0-6 ) ( 0 to 6 are Sunday to Saturday, or use names ) -- day the job runs each week

To have the cron job send an email of the application output each time it runs add the following line to the top of the crontab file:

	MAILTO="your.email@yourdomain.com"
		
When you’re done editing hit the ‘esc’ key and then type :wq to save and close the crontab file.

###Help and Contact

If you have any questions or suggestions about this document, the application, or about the Smartsheet API in general please contact us at api@smartsheet.com. Development questions can also be posted to[ Stackoverflow](http://stackoverflow.com/) with the tag[ smartsheet-api](http://stackoverflow.com/questions/tagged/smartsheet-api).

The Smartsheet Platform team
* * *
###License

Copyright 2014 Smartsheet, Inc.

    

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    

http://www.apache.org/licenses/LICENSE-2.0

    

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.             


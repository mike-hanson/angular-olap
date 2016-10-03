# angular-olap
A pair of services for accessing an OLAP endpoint using XML/A over HTTP

## Work In Progress
This library is very much a work in progress.  I am currently working on a complex AngularJS project that provides analysis features that access a Microsoft SQL Server Analysis Services (SSAS) OLAP Cube via HTTP using XML/A and MDX queries.  I am building the library as I go so it's features are very much limited to what I need at this time.

Feel free to use the library and offer up feedback, but expect it to be a bit unstable for a while.  I will use simple SEMVER versioning maintaining it at v1.0.0 until it is ready for release but adding alpha*n* or beta*n* to give some indication of the current state.

My priority is the xmlaService that handles submitting MDX queries and transforming results to JavaScript objects for binding.  Later when we start building our report designer the mdxService will start to take shape.

## Installation
You can of course download the source code and use the files from the dist folder, but the best way to install the package is with bower using

```
    bower install angular-olap --save
```

Once it is ready for release I will consider publishing to NuGet, npm and/or other package repositories.

## Usage
Obviously you will need to include the script in your web page somewhere after angular has been loaded

```html
	<script src='https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js'></script>
	<script src='/bower_components/angular-olap/dist/angular-olap.min.js'></script>
	<script src='/js/app.js'></script>
```

Next you will need to import the module into your angular application or module

```javascript
// app.js
angular.module('app', ['angular-olap']);
```

And then inject the required services into a controller, directive or service

```javascript
// module.js

angular.module('app')
	.controller('MyController', ['xmlaService', 'mdxService', function(xmlaService, mdxService){
	// following examples go here
}]
```

## Available Components
The library provides three components
- xmlaServiceProvider
- xmlaService
- mdxService

### xmlaServiceProvider
This angular provider allows you to configure default configuration settings for the xmlaService during the config cycle of an angular application or module.

### xmlaService
This service handles communication with the OLAP server over HTTP using the Angular $http service.  It supports many of the XML/A Discover request types and the Statement command for the XML/A Execute method.  There are no plans at this stage to support any other Execute commands.

### mdxServcie
The service is intended to support tools that allow users to create reports and dashboards and provides a fluent interface for build MDX queries.

## Configuration

To communicate with an OLAP server the xmlaService requires certain information.  You can provide this separately for on each method call, but for convenience you can also set it once during the config cycle of your angular application or module.  The library includes an xmlaServiceProvider that can be used to set default values for the required settings.  These can still be overridden on calling a method.

The simplest way to use the provider is by calling the **config** method passing an object representing a map of the settings and values.

```javascript
// app.js
angular.module('app', ['angular-olap'])
	.config(['xmlaServiceProvider', function(xmlServiceProvider){
		xmlaServiceProvider.config({
			url: 'http://localhost:8056/olap/msmdpump.dll',
			dataSourceName: 'OLAPSERVER',
			catalogName: 'MyDb',
			username: 'olapuser',
			password: 'p@55word'
		});
	}]);
```

However if you prefer there is a method corresponding to each setting, which allows you to query or set the current value.  The following code sample is the method based equivalent of the above.

```javascript
// app.js
angular.module('app', ['angular-olap'])
	.config(['xmlaServiceProvider', function(xmlServiceProvider){
		xmlaServiceProvider.url('http://localhost:8056/olap/msmdpump.dll');
		xmlaServiceProvider.dataSourceName('OLAPSERVER');
		xmlaServiceProvider.catalogName('MyDb');
		xmlaServiceProvider.username('olapuser');
		xmlaServiceProvider.password('p@55word');
		});
	}]);
```

In both examples the url, username and password settings should be self explanatory.  However if you are not familiar with XML/A **dataSourceName** and **catalogName** may need a little explanation.

A single XML/A endpoint can be used to access multiple OLAP data sources.  You would typically learn about these by sending an XML/A Discover request for the DISCOVER_DATASOURCES rowset.  With Microsoft SQL Server Analysis Services (SSAS) I have only ever seen this return a single row containing the name of the SSAS Instance.

A single XML/A Data Source can host multiple Catalogs.  You would typically learn about these by sending an XML/A Discover request for the DISCOVER_CATALOGS rowset.  SSAS refers to a Catalog as a Database so this Discover request returns a list of the databases hosted by the SSAS Instance.

Whether you use the provider to set the username and password is entirely up to you, there are obvious security implications in a public application, but you might be a bit more relaxed in an Intranet environment.  The choice is yours, security of information is your responsibility.

## XML/A
If you aren't familiar with XML/A you might want to learn at least the basics before reading any further, or at least have some information to hand that you can reference as you work your way through the APIs provided by the xmlaService.  You can find the reference documentation at [MSDN XML/A](https://msdn.microsoft.com/en-us/library/ms186604(v=sql.120).aspx "MSDN XMLA reference documentation")


## Discovery

The XML/A Discover method allows you to learn what objects and features are available via an endpoint.  xmlaService provides a set of **discoverXxxx** methods that correspond to sets of information defined by the XML/A specification.  All of these methods take a single *config* argument that should include fields required by the specific method.  If something required is not provided the method will throw an error to let you know what is missing.  All of these methods return an array of JavaScript objects.  The methods are presented in the order you are most likely to use them.


#### discoverDataSources

This method requires only the **url** and security credentials if required by the end point.

It returns a












(function (window, substitute) {
    describe('XmlaServiceProvider', function () {
        var olap = (window.olap = window.olap || {});
        var arg, serviceProvider;
        var testUrl = 'http://somedomain.com',
            testUsername = 'mikeh',
            testPassword = 'p@ssword',
            testDataSourceName = 'My Data Source',
            testCatalogName = 'My Catalog';

        beforeEach(function () {
            substitute.throwErrors();
            arg = substitute.arg;
            serviceProvider = new olap.XmlaServiceProvider();
        });

        it('Should be defined', function () {
            expect(serviceProvider).toBeDefined();
        });

        it('Should define a provider function as required by angular', function () {
            var provider = serviceProvider.$get;
            var last = getLastElement(provider);
            expect(provider).toBeDefined();
            expect(provider instanceof Array).toBeTruthy()
            expect(typeof last).toBe('function');
            expect(last.length).toBe(3);
        });

        it('Should define dependency on $http service in provider function', function () {
            var provider = serviceProvider.$get;
            expect(provider[0]).toBe('$http');
        });

        it('Should define dependency on $q service in provider function', function () {
            var provider = serviceProvider.$get;
            expect(provider[1]).toBe('$q');
        });

        it('Should define dependency on $timeout service in provider function', function () {
            var provider = serviceProvider.$get;
            expect(provider[2]).toBe('$timeout');
        });

        it('Should return service instance from provider function', function () {
            var providerFn = getLastElement(serviceProvider.$get);
            var result = providerFn({});
            expect(result instanceof olap.XmlaService).toBeTruthy();
        });

        it('Should define a method to configure the service from an object', function () {
            expect(serviceProvider.config).toBeDefined();
            expect(typeof serviceProvider.config).toBe('function');
        });

        it('Should expect a single object argument to configure the service', function () {
            expect(serviceProvider.config.length).toBe(1);
        });

        it('Should throw an error if config is not an object', function () {
            expect(function(){
                serviceProvider.config('string');
            }).toThrowError('A valid object is required to configure the service with config method.')
        });

        it('Should define a method to set or read url', function () {
            expect(serviceProvider.url).toBeDefined();
            expect(typeof serviceProvider.url).toBe('function');
        });

        it('Should expect optional argument for setting url', function () {
            expect(serviceProvider.url.length).toBe(1);
        });

        it('Should capture and return url once set through method', function () {
            serviceProvider.url(testUrl);
            expect(serviceProvider.url()).toBe(testUrl);
        });

        it('Should return current url when set through config', function () {
            var config = {url: testUrl};
            serviceProvider.config(config);
            expect(serviceProvider.url()).toBe(config.url);
        });

        it('Should define a method to set or read user name', function () {
            expect(serviceProvider.username).toBeDefined();
            expect(typeof serviceProvider.username).toBe('function');
        });

        it('Should expect optional argument for setting user name', function () {
            expect(serviceProvider.username.length).toBe(1);
        });

        it('Should capture and return user name once set through method', function () {
            serviceProvider.username(testUsername);
            expect(serviceProvider.username()).toBe(testUsername);
        });

        it('Should return current user name when set through config', function () {
            var config = {username: testUsername};
            serviceProvider.config(config);
            expect(serviceProvider.username()).toBe(config.username);
        });

        it('Should define a method to set or read password', function () {
            expect(serviceProvider.password).toBeDefined();
            expect(typeof serviceProvider.password).toBe('function');
        });

        it('Should expect optional argument for setting password', function () {
            expect(serviceProvider.password.length).toBe(1);
        });

        it('Should capture and return password once set through method', function () {
            serviceProvider.password(testPassword);
            expect(serviceProvider.password()).toBe(testPassword);
        });

        it('Should return current password when set through config', function () {
            var config = {password: testPassword};
            serviceProvider.config(config);
            expect(serviceProvider.password()).toBe(config.password);
        });

        it('Should define a method to set or read data source name', function () {
            expect(serviceProvider.dataSourceName).toBeDefined();
            expect(typeof serviceProvider.dataSourceName).toBe('function');
        });

        it('Should expect optional argument for setting data source name', function () {
            expect(serviceProvider.dataSourceName.length).toBe(1);
        });

        it('Should capture and return data source name once set through method', function () {
            serviceProvider.dataSourceName(testDataSourceName);
            expect(serviceProvider.dataSourceName()).toBe(testDataSourceName);
        });

        it('Should return current data source name when set through config', function () {
            var config = {dataSourceName: testDataSourceName};
            serviceProvider.config(config);
            expect(serviceProvider.dataSourceName()).toBe(config.dataSourceName);
        });

        it('Should define a method to set or read data source name', function () {
            expect(serviceProvider.catalogName).toBeDefined();
            expect(typeof serviceProvider.catalogName).toBe('function');
        });

        it('Should expect optional argument for setting data source name', function () {
            expect(serviceProvider.catalogName.length).toBe(1);
        });

        it('Should capture and return data source name once set through method', function () {
            serviceProvider.catalogName(testCatalogName);
            expect(serviceProvider.catalogName()).toBe(testCatalogName);
        });

        it('Should return current data source name when set through config', function () {
            var config = {catalogName: testCatalogName};
            serviceProvider.config(config);
            expect(serviceProvider.catalogName()).toBe(config.catalogName);
        });

        function getLastElement(array){
            return array[array.length - 1];
        }
    });
})(window, substitute);
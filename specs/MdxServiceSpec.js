(function (window) {
    describe('MdxService', function () {
        var olap = (window.olap = window.olap || {});
        var service;

        beforeEach(function () {
            service = new olap.MdxService();
        });

        it('Should be defined', function () {
            expect(service).toBeDefined();
        });

        it('Should define a method to start a new query', function () {
            expect(service.new).toBeDefined();
            expect(typeof service.new).toBe('function');
        });

        it('Should return instance of builder on request', function () {
            expect(service.new() instanceof olap.MdxBuilder).toBeTruthy();
        });
    });
})(window);

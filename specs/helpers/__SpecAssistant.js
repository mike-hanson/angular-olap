(function (window, substitute) {

    function SpecAssistant() {
        var self = this;
        self.stubs = {
            task:         ['execute'],
            dataService:  ['findAll',
                           'create',
                           'eject',
                           'find',
                           'save'],
            $state:       ['go'],
            $http:        ['get',
                           'post'],
            $q:           ['defer'],
            $deferred:    {
                resolve: function () {
                },
                reject:  function () {
                },
                promise: null
            },
            jQuery:       ['on'],
            angular:      ['element'],
            event:        ['preventDefault'],
            navTree:      ['add_root_branch',
                           'add_branch',
                           'get_selected_branch',
                           'select_first_branch',
                           'expand_branch'],
            stateFactory: ['create'],
            $cookieStore: ['get',
                           'put',
                           'remove'],
            element: {firstChild:{}}
        };
        self.createAngularCookieStoreSub = function () {
            return substitute.for(self.stubs.$cookieStore);
        };
        self.createScope = function () {
            var scope = {
                $apply:  function (action) {
                    if (action) {
                        action();
                    }
                },
                $on:     function (eventName, handler) {
                },
                $parent: {},
                $watch: function(){}
            };

            var sub = substitute.for(scope);
            sub.callsThrough('$apply');
            return sub;
        };
        self.createAngularForm = function () {
            var form = substitute.for({
                $invalid:      false,
                $setSubmitted: function () {
                    self.$submitted = true;
                },
                $submitted:    false
            });
            form.callsThrough('$setSubmitted');
            return form;
        };
        self.createAngularFormField = function () {
            var field = substitute.for({
                $setDirty: function () {
                    self.$dirty = true;
                },
                $dirty:    false
            });
            field.callsThrough('$setDirty');
            return field;
        };
        self.initialiseAngularSubstitute = function () {
            self.jq = substitute.for(self.stubs.jQuery);
            self.ng = substitute.for(self.stubs.angular);
            self.ng.returns('element', self.jq);
            window.angular = self.ng;
        };
        self.createDataServiceSub = function () {
            return substitute.for(self.stubs.dataService);
        };
        self.createAngularStateSub = function () {
            var sub = substitute.for(self.stubs.$state);
            sub.current = {
                parent: 'parent.state'
            };
            return sub;
        };
        self.createDeferredSub = function () {
            var sub = substitute.for(self.stubs.$deferred);
            sub.promise = substitute.forPromise();
            return sub;
        };
        self.createQSub = function (deferred) {
            var sub = substitute.for(self.stubs.$q);
            var deferredSub = deferred || self.createDeferredSub();
            sub.returns('defer', deferredSub);
            return sub;
        };
        self.createTaskSub = function () {
            return substitute.for(self.stubs.task);
        };
        self.createAngularHttpSub = function () {
            return substitute.for(self.stubs.$http);
        };
        self.createTreeSub = function () {
            return substitute.for(self.stubs.navTree);
        };
        self.createJQuerySub = function () {
            return substitute.for(self.stubs.jQuery);
        };
        self.createElementSub = function(){
            return [substitute.for(self.stubs.element)];
        };
    }
    window.specAssistant = new SpecAssistant();
})(window, substitute);
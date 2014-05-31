describe('Decanat', function () {

    describe('Itself', function () {
        it('should be proper type', function () {
            expect(Decanat)
                .to.exist
                .to.be.a('function');
        });

    });

});

describe('App', function() {

    describe('Events', function(){
        var app;
        
        before(function(){
            app = Decanat();
        });

        it('should be an event emitter', function(done){
            var emitterMethods = ['on', 'once', 'off', 'emit'];

            emitterMethods.forEach(function(methodName){
                expect(app)
                    .to.have.property(methodName)
                    .to.be.a('function');
            });

            app.once('go', done);

            app.emit('go');
        });
    });

    describe('Routing', function(){
        var app;

        beforeEach(function(){
            app = Decanat();
            app.listen();
        });

        it('should have all the methods', function(){
            var routerMethods = [
                    'all', 'show', 'replace', 'dispatch',
                    'listen', 'stopListening'
                ];

            routerMethods.forEach(function(methodName){
                expect(app)
                    .to.have.property(methodName)
                    .to.be.a('function');
            });
        });

        it('should handle special routes', function(done){
            app.all('/test', function(ctx, vp){
                done();
            });

            app.show('/test');
        });

        it('should handle middleware-style routes', function(done){
            app.all('/test', function(ctx, vp, next){
                ctx.someProp = 4;
                next();
            });

            app.all('*', function(ctx, vp){
                expect(ctx.someProp).to.equal(4);
                done();
            });

            app.show('/test');
        });

        afterEach(function(){
            app.stopListening();
        });
    });

    describe('Mounting', function(){
        it('should mount to given path', function(){
            var app1 = Decanat(),
                app2 = Decanat(),
                app3 = Decanat();
            
            app1.use('/test', app2);
            app2.use('/etc', app3);

            expect(app2.base()).to.equal('/test');
            expect(app3.base()).to.equal('/test/etc');
        });

        it('should route through mounted path', function(done){
            var app1 = Decanat(),
                app2 = Decanat();

            app2.all('/test', function(ctx, vp){
                console.log(ctx.path, ctx.canonicalPath);
                done();
            });

            app1.use('/blog', app2);

            app1.listen();

            app1.show('/blog/test');
        });

    });
});
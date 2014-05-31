describe('View', function () {
    var View = Decanat.View;

    describe('Itself', function () {
        it('should be proper type', function () {
            expect(View)
                .to.exist
                .to.be.a('function');
        });

        it('should have core functionality', function () {
            expect(View)
                .to.respondTo('initialize')
                .to.respondTo('delegate');
        });
    });

    describe('Constructor', function(){
        var view = new View({
                id      : 'delusional',
                tagName : 'span',
                other   : 'non-special-option'  
            });

        it('should something', function(){
            expect(view.el)
                .to.have.property('id', 'delusional');

            expect(view.el)
                .to.not.have.property('other');
        });

    });

    describe('Element', function(){
        it('should have functionality', function(){
            expect(View)
                .to.respondTo('setElement');

            expect(View)
                .to.respondTo('_ensureElement')
                .to.respondTo('_createElement')
                .to.respondTo('_removeElement');
        });
    });

});

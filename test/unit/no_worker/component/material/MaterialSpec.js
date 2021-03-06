describe("Material", function() {
    var sandbox = null;
    var material = null;
    var obj;
    var gl;

    var Color = wd.Color;
    var MaterialData = wd.MaterialData;
    var Shader = wd.Shader;
    var DataBufferConfig = wd.DataBufferConfig;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        testTool.clearAndOpenContractCheck(sandbox);


        var data = sceneTool.prepareGameObjectAndAddToScene();
        obj = data.gameObject;
        material = data.material;

        state = stateTool.createAndSetFakeGLState(sandbox);

        gl = stateTool.getGLFromFakeGLState(state);
    });
    afterEach(function () {
        testTool.clear(sandbox);
        sandbox.restore();
    });

    describe("getColor", function() {
        beforeEach(function(){

        });

        it("default color is #ffffff", function(){
            colorTool.judgeIsEqual(materialTool.getColor(material), Color.create("#ffffff"), expect);
        });
    });

    describe("setColor", function() {
        beforeEach(function(){

        });

        it("set color", function(){
            var color = Color.create("#123456");

            materialTool.setColor(material, color);

            colorTool.judgeIsEqual(materialTool.getColor(material), color, expect);
        });
    });

    describe("getOpacity", function() {
        beforeEach(function(){

        });

        it("default is 1.0", function(){
            expect(materialTool.getOpacity(material)).toEqual(1.0);
        });
    });

    describe("getAlphaTest", function() {
        beforeEach(function(){

        });

        it("default is -1", function(){
            expect(materialTool.getAlphaTest(material)).toEqual(-1);
        });
    });

    describe("create", function() {
        beforeEach(function(){
        });

        it("same Material(same class name) share one shader", function(){
            var mat2 = basicMaterialTool.create();
            var mat3 = basicMaterialTool.create();
            var shaderIndex = 0;

            expect(materialTool.getShaderIndex(material.index)).toEqual(shaderIndex);
            expect(materialTool.getShaderIndex(mat2.index)).toEqual(shaderIndex);
            expect(materialTool.getShaderIndex(mat3.index)).toEqual(shaderIndex);
        });
    });

    describe("init", function() {
        beforeEach(function(){

        });

        // it("should not dispose any material before init", function(){
        it("can dispose any material before init", function(){
            var mat2 = basicMaterialTool.create();

            var obj2 = gameObjectTool.create();
            gameObjectTool.addComponent(obj2, mat2);

            gameObjectTool.disposeComponent(obj, material);

            expect(function(){
                directorTool.init(sandbox);
            }).not.toThrow();
        });
        it("shader should only be init once", function () {
            var mat2 = basicMaterialTool.create();

            var obj2 = gameObjectTool.create();
            gameObjectTool.addComponent(obj2, mat2);

            directorTool.init(state);

            expect(gl.linkProgram).toCalledOnce();
        });
    });

    describe("getGameObject", function() {
        beforeEach(function(){

        });

        it("get gameObject who has the material", function(){
            var mat2 = basicMaterialTool.create();

            var obj2 = gameObjectTool.create();
            gameObjectTool.addComponent(obj2, mat2);

            expect(materialTool.getGameObject(mat2)).toEqual(obj2);
        });
    });

    describe("disposeComponent", function() {
        var count;

        function judgeNotAlive(mat, methodName, expect) {
            componentTool.judgeNotAlive(mat, methodName, materialTool, expect);
        }

        beforeEach(function(){
            count = MaterialData.count;
        });

        describe("test remove data", function() {
            beforeEach(function(){
            });

            describe("remove by swap with last one", function() {
                var obj2,mat2;

                beforeEach(function(){
                    mat2 = basicMaterialTool.create();
                    obj2 = gameObjectTool.create();
                    gameObjectTool.addComponent(obj2, mat2);
                    sceneTool.addGameObject(obj2);
                });

                describe("test remove from map", function() {
                    beforeEach(function(){
                    });

                    describe("not reset removed one's value", function(){
                        it("remove from gameObject", function () {
                            it("swap with last one and remove the last one", function () {
                                gameObjectTool.disposeComponent(obj, material);

                                expect(gameObjectTool.hasComponent(obj, wd.Material)).toBeFalsy();
                                expect(gameObjectTool.hasComponent(obj2, wd.Material)).toBeTruthy();
                                judgeNotAlive(material, "getGameObject", expect);
                                expect(materialTool.getGameObject(mat2)).toEqual(obj2);
                                expect(MaterialData.gameObjectMap.length).toEqual(1);
                            });
                        });
                    });
                });

                describe("test remove from type array", function() {
                    beforeEach(function(){
                    });

                    describe("not reset removed one's value", function(){
                        it("remove from shaderIndices", function () {
                            MaterialData.shaderIndices = new Uint32Array([10,2]);

                            gameObjectTool.disposeComponent(obj, material);

                            expect(MaterialData.shaderIndices[0]).toEqual(2);
                            expect(MaterialData.shaderIndices[1]).toEqual(2);
                        });
                    });

                    describe("reset removed one's value", function(){
                        it("remove from colors", function () {
                            var color1 = Color.create("rgb(0.1,0.2,0.3)");
                            var color2 = Color.create("rgb(0.4,0.2,0.3)");
                            materialTool.setColor(material, color1);
                            materialTool.setColor(mat2, color2);

                            gameObjectTool.disposeComponent(obj, material);

                            colorTool.judgeIsEqual(materialTool.getColor(componentTool.createComponent(0)), color2, expect);
                            colorTool.judgeIsEqual(materialTool.getColor(componentTool.createComponent(1)), colorTool.createDefaultColor(MaterialData), expect);
                        });
                        it("remove from opacities", function () {
                            materialTool.setOpacity(material, 0.3);
                            materialTool.setOpacity(mat2, 0.5);

                            gameObjectTool.disposeComponent(obj, material);

                            expect(MaterialData.opacities[0]).toEqual(0.5);
                            expect(MaterialData.opacities[1]).toEqual(MaterialData.defaultOpacity);
                        });
                        it("remove from alphaTests", function () {
                            materialTool.setAlphaTest(material, 0.3);
                            materialTool.setAlphaTest(mat2, 0.5);

                            gameObjectTool.disposeComponent(obj, material);

                            expect(MaterialData.alphaTests[0]).toEqual(0.5);
                            expect(MaterialData.alphaTests[1]).toEqual(MaterialData.defaultAlphaTest);
                        });
                    });
                });

                describe("test remove from materialMap", function() {
                    beforeEach(function(){

                    });

                    it("mark material removed", function () {
                        gameObjectTool.disposeComponent(obj, material);

                        componentTool.judgeIsComponentIndexNotRemoved(material, expect);
                    });
                    it("swap with last one and remove the last one", function () {
                        gameObjectTool.disposeComponent(obj, material);

                        expect(MaterialData.materialMap[0]).toEqual(mat2);
                        expect(MaterialData.materialMap.length).toEqual(1);
                    });
                });
            });
        });

        it("test gameObject add new material after dispose old one", function () {
            gameObjectTool.disposeComponent(obj, material);

            var mat2 = basicMaterialTool.create();


            gameObjectTool.addComponent(obj, mat2);

            materialTool.initMaterial(mat2);

            expect(materialTool.getColor(mat2)).toBeExist();
        });
        it("if material is disposed, operate it should error", function () {
            gameObjectTool.disposeComponent(obj, material);

            judgeNotAlive(material, "getGameObject", expect);
            judgeNotAlive(material, "getColor", expect);
            judgeNotAlive(material, "setColor", expect, Color.create());
            judgeNotAlive(material, "getOpacity", expect);
            judgeNotAlive(material, "setOpacity", expect, 0.5);
            judgeNotAlive(material, "getAlphaTest", expect);
            judgeNotAlive(material, "setAlphaTest", expect, 0.5);
        });
    });

    describe("contract check", function() {
        beforeEach(function(){
            testTool.openContractCheck();
        });

        describe("data.length should not exceed DataBufferConfig->dataBufferCount", function() {
            var mat1,mat2;
            var obj1,obj2;

            function prepareNotExceed() {
                sandbox.stub(DataBufferConfig, "materialDataBufferCount", 1);

                materialTool.resetData();

                mat1.index = 0;
                mat2.index = 1;

                return "should not exceed type arr's length";
            }

            beforeEach(function(){
                mat1 = basicMaterialTool.create();
                obj1 = gameObjectTool.create();
                gameObjectTool.addComponent(obj1, mat1);

                mat2 = basicMaterialTool.create();
                obj2 = gameObjectTool.create();
                gameObjectTool.addComponent(obj2, mat2);
            });

            it("setShaderIndex", function () {
                var errMsg = prepareNotExceed();

                basicMaterialTool.create();
                expect(function () {
                    basicMaterialTool.create();
                }).toThrow(errMsg);
            });
            it("setColor", function(){
                var errMsg = prepareNotExceed();

                var color = Color.create("rgb(0.4,0.2,0.3)");
                materialTool.setColor(mat1, color);
                expect(function () {
                    materialTool.setColor(mat2, color);
                }).toThrow(errMsg);
            });
            it("setOpacity", function(){
                var errMsg = prepareNotExceed();

                materialTool.setOpacity(mat1, 0.1)
                expect(function () {
                    materialTool.setOpacity(mat2, 0.1)
                }).toThrow(errMsg);
            });
            it("setAlphaTest", function(){
                var errMsg = prepareNotExceed();

                materialTool.setAlphaTest(mat1, 0.1)
                expect(function () {
                    materialTool.setAlphaTest(mat2, 0.1)
                }).toThrow(errMsg);
            });
        });
    });
});

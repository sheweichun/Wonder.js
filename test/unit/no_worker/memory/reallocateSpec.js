describe("reallocate memory", function() {
    var sandbox = null;
    var MemoryConfig = wd.MemoryConfig;

    function createGeometry(index){
        return {
            index:index
        }
    }

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        testTool.clearAndOpenContractCheck(sandbox);
    });
    afterEach(function () {
        sandbox.restore();

        testTool.clear(sandbox);
    });

    describe("reallocate if dispose too many", function() {
        describe("test Tag", function() {
            var TagData = wd.TagData;

            var tag1,
                gameObject1;
            var tag2;
            var gameObject2;


            beforeEach(function(){
                tag1 = tagTool.create(2);

                gameObject1 = gameObjectTool.create();

                tagTool.addTag(tag1, "aaa");
                tagTool.addTag(tag1, "bbb");

                gameObjectTool.addComponent(gameObject1, tag1);
            });

            beforeEach(function(){
                sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 1);

                tag2 = tagTool.create(2);

                gameObject2 = gameObjectTool.create();

                tagTool.addTag(tag2, "qqq");

                gameObjectTool.addComponent(gameObject2, tag2);
            });

            it("new tagArray should has no holes", function(){
                gameObjectTool.disposeComponent(gameObject1, tag1);

                expect(TagData.tagArray).toEqual(["qqq"]);
            });
            it("new gameObjectMap,slotCountMap,usedSlotCountMap,indexMap,indexInTagArrayMap,tagMap should only has not-removed data", function(){
                gameObjectTool.disposeComponent(gameObject1, tag1);

                expect(TagData.gameObjectMap).toEqual({
                    0:gameObject2
                });
                expect(TagData.slotCountMap).toEqual([2]);
                expect(TagData.usedSlotCountMap).toEqual([1]);
                expect(TagData.tagMap).toEqual({
                    0:tag2
                });
                expect(TagData.indexMap).toEqual([0]);
            });
            it("new indexInTagArrayMap should only has not-removed data and next data", function(){
                gameObjectTool.disposeComponent(gameObject1, tag1);

                expect(TagData.indexInTagArrayMap).toEqual([0, 2]);
            });
            it("tag index should be update", function () {
                gameObjectTool.disposeComponent(gameObject1, tag1);

                componentTool.judgeIsComponentIndexNotRemoved(tag1, expect);
                expect(tag2.index).toEqual(0);
                expect(tagTool.findGameObjectsByTag("qqq")).toEqual([gameObject2]);
            });
            it("test maxComponentDisposeCount > 1", function () {
                sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 2);

                var tag3 = tagTool.create(1);

                var gameObject3 = gameObjectTool.create();

                tagTool.addTag(tag3, "www");

                gameObjectTool.addComponent(gameObject3, tag3);

                gameObjectTool.disposeComponent(gameObject3, tag3);
                gameObjectTool.disposeComponent(gameObject2, tag2);

                expect(tag1.index).toEqual(0);
                componentTool.judgeIsComponentIndexNotRemoved(tag2, expect);
                componentTool.judgeIsComponentIndexNotRemoved(tag3, expect);
                expect(tagTool.findGameObjectsByTag("qqq")).toEqual([]);
                expect(tagTool.findGameObjectsByTag("www")).toEqual([]);
                expect(tagTool.findGameObjectsByTag("aaa")).toEqual([gameObject1]);
                expect(tagTool.findGameObjectsByTag("bbb")).toEqual([gameObject1]);
            });

            describe("test add new tag after dispose old one", function () {
                it("findGameObjects by removed tag should return empty array", function () {
                    gameObjectTool.disposeComponent(gameObject1, tag1);
                    gameObjectTool.disposeComponent(gameObject2, tag2);


                    var tag3 = tagTool.create(1);

                    var gameObject3 = gameObjectTool.create();

                    tagTool.addTag(tag3, "ttt");

                    gameObjectTool.addComponent(gameObject3, tag3);

                    expect(tagTool.findGameObjectsByTag("ttt")).toEqual([gameObject3]);
                });
                it("test maxComponentDisposeCount > 1", function () {
                    sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 2);

                    var tag3 = tagTool.create(1);

                    var gameObject3 = gameObjectTool.create();

                    tagTool.addTag(tag3, "www");

                    gameObjectTool.addComponent(gameObject3, tag3);

                    gameObjectTool.disposeComponent(gameObject3, tag3);
                    gameObjectTool.disposeComponent(gameObject2, tag2);




                    var tag4 = tagTool.create(3);

                    var gameObject4 = gameObjectTool.create();

                    tagTool.addTag(tag4, "ttt");
                    tagTool.addTag(tag4, "mmm");

                    gameObjectTool.addComponent(gameObject4, tag4);

                    expect(tagTool.findGameObjectsByTag("ttt")).toEqual([gameObject4]);
                    expect(tagTool.findGameObjectsByTag("mmm")).toEqual([gameObject4]);
                });
            });
        });

        describe("test GameObject", function() {
            var GameObjectData = wd.GameObjectData;

            beforeEach(function(){
                // gameObjectTool.resetData();
            });

            describe("clean children map", function () {
                var gameObject;
                var parent,child1, child2;

                beforeEach(function(){
                    sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 2);
                    gameObject = gameObjectTool.create();

                    parent = gameObjectTool.create();
                    gameObjectTool.add(parent, gameObject);

                    child1 = gameObjectTool.create();
                    gameObjectTool.add(gameObject, child1);

                    child2 = gameObjectTool.create();
                    gameObjectTool.add(gameObject, child2);
                })

                it("batch remove from children map", function () {
                    gameObjectTool.dispose(child1);
                    gameObjectTool.dispose(child2);


                    var childrenMap = {};
                    childrenMap[parent.uid] = [gameObject]
                    childrenMap[gameObject.uid] = [];

                    expect(GameObjectData.childrenMap).toEqual(childrenMap);
                });
                it("remove from parent map", function () {
                    gameObjectTool.dispose(child1);
                    gameObjectTool.dispose(child2);


                    var parentMap = {};
                    parentMap[parent.uid] = undefined;
                    parentMap[gameObject.uid] = parent;

                    expect(GameObjectData.parentMap).toEqual(parentMap);
                });
            });

            describe("test other", function() {
                var gameObject;
                var parent,child,child11;

                beforeEach(function(){
                    sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 1);

                    gameObject = gameObjectTool.create();

                    parent = gameObjectTool.create();
                    gameObjectTool.add(parent, gameObject);

                    child = gameObjectTool.create();
                    gameObjectTool.add(gameObject, child);

                    child11 = gameObjectTool.create();
                    gameObjectTool.add(child, child11);
                });

                it("new parentMap,childrenMap,componentMap should only has not-removed data", function(){
                    gameObjectTool.dispose(child);

                    var parentMap = {};
                    parentMap[gameObject.uid] = parent;
                    parentMap[parent.uid] = undefined;
                    expect(GameObjectData.parentMap).toEqual(parentMap);

                    var childrenMap = {};
                    childrenMap[parent.uid] = [gameObject];
                    childrenMap[gameObject.uid] = [];
                    expect(GameObjectData.childrenMap).toEqual(childrenMap);

                    expect(GameObjectData.componentMap[parent.uid]).toBeExist();
                    expect(GameObjectData.componentMap[gameObject.uid]).toBeExist();
                    expect(GameObjectData.componentMap[child.uid]).not.toBeExist();
                    expect(GameObjectData.componentMap[child11.uid]).not.toBeExist();
                });
                it("test maxComponentDisposeCount > 1", function () {
                    sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 2);

                    gameObjectTool.dispose(child);


                    // var parentMap = {};
                    // parentMap[gameObject.uid] = parent;
                    // parentMap[child.uid] = undefined;
                    // parentMap[child11.uid] = undefined;
                    // expect(GameObjectData.parentMap).toEqual(parentMap);




                    gameObjectTool.dispose(gameObject);


                    var parentMap = {};
                    parentMap[parent.uid] = undefined;
                    expect(GameObjectData.parentMap).toEqual(parentMap);

                    var childrenMap = {};
                    childrenMap[parent.uid] = [];
                    expect(GameObjectData.childrenMap).toEqual(childrenMap);

                    expect(GameObjectData.componentMap[parent.uid]).toBeExist();
                    expect(GameObjectData.componentMap[gameObject.uid]).not.toBeExist();
                    expect(GameObjectData.componentMap[child.uid]).not.toBeExist();
                    expect(GameObjectData.componentMap[child11.uid]).not.toBeExist();
                });

                describe("test add new one after dispose old one", function () {
                    it("test maxComponentDisposeCount === 1", function () {
                        sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 1);

                        gameObjectTool.dispose(child11);


                        var parentMap = {};
                        parentMap[parent.uid] = undefined;
                        parentMap[gameObject.uid] = parent;
                        parentMap[child.uid] = gameObject;
                        expect(GameObjectData.parentMap).toEqual(parentMap);




                        var child2 = gameObjectTool.create();

                        gameObjectTool.add(child, child2);

                        var parentMap = {};
                        parentMap[parent.uid] = undefined;
                        parentMap[gameObject.uid] = parent;
                        parentMap[child.uid] = gameObject;
                        parentMap[child2.uid] = child;
                        expect(GameObjectData.parentMap).toEqual(parentMap);


                        var childrenMap = {};
                        childrenMap[parent.uid] = [gameObject];
                        childrenMap[gameObject.uid] = [child];
                        childrenMap[child.uid] = [child2];
                        expect(GameObjectData.childrenMap).toEqual(childrenMap);
                    });
                    it("test maxComponentDisposeCount > 1", function () {
                        sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 3);

                        var gameObject2 = gameObjectTool.create();

                        gameObjectTool.dispose(gameObject2);
                        gameObjectTool.dispose(child11);
                        gameObjectTool.dispose(gameObject);


                        var parentMap = {};
                        parentMap[parent.uid] = undefined;
                        expect(GameObjectData.parentMap).toEqual(parentMap);




                        var child2 = gameObjectTool.create();

                        gameObjectTool.add(parent, child2);

                        var parentMap = {};
                        parentMap[parent.uid] = undefined;
                        parentMap[child2.uid] = parent;
                        expect(GameObjectData.parentMap).toEqual(parentMap);


                        var childrenMap = {};
                        childrenMap[parent.uid] = [child2];
                        expect(GameObjectData.childrenMap).toEqual(childrenMap);
                    });
                });
            });

        });

        describe("test ThreeDTransform", function() {
            var ThreeDTransformData = wd.ThreeDTransformData;

            beforeEach(function(){

            });

            beforeEach(function(){
            });


            describe("clean children map", function () {
                var gameObject;
                var parent,child1,child2;
                var gameObjectTra, parentTra, child1Tra, child2Tra;

                beforeEach(function(){
                    sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 2);
                    gameObject = gameObjectTool.create();
                    gameObjectTra = gameObjectTool.getTransform(gameObject);

                    parent = gameObjectTool.create();
                    gameObjectTool.add(parent, gameObject);
                    parentTra = gameObjectTool.getTransform(parent);

                    child1 = gameObjectTool.create();
                    gameObjectTool.add(gameObject, child1);
                    child1Tra = gameObjectTool.getTransform(child1);

                    child2 = gameObjectTool.create();
                    gameObjectTool.add(gameObject, child2);
                    child2Tra = gameObjectTool.getTransform(child2);
                })

                it("batch remove from children map", function () {
                    gameObjectTool.dispose(child1);
                    gameObjectTool.dispose(child2);


                    var childrenMap = {};
                    childrenMap[parentTra.uid] = [gameObjectTra]
                    childrenMap[gameObjectTra.uid] = [];

                    expect(ThreeDTransformData.childrenMap).toEqual(childrenMap);
                });
                it("remove from parent map", function () {
                    gameObjectTool.dispose(child1);
                    gameObjectTool.dispose(child2);


                    var parentMap = {};
                    parentMap[parentTra.uid] = undefined;
                    parentMap[gameObjectTra.uid] = parentTra;

                    expect(ThreeDTransformData.parentMap).toEqual(parentMap);
                });
            });

            describe("test other", function() {
                var gameObject;
                var parent,child,child11;
                var gameObjectTra, parentTra, childTra, child11Tra;

                beforeEach(function(){
                    sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 1);

                    gameObject = gameObjectTool.create();
                    gameObjectTra = gameObjectTool.getTransform(gameObject);

                    parent = gameObjectTool.create();
                    gameObjectTool.add(parent, gameObject);
                    parentTra = gameObjectTool.getTransform(parent);


                    child = gameObjectTool.create();
                    gameObjectTool.add(gameObject, child);
                    childTra = gameObjectTool.getTransform(child);

                    child11 = gameObjectTool.create();
                    gameObjectTool.add(child, child11);
                    child11Tra = gameObjectTool.getTransform(child11);
                });

                it("new parentMap,childrenMap,isTranslateMap,tempMap,gameObjectMap should only has not-removed data", function(){
                    gameObjectTool.dispose(child);

                    var parentMap = {};
                    parentMap[gameObjectTra.uid] = parentTra;
                    parentMap[parentTra.uid] = undefined;
                    expect(ThreeDTransformData.parentMap).toEqual(parentMap);

                    var childrenMap = {};
                    childrenMap[parentTra.uid] = [gameObjectTra];
                    childrenMap[gameObjectTra.uid] = [];
                    expect(ThreeDTransformData.childrenMap).toEqual(childrenMap);


                    var isTranslateMap = {};
                    isTranslateMap[gameObjectTra.uid] = undefined;
                    isTranslateMap[parentTra.uid] = undefined;
                    expect(ThreeDTransformData.isTranslateMap).toEqual(isTranslateMap);

                    var gameObjectMap = {};
                    gameObjectMap[parentTra.uid] = parent;
                    gameObjectMap[gameObjectTra.uid] = gameObject;
                    expect(ThreeDTransformData.gameObjectMap).toEqual(gameObjectMap);


                    expect(ThreeDTransformData.tempMap[parentTra.uid]).toBeExist();
                    expect(ThreeDTransformData.tempMap[gameObjectTra.uid]).toBeExist();
                    expect(ThreeDTransformData.tempMap[childTra.uid]).not.toBeExist();
                    expect(ThreeDTransformData.tempMap[child11Tra.uid]).not.toBeExist();
                });
                it("test maxComponentDisposeCount > 1", function () {
                    /*!
                     "gameObjectTool.dispose(childTra)" will dispose component twice:dispose childTra; dispose child11Tra, so maxComponentDisposeCount should be 3 instead of 2
                     */
                    sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 3);

                    gameObjectTool.dispose(childTra);


                    // var parentMap = {};
                    // parentMap[gameObjectTra.uid] = parentTra;
                    // parentMap[childTra.uid] = undefined;
                    // parentMap[child11Tra.uid] = undefined;
                    // expect(ThreeDTransformData.parentMap).toEqual(parentMap);




                    gameObjectTool.dispose(gameObjectTra);


                    var parentMap = {};
                    parentMap[parentTra.uid] = undefined;
                    expect(ThreeDTransformData.parentMap).toEqual(parentMap);

                    var childrenMap = {};
                    childrenMap[parentTra.uid] = [];
                    expect(ThreeDTransformData.childrenMap).toEqual(childrenMap);


                    var isTranslateMap = {};
                    isTranslateMap[parentTra.uid] = undefined;
                    expect(ThreeDTransformData.isTranslateMap).toEqual(isTranslateMap);



                    expect(ThreeDTransformData.tempMap[parentTra.uid]).toBeExist();
                    expect(ThreeDTransformData.tempMap[gameObjectTra.uid]).not.toBeExist();
                    expect(ThreeDTransformData.tempMap[childTra.uid]).not.toBeExist();
                    expect(ThreeDTransformData.tempMap[child11Tra.uid]).not.toBeExist();
                });

                describe("test add new one after dispose old one", function () {
                    it("test maxComponentDisposeCount === 1", function () {
                        gameObjectTool.dispose(child11);


                        var parentMap = {};
                        parentMap[parentTra.uid] = undefined;
                        parentMap[gameObjectTra.uid] = parentTra;
                        parentMap[childTra.uid] = gameObjectTra;
                        expect(ThreeDTransformData.parentMap).toEqual(parentMap);




                        var child2 = gameObjectTool.create();
                        var child2Tra = gameObjectTool.getTransform(child2);

                        gameObjectTool.add(child, child2);

                        var parentMap = {};
                        parentMap[parentTra.uid] = undefined;
                        parentMap[gameObjectTra.uid] = parentTra;
                        parentMap[childTra.uid] = gameObjectTra;
                        parentMap[child2Tra.uid] = childTra;
                        expect(ThreeDTransformData.parentMap).toEqual(parentMap);


                        var childrenMap = {};
                        childrenMap[parentTra.uid] = [gameObjectTra];
                        childrenMap[gameObjectTra.uid] = [childTra];
                        childrenMap[childTra.uid] = [child2Tra];
                        childrenMap[child2Tra.uid] = [];
                        expect(ThreeDTransformData.childrenMap).toEqual(childrenMap);
                    });
                    it("test maxComponentDisposeCount > 1", function () {
                        sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 4);

                        var gameObject2 = gameObjectTool.create();

                        gameObjectTool.dispose(gameObject2);
                        gameObjectTool.dispose(child11);
                        gameObjectTool.dispose(gameObject);


                        var parentMap = {};
                        parentMap[parentTra.uid] = undefined;
                        expect(ThreeDTransformData.parentMap).toEqual(parentMap);




                        var child2 = gameObjectTool.create();
                        var child2Tra = gameObjectTool.getTransform(child2);

                        gameObjectTool.add(parent, child2);

                        var parentMap = {};
                        parentMap[parentTra.uid] = undefined;
                        parentMap[child2Tra.uid] = parentTra;
                        expect(ThreeDTransformData.parentMap).toEqual(parentMap);


                        var childrenMap = {};
                        childrenMap[parentTra.uid] = [child2Tra];
                        childrenMap[child2Tra.uid] = [];
                        expect(ThreeDTransformData.childrenMap).toEqual(childrenMap);
                    });
                });
            });
        });

        describe("test Geometry", function() {
            var GeometryData = wd.GeometryData;

            var obj1,obj2,obj3;
            var geo1, geo2,geo3;
            var geo1VerticesData, geo1IndicesData;
            var geo2VerticesData, geo2IndicesData;
            var geo3VerticesData, geo3IndicesData;

            function judgeMap(mapName, oldMap){
                var map = {};
                map[0] = oldMap[1];
                map[1] = oldMap[2];

                expect(GeometryData[mapName][0]).toEqual(map[0]);
                expect(GeometryData[mapName][1]).toEqual(map[1]);
            }

            beforeEach(function(){
                obj1 = gameObjectTool.create();
                geo1VerticesData = [
                    -10, -10, 10, -10, 10, 10, 10, -10, 10
                ];

                geo1IndicesData = [
                    1,2,0
                ]
                geo1 = customGeometryTool.create();
                gameObjectTool.addComponent(obj1, geo1);

                customGeometryTool.setVertices(geo1, geo1VerticesData)
                customGeometryTool.setIndices(geo1, geo1IndicesData)


                // geo1VerticesData = [
                //     -10, -10, 10, -10, 10, 10, 10, -10, 10, 10, 10, 10, 10, -10, -10, 10, 10, -10, -10, -10, -10, -10, 10, -10, -10, 10, 10, -10, 10, -10, 10, 10, 10, 10, 10, -10, 10, -10, 10, 10, -10, -10, -10, -10, 10, -10, -10, -10, 10, -10, 10, 10, 10, 10, 10, -10, -10, 10, 10, -10, -10, -10, -10, -10, 10, -10, -10, -10, 10, -10, 10, 10
                // ];
                //
                // geo1IndicesData = [
                //     0, 2, 1, 2, 3, 1, 4, 6, 5, 6, 7, 5, 8, 10, 9, 10, 11, 9, 12, 14, 13, 14, 15, 13, 16, 18, 17, 18, 19, 17, 20, 22, 21, 22, 23, 21
                // ]



                obj2 = gameObjectTool.create();
                geo2 = boxGeometryTool.create();
                gameObjectTool.addComponent(obj2, geo2);

                boxGeometryTool.setConfigData(geo2, {
                    width: 5,
                    height: 5,
                    depth: 5
                })


                geo2VerticesData = [
                    -5, -5, 5, -5, 5, 5, 5, -5, 5, 5, 5, 5, 5, -5, -5, 5, 5, -5, -5, -5, -5, -5, 5, -5, -5, 5, 5, -5, 5, -5, 5, 5, 5, 5, 5, -5, 5, -5, 5, 5, -5, -5, -5, -5, 5, -5, -5, -5, 5, -5, 5, 5, 5, 5, 5, -5, -5, 5, 5, -5, -5, -5, -5, -5, 5, -5, -5, -5, 5, -5, 5, 5
                ];

                geo2IndicesData = [
                    0, 2, 1, 2, 3, 1, 4, 6, 5, 6, 7, 5, 8, 10, 9, 10, 11, 9, 12, 14, 13, 14, 15, 13, 16, 18, 17, 18, 19, 17, 20, 22, 21, 22, 23, 21
                ]




                obj3 = gameObjectTool.create();
                geo3VerticesData = [
                    -6, -6, 6, -6, 6, 6, 6, -6, 6,
                    1,1,2
                ];

                geo3IndicesData = [
                    2,0,1, 1,3,2
                ]
                geo3 = customGeometryTool.create();
                gameObjectTool.addComponent(obj3, geo3);

                customGeometryTool.setVertices(geo3, geo3VerticesData)
                customGeometryTool.setIndices(geo3, geo3IndicesData)


                // geo3VerticesData = [
                //     -6, -6, 6, -6, 6, 6, 6, -6, 6, 6, 6, 6, 6, -6, -6, 6, 6, -6, -6, -6, -6, -6, 6, -6, -6, 6, 6, -6, 6, -6, 6, 6, 6, 6, 6, -6, 6, -6, 6, 6, -6, -6, -6, -6, 6, -6, -6, -6, 6, -6, 6, 6, 6, 6, 6, -6, -6, 6, 6, -6, -6, -6, -6, -6, 6, -6, -6, -6, 6, -6, 6, 6
                // ];
                //
                // geo3IndicesData = [
                //     0, 2, 1, 2, 3, 1, 4, 6, 5, 6, 7, 5, 8, 10, 9, 10, 11, 9, 12, 14, 13, 14, 15, 13, 16, 18, 17, 18, 19, 17, 20, 22, 21, 22, 23, 21
                // ]




                directorTool.init(sandbox);

                sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 1);
            });

            describe("test type array data(vertices, indices)", function() {
                beforeEach(function(){

                });

                describe("pack type array with not-removed data", function(){
                    it("test1", function () {
                        gameObjectTool.disposeComponent(obj1, geo1);

                        expect(testTool.getValues(geometryTool.getVertices(createGeometry(0)))).toEqual(geo2VerticesData);
                        expect(testTool.getValues(geometryTool.getIndices(createGeometry(0)))).toEqual(geo2IndicesData);
                        expect(testTool.getValues(geometryTool.getVertices(createGeometry(1)))).toEqual(geo3VerticesData);
                        expect(testTool.getValues(geometryTool.getIndices(createGeometry(1)))).toEqual(geo3IndicesData);
                    });
                    it("test2", function () {
                        gameObjectTool.disposeComponent(obj2, geo2);

                        expect(testTool.getValues(geometryTool.getVertices(createGeometry(0)))).toEqual(geo1VerticesData);
                        expect(testTool.getValues(geometryTool.getIndices(createGeometry(0)))).toEqual(geo1IndicesData);
                        expect(testTool.getValues(geometryTool.getVertices(createGeometry(1)))).toEqual(geo3VerticesData);
                        expect(testTool.getValues(geometryTool.getIndices(createGeometry(1)))).toEqual(geo3IndicesData);
                    });
                    it("test3", function () {
                        gameObjectTool.disposeComponent(obj1, geo1);
                        gameObjectTool.disposeComponent(obj3, geo3);

                        expect(testTool.getValues(geometryTool.getVertices(createGeometry(0)))).toEqual(geo2VerticesData);
                        expect(testTool.getValues(geometryTool.getIndices(createGeometry(0)))).toEqual(geo2IndicesData);
                    });
                });
            });

            it("update not-removed geometry's index", function () {
                gameObjectTool.disposeComponent(obj1, geo1);

                componentTool.judgeIsComponentIndexNotRemoved(geo1, expect);
                expect(geo2.index).toEqual(0);
                expect(geo3.index).toEqual(1);
            });

            describe("test new info list", function () {
                it("update startIndex,endIndex", function () {
                    gameObjectTool.disposeComponent(obj1, geo1);

                    expect(GeometryData.verticesInfoList).toEqual([
                        { startIndex: 0, endIndex: 72 },
                        { startIndex: 72, endIndex: 84 }
                    ]);
                    expect(GeometryData.indicesInfoList).toEqual([
                        { startIndex: 0, endIndex: 36 },
                        { startIndex: 36, endIndex: 42 }
                    ]);
                });
                it("should only has not-removed data", function () {
                    gameObjectTool.disposeComponent(obj1, geo1);

                    expect(GeometryData.verticesInfoList.length).toEqual(2);
                    expect(GeometryData.indicesInfoList.length).toEqual(2);
                });
            });

            it("new maps should only has not-removed data", function(){
                var oldGameObjectMap = GeometryData.gameObjectMap;
                var oldComputeDataFuncMap = GeometryData.computeDataFuncMap;
                var oldConfigDataMap = GeometryData.configDataMap;
                var oldVerticesCacheMap = GeometryData.verticesCacheMap;
                var oldIndicesCacheMap = GeometryData.indicesCacheMap;
                var oldGeometryMap = GeometryData.geometryMap;

                gameObjectTool.disposeComponent(obj1, geo1);

                judgeMap("gameObjectMap", oldGameObjectMap);
                judgeMap("computeDataFuncMap", oldComputeDataFuncMap);
                judgeMap("configDataMap", oldConfigDataMap);
                judgeMap("verticesCacheMap", oldVerticesCacheMap);
                judgeMap("indicesCacheMap", oldIndicesCacheMap);
                judgeMap("geometryMap", oldGeometryMap);
            });
            it("update offset", function () {
                gameObjectTool.disposeComponent(obj1, geo1);

                expect(GeometryData.verticesOffset).toEqual(geo2VerticesData.length + geo3VerticesData.length);
                expect(GeometryData.indicesOffset).toEqual(geo2IndicesData.length + geo3IndicesData.length);
            });
            it("update index", function () {
                gameObjectTool.disposeComponent(obj1, geo1);
                gameObjectTool.disposeComponent(obj3, geo3);


                expect(GeometryData.index).toEqual(1);
            });
            it("test maxComponentDisposeCount > 1", function () {
                sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 2);

                gameObjectTool.disposeComponent(obj2, geo2);

                var oldGeometryMap = GeometryData.geometryMap;

                var geometryMap = {};
                geometryMap[0] = oldGeometryMap[0];
                geometryMap[1] = undefined;
                geometryMap[2] = oldGeometryMap[2];

                expect(GeometryData.geometryMap).toEqual(geometryMap);



                gameObjectTool.disposeComponent(obj1, geo1);

                geometryMap = {};
                geometryMap[0] = oldGeometryMap[2];

                expect(GeometryData.geometryMap).toEqual(geometryMap);
            });

            describe("test add new one after dispose old one and then dispose new one", function () {
                it("test maxComponentDisposeCount === 1", function () {
                    gameObjectTool.disposeComponent(obj1, geo1);


                    var obj4 = gameObjectTool.create();
                    var geo4VerticesData = [
                        -3, -3, 3, -3, 3, 3, 3, -3, 3,
                        5,6,7
                    ];

                    var geo4IndicesData = [
                        2,3,1, 1,3,0
                    ]
                    var geo4 = customGeometryTool.create();
                    gameObjectTool.addComponent(obj4, geo4);

                    customGeometryTool.setVertices(geo4, geo4VerticesData)
                    customGeometryTool.setIndices(geo4, geo4IndicesData)



                    expect(testTool.getValues(geometryTool.getVertices(createGeometry(0)))).toEqual(geo2VerticesData);
                    expect(testTool.getValues(geometryTool.getIndices(createGeometry(0)))).toEqual(geo2IndicesData);
                    expect(testTool.getValues(geometryTool.getVertices(createGeometry(1)))).toEqual(geo3VerticesData);
                    expect(testTool.getValues(geometryTool.getIndices(createGeometry(1)))).toEqual(geo3IndicesData);
                    expect(testTool.getValues(geometryTool.getVertices(createGeometry(2)))).toEqual(geo4VerticesData);
                    expect(testTool.getValues(geometryTool.getIndices(createGeometry(2)))).toEqual(geo4IndicesData);


                    expect(GeometryData.geometryMap[0]).toEqual(geo2);
                    expect(GeometryData.geometryMap[1]).toEqual(geo3);
                    expect(GeometryData.geometryMap[2]).toEqual(geo4);

                    expect(geo4.index).toEqual(2);




                    gameObjectTool.disposeComponent(obj3, geo3);



                    expect(testTool.getValues(geometryTool.getVertices(createGeometry(0)))).toEqual(geo2VerticesData);
                    expect(testTool.getValues(geometryTool.getVertices(createGeometry(1)))).toEqual(geo4VerticesData);

                    expect(GeometryData.geometryMap[0]).toEqual(geo2);
                    expect(GeometryData.geometryMap[1]).toEqual(geo4);

                    expect(geo4.index).toEqual(1);
                });
                it("test maxComponentDisposeCount > 1", function () {
                    sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 2);

                    gameObjectTool.disposeComponent(obj1, geo1);



                    var obj4 = gameObjectTool.create();
                    var geo4VerticesData = [
                        -3, -3, 3, -3, 3, 3, 3, -3, 3,
                        5,6,7
                    ];

                    var geo4IndicesData = [
                        2,3,1, 1,3,0
                    ]
                    var geo4 = customGeometryTool.create();
                    gameObjectTool.addComponent(obj4, geo4);

                    customGeometryTool.setVertices(geo4, geo4VerticesData)
                    customGeometryTool.setIndices(geo4, geo4IndicesData)



                    gameObjectTool.disposeComponent(obj3, geo3);



                    expect(testTool.getValues(geometryTool.getVertices(createGeometry(0)))).toEqual(geo2VerticesData);
                    expect(testTool.getValues(geometryTool.getVertices(createGeometry(1)))).toEqual(geo4VerticesData);


                    expect(GeometryData.geometryMap[0]).toEqual(geo2);
                    expect(GeometryData.geometryMap[1]).toEqual(geo4);

                    expect(geo2.index).toEqual(0);
                    expect(geo4.index).toEqual(1);










                    gameObjectTool.disposeComponent(obj2, geo2);
                    gameObjectTool.disposeComponent(obj4, geo4);



                    expect(function(){
                        geometryTool.getVertices(createGeometry(0))
                    }).toThrow("should exist");


                    expect(GeometryData.geometryMap[0]).toBeUndefined();

                    expect(GeometryData.index).toEqual(0);
                });
            });
        });
    });

    describe("reallocate if buffer nearyly full", function() {
        beforeEach(function(){

        });

        describe("test geometry", function(){
            var GeometryData = wd.GeometryData;

            var obj1;
            var geo1;

            beforeEach(function(){
                obj1 = gameObjectTool.create();
                geo1VerticesData = [
                    -10, -10, 10, -10, 10, 10, 10, -10, 10
                ];

                geo1IndicesData = [
                    1,2,0
                ]
                geo1 = customGeometryTool.create();
                gameObjectTool.addComponent(obj1, geo1);

                customGeometryTool.setVertices(geo1, geo1VerticesData)
                customGeometryTool.setIndices(geo1, geo1IndicesData)

                directorTool.init(sandbox);
            });

            it("if indice info's endIndex >= GeometryData.maxDisposeIndex, reallocate", function () {
                sandbox.stub(MemoryConfig, "maxComponentDisposeCount", 2);
                sandbox.stub(GeometryData, "maxDisposeIndex", 3);

                gameObjectTool.disposeComponent(obj1, geo1);


                expect(function(){
                    geometryTool.getVertices(createGeometry(0))
                }).toThrow("should exist");


                expect(GeometryData.geometryMap[0]).toBeUndefined();

                expect(GeometryData.index).toEqual(0);
            });
        });
    });
});


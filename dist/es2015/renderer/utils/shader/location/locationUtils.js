import { isConfigDataExist } from "../../renderConfigUtils";
import { ensureFunc, it, requireCheckFunc } from "../../../../definition/typescript/decorator/contract";
import { createMap, isValidMapValue } from "../../../../utils/objectUtils";
import { expect } from "wonder-expect.js";
import { forEach } from "../../../../utils/arrayUtils";
export var setLocationMap = ensureFunc(function (returnVal, gl, shaderIndex, program, materialShaderLibConfig, shaderLibData, LocationDataFromSystem) {
    it("attribute should contain position at least", function () {
        expect(LocationDataFromSystem.attributeLocationMap[shaderIndex]["a_position"]).be.a("number");
    });
}, requireCheckFunc(function (gl, shaderIndex, program, materialShaderLibConfig, shaderLibData, LocationDataFromSystem) {
    it("not setted location before", function () {
        expect(isValidMapValue(LocationDataFromSystem.attributeLocationMap[shaderIndex])).false;
        expect(isValidMapValue(LocationDataFromSystem.uniformLocationMap[shaderIndex])).false;
    });
}, function (gl, shaderIndex, program, materialShaderLibConfig, shaderLibData, LocationDataFromSystem) {
    var attributeLocationMap = {}, uniformLocationMap = {}, sendData = null, attributeName = null, uniformName = null;
    forEach(materialShaderLibConfig, function (shaderLibName) {
        var attribute = null, uniform = null;
        sendData = shaderLibData[shaderLibName].send;
        if (!isConfigDataExist(sendData)) {
            return;
        }
        attribute = sendData.attribute;
        uniform = sendData.uniform;
        if (isConfigDataExist(attribute)) {
            forEach(attribute, function (data) {
                attributeName = data.name;
                attributeLocationMap[attributeName] = gl.getAttribLocation(program, attributeName);
            });
        }
        if (isConfigDataExist(uniform)) {
            forEach(uniform, function (data) {
                uniformName = data.name;
                uniformLocationMap[uniformName] = gl.getUniformLocation(program, uniformName);
            });
        }
    });
    LocationDataFromSystem.attributeLocationMap[shaderIndex] = attributeLocationMap;
    LocationDataFromSystem.uniformLocationMap[shaderIndex] = uniformLocationMap;
}));
export var getAttribLocation = ensureFunc(function (pos, name, attributeLocationMap) {
    it(name + "'s attrib location should be number", function () {
        expect(pos).be.a("number");
    });
}, function (name, attributeLocationMap) {
    return attributeLocationMap[name];
});
export var getUniformLocation = ensureFunc(function (pos, name, uniformLocationMap) {
    it(name + "'s uniform location should exist in map", function () {
        expect(isValidMapValue(pos)).true;
    });
}, function (name, uniformLocationMap) {
    return uniformLocationMap[name];
});
export var isUniformLocationNotExist = function (pos) {
    return pos === null;
};
export var isAttributeLocationNotExist = function (pos) {
    return pos === -1;
};
export var initData = function (LocationDataFromSystem) {
    LocationDataFromSystem.attributeLocationMap = createMap();
    LocationDataFromSystem.uniformLocationMap = createMap();
};
//# sourceMappingURL=locationUtils.js.map
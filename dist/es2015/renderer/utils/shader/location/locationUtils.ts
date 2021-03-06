import { isConfigDataExist } from "../../renderConfigUtils";
import { ensureFunc, it, requireCheckFunc } from "../../../../definition/typescript/decorator/contract";
import { MaterialShaderLibConfig } from "../../../data/material_config";
import {
    ISendAttributeConfig, ISendUniformConfig, IShaderLibContentGenerator,
    IShaderLibSendConfig
} from "../../../data/shaderLib_generator";
import { createMap, isValidMapValue } from "../../../../utils/objectUtils";
import { expect } from "wonder-expect.js";
import { forEach } from "../../../../utils/arrayUtils";
import { AttributeLocationMap, UniformLocationMap } from "../../../type/dataType";

export var setLocationMap = ensureFunc((returnVal, gl: WebGLRenderingContext, shaderIndex: number, program: WebGLProgram, materialShaderLibConfig: MaterialShaderLibConfig, shaderLibData: IShaderLibContentGenerator, LocationDataFromSystem: any) => {
    it("attribute should contain position at least", () => {
        expect(LocationDataFromSystem.attributeLocationMap[shaderIndex]["a_position"]).be.a("number");
    });
}, requireCheckFunc((gl: WebGLRenderingContext, shaderIndex: number, program: WebGLProgram, materialShaderLibConfig: MaterialShaderLibConfig, shaderLibData: IShaderLibContentGenerator, LocationDataFromSystem: any) => {
    it("not setted location before", () => {
        expect(isValidMapValue(LocationDataFromSystem.attributeLocationMap[shaderIndex])).false;
        expect(isValidMapValue(LocationDataFromSystem.uniformLocationMap[shaderIndex])).false;
    });
}, (gl: WebGLRenderingContext, shaderIndex: number, program: WebGLProgram, materialShaderLibConfig: MaterialShaderLibConfig, shaderLibData: IShaderLibContentGenerator, LocationDataFromSystem: any) => {
    var attributeLocationMap = {},
        uniformLocationMap = {},
        sendData: IShaderLibSendConfig = null,
        attributeName: string = null,
        uniformName: string = null;

    forEach(materialShaderLibConfig, (shaderLibName: string) => {
        var attribute: Array<ISendAttributeConfig> = null,
            uniform: Array<ISendUniformConfig> = null;

        sendData = shaderLibData[shaderLibName].send;

        if (!isConfigDataExist(sendData)) {
            return;
        }

        attribute = sendData.attribute;
        uniform = sendData.uniform;

        if (isConfigDataExist(attribute)) {
            forEach(attribute, (data: ISendAttributeConfig) => {
                attributeName = data.name;

                attributeLocationMap[attributeName] = gl.getAttribLocation(program, attributeName);
            })
        }

        if (isConfigDataExist(uniform)) {
            forEach(uniform, (data: ISendUniformConfig) => {
                uniformName = data.name;

                uniformLocationMap[uniformName] = gl.getUniformLocation(program, uniformName);
            })
        }
    })

    LocationDataFromSystem.attributeLocationMap[shaderIndex] = attributeLocationMap;
    LocationDataFromSystem.uniformLocationMap[shaderIndex] = uniformLocationMap;
}))

export var getAttribLocation = ensureFunc((pos: number, name: string, attributeLocationMap: AttributeLocationMap) => {
    it(`${name}'s attrib location should be number`, () => {
        expect(pos).be.a("number");
    });
}, (name: string, attributeLocationMap: AttributeLocationMap) => {
    return attributeLocationMap[name];
})

export var getUniformLocation = ensureFunc((pos: number, name: string, uniformLocationMap: UniformLocationMap) => {
    it(`${name}'s uniform location should exist in map`, () => {
        expect(isValidMapValue(pos)).true;
    });
}, (name: string, uniformLocationMap: UniformLocationMap) => {
    return uniformLocationMap[name];
})

export var isUniformLocationNotExist = (pos: WebGLUniformLocation) => {
    return pos === null;
}

export var isAttributeLocationNotExist = (pos: number) => {
    return pos === -1;
}

export var initData = (LocationDataFromSystem: any) => {
    LocationDataFromSystem.attributeLocationMap = createMap();
    LocationDataFromSystem.uniformLocationMap = createMap();
}

import { BasicMaterial } from "./BasicMaterial";
import { create as createMaterial, setShaderIndex } from "./MaterialSystem";
import { create as createShader } from "../../renderer/shader/ShaderSystem";
import { isValidMapValue } from "../../utils/objectUtils";

export var create = (ShaderData: any, MaterialData: any) => {
    var material = new BasicMaterial(),
        materialClassName = "BasicMaterial";

    material = createMaterial(material, materialClassName, MaterialData);

    setShaderIndex(material.index, createShader(materialClassName, MaterialData, ShaderData), MaterialData);

    return material;
}

// var _createShader = (materialClassName: string, MaterialData:any, ShaderData: any) => {
//     var shaderMap = ShaderData.shaderMap,
//         shader = shaderMap[materialClassName];
//
//     if (isValidMapValue(shader)) {
//         return shader;
//     }
//
//     shader = createShader(materialClassName, MaterialData, ShaderData);
//
//     // shaderMap[materialClassName] = shader;
//
//     return shader;
// }

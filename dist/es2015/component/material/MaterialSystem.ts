import { Map as MapImmutable } from "immutable";
import { ensureFunc, it, requireCheckFunc } from "../../definition/typescript/decorator/contract";
import { Color } from "../../structure/Color";
import { expect } from "wonder-expect.js";
import { Material } from "./Material";
import {
    addAddComponentHandle as addAddComponentHandleToMap, addComponentToGameObjectMap,
    addDisposeHandle as addDisposeHandleToMap, addInitHandle as addInitHandleToMap, deleteComponentBySwapArray,
    generateComponentIndex,
    getComponentGameObject
} from "../ComponentSystem";
import { GameObject } from "../../core/entityObject/gameObject/GameObject";
import { checkIndexShouldEqualCount } from "../utils/contractUtils";
import { Shader } from "../../renderer/shader/Shader";
import { MaterialData } from "./MaterialData";
import { DataBufferConfig } from "../../config/DataBufferConfig";
import {
    deleteBySwapAndNotReset, deleteBySwapAndReset,
    deleteOneItemBySwapAndReset
} from "../../utils/typeArrayUtils";
import {
    createTypeArrays,
    getShaderIndexFromTable as getShaderIndexFromTableUtils, getOpacity as getOpacityUtils,
    getAlphaTest as getAlphaTestUtils, getMaterialClassNameFromTable, getColorDataSize, getOpacityDataSize,
    getAlphaTestDataSize, getColorArr3 as getColorArr3Utils, isTestAlpha as isTestAlphaUtils
} from "../../renderer/utils/material/materialUtils";
import { isSupportRenderWorkerAndSharedArrayBuffer } from "../../device/WorkerDetectSystem";
import { init as initShader } from "../../renderer/shader/ShaderSystem";
import { material_config } from "../../renderer/data/material_config";
import { shaderLib_generator } from "../../renderer/data/shaderLib_generator";
import { DeviceManagerData } from "../../renderer/device/DeviceManagerData";
import { ProgramData } from "../../renderer/shader/program/ProgramData";
import { LocationData } from "../../renderer/shader/location/LocationData";
import { GLSLSenderData } from "../../renderer/shader/glslSender/GLSLSenderData";
import { createSharedArrayBufferOrArrayBuffer } from "../../utils/arrayBufferUtils";
import { deleteBySwap } from "../../utils/arrayUtils";

export var addAddComponentHandle = (_class: any) => {
    addAddComponentHandleToMap(_class, addComponent);
}

export var addDisposeHandle = (_class: any) => {
    addDisposeHandleToMap(_class, disposeComponent);
}

export var addInitHandle = (_class: any) => {
    addInitHandleToMap(_class, initMaterial);
}

export var create = requireCheckFunc((material: Material, className: string, MaterialData: any) => {
    checkIndexShouldEqualCount(MaterialData);
}, (material: Material, className: string, MaterialData: any) => {
    var index = generateComponentIndex(MaterialData);

    material.index = index;

    MaterialData.count += 1;

    // _setMaterialClassName(index, className, MaterialData);

    // setColor(index, _createDefaultColor(), MaterialData);
    // setOpacity(index, 1, MaterialData);

    MaterialData.materialMap[index] = material;

    return material;
})

var _createDefaultColor = () => {
    var color = Color.create();

    return color.setColorByNum("#ffffff");
}

export var init = requireCheckFunc((state: MapImmutable<any, any>, MaterialData: any) => {
    checkIndexShouldEqualCount(MaterialData);
}, (state: MapImmutable<any, any>, MaterialData: any) => {
    for (let i = 0, count = MaterialData.count; i < count; i++) {
        initMaterial(i, state);
    }
})

export var initMaterial = null;

if (isSupportRenderWorkerAndSharedArrayBuffer()) {
    initMaterial = (index: number, state: MapImmutable<any, any>) => {
        MaterialData.workerInitList.push(index);
    }
}
else {
    initMaterial = (index: number, state: MapImmutable<any, any>) => {
        var shaderIndex = getShaderIndex(index, MaterialData);

        initShader(state, index, shaderIndex, getMaterialClassNameFromTable(shaderIndex, MaterialData.materialClassNameTable), material_config, shaderLib_generator as any, DeviceManagerData, ProgramData, LocationData, GLSLSenderData, MaterialData);
    }
}

export var clearWorkerInitList = null;

if (isSupportRenderWorkerAndSharedArrayBuffer()) {
    clearWorkerInitList = (MaterialData: any) => {
        MaterialData.workerInitList = [];
    };
}
else {
    clearWorkerInitList = (MaterialData: any) => {
    };
}

export var hasNewInitedMaterial = (MaterialData: any) => {
    return MaterialData.workerInitList.length > 0;
}

// var _getMaterialClassName = (materialIndex: number, MaterialData: any) => {
//     return MaterialData.materialClassNameMap[materialIndex];
// }

// var _setMaterialClassName = (materialIndex: number, className: string, MaterialData: any) => {
//     MaterialData.materialClassNameMap[materialIndex] = className;
// }

export var getShaderIndex = (materialIndex: number, MaterialData: any) => {
    return MaterialData.shaderIndices[materialIndex];
}

export var getShaderIndexFromTable = getShaderIndexFromTableUtils;

export var setShaderIndex = (materialIndex: number, shader: Shader, MaterialData: any) => {
    _setTypeArrayValue(MaterialData.shaderIndices, materialIndex, shader.index);
}

export var getColor = (materialIndex: number, MaterialData: any) => {
    var color = Color.create(),
        colors = MaterialData.colors,
        size = getColorDataSize(),
        index = materialIndex * size;

    color.r = colors[index];
    color.g = colors[index + 1];
    color.b = colors[index + 2];

    return color;
}

export var getColorArr3 = getColorArr3Utils;

export var setColor = (materialIndex: number, color: Color, MaterialData: any) => {
    var r = color.r,
        g = color.g,
        b = color.b,
        colors = MaterialData.colors,
        size = getColorDataSize(),
        index = materialIndex * size;

    _setTypeArrayValue(colors, index, r);
    _setTypeArrayValue(colors, index + 1, g);
    _setTypeArrayValue(colors, index + 2, b);
}

export var getOpacity = getOpacityUtils;

export var setOpacity = requireCheckFunc((materialIndex: number, opacity: number, MaterialData: any) => {
    it("opacity should be number", () => {
        expect(opacity).be.a("number");
    });
    it("opacity should <= 1 && >= 0", () => {
        expect(opacity).lte(1);
        expect(opacity).gte(0);
    });
}, (materialIndex: number, opacity: number, MaterialData: any) => {
    var size = getOpacityDataSize(),
        index = materialIndex * size;

    _setTypeArrayValue(MaterialData.opacities, index, opacity);
})

export var getAlphaTest = getAlphaTestUtils;

export var setAlphaTest = requireCheckFunc((materialIndex: number, alphaTest: number, MaterialData: any) => {
    it("alphaTest should be number", () => {
        expect(alphaTest).be.a("number");
    });
    // it("alphaTest should <= 1 && >= 0", () => {
    //     expect(alphaTest).lte(1);
    //     expect(alphaTest).gte(0);
    // });
}, (materialIndex: number, alphaTest: number, MaterialData: any) => {
    var size = getAlphaTestDataSize(),
        index = materialIndex * size;

    _setTypeArrayValue(MaterialData.alphaTests, index, alphaTest);
})

export var addComponent = (component: Material, gameObject: GameObject) => {
    addComponentToGameObjectMap(MaterialData.gameObjectMap, component.index, gameObject);
}

export var disposeComponent = ensureFunc((returnVal, component: Material) => {
    checkIndexShouldEqualCount(MaterialData);
}, requireCheckFunc((component: Material) => {
    _checkDisposeComponentWorker(component);
}, (component: Material) => {
    var sourceIndex = component.index,
        lastComponentIndex: number = null,
        colorDataSize = getColorDataSize(),
        opacityDataSize = getOpacityDataSize(),
        alphaTestDataSize = getAlphaTestDataSize();

    MaterialData.count -= 1;
    MaterialData.index -= 1;

    lastComponentIndex = MaterialData.count;

    deleteBySwapAndNotReset(sourceIndex, lastComponentIndex, MaterialData.shaderIndices);

    //todo fix!
    deleteBySwapAndReset(sourceIndex * colorDataSize, lastComponentIndex * colorDataSize, MaterialData.colors, colorDataSize, MaterialData.defaultColorArr);

    deleteOneItemBySwapAndReset(sourceIndex * opacityDataSize, lastComponentIndex * opacityDataSize, MaterialData.opacities, MaterialData.defaultOpacity);
    deleteOneItemBySwapAndReset(sourceIndex * alphaTestDataSize, lastComponentIndex * alphaTestDataSize, MaterialData.alphaTests, MaterialData.defaultAlphaTest);

    deleteBySwap(sourceIndex, lastComponentIndex, MaterialData.gameObjectMap);

    deleteComponentBySwapArray(sourceIndex, lastComponentIndex, MaterialData.materialMap);

    //not dispose shader(for reuse shader)(if dipose shader, should change render worker)
}))

var _checkDisposeComponentWorker = null;

if (isSupportRenderWorkerAndSharedArrayBuffer()) {
    _checkDisposeComponentWorker = (component: Material) => {
        it("should not dispose the material which is inited in the same frame", () => {
            expect(MaterialData.workerInitList.indexOf(component.index)).equal(-1);
        });
    }
}
else {
    _checkDisposeComponentWorker = (component: Material) => { };
}

export var getGameObject = (index: number, Data: any) => {
    return getComponentGameObject(Data.gameObjectMap, index);
}

var _setTypeArrayValue = requireCheckFunc((typeArr: Float32Array | Uint32Array, index: number, value: number) => {
    it("should not exceed type arr's length", () => {
        expect(index).lte(typeArr.length - 1);
    });
}, (typeArr: Float32Array, index: number, value: number) => {
    typeArr[index] = value;
})

export var isTestAlpha = isTestAlphaUtils;

export var initData = (MaterialData: any) => {
    // MaterialData.shaderMap = createMap();
    // MaterialData.materialClassNameMap = createMap();
    // MaterialData.colorMap = createMap();
    // MaterialData.opacityMap = createMap();
    // MaterialData.alphaTestMap = createMap();

    MaterialData.materialMap = [];

    MaterialData.gameObjectMap = [];

    MaterialData.index = 0;
    MaterialData.count = 0;

    MaterialData.workerInitList = [];

    MaterialData.defaultColorArr = _createDefaultColor().toVector3().toArray();
    MaterialData.defaultOpacity = 1;
    MaterialData.defaultAlphaTest = -1;

    _initBufferData(MaterialData);

    _initTable(MaterialData);
}

var _initBufferData = (MaterialData: any) => {
    var buffer: any = null,
        count = DataBufferConfig.materialDataBufferCount,
        size = Uint32Array.BYTES_PER_ELEMENT + Float32Array.BYTES_PER_ELEMENT * (getColorDataSize() + getOpacityDataSize() + getAlphaTestDataSize())

    buffer = createSharedArrayBufferOrArrayBuffer(count * size);

    createTypeArrays(buffer, count, MaterialData);

    MaterialData.buffer = buffer;

    _addDefaultTypeArrData(count, MaterialData);
}

var _addDefaultTypeArrData = (count: number, MaterialData: any) => {
    var color = _createDefaultColor(),
        opacity = MaterialData.defaultOpacity,
        alphaTest = MaterialData.defaultAlphaTest;

    for (let i = 0; i < count; i++) {
        setColor(i, color, MaterialData);
        setOpacity(i, opacity, MaterialData);
        setAlphaTest(i, alphaTest, MaterialData);
    }
}

var _initTable = (MaterialData: any) => {
    MaterialData.shaderIndexTable = {
        "BasicMaterial": 0
    }

    MaterialData.materialClassNameTable = {
        0: "BasicMaterial"
    }
}

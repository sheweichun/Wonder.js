import { getRenderList } from "../../component/renderer/MeshRendererSystem";
import { MeshRendererData } from "../../component/renderer/MeshRendererData";
import { compose } from "../../utils/functionalUtils";
import { createRenderCommandBufferData } from "../command_buffer/RenderCommandBufferSystem";
import { sendDrawData } from "../worker/logic_file/draw/SendDrawRenderCommandBufferDataSystem";
import { init as initMaterial } from "../../component/material/MaterialSystem";
import { MaterialData } from "../../component/material/MaterialData";
import { GameObjectData } from "../../core/entityObject/gameObject/GameObjectData";
import { GeometryData } from "../../component/geometry/GeometryData";
import { ArrayBufferData } from "../buffer/ArrayBufferData";
import { IndexBufferData } from "../buffer/IndexBufferData";
import { render_config } from "../data/render_config";
import { DeviceManagerData } from "../device/DeviceManagerData";
import { ThreeDTransformData } from "../../component/transform/ThreeDTransformData";
import { SceneData } from "../../core/entityObject/scene/SceneData";
import { CameraControllerData } from "../../component/camera/CameraControllerData";
import { CameraData } from "../../component/camera/CameraData";
import { EWorkerOperateType } from "../worker/both_file/EWorkerOperateType";
import { RenderCommandBufferData } from "../command_buffer/RenderCommandBufferData";
import { ERenderWorkerState } from "../worker/both_file/ERenderWorkerState";
import { SendDrawRenderCommandBufferData } from "../worker/logic_file/draw/SendDrawRenderCommandBufferData";
import { isSupportRenderWorkerAndSharedArrayBuffer } from "../../device/WorkerDetectSystem";
import { clear, draw } from "../draw/DrawRenderCommandBufferSystem";
import { DrawRenderCommandBufferData } from "../draw/DrawRenderCommandBufferData";
import { ProgramData } from "../shader/program/ProgramData";
import { LocationData } from "../shader/location/LocationData";
import { GLSLSenderData } from "../shader/glslSender/GLSLSenderData";
import { buildDrawDataMap } from "../utils/draw/drawRenderCommandBufferUtils";
import { DataBufferConfig } from "../../config/DataBufferConfig";
import { getRenderWorker } from "../worker/logic_file/worker_instance/WorkerInstanceSystem";
import { WorkerInstanceData } from "../worker/logic_file/worker_instance/WorkerInstanceData";
export var init = null;
export var render = null;
if (isSupportRenderWorkerAndSharedArrayBuffer()) {
    init = function (state) {
        var renderWorker = getRenderWorker(WorkerInstanceData);
        renderWorker.postMessage({
            operateType: EWorkerOperateType.INIT_MATERIAL_GEOMETRY,
            materialData: {
                buffer: MaterialData.buffer,
                materialCount: MaterialData.count,
                materialClassNameTable: MaterialData.materialClassNameTable,
                shaderIndexTable: MaterialData.shaderIndexTable
            },
            geometryData: {
                buffer: GeometryData.buffer,
                indexType: GeometryData.indexType,
                indexTypeSize: GeometryData.indexTypeSize,
                verticesInfoList: GeometryData.verticesInfoList,
                indicesInfoList: GeometryData.indicesInfoList
            }
        });
        renderWorker.onmessage = function (e) {
            var data = e.data, state = data.state;
            SendDrawRenderCommandBufferData.state = state;
        };
        return state;
    };
    render = function (state) {
        return compose(sendDrawData(WorkerInstanceData, MaterialData, GeometryData), createRenderCommandBufferData(state, GameObjectData, ThreeDTransformData, CameraControllerData, CameraData, MaterialData, GeometryData, SceneData, RenderCommandBufferData), getRenderList(state))(MeshRendererData);
    };
    var _initData = function (SendDrawRenderCommandBufferData) {
        SendDrawRenderCommandBufferData.state = ERenderWorkerState.DEFAULT;
    };
    _initData(SendDrawRenderCommandBufferData);
}
else {
    init = function (state) {
        initMaterial(state, MaterialData);
    };
    render = function (state) {
        return compose(draw(null, DataBufferConfig, buildDrawDataMap(DeviceManagerData, MaterialData, ProgramData, LocationData, GLSLSenderData, GeometryData, ArrayBufferData, IndexBufferData, DrawRenderCommandBufferData)), clear(null, render_config, DeviceManagerData), createRenderCommandBufferData(state, GameObjectData, ThreeDTransformData, CameraControllerData, CameraData, MaterialData, GeometryData, SceneData, RenderCommandBufferData), getRenderList(state))(MeshRendererData);
    };
}
//# sourceMappingURL=WebGLRenderSystem.js.map
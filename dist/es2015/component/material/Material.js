var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { registerClass } from "../../definition/typescript/decorator/registerClass";
import { getAlphaTest, getColor, getGameObject, getOpacity, initMaterial as initMaterialSystem, setAlphaTest, setColor, setOpacity } from "./MaterialSystem";
import { MaterialData } from "./MaterialData";
import { Component } from "../Component";
import { getState } from "../../core/DirectorSystem";
import { DirectorData } from "../../core/DirectorData";
import { requireCheckFunc } from "../../definition/typescript/decorator/contract";
import { checkComponentShouldAlive, isComponentIndexNotRemoved } from "../ComponentSystem";
var Material = (function (_super) {
    __extends(Material, _super);
    function Material() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Material;
}(Component));
Material = __decorate([
    registerClass("Material")
], Material);
export { Material };
export var getMaterialColor = requireCheckFunc(function (material) {
    _checkShouldAlive(material, MaterialData);
}, function (material) {
    return getColor(material.index, MaterialData);
});
export var setMaterialColor = requireCheckFunc(function (material) {
    _checkShouldAlive(material, MaterialData);
}, function (material, color) {
    setColor(material.index, color, MaterialData);
});
export var getMaterialOpacity = requireCheckFunc(function (material) {
    _checkShouldAlive(material, MaterialData);
}, function (material) {
    return getOpacity(material.index, MaterialData);
});
export var setMaterialOpacity = requireCheckFunc(function (material) {
    _checkShouldAlive(material, MaterialData);
}, function (material, opacity) {
    setOpacity(material.index, opacity, MaterialData);
});
export var getMaterialAlphaTest = requireCheckFunc(function (material) {
    _checkShouldAlive(material, MaterialData);
}, function (material) {
    return getAlphaTest(material.index, MaterialData);
});
export var setMaterialAlphaTest = requireCheckFunc(function (material) {
    _checkShouldAlive(material, MaterialData);
}, function (material, alphaTest) {
    setAlphaTest(material.index, alphaTest, MaterialData);
});
export var getMaterialGameObject = requireCheckFunc(function (material) {
    _checkShouldAlive(material, MaterialData);
}, function (component) {
    return getGameObject(component.index, MaterialData);
});
export var initMaterial = function (material) {
    initMaterialSystem(material.index, getState(DirectorData));
};
var _checkShouldAlive = function (material, MaterialData) {
    checkComponentShouldAlive(material, MaterialData, function (material, MaterialData) {
        return isComponentIndexNotRemoved(material);
    });
};
//# sourceMappingURL=Material.js.map
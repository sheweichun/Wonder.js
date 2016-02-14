var rendererTool = {
    triggerMaterialAddShaderLib: function(material){
        material.init();

        wd.EventManager.trigger(wd.CustomEvent.create(wd.EEngineEvent.AFTER_GAMEOBJECT_INIT));
    },
    convertSource: function(source){
        return source.split("\n").join("")
    },
};

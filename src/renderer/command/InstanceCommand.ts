module wd{
    export class InstanceCommand extends QuadCommand {
        public static create(){
            var obj = new this();

            return obj;
        }

        public instanceList:wdCb.Collection<GameObject> = null;
        public instanceBuffer:InstanceBuffer = null;
        public glslData:EInstanceGLSLData = EInstanceGLSLData.MODELMATRIX;

        private _instanceDrawerProxy:InstanceDrawerProxy = InstanceDrawerProxy.create();

        @ensure(function(hasInstance:boolean){
            assert(JudgeUtils.isBoolean(hasInstance), Log.info.FUNC_SHOULD("return boolean value"));

            if(hasInstance){
                assert(GPUDetector.getInstance().extensionInstancedArrays !== null, Log.info.FUNC_SHOULD("hardware", "support instance"));

                assert(!!this.instanceBuffer, Log.info.FUNC_MUST_DEFINE("instanceBuffer"))
            }
        })
        public hasInstance(){
            return !!this.instanceList && this.instanceList.getCount() > 0;
        }

        protected draw(material:Material) {
            this.setEffects(material);

            if (!this.hasInstance()) {
                return;
            }

            this._instanceDrawerProxy.glslData = this.glslData;

            this._instanceDrawerProxy.draw(this.instanceList, this.instanceBuffer, this.program, this.buffers, this.drawMode);
        }
    }
}
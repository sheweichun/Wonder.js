module wd {
    export class BoxCollider extends Collider {
        public static create() {
            var obj = new this();

            return obj;
        }

        public boundingRegion:BoxBoundingRegion;

        @cloneAttributeAsCloneable()
        public center:Vector3 = Vector3.create(0, 0, 0);
        @cloneAttributeAsCloneable()
        public halfExtents:Vector3 = null;

        protected type:string = <any>EColliderType.BOX;

        public createBoundingRegion(){
            return BoxBoundingRegion.create(this.entityObject);
        }

        public buildBoundingRegion(){
            this.boundingRegion.build(this.center, this.halfExtents);
        }
    }
}


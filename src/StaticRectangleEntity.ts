import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export default class StaticRectangleEntity {
    private _x: number;
    private _z: number;
    id: string;
    private _width: number;
    private _height: number;

    private _scene: Scene;
    private _meshesWithShadow: Map<string, AbstractMesh | Mesh>;

    private _staticRectangleBody?: Mesh;
    private _staticRectangleMaterial?: StandardMaterial;

    constructor(
        serverStaticRectangleEntity: any,
        scene: Scene,
        meshesWithShadow: Map<string, AbstractMesh | Mesh>
    ) {
        this._x = serverStaticRectangleEntity.x;
        this._z = serverStaticRectangleEntity.z;
        this.id = serverStaticRectangleEntity.id;
        this._width = serverStaticRectangleEntity.collisionBody.width;
        this._height = serverStaticRectangleEntity.collisionBody.height;
        this._scene = scene;
        this._meshesWithShadow = meshesWithShadow;
    }

    drawEntity() {
        this._staticRectangleBody = MeshBuilder.CreateBox(
            "staticBody",
            {
                width: this._width,
                height: this._height,
                depth: this._height,
            },
            this._scene
        );
        this._staticRectangleMaterial = new StandardMaterial(
            "staticMaterial",
            this._scene
        );
        this._staticRectangleBody.material = this._staticRectangleMaterial;
        this._staticRectangleMaterial.diffuseColor =
            Color3.FromHexString("#000000");
        this._staticRectangleMaterial.specularColor =
            Color3.FromHexString("#FFFFFF");
        this._staticRectangleMaterial.emissiveColor =
            Color3.FromHexString("#FFFF00");

        this._staticRectangleBody.position.x = this._x;
        this._staticRectangleBody.position.y = this._height * 0.5;
        this._staticRectangleBody.position.z = this._z;

        this._staticRectangleBody.freezeWorldMatrix();
        this._staticRectangleBody.material.freeze();
        this._staticRectangleBody.doNotSyncBoundingInfo = true;

        this._meshesWithShadow.set(this.id, this._staticRectangleBody);
    }

    deleteMeshes() {
        if (typeof this._staticRectangleBody !== "undefined") {
            this._staticRectangleBody.dispose();
            this._meshesWithShadow.delete(this.id);
        }
    }
}

import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

export default class StaticRectangleEntity {
    private _x: number;
    private _z: number;
    id: string;
    private _width: number;
    private _height: number;

    private _currentScene: Scene;
    private _currentShadowGenerator: ShadowGenerator;

    private _staticRectangleBody?: Mesh;
    private _staticRectangleMaterial?: StandardMaterial;

    constructor(
        serverStaticRectangleEntity: any,
        scene: Scene,
        shadowGenerator: ShadowGenerator
    ) {
        this._x = serverStaticRectangleEntity.x;
        this._z = serverStaticRectangleEntity.z;
        this.id = serverStaticRectangleEntity.id;
        this._width = serverStaticRectangleEntity.collisionBody.width;
        this._height = serverStaticRectangleEntity.collisionBody.height;
        this._currentScene = scene;
        this._currentShadowGenerator = shadowGenerator;
    }

    drawEntity() {
        this._staticRectangleBody = MeshBuilder.CreateBox(
            "staticBody",
            {
                width: this._width,
                height: this._height,
                depth: this._height,
            },
            this._currentScene
        );
        this._staticRectangleMaterial = new StandardMaterial(
            "staticMaterial",
            this._currentScene
        );
        this._staticRectangleBody.material = this._staticRectangleMaterial;
        this._staticRectangleMaterial.diffuseColor =
            Color3.FromHexString("#FFFF00");

        this._staticRectangleBody.position.x = this._x;
        this._staticRectangleBody.position.y = this._height * 0.5;
        this._staticRectangleBody.position.z = this._z;

        this._staticRectangleBody.freezeWorldMatrix();
        this._staticRectangleBody.material.freeze();
        this._staticRectangleBody.doNotSyncBoundingInfo = true;

        this._currentShadowGenerator.addShadowCaster(
            this._staticRectangleBody,
            true
        );
    }

    deleteMeshes() {
        if (typeof this._staticRectangleBody !== "undefined") {
            this._staticRectangleBody.dispose();
        }
    }
}
